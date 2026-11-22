import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  PlusCircle,
  XCircle,
} from 'lucide-react';
import { Challenge, ChallengeDayEntry, PageId } from '../types/challenge';
import { computeChallengeMetrics } from '../utils/challengeEngine';
import {
  formatCheckInTime,
  formatDisplayDate,
  formatShortDate,
  getWeekdayLabel,
} from '../utils/dateUtils';

interface CalendarPageProps {
  todayKey: string;
  activeChallenge: Challenge | null;
  history: Challenge[];
  onCheckInToday: () => { accepted: boolean; reason?: string };
  onNavigate: (page: PageId) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  todayKey,
  activeChallenge,
  history,
  onCheckInToday,
  onNavigate,
}) => {
  const allSelectable = activeChallenge ? [activeChallenge, ...history] : history;
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(
    activeChallenge?.id ?? history[0]?.id ?? ''
  );

  // Keep selectedChallengeId valid when activeChallenge changes
  useEffect(() => {
    if (activeChallenge && !allSelectable.some((c) => c.id === selectedChallengeId)) {
      setSelectedChallengeId(activeChallenge.id);
    } else if (!selectedChallengeId && allSelectable.length > 0) {
      setSelectedChallengeId(allSelectable[0].id);
    }
  }, [activeChallenge, allSelectable, selectedChallengeId]);

  const selectedChallenge =
    allSelectable.find((c) => c.id === selectedChallengeId) ?? allSelectable[0] ?? null;

  const metrics = selectedChallenge
    ? computeChallengeMetrics(selectedChallenge, todayKey)
    : null;

  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);

  useEffect(() => {
    if (!metrics) return;
    const todayItem = metrics.days.find((d) => d.isToday);
    setSelectedDayNum(todayItem ? todayItem.dayNumber : 1);
  }, [selectedChallenge?.id]);

  if (!selectedChallenge || !metrics) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <CalendarDays className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
        <h2 className="mt-4 font-display text-xl font-bold text-slate-900 dark:text-white">
          No Challenge Calendar Yet
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Start a 21-day or custom challenge to inspect every calendar day, check-in timestamps, and
          upcoming milestones.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('create')}
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          <span>Create Challenge</span>
        </button>
      </section>
    );
  }

  const inspectedDay: ChallengeDayEntry =
    metrics.days.find((d) => d.dayNumber === selectedDayNum) ?? metrics.days[0];

  return (
    <div className="space-y-6">
      {/* Header & Challenge Selector */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {selectedChallenge.status === 'IN_PROGRESS'
                ? 'Active Challenge'
                : selectedChallenge.status === 'NOT_STARTED'
                ? 'Not Started Draft'
                : 'Historical Challenge'}
              {selectedChallenge.startDate && selectedChallenge.endDate && (
                <span className="tabular-nums">
                  {' '}
                  · {formatDisplayDate(selectedChallenge.startDate)} –{' '}
                  {formatDisplayDate(selectedChallenge.endDate)}
                </span>
              )}
            </div>
            <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {selectedChallenge.name}
            </h2>
          </div>

          {allSelectable.length > 1 && (
            <div className="shrink-0">
              <label htmlFor="calendar-challenge-select" className="sr-only">
                Select challenge calendar
              </label>
              <select
                id="calendar-challenge-select"
                value={selectedChallenge.id}
                onChange={(e) => setSelectedChallengeId(e.target.value)}
                className="min-h-[44px] w-full sm:w-64 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                {allSelectable.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name} ({ch.durationDays}d)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Status Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            Completed ({metrics.completedCount})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
            Missed ({metrics.missedCount})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-600 dark:text-slate-300" aria-hidden="true" />
            Upcoming ({metrics.upcomingCount})
          </span>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        {/* Calendar Day Grid */}
        <section
          aria-label="Challenge day-by-day grid"
          className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 md:grid-cols-7">
            {metrics.days.map((day) => {
              const isSelected = day.dayNumber === inspectedDay.dayNumber;

              let tileClass =
                'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300';
              let labelText = 'Upcoming';
              let icon: React.ReactNode = (
                <Clock className="h-4 w-4 text-slate-400" aria-hidden="true" />
              );

              if (day.state === 'COMPLETED') {
                tileClass =
                  'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-800/80 dark:bg-emerald-950/60 dark:text-emerald-100';
                labelText = 'Done';
                icon = (
                  <CheckCircle2
                    className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                );
              } else if (day.state === 'MISSED') {
                tileClass =
                  'border-red-200 bg-red-50 text-red-950 dark:border-red-900/80 dark:bg-red-950/50 dark:text-red-100';
                labelText = 'Missed';
                icon = (
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
                );
              } else if (day.state === 'TODAY_PENDING') {
                tileClass =
                  'border-slate-900 bg-white text-slate-900 dark:border-emerald-400 dark:bg-slate-900 dark:text-white';
                labelText = 'Today';
                icon = (
                  <Clock className="h-4 w-4 text-slate-900 dark:text-emerald-400" aria-hidden="true" />
                );
              } else if (day.state === 'UNSCHEDULED') {
                labelText = 'Draft';
              }

              return (
                <button
                  key={day.dayNumber}
                  type="button"
                  onClick={() => setSelectedDayNum(day.dayNumber)}
                  className={`flex min-h-[78px] flex-col justify-between rounded-xl border p-2.5 text-left transition-colors ${tileClass} ${
                    isSelected
                      ? 'ring-2 ring-slate-900 ring-offset-1 dark:ring-emerald-400 dark:ring-offset-slate-900'
                      : 'hover:border-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-1">
                    <span className="text-xs font-bold tabular-nums">D{day.dayNumber}</span>
                    {icon}
                  </div>
                  <div className="mt-2">
                    <div className="text-[11px] font-medium opacity-80 tabular-nums">
                      {day.dateKey ? formatShortDate(day.dateKey) : 'Unscheduled'}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide opacity-75">
                      {labelText}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Day Inspection Panel */}
        <aside className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Day Inspection
          </div>
          <h3 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            Day {inspectedDay.dayNumber} of {selectedChallenge.durationDays}
          </h3>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300 tabular-nums">
            {inspectedDay.dateKey
              ? `${getWeekdayLabel(inspectedDay.dateKey)}, ${formatDisplayDate(
                  inspectedDay.dateKey
                )}`
              : 'Dates assigned once challenge starts'}
          </p>

          <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Status</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">
                {inspectedDay.state === 'COMPLETED' && 'Completed'}
                {inspectedDay.state === 'MISSED' && 'Missed'}
                {inspectedDay.state === 'TODAY_PENDING' && 'Pending Today'}
                {inspectedDay.state === 'UPCOMING' && 'Upcoming'}
                {inspectedDay.state === 'UNSCHEDULED' && 'Not Started'}
              </dd>
            </div>
            {inspectedDay.dateKey && (
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Date Key</dt>
                <dd className="font-mono text-xs text-slate-700 dark:text-slate-300 tabular-nums">
                  {inspectedDay.dateKey}
                </dd>
              </div>
            )}
            {inspectedDay.state === 'COMPLETED' && inspectedDay.checkInTime && (
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Checked In</dt>
                <dd className="font-medium text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {formatCheckInTime(inspectedDay.checkInTime)}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
            {inspectedDay.state === 'TODAY_PENDING' &&
            selectedChallenge.id === activeChallenge?.id &&
            metrics.canCheckInToday ? (
              <button
                type="button"
                onClick={onCheckInToday}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                <span>Check In Today</span>
              </button>
            ) : inspectedDay.state === 'UPCOMING' ? (
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Future dates cannot be checked in early. Return on{' '}
                <span className="font-medium text-slate-700 dark:text-slate-200 tabular-nums">
                  {inspectedDay.dateKey ? formatDisplayDate(inspectedDay.dateKey) : 'this day'}
                </span>{' '}
                to log completion.
              </p>
            ) : inspectedDay.state === 'MISSED' ? (
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                This calendar date passed without a check-in. Missed days are preserved accurately in
                your challenge record.
              </p>
            ) : inspectedDay.state === 'COMPLETED' ? (
              <p className="text-xs leading-relaxed text-emerald-700 dark:text-emerald-400">
                Daily check-in verified for this date.
              </p>
            ) : (
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Start the challenge from the Dashboard to activate daily tracking.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
