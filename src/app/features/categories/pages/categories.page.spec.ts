import { TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Signal, signal } from '@angular/core';
import { AlertController, IonItemSliding } from '@ionic/angular/standalone';
import { CategoriesPage } from './categories.page';
import { CategoryService } from '../services/category.service';
import { TaskService } from '../../tasks/services/task.service';
import { Task } from '../../tasks/models/task.model';
import { Category } from '../models/category.model';

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
const makeSliding = (): jasmine.SpyObj<IonItemSliding> =>
  jasmine.createSpyObj<IonItemSliding>('IonItemSliding', {
    close: Promise.resolve(),
  });

describe('CategoriesPage', () => {
  let component: CategoriesPage;
  let tasksWritable: ReturnType<typeof signal<Task[]>>;
  let categoriesWritable: ReturnType<typeof signal<Category[]>>;
  let addCatSpy: jasmine.Spy;
  let updateCatSpy: jasmine.Spy;
  let removeCatSpy: jasmine.Spy;
  let unlinkCatSpy: jasmine.Spy;
  let alertCreateSpy: jasmine.Spy;
  let alertPresentSpy: jasmine.Spy;

  beforeEach(async () => {
    tasksWritable = signal<Task[]>([]);
    categoriesWritable = signal<Category[]>([]);
    addCatSpy = jasmine.createSpy('add');
    updateCatSpy = jasmine.createSpy('update');
    removeCatSpy = jasmine.createSpy('remove');
    unlinkCatSpy = jasmine.createSpy('unlinkCategory');
    alertPresentSpy = jasmine.createSpy('present').and.resolveTo();
    alertCreateSpy = jasmine
      .createSpy('create')
      .and.resolveTo({ present: alertPresentSpy });

    await TestBed.configureTestingModule({
      imports: [CategoriesPage],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            categories: categoriesWritable.asReadonly() as Signal<Category[]>,
            add: addCatSpy,
            update: updateCatSpy,
            remove: removeCatSpy,
          },
        },
        {
          provide: TaskService,
          useValue: {
            tasks: tasksWritable.asReadonly() as Signal<Task[]>,
            unlinkCategory: unlinkCatSpy,
          },
        },
        { provide: AlertController, useValue: { create: alertCreateSpy } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    component = TestBed.createComponent(CategoriesPage).componentInstance;
  });

  it('should create', () => expect(component).toBeTruthy());

  describe('taskCountFor', () => {
    it('returns 0 for a category with no tasks', () => {
      tasksWritable.set([makeTask({ categoryId: 'cat-other' })]);
      expect(component.taskCountFor()('cat-empty')).toBe(0);
    });

    it('counts tasks belonging to the given category', () => {
      tasksWritable.set([
        makeTask({ categoryId: 'cat-a' }),
        makeTask({ categoryId: 'cat-a' }),
        makeTask({ categoryId: 'cat-b' }),
      ]);
      expect(component.taskCountFor()('cat-a')).toBe(2);
    });

    it('recomputes when tasks signal changes', () => {
      tasksWritable.set([makeTask({ categoryId: 'cat-a' })]);
      expect(component.taskCountFor()('cat-a')).toBe(1);
      tasksWritable.set([
        ...tasksWritable(),
        makeTask({ categoryId: 'cat-a' }),
      ]);
      expect(component.taskCountFor()('cat-a')).toBe(2);
    });
  });

  describe('addCategory', () => {
    it('opens an alert with the correct header', async () => {
      await component.addCategory();
      const opts = alertCreateSpy.calls.mostRecent().args[0];
      expect(opts.header).toBe('Nueva categoría');
    });

    it('presents the alert', async () => {
      await component.addCategory();
      expect(alertPresentSpy).toHaveBeenCalled();
    });

    it('calls categoryService.add when the confirm handler receives a valid name', async () => {
      await component.addCategory();
      const opts = alertCreateSpy.calls.mostRecent().args[0];
      const confirmBtn = opts.buttons.find(
        (b: { text: string }) => b.text === 'Crear',
      );
      confirmBtn.handler({ name: 'New Category' });
      expect(addCatSpy).toHaveBeenCalledWith('New Category');
    });

    it('does not call categoryService.add when the name is blank', async () => {
      await component.addCategory();
      const opts = alertCreateSpy.calls.mostRecent().args[0];
      const confirmBtn = opts.buttons.find(
        (b: { text: string }) => b.text === 'Crear',
      );
      confirmBtn.handler({ name: '   ' });
      expect(addCatSpy).not.toHaveBeenCalled();
    });
  });

  describe('editCategory', () => {
    const cat = makeCat({ id: 'cat-1', name: 'Work' });

    it('closes the sliding item before opening the alert', async () => {
      const sliding = makeSliding();
      await component.editCategory(cat, sliding);
      expect(sliding.close).toHaveBeenCalled();
    });

    it('opens an alert pre-filled with the current category name', async () => {
      await component.editCategory(cat, makeSliding());
      const opts = alertCreateSpy.calls.mostRecent().args[0];
      expect(opts.inputs[0].value).toBe('Work');
    });

    it('calls categoryService.update when the confirm handler receives a valid name', async () => {
      await component.editCategory(cat, makeSliding());
      const opts = alertCreateSpy.calls.mostRecent().args[0];
      const saveBtn = opts.buttons.find(
        (b: { text: string }) => b.text === 'Guardar',
      );
      saveBtn.handler({ name: 'Updated' });
      expect(updateCatSpy).toHaveBeenCalledWith('cat-1', 'Updated');
    });

    it('does not call categoryService.update when the name is blank', async () => {
      await component.editCategory(cat, makeSliding());
      const opts = alertCreateSpy.calls.mostRecent().args[0];
      const saveBtn = opts.buttons.find(
        (b: { text: string }) => b.text === 'Guardar',
      );
      saveBtn.handler({ name: '' });
      expect(updateCatSpy).not.toHaveBeenCalled();
    });
  });

  describe('deleteCategory', () => {
    it('closes the sliding item before opening the alert', async () => {
      const cat = makeCat();
      const sliding = makeSliding();
      await component.deleteCategory(cat, sliding);
      expect(sliding.close).toHaveBeenCalled();
    });

    it('shows a simple confirmation message when the category has no tasks', async () => {
      const cat = makeCat({ id: 'cat-empty', name: 'Empty Cat' });
      await component.deleteCategory(cat, makeSliding());
      const opts = alertCreateSpy.calls.mostRecent().args[0];
      expect(opts.message).toContain('"Empty Cat"');
    });

    it('warns about affected tasks when the category has tasks', async () => {
      const cat = makeCat({ id: 'cat-with-tasks' });
      tasksWritable.set([
        makeTask({ categoryId: 'cat-with-tasks' }),
        makeTask({ categoryId: 'cat-with-tasks' }),
      ]);
      await component.deleteCategory(cat, makeSliding());
      const opts = alertCreateSpy.calls.mostRecent().args[0];
      expect(opts.message).toContain('2 tarea(s)');
    });

    it('calls unlinkCategory and remove when the confirm handler fires', async () => {
      const cat = makeCat({ id: 'cat-del' });
      await component.deleteCategory(cat, makeSliding());
      const opts = alertCreateSpy.calls.mostRecent().args[0];
      const deleteBtn = opts.buttons.find(
        (b: { text: string }) => b.text === 'Eliminar',
      );
      deleteBtn.handler();
      expect(unlinkCatSpy).toHaveBeenCalledWith('cat-del');
      expect(removeCatSpy).toHaveBeenCalledWith('cat-del');
    });
  });
});
