'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: {
    name: string;
    title: string;
    company?: string;
    avatar?: string;
  };
  rating?: number;
  featured?: boolean;
}

interface TestimonialSectionProps {
  badge?: string;
  title?: string;
  description?: string;
  testimonials: Testimonial[];
  variant?: 'cards' | 'featured' | 'minimal';
}

export function TestimonialSection({
  badge,
  title,
  description,
  testimonials,
  variant = 'cards',
}: TestimonialSectionProps) {
  if (variant === 'featured' && testimonials[0]) {
    const featured = testimonials[0];
    const others = testimonials.slice(1);

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

          {/* Featured testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-br from-accent/5 via-card to-card border-accent/30">
              <CardContent className="p-8 lg:p-12">
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <Quote className="w-10 h-10 text-accent/40 mb-4" />
                    <blockquote className="text-xl lg:text-2xl text-foreground font-medium leading-relaxed mb-6">
                      &ldquo;{featured.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-4">
                      {featured.author.avatar ? (
                        <Image
                          src={featured.author.avatar}
                          alt={featured.author.name}
                          width={56}
                          height={56}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-lg">
                          {featured.author.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground">{featured.author.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {featured.author.title}
                          {featured.author.company && `, ${featured.author.company}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  {featured.rating && (
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < featured.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-border'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Other testimonials */}
          {others.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {others.map((testimonial, i) => (
                <motion.div
                  key={testimonial.author.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full bg-card hover:border-accent/40 transition-colors">
                    <CardContent className="p-6">
                      {testimonial.rating && (
                        <div className="flex gap-1 mb-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < testimonial.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-border'}`}
                            />
                          ))}
                        </div>
                      )}
                      <blockquote className="text-foreground/80 mb-6 leading-relaxed">
                        &ldquo;{testimonial.quote}&rdquo;
                      </blockquote>
                      <div className="flex items-center gap-3">
                        {testimonial.author.avatar ? (
                          <Image
                            src={testimonial.author.avatar}
                            alt={testimonial.author.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground font-medium">
                            {testimonial.author.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground text-sm">{testimonial.author.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {testimonial.author.title}
                            {testimonial.author.company && `, ${testimonial.author.company}`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (variant === 'minimal') {
    return (
      <section className="py-12 lg:py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Quote className="w-8 h-8 text-accent/40 mx-auto mb-4" />
            <motion.blockquote
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-lg lg:text-xl text-foreground font-medium leading-relaxed mb-6"
            >
              &ldquo;{testimonials[0]?.quote}&rdquo;
            </motion.blockquote>
            {testimonials[0] && (
              <div className="flex items-center justify-center gap-3">
                {testimonials[0].author.avatar ? (
                  <Image
                    src={testimonials[0].author.avatar}
                    alt={testimonials[0].author.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-medium">
                    {testimonials[0].author.name.charAt(0)}
                  </div>
                )}
                <div className="text-left">
                  <p className="font-medium text-foreground text-sm">{testimonials[0].author.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonials[0].author.title}
                    {testimonials[0].author.company && `, ${testimonials[0].author.company}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Default cards variant
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
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.author.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full bg-card hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                <CardContent className="p-6">
                  {testimonial.rating && (
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < testimonial.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-border'}`}
                        />
                      ))}
                    </div>
                  )}
                  <blockquote className="text-foreground/80 mb-6 leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3">
                    {testimonial.author.avatar ? (
                      <Image
                        src={testimonial.author.avatar}
                        alt={testimonial.author.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground font-medium">
                        {testimonial.author.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground text-sm">{testimonial.author.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.author.title}
                        {testimonial.author.company && `, ${testimonial.author.company}`}
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
