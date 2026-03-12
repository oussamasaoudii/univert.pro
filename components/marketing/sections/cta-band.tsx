'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface CTAAction {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: LucideIcon;
}

interface CTABandProps {
  title: string;
  description?: string;
  actions?: CTAAction[];
  variant?: 'default' | 'gradient' | 'minimal' | 'centered';
  visual?: ReactNode;
}

export function CTABand({
  title,
  description,
  actions = [],
  variant = 'default',
  visual,
}: CTABandProps) {
  if (variant === 'gradient') {
    return (
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/20 via-accent/10 to-background border border-accent/30 p-8 lg:p-12"
          >
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(45,212,191,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(45,212,191,0.1),transparent_50%)]" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 text-balance">
                  {title}
                </h2>
                {description && (
                  <p className="text-foreground/70 max-w-xl">{description}</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                {actions.map((action, index) => {
                  const isPrimary = action.variant === 'primary' || (index === 0 && !action.variant);
                  const ActionIcon = action.icon || ArrowRight;

                  if (isPrimary) {
                    return (
                      <Button 
                        key={action.href}
                        size="lg" 
                        className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 px-6 text-base font-medium shadow-lg shadow-accent/20" 
                        asChild
                      >
                        <Link href={action.href}>
                          {action.label}
                          <ActionIcon className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    );
                  }

                  return (
                    <Button 
                      key={action.href}
                      size="lg" 
                      variant="outline" 
                      className="h-12 px-6 text-base border-foreground/20 hover:border-accent/50" 
                      asChild
                    >
                      <Link href={action.href}>
                        {action.label}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  if (variant === 'minimal') {
    return (
      <section className="py-12 lg:py-16 border-y border-border/50 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center"
          >
            <p className="text-foreground font-medium">{title}</p>
            <div className="flex gap-3">
              {actions.map((action, index) => {
                const isPrimary = action.variant === 'primary' || (index === 0 && !action.variant);
                
                if (isPrimary) {
                  return (
                    <Button 
                      key={action.href}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground" 
                      asChild
                    >
                      <Link href={action.href}>
                        {action.label}
                      </Link>
                    </Button>
                  );
                }

                return (
                  <Button 
                    key={action.href}
                    variant="ghost"
                    className="hover:text-accent" 
                    asChild
                  >
                    <Link href={action.href}>
                      {action.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  if (variant === 'centered') {
    return (
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-6 text-balance">
              {title}
            </h2>
            {description && (
              <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
                {description}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {actions.map((action, index) => {
                const isPrimary = action.variant === 'primary' || (index === 0 && !action.variant);
                const ActionIcon = action.icon || ArrowRight;

                if (isPrimary) {
                  return (
                    <Button 
                      key={action.href}
                      size="lg" 
                      className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 px-8 text-base font-medium shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all" 
                      asChild
                    >
                      <Link href={action.href}>
                        {action.label}
                        <ActionIcon className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  );
                }

                return (
                  <Button 
                    key={action.href}
                    size="lg" 
                    variant="outline" 
                    className="h-12 px-8 text-base hover:border-accent/50" 
                    asChild
                  >
                    <Link href={action.href}>
                      {action.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Default variant
  return (
    <section className="py-16 lg:py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row items-center justify-between gap-8"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              {title}
            </h2>
            {description && (
              <p className="text-foreground/70">{description}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            {actions.map((action, index) => {
              const isPrimary = action.variant === 'primary' || (index === 0 && !action.variant);
              const ActionIcon = action.icon || ArrowRight;

              if (isPrimary) {
                return (
                  <Button 
                    key={action.href}
                    size="lg" 
                    className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 px-6 text-base font-medium" 
                    asChild
                  >
                    <Link href={action.href}>
                      {action.label}
                      <ActionIcon className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                );
              }

              return (
                <Button 
                  key={action.href}
                  size="lg" 
                  variant="outline" 
                  className="h-12 px-6 text-base hover:border-accent/50" 
                  asChild
                >
                  <Link href={action.href}>
                    {action.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
