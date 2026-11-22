import React, { useEffect, useState } from 'react';
import { Quote, RefreshCw } from 'lucide-react';
import {
  getQuoteIndexForDate,
  MOTIVATIONAL_QUOTES,
} from '../data/motivationalQuotes';
import { formatDisplayDate } from '../utils/dateUtils';

interface DailyQuoteCardProps {
  todayKey: string;
}

export const DailyQuoteCard: React.FC<DailyQuoteCardProps> = ({ todayKey }) => {
  const dailyIndex = getQuoteIndexForDate(todayKey);
  const [offset, setOffset] = useState(0);

  // Reset manual browsing offset automatically when the calendar day changes
  useEffect(() => {
    setOffset(0);
  }, [todayKey]);

  const activeIndex = (dailyIndex + offset) % MOTIVATIONAL_QUOTES.length;
  const quote = MOTIVATIONAL_QUOTES[activeIndex];

  return (
    <section
      aria-label="Motivational quote of the day"
      className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Quote className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Quote of the Day
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{formatDisplayDate(todayKey)}</span>
        </div>

        <div className="flex items-center gap-2">
          {offset !== 0 && (
            <button
              type="button"
              onClick={() => setOffset(0)}
              className="min-h-[36px] rounded-xl px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 whitespace-nowrap"
            >
              Today&apos;s Quote
            </button>
          )}
          <button
            type="button"
            onClick={() => setOffset((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)}
            className="flex min-h-[36px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Another Quote</span>
          </button>
        </div>
      </div>

      <figure className="mt-3.5 border-t border-slate-100 pt-3.5 dark:border-slate-800">
        <blockquote className="font-display text-base sm:text-lg font-medium leading-relaxed text-slate-900 dark:text-slate-100 text-balance">
          &ldquo;{quote.text}&rdquo;
        </blockquote>
        <figcaption className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          — {quote.author}
        </figcaption>
      </figure>
    </section>
  );
};
