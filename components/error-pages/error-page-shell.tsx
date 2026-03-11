"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Home, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteLanguage } from "@/lib/i18n/language";
import styles from "./error-page-shell.module.css";

type ErrorPageAction =
  | {
      kind: "link";
      href: string;
      label: string;
      icon: "home" | "retry" | "back";
      variant: "primary" | "secondary";
    }
  | {
      kind: "history-back";
      label: string;
      icon: "back";
      variant: "primary" | "secondary";
      fallbackHref?: string;
    }
  | {
      kind: "button";
      label: string;
      icon: "home" | "retry" | "back";
      variant: "primary" | "secondary";
      onClick: () => void;
    };

interface ErrorPageShellProps {
  language: SiteLanguage;
  statusCode: string;
  title: string;
  description: string;
  primaryAction: ErrorPageAction;
  secondaryAction?: ErrorPageAction;
  footerText: string;
  details?: string;
  className?: string;
}

function ErrorPageIcon({
  icon,
  language,
}: {
  icon: ErrorPageAction["icon"];
  language: SiteLanguage;
}) {
  if (icon === "home") {
    return <Home className={styles.actionIcon} aria-hidden />;
  }

  if (icon === "retry") {
    return <RefreshCw className={styles.actionIcon} aria-hidden />;
  }

  const BackIcon = language === "ar" ? ArrowRight : ArrowLeft;
  return <BackIcon className={styles.actionIcon} aria-hidden />;
}

function renderAction(
  action: ErrorPageAction,
  language: SiteLanguage,
  key: string,
) {
  const className = cn(
    styles.actionButton,
    action.variant === "primary" ? styles.actionPrimary : styles.actionSecondary,
  );
  const content = (
    <>
      <ErrorPageIcon icon={action.icon} language={language} />
      <span>{action.label}</span>
    </>
  );

  if (action.kind === "link") {
    return (
      <Link key={key} href={action.href} className={className}>
        {content}
      </Link>
    );
  }

  if (action.kind === "history-back") {
    return (
      <button
        key={key}
        type="button"
        className={className}
        onClick={() => {
          if (window.history.length > 1) {
            window.history.back();
            return;
          }

          window.location.assign(action.fallbackHref || "/");
        }}
      >
        {content}
      </button>
    );
  }

  return (
    <button key={key} type="button" className={className} onClick={action.onClick}>
      {content}
    </button>
  );
}

export function ErrorPageShell({
  language,
  statusCode,
  title,
  description,
  primaryAction,
  secondaryAction,
  footerText,
  details,
  className,
}: ErrorPageShellProps) {
  return (
    <div className={cn(styles.page, className)} dir={language === "ar" ? "rtl" : "ltr"}>
      <main className={styles.main} role="main">
        <div className={styles.container}>
          <p className={styles.code}>{statusCode}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
          <div className={styles.actions}>
            {renderAction(primaryAction, language, "primary")}
            {secondaryAction ? renderAction(secondaryAction, language, "secondary") : null}
          </div>
          {details ? <p className={styles.meta}>{details}</p> : null}
        </div>
      </main>
      <footer className={styles.footer}>{footerText}</footer>
    </div>
  );
}
