'use client';

import { BenefitsGrid } from './benefits-grid';
import {
  Zap,
  Users,
  Target,
  Heart,
  Shield,
  Globe,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface BenefitData {
  iconKey?: string;
  title: string;
  description: string;
  href?: string;
}

interface BenefitsGridWrapperProps {
  benefits: BenefitData[];
  variant?: 'cards' | 'list' | 'minimal';
  columns?: 2 | 3 | 4;
  badge?: string;
  title?: string;
  description?: string;
}

const iconMap: Record<string, LucideIcon> = {
  zap: Zap,
  users: Users,
  target: Target,
  heart: Heart,
  shield: Shield,
  globe: Globe,
};

export function BenefitsGridWrapper({
  benefits,
  variant,
  columns,
  badge,
  title,
  description,
}: BenefitsGridWrapperProps) {
  const transformedBenefits = benefits.map(benefit => ({
    ...benefit,
    icon: benefit.iconKey ? iconMap[benefit.iconKey] : undefined,
  }));

  return (
    <BenefitsGrid
      benefits={transformedBenefits}
      variant={variant}
      columns={columns}
      badge={badge}
      title={title}
      description={description}
    />
  );
}
