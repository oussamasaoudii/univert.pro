'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { ReactNode } from 'react';
import { getIcon, type IconName } from './icon-map';

interface HeroAction {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'outline';
  iconName?: IconName;
}

interface HeroSectionProps {
  badge?: {
    text: string;
    iconName?: IconName;
  };
  title: string;
  titleHighlight?: string;
  description: string;
  actions?: HeroAction[];
  socialProof?: ReactNode;
  visual?: ReactNode;
  variant?: 'default' | 'centered' | 'minimal';
  backgroundVariant?: 'gradient' | 'grid' | 'minimal';
}

export function HeroSection({
  badge,
  title,
  titleHighlight,
  description,
  actions = [],
  socialProof,
  visual,
  variant = 'default',
  backgroundVariant = 'gradient',
}: HeroSectionProps) {
  const isCentered = variant === 'centered';
  const isMinimal = variant === 'minimal';

  return (
    <section className="relative min-h-[85vh] flex items-center pt-20 pb-12 lg:pt-24 lg:pb-16">
      {/* Background layers */}
      {backgroundVariant === 'gradient' && (
        <>
          <div className="absolute inset-0 bg-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,212,191,0.15),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(45,212,191,0.05),transparent_50%)]" />
        </>
      )}

      {backgroundVariant === 'grid' && (
        <>
          <div className="absolute inset-0 bg-background" />
          <div 
            className="absolute inset-0 opacity-[0.02]" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </>
      )}

      <div className="container mx-auto px-4 relative z-10">
        <div className={`${isCentered ? 'max-w-4xl mx-auto text-center' : 'grid lg:grid-cols-2 gap-12 lg:gap-8 items-center'}`}>
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: isCentered ? 0 : -30, y: isCentered ? 20 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={isCentered ? '' : 'max-w-xl'}
          >
            {badge && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge variant="outline" className="mb-6 border-accent/50 text-accent px-4 py-1.5 text-sm font-medium">
                  {badge.iconName && (() => {
                    const BadgeIcon = getIcon(badge.iconName);
                    return BadgeIcon ? <BadgeIcon className="w-3.5 h-3.5 mr-2" /> : null;
                  })()}
                  {badge.text}
                </Badge>
              </motion.div>
            )}
            
            <h1 className={`text-4xl md:text-5xl ${isMinimal ? '' : 'lg:text-6xl'} font-bold text-foreground mb-6 leading-[1.1] tracking-tight text-balance`}>
              {title}
              {titleHighlight && (
                <>
                  {' '}
                  <span className="text-accent">{titleHighlight}</span>
                </>
              )}
            </h1>
            
            <p className="text-lg text-foreground/70 mb-8 leading-relaxed">
              {description}
            </p>
            
            {actions.length > 0 && (
              <div className={`flex ${isCentered ? 'justify-center' : ''} flex-col sm:flex-row gap-4 mb-8`}>
                {actions.map((action, index) => {
                  const isPrimary = action.variant === 'primary' || (index === 0 && !action.variant);
                  const ActionIcon = action.iconName ? getIcon(action.iconName) : (isPrimary ? ArrowRight : Play);

                  if (isPrimary) {
                    return (
                      <Button 
                        key={action.href}
                        size="lg" 
                        className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 px-6 text-base font-medium shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all" 
                        asChild
                      >
                        <Link href={action.href}>
                          {action.label}
                          {ActionIcon && <ActionIcon className="ml-2 h-4 w-4" />}
                        </Link>
                      </Button>
                    );
                  }

                  return (
                    <Button 
                      key={action.href}
                      size="lg" 
                      variant="outline" 
                      className="h-12 px-6 text-base group hover:border-accent/50 transition-colors" 
                      asChild
                    >
                      <Link href={action.href}>
                        {ActionIcon && <ActionIcon className="mr-2 h-4 w-4 group-hover:text-accent transition-colors" />}
                        {action.label}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            )}

            {socialProof}
          </motion.div>

          {/* Visual */}
          {visual && !isCentered && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="relative lg:pl-8"
            >
              {visual}
            </motion.div>
          )}
        </div>

        {/* Centered visual below content */}
        {visual && isCentered && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="mt-12"
          >
            {visual}
          </motion.div>
        )}
      </div>
    </section>
  );
}
