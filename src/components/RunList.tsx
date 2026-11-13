import { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2,
  Flame,
  AlertTriangle,
  TrendingDown,
  Zap,
} from 'lucide-react';
import type { TrainingRunSummary, RunStatus } from '../types';

interface RunListProps {
  runs: TrainingRunSummary[];
  selectedRunId: string;
  onSelectRun: (id: string) => void;
}

const STATUS_CONFIG: Record<RunStatus, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: typeof CheckCircle2;
}> = {
  healthy: {
    label: 'Healthy',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
  },
  diverged: {
    label: 'Diverged',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: TrendingDown,
  },
  broken: {
    label: 'Broken',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    icon: AlertCircle,
  },
  irregular: {
    label: 'Irregular',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    icon: AlertTriangle,
  },
};

export const RunList: React.FC<RunListProps> = ({
  runs,
  selectedRunId,
  onSelectRun,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'healthy' | 'issues' | 'stress'>('all');
  const [sortBy, setSortBy] = useState<'steps_desc' | 'steps_asc' | 'name'>('steps_desc');

  const filteredRuns = useMemo(() => {
    return runs
      .filter((run) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          run.name.toLowerCase().includes(q) ||
          run.id.includes(q) ||
          run.description.toLowerCase().includes(q);
        if (!matchSearch) return false;

        if (filter === 'healthy') return run.status === 'healthy';
        if (filter === 'issues') return run.status !== 'healthy';
        if (filter === 'stress') return run.id === 'run-20';
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'steps_desc') return b.totalSteps - a.totalSteps;
        if (sortBy === 'steps_asc') return a.totalSteps - b.totalSteps;
        return a.name.localeCompare(b.name);
      });
  }, [runs, search, filter, sortBy]);

  const filterCounts = useMemo(() => {
    return {
      all: runs.length,
      healthy: runs.filter((r) => r.status === 'healthy').length,
      issues: runs.filter((r) => r.status !== 'healthy').length,
      stress: 1,
    };
  }, [runs]);

  return (
    <aside className="w-full md:w-[300px] lg:w-[330px] flex flex-col bg-[var(--bg-base)] border-r border-[var(--border-subtle)] h-full shrink-0 overflow-hidden">
      {/* Search Area */}
      <div className="p-3 space-y-2.5 border-b border-[var(--border-subtle)]">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search runs..."
            className="w-full pl-9 pr-3 py-[7px] text-[12px] bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-primary)]/40 focus:ring-1 focus:ring-[var(--accent-primary)]/20 transition-all"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-1">
          {[
            { key: 'all' as const, label: 'All' },
            { key: 'healthy' as const, label: 'Healthy' },
            { key: 'issues' as const, label: 'Issues' },
            { key: 'stress' as const, label: '1M' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`flex-1 py-[5px] rounded-lg text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                filter === key
                  ? key === 'healthy'
                    ? 'bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-900/20'
                    : key === 'issues'
                    ? 'bg-rose-500/15 text-rose-400 shadow-sm shadow-rose-900/20'
                    : key === 'stress'
                    ? 'bg-violet-500/15 text-violet-400 shadow-sm shadow-violet-900/20'
                    : 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] shadow-sm shadow-blue-900/20'
                  : 'text-[var(--text-dim)] hover:text-[var(--text-muted)] hover:bg-[var(--bg-raised)]'
              }`}
            >
              {label}
              <span className="ml-1 opacity-60">{filterCounts[key]}</span>
            </button>
          ))}
        </div>

        {/* Sort Bar */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[var(--text-dim)] font-mono">
            {filteredRuns.length} run{filteredRuns.length !== 1 && 's'}
          </span>
          <div className="flex items-center gap-1 text-[var(--text-dim)]">
            <ArrowUpDown className="w-3 h-3" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-transparent text-[var(--text-muted)] text-[11px] border-none focus:outline-none cursor-pointer"
            >
              <option value="steps_desc" className="bg-[var(--bg-raised)]">Steps ↓</option>
              <option value="steps_asc" className="bg-[var(--bg-raised)]">Steps ↑</option>
              <option value="name" className="bg-[var(--bg-raised)]">Name A→Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Run Cards Scroll */}
      <div className="flex-1 overflow-y-auto" role="listbox" aria-label="Training runs">
        {filteredRuns.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6">
            <Search className="w-8 h-8 text-[var(--text-dim)] opacity-40" />
            <p className="text-[12px] text-[var(--text-dim)] text-center">
              No runs match your search.
            </p>
          </div>
        ) : (
          <div className="p-1.5 space-y-1">
            {filteredRuns.map((run) => {
              const isSelected = run.id === selectedRunId;
              const hasSpike = run.anomalies.some((a) => a.type === 'spike');
              const cfg = STATUS_CONFIG[run.status];
              const StatusIcon = hasSpike ? Flame : cfg.icon;

              return (
                <button
                  key={run.id}
                  type="button"
                  onClick={() => onSelectRun(run.id)}
                  className={`w-full text-left rounded-xl p-3 transition-all duration-200 flex flex-col gap-2 focus:outline-none cursor-pointer group ${
                    isSelected
                      ? 'bg-[var(--accent-primary)]/8 border border-[var(--accent-primary)]/25 shadow-lg shadow-blue-900/15'
                      : 'border border-transparent hover:bg-[var(--bg-raised)] hover:border-[var(--border-subtle)]'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  {/* Row 1: Name + Status */}
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <span className={`text-[12px] font-semibold truncate leading-tight transition-colors ${
                      isSelected ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)] group-hover:text-[var(--text-primary)]'
                    }`}>
                      {run.name}
                    </span>
                    <span className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                      hasSpike ? 'bg-rose-500/12 text-rose-400 border border-rose-500/20' : `${cfg.bg} ${cfg.color} border ${cfg.border}`
                    }`}>
                      <StatusIcon className="w-3 h-3" />
                      {hasSpike ? '1M Spike' : cfg.label}
                    </span>
                  </div>

                  {/* Row 2: Metrics */}
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[var(--text-dim)]">
                      {run.totalSteps >= 1000000
                        ? '1M steps'
                        : run.totalSteps >= 1000
                        ? `${(run.totalSteps / 1000).toFixed(0)}k steps`
                        : `${run.totalSteps} steps`}
                    </span>
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <Zap className="w-3 h-3 text-[var(--text-dim)]" />
                      <span>
                        {run.finalLoss !== null ? run.finalLoss.toFixed(3) : (
                          <span className="text-rose-400">NaN</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Anomaly Tags */}
                  {run.anomalies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {run.anomalies.map((a, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] px-1.5 py-[1px] rounded-md bg-[var(--bg-surface)] text-amber-400/80 border border-amber-500/10 font-medium"
                        >
                          {a.type.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
