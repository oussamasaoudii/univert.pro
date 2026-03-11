'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Play, type LucideIcon } from 'lucide-react';

interface FeaturedResource {
  type: string;
  title: string;
  description: string;
  href: string;
  readTime?: string;
  duration?: string;
  icon: LucideIcon;
}

interface FeaturedContentProps {
  resources: FeaturedResource[];
}

export function FeaturedContent({ resources }: FeaturedContentProps) {
  return (
    <section className="py-16 lg:py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
            Get Started
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
            Featured resources
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            Start here to quickly get up and running with Ovmon.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {resources.map((resource, i) => (
            <motion.div
              key={resource.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <Link href={resource.href}>
                <Card className="h-full bg-card hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                  <CardContent className="p-6">
                    {/* Type badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="text-xs capitalize border-border">
                        {resource.type}
                      </Badge>
                      {resource.readTime && (
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {resource.readTime}
                        </span>
                      )}
                      {resource.duration && (
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Play className="w-3 h-3 mr-1" />
                          {resource.duration}
                        </span>
                      )}
                    </div>

                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                      <resource.icon className="w-6 h-6 text-accent" />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-foreground/60 mb-4 leading-relaxed">
                      {resource.description}
                    </p>

                    <div className="flex items-center text-sm font-medium text-accent group-hover:underline">
                      {resource.type === 'video' ? 'Watch now' : 'Read more'}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
