import { Injectable, signal } from '@angular/core';
import { STORAGE_KEYS } from '@core/constants/storage-keys';

export interface FeatureFlags {
  showStatistics: boolean;
}

const DEFAULTS: FeatureFlags = {
  showStatistics: false,
};

/**
 * Simulates Firebase Remote Config with localStorage as fallback.
 * To wire real Firebase Remote Config, replace fetchAndActivate() body
 * with the Firebase SDK calls and keep the same signal interface.
 */
@Injectable({ providedIn: 'root' })
export class RemoteConfigService {
  private readonly KEY = STORAGE_KEYS.REMOTE_CONFIG_FLAGS;
  private _flags = signal<FeatureFlags>(this.loadCache());

  readonly flags = this._flags.asReadonly();

  private loadCache(): FeatureFlags {
    try {
      const stored = localStorage.getItem(this.KEY);
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : { ...DEFAULTS };
    } catch {
      return { ...DEFAULTS };
    }
  }

  setFlag<K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]): void {
    this._flags.update(f => {
      const updated = { ...f, [key]: value };
      localStorage.setItem(this.KEY, JSON.stringify(updated));
      return updated;
    });
  }

  /**
   * Replace this method body with real Firebase Remote Config:
   *
   * import { getRemoteConfig, fetchAndActivate, getBoolean } from 'firebase/remote-config';
   * const rc = getRemoteConfig(app);
   * rc.defaultConfig = { show_statistics: false };
   * await fetchAndActivate(rc);
   * this._flags.set({ showStatistics: getBoolean(rc, 'show_statistics') });
   */
  async fetchAndActivate(): Promise<void> {
    console.log('[RemoteConfig] Using local cache — wire Firebase SDK to fetch live values.');
  }
}
