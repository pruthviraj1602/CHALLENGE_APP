import React, { useRef, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Download,
  Moon,
  Smartphone,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  getNotificationPermission,
  isNotificationSupported,
  NotificationPermState,
  requestNotificationPermission,
  sendCheckInNotification,
} from '../services/notificationService';
import {
  exportBackupJson,
  parseAndValidateBackupJson,
} from '../services/storageService';
import {
  Challenge,
  ChallengeDerivedMetrics,
  PersistedAppState,
  ReminderSettings,
} from '../types/challenge';

interface SettingsPageProps {
  todayKey: string;
  state: PersistedAppState;
  activeChallenge: Challenge | null;
  activeMetrics: ChallengeDerivedMetrics | null;
  onSetTheme: (theme: 'light' | 'dark') => void;
  onUpdateReminder: (partial: Partial<ReminderSettings>) => void;
  onImportState: (imported: PersistedAppState) => void;
  onResetAllData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  todayKey,
  state,
  activeChallenge,
  activeMetrics,
  onSetTheme,
  onUpdateReminder,
  onImportState,
  onResetAllData,
}) => {
  const isOnline = useOnlineStatus();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [permState, setPermState] = useState<NotificationPermState>(() =>
    getNotificationPermission()
  );
  const [notifFeedback, setNotifFeedback] = useState<string | null>(null);

  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [pendingImportState, setPendingImportState] =
    useState<PersistedAppState | null>(null);

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const notificationSupported = isNotificationSupported();

  const handleRequestNotifications = async () => {
    setNotifFeedback(null);
    const result = await requestNotificationPermission();
    setPermState(result);
    if (result === 'granted') {
      onUpdateReminder({ enabled: true });
      setNotifFeedback('Browser notifications enabled.');
    } else if (result === 'denied') {
      onUpdateReminder({ enabled: false });
      setNotifFeedback(
        'Notification permission is blocked in browser settings. Enable it in your browser site permissions to receive reminders.'
      );
    }
  };

  const handleTestNotification = () => {
    const ok = sendCheckInNotification(
      '21-Day Streak Tracker Reminder',
      activeChallenge && activeMetrics
        ? `Day ${activeMetrics.currentDay} of ${activeChallenge.durationDays} — ${activeMetrics.remainingDays} days remaining.`
        : 'Daily reminder test is working.'
    );
    setNotifFeedback(
      ok
        ? 'Test notification sent.'
        : 'Unable to display notification. Verify browser permission is granted.'
    );
  };

  const handleExportBackup = () => {
    const json = exportBackupJson(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `21day-streak-backup-${todayKey}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const validation = parseAndValidateBackupJson(text);
      if (!validation.valid || !validation.state) {
        setImportError(validation.error ?? 'Backup validation failed.');
      } else {
        setPendingImportState(validation.state);
      }
    } catch {
      setImportError('Could not read the selected file.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const confirmImportOverwrite = () => {
    if (!pendingImportState) return;
    onImportState(pendingImportState);
    setImportSuccess(
      `Backup restored (${pendingImportState.history.length} historical challenges${
        pendingImportState.activeChallenge ? ' + 1 active challenge' : ''
      }).`
    );
    setPendingImportState(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Appearance & Notifications */}
        <div className="lg:col-span-6 space-y-6">
          {/* Theme */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Appearance
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Choose your preferred visual theme across desktop and mobile.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onSetTheme('light')}
                className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                  state.preferences.theme === 'light'
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-emerald-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                <Sun className="h-4 w-4" aria-hidden="true" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => onSetTheme('dark')}
                className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                  state.preferences.theme === 'dark'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                <Moon className="h-4 w-4" aria-hidden="true" />
                <span>Dark</span>
              </button>
            </div>
          </section>

          {/* Daily Reminders */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Daily Reminder Notifications
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Reminders are automatically skipped on days when you have already checked in.
                </p>
              </div>
              <Bell className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
            </div>

            {!notificationSupported ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                Browser notifications are not supported in this browser environment. All tracking,
                countdowns, and local persistence continue to work normally.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    Permission status:{' '}
                    <span className="font-semibold text-slate-900 dark:text-white capitalize">
                      {permState}
                    </span>
                  </div>
                  {permState !== 'granted' && (
                    <button
                      type="button"
                      onClick={handleRequestNotifications}
                      className="min-h-[40px] rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 whitespace-nowrap"
                    >
                      Allow Notifications
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <label className="flex items-center gap-3 text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.preferences.reminder.enabled}
                      disabled={permState !== 'granted'}
                      onChange={(e) => onUpdateReminder({ enabled: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                    />
                    <span>Enable daily reminder</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="reminder-time"
                      className="text-xs text-slate-500 dark:text-slate-400"
                    >
                      Time
                    </label>
                    <input
                      id="reminder-time"
                      type="time"
                      value={state.preferences.reminder.time}
                      onChange={(e) => onUpdateReminder({ time: e.target.value })}
                      className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 tabular-nums dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                {permState === 'granted' && (
                  <button
                    type="button"
                    onClick={handleTestNotification}
                    className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Send Test Notification
                  </button>
                )}

                {notifFeedback && (
                  <p className="text-xs text-slate-600 dark:text-slate-300" role="status">
                    {notifFeedback}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* PWA & Offline Status */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Offline PWA &amp; Installation
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Connection status: {isOnline ? 'Online' : 'Offline (running from local cache)'}.
              Challenge records are stored locally in your browser.
            </p>
            <div className="mt-4">
              <PWAInstallButton />
            </div>
          </section>
        </div>

        {/* Backup / Restore & Android Widget Spec */}
        <div className="lg:col-span-6 space-y-6">
          {/* Backup and Restore */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Backup &amp; Restore
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Export your active challenge, history, and preferences as validated JSON. Importing a
              backup validates every date and rule before asking for confirmation to replace current
              data.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 whitespace-nowrap"
              >
                <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Export JSON Backup</span>
              </button>

              <label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap">
                <Upload className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Import JSON Backup</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleFileSelected}
                  className="sr-only"
                />
              </label>
            </div>

            {importError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
              >
                Import rejected: {importError}
              </div>
            )}

            {importSuccess && (
              <div
                role="status"
                className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{importSuccess}</span>
              </div>
            )}
          </section>

          {/* Android Home-Screen Widget Preview */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Android Widget Data Preview
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Preview of how the native Kotlin Jetpack Glance home-screen widget renders your
                  remaining days and today&apos;s check-in state locally on Android via DataStore.
                </p>
              </div>
              <Smartphone className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white dark:border-slate-700 dark:bg-slate-950">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-slate-400">21-Day Widget</div>
                  <div className="truncate text-sm font-semibold text-white">
                    {activeChallenge ? activeChallenge.name : 'No active challenge'}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display text-2xl font-bold text-emerald-400 tabular-nums leading-none">
                    {activeMetrics ? activeMetrics.remainingDays : 0}
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-400">days left</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2.5 text-xs">
                <span className="text-slate-300">
                  Today:{' '}
                  <strong className="text-white">
                    {!activeChallenge
                      ? 'Idle'
                      : activeMetrics?.isCheckedInToday
                      ? 'Checked In'
                      : 'Pending'}
                  </strong>
                </span>
                <span className="text-slate-400 tabular-nums">
                  Streak: {activeMetrics ? activeMetrics.currentStreak : 0}d
                </span>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="rounded-2xl border border-red-200 bg-white p-5 sm:p-6 dark:border-red-900/60 dark:bg-slate-900">
            <h2 className="text-base font-semibold text-red-700 dark:text-red-400">
              Reset Local Storage
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Permanently erase the active challenge, all historical records, and saved preferences
              from this browser. Export a JSON backup first if you want to keep your records.
            </p>
            <button
              type="button"
              onClick={() => setConfirmResetOpen(true)}
              className="mt-4 flex min-h-[44px] items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300 dark:hover:bg-red-950 whitespace-nowrap"
            >
              <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Erase All Local Data</span>
            </button>
          </section>
        </div>
      </div>

      {/* Confirm Backup Overwrite */}
      <ConfirmDialog
        open={pendingImportState !== null}
        title="Replace existing data with backup?"
        description={
          pendingImportState
            ? `This validated backup contains ${pendingImportState.history.length} historical challenge(s)${
                pendingImportState.activeChallenge
                  ? ` and active challenge "${pendingImportState.activeChallenge.name}"`
                  : ''
              }. Importing will replace your current browser data.`
            : ''
        }
        confirmLabel="Restore Backup"
        destructive
        onConfirm={confirmImportOverwrite}
        onCancel={() => setPendingImportState(null)}
      />

      {/* Confirm Full Reset */}
      <ConfirmDialog
        open={confirmResetOpen}
        title="Erase all local challenge data?"
        description="This action permanently deletes your active challenge, history, and reminder settings from LocalStorage and cannot be undone."
        confirmLabel="Erase Everything"
        destructive
        onConfirm={() => {
          setConfirmResetOpen(false);
          onResetAllData();
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
};
