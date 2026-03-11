'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, Quote, type LucideIcon } from 'lucide-react';

interface CaseStudyStat {
  value: string;
  label: string;
}

interface CaseStudy {
  company: string;
  industry: string;
  logo: string;
  icon: LucideIcon;
  title: string;
  description: string;
  quote: string;
  author: {
    name: string;
    title: string;
  };
  stats: CaseStudyStat[];
  href: string;
  featured?: boolean;
}

interface CustomerCaseStudiesProps {
  caseStudies: CaseStudy[];
}

export function CustomerCaseStudies({ caseStudies }: CustomerCaseStudiesProps) {
  const featuredStudies = caseStudies.filter((cs) => cs.featured);
  const regularStudies = caseStudies.filter((cs) => !cs.featured);

  return (
    <section id="case-studies" className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
            Case Studies
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
            Real results from real customers
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            Explore how companies across industries are achieving remarkable results with Ovmon.
          </p>
        </div>

        {/* Featured Case Studies */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {featuredStudies.map((study, i) => (
            <motion.div
              key={study.company}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <Link href={study.href}>
                <Card className="h-full bg-gradient-to-br from-accent/5 via-card/50 to-card/50 border-accent/30 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                  <CardContent className="p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                          <study.icon className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{study.company}</p>
                          <p className="text-sm text-muted-foreground">{study.industry}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-accent/50 text-accent">
                        Featured
                      </Badge>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-accent transition-colors">
                      {study.title}
                    </h3>
                    <p className="text-foreground/60 mb-6 leading-relaxed">
                      {study.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {study.stats.map((stat) => (
                        <div key={stat.label} className="text-center p-3 rounded-lg bg-secondary/30">
                          <p className="text-xl font-bold text-accent">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Quote */}
                    <div className="border-l-2 border-accent/30 pl-4 mb-6">
                      <Quote className="w-4 h-4 text-accent mb-2" />
                      <p className="text-sm text-foreground/80 italic mb-2">&ldquo;{study.quote}&rdquo;</p>
                      <p className="text-xs text-muted-foreground">
                        {study.author.name}, {study.author.title}
                      </p>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center text-sm font-medium text-accent group-hover:underline">
                      Read full story
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Regular Case Studies */}
        <div className="grid md:grid-cols-2 gap-6">
          {regularStudies.map((study, i) => (
            <motion.div
              key={study.company}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <Link href={study.href}>
                <Card className="h-full bg-card hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <study.icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{study.company}</p>
                        <p className="text-xs text-muted-foreground">{study.industry}</p>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                      {study.title}
                    </h3>
                    <p className="text-sm text-foreground/60 mb-4 leading-relaxed">
                      {study.description}
                    </p>

                    {/* Stats */}
                    <div className="flex gap-4 mb-4">
                      {study.stats.slice(0, 2).map((stat) => (
                        <div key={stat.label}>
                          <p className="text-lg font-bold text-accent">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center text-sm font-medium text-accent group-hover:underline">
                      Read story
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
