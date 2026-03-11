"use client";

import { useEffect } from "react";
import { ErrorPageShell } from "@/components/error-pages/error-page-shell";
import { GENERIC_ERROR_PAGE_COPY } from "@/lib/error-pages";
import { useSiteLanguage } from "@/hooks/use-site-language";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const language = useSiteLanguage();
  const copy = GENERIC_ERROR_PAGE_COPY[language];

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("[v0] Application error:", error);
  }, [error]);

  return (
    <ErrorPageShell
      language={language}
      statusCode="500"
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
        kind: "button",
        label: copy.secondaryLabel,
        icon: "retry",
        variant: "secondary",
        onClick: reset,
      }}
      footerText={copy.footer}
      details={
        error.digest && copy.detailsLabel ? `${copy.detailsLabel}: ${error.digest}` : undefined
      }
    />
  );
}
