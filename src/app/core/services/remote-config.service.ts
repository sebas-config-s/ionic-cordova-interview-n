import { inject, Injectable, InjectionToken, signal } from '@angular/core';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { fetchAndActivate, getBoolean, getRemoteConfig, RemoteConfig } from 'firebase/remote-config';
import { environment } from '../../../environments/environment';

export interface FeatureFlags {
  showStatistics: boolean;
}

const DEFAULTS: FeatureFlags = { showStatistics: false };
const FETCH_INTERVAL_MS = 0;
const POLLING_INTERVAL_MS = 60_000;

export const RC_INSTANCE = new InjectionToken<RemoteConfig>('RC_INSTANCE', {
  providedIn: 'root',
  factory: () => {
    const app = getApps().length ? getApp() : initializeApp(environment.firebaseConfig);
    const rc = getRemoteConfig(app);
    rc.defaultConfig = { show_statistics: DEFAULTS.showStatistics };
    rc.settings.minimumFetchIntervalMillis = FETCH_INTERVAL_MS;
    return rc;
  },
});

export const RC_FETCH = new InjectionToken<(rc: RemoteConfig) => Promise<boolean>>('RC_FETCH', {
  providedIn: 'root',
  factory: () => fetchAndActivate,
});

export const RC_GET_BOOLEAN = new InjectionToken<(rc: RemoteConfig, key: string) => boolean>('RC_GET_BOOLEAN', {
  providedIn: 'root',
  factory: () => getBoolean,
});

@Injectable({ providedIn: 'root' })
export class RemoteConfigService {
  private readonly rc = inject(RC_INSTANCE);
  private readonly fetchFn = inject(RC_FETCH);
  private readonly getBooleanFn = inject(RC_GET_BOOLEAN);
  private _flags = signal<FeatureFlags>({ ...DEFAULTS });
  private pollingTimer: ReturnType<typeof setInterval> | undefined;

  readonly flags = this._flags.asReadonly();

  setFlag<K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]): void {
    this._flags.update(f => ({ ...f, [key]: value }));
  }

  private readFlags(): void {
    this._flags.set({
      showStatistics: this.getBooleanFn(this.rc, 'show_statistics'),
    });
  }

  async fetchAndActivate(): Promise<void> {
    await this.fetchFn(this.rc);
    this.readFlags();
    this.startPolling();
  }

  private startPolling(): void {
    if (this.pollingTimer !== undefined) return;
    this.pollingTimer = setInterval(() => {
      this.fetchFn(this.rc).then(() => this.readFlags());
    }, POLLING_INTERVAL_MS);
  }
}
