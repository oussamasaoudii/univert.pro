'use client';

import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Globe, Server, Shield, Zap, Database, Code2 } from 'lucide-react';

const architectureLayers = [
  {
    title: "Your Code",
    icon: Code2,
    items: ["Next.js", "React", "Vue", "APIs"],
    color: "bg-accent/20 text-accent",
    position: "top",
  },
  {
    title: "Edge Network",
    icon: Globe,
    items: ["150+ Locations", "Auto Routing", "CDN"],
    color: "bg-accent/30 text-accent",
    position: "middle",
  },
  {
    title: "Compute",
    icon: Server,
    items: ["Functions", "Containers", "Edge Runtime"],
    color: "bg-accent/20 text-accent",
    position: "middle",
  },
  {
    title: "Storage",
    icon: Database,
    items: ["Assets", "KV Store", "Blob Storage"],
    color: "bg-secondary text-foreground",
    position: "middle",
  },
  {
    title: "Security",
    icon: Shield,
    items: ["DDoS", "WAF", "SSL/TLS"],
    color: "bg-secondary text-foreground",
    position: "bottom",
  },
];

export function ProductArchitecture() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
            Architecture
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
            Built on solid foundations
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            A modern architecture designed for performance, reliability, and scale.
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connection lines */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/50 -translate-x-1/2 z-0" />

            {/* Layers */}
            <div className="relative z-10 space-y-6">
              {architectureLayers.map((layer, i) => (
                <motion.div
                  key={layer.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`flex items-center gap-6 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-lg max-w-md ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-12 h-12 rounded-xl ${layer.color} flex items-center justify-center shrink-0`}>
                      <layer.icon className="w-6 h-6" />
                    </div>
                    <div className={i % 2 === 0 ? '' : 'text-right'}>
                      <h3 className="font-semibold text-foreground mb-1">{layer.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {layer.items.map((item) => (
                          <span 
                            key={item} 
                            className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Performance indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-12 grid grid-cols-3 gap-4"
            >
              {[
                { icon: Zap, value: "<50ms", label: "Global latency" },
                { icon: Server, value: "99.99%", label: "Uptime SLA" },
                { icon: Globe, value: "150+", label: "Edge locations" },
              ].map((stat) => (
                <div 
                  key={stat.label}
                  className="text-center p-4 rounded-xl bg-secondary/30 border border-border/50"
                >
                  <stat.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
