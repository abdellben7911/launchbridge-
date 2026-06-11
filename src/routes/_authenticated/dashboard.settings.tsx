import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Upload, Sun, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/i18n/LanguageProvider";
import { useTheme } from "@/theme/ThemeProvider";
import { COUNTRIES, CURRENCIES, LANGUAGES } from "@/lib/saas-constants";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: Settings,
});

const PHONE_RE = /^\+[1-9]\d{6,14}$/;

const PersonalSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  date_of_birth: z
    .string()
    .max(10)
    .optional()
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Invalid date"),
  phone: z.string().regex(PHONE_RE, "Enter a valid phone with country code"),
  whatsapp: z
    .string()
    .optional()
    .refine((v) => !v || PHONE_RE.test(v), "Invalid WhatsApp number"),
});

const AddressSchema = z.object({
  address_street: z.string().trim().max(200).optional(),
  address_city: z.string().trim().max(100).optional(),
  address_state: z.string().trim().max(100).optional(),
  address_postal: z.string().trim().max(20).optional(),
  country: z.string().trim().max(60).optional(),
});

const PrefsSchema = z.object({
  language: z.enum(["en", "fr", "ar"]),
  currency: z.enum(["USD", "EUR", "MAD", "SAR", "AED", "GBP"]),
});

type ExtendedProfile = {
  full_name: string | null;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  country: string | null;
  flag_emoji: string | null;
  currency: string | null;
  language: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_postal: string | null;
};

