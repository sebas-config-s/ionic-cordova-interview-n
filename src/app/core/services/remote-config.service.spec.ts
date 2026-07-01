import {
  TestBed,
  fakeAsync,
  flushMicrotasks,
  tick,
  discardPeriodicTasks,
} from '@angular/core/testing';
import {
  RemoteConfigService,
  RC_INSTANCE,
  RC_FETCH,
  RC_GET_BOOLEAN,
} from './remote-config.service';

describe('RemoteConfigService', () => {
  let service: RemoteConfigService;
  let fetchSpy: jasmine.Spy;
  let boolSpy: jasmine.Spy;

  beforeEach(() => {
    fetchSpy = jasmine.createSpy('fetchAndActivate').and.resolveTo(true);
    boolSpy = jasmine.createSpy('getBoolean').and.returnValue(false);

    TestBed.configureTestingModule({
      providers: [
        { provide: RC_INSTANCE, useValue: {} },
        { provide: RC_FETCH, useValue: fetchSpy },
        { provide: RC_GET_BOOLEAN, useValue: boolSpy },
      ],
    });
    service = TestBed.inject(RemoteConfigService);
  });

  it('should create with default flags', () => {
    expect(service).toBeTruthy();
    expect(service.flags().showStatistics).toBeFalse();
  });

  describe('fetchAndActivate', () => {
    it('calls Firebase fetchAndActivate once', fakeAsync(() => {
      service.fetchAndActivate();
      flushMicrotasks();
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      discardPeriodicTasks();
    }));

    it('reads flags from Remote Config after activation', fakeAsync(() => {
      boolSpy.and.returnValue(true);
      service.fetchAndActivate();
      flushMicrotasks();
      expect(service.flags().showStatistics).toBeTrue();
      discardPeriodicTasks();
    }));
  });

  describe('polling guard', () => {
    it('creates only one interval even after multiple fetchAndActivate calls', fakeAsync(() => {
      service.fetchAndActivate();
      flushMicrotasks();

      service.fetchAndActivate();
      flushMicrotasks();

      tick(60_000);
      flushMicrotasks();

      expect(fetchSpy).toHaveBeenCalledTimes(3);
      discardPeriodicTasks();
    }));
  });

  describe('setFlag', () => {
    it('manually overrides a flag value', () => {
      service.setFlag('showStatistics', true);
      expect(service.flags().showStatistics).toBeTrue();
    });

    it('is reflected immediately via the readonly signal', () => {
      const flags = service.flags;
      service.setFlag('showStatistics', true);
      expect(flags().showStatistics).toBeTrue();
    });
  });
});
