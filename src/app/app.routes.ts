import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./layout/tabs-layout/tabs.routes').then(m => m.routes),
  },
];
