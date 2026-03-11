'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface Logo {
  name: string;
  src?: string;
  className?: string;
}

interface LogoCloudProps {
  title?: string;
  description?: string;
  logos: Logo[];
  variant?: 'default' | 'minimal' | 'marquee';
}

export function LogoCloud({
  title,
  description,
  logos,
  variant = 'default',
}: LogoCloudProps) {
  if (variant === 'marquee') {
    return (
      <section className="py-12 lg:py-16 overflow-hidden">
        <div className="container mx-auto px-4 mb-8">
          {title && (
            <p className="text-center text-sm text-muted-foreground mb-6">{title}</p>
          )}
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: '-50%' }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="flex gap-12 items-center"
          >
            {[...logos, ...logos].map((logo, i) => (
              <div
                key={`${logo.name}-${i}`}
                className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
              >
                {logo.src ? (
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    width={120}
                    height={40}
                    className={`h-8 w-auto object-contain ${logo.className || ''}`}
                  />
                ) : (
                  <div className="h-8 px-6 flex items-center justify-center bg-secondary/50 rounded-lg text-sm font-medium text-muted-foreground">
                    {logo.name}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    );
  }

  if (variant === 'minimal') {
    return (
      <section className="py-8 lg:py-12 border-y border-border/30">
        <div className="container mx-auto px-4">
          {title && (
            <p className="text-center text-sm text-muted-foreground mb-6">{title}</p>
          )}
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
            {logos.map((logo, i) => (
              <motion.div
                key={logo.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
              >
                {logo.src ? (
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    width={120}
                    height={40}
                    className={`h-8 w-auto object-contain ${logo.className || ''}`}
                  />
                ) : (
                  <div className="h-8 px-4 flex items-center justify-center text-sm font-medium text-muted-foreground">
                    {logo.name}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Default variant
  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          {title && (
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-2">
              {title}
            </p>
          )}
          {description && (
            <h2 className="text-xl lg:text-2xl font-semibold text-foreground">
              {description}
            </h2>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
          {logos.map((logo, i) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex justify-center opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
            >
              {logo.src ? (
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={140}
                  height={48}
                  className={`h-10 w-auto object-contain ${logo.className || ''}`}
                />
              ) : (
                <div className="h-10 px-4 flex items-center justify-center bg-secondary/50 rounded-lg text-sm font-medium text-muted-foreground">
                  {logo.name}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