function Settings() {
  const { user, refresh } = useAuth();
  const { t, lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ExtendedProfile | null>(null);

  // Personal
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [dial, setDial] = useState("+212");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [whatsappSame, setWhatsappSame] = useState(true);
  const [whatsappDial, setWhatsappDial] = useState("+212");
  const [whatsappLocal, setWhatsappLocal] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savingPersonal, setSavingPersonal] = useState(false);

  // Address
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [postal, setPostal] = useState("");
  const [countryCode, setCountryCode] = useState("ma");
  const [savingAddress, setSavingAddress] = useState(false);

  // Preferences
  const [language, setLanguage] = useState<"en" | "fr" | "ar">("en");
  const [currency, setCurrency] = useState<string>("USD");
  const [savingPrefs, setSavingPrefs] = useState(false);

  const dialOptions = useMemo(() => COUNTRIES.filter((c) => c.dial !== "+"), []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      const p = data as ExtendedProfile | null;
      setProfile(p);
      if (p?.avatar_url) {
        // avatar_url stores the storage path (private bucket); resolve to a short-lived signed URL for display
        const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(p.avatar_url, 3600);
        setAvatarUrl(signed?.signedUrl ?? null);
      }
      if (p) {
        setFullName(p.full_name ?? "");
        setDob(p.date_of_birth ?? "");
        const { dial: d, local } = splitPhone(p.phone ?? "");
        setDial(d || "+212");
        setPhoneLocal(local);
        const { dial: wd, local: wl } = splitPhone(p.whatsapp ?? "");
        const sameAsPhone = !p.whatsapp || p.whatsapp === p.phone;
        setWhatsappSame(sameAsPhone);
        setWhatsappDial(wd || d || "+212");
        setWhatsappLocal(wl);
        setStreet(p.address_street ?? "");
        setCity(p.address_city ?? "");
        setStateRegion(p.address_state ?? "");
        setPostal(p.address_postal ?? "");
        const found = COUNTRIES.find((c) => c.name === p.country);
        if (found) setCountryCode(found.code);
        if (p.language === "en" || p.language === "fr" || p.language === "ar") setLanguage(p.language);
        if (p.currency) setCurrency(p.currency);
      }
      setLoading(false);
    })();
  }, [user]);

  const onAvatar = async (file: File) => {
    if (!user) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be under 4 MB");
      return;
    }
    setAvatarUploading(true);
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) {
      toast.error(upErr.message);
      setAvatarUploading(false);
      return;
    }
    const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
    const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", user.id);
    setAvatarUploading(false);
    if (dbErr) {
      toast.error(dbErr.message);
      return;
    }
    setProfile((p) => (p ? { ...p, avatar_url: path } : p));
    setAvatarUrl(signed?.signedUrl ?? null);
    toast.success("Avatar updated");
    refresh();
  };

  const savePersonal = async () => {
    if (!user) return;
    const phone = (dial + phoneLocal).replace(/[\s-]/g, "");
    const whatsapp = whatsappSame
      ? phone
      : (whatsappDial + whatsappLocal).replace(/[\s-]/g, "");
    const parsed = PersonalSchema.safeParse({
      full_name: fullName,
      date_of_birth: dob || undefined,
      phone,
      whatsapp,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setSavingPersonal(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.full_name,
        date_of_birth: parsed.data.date_of_birth || null,
        phone: parsed.data.phone,
        whatsapp: parsed.data.whatsapp || parsed.data.phone,
      })
      .eq("id", user.id);
    setSavingPersonal(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Personal info saved");
    refresh();
  };

  const saveAddress = async () => {
    if (!user) return;
    const parsed = AddressSchema.safeParse({
      address_street: street || undefined,
      address_city: city || undefined,
      address_state: stateRegion || undefined,
      address_postal: postal || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your address");
      return;
    }
    const country = COUNTRIES.find((c) => c.code === countryCode);
    setSavingAddress(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        address_street: parsed.data.address_street ?? null,
        address_city: parsed.data.address_city ?? null,
        address_state: parsed.data.address_state ?? null,
        address_postal: parsed.data.address_postal ?? null,
        country: country?.name ?? null,
        flag_emoji: country?.flag ?? null,
      })
      .eq("id", user.id);
    setSavingAddress(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Address saved");
    refresh();
  };

  const savePrefs = async () => {
    if (!user) return;
    const parsed = PrefsSchema.safeParse({ language, currency });
    if (!parsed.success) {
      toast.error("Invalid preferences");
      return;
    }
    setSavingPrefs(true);
    const { error } = await supabase
      .from("profiles")
      .update({ language: parsed.data.language, currency: parsed.data.currency })
      .eq("id", user.id);
    setSavingPrefs(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Preferences saved");
    refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-text-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your settings…
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Settings</h1>
        <p className="mt-1 text-sm text-text-2">Keep your profile up to date — we use this for your LLC filing and to reach you.</p>
      </div>

      {/* Appearance + Language */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-base font-bold">{t("appearance.title")}</h2>
          <p className="mt-1 text-xs text-text-3">{t("appearance.desc")}</p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                theme === "light" ? "bg-primary text-primary-foreground" : "border border-border text-text-2 hover:bg-accent"
              }`}
            >
              <Sun className="h-4 w-4" /> {t("appearance.light")}
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                theme === "dark" ? "bg-primary text-primary-foreground" : "border border-border text-text-2 hover:bg-accent"
              }`}
            >
              <Moon className="h-4 w-4" /> {t("appearance.dark")}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-base font-bold">{t("language.title")}</h2>
          <p className="mt-1 text-xs text-text-3">{t("language.desc")}</p>
          <div className="mt-4 flex gap-2">
            {(["en", "fr", "ar"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  lang === l ? "bg-primary text-primary-foreground" : "border border-border text-text-2 hover:bg-accent"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </section>
      </div>


      {/* Personal */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-base font-bold">Personal information</h2>
        <p className="mt-1 text-xs text-text-3">Your contact details.</p>

        <div className="mt-5 flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border border-border bg-muted">
            {avatarUrl ? (
              <img src={avatarUrl} alt="User profile avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-text-3">
                {fullName?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-accent">
            {avatarUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            <span>{avatarUploading ? "Uploading…" : "Change photo"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onAvatar(e.target.files[0])}
            />
          </label>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Full name" value={fullName} onChange={setFullName} />
          <div>
            <label className="text-xs font-medium text-text-2">Email</label>
            <input
              value={profile?.email ?? ""}
              disabled
              className="mt-1 h-11 w-full rounded-lg border border-border bg-muted px-3 text-sm text-text-2"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-2">Date of birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="mt-1 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-2">Phone</label>
            <div className="mt-1 flex gap-2">
              <select
                value={dial}
                onChange={(e) => setDial(e.target.value)}
                className="h-11 w-28 rounded-lg border border-border bg-card px-2 text-sm outline-none focus:border-primary"
              >
                {dialOptions.map((c) => (
                  <option key={c.code + c.dial} value={c.dial}>{c.flag} {c.dial}</option>
                ))}
              </select>
              <input
                type="tel"
                value={phoneLocal}
                onChange={(e) => setPhoneLocal(e.target.value.replace(/[^\d]/g, ""))}
                maxLength={15}
                className="h-11 flex-1 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-xs font-medium text-text-2">
              <input
                type="checkbox"
                checked={whatsappSame}
                onChange={(e) => setWhatsappSame(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              WhatsApp is the same as my phone
            </label>
            {!whatsappSame && (
              <div className="mt-2 flex gap-2">
                <select
                  value={whatsappDial}
                  onChange={(e) => setWhatsappDial(e.target.value)}
                  className="h-11 w-28 rounded-lg border border-border bg-card px-2 text-sm outline-none focus:border-primary"
                >
                  {dialOptions.map((c) => (
                    <option key={"w" + c.code + c.dial} value={c.dial}>{c.flag} {c.dial}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={whatsappLocal}
                  onChange={(e) => setWhatsappLocal(e.target.value.replace(/[^\d]/g, ""))}
                  maxLength={15}
                  placeholder="WhatsApp number"
                  className="h-11 flex-1 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={savePersonal}
          disabled={savingPersonal}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {savingPersonal ? "Saving…" : "Save personal info"}
        </button>
      </section>

      {/* Address */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-base font-bold">Address</h2>
        <p className="mt-1 text-xs text-text-3">Your residential address — used on official LLC paperwork.</p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Street address" value={street} onChange={setStreet} />
          </div>
          <Field label="City" value={city} onChange={setCity} />
          <Field label="State / Region" value={stateRegion} onChange={setStateRegion} />
          <Field label="Postal code" value={postal} onChange={setPostal} />
          <div>
            <label className="text-xs font-medium text-text-2">Country</label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={saveAddress}
          disabled={savingAddress}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {savingAddress ? "Saving…" : "Save address"}
        </button>
      </section>

      {/* Preferences */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-base font-bold">Preferences</h2>
        <p className="mt-1 text-xs text-text-3">Language and billing currency.</p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-text-2">Preferred language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "fr" | "ar")}
              className="mt-1 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-2">Preferred currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={savePrefs}
          disabled={savingPrefs}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {savingPrefs ? "Saving…" : "Save preferences"}
        </button>
      </section>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-text-2">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={255}
        className="mt-1 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

function splitPhone(full: string): { dial: string; local: string } {
  if (!full) return { dial: "", local: "" };
  const match = COUNTRIES.filter((c) => c.dial !== "+")
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((c) => full.startsWith(c.dial));
  if (match) return { dial: match.dial, local: full.slice(match.dial.length) };
  return { dial: "", local: full };
}
