import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import type { TrainingRunSummary, RunStatus } from '../types';

interface RunListProps {
  runs: TrainingRunSummary[];
  selectedRunId: string;
  onSelectRun: (id: string) => void;
}

const statusLabel: Record<RunStatus, { text: string; color: string }> = {
  healthy: { text: 'healthy', color: 'text-[#00d294]' },
  diverged: { text: 'diverged', color: 'text-[var(--amber)]' },
  broken: { text: 'broken', color: 'text-[var(--rose)]' },
  irregular: { text: 'irregular', color: 'text-[var(--muted)]' },
};

export const RunList: React.FC<RunListProps> = ({ runs, selectedRunId, onSelectRun }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'healthy' | 'issues'>('all');
  const [sortDesc, setSortDesc] = useState(true);

  const filtered = useMemo(() => {
    return runs
      .filter((r) => {
        const q = search.toLowerCase();
        if (q && !r.name.toLowerCase().includes(q) && !r.id.includes(q)) return false;
        if (filter === 'healthy') return r.status === 'healthy';
        if (filter === 'issues') return r.status !== 'healthy';
        return true;
      })
      .sort((a, b) => sortDesc ? b.totalSteps - a.totalSteps : a.totalSteps - b.totalSteps);
  }, [runs, search, filter, sortDesc]);

  return (
    <aside className="w-full md:w-[280px] lg:w-[300px] flex flex-col bg-[var(--background)] border-r border-[var(--border-subtle)] h-full shrink-0">
      {/* Controls */}
      <div className="p-3 space-y-2 border-b border-[var(--border-subtle)]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--dim)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-[6px] text-[12px] bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--dim)] focus:outline-none focus:border-[var(--accent)]/40 transition-colors"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-0.5 text-[11px]">
            {(['all', 'healthy', 'issues'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-2 py-[3px] rounded-md font-medium capitalize transition-colors cursor-pointer ${
                  filter === f
                    ? 'bg-[var(--surface-raised)] text-[var(--foreground)]'
                    : 'text-[var(--dim)] hover:text-[var(--muted)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSortDesc(!sortDesc)}
            className="text-[var(--dim)] hover:text-[var(--muted)] transition-colors cursor-pointer p-0.5"
            title="Toggle sort"
          >
            {sortDesc ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto" role="listbox">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-[12px] text-[var(--dim)]">No runs found.</div>
        ) : (
          filtered.map((run) => {
            const sel = run.id === selectedRunId;
            const s = statusLabel[run.status];
            const isStress = run.id === 'run-20';

            return (
              <button
                key={run.id}
                type="button"
                onClick={() => onSelectRun(run.id)}
                className={`w-full text-left px-3 py-2.5 border-b border-[var(--border-subtle)] transition-colors cursor-pointer group ${
                  sel ? 'bg-[var(--surface)]' : 'hover:bg-[var(--surface)]/50'
                }`}
                role="option"
                aria-selected={sel}
              >
                {/* Name row */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-[12px] font-medium truncate ${sel ? 'text-[var(--foreground)]' : 'text-[var(--muted)] group-hover:text-[var(--foreground)]'} transition-colors`}>
                    {run.name}
                  </span>
                  <span className={`text-[10px] font-medium ${isStress ? 'text-[var(--accent)]' : s.color} shrink-0`}>
                    {isStress ? '1M' : s.text}
                  </span>
                </div>

                {/* Meta row */}
                <div className="flex items-center justify-between text-[11px] font-[family-name:var(--font-mono)] text-[var(--dim)]">
                  <span>
                    {run.totalSteps >= 1e6 ? '1,000,000' : run.totalSteps.toLocaleString()} steps
                  </span>
                  <span>
                    {run.finalLoss !== null ? run.finalLoss.toFixed(3) : 'NaN'}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
