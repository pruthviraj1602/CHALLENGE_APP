import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  CalendarDays,
  History,
  LayoutDashboard,
  Menu,
  Moon,
  PlusCircle,
  Settings,
  Sun,
  WifiOff,
  X,
} from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { PageId } from '../types/challenge';
import { formatDisplayDate } from '../utils/dateUtils';
import { PWAInstallButton } from './PWAInstallButton';

interface LayoutShellProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  todayKey: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  hasActiveChallenge: boolean;
  children: React.ReactNode;
}

interface NavItem {
  id: PageId;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Today', icon: LayoutDashboard },
  { id: 'create', label: 'Create Challenge', shortLabel: 'Create', icon: PlusCircle },
  { id: 'calendar', label: 'Calendar', shortLabel: 'Calendar', icon: CalendarDays },
  { id: 'analytics', label: 'Analytics', shortLabel: 'Analytics', icon: BarChart3 },
  { id: 'history', label: 'History', shortLabel: 'History', icon: History },
  { id: 'achievements', label: 'Achievements', shortLabel: 'Awards', icon: Award },
  { id: 'settings', label: 'Settings', shortLabel: 'Settings', icon: Settings },
];

const MOBILE_PRIMARY_TABS: PageId[] = ['dashboard', 'calendar', 'analytics', 'history'];

export const LayoutShell: React.FC<LayoutShellProps> = ({
  activePage,
  onNavigate,
  todayKey,
  theme,
  onToggleTheme,
  hasActiveChallenge,
  children,
}) => {
  const isOnline = useOnlineStatus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeTitle =
    NAV_ITEMS.find((item) => item.id === activePage)?.label ?? 'Dashboard';

  const handleMobileNav = (page: PageId) => {
    setMobileMenuOpen(false);
    onNavigate(page);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white lg:dark:border-slate-800 lg:dark:bg-slate-900">
        <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:focus-visible:outline-emerald-500 rounded-lg"
          >
            <img
              src="/icon.svg"
              alt=""
              className="h-7 w-7 rounded-lg shrink-0"
              referrerPolicy="no-referrer"
            />
            <span className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
              21-Day Tracker
            </span>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:focus-visible:outline-emerald-500 whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-slate-200 p-4 dark:border-slate-800">
          <PWAInstallButton />
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex min-h-[44px] w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <span className="whitespace-nowrap">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
            {theme === 'dark' ? (
              <Moon className="h-4 w-4 text-slate-300" aria-hidden="true" />
            ) : (
              <Sun className="h-4 w-4 text-slate-600" aria-hidden="true" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Viewport Wrapper */}
      <div className="lg:pl-64 flex min-h-screen flex-col">
        {/* Compact Sticky Top Bar (48px mobile / 64px desktop) */}
        <header className="sticky top-0 z-20 flex h-12 lg:h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 sm:px-6 lg:px-8 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 lg:hidden shrink-0"
              aria-label="Go to Dashboard"
            >
              <img
                src="/icon.svg"
                alt=""
                className="h-6 w-6 rounded-md"
                referrerPolicy="no-referrer"
              />
            </button>
            <h1 className="font-display text-base lg:text-lg font-semibold tracking-tight text-slate-900 dark:text-white truncate">
              {activeTitle}
            </h1>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700" aria-hidden="true">
              ·
            </span>
            <span className="hidden sm:inline text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
              {formatDisplayDate(todayKey)}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="lg:hidden">
              <PWAInstallButton compact />
            </div>
            {!hasActiveChallenge && activePage !== 'create' && (
              <button
                type="button"
                onClick={() => onNavigate('create')}
                className="flex min-h-[36px] lg:min-h-[40px] items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs lg:text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 whitespace-nowrap shrink-0"
              >
                <PlusCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>New Challenge</span>
              </button>
            )}
            {hasActiveChallenge && activePage !== 'dashboard' && (
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="flex min-h-[36px] lg:min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs lg:text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
              >
                <span>Active Tracker</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Content Container */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 pb-20 sm:px-6 lg:px-8 lg:py-8 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Offline Indicator */}
      {!isOnline && (
        <div
          role="status"
          className="fixed bottom-16 left-4 right-4 z-40 mx-auto flex max-w-md items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-medium text-amber-900 shadow-md lg:bottom-4 lg:left-auto lg:right-6 dark:border-amber-800 dark:bg-amber-950/90 dark:text-amber-200"
        >
          <WifiOff className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <span>Offline mode — local data remains available.</span>
        </div>
      )}

      {/* Mobile Bottom Tab Bar (56px height, <15% viewport combined with 48px header) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md pb-safe lg:hidden dark:border-slate-800 dark:bg-slate-900/95"
        aria-label="Mobile navigation"
      >
        <div className="grid h-14 grid-cols-5 items-center">
          {MOBILE_PRIMARY_TABS.map((pageId) => {
            const item = NAV_ITEMS.find((n) => n.id === pageId)!;
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleMobileNav(item.id)}
                className={`flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-[10px] font-medium tracking-tight leading-none">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 transition-colors ${
              ['create', 'achievements', 'settings'].includes(activePage)
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
            aria-label="Open more sections"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
            <span className="text-[10px] font-medium tracking-tight leading-none">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Sheet Menu for Create, Achievements, Settings */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-slate-950/50 backdrop-blur-xs lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-full rounded-t-3xl border-t border-slate-200 bg-white px-5 pb-8 pt-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                More Sections
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-1.5">
              {(['create', 'achievements', 'settings'] as PageId[]).map((pageId) => {
                const item = NAV_ITEMS.find((n) => n.id === pageId)!;
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleMobileNav(item.id)}
                    className={`flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-emerald-600'
                        : 'bg-slate-50 text-slate-800 hover:bg-slate-100 dark:bg-slate-800/70 dark:text-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  onToggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="flex min-h-[48px] w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
