import React, { useEffect, useRef, useState, useMemo } from 'react';
import uPlot from 'uplot';
import { RotateCcw, AlertTriangle, Eye, ShieldAlert } from 'lucide-react';
import { downsampleMinMax, downsampleNaiveStride } from '../lib/downsample';

interface ChartProps {
  title: string;
  steps: number[];
  values: (number | null)[];
  seriesName: string;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  isLogScaleAllowed?: boolean;
  unit?: string;
  showDownsampleToggle?: boolean;
}

export const Chart: React.FC<ChartProps> = ({
  title,
  steps,
  values,
  seriesName,
  color = '#3b82f6',
  gradientFrom,
  gradientTo,
  isLogScaleAllowed = false,
  unit = '',
  showDownsampleToggle = false,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const uplotRef = useRef<uPlot | null>(null);

  const [isLogScale, setIsLogScale] = useState(false);
  const [downsampleMode, setDownsampleMode] = useState<'minmax' | 'stride'>('minmax');
  const [clampedCount, setClampedCount] = useState(0);

  const preparedData = useMemo(() => {
    let ds = steps;
    let dv = values;

    if (showDownsampleToggle && steps.length > 3000) {
      if (downsampleMode === 'minmax') {
        const r = downsampleMinMax(steps, values, 2000);
        ds = r.steps;
        dv = r.values;
      } else {
        const r = downsampleNaiveStride(steps, values, 2000);
        ds = r.steps;
        dv = r.values;
      }
    }

    let np = 0;
    const tv: (number | null)[] = [];
    for (const v of dv) {
      if (v === null) { tv.push(null); continue; }
      if (isLogScale && v <= 0) { np++; tv.push(1e-6); }
      else { tv.push(v); }
    }
    setClampedCount(np);
    return [ds, tv] as [number[], (number | null)[]];
  }, [steps, values, downsampleMode, isLogScale, showDownsampleToggle]);

  useEffect(() => {
    if (!chartRef.current) return;
    if (uplotRef.current) { uplotRef.current.destroy(); uplotRef.current = null; }

    const width = chartRef.current.clientWidth || 600;
    const height = 240;
    const lineColor = color;

    const opts: uPlot.Options = {
      width,
      height,
      padding: [12, 12, 0, 0],
      cursor: {
        drag: { x: true, y: true },
        sync: { key: 'soup-sync' },
        points: { size: 8, fill: lineColor, stroke: '#fff', width: 2 },
      },
      scales: {
        x: { time: false },
        y: { distr: isLogScale ? 3 : 1 },
      },
      axes: [
        {
          stroke: 'rgba(107, 123, 165, 0.4)',
          grid: { stroke: 'rgba(107, 123, 165, 0.06)', width: 1 },
          ticks: { stroke: 'rgba(107, 123, 165, 0.15)', width: 1, size: 4 },
          font: '10px Inter, system-ui, sans-serif',
          values: (_u, vals) =>
            vals.map((v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)),
        },
        {
          stroke: 'rgba(107, 123, 165, 0.4)',
          grid: { stroke: 'rgba(107, 123, 165, 0.06)', width: 1 },
          ticks: { stroke: 'rgba(107, 123, 165, 0.15)', width: 1, size: 4 },
          font: '10px Inter, system-ui, sans-serif',
          size: 52,
          values: (_u, vals) =>
            vals.map((v) => {
              if (v == null) return '';
              if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;
              if (Math.abs(v) < 0.001 && v !== 0) return v.toExponential(1);
              return v < 1 ? v.toFixed(3) : v.toFixed(2);
            }),
        },
      ],
      series: [
        {
          label: 'Step',
          value: (_u, v) => (v == null ? '--' : `Step ${v.toLocaleString()}`),
        },
        {
          label: seriesName,
          stroke: lineColor,
          width: 1.5,
          spanGaps: false,
          points: { show: preparedData[0].length < 80, size: 3 },
          fill: (u: uPlot) => {
            const ctx = u.ctx;
            const from = gradientFrom || lineColor;
            const to = gradientTo || 'transparent';
            const top = u.bbox?.top;
            const height = u.bbox?.height;
            if (!Number.isFinite(top) || !Number.isFinite(height) || !height || height <= 0) {
              return from + '18';
            }
            const grd = ctx.createLinearGradient(0, top, 0, top + height);
            grd.addColorStop(0, from + '18');
            grd.addColorStop(1, to === 'transparent' ? 'transparent' : to + '00');
            return grd;
          },
          value: (_u, v) => (v == null ? 'NaN / Missing' : `${v.toFixed(4)} ${unit}`),
        },
      ],
    };

    const u = new uPlot(opts, preparedData as uPlot.AlignedData, chartRef.current);
    uplotRef.current = u;

    const ro = new ResizeObserver(() => {
      if (chartRef.current && uplotRef.current) {
        uplotRef.current.setSize({ width: chartRef.current.clientWidth, height: 240 });
      }
    });
    ro.observe(chartRef.current);

    return () => {
      ro.disconnect();
      if (uplotRef.current) { uplotRef.current.destroy(); uplotRef.current = null; }
    };
  }, [preparedData, color, isLogScale, seriesName, unit, gradientFrom, gradientTo]);

  return (
    <div className="glass-card p-0 overflow-hidden animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }} />
          <h4 className="text-[12px] font-semibold text-[var(--text-primary)] tracking-tight">{title}</h4>
          <span className="text-[10px] text-[var(--text-dim)] font-mono bg-[var(--bg-surface)] px-1.5 py-0.5 rounded-md">
            {preparedData[0].length.toLocaleString()} pts
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px]">
          {/* Truthful vs Naive Toggle */}
          {showDownsampleToggle && steps.length > 3000 && (
            <div className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setDownsampleMode('minmax')}
                className={`px-2 py-[3px] rounded-md font-semibold transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                  downsampleMode === 'minmax'
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-sm'
                    : 'text-[var(--text-dim)] hover:text-[var(--text-muted)]'
                }`}
              >
                <Eye className="w-3 h-3" /> Truthful
              </button>
              <button
                type="button"
                onClick={() => setDownsampleMode('stride')}
                className={`px-2 py-[3px] rounded-md font-semibold transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                  downsampleMode === 'stride'
                    ? 'bg-rose-500/20 text-rose-400 shadow-sm'
                    : 'text-[var(--text-dim)] hover:text-[var(--text-muted)]'
                }`}
              >
                <ShieldAlert className="w-3 h-3" /> Naive
              </button>
            </div>
          )}

          {/* Log Scale */}
          {isLogScaleAllowed && (
            <button
              type="button"
              onClick={() => setIsLogScale(!isLogScale)}
              className={`px-2 py-[3px] rounded-md font-semibold border transition-all duration-200 cursor-pointer ${
                isLogScale
                  ? 'bg-cyan-500/15 border-cyan-500/25 text-cyan-400'
                  : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-dim)] hover:text-[var(--text-muted)]'
              }`}
            >
              {isLogScale ? 'Log' : 'Linear'}
            </button>
          )}

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={() => uplotRef.current?.setData(preparedData as uPlot.AlignedData, true)}
            className="p-[4px] rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-dim)] hover:text-[var(--text-muted)] transition-colors cursor-pointer"
            title="Reset zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Warning Banners */}
      {isLogScale && clampedCount > 0 && (
        <div className="mx-4 mt-2 px-3 py-1.5 rounded-lg bg-amber-500/8 border border-amber-500/15 text-amber-400 text-[11px] flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span><strong>Log Scale Guard:</strong> {clampedCount} non-positive value{clampedCount > 1 && 's'} clamped to 1e-6 (log(0) = -∞).</span>
        </div>
      )}

      {downsampleMode === 'stride' && steps.length > 50000 && (
        <div className="mx-4 mt-2 px-3 py-1.5 rounded-lg bg-rose-500/8 border border-rose-500/15 text-rose-400 text-[11px] flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span><strong>Naive Stride active!</strong> The 942.5 spike at step 524,288 has vanished. Switch to <strong>Truthful</strong> to see it.</span>
        </div>
      )}

      {/* Chart Canvas */}
      <div ref={chartRef} className="w-full px-2 pb-2 pt-1 cursor-crosshair" />
    </div>
  );
};
