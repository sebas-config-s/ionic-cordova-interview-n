import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  cloudOutline,
  closeCircle,
  statsChartOutline,
} from 'ionicons/icons';
import { RemoteConfigService } from '../../../core/services/remote-config.service';
import { TaskService } from '../../tasks/services/task.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonToggle,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
  ],
})
export class SettingsPage {
  flags = this.remoteConfig.flags;

  stats = computed(() => {
    const all = this.taskService.tasks();
    const total = all.length;
    const done = all.filter((t) => t.completed).length;
    const pending = total - done;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, pending, pct };
  });

  constructor(
    private remoteConfig: RemoteConfigService,
    private taskService: TaskService,
  ) {
    addIcons({ cloudOutline, statsChartOutline, checkmarkCircle, closeCircle });
  }

  toggleStatistics(event: CustomEvent): void {
    this.remoteConfig.setFlag(
      'showStatistics',
      (event as CustomEvent<{ checked: boolean }>).detail.checked,
    );
  }
}
