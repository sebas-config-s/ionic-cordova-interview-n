import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular/standalone';
import { RemoteConfigService } from '@core/services/remote-config.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(platform: Platform, remoteConfig: RemoteConfigService) {
    platform.ready().then(() => remoteConfig.fetchAndActivate());
  }
}
