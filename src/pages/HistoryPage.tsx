import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  History,
  PlusCircle,
  Search,
  Trophy,
  XCircle,
} from 'lucide-react';
import { Challenge, PageId } from '../types/challenge';
import { computeChallengeMetrics } from '../utils/challengeEngine';
import { formatDisplayDate } from '../utils/dateUtils';

interface HistoryPageProps {
  todayKey: string;
  history: Challenge[];
  onNavigate: (page: PageId) => void;
}

type OutcomeFilter = 'ALL' | 'SUCCESSFUL' | 'COMPLETED_WITH_MISSED_DAYS';

export const HistoryPage: React.FC<HistoryPageProps> = ({
  todayKey,
  history,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<OutcomeFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return history.filter((item) => {
      if (filter !== 'ALL' && item.outcome !== filter) return false;
      if (q && !item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [history, filter, searchQuery]);

  if (history.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <History className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
        <h2 className="mt-4 font-display text-xl font-bold text-slate-900 dark:text-white">
          No Completed Challenges Yet
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Finished challenges are archived here automatically after their scheduled end date,
          preserving your start/end dates, missed days, and final outcome.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('create')}
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          <span>Start a Challenge</span>
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filter & Search Bar */}
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              filter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            All ({history.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('SUCCESSFUL')}
            className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              filter === 'SUCCESSFUL'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            Successful
          </button>
          <button
            type="button"
            onClick={() => setFilter('COMPLETED_WITH_MISSED_DAYS')}
            className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              filter === 'COMPLETED_WITH_MISSED_DAYS'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            With Missed Days
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search challenges..."
            aria-label="Search challenge history"
            className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-500"
          />
        </div>
      </section>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          No archived challenges match your current filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => {
            const metrics = computeChallengeMetrics(item, todayKey);
            const isSuccess = item.outcome === 'SUCCESSFUL';
            const isExpanded = expandedId === item.id;

            return (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                        {isSuccess ? (
                          <Trophy
                            className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
                            aria-hidden="true"
                          />
                        ) : (
                          <AlertCircle
                            className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400"
                            aria-hidden="true"
                          />
                        )}
                        {isSuccess ? 'Successful' : 'Completed with Missed Days'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {item.startDate && item.endDate
                          ? `${formatDisplayDate(item.startDate)} – ${formatDisplayDate(
                              item.endDate
                            )}`
                          : 'Dates unavailable'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{item.durationDays} days</span>
                    </div>

                    <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Numeric Summary & Expand Button */}
                  <div className="flex flex-wrap items-center gap-5 border-t border-slate-100 pt-4 lg:border-t-0 lg:pt-0 dark:border-slate-800 shrink-0">
                    <div className="text-left lg:text-right">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Completed
                      </div>
                      <div className="text-base font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {metrics.completedCount}d
                      </div>
                    </div>
                    <div className="text-left lg:text-right">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Missed</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                        {metrics.missedCount}d
                      </div>
                    </div>
                    <div className="text-left lg:text-right">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Completion
                      </div>
                      <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                        {metrics.completionPercentage}%
                      </div>
                    </div>
                    <div className="text-left lg:text-right">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Best Streak
                      </div>
                      <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                        {metrics.longestStreak}d
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
                    >
                      <span>{isExpanded ? 'Hide Days' : 'Inspect Days'}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-11">
                      {metrics.days.map((day) => (
                        <div
                          key={day.dayNumber}
                          title={`${day.dateKey ?? `Day ${day.dayNumber}`}: ${day.state}`}
                          className={`flex flex-col items-center justify-center rounded-lg border py-1.5 text-[10px] font-medium tabular-nums ${
                            day.state === 'COMPLETED'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/70 dark:bg-emerald-950/60 dark:text-emerald-200'
                              : 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-200'
                          }`}
                        >
                          <span>D{day.dayNumber}</span>
                          {day.state === 'COMPLETED' ? (
                            <Check className="mt-0.5 h-3 w-3 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                          ) : (
                            <XCircle className="mt-0.5 h-3 w-3 text-red-600 dark:text-red-400" aria-hidden="true" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
