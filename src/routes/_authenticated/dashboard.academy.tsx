import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, Card } from "@/components/dashboard/shared";
import { GraduationCap, Play, BookOpen } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/academy")({
  component: AcademyPage,
});

type Enrollment = {
  id: string;
  course_slug: string;
  progress_pct: number;
};

const CATALOG: { slug: string; title: string; description: string; duration: string }[] = [
  { slug: "us-llc-fundamentals", title: "U.S. LLC Fundamentals", description: "Everything about Wyoming, Delaware, and Florida LLCs.", duration: "45 min" },
  { slug: "stripe-mastery", title: "Stripe Mastery for MEA Founders", description: "Account setup, payouts, dispute handling, and tax forms.", duration: "1h 20min" },
  { slug: "shopify-launch", title: "Shopify Launch Playbook", description: "From product import to first sale in 14 days.", duration: "2h 10min" },
  { slug: "us-banking-guide", title: "U.S. Banking Without Travel", description: "Mercury, Relay, Airwallex — how to choose and apply remotely.", duration: "35 min" },
  { slug: "ein-and-taxes", title: "EIN & U.S. Tax Basics", description: "Form 5472, BOI, state franchise tax explained simply.", duration: "55 min" },
  { slug: "scaling-cross-border", title: "Scaling Cross-Border", description: "Operate from Morocco while serving U.S. customers.", duration: "1h 05min" },
];

function AcademyPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["enrollments", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<Enrollment[]> => {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("id, course_slug, progress_pct")
        .eq("client_id", user!.id);
      if (error) throw error;
      return (data ?? []) as Enrollment[];
    },
  });

  const enrollments = q.data ?? [];
  const enrolledSet = new Set(enrollments.map((e) => e.course_slug));

  async function enroll(slug: string) {
    if (!user) return;
    const { error } = await supabase
      .from("course_enrollments")
      .insert({ client_id: user.id, course_slug: slug, progress_pct: 0 });
    if (error) toast.error("Could not enroll");
    else {
      toast.success("Enrolled!");
      qc.invalidateQueries({ queryKey: ["enrollments", user.id] });
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={<><GraduationCap className="h-3 w-3" /> LaunchBridge Academy</>}
        title="Learn while you build"
        description="On-demand courses on U.S. LLCs, banking, payment gateways, and cross-border scaling."
      />

      {enrollments.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-foreground">Continue learning</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {enrollments.map((e) => {
              const meta = CATALOG.find((c) => c.slug === e.course_slug);
              return (
                <Card key={e.id} className="transition-transform hover:-translate-y-1">
                  <div className="flex items-start gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-bold text-foreground">{meta?.title ?? e.course_slug}</h3>
                      <p className="text-xs text-text-3">{meta?.duration ?? ""}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-2">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-secondary"
                            style={{ width: `${e.progress_pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-text-2">{e.progress_pct}%</span>
                      </div>
                    </div>
                    <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground hover:opacity-90">
                      <Play className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground">Course catalog</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATALOG.map((c) => {
            const enrolled = enrolledSet.has(c.slug);
            return (
              <Card key={c.slug} className="flex flex-col transition-transform hover:-translate-y-1">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-base font-bold text-foreground">{c.title}</h3>
                <p className="mt-1 flex-1 text-xs text-text-2">{c.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-text-3">{c.duration}</span>
                  <button
                    disabled={enrolled}
                    onClick={() => enroll(c.slug)}
                    className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
                  >
                    {enrolled ? "Enrolled" : "Enroll"}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
