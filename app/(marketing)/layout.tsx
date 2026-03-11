import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
import { Suspense } from "react";
import Script from "next/script";

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl h-[72px]" />
  );
}

function FooterFallback() {
  return (
    <footer className="border-t border-border bg-background py-12" />
  );
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Suspense fallback={<FooterFallback />}>
        <Footer />
      </Suspense>
      {/* Trustpilot widget loader */}
      <Script
        id="trustpilot-widget"
        src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
