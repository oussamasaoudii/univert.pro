'use client';

import { CheckCircle2, Loader2, Circle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProvisioningStep as ProvisioningStepType } from '@/lib/types';

interface DeploymentTimelineProps {
  steps: Array<{
    step: ProvisioningStepType;
    status: 'completed' | 'in_progress' | 'pending' | 'failed';
    timestamp?: string;
    duration?: string;
  }>;
  stepConfig: Record<ProvisioningStepType, { label: string; icon: any }>;
  compact?: boolean;
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    lineColor: 'bg-emerald-500',
    pulseColor: 'ring-emerald-500/20',
  },
  in_progress: {
    icon: Loader2,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    lineColor: 'bg-blue-500',
    pulseColor: 'ring-blue-500/30',
  },
  pending: {
    icon: Circle,
    color: 'text-zinc-500',
    bgColor: 'bg-zinc-800/50',
    borderColor: 'border-zinc-700',
    lineColor: 'bg-zinc-700',
    pulseColor: 'ring-zinc-500/20',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    lineColor: 'bg-red-500',
    pulseColor: 'ring-red-500/20',
  },
};

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatDuration(start: string, end?: string) {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const diff = endDate.getTime() - startDate.getTime();
  
  if (diff < 1000) return `${diff}ms`;
  if (diff < 60000) return `${(diff / 1000).toFixed(1)}s`;
  return `${Math.floor(diff / 60000)}m ${Math.floor((diff % 60000) / 1000)}s`;
}

export function DeploymentTimeline({ steps, stepConfig, compact = false }: DeploymentTimelineProps) {
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const currentStepIndex = steps.findIndex(s => s.status === 'in_progress');

  return (
    <div className="relative">
      {/* Progress Summary */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-bold text-foreground">{completedCount}</span>
            <span className="text-sm text-muted-foreground">/ {steps.length}</span>
          </div>
          <span className="text-sm text-muted-foreground">steps completed</span>
        </div>
        {currentStepIndex >= 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            <span className="text-xs font-medium text-blue-400">
              {stepConfig[steps[currentStepIndex].step]?.label}
            </span>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className={cn("space-y-0", compact ? "space-y-0" : "space-y-1")}>
        {steps.map((step, index) => {
          const config = stepConfig[step.step];
          const status = statusConfig[step.status];
          const StatusIcon = status.icon;
          const isLast = index === steps.length - 1;
          const nextStep = steps[index + 1];

          return (
            <div key={step.step} className="relative">
              <div className={cn(
                "flex gap-4 py-3 rounded-lg transition-all duration-200",
                step.status === 'in_progress' && "bg-blue-500/5 -mx-3 px-3",
                step.status === 'failed' && "bg-red-500/5 -mx-3 px-3"
              )}>
                {/* Timeline Column */}
                <div className="flex flex-col items-center">
                  {/* Step Indicator */}
                  <div className={cn(
                    "relative w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-300",
                    status.bgColor,
                    status.borderColor,
                    step.status === 'in_progress' && "ring-4 ring-blue-500/20"
                  )}>
                    <StatusIcon
                      className={cn(
                        "w-5 h-5 transition-all",
                        status.color,
                        step.status === 'in_progress' && "animate-spin"
                      )}
                    />
                    
                    {/* Animated ring for in_progress */}
                    {step.status === 'in_progress' && (
                      <span className="absolute inset-0 rounded-xl animate-ping opacity-30 bg-blue-500" />
                    )}
                  </div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div className={cn(
                      "w-0.5 flex-1 mt-2 min-h-[24px] rounded-full transition-all duration-500",
                      step.status === 'completed' ? 'bg-emerald-500' : 
                      step.status === 'in_progress' ? 'bg-gradient-to-b from-blue-500 to-zinc-700' :
                      'bg-zinc-800'
                    )} />
                  )}
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0 pt-1.5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={cn(
                          "font-semibold text-sm",
                          step.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
                        )}>
                          {config?.label}
                        </p>
                        {step.status === 'in_progress' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-semibold uppercase tracking-wider">
                            Running
                          </span>
                        )}
                        {step.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-semibold uppercase tracking-wider">
                            Failed
                          </span>
                        )}
                      </div>
                      
                      {/* Timestamp */}
                      {step.timestamp && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span className="font-mono">{formatTimestamp(step.timestamp)}</span>
                          {step.duration && (
                            <>
                              <span className="text-zinc-600">•</span>
                              <span className="text-zinc-500">{step.duration}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Step Number */}
                    <span className={cn(
                      "text-xs font-mono px-2 py-1 rounded",
                      step.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                      step.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                      step.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                      'bg-zinc-800 text-zinc-500'
                    )}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
