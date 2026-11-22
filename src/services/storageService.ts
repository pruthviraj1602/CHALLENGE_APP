import {
  AppPreferences,
  Challenge,
  ChallengeOutcome,
  ChallengeStatus,
  PersistedAppState,
} from '../types/challenge';
import { addDays, isValidDateKey } from '../utils/dateUtils';

const STORAGE_KEY = 'streak_tracker_21d_state_v1';
const CURRENT_SCHEMA_VERSION = 1;

export interface StorageAdapter {
  load(): { state: PersistedAppState; corrupted: boolean };
  save(state: PersistedAppState): boolean;
  clear(): void;
}

export function getDefaultPreferences(): AppPreferences {
  return {
    theme: 'light',
    reminder: {
      enabled: false,
      time: '20:00',
      lastNotifiedDate: null,
    },
  };
}

export function getDefaultState(): PersistedAppState {
  return {
    version: CURRENT_SCHEMA_VERSION,
    activeChallenge: null,
    history: [],
    preferences: getDefaultPreferences(),
  };
}

const VALID_STATUSES: ChallengeStatus[] = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'EXPIRED',
];

const VALID_OUTCOMES: ChallengeOutcome[] = [
  'SUCCESSFUL',
  'COMPLETED_WITH_MISSED_DAYS',
];

function validateChallengeRecord(raw: unknown, label: string): Challenge {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`${label} must be an object.`);
  }
  const obj = raw as Record<string, unknown>;

  if (typeof obj.id !== 'string' || obj.id.trim().length === 0) {
    throw new Error(`${label} is missing a valid id.`);
  }
  if (typeof obj.name !== 'string' || obj.name.trim().length === 0) {
    throw new Error(`${label} is missing a challenge name.`);
  }
  if (typeof obj.description !== 'string') {
    throw new Error(`${label} has an invalid description.`);
  }
  if (
    typeof obj.durationDays !== 'number' ||
    !Number.isInteger(obj.durationDays) ||
    obj.durationDays < 1 ||
    obj.durationDays > 365
  ) {
    throw new Error(`${label} has an invalid durationDays (must be integer 1–365).`);
  }
  if (
    typeof obj.status !== 'string' ||
    !VALID_STATUSES.includes(obj.status as ChallengeStatus)
  ) {
    throw new Error(`${label} has an unsupported status.`);
  }

  const startDate = obj.startDate === null || obj.startDate === undefined ? null : obj.startDate;
  const endDate = obj.endDate === null || obj.endDate === undefined ? null : obj.endDate;

  if (obj.status === 'NOT_STARTED') {
    if (startDate !== null && !isValidDateKey(startDate)) {
      throw new Error(`${label} has an invalid startDate.`);
    }
  } else {
    if (!isValidDateKey(startDate) || !isValidDateKey(endDate)) {
      throw new Error(`${label} requires valid YYYY-MM-DD startDate and endDate.`);
    }
    const expectedEnd = addDays(startDate, obj.durationDays - 1);
    if (endDate !== expectedEnd) {
      throw new Error(`${label} endDate does not match startDate + durationDays.`);
    }
  }

  if (!Array.isArray(obj.completedDates) || !obj.completedDates.every(isValidDateKey)) {
    throw new Error(`${label} completedDates must be an array of YYYY-MM-DD dates.`);
  }
  if (!Array.isArray(obj.missedDates) || !obj.missedDates.every(isValidDateKey)) {
    throw new Error(`${label} missedDates must be an array of YYYY-MM-DD dates.`);
  }

  const outcome = obj.outcome === null || obj.outcome === undefined ? null : obj.outcome;
  if (
    outcome !== null &&
    (typeof outcome !== 'string' || !VALID_OUTCOMES.includes(outcome as ChallengeOutcome))
  ) {
    throw new Error(`${label} has an invalid outcome.`);
  }

  const createdAt =
    typeof obj.createdAt === 'string' && obj.createdAt.length > 0
      ? obj.createdAt
      : new Date().toISOString();

  const checkInTimes: Record<string, string> = {};
  if (obj.checkInTimes && typeof obj.checkInTimes === 'object') {
    for (const [k, v] of Object.entries(obj.checkInTimes as Record<string, unknown>)) {
      if (isValidDateKey(k) && typeof v === 'string') {
        checkInTimes[k] = v;
      }
    }
  }

  return {
    id: obj.id.trim(),
    name: obj.name.trim(),
    description: obj.description,
    durationDays: obj.durationDays,
    startDate: startDate as string | null,
    endDate: endDate as string | null,
    status: obj.status as ChallengeStatus,
    createdAt,
    completedDates: Array.from(new Set(obj.completedDates as string[])).sort(),
    missedDates: Array.from(new Set(obj.missedDates as string[])).sort(),
    outcome: outcome as ChallengeOutcome | null,
    checkInTimes,
  };
}

