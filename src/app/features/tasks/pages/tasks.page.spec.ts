import { TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Signal, signal } from '@angular/core';
import { TasksPage } from './tasks.page';
import { TaskService } from '../services/task.service';
import { CategoryService } from '../../categories/services/category.service';
import { Task } from '../models/task.model';
import { Category } from '../../categories/models/category.model';

let seq = 0;
const makeTask = (o: Partial<Task> = {}): Task => ({
  id: `task-${++seq}`,
  title: 'Task',
  completed: false,
  categoryId: null,
  createdAt: 0,
  ...o,
});
const makeCat = (o: Partial<Category> = {}): Category => ({
  id: `cat-${++seq}`,
  name: 'Category',
  color: '#3880ff',
  ...o,
});

describe('TasksPage', () => {
  let component: TasksPage;
  let tasksWritable: ReturnType<typeof signal<Task[]>>;
  let categoriesWritable: ReturnType<typeof signal<Category[]>>;
  let addSpy: jasmine.Spy;
  let toggleSpy: jasmine.Spy;
  let removeSpy: jasmine.Spy;

  beforeEach(async () => {
    tasksWritable = signal<Task[]>([]);
    categoriesWritable = signal<Category[]>([]);
    addSpy = jasmine.createSpy('add');
    toggleSpy = jasmine.createSpy('toggle');
    removeSpy = jasmine.createSpy('remove');

    await TestBed.configureTestingModule({
      imports: [TasksPage],
      providers: [
        {
          provide: TaskService,
          useValue: {
            tasks: tasksWritable.asReadonly() as Signal<Task[]>,
            add: addSpy,
            toggle: toggleSpy,
            remove: removeSpy,
          },
        },
        {
          provide: CategoryService,
          useValue: {
            categories: categoriesWritable.asReadonly() as Signal<Category[]>,
            getById: jasmine.createSpy('getById'),
          },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    component = TestBed.createComponent(TasksPage).componentInstance;
  });

  it('should create', () => expect(component).toBeTruthy());

  describe('filteredTasks', () => {
    it('returns all tasks when no category is selected', () => {
      tasksWritable.set([makeTask(), makeTask()]);
      expect(component.filteredTasks().length).toBe(2);
    });

    it('returns only tasks matching the selected category', () => {
      tasksWritable.set([
        makeTask({ categoryId: 'cat-1' }),
        makeTask({ categoryId: 'cat-2' }),
        makeTask({ categoryId: 'cat-1' }),
      ]);
      component.filterBy('cat-1');
      expect(component.filteredTasks().length).toBe(2);
    });

    it('returns all tasks after clearing the filter', () => {
      tasksWritable.set([
        makeTask({ categoryId: 'cat-1' }),
        makeTask({ categoryId: 'cat-2' }),
      ]);
      component.filterBy('cat-1');
      component.filterBy(null);
      expect(component.filteredTasks().length).toBe(2);
    });

    it('returns an empty list when there are no tasks', () => {
      expect(component.filteredTasks()).toEqual([]);
    });
  });

  describe('pendingCount', () => {
    it('returns 0 when all tasks are completed', () => {
      tasksWritable.set([
        makeTask({ completed: true }),
        makeTask({ completed: true }),
      ]);
      expect(component.pendingCount()).toBe(0);
    });

    it('counts only incomplete tasks', () => {
      tasksWritable.set([
        makeTask({ completed: false }),
        makeTask({ completed: true }),
        makeTask({ completed: false }),
      ]);
      expect(component.pendingCount()).toBe(2);
    });

    it('returns 0 for an empty list', () => {
      expect(component.pendingCount()).toBe(0);
    });
  });

  describe('categoryMap', () => {
    it('returns an empty Map when there are no categories', () => {
      expect(component.categoryMap().size).toBe(0);
    });

    it('maps each category id to its object', () => {
      const cat = makeCat({ id: 'cat-x', name: 'Work' });
      categoriesWritable.set([cat]);
      expect(component.categoryMap().get('cat-x')).toEqual(cat);
    });

    it('updates when the categories signal changes', () => {
      categoriesWritable.set([makeCat({ id: 'a' })]);
      expect(component.categoryMap().size).toBe(1);
      categoriesWritable.set([makeCat({ id: 'a' }), makeCat({ id: 'b' })]);
      expect(component.categoryMap().size).toBe(2);
    });
  });

  describe('form state', () => {
    it('showForm is false on init', () => {
      expect(component.showForm()).toBeFalse();
    });

    it('openForm sets showForm to true and resets title and categoryId', () => {
      component.newTitle = 'dirty';
      component.newCategoryId = 'cat-1';
      component.openForm();
      expect(component.showForm()).toBeTrue();
      expect(component.newTitle).toBe('');
      expect(component.newCategoryId).toBeNull();
    });

    it('cancelForm sets showForm to false', () => {
      component.openForm();
      component.cancelForm();
      expect(component.showForm()).toBeFalse();
    });
  });

  describe('submitTask', () => {
    it('does nothing when title is blank', () => {
      component.newTitle = '   ';
      component.submitTask();
      expect(addSpy).not.toHaveBeenCalled();
    });

    it('calls taskService.add with the entered title and categoryId', () => {
      component.newTitle = 'Buy milk';
      component.newCategoryId = 'cat-1';
      component.submitTask();
      expect(addSpy).toHaveBeenCalledWith('Buy milk', 'cat-1');
    });

    it('hides the form after a successful submit', () => {
      component.openForm();
      component.newTitle = 'Task';
      component.submitTask();
      expect(component.showForm()).toBeFalse();
    });
  });

  describe('toggleTask', () => {
    it('delegates to taskService.toggle with the task id', () => {
      component.toggleTask('task-99');
      expect(toggleSpy).toHaveBeenCalledWith('task-99');
    });
  });

  describe('deleteTask', () => {
    it('delegates to taskService.remove with the task id', () => {
      component.deleteTask('task-99');
      expect(removeSpy).toHaveBeenCalledWith('task-99');
    });
  });

  describe('filterBy', () => {
    it('sets the selected category id', () => {
      component.filterBy('cat-5');
      expect(component.selectedCategoryId()).toBe('cat-5');
    });

    it('clears the filter when called with null', () => {
      component.filterBy('cat-5');
      component.filterBy(null);
      expect(component.selectedCategoryId()).toBeNull();
    });
  });
});
