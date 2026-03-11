'use client';

import { motion, useInView, animate } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { type LucideIcon } from 'lucide-react';

interface Stat {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon?: LucideIcon;
  iconKey?: string;
}

interface StatsSectionProps {
  stats: Stat[];
  variant?: 'default' | 'contained' | 'minimal';
  columns?: 2 | 3 | 4;
}

function AnimatedCounter({ 
  value, 
  suffix = '', 
  prefix = '' 
}: { 
  value: number; 
  suffix?: string; 
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (inView) {
      const controls = animate(0, value, {
        duration: 2,
        ease: 'easeOut',
        onUpdate: (v) => setDisplayValue(Math.round(v * 100) / 100),
      });
      return () => controls.stop();
    }
  }, [inView, value]);

  const formatted = Number.isInteger(value) 
    ? displayValue.toLocaleString() 
    : displayValue.toFixed(2);

  return (
    <span ref={ref}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

export function StatsSection({
  stats,
  variant = 'default',
  columns = 4,
}: StatsSectionProps) {
  const colsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  }[columns];

  const content = (
    <div className={`grid ${colsClass} gap-8 lg:gap-12`}>
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -2 }}
          className="text-center group"
        >
          {stat.icon && (
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 mb-4 group-hover:bg-accent/20 group-hover:scale-105 transition-all">
              <stat.icon className="w-7 h-7 text-accent" />
            </div>
          )}
          <p className="text-3xl lg:text-4xl font-bold text-foreground mb-1">
            <AnimatedCounter 
              value={stat.value} 
              suffix={stat.suffix} 
              prefix={stat.prefix} 
            />
          </p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );

  if (variant === 'contained') {
    return (
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="bg-secondary/30 border border-border/40 rounded-2xl p-8 lg:p-12">
            {content}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'minimal') {
    return (
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          {content}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-20">
      <div className="container mx-auto px-4">
        {content}
      </div>
    </section>
  );
}

// Animated section wrapper - useful for other components
export function AnimatedSection({ 
  children, 
  className = '',
  delay = 0
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
