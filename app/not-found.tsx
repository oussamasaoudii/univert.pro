import { ErrorPageShell } from "@/components/error-pages/error-page-shell";
import { NOT_FOUND_PAGE_COPY } from "@/lib/error-pages";
import { getServerLanguage } from "@/lib/i18n/server-language";

export default async function NotFound() {
  const language = await getServerLanguage();
  const copy = NOT_FOUND_PAGE_COPY[language];

  return (
    <ErrorPageShell
      language={language}
      statusCode="404"
      title={copy.title}
      description={copy.description}
      primaryAction={{
        kind: "link",
        href: "/",
        label: copy.primaryLabel,
        icon: "home",
        variant: "primary",
      }}
      secondaryAction={{
        kind: "history-back",
        label: copy.secondaryLabel,
        icon: "back",
        variant: "secondary",
        fallbackHref: "/",
      }}
      footerText={copy.footer}
    />
  );
}
