'use client';

import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface Stat {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface CustomerStatsProps {
  stats: Stat[];
}

export function CustomerStats({ stats }: CustomerStatsProps) {
  return (
    <section className="py-16 lg:py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
            Impact
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
            Powering success at scale
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            The numbers speak for themselves. Here&apos;s the impact Ovmon has on our customers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-xl bg-card border border-border hover:border-accent/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-accent" />
              </div>
              <p className="text-3xl lg:text-4xl font-bold text-foreground mb-2">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
