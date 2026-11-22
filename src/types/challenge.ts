export type ChallengeStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'EXPIRED';

export type ChallengeOutcome =
  | 'SUCCESSFUL'
  | 'COMPLETED_WITH_MISSED_DAYS';

export type DayEntryState =
  | 'COMPLETED'
  | 'MISSED'
  | 'TODAY_PENDING'
  | 'UPCOMING'
  | 'UNSCHEDULED';

export interface Challenge {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  startDate: string | null;
  endDate: string | null;
  status: ChallengeStatus;
  createdAt: string;
  completedDates: string[];
  missedDates: string[];
  outcome: ChallengeOutcome | null;
  checkInTimes?: Record<string, string>;
}

export interface ChallengeDayEntry {
  dayNumber: number;
  dateKey: string | null;
  state: DayEntryState;
  checkInTime: string | null;
  isToday: boolean;
}

export interface ChallengeDerivedMetrics {
  currentDay: number;
  elapsedDays: number;
  remainingDays: number;
  completedCount: number;
  missedCount: number;
  upcomingCount: number;
  completionPercentage: number;
  pacePercentage: number;
  currentStreak: number;
  longestStreak: number;
  isCheckedInToday: boolean;
  canCheckInToday: boolean;
  hasEndedByCalendar: boolean;
  days: ChallengeDayEntry[];
}

export interface ReminderSettings {
  enabled: boolean;
  time: string; // HH:mm 24h format
  lastNotifiedDate: string | null;
}

export interface AppPreferences {
  theme: 'light' | 'dark';
  reminder: ReminderSettings;
}

export interface PersistedAppState {
  version: number;
  activeChallenge: Challenge | null;
  history: Challenge[];
  preferences: AppPreferences;
}

export type PageId =
  | 'dashboard'
  | 'create'
  | 'calendar'
  | 'analytics'
  | 'history'
  | 'achievements'
  | 'settings';

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  requirementLabel: string;
  unlocked: boolean;
  progressCurrent: number;
  progressTarget: number;
  unlockedContext?: string;
}

export interface WeekdayStat {
  dayIndex: number;
  label: string;
  completed: number;
  scheduled: number;
  rate: number;
}

export interface AnalyticsSummary {
  totalChallengesCompleted: number;
  successfulChallenges: number;
  totalCheckIns: number;
  totalMissedDays: number;
  overallCompletionRate: number;
  allTimeLongestStreak: number;
  weekdayStats: WeekdayStat[];
  recentChallenges: Array<{
    id: string;
    name: string;
    durationDays: number;
    completedCount: number;
    missedCount: number;
    completionPercentage: number;
    status: ChallengeStatus;
    outcome: ChallengeOutcome | null;
  }>;
}
