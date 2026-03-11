'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, type LucideIcon } from 'lucide-react';

interface ResourceCategory {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
  featured?: boolean;
  items: string[];
}

interface ResourceCardsProps {
  categories: ResourceCategory[];
}

export function ResourceCards({ categories }: ResourceCardsProps) {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
            Resources
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
            Explore by category
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            Find the resources that match your learning style and goals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, i) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <Link href={category.href}>
                <Card className={`h-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 ${category.featured ? 'border-accent/30 bg-gradient-to-br from-accent/5 via-card/50 to-card/50 hover:border-accent/50' : 'bg-card hover:border-accent/40'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center`}>
                        <category.icon className="w-6 h-6" />
                      </div>
                      {category.featured && (
                        <Badge variant="outline" className="border-accent/50 text-accent text-xs">
                          Popular
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-sm text-foreground/60 mb-4 leading-relaxed">
                      {category.description}
                    </p>

                    {/* Quick links */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {category.items.slice(0, 3).map((item) => (
                        <span
                          key={item}
                          className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground"
                        >
                          {item}
                        </span>
                      ))}
                      {category.items.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                          +{category.items.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center text-sm font-medium text-accent group-hover:underline">
                      Explore
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
