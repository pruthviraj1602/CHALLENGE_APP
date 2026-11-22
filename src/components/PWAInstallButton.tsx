import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-slate-900 font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 whitespace-nowrap shrink-0 ${
          compact ? 'px-3 py-2 text-xs' : 'w-full px-4 py-2.5 text-sm'
        }`}
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 whitespace-nowrap shrink-0 ${
            compact ? 'px-3 py-2 text-xs' : 'w-full px-4 py-2.5 text-sm'
          }`}
        >
          <Share className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3">
                <h3
                  id="ios-install-title"
                  className="text-base font-semibold text-slate-900 dark:text-slate-100"
                >
                  Install on iPhone or iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close installation guide"
                  className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <ol className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  1. Tap the <strong className="text-slate-900 dark:text-white">Share</strong> button in Safari.
                </li>
                <li>
                  2. Scroll down and tap{' '}
                  <strong className="text-slate-900 dark:text-white">Add to Home Screen</strong>.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 min-h-[44px] w-full rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
