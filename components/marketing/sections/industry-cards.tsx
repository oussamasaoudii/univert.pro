'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { getIcon, type IconName } from './icon-map';

interface IndustryCard {
  iconName?: IconName;
  image?: string;
  title: string;
  description: string;
  features?: string[];
  href: string;
  stat?: string;
  statLabel?: string;
}

interface IndustryCardsProps {
  badge?: string;
  title?: string;
  description?: string;
  industries: IndustryCard[];
  variant?: 'cards' | 'featured' | 'horizontal';
}

export function IndustryCards({
  badge,
  title,
  description,
  industries,
  variant = 'cards',
}: IndustryCardsProps) {
  if (variant === 'featured') {
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

          <div className="space-y-6">
            {industries.map((industry, i) => {
              const Icon = industry.iconName ? getIcon(industry.iconName) : null;
              return (
                <motion.div
                  key={industry.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={industry.href} className="group block">
                    <Card className="bg-card hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col lg:flex-row">
                          {/* Image/Visual */}
                          {industry.image ? (
                            <div className="lg:w-1/3 h-48 lg:h-auto relative overflow-hidden">
                              <Image
                                src={industry.image}
                                alt={industry.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          ) : (
                            <div className="lg:w-1/3 h-48 lg:h-auto bg-gradient-to-br from-accent/10 via-accent/5 to-transparent flex items-center justify-center">
                              {Icon && (
                                <Icon className="w-16 h-16 text-accent/50" />
                              )}
                            </div>
                          )}

                        {/* Content */}
                        <div className="flex-1 p-6 lg:p-8 flex flex-col justify-center">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                              <h3 className="text-xl lg:text-2xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                                {industry.title}
                              </h3>
                              <p className="text-foreground/60 leading-relaxed">
                                {industry.description}
                              </p>
                            </div>
                            {industry.stat && (
                              <div className="text-right shrink-0">
                                <p className="text-2xl font-bold text-accent">{industry.stat}</p>
                                <p className="text-xs text-muted-foreground">{industry.statLabel}</p>
                              </div>
                            )}
                          </div>

                          {industry.features && industry.features.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {industry.features.map(feature => (
                                <Badge key={feature} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center text-accent font-medium">
                            Learn more
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'horizontal') {
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

          <div className="grid lg:grid-cols-2 gap-6">
            {industries.map((industry, i) => {
              const Icon = industry.iconName ? getIcon(industry.iconName) : null;
              return (
                <motion.div
                  key={industry.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={industry.href} className="group block h-full">
                    <Card className="h-full bg-card hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {Icon && (
                            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0 group-hover:bg-accent/30 transition-colors">
                              <Icon className="w-6 h-6 text-accent" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                              {industry.title}
                            </h3>
                            <p className="text-foreground/60 text-sm leading-relaxed mb-3">
                              {industry.description}
                            </p>
                            <span className="inline-flex items-center text-accent text-sm font-medium">
                              Explore
                              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
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
          {industries.map((industry, i) => {
            const Icon = industry.iconName ? getIcon(industry.iconName) : null;
            return (
              <motion.div
                key={industry.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Link href={industry.href} className="group block h-full">
                  <Card className="h-full bg-card hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 overflow-hidden">
                    {industry.image && (
                      <div className="h-40 relative overflow-hidden">
                        <Image
                          src={industry.image}
                          alt={industry.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <CardContent className={industry.image ? 'p-6' : 'p-6'}>
                      {Icon && !industry.image && (
                        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                          <Icon className="w-6 h-6 text-accent" />
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                        {industry.title}
                      </h3>
                      <p className="text-foreground/60 text-sm leading-relaxed mb-4">
                        {industry.description}
                      </p>

                      {industry.features && industry.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {industry.features.slice(0, 3).map(feature => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <span className="inline-flex items-center text-accent text-sm font-medium">
                        Learn more
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
