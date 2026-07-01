import { TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Platform } from '@ionic/angular/standalone';
import { AppComponent } from './app.component';
import { RemoteConfigService } from '@core/services/remote-config.service';

describe('AppComponent', () => {
  let platformMock: { ready: jasmine.Spy };
  let fetchActivateSpy: jasmine.Spy;

  beforeEach(async () => {
    fetchActivateSpy = jasmine.createSpy('fetchAndActivate').and.resolveTo();
    platformMock = { ready: jasmine.createSpy('ready').and.resolveTo('dom') };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: Platform, useValue: platformMock },
        {
          provide: RemoteConfigService,
          useValue: {
            flags: signal({ showStatistics: false }).asReadonly(),
            fetchAndActivate: fetchActivateSpy,
          },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .overrideComponent(AppComponent, { set: { imports: [] } })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('calls platform.ready() on init', () => {
    TestBed.createComponent(AppComponent);
    expect(platformMock.ready).toHaveBeenCalledTimes(1);
  });

  it('calls remoteConfig.fetchAndActivate() after platform is ready', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    expect(fetchActivateSpy).toHaveBeenCalledTimes(1);
  });
});
