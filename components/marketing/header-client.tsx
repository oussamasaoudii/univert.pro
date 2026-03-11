"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Menu, ArrowRight, LayoutDashboard, Shield, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

type MarketingSessionUser = {
  id: string;
  email: string;
  role: "user" | "admin";
  sessionType: "user" | "admin" | null;
} | null;

const navigation = [
  { name: "Templates", href: "/demos" },
  { name: "Pricing", href: "/pricing" },
  { name: "Features", href: "/features" },
  { name: "Docs", href: "/support" },
];

export function HeaderClient({ currentUser }: { currentUser: MarketingSessionUser }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-[72px] items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent transition-smooth group-hover:shadow-glow-sm">
              <span className="text-sm font-bold text-accent-foreground">O</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">Ovmon</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg transition-smooth hover:text-foreground hover:bg-secondary/50"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher withTheme />
          {currentUser ? (
            <>
              {currentUser.role === "admin" && (
                <a
                  href="/admin"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-9 px-4 font-medium")}
                >
                  <Shield className="mr-1.5 h-4 w-4" />
                  Admin
                </a>
              )}
              {currentUser.sessionType === "user" ? (
                <a
                  href="/dashboard"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-9 px-4 font-medium")}
                >
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  Dashboard
                </a>
              ) : null}
              <a
                href="/api/auth/logout"
                className={cn(buttonVariants({ size: "sm" }), "h-9 px-5 font-medium group")}
              >
                Sign out
                <LogOut className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-9 px-4 font-medium")}
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className={cn(buttonVariants({ size: "sm" }), "h-9 px-5 font-medium group")}
              >
                Get Started
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] bg-background border-border">
            <div className="flex items-center gap-2.5 mt-2 mb-8">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                <span className="text-sm font-bold text-accent-foreground">O</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">Ovmon</span>
            </div>
            <nav className="flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-3 text-base font-medium text-muted-foreground rounded-lg transition-smooth hover:text-foreground hover:bg-secondary/50"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-6 pt-6 border-t border-border">
                <LanguageSwitcher withTheme className="self-start" />
                {currentUser ? (
                  <>
                    {currentUser.role === "admin" && (
                      <a
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className={cn(buttonVariants({ variant: "outline" }), "w-full h-11 font-medium")}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Admin
                      </a>
                    )}
                    {currentUser.sessionType === "user" ? (
                      <a
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className={cn(buttonVariants({ variant: "outline" }), "w-full h-11 font-medium")}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </a>
                    ) : null}
                    <a
                      href="/api/auth/logout"
                      onClick={() => setIsOpen(false)}
                      className={cn(buttonVariants({ variant: "default" }), "w-full h-11 font-medium")}
                    >
                      Sign out
                      <LogOut className="ml-1.5 h-4 w-4" />
                    </a>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setIsOpen(false)}
                      className={cn(buttonVariants({ variant: "outline" }), "w-full h-11 font-medium")}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsOpen(false)}
                      className={cn(buttonVariants({ variant: "default" }), "w-full h-11 font-medium")}
                    >
                      Get Started
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
