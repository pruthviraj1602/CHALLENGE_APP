import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { LayoutShell } from './components/LayoutShell';
import { useStreakTracker } from './hooks/useStreakTracker';
import { AchievementsPage } from './pages/AchievementsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CalendarPage } from './pages/CalendarPage';
import { CreateChallengePage } from './pages/CreateChallengePage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { PageId } from './types/challenge';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const tracker = useStreakTracker();

  const toggleTheme = () => {
    tracker.setTheme(tracker.state.preferences.theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <LayoutShell
      activePage={activePage}
      onNavigate={setActivePage}
      todayKey={tracker.todayKey}
      theme={tracker.state.preferences.theme}
      onToggleTheme={toggleTheme}
      hasActiveChallenge={tracker.state.activeChallenge !== null}
    >
      {tracker.storageWarning && (
        <div
          role="alert"
          className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span>{tracker.storageWarning}</span>
          </div>
          <button
            type="button"
            onClick={tracker.dismissStorageWarning}
            aria-label="Dismiss warning"
            className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {activePage === 'dashboard' && (
        <DashboardPage
          todayKey={tracker.todayKey}
          activeChallenge={tracker.state.activeChallenge}
          activeMetrics={tracker.activeMetrics}
          historyCount={tracker.state.history.length}
          justFinishedChallenge={tracker.justFinishedChallenge}
          onDismissJustFinished={tracker.dismissJustFinished}
          onCheckInToday={tracker.checkInToday}
          onStartActiveChallenge={tracker.startActiveChallenge}
          onDiscardNotStarted={tracker.discardNotStarted}
          onNavigate={setActivePage}
        />
      )}

      {activePage === 'create' && (
        <CreateChallengePage
          todayKey={tracker.todayKey}
          activeChallenge={tracker.state.activeChallenge}
          onCreateChallenge={tracker.createChallenge}
          onNavigate={setActivePage}
        />
      )}

      {activePage === 'calendar' && (
        <CalendarPage
          todayKey={tracker.todayKey}
          activeChallenge={tracker.state.activeChallenge}
          history={tracker.state.history}
          onCheckInToday={tracker.checkInToday}
          onNavigate={setActivePage}
        />
      )}

      {activePage === 'analytics' && (
        <AnalyticsPage
          analytics={tracker.analytics}
          onNavigate={setActivePage}
        />
      )}

      {activePage === 'history' && (
        <HistoryPage
          todayKey={tracker.todayKey}
          history={tracker.state.history}
          onNavigate={setActivePage}
        />
      )}

      {activePage === 'achievements' && (
        <AchievementsPage achievements={tracker.achievements} />
      )}

      {activePage === 'settings' && (
        <SettingsPage
          todayKey={tracker.todayKey}
          state={tracker.state}
          activeChallenge={tracker.state.activeChallenge}
          activeMetrics={tracker.activeMetrics}
          onSetTheme={tracker.setTheme}
          onUpdateReminder={tracker.updateReminder}
          onImportState={tracker.importState}
          onResetAllData={tracker.resetAllData}
        />
      )}
    </LayoutShell>
  );
}
