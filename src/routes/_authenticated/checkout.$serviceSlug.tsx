import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChevronLeft, Loader2, MessageCircle, Phone, Mail, CheckCircle2, Upload, X, FileText, ZoomIn } from "lucide-react";
import type { GatewayKey } from "@/components/dashboard/shared";
import { uploadOrderDocument, ACCEPT_MIME, MAX_FILE_BYTES, type DocType, clientValidateDocuments } from "@/lib/documents";

type Service = {
  id: string;
  slug: string;
  name_en: string;
  price_usd: number;
  state_fee_usd: number | null;
  description_en: string | null;
};

export const Route = createFileRoute("/_authenticated/checkout/$serviceSlug")({
  component: CheckoutPage,
});

const COUNTRIES = ["Morocco", "Algeria", "Tunisia", "Egypt", "France", "Spain", "Portugal", "United States", "United Kingdom", "Germany", "UAE", "Saudi Arabia", "Senegal", "Other"];
const US_STATES = ["Wyoming", "Delaware", "New Mexico", "Florida", "Texas", "Colorado", "Nevada", "Montana"];
const GATEWAYS: { key: GatewayKey; label: string }[] = [
  { key: "stripe", label: "Stripe" },
  { key: "shopify", label: "Shopify Payments" },
  { key: "wise", label: "Wise Business" },
  { key: "payoneer", label: "Payoneer" },
  { key: "paypal", label: "PayPal Business" },
  { key: "mercury", label: "Mercury Bank" },
  { key: "airwallex", label: "Airwallex" },
];

