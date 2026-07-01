import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';
import { STORAGE_KEYS } from '@core/constants/storage-keys';

const KEY = STORAGE_KEYS.CATEGORIES;

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryService);
  });

  afterEach(() => localStorage.clear());

  it('should create', () => expect(service).toBeTruthy());

  describe('load', () => {
    it('starts with empty list when storage is empty', () => {
      expect(service.categories()).toEqual([]);
    });

    it('restores categories from localStorage on init', () => {
      const stored = [{ id: '1', name: 'Work', color: '#3880ff' }];
      localStorage.setItem(KEY, JSON.stringify(stored));
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      expect(TestBed.inject(CategoryService).categories()).toEqual(stored);
    });

    it('falls back to empty list on corrupt storage', () => {
      localStorage.setItem(KEY, 'not-valid-json');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      expect(TestBed.inject(CategoryService).categories()).toEqual([]);
    });
  });

  describe('add', () => {
    it('creates a category with a color from the palette', () => {
      service.add('Work');
      expect(service.categories()[0].color).toBeTruthy();
    });

    it('trims the name', () => {
      service.add('  Work  ');
      expect(service.categories()[0].name).toBe('Work');
    });

    it('generates a unique id for each category', () => {
      service.add('A');
      service.add('B');
      const ids = service.categories().map((c) => c.id);
      expect(new Set(ids).size).toBe(2);
    });

    it('cycles through palette colors so each has a color', () => {
      for (let i = 0; i < 8; i++) service.add(`Cat ${i}`);
      expect(service.categories()[7].color).toBe(service.categories()[0].color);
    });

    it('persists to localStorage', () => {
      service.add('Work');
      const stored = JSON.parse(localStorage.getItem(KEY) ?? '[]');
      expect(stored.length).toBe(1);
      expect(stored[0].name).toBe('Work');
    });
  });

  describe('update', () => {
    beforeEach(() => service.add('Old Name'));

    it('updates the category name', () => {
      const id = service.categories()[0].id;
      service.update(id, 'New Name');
      expect(service.categories()[0].name).toBe('New Name');
    });

    it('trims the updated name', () => {
      const id = service.categories()[0].id;
      service.update(id, '  Trimmed  ');
      expect(service.categories()[0].name).toBe('Trimmed');
    });

    it('preserves the id and color', () => {
      const original = service.categories()[0];
      service.update(original.id, 'Renamed');
      const updated = service.categories()[0];
      expect(updated.id).toBe(original.id);
      expect(updated.color).toBe(original.color);
    });

    it('persists after update', () => {
      const id = service.categories()[0].id;
      service.update(id, 'Updated');
      const stored = JSON.parse(localStorage.getItem(KEY) ?? '[]');
      expect(stored[0].name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('removes the category with the given id', () => {
      service.add('A');
      service.add('B');
      service.remove(service.categories()[0].id);
      expect(service.categories().length).toBe(1);
    });

    it('persists after removal', () => {
      service.add('Cat');
      service.remove(service.categories()[0].id);
      const stored = JSON.parse(localStorage.getItem(KEY) ?? '[]');
      expect(stored.length).toBe(0);
    });
  });

  describe('getById', () => {
    it('returns the matching category', () => {
      service.add('Work');
      const id = service.categories()[0].id;
      expect(service.getById(id)?.name).toBe('Work');
    });

    it('returns undefined for an unknown id', () => {
      expect(service.getById('non-existent')).toBeUndefined();
    });
  });
});
