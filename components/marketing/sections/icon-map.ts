import {
  Globe,
  Zap,
  Shield,
  Clock,
  Server,
  BarChart3,
  Lock,
  Layers,
  Cpu,
  Database,
  RefreshCw,
  Headphones,
  Sparkles,
  Workflow,
  Settings2,
  MonitorSmartphone,
  Code2,
  Rocket,
  ArrowRight,
  Play,
  Check,
  ChevronRight,
  type LucideIcon
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  Globe,
  Zap,
  Shield,
  Clock,
  Server,
  BarChart3,
  Lock,
  Layers,
  Cpu,
  Database,
  RefreshCw,
  Headphones,
  Sparkles,
  Workflow,
  Settings2,
  MonitorSmartphone,
  Code2,
  Rocket,
  ArrowRight,
  Play,
  Check,
  ChevronRight,
};

export type IconName = keyof typeof iconMap;

export function getIcon(name: string): LucideIcon | undefined {
  return iconMap[name];
}