function validatePreferences(raw: unknown): AppPreferences {
  const defaults = getDefaultPreferences();
  if (!raw || typeof raw !== 'object') return defaults;
  const obj = raw as Record<string, unknown>;
  const theme = obj.theme === 'dark' ? 'dark' : 'light';

  let reminder = defaults.reminder;
  if (obj.reminder && typeof obj.reminder === 'object') {
    const r = obj.reminder as Record<string, unknown>;
    const timeValid =
      typeof r.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(r.time);
    reminder = {
      enabled: Boolean(r.enabled),
      time: timeValid ? (r.time as string) : defaults.reminder.time,
      lastNotifiedDate: isValidDateKey(r.lastNotifiedDate) ? r.lastNotifiedDate : null,
    };
  }

  return { theme, reminder };
}

export function validatePersistedState(raw: unknown): PersistedAppState {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Backup file must contain a JSON object.');
  }
  const obj = raw as Record<string, unknown>;

  if (typeof obj.version !== 'number' || obj.version < 1) {
    throw new Error('Missing or unsupported backup schema version.');
  }

  const activeChallenge =
    obj.activeChallenge === null || obj.activeChallenge === undefined
      ? null
      : validateChallengeRecord(obj.activeChallenge, 'activeChallenge');

  if (!Array.isArray(obj.history)) {
    throw new Error('Backup history must be an array.');
  }
  const history = obj.history.map((item, index) =>
    validateChallengeRecord(item, `history[${index}]`)
  );

  const preferences = validatePreferences(obj.preferences);

  return {
    version: CURRENT_SCHEMA_VERSION,
    activeChallenge,
    history,
    preferences,
  };
}

export function parseAndValidateBackupJson(jsonText: string): {
  valid: boolean;
  state?: PersistedAppState;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonText);
    // Support wrapper payload { exportedAt, app, data } or direct PersistedAppState
    const candidate =
      parsed && typeof parsed === 'object' && 'data' in parsed && !('history' in parsed)
        ? (parsed as { data: unknown }).data
        : parsed;
    const state = validatePersistedState(candidate);
    return { valid: true, state };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Invalid JSON backup payload.',
    };
  }
}

export function exportBackupJson(state: PersistedAppState): string {
  const payload = {
    app: '21-Day Streak Tracker',
    exportedAt: new Date().toISOString(),
    data: state,
  };
  return JSON.stringify(payload, null, 2);
}

class LocalStorageAdapter implements StorageAdapter {
  load(): { state: PersistedAppState; corrupted: boolean } {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { state: getDefaultState(), corrupted: false };
      }
      const parsed = JSON.parse(raw);
      const state = validatePersistedState(parsed);
      return { state, corrupted: false };
    } catch {
      return { state: getDefaultState(), corrupted: true };
    }
  }

  save(state: PersistedAppState): boolean {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  }

  clear(): void {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage access errors
    }
  }
}

export const storageService: StorageAdapter = new LocalStorageAdapter();
