import React from 'react';
import type { TrainingRunDetails } from '../types';
import { Chart } from './Chart';
import { Activity, ShieldAlert, Zap, Layers, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface RunDetailsProps {
  run: TrainingRunDetails;
  isLoading: boolean;
}

export const RunDetails: React.FC<RunDetailsProps> = ({ run, isLoading }) => {
  if (isLoading) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-12 text-gray-400 space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono tracking-wide">Processing {run.name}...</p>
        <span className="text-xs text-gray-500">Executing truthful Min-Max downsampling on dataset</span>
      </main>
    );
  }

  const [steps, losses, lrs, gradNorms] = run.data;

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e2230]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-100 tracking-tight">{run.name}</h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#1b2030] border border-[#2a324b] text-cyan-400">
              {run.id}
            </span>
          </div>
          <p className="text-xs text-gray-400">{run.description}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-gray-500 block">Total Horizon</span>
            <span className="text-sm font-mono font-semibold text-gray-200">
              {run.totalSteps.toLocaleString()} steps
            </span>
          </div>
          <div className="h-8 w-px bg-[#1e2230]" />
          <div className="text-right">
            <span className="text-[11px] text-gray-500 block">Run Status</span>
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              run.status === 'healthy' ? 'text-emerald-400' :
              run.status === 'broken' ? 'text-rose-400' :
              run.status === 'diverged' ? 'text-amber-400' : 'text-purple-400'
            }`}>
              {run.status}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" aria-label="Run summary metrics">
        {/* Card 1: Final Loss */}
        <div className="bg-[#12141c] border border-[#1e2230] rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Final Loss</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <span className={`text-xl font-bold font-mono ${
              run.finalLoss === null ? 'text-rose-400' : run.finalLoss > 10 ? 'text-amber-400' : 'text-gray-100'
            }`}>
              {run.finalLoss !== null ? run.finalLoss.toFixed(4) : 'NaN / Inf'}
            </span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1">at step {run.totalSteps.toLocaleString()}</span>
        </div>

        {/* Card 2: Min Loss */}
        <div className="bg-[#12141c] border border-[#1e2230] rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Lowest Loss</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold font-mono text-gray-100">
              {run.minLoss !== null ? run.minLoss.toFixed(4) : '--'}
            </span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1">Convergence floor</span>
        </div>

        {/* Card 3: Max Grad Norm */}
        <div className="bg-[#12141c] border border-[#1e2230] rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Peak Grad Norm</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className={`text-xl font-bold font-mono ${
              run.maxGradNorm !== null && run.maxGradNorm > 100 ? 'text-rose-400' : 'text-gray-100'
            }`}>
              {run.maxGradNorm !== null ? (run.maxGradNorm > 1000 ? run.maxGradNorm.toExponential(2) : run.maxGradNorm.toFixed(2)) : '--'}
            </span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1">Optimizer stability</span>
        </div>

        {/* Card 4: Current LR */}
        <div className="bg-[#12141c] border border-[#1e2230] rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Learning Rate</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold font-mono text-gray-100">
              {run.currentLr.toExponential(2)}
            </span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1">Schedule state</span>
        </div>

        {/* Card 5: Anomaly Count */}
        <div className="bg-[#12141c] border border-[#1e2230] rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Telemetry Anomalies</span>
            <ShieldAlert className={`w-4 h-4 ${run.anomalies.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
          </div>
          <div className="mt-2">
            <span className={`text-xl font-bold font-mono ${run.anomalies.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {run.anomalies.reduce((acc, a) => acc + a.count, 0)}
            </span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1">Across 4 health probes</span>
        </div>
      </section>

      {/* Anomaly Callout Banner if any */}
      {run.anomalies.length > 0 && (
        <section className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-4 space-y-2" aria-label="Detected anomalies">
          <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs tracking-wide">
            <AlertTriangle className="w-4 h-4" />
            <span>Health & Data Integrity Warnings Detected</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {run.anomalies.map((anomaly, idx) => (
              <div key={idx} className="bg-[#141019] border border-rose-900/40 rounded-lg p-2.5 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold text-rose-200 capitalize">{anomaly.type.replace('_', ' ')}:</span>{' '}
                  <span className="text-gray-300">{anomaly.description}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Charts */}
      <section className="space-y-4" aria-label="Training telemetry charts">
        {/* Loss Chart */}
        <Chart
          title="Training Loss"
          steps={steps}
          values={losses}
          seriesName="Loss"
          color="#38bdf8"
          isLogScaleAllowed={true}
          showDownsampleToggle={run.totalSteps > 3000}
        />

        {/* Multi-column secondary charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Chart
            title="Learning Rate Schedule"
            steps={steps}
            values={lrs}
            seriesName="Learning Rate"
            color="#a855f7"
            unit=""
          />
          <Chart
            title="Gradient Norm"
            steps={steps}
            values={gradNorms}
            seriesName="Grad Norm"
            color="#f59e0b"
            isLogScaleAllowed={true}
          />
        </div>
      </section>

      {/* Truthfulness & Silent Failures Audit Section */}
      <section className="bg-[#10121a] border border-[#1e2230] rounded-xl p-5 space-y-4" aria-label="Audit summary">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
          <Info className="w-4 h-4" />
          <h3>Data Truthfulness Audit & Silent Failure Guards</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#151722] p-3 rounded-lg border border-[#222738] space-y-1">
            <h4 className="font-semibold text-gray-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Min-Max Extrema Preservation
            </h4>
            <p className="text-gray-400">
              Downsampling divides the million points into pixel buckets and strictly preserves both the minimum and maximum in chronological order. An isolated 1-point spike (e.g. 942.5 at step 524,288) can never be smoothed out.
            </p>
          </div>

          <div className="bg-[#151722] p-3 rounded-lg border border-[#222738] space-y-1">
            <h4 className="font-semibold text-gray-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Explicit Gap / NaN Breaks
            </h4>
            <p className="text-gray-400">
              Line renderer sets <code>spanGaps: false</code>. Missing or corrupted data points are never converted to 0.0 or silently interpolated, showing transparent breaks in the training stream.
            </p>
          </div>

          <div className="bg-[#151722] p-3 rounded-lg border border-[#222738] space-y-1">
            <h4 className="font-semibold text-gray-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Monotonic Timeline Sanitation
            </h4>
            <p className="text-gray-400">
              Distributed worker collisions (duplicate steps and out-of-order logging) are pre-sorted and deduplicated to prevent backward canvas loop artifacts.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};
