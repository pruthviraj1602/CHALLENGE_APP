import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Flame,
  Play,
  PlusCircle,
  Trash2,
  Trophy,
  XCircle,
} from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DailyQuoteCard } from '../components/DailyQuoteCard';
import {
  Challenge,
  ChallengeDerivedMetrics,
  PageId,
} from '../types/challenge';
import { computeChallengeMetrics } from '../utils/challengeEngine';
import { formatCheckInTime, formatDisplayDate, formatShortDate } from '../utils/dateUtils';

interface DashboardPageProps {
  todayKey: string;
  activeChallenge: Challenge | null;
  activeMetrics: ChallengeDerivedMetrics | null;
  historyCount: number;
  justFinishedChallenge: Challenge | null;
  onDismissJustFinished: () => void;
  onCheckInToday: () => { accepted: boolean; reason?: string };
  onStartActiveChallenge: () => void;
  onDiscardNotStarted: () => void;
  onNavigate: (page: PageId) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  todayKey,
  activeChallenge,
  activeMetrics,
  historyCount,
  justFinishedChallenge,
  onDismissJustFinished,
  onCheckInToday,
  onStartActiveChallenge,
  onDiscardNotStarted,
  onNavigate,
}) => {
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState<string | null>(null);

  const handleCheckIn = () => {
    const res = onCheckInToday();
    if (res.accepted) {
      setCheckInMessage('Check-in recorded for today.');
    } else if (res.reason) {
      setCheckInMessage(res.reason);
    }
  };

  // Show evaluation summary card if a challenge just ended past its endDate
  const finishedMetrics = justFinishedChallenge
    ? computeChallengeMetrics(justFinishedChallenge, todayKey)
    : null;

  const renderJustFinishedBanner = () => {
    if (!justFinishedChallenge || !finishedMetrics) return null;
    const isSuccess = justFinishedChallenge.outcome === 'SUCCESSFUL';

    return (
      <section
        aria-label="Completed challenge evaluation"
        className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-300">
              {isSuccess ? (
                <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              )}
              <span>
                {isSuccess
                  ? 'Challenge Outcome: Successful'
                  : 'Challenge Outcome: Completed with Missed Days'}
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white text-balance">
              {justFinishedChallenge.name}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {justFinishedChallenge.startDate && justFinishedChallenge.endDate
                ? `${formatDisplayDate(justFinishedChallenge.startDate)} – ${formatDisplayDate(
                    justFinishedChallenge.endDate
                  )} · `
                : ''}
              <span className="tabular-nums">
                {finishedMetrics.completedCount} of {justFinishedChallenge.durationDays} days
                completed ({finishedMetrics.completionPercentage}%)
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                onDismissJustFinished();
                onNavigate('history');
              }}
              className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
            >
              View in History
            </button>
            <button
              type="button"
              onClick={() => {
                onDismissJustFinished();
                onNavigate('create');
              }}
              className="min-h-[44px] rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 whitespace-nowrap shrink-0"
            >
              Start New Challenge
            </button>
          </div>
        </div>
      </section>
    );
  };

  // Empty state: no active challenge
  if (!activeChallenge || !activeMetrics) {
    return (
      <div className="space-y-6">
        {renderJustFinishedBanner()}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Single-Challenge Focus · Calendar-Anchored Countdown
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
                Build daily consistency, one 21-day block at a time.
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
                Create a classic 21-day habit challenge or set a custom duration. Check in once
                every calendar day—missing a day resets your consecutive streak to zero while your
                calendar countdown continues toward the finish date.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('create')}
                  className="flex min-h-[48px] items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 whitespace-nowrap shrink-0"
                >
                  <PlusCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Create 21-Day Challenge</span>
                </button>
                {historyCount > 0 && (
                  <button
                    type="button"
                    onClick={() => onNavigate('history')}
                    className="flex min-h-[48px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
                  >
                    <span>Review Past Challenges ({historyCount})</span>
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 border-t border-slate-100 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                How Tracking Works
              </h3>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="font-medium text-slate-900 dark:text-slate-100">
                    1. Explicit Start &amp; Fixed Window
                  </dt>
                  <dd className="mt-0.5 text-slate-600 dark:text-slate-400">
                    Challenges run continuously across calendar dates without pausing.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-900 dark:text-slate-100">
                    2. Countdown vs. Streak
                  </dt>
                  <dd className="mt-0.5 text-slate-600 dark:text-slate-400">
                    Remaining days count down on schedule; your streak measures consecutive daily
                    check-ins.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-900 dark:text-slate-100">
                    3. Automatic Outcome Evaluation
                  </dt>
                  <dd className="mt-0.5 text-slate-600 dark:text-slate-400">
                    After the end date, your record moves to History as Successful or Completed with
                    Missed Days.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <DailyQuoteCard todayKey={todayKey} />
      </div>
    );
  }

  // NOT_STARTED state: challenge prepared, awaiting explicit start
  if (activeChallenge.status === 'NOT_STARTED') {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Not Started</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{activeChallenge.durationDays} Calendar Days</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-balance">
                {activeChallenge.name}
              </h2>
              {activeChallenge.description && (
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                  {activeChallenge.description}
                </p>
              )}
              <p className="pt-1 text-xs text-slate-500 dark:text-slate-400">
                Starting today sets Day 1 to{' '}
                <span className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                  {formatDisplayDate(todayKey)}
                </span>{' '}
                and starts the continuous {activeChallenge.durationDays}-day countdown.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onStartActiveChallenge}
                className="flex min-h-[48px] items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 whitespace-nowrap shrink-0"
              >
                <Play className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Start Challenge Now</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmDiscardOpen(true)}
                className="flex min-h-[48px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
              >
                <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Discard</span>
              </button>
            </div>
          </div>
        </section>

        <DailyQuoteCard todayKey={todayKey} />

        <ConfirmDialog
          open={confirmDiscardOpen}
          title="Discard unstarted challenge?"
          description={`"${activeChallenge.name}" has not started yet. Discarding it will remove this draft so you can create another challenge.`}
          confirmLabel="Discard Draft"
          destructive
          onConfirm={() => {
            setConfirmDiscardOpen(false);
            onDiscardNotStarted();
          }}
          onCancel={() => setConfirmDiscardOpen(false)}
        />
      </div>
    );
  }

  // Active IN_PROGRESS Challenge Dashboard
  const todayEntry = activeMetrics.days.find((d) => d.isToday);
  const todayCheckInFormatted = todayEntry?.checkInTime
    ? formatCheckInTime(todayEntry.checkInTime)
    : null;

  // Countdown Ring Geometry (Calendar Elapsed vs Remaining)
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const elapsedProgressRatio =
    activeChallenge.durationDays > 0
      ? Math.min(1, activeMetrics.currentDay / activeChallenge.durationDays)
      : 0;
  const strokeDashoffset = circumference * (1 - elapsedProgressRatio);

  return (
    <div className="space-y-6">
      {/* Primary Focal Anchor: Active Challenge Hero */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-6 md:grid-cols-12 md:items-center">
          {/* Left: Title, Metadata, Primary Check-In CTA */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                In Progress
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                Day {activeMetrics.currentDay} of {activeChallenge.durationDays}
              </span>
              {activeChallenge.startDate && activeChallenge.endDate && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    {formatShortDate(activeChallenge.startDate)} –{' '}
                    {formatDisplayDate(activeChallenge.endDate)}
                  </span>
                </>
              )}
            </div>

            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
                {activeChallenge.name}
              </h2>
              {activeChallenge.description && (
                <p className="mt-1.5 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-300">
                  {activeChallenge.description}
                </p>
              )}
            </div>

            {/* Primary Daily Check-In Control */}
            <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-3">
              {activeMetrics.isCheckedInToday ? (
                <div className="flex min-h-[52px] items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-emerald-900 dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-200">
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                  <div className="text-sm">
                    <span className="font-semibold">Checked in for today</span>
                    {todayCheckInFormatted && (
                      <span className="ml-2 text-xs text-emerald-700 dark:text-emerald-300 tabular-nums">
                        at {todayCheckInFormatted}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={!activeMetrics.canCheckInToday}
                  className="flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-xs transition-transform active:scale-[0.99] hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  <Check className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>Complete Today&apos;s Check-In</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onNavigate('calendar')}
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
              >
                <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Open Calendar</span>
              </button>
            </div>

            {checkInMessage && (
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400" role="status">
                {checkInMessage}
              </p>
            )}
          </div>

          {/* Right: Calendar Countdown Ring (Strictly Countdown, NOT Streak) */}
          <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-5 border-t border-slate-100 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0 dark:border-slate-800">
            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
              <svg
                className="h-32 w-32 -rotate-90"
                viewBox="0 0 128 128"
                aria-label={`Countdown: ${activeMetrics.remainingDays} days remaining`}
              >
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-slate-100 dark:text-slate-800"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="text-slate-900 dark:text-emerald-500 transition-[stroke-dashoffset] duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-display text-3xl font-bold leading-none text-slate-900 dark:text-white tabular-nums">
                  {activeMetrics.remainingDays}
                </span>
                <span className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  days left
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 md:hidden">
              <div>
                <div className="text-slate-500 dark:text-slate-400">Elapsed</div>
                <div className="font-semibold text-slate-900 dark:text-white tabular-nums">
                  {activeMetrics.elapsedDays} days
                </div>
              </div>
              <div>
                <div className="text-slate-500 dark:text-slate-400">Today&apos;s Status</div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {activeMetrics.isCheckedInToday ? 'Completed' : 'Pending'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Column Metric Strip: Explicitly Separating Countdown vs Streak */}
      <section aria-label="Challenge metrics" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Remaining Days</span>
            <Clock className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </div>
          <div className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {activeMetrics.remainingDays}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {activeMetrics.elapsedDays} elapsed · calendar fixed
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Current Streak</span>
            <Flame className="h-4 w-4 text-amber-500" aria-hidden="true" />
          </div>
          <div className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {activeMetrics.currentStreak}
            <span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              {activeMetrics.currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {activeMetrics.currentStreak === 0 && activeMetrics.missedCount > 0
              ? 'Reset after missed day'
              : 'Consecutive check-ins'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Longest Streak</span>
            <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
          <div className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {activeMetrics.longestStreak}
            <span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              {activeMetrics.longestStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Best consecutive run
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Completion</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
          <div className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {activeMetrics.completionPercentage}%
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {activeMetrics.completedCount} done · {activeMetrics.missedCount} missed
          </p>
        </div>
      </section>

      {/* Progress Strip & Day Grid Preview */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Challenge Progress Map
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Every block represents one calendar day. Tap any day on the Calendar view for details.
            </p>
          </div>

          {/* Legend with explicit icons & labels (never hue-only) */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              Done ({activeMetrics.completedCount})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" aria-hidden="true" />
              Missed ({activeMetrics.missedCount})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
              Remaining ({activeMetrics.upcomingCount})
            </span>
          </div>
        </div>

        {/* Overall Completion Bar */}
        <div className="mt-4">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            role="progressbar"
            aria-valuenow={activeMetrics.completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Challenge completion percentage"
          >
            <div
              className="h-full rounded-full bg-emerald-600 transition-[width] duration-300"
              style={{ width: `${activeMetrics.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Compact Day Tiles */}
        <div className="mt-5 grid grid-cols-7 gap-2 sm:grid-cols-7 md:grid-cols-11 lg:grid-cols-11">
          {activeMetrics.days.map((day) => {
            let cellStyles =
              'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400';
            let statusIcon: React.ReactNode = null;

            if (day.state === 'COMPLETED') {
              cellStyles =
                'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/70 dark:bg-emerald-950/60 dark:text-emerald-200';
              statusIcon = <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />;
            } else if (day.state === 'MISSED') {
              cellStyles =
                'border-red-200 bg-red-50 text-red-900 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-200';
              statusIcon = <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" aria-hidden="true" />;
            } else if (day.state === 'TODAY_PENDING') {
              cellStyles =
                'border-slate-900 bg-white text-slate-900 ring-1 ring-slate-900 dark:border-emerald-400 dark:bg-slate-900 dark:text-white dark:ring-emerald-400';
              statusIcon = <Clock className="h-3.5 w-3.5 text-slate-900 dark:text-emerald-400" aria-hidden="true" />;
            }

            return (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => onNavigate('calendar')}
                title={
                  day.dateKey
                    ? `Day ${day.dayNumber} (${day.dateKey}) — ${day.state.replace('_', ' ')}`
                    : `Day ${day.dayNumber}`
                }
                className={`flex min-h-[48px] flex-col items-center justify-center rounded-xl border p-1.5 text-center transition-colors hover:border-slate-400 dark:hover:border-slate-600 ${cellStyles}`}
              >
                <span className="text-[11px] font-semibold tabular-nums leading-none">
                  D{day.dayNumber}
                </span>
                <span className="mt-1 h-3.5 flex items-center justify-center">
                  {statusIcon ?? (
                    <span className="text-[10px] tabular-nums opacity-70">
                      {day.dateKey ? day.dateKey.slice(8) : ''}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <DailyQuoteCard todayKey={todayKey} />
    </div>
  );
};
