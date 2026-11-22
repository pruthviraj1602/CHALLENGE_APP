import React from 'react';
import { Award, CheckCircle2, Lock } from 'lucide-react';
import { AchievementItem } from '../types/challenge';

interface AchievementsPageProps {
  achievements: AchievementItem[];
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({
  achievements,
}) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const overallPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Milestone Tracker
            </div>
            <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {unlockedCount} of {totalCount} Achievements Unlocked
            </h2>
          </div>
          <div className="text-right font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {overallPercent}%
          </div>
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-600 transition-[width] duration-300"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </section>

      <section
        aria-label="Achievement milestones"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {achievements.map((item) => {
          const pct =
            item.progressTarget > 0
              ? Math.round((item.progressCurrent / item.progressTarget) * 100)
              : 0;

          return (
            <article
              key={item.id}
              className={`flex flex-col justify-between rounded-2xl border p-5 ${
                item.unlocked
                  ? 'border-emerald-200 bg-white dark:border-emerald-800/70 dark:bg-slate-900'
                  : 'border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      item.unlocked
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                    }`}
                  >
                    {item.unlocked ? (
                      <Award className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Lock className="h-5 w-5" aria-hidden="true" />
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${
                      item.unlocked
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.unlocked && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
                    {item.unlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <span>{item.requirementLabel}</span>
                  <span className="tabular-nums">
                    {item.progressCurrent}/{item.progressTarget}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      item.unlocked
                        ? 'bg-emerald-600 dark:bg-emerald-500'
                        : 'bg-slate-400 dark:bg-slate-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};
