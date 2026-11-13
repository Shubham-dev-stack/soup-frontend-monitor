import { useState, useEffect, useRef, useCallback } from 'react';
import { getAllRunSummaries, getRunDetails } from './lib/data-generator';
import type { TrainingRunSummary, TrainingRunDetails } from './types';
import { Header } from './components/Header';
import { RunList } from './components/RunList';
import { RunDetails } from './components/RunDetails';

export function App() {
  const [runs, setRuns] = useState<TrainingRunSummary[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>('run-20'); // Default to 1M stress run
  const [activeRunDetails, setActiveRunDetails] = useState<TrainingRunDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Active request token to prevent race conditions when switching runs quickly
  const activeRequestIdRef = useRef<number>(0);

  // Initial load of 20 run summaries
  useEffect(() => {
    const summaries = getAllRunSummaries();
    setRuns(summaries);
  }, []);

  // Fetch / compute run details with strict race condition prevention
  const loadRun = useCallback((runId: string) => {
    const requestId = ++activeRequestIdRef.current;
    setIsLoading(true);
    setSelectedRunId(runId);

    // Use setTimeout to yield thread so UI shows loading spinner immediately
    setTimeout(() => {
      // If user clicked another run in the meantime, discard this computation!
      if (requestId !== activeRequestIdRef.current) {
        return;
      }

      try {
        const details = getRunDetails(runId, 'truthful_minmax');
        // Double check token before updating state
        if (requestId === activeRequestIdRef.current) {
          setActiveRunDetails(details);
          setIsLoading(false);
        }
      } catch (err) {
        if (requestId === activeRequestIdRef.current) {
          console.error('Failed to load run telemetry:', err);
          setIsLoading(false);
        }
      }
    }, 10);
  }, []);

  // Load selected run initially
  useEffect(() => {
    loadRun(selectedRunId);
  }, [loadRun, selectedRunId]);

  // Global keyboard shortcuts (Up/Down arrow navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setRuns((currentRuns) => {
          const idx = currentRuns.findIndex((r) => r.id === selectedRunId);
          if (idx !== -1 && idx < currentRuns.length - 1) {
            loadRun(currentRuns[idx + 1].id);
          }
          return currentRuns;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setRuns((currentRuns) => {
          const idx = currentRuns.findIndex((r) => r.id === selectedRunId);
          if (idx > 0) {
            loadRun(currentRuns[idx - 1].id);
          }
          return currentRuns;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRunId, loadRun]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090a0f] text-gray-100 antialiased font-sans">
      <Header totalRuns={runs.length} activeRunId={selectedRunId} />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <RunList
          runs={runs}
          selectedRunId={selectedRunId}
          onSelectRun={(id) => loadRun(id)}
        />

        {/* Main Content Pane */}
        {activeRunDetails ? (
          <RunDetails run={activeRunDetails} isLoading={isLoading} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a run from the sidebar to inspect telemetry
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
