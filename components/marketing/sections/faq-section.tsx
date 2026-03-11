'use client';

import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQSectionProps {
  badge?: string;
  title?: string;
  description?: string;
  faqs: FAQItem[];
  showSearch?: boolean;
  showCategories?: boolean;
  variant?: 'default' | 'minimal' | 'cards';
}

export function FAQSection({
  badge,
  title = 'Frequently Asked Questions',
  description,
  faqs,
  showSearch = false,
  showCategories = false,
  variant = 'default',
}: FAQSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(faqs.map(faq => faq.category).filter(Boolean)));

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (variant === 'minimal') {
    return (
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {title && (
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-8 text-center">
                {title}
              </h2>
            )}
            <Accordion type="single" collapsible className="space-y-3">
              {filteredFaqs.map((faq, i) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <AccordionItem 
                    value={faq.question} 
                    className="border-none bg-secondary/30 rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/70 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'cards') {
    return (
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            {badge && (
              <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                {badge}
              </Badge>
            )}
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              {title}
            </h2>
            {description && (
              <p className="text-foreground/60 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {filteredFaqs.map((faq, i) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border/50 rounded-xl p-6"
              >
                <h3 className="font-semibold text-foreground mb-3">{faq.question}</h3>
                <p className="text-foreground/70 text-sm leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Default variant
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          {badge && (
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              {badge}
            </Badge>
          )}
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
            {title}
          </h2>
          {description && (
            <p className="text-foreground/60 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Search and filters */}
          {(showSearch || (showCategories && categories.length > 0)) && (
            <div className="mb-8 space-y-4">
              {showSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
              {showCategories && categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      !selectedCategory 
                        ? 'bg-accent text-accent-foreground' 
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    All
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category!)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        selectedCategory === category 
                          ? 'bg-accent text-accent-foreground' 
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <Accordion type="single" collapsible className="space-y-4">
            {filteredFaqs.map((faq, i) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <AccordionItem 
                  value={faq.question} 
                  className="border border-border/50 bg-card rounded-xl px-6 data-[state=open]:border-accent/40"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground/70 pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>

          {filteredFaqs.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No questions found matching your search.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
