import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { STORAGE_KEYS } from '@core/constants/storage-keys';

const KEY = STORAGE_KEYS.TASKS;

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
  });

  afterEach(() => localStorage.clear());

  it('should create', () => expect(service).toBeTruthy());

  describe('load', () => {
    it('starts with empty list when storage is empty', () => {
      expect(service.tasks()).toEqual([]);
    });

    it('restores tasks from localStorage on init', () => {
      const stored = [
        {
          id: '1',
          title: 'Persisted',
          completed: false,
          categoryId: null,
          createdAt: 0,
        },
      ];
      localStorage.setItem(KEY, JSON.stringify(stored));
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      expect(TestBed.inject(TaskService).tasks()).toEqual(stored);
    });

    it('falls back to empty list on corrupt storage', () => {
      localStorage.setItem(KEY, '{bad json}');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      expect(TestBed.inject(TaskService).tasks()).toEqual([]);
    });
  });

  describe('add', () => {
    it('prepends the new task so newest is first', () => {
      service.add('First');
      service.add('Second');
      expect(service.tasks()[0].title).toBe('Second');
      expect(service.tasks()[1].title).toBe('First');
    });

    it('trims the title', () => {
      service.add('  Hello  ');
      expect(service.tasks()[0].title).toBe('Hello');
    });

    it('sets completed to false', () => {
      service.add('Task');
      expect(service.tasks()[0].completed).toBeFalse();
    });

    it('uses the provided categoryId', () => {
      service.add('Task', 'cat-1');
      expect(service.tasks()[0].categoryId).toBe('cat-1');
    });

    it('defaults categoryId to null', () => {
      service.add('Task');
      expect(service.tasks()[0].categoryId).toBeNull();
    });

    it('persists to localStorage', () => {
      service.add('Task');
      const stored = JSON.parse(localStorage.getItem(KEY) ?? '[]');
      expect(stored.length).toBe(1);
      expect(stored[0].title).toBe('Task');
    });
  });

  describe('toggle', () => {
    beforeEach(() => service.add('Task'));

    it('marks an incomplete task as complete', () => {
      const id = service.tasks()[0].id;
      service.toggle(id);
      expect(service.tasks()[0].completed).toBeTrue();
    });

    it('marks a complete task as incomplete', () => {
      const id = service.tasks()[0].id;
      service.toggle(id);
      service.toggle(id);
      expect(service.tasks()[0].completed).toBeFalse();
    });

    it('only affects the targeted task', () => {
      service.add('Other');
      const targetId = service.tasks()[0].id;
      service.toggle(targetId);
      expect(service.tasks()[0].completed).toBeTrue();
      expect(service.tasks()[1].completed).toBeFalse();
    });

    it('persists the toggled state', () => {
      const id = service.tasks()[0].id;
      service.toggle(id);
      const stored = JSON.parse(localStorage.getItem(KEY) ?? '[]');
      expect(stored[0].completed).toBeTrue();
    });
  });

  describe('remove', () => {
    it('removes the task with the given id', () => {
      service.add('A');
      service.add('B');
      const idToRemove = service.tasks()[1].id;
      service.remove(idToRemove);
      expect(service.tasks().length).toBe(1);
      expect(service.tasks()[0].title).toBe('B');
    });

    it('is a no-op for an unknown id', () => {
      service.add('Task');
      service.remove('non-existent');
      expect(service.tasks().length).toBe(1);
    });

    it('persists after removal', () => {
      service.add('Task');
      service.remove(service.tasks()[0].id);
      const stored = JSON.parse(localStorage.getItem(KEY) ?? '[]');
      expect(stored.length).toBe(0);
    });
  });

  describe('unlinkCategory', () => {
    it('sets categoryId to null for every task in that category', () => {
      service.add('T1', 'cat-a');
      service.add('T2', 'cat-a');
      service.unlinkCategory('cat-a');
      expect(service.tasks().every((t) => t.categoryId === null)).toBeTrue();
    });

    it('does not affect tasks in other categories', () => {
      service.add('T1', 'cat-a');
      service.add('T2', 'cat-b');
      service.unlinkCategory('cat-a');
      expect(service.tasks().find((t) => t.title === 'T2')?.categoryId).toBe(
        'cat-b',
      );
    });

    it('persists after unlinking', () => {
      service.add('Task', 'cat-a');
      service.unlinkCategory('cat-a');
      const stored = JSON.parse(localStorage.getItem(KEY) ?? '[]');
      expect(stored[0].categoryId).toBeNull();
    });
  });
});
