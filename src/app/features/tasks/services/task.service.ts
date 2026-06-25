import { Injectable, signal } from '@angular/core';
import { Task } from '../models/task.model';
import { STORAGE_KEYS } from '@core/constants/storage-keys';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly KEY = STORAGE_KEYS.TASKS;
  private _tasks = signal<Task[]>(this.load());

  readonly tasks = this._tasks.asReadonly();

  private load(): Task[] {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  private persist(tasks: Task[]): void {
    localStorage.setItem(this.KEY, JSON.stringify(tasks));
  }

  add(title: string, categoryId: string | null = null): void {
    const task: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      categoryId,
      createdAt: Date.now(),
    };
    this._tasks.update(tasks => {
      const updated = [task, ...tasks];
      this.persist(updated);
      return updated;
    });
  }

  toggle(id: string): void {
    this._tasks.update(tasks => {
      const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      this.persist(updated);
      return updated;
    });
  }

  remove(id: string): void {
    this._tasks.update(tasks => {
      const updated = tasks.filter(t => t.id !== id);
      this.persist(updated);
      return updated;
    });
  }

  unlinkCategory(categoryId: string): void {
    this._tasks.update(tasks => {
      const updated = tasks.map(t =>
        t.categoryId === categoryId ? { ...t, categoryId: null } : t
      );
      this.persist(updated);
      return updated;
    });
  }
}
