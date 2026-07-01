import { TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Signal, signal } from '@angular/core';
import { SettingsPage } from './settings.page';
import {
  RemoteConfigService,
  FeatureFlags,
} from '../../../core/services/remote-config.service';
import { TaskService } from '../../tasks/services/task.service';
import { Task } from '../../tasks/models/task.model';

let seq = 0;
const makeTask = (o: Partial<Task> = {}): Task => ({
  id: `task-${++seq}`,
  title: 'Task',
  completed: false,
  categoryId: null,
  createdAt: 0,
  ...o,
});

describe('SettingsPage', () => {
  let component: SettingsPage;
  let tasksWritable: ReturnType<typeof signal<Task[]>>;
  let flagsWritable: ReturnType<typeof signal<FeatureFlags>>;
  let setFlagSpy: jasmine.Spy;

  beforeEach(async () => {
    tasksWritable = signal<Task[]>([]);
    flagsWritable = signal<FeatureFlags>({ showStatistics: false });
    setFlagSpy = jasmine.createSpy('setFlag');

    await TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        {
          provide: RemoteConfigService,
          useValue: {
            flags: flagsWritable.asReadonly() as Signal<FeatureFlags>,
            setFlag: setFlagSpy,
          },
        },
        {
          provide: TaskService,
          useValue: {
            tasks: tasksWritable.asReadonly() as Signal<Task[]>,
          },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    component = TestBed.createComponent(SettingsPage).componentInstance;
  });

  it('should create', () => expect(component).toBeTruthy());

  describe('flags', () => {
    it('exposes the remote config flags signal', () => {
      expect(component.flags().showStatistics).toBeFalse();
    });

    it('reflects flag updates from the remote config signal', () => {
      flagsWritable.set({ showStatistics: true });
      expect(component.flags().showStatistics).toBeTrue();
    });
  });

  describe('stats', () => {
    it('returns zeros when there are no tasks', () => {
      expect(component.stats()).toEqual({
        total: 0,
        done: 0,
        pending: 0,
        pct: 0,
      });
    });

    it('calculates totals correctly with mixed tasks', () => {
      tasksWritable.set([
        makeTask({ completed: true }),
        makeTask({ completed: false }),
        makeTask({ completed: true }),
      ]);
      expect(component.stats()).toEqual({
        total: 3,
        done: 2,
        pending: 1,
        pct: 67,
      });
    });

    it('returns pct 100 when all tasks are done', () => {
      tasksWritable.set([
        makeTask({ completed: true }),
        makeTask({ completed: true }),
      ]);
      expect(component.stats().pct).toBe(100);
    });

    it('returns pct 0 when no tasks are done', () => {
      tasksWritable.set([makeTask(), makeTask()]);
      expect(component.stats().pct).toBe(0);
    });

    it('rounds the percentage', () => {
      tasksWritable.set([
        makeTask({ completed: true }),
        makeTask({ completed: false }),
        makeTask({ completed: false }),
      ]);
      expect(component.stats().pct).toBe(33);
    });

    it('recomputes when tasks signal changes', () => {
      expect(component.stats().total).toBe(0);
      tasksWritable.set([makeTask()]);
      expect(component.stats().total).toBe(1);
    });
  });

  describe('toggleStatistics', () => {
    const makeEvent = (checked: boolean) =>
      new CustomEvent('ionChange', { detail: { checked } });

    it('calls remoteConfig.setFlag with true when toggled on', () => {
      component.toggleStatistics(makeEvent(true));
      expect(setFlagSpy).toHaveBeenCalledWith('showStatistics', true);
    });

    it('calls remoteConfig.setFlag with false when toggled off', () => {
      component.toggleStatistics(makeEvent(false));
      expect(setFlagSpy).toHaveBeenCalledWith('showStatistics', false);
    });
  });
});
