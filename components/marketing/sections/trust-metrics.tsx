'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface TrustItem {
  icon: LucideIcon;
  label: string;
  sublabel?: string;
  description?: string;
}

interface TrustMetricsProps {
  badge?: string;
  title?: string;
  description?: string;
  items: TrustItem[];
  variant?: 'cards' | 'inline' | 'badges';
}

export function TrustMetrics({
  badge,
  title,
  description,
  items,
  variant = 'cards',
}: TrustMetricsProps) {
  if (variant === 'inline') {
    return (
      <section className="py-6 border-y border-border/50 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {items.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <item.icon className="w-4 h-4 text-accent" />
                <span>{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'badges') {
    return (
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          {(title || description) && (
            <div className="text-center mb-10">
              {badge && (
                <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                  {badge}
                </Badge>
              )}
              {title && (
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 text-balance">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-foreground/60 max-w-xl mx-auto">
                  {description}
                </p>
              )}
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-4">
            {items.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 px-5 py-3 bg-secondary/50 border border-border/50 rounded-xl"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{item.label}</p>
                  {item.sublabel && (
                    <p className="text-xs text-muted-foreground">{item.sublabel}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Default cards variant
  return (
    <section className="py-16 lg:py-20">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <Card className="h-full bg-card hover:border-accent/40 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/30 transition-colors">
                    <item.icon className="w-7 h-7 text-accent" />
                  </div>
                  <p className="text-lg font-semibold text-foreground">{item.label}</p>
                  {item.sublabel && (
                    <p className="text-sm text-muted-foreground">{item.sublabel}</p>
                  )}
                  {item.description && (
                    <p className="text-sm text-foreground/60 mt-2">{item.description}</p>
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