function CheckoutPage() {
  const { serviceSlug } = Route.useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const serviceQ = useQuery({
    queryKey: ["service-by-slug", serviceSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, slug, name_en, price_usd, state_fee_usd, description_en")
        .eq("slug", serviceSlug)
        .maybeSingle();
      if (error) throw error;
      return data as Service | null;
    },
  });

  // Form state
  const [full_name, setFullName] = useState(profile?.full_name ?? "");
  const [email] = useState(profile?.email ?? user?.email ?? "");
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [preferred_channel, setChannel] = useState<"whatsapp" | "phone" | "email">("whatsapp");
  const [preferred_time, setPreferredTime] = useState("");

  const [business_name, setBusinessName] = useState("");
  const [business_type, setBusinessType] = useState("LLC");
  const [us_state, setUsState] = useState("Wyoming");
  const [industry, setIndustry] = useState("");
  const [business_desc, setBusinessDesc] = useState("");

  const [dob, setDob] = useState("");
  const [addr_street, setStreet] = useState("");
  const [addr_city, setCity] = useState("");
  const [addr_state, setAddrState] = useState("");
  const [addr_postal, setPostal] = useState("");
  const [addr_country, setCountry] = useState(profile?.country ?? "Morocco");
  const [id_type, setIdType] = useState("passport");

  const [addons, setAddons] = useState({ us_phone: false, website: false });
  const [selectedGateways, setSelectedGateways] = useState<GatewayKey[]>(["stripe"]);

  const [pref_currency, setPrefCurrency] = useState<"USD" | "EUR" | "MAD">("USD");
  const [pref_method, setPrefMethod] = useState("card_link");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [docs, setDocs] = useState<Partial<Record<DocType, File>>>({});
  const [extraDocs, setExtraDocs] = useState<File[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const submitMut = useMutation({
    mutationFn: async () => {
      if (!user || !serviceQ.data) throw new Error("Missing user or service");

      // Server-side document validation (also enforced server-side during upload)
      const preCheck = await clientValidateDocuments({ docs, extraDocs, idType: id_type });
      if (!preCheck.ok) {
        throw new Error(preCheck.errors.join("\n"));
      }

      // Update profile with extra fields
      await supabase
        .from("profiles")
        .update({
          full_name,
          phone,
          whatsapp,
          whatsapp_number: whatsapp,
          country: addr_country,
          address_country: addr_country,
          address_street: addr_street,
          address_city: addr_city,
          address_state: addr_state,
          address_postal: addr_postal,
          date_of_birth: dob || null,
          id_type,
        })
        .eq("id", user.id);

      const intake = {
        contact: { full_name, whatsapp, phone, email, preferred_channel, preferred_time },
        addons: { ...addons, gateways: selectedGateways },
        services: {},
        payment_preference: { currency: pref_currency, method: pref_method },
        notes,
      };

      const total = Number(serviceQ.data.price_usd) + Number(serviceQ.data.state_fee_usd ?? 0);
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          client_id: user.id,
          service_id: serviceQ.data.id,
          business_name,
          business_type,
          us_state,
          industry,
          business_desc,
          status: "pending_payment",
          payment_status: "unpaid",
          amount_usd: serviceQ.data.price_usd,
          state_fee_usd: serviceQ.data.state_fee_usd ?? 0,
          total_usd: total,
          currency_paid: pref_currency,
          preferred_channel,
          preferred_contact_time: preferred_time,
          intake,
        })
        .select("id, order_number")
        .single();
      if (error) throw error;

      await supabase.from("order_timeline").insert({
        order_id: order.id,
        status: "received",
        note_en: "Order received — our team will contact you shortly with payment details.",
        note_fr: "Commande reçue — notre équipe vous contactera sous peu avec les détails de paiement.",
        note_ar: "تم استلام الطلب — سيتواصل معك فريقنا قريبًا بتفاصيل الدفع.",
        created_by: user.id,
      });

      // Upload staged documents via server function with server-side validation
      const errs: string[] = [];
      let uploadedCount = 0;
      const queue: { type: DocType | string; file: File }[] = [
        ...Object.entries(docs).map(([type, file]) => ({ type: type as DocType, file: file as File })),
        ...extraDocs.map((file) => ({ type: "other" as const, file })),
      ];
      for (const item of queue) {
        try {
          const result = await uploadOrderDocument({
            orderId: order.id,
            userId: user.id,
            type: item.type,
            file: item.file,
            idType: id_type,
          });
          if (!result.success) {
            errs.push(`${item.file.name}: ${result.errors.join("; ")}`);
          } else {
            uploadedCount += 1;
          }
        } catch (e) {
          errs.push(`${item.file.name}: ${(e as Error).message ?? "upload failed"}`);
        }
      }
      if (uploadedCount > 0) {
        await supabase.from("order_timeline").insert({
          order_id: order.id,
          status: "documents_uploaded",
          note_en: `${uploadedCount} document${uploadedCount === 1 ? "" : "s"} uploaded — pending review.`,
          note_fr: `${uploadedCount} document${uploadedCount === 1 ? "" : "s"} envoyé(s) — en attente de revue.`,
          note_ar: `تم رفع ${uploadedCount} وثيقة — قيد المراجعة.`,
          created_by: user.id,
        });
      }
      if (errs.length) setUploadErrors(errs);

      return order;
    },
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  if (serviceQ.isLoading) {
    return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }
  if (!serviceQ.data) {
    return (
      <div className="mx-auto max-w-2xl p-10 text-center">
        <p className="text-lg font-semibold">Service not found.</p>
        <Link to="/services" className="mt-3 inline-block text-primary">Browse services</Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold">Request received</h1>
        <p className="mt-3 text-text-2">
          We'll reach out within 24 hours via{" "}
          <span className="font-semibold text-foreground">
            {preferred_channel === "whatsapp" ? "WhatsApp" : preferred_channel === "phone" ? "phone call" : "email"}
          </span>{" "}
          to confirm your order and send payment instructions and our bank details.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/dashboard"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const s = serviceQ.data;
  const total = Number(s.price_usd) + Number(s.state_fee_usd ?? 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/services" className="inline-flex items-center gap-1 text-sm text-text-2 hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> Back to services
      </Link>

      <header className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Checkout</p>
          <h1 className="font-serif-display text-3xl md:text-4xl text-foreground">{s.name_en}</h1>
          <p className="mt-2 max-w-xl text-sm text-text-2">{s.description_en}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-right shadow-soft">
          <div className="text-xs uppercase tracking-wider text-text-3">Total</div>
          <div className="text-3xl font-extrabold text-primary">${total.toLocaleString()}</div>
          <div className="text-[11px] text-text-3">Service ${Number(s.price_usd).toLocaleString()} + state fee ${Number(s.state_fee_usd ?? 0).toLocaleString()}</div>
        </div>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!consent) return;
          submitMut.mutate();
        }}
        className="grid gap-6"
      >
        <Section title="Contact" subtitle="How should we reach you with payment instructions?">
          <Field label="Full name" required><Input value={full_name} onChange={(e) => setFullName(e.target.value)} required /></Field>
          <Field label="Email"><Input value={email} disabled /></Field>
          <Field label="WhatsApp (with country code)" required>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+212600000000" required />
          </Field>
          <Field label="Phone (optional)"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+212..." /></Field>
          <Field label="Preferred contact channel">
            <div className="flex gap-2">
              {([
                { v: "whatsapp", label: "WhatsApp", icon: MessageCircle },
                { v: "phone", label: "Phone call", icon: Phone },
                { v: "email", label: "Email", icon: Mail },
              ] as const).map((o) => (
                <button
                  type="button"
                  key={o.v}
                  onClick={() => setChannel(o.v)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${
                    preferred_channel === o.v
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-text-2 hover:bg-accent"
                  }`}
                >
                  <o.icon className="h-4 w-4" /> {o.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Best time to reach you (optional)"><Input value={preferred_time} onChange={(e) => setPreferredTime(e.target.value)} placeholder="e.g. weekdays 10am–6pm GMT+1" /></Field>
        </Section>

        <Section title="Business" subtitle="The U.S. entity we'll form for you.">
          <Field label="Business name" required><Input value={business_name} onChange={(e) => setBusinessName(e.target.value)} placeholder="My Brand LLC" required /></Field>
          <Field label="Entity type">
            <Select value={business_type} onChange={(e) => setBusinessType(e.target.value)}>
              <option value="LLC">LLC</option>
              <option value="C-Corp">C-Corp</option>
            </Select>
          </Field>
          <Field label="U.S. state of formation">
            <Select value={us_state} onChange={(e) => setUsState(e.target.value)}>
              {US_STATES.map((st) => <option key={st}>{st}</option>)}
            </Select>
          </Field>
          <Field label="Industry" required><Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="E-commerce, SaaS, Consulting…" required /></Field>
          <Field label="Short business description" wide>
            <Textarea rows={3} value={business_desc} onChange={(e) => setBusinessDesc(e.target.value)} placeholder="What do you sell and to whom?" />
          </Field>
        </Section>

        <Section title="Owner / KYC" subtitle="Required by the IRS and U.S. banks.">
          <Field label="Date of birth" required><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required /></Field>
          <Field label="ID type">
            <Select value={id_type} onChange={(e) => setIdType(e.target.value)}>
              <option value="passport">Passport</option>
              <option value="national_id">National ID</option>
            </Select>
          </Field>
          <Field label="Street address" wide required><Input value={addr_street} onChange={(e) => setStreet(e.target.value)} required /></Field>
          <Field label="City" required><Input value={addr_city} onChange={(e) => setCity(e.target.value)} required /></Field>
          <Field label="State / region"><Input value={addr_state} onChange={(e) => setAddrState(e.target.value)} /></Field>
          <Field label="Postal code"><Input value={addr_postal} onChange={(e) => setPostal(e.target.value)} /></Field>
          <Field label="Country" required>
            <Select value={addr_country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
        </Section>

        <Section title="Add-ons" subtitle="We can bundle these — no extra checkout step.">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-accent">
            <input type="checkbox" checked={addons.us_phone} onChange={(e) => setAddons({ ...addons, us_phone: e.target.checked })} className="mt-1 h-4 w-4 accent-primary" />
            <div><div className="font-semibold">U.S. phone number</div><div className="text-xs text-text-3">Real U.S. number for banks, Stripe, gateways.</div></div>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-accent">
            <input type="checkbox" checked={addons.website} onChange={(e) => setAddons({ ...addons, website: e.target.checked })} className="mt-1 h-4 w-4 accent-primary" />
            <div><div className="font-semibold">Website + domain</div><div className="text-xs text-text-3">Professional site + custom domain + email.</div></div>
          </label>
          <div className="col-span-full">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-3">Payment gateways to activate</div>
            <div className="flex flex-wrap gap-2">
              {GATEWAYS.map((g) => {
                const on = selectedGateways.includes(g.key);
                return (
                  <button
                    type="button"
                    key={g.key}
                    onClick={() =>
                      setSelectedGateways((s) => (on ? s.filter((k) => k !== g.key) : [...s, g.key]))
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      on ? "border-primary bg-primary/10 text-primary" : "border-border text-text-2 hover:bg-accent"
                    }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        <Section title="Payment preference" subtitle="Informational — we'll send a payment link or bank info that matches.">
          <Field label="Preferred currency">
            <Select value={pref_currency} onChange={(e) => setPrefCurrency(e.target.value as "USD" | "EUR" | "MAD")}>
              <option value="USD">USD</option><option value="EUR">EUR</option><option value="MAD">MAD</option>
            </Select>
          </Field>
          <Field label="Preferred method">
            <Select value={pref_method} onChange={(e) => setPrefMethod(e.target.value)}>
              <option value="card_link">Card / Stripe link</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="wise">Wise transfer</option>
              <option value="crypto">USDT / crypto</option>
            </Select>
          </Field>
          <Field label="Anything we should know?" wide>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special requests, deadlines, prior LLC, etc." />
          </Field>
        </Section>

        <Section title="Identity & documents" subtitle="Upload now or later from your dashboard. Max 10 MB per file — PDF or image.">
          <FileDrop
            label="ID document — front"
            required
            file={docs.id_front}
            onChange={(f) => setDocs((d) => ({ ...d, id_front: f ?? undefined }))}
            onPreview={(f) => setPreviewFile(f)}
          />
          <FileDrop
            label="ID document — back"
            required={id_type !== "passport"}
            helper={id_type === "passport" ? "Optional for passports" : "Required for national ID"}
            file={docs.id_back}
            onChange={(f) => setDocs((d) => ({ ...d, id_back: f ?? undefined }))}
            onPreview={(f) => setPreviewFile(f)}
          />
          <FileDrop
            label="Proof of address"
            helper="Utility bill or bank statement (< 3 months)"
            file={docs.proof_address}
            onChange={(f) => setDocs((d) => ({ ...d, proof_address: f ?? undefined }))}
            onPreview={(f) => setPreviewFile(f)}
          />
          <FileDrop
            label="Business proof (optional)"
            helper="Existing registration, website screenshot, contracts"
            file={docs.business_proof}
            onChange={(f) => setDocs((d) => ({ ...d, business_proof: f ?? undefined }))}
            onPreview={(f) => setPreviewFile(f)}
          />
          <div className="md:col-span-2">
            <div className="mb-2 text-xs font-semibold text-text-2">Additional supporting documents</div>
            <MultiFileDrop files={extraDocs} onChange={setExtraDocs} onPreview={(f) => setPreviewFile(f)} />
          </div>
        </Section>



        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
            <span className="text-sm text-text-2">
              I understand LaunchBridge will review my request and contact me via my preferred channel to send a payment link and bank details. No charge is made now.
            </span>
          </label>
          {submitMut.isError && (
            <p className="mt-3 text-sm text-rose-600">Could not submit. Please try again or contact support.</p>
          )}
          {uploadErrors.length > 0 && (
            <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
              <div className="font-semibold">Your order was submitted, but some documents failed to upload:</div>
              <ul className="mt-1 list-disc pl-5">{uploadErrors.map((m, i) => <li key={i}>{m}</li>)}</ul>
              <div className="mt-1">You can re-upload them from the Documents page on your dashboard.</div>
            </div>
          )}
          <button
            type="submit"
            disabled={!consent || submitMut.isPending}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50 md:w-auto"
          >
            {submitMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit request — we'll contact you with payment details
          </button>
        </div>
      </form>
      <span className="hidden">{navigate.length}</span>
      {previewFile && <DocViewerModal file={previewFile} onClose={() => setPreviewFile(null)} />}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <header className="mb-4">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-text-3">{subtitle}</p>}
      </header>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}
function Field({ label, children, wide, required }: { label: string; children: React.ReactNode; wide?: boolean; required?: boolean }) {
  return (
    <label className={`flex flex-col gap-1.5 ${wide ? "md:col-span-2" : ""}`}>
      <span className="text-xs font-semibold text-text-2">{label}{required && <span className="text-rose-500"> *</span>}</span>
      {children}
    </label>
  );
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary disabled:opacity-60" />;
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />;
}

function FilePreview({ file, className, onClick }: { file: File; className?: string; onClick?: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";

  const content = (() => {
    if (!url) return <FileText className="h-4 w-4 shrink-0 text-primary" />;
    if (isImage) {
      return (
        <img
          src={url}
          alt={file.name}
          className={`h-10 w-10 rounded-md object-cover ${className ?? ""}`}
        />
      );
    }
    if (isPdf) {
      return (
        <div className={`relative h-10 w-10 rounded-md border border-border bg-white overflow-hidden ${className ?? ""}`}>
          <embed src={url} type="application/pdf" className="h-full w-full pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/5">
            <FileText className="h-4 w-4 text-foreground" />
          </div>
        </div>
      );
    }
    return <FileText className="h-4 w-4 shrink-0 text-primary" />;
  })();

  if (!onClick) return <>{content}</>;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative inline-flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md"
      title="Click to preview"
    >
      {content}
      {(isImage || isPdf) && (
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
          <ZoomIn className="h-4 w-4 text-white" />
        </div>
      )}
    </button>
  );
}

function FileDrop({ label, helper, required, file, onChange, onPreview }: { label: string; helper?: string; required?: boolean; file?: File; onChange: (f: File | null) => void; onPreview?: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const pick = (f: File | null) => {
    if (f && f.size > MAX_FILE_BYTES) {
      alert(`${f.name} is larger than 10 MB.`);
      return;
    }
    onChange(f);
  };
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-xs font-semibold text-text-2">{label}{required && <span className="text-rose-500"> *</span>}</div>
      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm">
          <div className="flex min-w-0 items-center gap-3">
            <FilePreview file={file} onClick={onPreview ? () => onPreview(file) : undefined} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{file.name}</span>
              <span className="text-xs text-text-3">{(file.size / 1024).toFixed(0)} KB</span>
            </div>
          </div>
          <button type="button" onClick={() => onChange(null)} className="rounded-full p-1 text-text-3 hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0] ?? null); }}
          className={`flex items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-4 text-xs font-medium transition ${drag ? "border-primary bg-primary/5 text-primary" : "border-border text-text-2 hover:border-primary/60 hover:text-primary"}`}
        >
          <Upload className="h-4 w-4" /> Click or drop file
        </button>
      )}
      {helper && <span className="text-[11px] text-text-3">{helper}</span>}
      <input ref={ref} type="file" accept={ACCEPT_MIME} className="hidden" onChange={(e) => pick(e.target.files?.[0] ?? null)} />
    </div>
  );
}

function MultiFileDrop({ files, onChange, onPreview }: { files: File[]; onChange: (files: File[]) => void; onPreview?: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const add = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (f.size > MAX_FILE_BYTES) { alert(`${f.name} is larger than 10 MB.`); continue; }
      next.push(f);
    }
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files); }}
        className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-4 text-xs font-medium text-text-2 hover:border-primary/60 hover:text-primary"
      >
        <Upload className="h-4 w-4" /> Add more files
      </button>
      <input ref={ref} type="file" accept={ACCEPT_MIME} multiple className="hidden" onChange={(e) => { add(e.target.files); if (ref.current) ref.current.value = ""; }} />
      {files.length > 0 && (
        <ul className="grid gap-1.5">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm">
              <div className="flex min-w-0 items-center gap-3">
                <FilePreview file={f} onClick={onPreview ? () => onPreview(f) : undefined} />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{f.name}</span>
                  <span className="text-xs text-text-3">{(f.size / 1024).toFixed(0)} KB</span>
                </div>
              </div>
              <button type="button" onClick={() => onChange(files.filter((_, j) => j !== i))} className="rounded-full p-1 text-text-3 hover:bg-accent hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DocViewerModal({ file, onClose }: { file: File; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative max-h-[92vh] w-full max-w-5xl rounded-xl bg-background p-4 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          title="Close (Esc)"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex h-full max-h-[85vh] items-center justify-center overflow-auto rounded-lg bg-black/5">
          {!url && (
            <div className="grid h-40 place-items-center text-text-3">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {url && isImage && (
            <img
              src={url}
              alt={file.name}
              className="max-h-[85vh] max-w-full rounded-md object-contain shadow-lg"
            />
          )}
          {url && isPdf && (
            <embed
              src={url}
              type="application/pdf"
              className="h-[85vh] w-full rounded-md bg-white"
            />
          )}
          {url && !isImage && !isPdf && (
            <div className="flex flex-col items-center gap-3 py-20 text-text-3">
              <FileText className="h-12 w-12" />
              <p>Preview not available for this file type.</p>
              <p className="text-sm">{file.name}</p>
            </div>
          )}
        </div>
        <div className="mt-2 text-center text-xs text-text-3">{file.name} · {(file.size / 1024).toFixed(0)} KB</div>
      </div>
    </div>
  );
}
