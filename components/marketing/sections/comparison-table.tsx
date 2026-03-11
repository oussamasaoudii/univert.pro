'use client';

import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';

interface ComparisonRow {
  feature: string;
  description?: string;
  values: (boolean | string | 'partial')[];
}

interface ComparisonColumn {
  name: string;
  highlighted?: boolean;
}

interface ComparisonTableProps {
  badge?: string;
  title?: string;
  description?: string;
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  variant?: 'default' | 'compact' | 'cards';
}

function ValueCell({ value, highlighted }: { value: boolean | string | 'partial'; highlighted?: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto ${highlighted ? 'bg-accent text-accent-foreground' : 'bg-green-500/20 text-green-500'}`}>
        <Check className="w-4 h-4" />
      </div>
    ) : (
      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mx-auto">
        <X className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  if (value === 'partial') {
    return (
      <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto">
        <Minus className="w-4 h-4 text-yellow-600" />
      </div>
    );
  }

  return (
    <span className={`text-sm font-medium ${highlighted ? 'text-accent' : 'text-foreground'}`}>
      {value}
    </span>
  );
}

export function ComparisonTable({
  badge,
  title,
  description,
  columns,
  rows,
  variant = 'default',
}: ComparisonTableProps) {
  if (variant === 'cards') {
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {columns.map((column, colIndex) => (
              <motion.div
                key={column.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: colIndex * 0.1 }}
                className={`rounded-xl border p-6 ${column.highlighted ? 'border-accent bg-accent/5' : 'border-border bg-card'}`}
              >
                <h3 className={`text-xl font-semibold mb-6 ${column.highlighted ? 'text-accent' : 'text-foreground'}`}>
                  {column.name}
                </h3>
                <div className="space-y-4">
                  {rows.map((row) => (
                    <div key={row.feature} className="flex items-center justify-between">
                      <span className="text-sm text-foreground/80">{row.feature}</span>
                      <ValueCell value={row.values[colIndex]} highlighted={column.highlighted} />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'compact') {
    return (
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {title && (
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                {title}
              </h2>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 font-medium text-muted-foreground">Feature</th>
                    {columns.map((column) => (
                      <th 
                        key={column.name} 
                        className={`text-center py-3 px-4 font-semibold ${column.highlighted ? 'text-accent' : 'text-foreground'}`}
                      >
                        {column.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.feature} className="border-b border-border/50">
                      <td className="py-3 pr-4 text-foreground">{row.feature}</td>
                      {row.values.map((value, i) => (
                        <td key={i} className="text-center py-3 px-4">
                          <ValueCell value={value} highlighted={columns[i]?.highlighted} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default variant
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-x-auto"
        >
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border border-border rounded-xl bg-card">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground w-1/3">
                      Feature
                    </th>
                    {columns.map((column) => (
                      <th 
                        key={column.name} 
                        className={`text-center py-4 px-6 font-semibold ${column.highlighted ? 'bg-accent/10 text-accent' : 'text-foreground'}`}
                      >
                        {column.name}
                        {column.highlighted && (
                          <Badge className="ml-2 bg-accent text-accent-foreground text-xs">
                            Popular
                          </Badge>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((row, rowIndex) => (
                    <motion.tr 
                      key={row.feature}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: rowIndex * 0.03 }}
                      className="hover:bg-secondary/20 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="font-medium text-foreground">{row.feature}</span>
                        {row.description && (
                          <p className="text-xs text-muted-foreground mt-1">{row.description}</p>
                        )}
                      </td>
                      {row.values.map((value, i) => (
                        <td 
                          key={i} 
                          className={`text-center py-4 px-6 ${columns[i]?.highlighted ? 'bg-accent/5' : ''}`}
                        >
                          <ValueCell value={value} highlighted={columns[i]?.highlighted} />
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
