import { Injectable, signal } from '@angular/core';
import { Category } from '../models/category.model';
import { STORAGE_KEYS } from '@core/constants/storage-keys';

const PALETTE = [
  '#3880ff',
  '#eb445a',
  '#2dd36f',
  '#ffc409',
  '#92949c',
  '#6a64ff',
  '#f47b39',
];

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly KEY = STORAGE_KEYS.CATEGORIES;
  private _categories = signal<Category[]>(this.load());

  readonly categories = this._categories.asReadonly();

  private load(): Category[] {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  private persist(cats: Category[]): void {
    localStorage.setItem(this.KEY, JSON.stringify(cats));
  }

  add(name: string): void {
    const cat: Category = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color: PALETTE[this._categories().length % PALETTE.length],
    };
    this._categories.update((cats) => {
      const updated = [...cats, cat];
      this.persist(updated);
      return updated;
    });
  }

  update(id: string, name: string): void {
    this._categories.update((cats) => {
      const updated = cats.map((c) =>
        c.id === id ? { ...c, name: name.trim() } : c,
      );
      this.persist(updated);
      return updated;
    });
  }

  remove(id: string): void {
    this._categories.update((cats) => {
      const updated = cats.filter((c) => c.id !== id);
      this.persist(updated);
      return updated;
    });
  }

  getById(id: string): Category | undefined {
    return this._categories().find((c) => c.id === id);
  }
}
