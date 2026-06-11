import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/_authenticated/admin/documents")({
  component: () => {
    const { t } = useLang();
    return (
      <div>
        <h1 className="text-2xl font-extrabold">{t("admin.q.docs_review")}</h1>
        <p className="mt-2 text-sm text-text-2">{t("admin.stub.documents")}</p>
      </div>
    );
  },
});
