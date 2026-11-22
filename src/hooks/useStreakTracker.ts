import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  isPastReminderTime,
  sendCheckInNotification,
} from '../services/notificationService';
import {
  getDefaultState,
  storageService,
} from '../services/storageService';
import {
  Challenge,
  PersistedAppState,
  ReminderSettings,
} from '../types/challenge';
import {
  checkInChallengeToday,
  computeAchievements,
  computeAnalytics,
  computeChallengeMetrics,
  createChallenge,
  CreateChallengeInput,
  reconcileChallenge,
  startChallenge,
} from '../utils/challengeEngine';
import { getLocalTodayDateKey, msUntilNextMidnight } from '../utils/dateUtils';

function reconcileStateForToday(
  state: PersistedAppState,
  todayKey: string
): { nextState: PersistedAppState; archivedJustNow: Challenge | null } {
  if (!state.activeChallenge) {
    return { nextState: state, archivedJustNow: null };
  }

  const reconciledActive = reconcileChallenge(state.activeChallenge, todayKey);

  // If challenge passed its scheduled endDate, move it to history automatically
  if (
    reconciledActive.status === 'COMPLETED' ||
    reconciledActive.status === 'EXPIRED'
  ) {
    const alreadyInHistory = state.history.some((h) => h.id === reconciledActive.id);
    const nextHistory = alreadyInHistory
      ? state.history.map((h) => (h.id === reconciledActive.id ? reconciledActive : h))
      : [reconciledActive, ...state.history];

    return {
      nextState: {
        ...state,
        activeChallenge: null,
        history: nextHistory,
      },
      archivedJustNow: reconciledActive,
    };
  }

  if (reconciledActive !== state.activeChallenge) {
    return {
      nextState: {
        ...state,
        activeChallenge: reconciledActive,
      },
      archivedJustNow: null,
    };
  }

  return { nextState: state, archivedJustNow: null };
}

