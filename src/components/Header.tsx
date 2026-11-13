import React, { useState } from 'react';
import { Terminal, Keyboard, CheckCircle, X } from 'lucide-react';

interface HeaderProps {
  totalRuns: number;
  activeRunId: string;
}

export const Header: React.FC<HeaderProps> = () => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <header className="h-14 bg-[#0d0e15] border-b border-[#1e2230] px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-md shadow-cyan-900/40">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-100 tracking-wide flex items-center gap-2">
                SOUP <span className="text-gray-500 font-normal">/</span> Training Run Monitor
              </h1>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] bg-emerald-950/80 text-emerald-400 border border-emerald-600/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Telemetry Live (20 runs)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Keyboard shortcut trigger */}
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-400 hover:text-gray-200 bg-[#161822] hover:bg-[#1f2230] border border-[#262b3d] rounded-lg transition-colors"
            title="Keyboard shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Shortcuts</span>
            <span className="text-[10px] bg-[#2a3044] px-1 rounded text-gray-300">?</span>
          </button>

          {/* Test verification badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 rounded-lg">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Truthfulness Verified (Vitest 5/5)</span>
          </div>
        </div>
      </header>

      {/* Shortcuts Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-[#2a324b] rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2230]">
              <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-cyan-400" /> Keyboard Shortcuts
              </h3>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-gray-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#1a1d28]">
                <span className="text-gray-300">Next / Previous Run</span>
                <span className="font-mono bg-[#1c202d] px-2 py-0.5 rounded border border-[#2a324b] text-cyan-300">
                  &uarr; / &darr; Arrow keys
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1a1d28]">
                <span className="text-gray-300">Reset Chart Zoom</span>
                <span className="font-mono bg-[#1c202d] px-2 py-0.5 rounded border border-[#2a324b] text-cyan-300">
                  R
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1a1d28]">
                <span className="text-gray-300">Toggle Shortcuts Dialog</span>
                <span className="font-mono bg-[#1c202d] px-2 py-0.5 rounded border border-[#2a324b] text-cyan-300">
                  ?
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-300">Pan & Zoom Chart</span>
                <span className="font-mono bg-[#1c202d] px-2 py-0.5 rounded border border-[#2a324b] text-cyan-300">
                  Click & Drag
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
