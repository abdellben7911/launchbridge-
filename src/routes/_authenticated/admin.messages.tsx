import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: () => {
    const { t } = useLang();
    return (
      <div>
        <h1 className="text-2xl font-extrabold">{t("admin.q.messages_inbox")}</h1>
        <p className="mt-2 text-sm text-text-2">{t("admin.stub.messages")}</p>
      </div>
    );
  },
});