export function useStreakTracker() {
  const [todayKey, setTodayKey] = useState<string>(() => getLocalTodayDateKey());
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [justFinishedChallenge, setJustFinishedChallenge] = useState<Challenge | null>(null);

  const [state, setState] = useState<PersistedAppState>(() => {
    const { state: loaded, corrupted } = storageService.load();
    if (corrupted) {
      setStorageWarning(
        'Saved browser data appeared corrupted and was safely reset to prevent errors. You can restore a JSON backup in Settings.'
      );
    }
    const { nextState, archivedJustNow } = reconcileStateForToday(
      loaded,
      getLocalTodayDateKey()
    );
    if (archivedJustNow) {
      setJustFinishedChallenge(archivedJustNow);
    }
    if (nextState !== loaded) {
      storageService.save(nextState);
    }
    return nextState;
  });

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (state.preferences.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.preferences.theme]);

  // Persist every state change to storageService
  const updateState = useCallback(
    (updater: (prev: PersistedAppState) => PersistedAppState) => {
      setState((prev) => {
        const updated = updater(prev);
        storageService.save(updated);
        return updated;
      });
    },
    []
  );

  // Calendar date-change listener (midnight timeout + 30s check + tab visibility resume)
  useEffect(() => {
    const syncDate = () => {
      const currentKey = getLocalTodayDateKey();
      setTodayKey((prevKey) => {
        if (currentKey !== prevKey) {
          return currentKey;
        }
        return prevKey;
      });
    };

    const midnightTimer = window.setTimeout(syncDate, msUntilNextMidnight());
    const interval = window.setInterval(syncDate, 30_000);
    window.addEventListener('visibilitychange', syncDate);
    window.addEventListener('focus', syncDate);

    return () => {
      window.clearTimeout(midnightTimer);
      window.clearInterval(interval);
      window.removeEventListener('visibilitychange', syncDate);
      window.removeEventListener('focus', syncDate);
    };
  }, [todayKey]);

  // Reconcile state whenever todayKey changes
  useEffect(() => {
    setState((prev) => {
      const { nextState, archivedJustNow } = reconcileStateForToday(prev, todayKey);
      if (archivedJustNow) {
        setJustFinishedChallenge(archivedJustNow);
      }
      if (nextState !== prev) {
        storageService.save(nextState);
      }
      return nextState;
    });
  }, [todayKey]);

  const activeMetrics = useMemo(() => {
    if (!state.activeChallenge) return null;
    return computeChallengeMetrics(state.activeChallenge, todayKey);
  }, [state.activeChallenge, todayKey]);

  // Daily reminder check (strictly skips if user already checked in today)
  useEffect(() => {
    const checkReminder = () => {
      const { reminder } = state.preferences;
      if (!reminder.enabled) return;
      if (!state.activeChallenge || state.activeChallenge.status !== 'IN_PROGRESS') return;
      if (!activeMetrics || activeMetrics.isCheckedInToday || !activeMetrics.canCheckInToday) {
        return;
      }
      if (reminder.lastNotifiedDate === todayKey) return;

      if (isPastReminderTime(reminder.time)) {
        const sent = sendCheckInNotification(
          `Day ${activeMetrics.currentDay} of ${state.activeChallenge.durationDays} — ${state.activeChallenge.name}`,
          `You have ${activeMetrics.remainingDays} day${activeMetrics.remainingDays === 1 ? '' : 's'} remaining. Check in before midnight to keep your streak.`
        );
        if (sent) {
          updateState((prev) => ({
            ...prev,
            preferences: {
              ...prev.preferences,
              reminder: {
                ...prev.preferences.reminder,
                lastNotifiedDate: todayKey,
              },
            },
          }));
        }
      }
    };

    checkReminder();
    const timer = window.setInterval(checkReminder, 60_000);
    return () => window.clearInterval(timer);
  }, [state.preferences, state.activeChallenge, activeMetrics, todayKey, updateState]);

  const handleCreateChallenge = useCallback(
    (input: Omit<CreateChallengeInput, 'todayKey'>): { ok: boolean; error?: string } => {
      if (state.activeChallenge) {
        return {
          ok: false,
          error:
            'Only one challenge can be active at a time. Finish or cancel your current challenge before starting another.',
        };
      }
      const created = createChallenge({ ...input, todayKey });
      setJustFinishedChallenge(null);
      updateState((prev) => ({
        ...prev,
        activeChallenge: created,
      }));
      return { ok: true };
    },
    [state.activeChallenge, todayKey, updateState]
  );

  const handleStartActiveChallenge = useCallback(() => {
    updateState((prev) => {
      if (!prev.activeChallenge || prev.activeChallenge.status !== 'NOT_STARTED') {
        return prev;
      }
      return {
        ...prev,
        activeChallenge: startChallenge(prev.activeChallenge, todayKey),
      };
    });
  }, [todayKey, updateState]);

  const handleDiscardNotStarted = useCallback(() => {
    updateState((prev) => {
      if (!prev.activeChallenge || prev.activeChallenge.status !== 'NOT_STARTED') {
        return prev;
      }
      return {
        ...prev,
        activeChallenge: null,
      };
    });
  }, [updateState]);

  const handleCheckInToday = useCallback((): { accepted: boolean; reason?: string } => {
    let outcome: { accepted: boolean; reason?: string } = { accepted: false };
    updateState((prev) => {
      if (!prev.activeChallenge) {
        outcome = { accepted: false, reason: 'No active challenge.' };
        return prev;
      }
      const result = checkInChallengeToday(prev.activeChallenge, todayKey);
      outcome = { accepted: result.accepted, reason: result.reason };
      if (!result.accepted) return prev;
      return {
        ...prev,
        activeChallenge: result.updated,
      };
    });
    return outcome;
  }, [todayKey, updateState]);

  const handleSetTheme = useCallback(
    (theme: 'light' | 'dark') => {
      updateState((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          theme,
        },
      }));
    },
    [updateState]
  );

  const handleUpdateReminder = useCallback(
    (partial: Partial<ReminderSettings>) => {
      updateState((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          reminder: {
            ...prev.preferences.reminder,
            ...partial,
          },
        },
      }));
    },
    [updateState]
  );

  const handleImportState = useCallback(
    (imported: PersistedAppState) => {
      const { nextState, archivedJustNow } = reconcileStateForToday(imported, todayKey);
      setJustFinishedChallenge(archivedJustNow);
      setStorageWarning(null);
      updateState(() => nextState);
    },
    [todayKey, updateState]
  );

  const handleResetAllData = useCallback(() => {
    storageService.clear();
    setJustFinishedChallenge(null);
    setStorageWarning(null);
    const fresh = getDefaultState();
    storageService.save(fresh);
    setState(fresh);
  }, []);

  const dismissJustFinished = useCallback(() => {
    setJustFinishedChallenge(null);
  }, []);

  const dismissStorageWarning = useCallback(() => {
    setStorageWarning(null);
  }, []);

  const analytics = useMemo(
    () => computeAnalytics(state.activeChallenge, state.history, todayKey),
    [state.activeChallenge, state.history, todayKey]
  );

  const achievements = useMemo(
    () => computeAchievements(state.activeChallenge, state.history, todayKey),
    [state.activeChallenge, state.history, todayKey]
  );

  return {
    todayKey,
    state,
    activeMetrics,
    analytics,
    achievements,
    storageWarning,
    justFinishedChallenge,
    dismissStorageWarning,
    dismissJustFinished,
    createChallenge: handleCreateChallenge,
    startActiveChallenge: handleStartActiveChallenge,
    discardNotStarted: handleDiscardNotStarted,
    checkInToday: handleCheckInToday,
    setTheme: handleSetTheme,
    updateReminder: handleUpdateReminder,
    importState: handleImportState,
    resetAllData: handleResetAllData,
  };
}
