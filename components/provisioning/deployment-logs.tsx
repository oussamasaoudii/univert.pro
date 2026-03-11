'use client';

import { useState, useRef, useEffect } from 'react';
import { Copy, Download, Search, ChevronDown, Terminal, Pause, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error' | 'debug';
  message: string;
  source?: string;
}

interface DeploymentLogsProps {
  logs: LogEntry[];
  isLive?: boolean;
  deploymentId?: string;
}

const levelStyles = {
  info: { color: 'text-blue-400', prefix: 'INFO', bg: 'bg-blue-500/10' },
  success: { color: 'text-emerald-400', prefix: 'OK', bg: 'bg-emerald-500/10' },
  warning: { color: 'text-amber-400', prefix: 'WARN', bg: 'bg-amber-500/10' },
  error: { color: 'text-red-400', prefix: 'ERR', bg: 'bg-red-500/10' },
  debug: { color: 'text-zinc-500', prefix: 'DBG', bg: 'bg-zinc-500/10' },
};

export function DeploymentLogs({ logs, isLive = false, deploymentId }: DeploymentLogsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(
    new Set(['info', 'success', 'warning', 'error'])
  );
  const [isPaused, setIsPaused] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevels.has(log.level);
    return matchesSearch && matchesLevel;
  });

  useEffect(() => {
    if (isLive && !isPaused && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs.length, isLive, isPaused]);

  const handleToggleLevel = (level: string) => {
    const newLevels = new Set(selectedLevels);
    if (newLevels.has(level)) {
      newLevels.delete(level);
    } else {
      newLevels.add(level);
    }
    setSelectedLevels(newLevels);
  };

  const copyLogs = () => {
    const logText = filteredLogs
      .map((log) => `${log.timestamp} [${log.level.toUpperCase().padEnd(4)}] ${log.message}`)
      .join('\n');
    navigator.clipboard.writeText(logText);
  };

  const downloadLogs = () => {
    const logText = filteredLogs
      .map((log) => `${log.timestamp} [${log.level.toUpperCase().padEnd(4)}] ${log.message}`)
      .join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deployment-${deploymentId || 'logs'}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col">
      {/* Terminal Window */}
      <div className="rounded-lg border border-border bg-[#0a0a0a] overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="flex items-center justify-between h-10 px-4 bg-[#1a1a1a] border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Terminal className="w-3.5 h-3.5" />
              <span className="font-mono">deployment-logs</span>
              {deploymentId && (
                <span className="text-zinc-600 font-mono">/{deploymentId.slice(0, 8)}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isLive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
                className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            >
              <Search className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyLogs}
              className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadLogs}
              className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            >
              <Download className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Search Bar (Collapsible) */}
        {showSearch && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#111] border-b border-border/30">
            <Search className="w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 outline-none font-mono"
              autoFocus
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 gap-1">
                  Filter
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-zinc-800">
                {Object.keys(levelStyles).map((level) => (
                  <DropdownMenuCheckboxItem
                    key={level}
                    checked={selectedLevels.has(level)}
                    onCheckedChange={() => handleToggleLevel(level)}
                    className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 capitalize text-xs"
                  >
                    {level}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowSearch(false); setSearchQuery(''); }}
              className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {/* Live Indicator */}
        {isLive && !isPaused && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/5 border-b border-emerald-500/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-medium text-emerald-400 tracking-wide">LIVE</span>
          </div>
        )}

        {/* Logs Content */}
        <div 
          ref={containerRef}
          className="h-[400px] overflow-y-auto font-mono text-[13px] leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
        >
          {filteredLogs.length > 0 ? (
            <div className="py-2">
              {filteredLogs.map((log, index) => {
                const style = levelStyles[log.level];
                return (
                  <div
                    key={index}
                    className={cn(
                      "group flex items-start gap-0 px-4 py-1 hover:bg-white/[0.02] transition-colors",
                      log.level === 'error' && 'bg-red-500/[0.03]'
                    )}
                  >
                    {/* Line Number */}
                    <span className="w-10 flex-shrink-0 text-zinc-600 text-right pr-4 select-none text-xs tabular-nums">
                      {index + 1}
                    </span>

                    {/* Timestamp */}
                    <span className="w-24 flex-shrink-0 text-zinc-500 text-xs">
                      {log.timestamp.split(' ')[1] || log.timestamp}
                    </span>

                    {/* Level Badge */}
                    <span className={cn(
                      "w-12 flex-shrink-0 text-[10px] font-bold tracking-wider",
                      style.color
                    )}>
                      {style.prefix}
                    </span>

                    {/* Source (optional) */}
                    {log.source && (
                      <span className="text-zinc-600 mr-2 text-xs">
                        [{log.source}]
                      </span>
                    )}

                    {/* Message */}
                    <span className={cn(
                      "flex-1 text-zinc-300 break-all",
                      log.level === 'error' && 'text-red-300',
                      log.level === 'success' && 'text-emerald-300',
                      log.level === 'warning' && 'text-amber-300',
                      log.level === 'debug' && 'text-zinc-500'
                    )}>
                      {log.message}
                    </span>
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
              No logs match your filters
            </div>
          )}
        </div>

        {/* Terminal Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#111] border-t border-border/30 text-[11px] text-zinc-500">
          <div className="flex items-center gap-4">
            <span>{filteredLogs.length} lines</span>
            {searchQuery && <span>filtered by "{searchQuery}"</span>}
          </div>
          <div className="flex items-center gap-3">
            {Object.entries(levelStyles).map(([level, style]) => {
              const count = logs.filter(l => l.level === level).length;
              if (count === 0) return null;
              return (
                <span key={level} className={cn("flex items-center gap-1", style.color)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", style.bg, style.color.replace('text-', 'bg-'))} />
                  {count}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
