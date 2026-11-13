import React from 'react';
import type { TrainingRunDetails } from '../types';
import { Chart } from './Chart';
import {
  Activity,
  ShieldAlert,
  Zap,
  Gauge,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Bug,
} from 'lucide-react';

interface RunDetailsProps {
  run: TrainingRunDetails;
  isLoading: boolean;
}

export const RunDetails: React.FC<RunDetailsProps> = ({ run, isLoading }) => {
  if (isLoading) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-12 gap-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-[var(--border-subtle)]" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-[var(--accent-primary)] animate-spin" />
        </div>
        <div className="text-center space-y-1.5">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Loading Telemetry</p>
          <p className="text-[11px] text-[var(--text-dim)] font-mono">{run.name}</p>
          <p className="text-[11px] text-[var(--text-dim)]">Executing Min-Max downsampling...</p>
        </div>
      </main>
    );
  }

  const [steps, losses, lrs, gradNorms] = run.data;
  const totalAnomalies = run.anomalies.reduce((s, a) => s + a.count, 0);

  const metricCards = [
    {
      label: 'Final Loss',
      value: run.finalLoss !== null ? run.finalLoss.toFixed(4) : 'NaN / Inf',
      sub: `at step ${run.totalSteps.toLocaleString()}`,
      icon: Activity,
      color: run.finalLoss === null ? 'text-rose-400' : run.finalLoss > 10 ? 'text-amber-400' : 'text-[var(--accent-cyan)]',
      glow: run.finalLoss === null ? 'shadow-rose-900/20' : 'shadow-cyan-900/20',
      accent: run.finalLoss === null ? 'from-rose-600' : 'from-cyan-600',
    },
    {
      label: 'Lowest Loss',
      value: run.minLoss !== null ? run.minLoss.toFixed(4) : '--',
      sub: 'Convergence floor',
      icon: TrendingDown,
      color: 'text-emerald-400',
      glow: 'shadow-emerald-900/20',
      accent: 'from-emerald-600',
    },
    {
      label: 'Peak Grad Norm',
      value: run.maxGradNorm !== null
        ? run.maxGradNorm > 1000 ? run.maxGradNorm.toExponential(2) : run.maxGradNorm.toFixed(2)
        : '--',
      sub: 'Optimizer stability',
      icon: Zap,
      color: run.maxGradNorm !== null && run.maxGradNorm > 100 ? 'text-rose-400' : 'text-amber-400',
      glow: 'shadow-amber-900/20',
      accent: 'from-amber-600',
    },
    {
      label: 'Learning Rate',
      value: run.currentLr.toExponential(2),
      sub: 'Schedule state',
      icon: Gauge,
      color: 'text-violet-400',
      glow: 'shadow-violet-900/20',
      accent: 'from-violet-600',
    },
    {
      label: 'Anomalies',
      value: totalAnomalies.toString(),
      sub: `${run.anomalies.length} type${run.anomalies.length !== 1 ? 's' : ''} detected`,
      icon: Bug,
      color: totalAnomalies > 0 ? 'text-rose-400' : 'text-emerald-400',
      glow: totalAnomalies > 0 ? 'shadow-rose-900/20' : 'shadow-emerald-900/20',
      accent: totalAnomalies > 0 ? 'from-rose-600' : 'from-emerald-600',
    },
  ];

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5 animate-slide-in">
      {/* ── Run Header ─────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              {run.name}
            </h2>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--accent-primary)]">
              {run.id}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
              run.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              run.status === 'broken' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
              run.status === 'diverged' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-violet-500/10 text-violet-400 border border-violet-500/20'
            }`}>
              {run.status}
            </span>
          </div>
          <p className="text-[12px] text-[var(--text-muted)] leading-relaxed max-w-2xl">{run.description}</p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-widest font-semibold">Total Steps</p>
            <p className="text-sm font-bold font-mono text-[var(--text-primary)]">
              {run.totalSteps.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ──────────────────────────── */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {metricCards.map(({ label, value, sub, icon: Icon, color, glow }) => (
          <div
            key={label}
            className={`glass-card gradient-border-top p-3.5 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 ${glow}`}
            style={{ '--tw-shadow-colored': glow } as React.CSSProperties}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-[var(--text-muted)] font-medium">{label}</span>
              <div className={`w-6 h-6 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
            </div>
            <p className={`text-xl font-bold font-mono ${color} metric-value leading-none`}>
              {value}
            </p>
            <p className="text-[10px] text-[var(--text-dim)] mt-2">{sub}</p>
          </div>
        ))}
      </section>

      {/* ── Anomaly Alert Banner ───────────────────── */}
      {run.anomalies.length > 0 && (
        <section className="glass-card p-4 border-rose-500/15 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <h3 className="text-[12px] font-semibold text-rose-300 tracking-wide">
              Data Integrity Warnings
            </h3>
            <span className="text-[10px] text-rose-400/60 font-mono">
              {totalAnomalies} total
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {run.anomalies.map((a, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-500/5 border border-rose-500/10"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                <div className="text-[11px]">
                  <span className="font-semibold text-rose-300 capitalize">{a.type.replace(/_/g, ' ')}</span>
                  <span className="text-[var(--text-muted)] ml-1">— {a.description}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Main Charts ────────────────────────────── */}
      <section className="space-y-4">
        <Chart
          title="Training Loss"
          steps={steps}
          values={losses}
          seriesName="Loss"
          color="#3b82f6"
          gradientFrom="#3b82f6"
          isLogScaleAllowed
          showDownsampleToggle={run.totalSteps > 3000}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Chart
            title="Learning Rate Schedule"
            steps={steps}
            values={lrs}
            seriesName="LR"
            color="#8b5cf6"
            gradientFrom="#8b5cf6"
          />
          <Chart
            title="Gradient Norm"
            steps={steps}
            values={gradNorms}
            seriesName="Grad Norm"
            color="#f59e0b"
            gradientFrom="#f59e0b"
            isLogScaleAllowed
          />
        </div>
      </section>

      {/* ── Truthfulness Audit Panel ───────────────── */}
      <section className="glass-card gradient-border-top p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent-cyan)]/10 flex items-center justify-center">
            <Eye className="w-4 h-4 text-[var(--accent-cyan)]" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-[var(--text-primary)]">
              Truthfulness Engine & Silent Failure Guards
            </h3>
            <p className="text-[10px] text-[var(--text-dim)]">
              How this dashboard prevents lies that cost $500
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              title: 'Min-Max Extrema Preservation',
              desc: 'Every pixel bucket preserves the absolute min and max in chronological order. A single-step spike at step 524,288 (loss 942.5) can never be smoothed out regardless of zoom level.',
              icon: CheckCircle2,
              iconColor: 'text-emerald-400',
            },
            {
              title: 'Explicit NaN / Gap Breaks',
              desc: 'spanGaps: false ensures missing or corrupted data creates visible line breaks. NaN is never drawn as 0.0, never interpolated, never hidden.',
              icon: CheckCircle2,
              iconColor: 'text-emerald-400',
            },
            {
              title: 'Race Condition Protection',
              desc: 'Rapid run switching uses monotonic request tokens. A slow-resolving 1M-point dataset will never overwrite a newer, already-loaded run.',
              icon: CheckCircle2,
              iconColor: 'text-emerald-400',
            },
          ].map(({ title, desc, icon: Icon, iconColor }) => (
            <div key={title} className="bg-[var(--bg-surface)]/60 p-3.5 rounded-xl border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${iconColor}`} />
                <h4 className="text-[11px] font-semibold text-[var(--text-primary)]">{title}</h4>
              </div>
              <p className="text-[10.5px] text-[var(--text-muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};
