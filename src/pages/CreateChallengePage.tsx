import React, { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Info, Play, Sparkles } from 'lucide-react';
import { Challenge, PageId } from '../types/challenge';
import { addDays, formatDisplayDate } from '../utils/dateUtils';

interface CreateChallengePageProps {
  todayKey: string;
  activeChallenge: Challenge | null;
  onCreateChallenge: (input: {
    name: string;
    description: string;
    durationDays: number;
    startImmediately: boolean;
  }) => { ok: boolean; error?: string };
  onNavigate: (page: PageId) => void;
}

const PRESET_DURATIONS = [
  { days: 21, label: '21 Days (Classic)' },
  { days: 7, label: '7 Days' },
  { days: 14, label: '14 Days' },
  { days: 30, label: '30 Days' },
];

const STARTER_IDEAS = [
  {
    name: 'Morning Deep Work',
    description: 'Complete 60 minutes of focused, distraction-free work before checking messages.',
    days: 21,
  },
  {
    name: 'Daily 30m Reading',
    description: 'Read at least 30 minutes of non-fiction or literature every single day.',
    days: 21,
  },
  {
    name: 'Zero Added Sugar',
    description: 'Avoid sugary drinks, desserts, and snacks with added refined sugar.',
    days: 21,
  },
  {
    name: '10,000 Daily Steps',
    description: 'Hit a minimum of 10,000 steps before midnight every calendar day.',
    days: 21,
  },
];

