import { Injectable, signal } from '@angular/core';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { fetchAndActivate, getBoolean, getRemoteConfig } from 'firebase/remote-config';
import { environment } from '../../../environments/environment';

export interface FeatureFlags {
  showStatistics: boolean;
}

const DEFAULTS: FeatureFlags = {
  showStatistics: false,
};

@Injectable({ providedIn: 'root' })
export class RemoteConfigService {
  private readonly rc = this.initRemoteConfig();
  private _flags = signal<FeatureFlags>({ ...DEFAULTS });

  readonly flags = this._flags.asReadonly();

  private initRemoteConfig() {
    const app = getApps().length ? getApp() : initializeApp(environment.firebaseConfig);
    const rc = getRemoteConfig(app);
    rc.defaultConfig = { show_statistics: DEFAULTS.showStatistics };
    if (!environment.production) {
      rc.settings.minimumFetchIntervalMillis = 0;
    }
    return rc;
  }

  setFlag<K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]): void {
    this._flags.update(f => ({ ...f, [key]: value }));
  }

  async fetchAndActivate(): Promise<void> {
    await fetchAndActivate(this.rc);
    this._flags.set({
      showStatistics: getBoolean(this.rc, 'show_statistics'),
    });
  }
}
