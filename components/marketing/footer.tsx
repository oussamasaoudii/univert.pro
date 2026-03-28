import Link from "next/link";

const footerLinks = {
  product: [
    { name: "Templates", href: "/templates" },
    { name: "Demos", href: "/demos" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Pricing", href: "/pricing" },
  ],
  support: [
    { name: "Help Center", href: "/help-center" },
    { name: "Support", href: "/support" },
    { name: "Contact", href: "/contact" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Ownership & Freedom", href: "/about/ownership" },
    { name: "Contact", href: "/contact" },
  ],
  resources: [
    { name: "Blog", href: "/blog" },
    { name: "Features", href: "/features" },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Security", href: "/security" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background relative">
      {/* Subtle top gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      
      <div className="container py-14 md:py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 md:pr-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent group-hover:bg-accent/90 transition-colors">
                <span className="text-sm font-bold text-accent-foreground">U</span>
              </div>
              <span className="text-xl font-semibold tracking-tight text-foreground">Univert</span>
            </Link>
            <p className="mt-5 text-sm text-foreground/60 leading-relaxed max-w-xs">
              Launch professional websites fast. Choose templates, get managed setup and support, keep your freedom to move later.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <ul className="mt-5 space-y-3.5">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/50 hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Support</h3>
            <ul className="mt-5 space-y-3.5">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/50 hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <ul className="mt-5 space-y-3.5">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/50 hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Resources</h3>
            <ul className="mt-5 space-y-3.5">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/50 hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-5 space-y-3.5">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/50 hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 md:flex-row">
          <p className="text-sm text-foreground/40">
            {new Date().getFullYear()} Univert. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
