'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ChevronRight, type LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  stat?: string;
  statLabel?: string;
  highlight?: boolean;
  href?: string;
}

interface FeatureShowcaseProps {
  badge?: string;
  title: string;
  description?: string;
  features: Feature[];
  variant?: 'grid' | 'bento' | 'list';
  columns?: 2 | 3 | 4;
}

export function FeatureShowcase({
  badge,
  title,
  description,
  features,
  variant = 'grid',
  columns = 3,
}: FeatureShowcaseProps) {
  const colsClass = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-2 xl:grid-cols-4',
  }[columns];

  if (variant === 'bento') {
    return (
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            {badge && (
              <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                {badge}
              </Badge>
            )}
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              {title}
            </h2>
            {description && (
              <p className="text-foreground/60 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const isHighlighted = feature.highlight || i === 0;
              const span = isHighlighted ? 'lg:col-span-2' : '';

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className={`group ${span}`}
                >
                  <Card className={`h-full ${isHighlighted ? 'bg-gradient-to-br from-accent/5 via-card/50 to-card/50 border-accent/30 hover:border-accent/50' : 'bg-card hover:border-accent/40'} transition-all duration-300 hover:shadow-lg hover:shadow-accent/10`}>
                    <CardContent className={isHighlighted ? 'p-8 lg:p-10' : 'p-6'}>
                      <div className={isHighlighted ? 'flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6' : ''}>
                        <div className="flex-1">
                          <div className={`${isHighlighted ? 'w-14 h-14' : 'w-12 h-12'} rounded-xl bg-accent/20 flex items-center justify-center mb-5 group-hover:bg-accent/30 transition-colors`}>
                            <feature.icon className={`${isHighlighted ? 'w-7 h-7' : 'w-6 h-6'} text-accent`} />
                          </div>
                          <h3 className={`${isHighlighted ? 'text-xl lg:text-2xl' : 'text-lg'} font-semibold text-foreground mb-3`}>
                            {feature.title}
                          </h3>
                          <p className="text-foreground/60 leading-relaxed">
                            {feature.description}
                          </p>
                          {feature.href && (
                            <Link 
                              href={feature.href}
                              className="inline-flex items-center text-accent text-sm font-medium mt-4 hover:underline group/link"
                            >
                              Learn more 
                              <ChevronRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                          )}
                        </div>
                        {isHighlighted && feature.stat && (
                          <div className="lg:text-right">
                            <p className="text-4xl lg:text-5xl font-bold text-accent mb-1">{feature.stat}</p>
                            <p className="text-sm text-muted-foreground">{feature.statLabel}</p>
                          </div>
                        )}
                      </div>
                      {!isHighlighted && feature.stat && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <p className="text-2xl font-bold text-accent">{feature.stat}</p>
                          <p className="text-xs text-muted-foreground">{feature.statLabel}</p>
                        </div>
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

  if (variant === 'list') {
    return (
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            {badge && (
              <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                {badge}
              </Badge>
            )}
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              {title}
            </h2>
            {description && (
              <p className="text-foreground/60 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <Card className="bg-card hover:border-accent/40 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0 group-hover:bg-accent/30 transition-colors">
                        <feature.icon className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-foreground/60 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                      {feature.stat && (
                        <div className="text-right shrink-0">
                          <p className="text-2xl font-bold text-accent">{feature.stat}</p>
                          <p className="text-xs text-muted-foreground">{feature.statLabel}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Default grid variant
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          {badge && (
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              {badge}
            </Badge>
          )}
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
            {title}
          </h2>
          {description && (
            <p className="text-foreground/60 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        <div className={`grid md:grid-cols-2 ${colsClass} gap-6`}>
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <Card className="h-full bg-card hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-5 group-hover:bg-accent/30 transition-colors">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/60 leading-relaxed">
                    {feature.description}
                  </p>
                  {feature.stat && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <p className="text-2xl font-bold text-accent">{feature.stat}</p>
                      <p className="text-xs text-muted-foreground">{feature.statLabel}</p>
                    </div>
                  )}
                  {feature.href && (
                    <Link 
                      href={feature.href}
                      className="inline-flex items-center text-accent text-sm font-medium mt-4 hover:underline group/link"
                    >
                      Learn more 
                      <ChevronRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
