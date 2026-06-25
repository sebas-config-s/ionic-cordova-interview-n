import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { AlertController } from '@ionic/angular/standalone';
import {
  IonContent, IonFab, IonFabButton, IonHeader, IonIcon,
  IonItem, IonItemOption, IonItemOptions, IonItemSliding,
  IonLabel, IonList, IonNote, IonTitle, IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, create, trash } from 'ionicons/icons';
import { Category } from '../models/category.model';
import { CategoryService } from '../services/category.service';
import { TaskService } from '../../tasks/services/task.service';

@Component({
  selector: 'app-categories',
  templateUrl: 'categories.page.html',
  styleUrls: ['categories.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonNote,
    IonItemSliding, IonItemOptions, IonItemOption,
    IonFab, IonFabButton, IonIcon,
  ],
})
export class CategoriesPage {
  categories = this.categoryService.categories;

  taskCountFor = computed(() => {
    const tasks = this.taskService.tasks();
    return (catId: string) => tasks.filter(t => t.categoryId === catId).length;
  });

  constructor(
    private categoryService: CategoryService,
    private taskService: TaskService,
    private alertCtrl: AlertController,
  ) {
    addIcons({ add, trash, create });
  }

  async addCategory(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Nueva categoría',
      inputs: [{ name: 'name', type: 'text', placeholder: 'Nombre' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: ({ name }: { name: string }) => {
            if (name?.trim()) this.categoryService.add(name);
          },
        },
      ],
    });
    await alert.present();
  }

  async editCategory(cat: Category, sliding: IonItemSliding): Promise<void> {
    sliding.close();
    const alert = await this.alertCtrl.create({
      header: 'Editar categoría',
      inputs: [{ name: 'name', type: 'text', value: cat.name, placeholder: 'Nombre' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: ({ name }: { name: string }) => {
            if (name?.trim()) this.categoryService.update(cat.id, name);
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteCategory(cat: Category, sliding: IonItemSliding): Promise<void> {
    sliding.close();
    const count = this.taskCountFor()(cat.id);
    const alert = await this.alertCtrl.create({
      header: 'Eliminar categoría',
      message: count > 0
        ? `Hay ${count} tarea(s) en esta categoría. Quedarán sin categoría.`
        : `¿Eliminar "${cat.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.taskService.unlinkCategory(cat.id);
            this.categoryService.remove(cat.id);
          },
        },
      ],
    });
    await alert.present();
  }

  trackById(_: number, cat: Category): string {
    return cat.id;
  }
}
