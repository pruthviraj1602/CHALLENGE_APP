import {
  AchievementItem,
  AnalyticsSummary,
  Challenge,
  ChallengeDayEntry,
  ChallengeDerivedMetrics,
  ChallengeOutcome,
  ChallengeStatus,
  WeekdayStat,
} from '../types/challenge';
import { addDays, diffDays, getDateRange, getLocalTodayDateKey, getWeekdayIndex } from './dateUtils';

function uniqueSortedDates(dates: string[]): string[] {
  return Array.from(new Set(dates)).sort();
}

export interface CreateChallengeInput {
  name: string;
  description: string;
  durationDays: number;
  startImmediately: boolean;
  todayKey?: string;
}

export function createChallenge(input: CreateChallengeInput): Challenge {
  const todayKey = input.todayKey ?? getLocalTodayDateKey();
  const durationDays = Math.max(1, Math.min(365, Math.round(input.durationDays)));
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `chl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const startDate = input.startImmediately ? todayKey : null;
  const endDate = startDate ? addDays(startDate, durationDays - 1) : null;
  const status: ChallengeStatus = input.startImmediately ? 'IN_PROGRESS' : 'NOT_STARTED';

  return {
    id,
    name: input.name.trim(),
    description: input.description.trim(),
    durationDays,
    startDate,
    endDate,
    status,
    createdAt: new Date().toISOString(),
    completedDates: [],
    missedDates: [],
    outcome: null,
    checkInTimes: {},
  };
}

export function startChallenge(challenge: Challenge, todayKey: string): Challenge {
  if (challenge.status !== 'NOT_STARTED') {
    return challenge;
  }
  const startDate = todayKey;
  const endDate = addDays(startDate, challenge.durationDays - 1);
  return {
    ...challenge,
    startDate,
    endDate,
    status: 'IN_PROGRESS',
    completedDates: [],
    missedDates: [],
    outcome: null,
  };
}

/**
 * Reconciles missed dates and end-of-challenge evaluation strictly from calendar dates.
 * Never marks missed days as complete automatically.
 */
export function reconcileChallenge(challenge: Challenge, todayKey: string): Challenge {
  if (challenge.status === 'NOT_STARTED' || !challenge.startDate || !challenge.endDate) {
    return challenge;
  }

  const allDates = getDateRange(challenge.startDate, challenge.durationDays);
  const validDateSet = new Set(allDates);
  const completedDates = uniqueSortedDates(
    challenge.completedDates.filter((d) => validDateSet.has(d) && d <= todayKey)
  );
  const completedSet = new Set(completedDates);

  // Past days strictly before todayKey (and within startDate..endDate) that were not completed
  const missedDates = allDates.filter((d) => d < todayKey && !completedSet.has(d));

  let status: ChallengeStatus = challenge.status;
  let outcome: ChallengeOutcome | null = challenge.outcome;

  if (todayKey > challenge.endDate) {
    // Rule 10, 11, 12: Evaluate completion after scheduled end date
    if (completedDates.length === challenge.durationDays) {
      status = 'COMPLETED';
      outcome = 'SUCCESSFUL';
    } else if (completedDates.length > 0) {
      status = 'COMPLETED';
      outcome = 'COMPLETED_WITH_MISSED_DAYS';
    } else {
      status = 'EXPIRED';
      outcome = 'COMPLETED_WITH_MISSED_DAYS';
    }
  } else if (status !== 'IN_PROGRESS') {
    // If restored/edited while still within window
    status = 'IN_PROGRESS';
    outcome = null;
  }

  const changed =
    status !== challenge.status ||
    outcome !== challenge.outcome ||
    completedDates.length !== challenge.completedDates.length ||
    missedDates.length !== challenge.missedDates.length ||
    missedDates.some((d, idx) => d !== challenge.missedDates[idx]);

  if (!changed) {
    return challenge;
  }

  return {
    ...challenge,
    completedDates,
    missedDates,
    status,
    outcome,
  };
}

/**
 * Records a daily check-in for todayKey only.
 * Enforces: active IN_PROGRESS state, within startDate..endDate, no duplicates, no future/past dates.
 */
export function checkInChallengeToday(
  challenge: Challenge,
  todayKey: string,
  nowIso: string = new Date().toISOString()
): { updated: Challenge; accepted: boolean; reason?: string } {
  const reconciled = reconcileChallenge(challenge, todayKey);

  if (reconciled.status !== 'IN_PROGRESS' || !reconciled.startDate || !reconciled.endDate) {
    return { updated: reconciled, accepted: false, reason: 'Challenge is not currently active.' };
  }

  if (todayKey < reconciled.startDate) {
    return { updated: reconciled, accepted: false, reason: 'Challenge has not started yet.' };
  }

  if (todayKey > reconciled.endDate) {
    return { updated: reconciled, accepted: false, reason: 'Challenge has already ended.' };
  }

  if (reconciled.completedDates.includes(todayKey)) {
    return { updated: reconciled, accepted: false, reason: 'Already checked in today.' };
  }

  const completedDates = uniqueSortedDates([...reconciled.completedDates, todayKey]);
  const checkInTimes = {
    ...(reconciled.checkInTimes ?? {}),
    [todayKey]: nowIso,
  };

  const updated = reconcileChallenge(
    {
      ...reconciled,
      completedDates,
      checkInTimes,
    },
    todayKey
  );

  return { updated, accepted: true };
}

/**
 * Computes all derived Countdown and Streak metrics dynamically from stored dates.
 * Countdown (elapsed/remaining calendar time) and Streak (consecutive completed days)
 * are strictly independent metrics.
 */
export function computeChallengeMetrics(
  challenge: Challenge,
  todayKey: string
): ChallengeDerivedMetrics {
  const reconciled = reconcileChallenge(challenge, todayKey);
  const { durationDays, startDate, endDate, completedDates, missedDates } = reconciled;
  const completedSet = new Set(completedDates);
  const missedSet = new Set(missedDates);

  if (!startDate || !endDate || reconciled.status === 'NOT_STARTED') {
    const days: ChallengeDayEntry[] = Array.from({ length: durationDays }, (_, i) => ({
      dayNumber: i + 1,
      dateKey: null,
      state: 'UNSCHEDULED',
      checkInTime: null,
      isToday: false,
    }));

    return {
      currentDay: 0,
      elapsedDays: 0,
      remainingDays: durationDays,
      completedCount: 0,
      missedCount: 0,
      upcomingCount: durationDays,
      completionPercentage: 0,
      pacePercentage: 0,
      currentStreak: 0,
      longestStreak: 0,
      isCheckedInToday: false,
      canCheckInToday: false,
      hasEndedByCalendar: false,
      days,
    };
  }

  const allDates = getDateRange(startDate, durationDays);
  const hasEndedByCalendar = todayKey > endDate;
  const isBeforeStart = todayKey < startDate;

  let currentDay = 0;
  if (isBeforeStart) {
    currentDay = 0;
  } else if (hasEndedByCalendar) {
    currentDay = durationDays;
  } else {
    currentDay = diffDays(startDate, todayKey) + 1;
  }

  // Elapsed calendar days completed prior to today (or full duration once ended)
  const elapsedDays = isBeforeStart
    ? 0
    : hasEndedByCalendar
    ? durationDays
    : Math.max(0, Math.min(durationDays, diffDays(startDate, todayKey)));

  // Remaining days in challenge window (including today while active; 0 once past endDate)
  const remainingDays = Math.max(0, durationDays - elapsedDays);

  const isCheckedInToday =
    !isBeforeStart && !hasEndedByCalendar && completedSet.has(todayKey);

  const canCheckInToday =
    reconciled.status === 'IN_PROGRESS' &&
    !isBeforeStart &&
    !hasEndedByCalendar &&
    !isCheckedInToday;

  // Compute Longest Streak across all scheduled challenge days
  let longestStreak = 0;
  let running = 0;
  for (const dateKey of allDates) {
    if (completedSet.has(dateKey)) {
      running += 1;
      if (running > longestStreak) longestStreak = running;
    } else {
      running = 0;
    }
  }

  // Compute Current Consecutive Streak:
  // If ended: trailing consecutive run ending at endDate.
  // If active: if checked in today, count backward from todayKey;
  // if not checked in today yet, count backward from yesterdayKey (0 if yesterday was missed).
  let currentStreak = 0;
  if (!isBeforeStart) {
    let cursorKey: string;
    if (hasEndedByCalendar) {
      cursorKey = endDate;
    } else if (isCheckedInToday) {
      cursorKey = todayKey;
    } else {
      cursorKey = addDays(todayKey, -1);
    }

    while (cursorKey >= startDate && completedSet.has(cursorKey)) {
      currentStreak += 1;
      cursorKey = addDays(cursorKey, -1);
    }
  }

  const days: ChallengeDayEntry[] = allDates.map((dateKey, idx) => {
    const isToday = dateKey === todayKey;
    let state: ChallengeDayEntry['state'];
    if (completedSet.has(dateKey)) {
      state = 'COMPLETED';
    } else if (missedSet.has(dateKey)) {
      state = 'MISSED';
    } else if (isToday) {
      state = 'TODAY_PENDING';
    } else {
      state = 'UPCOMING';
    }

    return {
      dayNumber: idx + 1,
      dateKey,
      state,
      checkInTime: reconciled.checkInTimes?.[dateKey] ?? null,
      isToday,
    };
  });

  const completedCount = completedDates.length;
  const missedCount = missedDates.length;
  const upcomingCount = Math.max(0, durationDays - completedCount - missedCount);
  const completionPercentage = Math.round((completedCount / durationDays) * 100);
  const scheduledSoFar = hasEndedByCalendar
    ? durationDays
    : isBeforeStart
    ? 0
    : isCheckedInToday
    ? currentDay
    : Math.max(1, currentDay - 1);
  const pacePercentage =
    scheduledSoFar > 0 ? Math.round((completedCount / scheduledSoFar) * 100) : 0;

  return {
    currentDay,
    elapsedDays,
    remainingDays,
    completedCount,
    missedCount,
    upcomingCount,
    completionPercentage,
    pacePercentage: Math.min(100, pacePercentage),
    currentStreak,
    longestStreak,
    isCheckedInToday,
    canCheckInToday,
    hasEndedByCalendar,
    days,
  };
}

export function computeAnalytics(
  activeChallenge: Challenge | null,
  history: Challenge[],
  todayKey: string
): AnalyticsSummary {
  const allChallenges = activeChallenge ? [activeChallenge, ...history] : [...history];
  const finishedChallenges = history;

  const totalChallengesCompleted = finishedChallenges.length;
  const successfulChallenges = finishedChallenges.filter(
    (c) => c.outcome === 'SUCCESSFUL'
  ).length;

  let totalCheckIns = 0;
  let totalMissedDays = 0;
  let totalScheduledDays = 0;
  let allTimeLongestStreak = 0;

  const weekdayBuckets: Array<{ completed: number; scheduled: number }> = Array.from(
    { length: 7 },
    () => ({ completed: 0, scheduled: 0 })
  );

  for (const ch of allChallenges) {
    const metrics = computeChallengeMetrics(ch, todayKey);
    totalCheckIns += metrics.completedCount;
    totalMissedDays += metrics.missedCount;
    if (metrics.longestStreak > allTimeLongestStreak) {
      allTimeLongestStreak = metrics.longestStreak;
    }

    for (const day of metrics.days) {
      if (!day.dateKey) continue;
      if (day.state === 'COMPLETED' || day.state === 'MISSED') {
        totalScheduledDays += 1;
        const w = getWeekdayIndex(day.dateKey);
        weekdayBuckets[w].scheduled += 1;
        if (day.state === 'COMPLETED') {
          weekdayBuckets[w].completed += 1;
        }
      }
    }
  }

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Order Mon..Sun for cleaner weekly cadence reading
  const orderedIndices = [1, 2, 3, 4, 5, 6, 0];
  const weekdayStats: WeekdayStat[] = orderedIndices.map((idx) => {
    const bucket = weekdayBuckets[idx];
    return {
      dayIndex: idx,
      label: weekdayNames[idx],
      completed: bucket.completed,
      scheduled: bucket.scheduled,
      rate: bucket.scheduled > 0 ? Math.round((bucket.completed / bucket.scheduled) * 100) : 0,
    };
  });

  const overallCompletionRate =
    totalScheduledDays > 0 ? Math.round((totalCheckIns / totalScheduledDays) * 100) : 0;

  const recentChallenges = allChallenges.slice(0, 8).map((ch) => {
    const m = computeChallengeMetrics(ch, todayKey);
    return {
      id: ch.id,
      name: ch.name,
      durationDays: ch.durationDays,
      completedCount: m.completedCount,
      missedCount: m.missedCount,
      completionPercentage: m.completionPercentage,
      status: ch.status,
      outcome: ch.outcome,
    };
  });

  return {
    totalChallengesCompleted,
    successfulChallenges,
    totalCheckIns,
    totalMissedDays,
    overallCompletionRate,
    allTimeLongestStreak,
    weekdayStats,
    recentChallenges,
  };
}

export function computeAchievements(
  activeChallenge: Challenge | null,
  history: Challenge[],
  todayKey: string
): AchievementItem[] {
  const analytics = computeAnalytics(activeChallenge, history, todayKey);
  const has21DaySuccess = history.some(
    (c) => c.durationDays >= 21 && c.outcome === 'SUCCESSFUL'
  );
  const hasAnySuccess = history.some((c) => c.outcome === 'SUCCESSFUL');

  // Detect comeback resilience: missed at least 1 day in a challenge and still checked in again afterwards
  const allChallenges = activeChallenge ? [activeChallenge, ...history] : [...history];
  const hasComeback = allChallenges.some((c) => {
    if (c.missedDates.length === 0 || c.completedDates.length === 0) return false;
    const firstMissed = c.missedDates[0];
    return c.completedDates.some((d) => d > firstMissed);
  });

  return [
    {
      id: 'first-checkin',
      title: 'Day One',
      description: 'Complete your first daily challenge check-in.',
      requirementLabel: '1 total check-in',
      unlocked: analytics.totalCheckIns >= 1,
      progressCurrent: Math.min(1, analytics.totalCheckIns),
      progressTarget: 1,
    },
    {
      id: 'streak-7',
      title: 'Seven-Day Momentum',
      description: 'Maintain an unbroken 7-day consecutive check-in streak.',
      requirementLabel: '7-day streak',
      unlocked: analytics.allTimeLongestStreak >= 7,
      progressCurrent: Math.min(7, analytics.allTimeLongestStreak),
      progressTarget: 7,
    },
    {
      id: 'streak-14',
      title: 'Two-Week Anchor',
      description: 'Chain together 14 consecutive days without a miss.',
      requirementLabel: '14-day streak',
      unlocked: analytics.allTimeLongestStreak >= 14,
      progressCurrent: Math.min(14, analytics.allTimeLongestStreak),
      progressTarget: 14,
    },
    {
      id: 'streak-21',
      title: '21-Day Mastery',
      description: 'Reach a 21-day consecutive streak in any challenge.',
      requirementLabel: '21-day streak',
      unlocked: analytics.allTimeLongestStreak >= 21,
      progressCurrent: Math.min(21, analytics.allTimeLongestStreak),
      progressTarget: 21,
    },
    {
      id: 'perfect-challenge',
      title: 'Zero-Miss Finisher',
      description: 'Finish a challenge with 100% completion and zero missed days.',
      requirementLabel: '1 successful challenge',
      unlocked: hasAnySuccess,
      progressCurrent: hasAnySuccess ? 1 : 0,
      progressTarget: 1,
    },
    {
      id: 'perfect-21',
      title: '21-Day Clean Sweep',
      description: 'Complete a full 21+ day challenge with a SUCCESSFUL outcome.',
      requirementLabel: '21+ day clean sweep',
      unlocked: has21DaySuccess,
      progressCurrent: has21DaySuccess ? 1 : 0,
      progressTarget: 1,
    },
    {
      id: 'comeback',
      title: 'Resilient Return',
      description: 'Check back in and rebuild after missing a day.',
      requirementLabel: 'Check in after a missed day',
      unlocked: hasComeback,
      progressCurrent: hasComeback ? 1 : 0,
      progressTarget: 1,
    },
    {
      id: 'total-50',
      title: 'Fifty Check-Ins',
      description: 'Accumulate 50 verified daily check-ins across all challenges.',
      requirementLabel: '50 total check-ins',
      unlocked: analytics.totalCheckIns >= 50,
      progressCurrent: Math.min(50, analytics.totalCheckIns),
      progressTarget: 50,
    },
  ];
}
