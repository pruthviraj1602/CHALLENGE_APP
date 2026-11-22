import React from 'react';
import { BarChart3, CheckCircle2, Flame, PlusCircle, Trophy } from 'lucide-react';
import { AnalyticsSummary, PageId } from '../types/challenge';

interface AnalyticsPageProps {
  analytics: AnalyticsSummary;
  onNavigate: (page: PageId) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  analytics,
  onNavigate,
}) => {
  const hasAnyData =
    analytics.totalCheckIns > 0 ||
    analytics.totalMissedDays > 0 ||
    analytics.recentChallenges.length > 0;

  if (!hasAnyData) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <BarChart3 className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
        <h2 className="mt-4 font-display text-xl font-bold text-slate-900 dark:text-white">
          Analytics Ready Once You Start
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Your weekday consistency chart, completion pace, and streak benchmarks will appear here as
          soon as you check in on a challenge.
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

  return (
    <div className="space-y-6">
      {/* Lifetime Summary Strip */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Overall Consistency</span>
            <BarChart3 className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </div>
          <div className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {analytics.overallCompletionRate}%
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {analytics.totalCheckIns} done / {analytics.totalCheckIns + analytics.totalMissedDays}{' '}
            past days
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>All-Time Best Streak</span>
            <Flame className="h-4 w-4 text-amber-500" aria-hidden="true" />
          </div>
          <div className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {analytics.allTimeLongestStreak}
            <span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400">d</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Longest consecutive run
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Total Check-Ins</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
          <div className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {analytics.totalCheckIns}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {analytics.totalMissedDays} missed days logged
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Successful Finishes</span>
            <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
          <div className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {analytics.successfulChallenges}
            <span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              / {analytics.totalChallengesCompleted}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Zero-miss completed runs
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Day-of-Week Consistency Chart */}
        <section className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Consistency by Day of Week
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Completion rate across scheduled challenge days (Monday–Sunday)
            </p>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-2 items-end h-48 pt-6">
            {analytics.weekdayStats.map((stat) => {
              const barHeight = stat.scheduled > 0 ? Math.max(8, stat.rate) : 4;
              return (
                <div
                  key={stat.dayIndex}
                  className="flex h-full flex-col items-center justify-end gap-2"
                >
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                    {stat.scheduled > 0 ? `${stat.rate}%` : '—'}
                  </span>
                  <div className="flex w-full max-w-[36px] flex-1 items-end rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
                    <div
                      className={`w-full rounded-md transition-[height] duration-300 ${
                        stat.scheduled === 0
                          ? 'bg-slate-200 dark:bg-slate-700'
                          : stat.rate >= 80
                          ? 'bg-emerald-600 dark:bg-emerald-500'
                          : stat.rate >= 50
                          ? 'bg-slate-700 dark:bg-slate-400'
                          : 'bg-amber-500'
                      }`}
                      style={{ height: `${barHeight}%` }}
                      title={`${stat.label}: ${stat.completed}/${stat.scheduled} days`}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {stat.label}
                    </div>
                    <div className="text-[10px] text-slate-400 tabular-nums">
                      {stat.completed}/{stat.scheduled}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Challenge Performance Comparison */}
        <section className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Challenge Completion Comparison
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Completed vs. scheduled duration across your recent challenges
            </p>
          </div>

          <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
            {analytics.recentChallenges.map((item) => (
              <div key={item.id} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {item.completedCount}/{item.durationDays} days · {item.missedCount} missed
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      {item.completionPercentage}%
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.status === 'IN_PROGRESS'
                        ? 'Active'
                        : item.outcome === 'SUCCESSFUL'
                        ? 'Successful'
                        : item.status === 'NOT_STARTED'
                        ? 'Draft'
                        : 'With misses'}
                    </div>
                  </div>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      item.outcome === 'SUCCESSFUL'
                        ? 'bg-emerald-600 dark:bg-emerald-500'
                        : 'bg-slate-800 dark:bg-slate-400'
                    }`}
                    style={{ width: `${item.completionPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
