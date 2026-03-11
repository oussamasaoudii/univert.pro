'use client';

import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';

const comparisonData = [
  { feature: "Global Edge Network", ovmon: true, traditional: false, partial: false },
  { feature: "Instant Deployments (<3s)", ovmon: true, traditional: false, partial: false },
  { feature: "Automatic Scaling", ovmon: true, traditional: "partial", partial: true },
  { feature: "Preview Deployments", ovmon: true, traditional: false, partial: false },
  { feature: "Zero Configuration SSL", ovmon: true, traditional: "partial", partial: true },
  { feature: "DDoS Protection Included", ovmon: true, traditional: false, partial: false },
  { feature: "Framework Auto-Detection", ovmon: true, traditional: false, partial: false },
  { feature: "Serverless Functions", ovmon: true, traditional: "partial", partial: true },
  { feature: "Real-Time Analytics", ovmon: true, traditional: "partial", partial: true },
  { feature: "One-Click Rollbacks", ovmon: true, traditional: false, partial: false },
];

function StatusIcon({ status }: { status: boolean | string }) {
  if (status === true) {
    return (
      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
        <Check className="w-4 h-4 text-accent" />
      </div>
    );
  }
  if (status === "partial") {
    return (
      <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
        <Minus className="w-4 h-4 text-yellow-500" />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
      <X className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

export function ProductComparison() {
  return (
    <section className="py-16 lg:py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
            Why Ovmon
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
            Modern infrastructure vs. traditional hosting
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            See how Ovmon compares to traditional hosting and other deployment platforms.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4 p-4 border-b border-border bg-secondary/30">
              <div className="text-sm font-medium text-muted-foreground">Feature</div>
              <div className="text-center">
                <span className="text-sm font-semibold text-accent">Ovmon</span>
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-muted-foreground">Traditional</span>
              </div>
            </div>

            {/* Rows */}
            {comparisonData.map((row, i) => (
              <motion.div
                key={row.feature}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`grid grid-cols-3 gap-4 p-4 items-center ${i !== comparisonData.length - 1 ? 'border-b border-border/50' : ''}`}
              >
                <div className="text-sm text-foreground">{row.feature}</div>
                <div className="flex justify-center">
                  <StatusIcon status={row.ovmon} />
                </div>
                <div className="flex justify-center">
                  <StatusIcon status={row.traditional ? (row.partial ? "partial" : true) : false} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <StatusIcon status={true} />
              <span>Included</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status="partial" />
              <span>Partial / Extra cost</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status={false} />
              <span>Not available</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
