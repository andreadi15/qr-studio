import { useCallback, useEffect, useRef, useState } from 'react';
import type { Settings } from '../lib/types';
import { DEFAULTS } from '../lib/defaults';
import { clearSettings, loadSettings, saveSettings } from '../lib/storage';

const SAVE_DELAY = 300;

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const timer = useRef<number | undefined>(undefined);
  const skipSave = useRef(false);

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => saveSettings(settings), SAVE_DELAY);
    return () => window.clearTimeout(timer.current);
  }, [settings]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  /** Kembalikan default dan hapus penyimpanan (tanpa menulis ulang default). */
  const reset = useCallback(() => {
    clearSettings();
    skipSave.current = true;
    setSettings({ ...DEFAULTS });
  }, []);

  return { settings, update, reset };
}
