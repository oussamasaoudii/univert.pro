'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { getIcon, type IconName } from './icon-map';

interface Benefit {
  iconName?: IconName;
  title: string;
  description: string;
  href?: string;
}

interface BenefitsGridProps {
  badge?: string;
  title?: string;
  description?: string;
  benefits: Benefit[];
  variant?: 'cards' | 'checklist' | 'icons' | 'numbered';
  columns?: 2 | 3 | 4;
}

export function BenefitsGrid({
  badge,
  title,
  description,
  benefits,
  variant = 'cards',
  columns = 3,
}: BenefitsGridProps) {
  const colsClass = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-2 xl:grid-cols-4',
  }[columns];

  if (variant === 'checklist') {
    return (
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          {(title || description) && (
            <div className="text-center mb-12">
              {badge && (
                <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                  {badge}
                </Badge>
              )}
              {title && (
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-foreground/60 max-w-2xl mx-auto">
                  {description}
                </p>
              )}
            </div>
          )}

          <div className={`grid md:grid-cols-2 ${colsClass} gap-6`}>
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                  <p className="text-sm text-foreground/60">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'numbered') {
    return (
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          {(title || description) && (
            <div className="text-center mb-12">
              {badge && (
                <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                  {badge}
                </Badge>
              )}
              {title && (
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-foreground/60 max-w-2xl mx-auto">
                  {description}
                </p>
              )}
            </div>
          )}

          <div className={`grid md:grid-cols-2 ${colsClass} gap-8`}>
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0 font-bold text-accent">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-foreground/60 leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'icons') {
    return (
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          {(title || description) && (
            <div className="text-center mb-12">
              {badge && (
                <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                  {badge}
                </Badge>
              )}
              {title && (
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-foreground/60 max-w-2xl mx-auto">
                  {description}
                </p>
              )}
            </div>
          )}

          <div className={`grid md:grid-cols-2 ${colsClass} gap-8 lg:gap-12`}>
            {benefits.map((benefit, i) => {
              const Icon = benefit.iconName ? getIcon(benefit.iconName) : null;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  {Icon && (
                    <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-accent" />
                    </div>
                  )}
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-foreground/60 text-sm leading-relaxed">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Default cards variant
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {(title || description) && (
          <div className="text-center mb-12">
            {badge && (
              <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                {badge}
              </Badge>
            )}
            {title && (
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-foreground/60 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>
        )}

        <div className={`grid md:grid-cols-2 ${colsClass} gap-6`}>
          {benefits.map((benefit, i) => {
            const Icon = benefit.iconName ? getIcon(benefit.iconName) : null;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Card className="h-full bg-card hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                  <CardContent className="p-6">
                    {Icon && (
                      <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                    )}
                    <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed">{benefit.description}</p>
                    {benefit.href && (
                      <Link 
                        href={benefit.href}
                        className="inline-flex items-center text-accent text-sm font-medium mt-4 hover:underline group/link"
                      >
                        Learn more 
                        <ChevronRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
