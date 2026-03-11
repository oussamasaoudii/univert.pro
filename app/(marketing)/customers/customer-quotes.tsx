'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

interface CustomerQuote {
  quote: string;
  author: {
    name: string;
    title: string;
    company: string;
  };
  rating: number;
}

interface CustomerQuotesProps {
  quotes: CustomerQuote[];
}

export function CustomerQuotes({ quotes }: CustomerQuotesProps) {
  return (
    <section className="py-16 lg:py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
            Testimonials
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
            What our customers say
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what developers and teams have to say.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {quotes.map((item, i) => (
            <motion.div
              key={item.author.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full bg-card hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                <CardContent className="p-6">
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(item.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="relative mb-6">
                    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-accent/20" />
                    <p className="text-foreground/80 leading-relaxed pl-4">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-foreground">
                      {item.author.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.author.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.author.title} at {item.author.company}
                      </p>
                    </div>
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
