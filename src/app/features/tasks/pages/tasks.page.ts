import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgStyle } from '@angular/common';
import {
  IonBadge, IonButton, IonButtons, IonCard, IonCardContent,
  IonCheckbox, IonChip, IonContent, IonFab, IonFabButton,
  IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions,
  IonItemSliding, IonLabel, IonList, IonNote, IonSelect,
  IonSelectOption, IonTitle, IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, checkmarkDoneOutline, trash } from 'ionicons/icons';
import { CategoryService } from '../../categories/services/category.service';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-tasks',
  templateUrl: 'tasks.page.html',
  styleUrls: ['tasks.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, NgStyle,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonList, IonItem, IonLabel, IonCheckbox, IonBadge, IonNote,
    IonItemSliding, IonItemOptions, IonItemOption,
    IonFab, IonFabButton, IonIcon,
    IonChip,
    IonCard, IonCardContent,
    IonButton, IonSelect, IonSelectOption,
  ],
})
export class TasksPage {
  selectedCategoryId = signal<string | null>(null);
  showForm = signal(false);
  newTitle = '';
  newCategoryId: string | null = null;

  tasks = this.taskService.tasks;
  categories = this.categoryService.categories;

  readonly categoryMap = computed(() =>
    new Map(this.categories().map(c => [c.id, c]))
  );

  filteredTasks = computed(() => {
    const catId = this.selectedCategoryId();
    return catId
      ? this.tasks().filter(t => t.categoryId === catId)
      : this.tasks();
  });

  pendingCount = computed(() => this.tasks().filter(t => !t.completed).length);

  chipStyles = computed(() => {
    const selectedId = this.selectedCategoryId();
    return this.categories().reduce((acc, cat) => {
      const isSelected = selectedId === cat.id;
      acc[cat.id] = {
        '--background': isSelected ? cat.color : 'transparent',
        '--color': isSelected ? '#fff' : cat.color,
        'border': `2px solid ${cat.color}`,
        'border-radius': '16px',
      };
      return acc;
    }, {} as Record<string, Record<string, string>>);
  });

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
  ) {
    addIcons({ add, trash, checkmarkDoneOutline });
  }

  filterBy(categoryId: string | null): void {
    this.selectedCategoryId.set(categoryId);
  }

  toggleTask(id: string): void {
    this.taskService.toggle(id);
  }

  deleteTask(id: string, sliding?: IonItemSliding): void {
    sliding?.close();
    this.taskService.remove(id);
  }

  openForm(): void {
    this.newTitle = '';
    this.newCategoryId = null;
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
  }

  submitTask(): void {
    if (!this.newTitle.trim()) return;
    this.taskService.add(this.newTitle, this.newCategoryId);
    this.showForm.set(false);
  }

}
