import { useState } from 'react';
import {
  Terminal,
  Keyboard,
  CheckCircle,
  X,
  Sparkles,
} from 'lucide-react';

export const Header = () => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <header className="h-[52px] bg-[var(--bg-base)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)] px-5 flex items-center justify-between shrink-0 z-50 relative">
        {/* Left: Logo + Brand */}
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative w-8 h-8 rounded-[10px] bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-900/30">
              <Terminal className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-[13px] font-bold text-[var(--text-primary)] tracking-tight">
              SOUP
            </h1>
            <span className="text-[var(--text-dim)] text-[11px]">/</span>
            <span className="text-[12px] text-[var(--text-secondary)] font-medium tracking-wide">
              Training Monitor
            </span>
          </div>

          {/* Live Badge */}
          <div className="hidden sm:flex items-center gap-2 ml-3 px-2.5 py-1 rounded-full bg-emerald-500/8 border border-emerald-500/15">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-3 h-3 rounded-full bg-emerald-500/30 animate-ping" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 tracking-wide">
              20 Runs Monitored
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Keyboard Shortcut Button */}
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-1.5 px-2.5 py-[5px] text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] bg-[var(--bg-raised)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-lg transition-all duration-200 cursor-pointer"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-medium">Shortcuts</span>
            <kbd className="text-[10px] bg-[var(--bg-surface)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--text-dim)] font-mono ml-0.5">?</kbd>
          </button>

          {/* Vitest Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-[5px] text-[11px] font-semibold text-emerald-400 bg-emerald-500/8 border border-emerald-500/15 rounded-lg">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>6/6 Tests Passing</span>
          </div>

          {/* Truthful Engine Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-[5px] text-[11px] font-medium text-[var(--accent-cyan)] bg-cyan-500/8 border border-cyan-500/12 rounded-lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Min-Max Truthful Engine</span>
          </div>
        </div>
      </header>

      {/* Keyboard Shortcuts Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
          <div
            className="bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-2xl max-w-md w-full p-0 shadow-2xl shadow-black/50 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center">
                  <Keyboard className="w-4 h-4 text-[var(--accent-primary)]" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Keyboard Shortcuts
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-dim)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="p-4 space-y-1">
              {[
                { keys: '↑ / ↓', label: 'Navigate between runs' },
                { keys: 'R', label: 'Reset chart zoom to full extent' },
                { keys: '?', label: 'Toggle this shortcuts panel' },
                { keys: 'Click + Drag', label: 'Pan & zoom on any chart' },
              ].map(({ keys, label }) => (
                <div key={keys} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-[var(--bg-surface)] transition-colors group">
                  <span className="text-[12px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{label}</span>
                  <kbd className="text-[11px] font-mono bg-[var(--bg-surface)] group-hover:bg-[var(--bg-hover)] px-2 py-1 rounded-md border border-[var(--border-subtle)] text-[var(--accent-cyan)] transition-colors min-w-[60px] text-center">
                    {keys}
                  </kbd>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 pt-0">
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="w-full py-2 bg-[var(--accent-primary)] hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-lg shadow-blue-900/30 cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
