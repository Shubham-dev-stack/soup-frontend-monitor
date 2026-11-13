import React, { useEffect, useRef, useState } from 'react';
import uPlot from 'uplot';
import { RotateCcw, AlertTriangle, Eye, ShieldAlert } from 'lucide-react';
import { downsampleMinMax, downsampleNaiveStride } from '../lib/downsample';

interface ChartProps {
  title: string;
  steps: number[];
  values: (number | null)[];
  seriesName: string;
  color?: string;
  isLogScaleAllowed?: boolean;
  unit?: string;
  showDownsampleToggle?: boolean;
}

export const Chart: React.FC<ChartProps> = ({
  title,
  steps,
  values,
  seriesName,
  color = '#38bdf8',
  isLogScaleAllowed = false,
  unit = '',
  showDownsampleToggle = false,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const uplotInstanceRef = useRef<uPlot | null>(null);

  const [isLogScale, setIsLogScale] = useState(false);
  const [downsampleMode, setDownsampleMode] = useState<'minmax' | 'stride' | 'raw'>('minmax');
  const [clampedCount, setClampedCount] = useState<number>(0);

  // Prepare data with selected downsampling & scale
  const preparedData = React.useMemo(() => {
    let activeSteps = steps;
    let activeValues = values;

    if (showDownsampleToggle && steps.length > 3000) {
      if (downsampleMode === 'minmax') {
        const ds = downsampleMinMax(steps, values, 2000);
        activeSteps = ds.steps;
        activeValues = ds.values;
      } else if (downsampleMode === 'stride') {
        const ds = downsampleNaiveStride(steps, values, 2000);
        activeSteps = ds.steps;
        activeValues = ds.values;
      }
    }

    let nonPositive = 0;
    const transformedValues: (number | null)[] = [];

    for (let i = 0; i < activeValues.length; i++) {
      const v = activeValues[i];
      if (v === null) {
        transformedValues.push(null);
        continue;
      }

      if (isLogScale) {
        if (v <= 0) {
          nonPositive++;
          transformedValues.push(1e-6); // Clamp to positive floor
        } else {
          transformedValues.push(v);
        }
      } else {
        transformedValues.push(v);
      }
    }

    setClampedCount(nonPositive);
    return [activeSteps, transformedValues] as [number[], (number | null)[]];
  }, [steps, values, downsampleMode, isLogScale, showDownsampleToggle]);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing plot if any
    if (uplotInstanceRef.current) {
      uplotInstanceRef.current.destroy();
      uplotInstanceRef.current = null;
    }

    const width = chartRef.current.clientWidth || 700;
    const height = 260;

    const opts: uPlot.Options = {
      width,
      height,
      cursor: {
        drag: { x: true, y: true },
        sync: { key: 'soup-charts' },
        points: {
          size: 6,
          fill: color,
        },
      },
      scales: {
        x: {
          time: false,
        },
        y: {
          distr: isLogScale ? 3 : 1, // 3 is log scale in uPlot
        },
      },
      axes: [
        {
          stroke: '#64748b',
          grid: { stroke: 'rgba(51, 65, 85, 0.3)', width: 1 },
          ticks: { stroke: '#475569', width: 1 },
          values: (_u, vals) => vals.map((v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`),
        },
        {
          stroke: '#64748b',
          grid: { stroke: 'rgba(51, 65, 85, 0.3)', width: 1 },
          ticks: { stroke: '#475569', width: 1 },
          values: (_u, vals) => vals.map((v) => {
            if (v === null) return '';
            if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
            if (v < 0.01 && v > 0) return v.toExponential(1);
            return v.toFixed(v < 1 ? 3 : 2);
          }),
        },
      ],
      series: [
        {
          label: 'Step',
          value: (_u, v) => (v === null ? '--' : `Step ${v.toLocaleString()}`),
        },
        {
          label: seriesName,
          stroke: color,
          width: 1.5,
          spanGaps: false, // CRITICAL: NEVER interpolate across NaNs/nulls!
          points: {
            show: preparedData[0].length < 100, // Show individual points for small sets
            size: 4,
          },
          value: (_u, v) => {
            if (v === null) return 'NaN / Missing';
            return `${v.toFixed(4)} ${unit}`;
          },
        },
      ],
    };

    const u = new uPlot(opts, preparedData as any, chartRef.current);
    uplotInstanceRef.current = u;

    const handleResize = () => {
      if (chartRef.current && uplotInstanceRef.current) {
        uplotInstanceRef.current.setSize({
          width: chartRef.current.clientWidth,
          height: 260,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (uplotInstanceRef.current) {
        uplotInstanceRef.current.destroy();
        uplotInstanceRef.current = null;
      }
    };
  }, [preparedData, color, isLogScale, seriesName, unit]);

  const handleResetZoom = () => {
    if (uplotInstanceRef.current) {
      uplotInstanceRef.current.setData(preparedData as any, true);
    }
  };

  return (
    <div className="bg-[#12141c] border border-[#1e2230] rounded-xl p-4 shadow-sm flex flex-col">
      {/* Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-[#1e2230]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <h4 className="text-sm font-semibold text-gray-200 tracking-wide">{title}</h4>
          <span className="text-xs text-gray-400 font-mono">({preparedData[0].length.toLocaleString()} points)</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Downsample Mode Toggle (to prove truthfulness) */}
          {showDownsampleToggle && steps.length > 3000 && (
            <div className="flex items-center bg-[#1a1d28] border border-[#262b3d] rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setDownsampleMode('minmax')}
                className={`px-2 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
                  downsampleMode === 'minmax'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Preserves both min and max in every pixel bucket. Outlier spikes are 100% visible."
              >
                <Eye className="w-3 h-3" /> Min-Max (Truthful)
              </button>
              <button
                type="button"
                onClick={() => setDownsampleMode('stride')}
                className={`px-2 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
                  downsampleMode === 'stride'
                    ? 'bg-rose-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Naive striding. Skips points and hides isolated outlier spikes!"
              >
                <ShieldAlert className="w-3 h-3" /> Naive Stride (Lies)
              </button>
            </div>
          )}

          {/* Log Scale Toggle */}
          {isLogScaleAllowed && (
            <button
              type="button"
              onClick={() => setIsLogScale(!isLogScale)}
              className={`px-2.5 py-1 rounded border transition-colors ${
                isLogScale
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-semibold'
                  : 'bg-[#1a1d28] border-[#262b3d] text-gray-400 hover:text-gray-200'
              }`}
            >
              {isLogScale ? 'Scale: Log' : 'Scale: Linear'}
            </button>
          )}

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1 rounded bg-[#1a1d28] border border-[#262b3d] text-gray-400 hover:text-gray-200"
            title="Reset Zoom (or press 'R')"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hazard Warning for Log Scale with <= 0 values */}
      {isLogScale && clampedCount > 0 && (
        <div className="mb-2 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-600/50 text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Silent Failure Guard:</strong> {clampedCount} non-positive value(s) clamped to 1e-6.
            (log(0) is -Infinity; unclamped values cause silent render dropouts).
          </span>
        </div>
      )}

      {/* Downsampling Warning if in Naive mode on 1M run */}
      {downsampleMode === 'stride' && steps.length > 500000 && (
        <div className="mb-2 px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-600/50 text-rose-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>
            <strong>Warning:</strong> Naive Stride downsampling is active! Notice the catastrophic 942.5 spike at step 524,288 has vanished. Switch to <strong>Min-Max (Truthful)</strong> to reveal it.
          </span>
        </div>
      )}

      {/* Canvas Mount */}
      <div ref={chartRef} className="w-full flex-1 min-h-[260px] cursor-crosshair" />
    </div>
  );
};