export const CreateChallengePage: React.FC<CreateChallengePageProps> = ({
  todayKey,
  activeChallenge,
  onCreateChallenge,
  onNavigate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMode, setDurationMode] = useState<'preset' | 'custom'>('preset');
  const [durationDays, setDurationDays] = useState<number>(21);
  const [customDaysInput, setCustomDaysInput] = useState<string>('45');
  const [startImmediately, setStartImmediately] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const effectiveDuration = useMemo(() => {
    if (durationMode === 'preset') return durationDays;
    const parsed = Number(customDaysInput);
    if (!Number.isInteger(parsed) || parsed < 1) return 1;
    if (parsed > 365) return 365;
    return parsed;
  }, [durationMode, durationDays, customDaysInput]);

  const previewEndDate = useMemo(
    () => addDays(todayKey, effectiveDuration - 1),
    [todayKey, effectiveDuration]
  );

  // Enforce Rule #2: Only one challenge can be active at a time
  if (activeChallenge) {
    return (
      <div className="mx-auto max-w-2xl">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-slate-600 dark:text-slate-300" aria-hidden="true" />
            <div className="space-y-3">
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                One Active Challenge at a Time
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                You currently have{' '}
                <strong className="text-slate-900 dark:text-white">{activeChallenge.name}</strong>{' '}
                ({activeChallenge.status === 'NOT_STARTED' ? 'Not Started' : 'In Progress'}). To
                keep daily accountability clear, a new challenge can only be created once the
                current challenge finishes after its end date
                {activeChallenge.status === 'NOT_STARTED'
                  ? ' or if you discard the unstarted draft.'
                  : '.'}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="min-h-[44px] rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setErrorMsg('Please enter a challenge name (at least 2 characters).');
      return;
    }

    if (durationMode === 'custom') {
      const parsed = Number(customDaysInput);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 365) {
        setErrorMsg('Custom duration must be a whole number between 1 and 365 days.');
        return;
      }
    }

    const res = onCreateChallenge({
      name: trimmedName,
      description: description.trim(),
      durationDays: effectiveDuration,
      startImmediately,
    });

    if (!res.ok) {
      setErrorMsg(res.error ?? 'Could not create challenge.');
      return;
    }

    onNavigate('dashboard');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 space-y-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Design Your Challenge
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Choose the classic 21-day habit cycle or customize your own calendar duration.
          </p>
        </div>

        {/* Starter Templates */}
        <div className="space-y-2">
          <span className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            Quick Templates (Optional)
          </span>
          <div className="flex flex-wrap gap-2">
            {STARTER_IDEAS.map((idea) => (
              <button
                key={idea.name}
                type="button"
                onClick={() => {
                  setName(idea.name);
                  setDescription(idea.description);
                  setDurationMode('preset');
                  setDurationDays(idea.days);
                  setErrorMsg(null);
                }}
                className="min-h-[40px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
              >
                {idea.name}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge Name */}
        <div className="space-y-2">
          <label
            htmlFor="challenge-name"
            className="block text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            Challenge Name
          </label>
          <input
            id="challenge-name"
            type="text"
            maxLength={80}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., 21 Days of Morning Mobility"
            className="min-h-[46px] w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-500"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label
            htmlFor="challenge-desc"
            className="block text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            Commitment Rule / Description{' '}
            <span className="font-normal text-slate-500 dark:text-slate-400">(optional)</span>
          </label>
          <textarea
            id="challenge-desc"
            rows={3}
            maxLength={280}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Define what counts as a completed check-in each day."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-500"
          />
        </div>

        {/* Duration Selector */}
        <div className="space-y-3">
          <span className="block text-sm font-medium text-slate-800 dark:text-slate-200">
            Challenge Duration
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_DURATIONS.map((preset) => {
              const selected =
                durationMode === 'preset' && durationDays === preset.days;
              return (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => {
                    setDurationMode('preset');
                    setDurationDays(preset.days);
                  }}
                  className={`min-h-[44px] rounded-xl px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    selected
                      ? 'bg-slate-900 text-white dark:bg-emerald-600'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setDurationMode('custom')}
              className={`min-h-[44px] rounded-xl px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                durationMode === 'custom'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Custom Days
            </button>
          </div>

          {durationMode === 'custom' && (
            <div className="flex items-center gap-3 pt-1">
              <label htmlFor="custom-days" className="text-sm text-slate-600 dark:text-slate-300">
                Number of days (1–365):
              </label>
              <input
                id="custom-days"
                type="number"
                min={1}
                max={365}
                value={customDaysInput}
                onChange={(e) => setCustomDaysInput(e.target.value)}
                className="min-h-[44px] w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 tabular-nums focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-500"
              />
            </div>
          )}
        </div>

        {/* Start Timing */}
        <div className="space-y-3 border-t border-slate-100 pt-5 dark:border-slate-800">
          <span className="block text-sm font-medium text-slate-800 dark:text-slate-200">
            Start Timing
          </span>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setStartImmediately(true)}
              className={`flex min-h-[56px] items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                startImmediately
                  ? 'border-emerald-600 bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/40'
                  : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800'
              }`}
            >
              <Play
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  startImmediately
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400'
                }`}
                aria-hidden="true"
              />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  Start Today
                </div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Day 1 begins immediately on {formatDisplayDate(todayKey)}.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStartImmediately(false)}
              className={`flex min-h-[56px] items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                !startImmediately
                  ? 'border-slate-900 bg-slate-50 dark:border-emerald-500 dark:bg-slate-800'
                  : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  !startImmediately
                    ? 'text-slate-900 dark:text-emerald-400'
                    : 'text-slate-400'
                }`}
                aria-hidden="true"
              />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  Save as Not Started
                </div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Prepare the challenge now and press Start when you are ready.
                </div>
              </div>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
          >
            {errorMsg}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="min-h-[48px] rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex min-h-[48px] items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 whitespace-nowrap"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{startImmediately ? 'Create & Start Challenge' : 'Save Challenge Draft'}</span>
          </button>
        </div>
      </form>

      {/* Live Schedule Preview */}
      <aside className="lg:col-span-4 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>Schedule Preview</span>
          </div>

          <dl className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-slate-500 dark:text-slate-400">Duration</dt>
              <dd className="font-semibold text-slate-900 dark:text-white tabular-nums">
                {effectiveDuration} {effectiveDuration === 1 ? 'day' : 'days'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-slate-500 dark:text-slate-400">Start Date</dt>
              <dd className="font-medium text-slate-900 dark:text-white tabular-nums">
                {startImmediately ? formatDisplayDate(todayKey) : 'Upon manual start'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-slate-500 dark:text-slate-400">Scheduled End</dt>
              <dd className="font-medium text-slate-900 dark:text-white tabular-nums">
                {startImmediately
                  ? formatDisplayDate(previewEndDate)
                  : `${effectiveDuration - 1}d after start`}
              </dd>
            </div>
          </dl>

          <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Challenges cannot be paused once started. Every day from Day 1 through Day{' '}
            <span className="tabular-nums">{effectiveDuration}</span> runs on fixed calendar dates.
          </p>
        </div>
      </aside>
    </div>
  );
};
