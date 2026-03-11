'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronRight, ExternalLink, type LucideIcon } from 'lucide-react';

interface Integration {
  name: string;
  description?: string;
  icon?: LucideIcon;
  logo?: string;
  category?: string;
  href?: string;
  featured?: boolean;
}

interface IntegrationGridProps {
  badge?: string;
  title?: string;
  description?: string;
  integrations: Integration[];
  variant?: 'cards' | 'compact' | 'featured';
  showCategories?: boolean;
  ctaText?: string;
  ctaHref?: string;
}

export function IntegrationGrid({
  badge,
  title,
  description,
  integrations,
  variant = 'cards',
  showCategories = false,
  ctaText,
  ctaHref,
}: IntegrationGridProps) {
  const categories = Array.from(new Set(integrations.map(i => i.category).filter(Boolean)));
  const featured = integrations.filter(i => i.featured);
  const regular = integrations.filter(i => !i.featured);

  if (variant === 'featured' && featured.length > 0) {
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

          {/* Featured integrations */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featured.map((integration, i) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Card className="h-full bg-gradient-to-br from-accent/5 via-card to-card border-accent/30 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {integration.logo ? (
                        <Image
                          src={integration.logo}
                          alt={integration.name}
                          width={48}
                          height={48}
                          className="rounded-lg"
                        />
                      ) : integration.icon ? (
                        <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                          <integration.icon className="w-6 h-6 text-accent" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-lg font-bold text-foreground">
                          {integration.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{integration.name}</h3>
                        {integration.category && (
                          <p className="text-xs text-muted-foreground">{integration.category}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="border-accent/50 text-accent text-xs">
                        Featured
                      </Badge>
                    </div>
                    {integration.description && (
                      <p className="text-foreground/60 text-sm mb-4">{integration.description}</p>
                    )}
                    {integration.href && (
                      <Link 
                        href={integration.href}
                        className="inline-flex items-center text-accent text-sm font-medium hover:underline group/link"
                      >
                        View integration
                        <ChevronRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Regular integrations */}
          {regular.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {regular.map((integration, i) => (
                <motion.div
                  key={integration.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="bg-card hover:border-accent/40 transition-all duration-300">
                    <CardContent className="p-4 text-center">
                      {integration.logo ? (
                        <Image
                          src={integration.logo}
                          alt={integration.name}
                          width={40}
                          height={40}
                          className="mx-auto mb-2 rounded"
                        />
                      ) : integration.icon ? (
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-2">
                          <integration.icon className="w-5 h-5 text-foreground" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-2 font-semibold text-foreground">
                          {integration.name.charAt(0)}
                        </div>
                      )}
                      <p className="text-sm font-medium text-foreground truncate">{integration.name}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {ctaText && ctaHref && (
            <div className="text-center mt-10">
              <Button variant="outline" size="lg" asChild>
                <Link href={ctaHref}>
                  {ctaText}
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (variant === 'compact') {
    return (
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          {title && (
            <p className="text-center text-sm text-muted-foreground font-medium uppercase tracking-wider mb-8">
              {title}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            {integrations.map((integration, i) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg hover:border-accent/40 transition-all"
              >
                {integration.logo ? (
                  <Image
                    src={integration.logo}
                    alt={integration.name}
                    width={24}
                    height={24}
                    className="rounded"
                  />
                ) : integration.icon ? (
                  <integration.icon className="w-4 h-4 text-foreground" />
                ) : null}
                <span className="text-sm font-medium text-foreground">{integration.name}</span>
              </motion.div>
            ))}
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

        {showCategories && categories.length > 0 ? (
          <div className="space-y-12">
            {categories.map(category => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-foreground mb-6">{category}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {integrations
                    .filter(i => i.category === category)
                    .map((integration, i) => (
                      <motion.div
                        key={integration.name}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -2 }}
                      >
                        <Card className="h-full bg-card hover:border-accent/40 transition-all duration-300">
                          <CardContent className="p-4 text-center">
                            {integration.logo ? (
                              <Image
                                src={integration.logo}
                                alt={integration.name}
                                width={40}
                                height={40}
                                className="mx-auto mb-3 rounded"
                              />
                            ) : integration.icon ? (
                              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-3">
                                <integration.icon className="w-5 h-5 text-foreground" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-3 font-semibold text-foreground">
                                {integration.name.charAt(0)}
                              </div>
                            )}
                            <p className="text-sm font-medium text-foreground">{integration.name}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {integrations.map((integration, i) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <Card className="h-full bg-card hover:border-accent/40 transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    {integration.logo ? (
                      <Image
                        src={integration.logo}
                        alt={integration.name}
                        width={40}
                        height={40}
                        className="mx-auto mb-3 rounded"
                      />
                    ) : integration.icon ? (
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-3">
                        <integration.icon className="w-5 h-5 text-foreground" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-3 font-semibold text-foreground">
                        {integration.name.charAt(0)}
                      </div>
                    )}
                    <p className="text-sm font-medium text-foreground">{integration.name}</p>
                    {integration.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{integration.description}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {ctaText && ctaHref && (
          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild>
              <Link href={ctaHref}>
                {ctaText}
                <ExternalLink className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
