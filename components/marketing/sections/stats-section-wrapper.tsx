'use client';

import { StatsSection } from './stats-section';
import {
  Users,
  Globe,
  Server,
  BarChart3,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface StatData {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  iconKey?: string;
}

interface StatsSectionWrapperProps {
  stats: StatData[];
  variant?: 'default' | 'contained' | 'gradient';
  columns?: number;
  badge?: string;
  title?: string;
  description?: string;
}

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  globe: Globe,
  server: Server,
  chart: BarChart3,
};

export function StatsSectionWrapper({
  stats,
  variant,
  columns,
  badge,
  title,
  description,
}: StatsSectionWrapperProps) {
  const transformedStats = stats.map(stat => ({
    ...stat,
    icon: stat.iconKey ? iconMap[stat.iconKey] : undefined,
  }));

  return (
    <StatsSection
      stats={transformedStats}
      variant={variant}
      columns={columns}
      badge={badge}
      title={title}
      description={description}
    />
  );
}
