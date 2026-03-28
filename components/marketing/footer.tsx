import Link from "next/link";

const footerLinks = {
  product: [
    { name: "Templates", href: "/templates" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Pricing", href: "/pricing" },
    { name: "Support", href: "/support" },
  ],
  solutions: [
    { name: "E-commerce", href: "/solutions/ecommerce" },
    { name: "Agencies", href: "/solutions/agencies" },
    { name: "Creators", href: "/solutions/creators" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Ownership & Freedom", href: "/about/ownership" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ],
  resources: [
    { name: "Blog", href: "/blog" },
    { name: "Support", href: "/support" },
    { name: "Ownership & Freedom", href: "/about/ownership" },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Security", href: "/security" },
    { name: "Status", href: "/status" },
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
            
            {/* Social links moved here */}
            <div className="mt-6 flex gap-4">
              <a href="https://twitter.com/univertpro" target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-accent transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://github.com/univertpro" target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-accent transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://linkedin.com/company/univertpro" target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-accent transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
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
            <h3 className="text-sm font-semibold text-foreground">Solutions</h3>
            <ul className="mt-5 space-y-3.5">
              {footerLinks.solutions.map((link) => (
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
          
          {/* Trustpilot badge in footer */}
          <a
            href="https://www.trustpilot.com/review/univert.pro"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 2L14.09 8.26L21 9.27L16.5 13.64L17.82 20.5L12 17.27L6.18 20.5L7.5 13.64L3 9.27L9.91 8.26L12 2Z" fill="#00b67a"/>
            </svg>
            <span className="text-sm">Rated 4.8 on Trustpilot</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
