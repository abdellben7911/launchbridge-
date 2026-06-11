import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";
import { PageHeader, Card, KpiCard } from "@/components/dashboard/shared";
import { Banknote, CreditCard, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/banking")({
  component: BankingPage,
});

type Account = {
  id: string;
  provider: string;
  status: string;
  account_number_masked: string | null;
  balance_usd: number | null;
  card_last_four: string | null;
  card_status: string | null;
  app_url: string | null;
};

type Tx = {
  id: string;
  account_id: string;
  direction: string;
  description: string;
  amount_usd: number;
  occurred_at: string;
};

function BankingPage() {
  const { activeId } = useActiveWorkspace();

  const accountsQ = useQuery({
    queryKey: ["banking-accounts", activeId],
    enabled: !!activeId,
    queryFn: async (): Promise<Account[]> => {
      const { data, error } = await supabase
        .from("banking_accounts")
        .select("id, provider, status, account_number_masked, balance_usd, card_last_four, card_status, app_url")
        .eq("order_id", activeId!);
      if (error) throw error;
      return (data ?? []) as Account[];
    },
  });

  const accounts = accountsQ.data ?? [];
  const accountIds = accounts.map((a) => a.id);

  const txQ = useQuery({
    queryKey: ["banking-tx", accountIds.join(",")],
    enabled: accountIds.length > 0,
    queryFn: async (): Promise<Tx[]> => {
      const { data, error } = await supabase
        .from("banking_transactions")
        .select("id, account_id, direction, description, amount_usd, occurred_at")
        .in("account_id", accountIds)
        .order("occurred_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as Tx[];
    },
  });

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance_usd ?? 0), 0);
  const activeAccounts = accounts.filter((a) => a.status === "active").length;
  const monthInflow = (txQ.data ?? [])
    .filter((t) => t.direction === "credit")
    .reduce((s, t) => s + Number(t.amount_usd), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={<><Banknote className="h-3 w-3" /> Banking Hub</>}
        title="Banking & Cards"
        description="Track balances, transactions, and issued cards across your U.S. accounts."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Total Balance" value={`$${totalBalance.toLocaleString()}`} hint="Across all accounts" />
        <KpiCard label="Active Accounts" value={String(activeAccounts)} hint={`${accounts.length} total`} />
        <KpiCard label="Recent Inflow" value={`$${monthInflow.toLocaleString()}`} hint="Last 30 transactions" trend="up" />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-foreground">Accounts</h2>
        {accounts.length === 0 ? (
          <Card className="p-8 text-center text-sm text-text-3">
            No bank accounts linked yet. We'll open them after your EIN is approved.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {accounts.map((a) => (
              <Card key={a.id} className="p-5 transition-transform hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-text-3">{a.provider}</div>
                    <div className="mt-1 text-2xl font-black text-foreground">
                      ${Number(a.balance_usd ?? 0).toLocaleString()}
                    </div>
                    <div className="mt-1 text-xs text-text-2">{a.account_number_masked ?? "Pending"}</div>
                  </div>
                  <div className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase text-primary">
                    {a.status}
                  </div>
                </div>
                {a.card_last_four && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-bg-2 p-3 text-xs">
                    <CreditCard className="h-4 w-4 text-text-3" />
                    <span className="font-semibold">•••• {a.card_last_four}</span>
                    <span className="ms-auto text-text-3">{a.card_status}</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-foreground">Recent Transactions</h2>
        <Card className="overflow-hidden">
          {(txQ.data ?? []).length === 0 ? (
            <div className="p-8 text-center text-sm text-text-3">No transactions yet.</div>
          ) : (
            <ul className="divide-y divide-border">
              {(txQ.data ?? []).map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`grid h-8 w-8 place-items-center rounded-full ${
                    t.direction === "credit" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                  }`}>
                    {t.direction === "credit" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">{t.description}</div>
                    <div className="text-[11px] text-text-3">
                      {new Date(t.occurred_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${t.direction === "credit" ? "text-emerald-600" : "text-foreground"}`}>
                    {t.direction === "credit" ? "+" : "−"}${Number(t.amount_usd).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
