import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Filter, AlertCircle, CheckCircle2, Flame, AlertTriangle } from 'lucide-react';
import type { TrainingRunSummary, RunStatus } from '../types';

interface RunListProps {
  runs: TrainingRunSummary[];
  selectedRunId: string;
  onSelectRun: (id: string) => void;
}

export const RunList: React.FC<RunListProps> = ({ runs, selectedRunId, onSelectRun }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'healthy' | 'broken' | 'stress'>('all');
  const [sortBy, setSortBy] = useState<'steps_desc' | 'steps_asc' | 'name' | 'id'>('steps_desc');

  const filteredRuns = useMemo(() => {
    return runs
      .filter((run) => {
        const matchesSearch =
          run.name.toLowerCase().includes(search.toLowerCase()) ||
          run.id.toLowerCase().includes(search.toLowerCase()) ||
          run.description.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === 'healthy') return run.status === 'healthy';
        if (filter === 'broken') return run.status === 'broken' || run.status === 'diverged' || run.status === 'irregular';
        if (filter === 'stress') return run.id === 'run-20';
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'steps_desc') return b.totalSteps - a.totalSteps;
        if (sortBy === 'steps_asc') return a.totalSteps - b.totalSteps;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return a.id.localeCompare(b.id);
      });
  }, [runs, search, filter, sortBy]);

  const getStatusBadge = (status: RunStatus, hasSpike: boolean) => {
    if (hasSpike) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-950/80 text-red-300 border border-red-500/40">
          <Flame className="w-3 h-3 text-red-400" /> 1M Spike
        </span>
      );
    }
    switch (status) {
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Healthy
          </span>
        );
      case 'diverged':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> Diverged
          </span>
        );
      case 'broken':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-500/40">
            <AlertCircle className="w-3 h-3 text-rose-400" /> Broken
          </span>
        );
      case 'irregular':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-950/80 text-purple-300 border border-purple-500/40">
            <AlertCircle className="w-3 h-3 text-purple-400" /> Irregular
          </span>
        );
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 flex flex-col bg-[#0f1118] border-r border-[#1e2230] h-full shrink-0">
      {/* Search and Filter Header */}
      <div className="p-3 border-b border-[#1e2230] space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search runs, metrics..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#161822] border border-[#262b3d] rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="grid grid-cols-4 gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`py-1 rounded font-medium transition-colors ${
              filter === 'all' ? 'bg-[#222738] text-white font-semibold' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            All ({runs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('healthy')}
            className={`py-1 rounded font-medium transition-colors ${
              filter === 'healthy' ? 'bg-emerald-950/70 text-emerald-300 font-semibold' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Healthy
          </button>
          <button
            type="button"
            onClick={() => setFilter('broken')}
            className={`py-1 rounded font-medium transition-colors ${
              filter === 'broken' ? 'bg-rose-950/70 text-rose-300 font-semibold' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Issues
          </button>
          <button
            type="button"
            onClick={() => setFilter('stress')}
            className={`py-1 rounded font-medium transition-colors ${
              filter === 'stress' ? 'bg-purple-950/70 text-purple-300 font-semibold' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            1M Stress
          </button>
        </div>

        {/* Sort selector */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
          <span className="flex items-center gap-1 font-mono">
            <Filter className="w-3 h-3" /> {filteredRuns.length} runs
          </span>
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-gray-300 text-[11px] border-none focus:outline-none cursor-pointer"
            >
              <option value="steps_desc" className="bg-[#12141c]">Steps (High &rarr; Low)</option>
              <option value="steps_asc" className="bg-[#12141c]">Steps (Low &rarr; High)</option>
              <option value="name" className="bg-[#12141c]">Name (A &rarr; Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Run List Scroll Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1e2230]/60" role="listbox" tabIndex={0} aria-label="Training runs">
        {filteredRuns.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            No training runs match your search.
          </div>
        ) : (
          filteredRuns.map((run) => {
            const isSelected = run.id === selectedRunId;
            const hasSpike = run.anomalies.some((a) => a.type === 'spike');

            return (
              <button
                type="button"
                key={run.id}
                onClick={() => onSelectRun(run.id)}
                className={`w-full text-left p-3 transition-colors flex flex-col gap-1.5 focus:outline-none ${
                  isSelected
                    ? 'bg-[#1b2030] border-l-4 border-l-cyan-400 shadow-inner'
                    : 'hover:bg-[#141722]'
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-xs font-semibold tracking-tight truncate ${isSelected ? 'text-cyan-300' : 'text-gray-200'}`}>
                    {run.name}
                  </span>
                  {getStatusBadge(run.status, hasSpike)}
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                  <span>{run.totalSteps.toLocaleString()} steps</span>
                  <span>
                    loss:{' '}
                    <strong className="text-gray-200">
                      {run.finalLoss !== null ? run.finalLoss.toFixed(3) : 'NaN'}
                    </strong>
                  </span>
                </div>

                {run.anomalies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {run.anomalies.map((a, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.2 rounded bg-[#251f28] text-amber-300/90 border border-amber-500/20"
                      >
                        {a.type.replace('_', ' ')}: {a.count}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
