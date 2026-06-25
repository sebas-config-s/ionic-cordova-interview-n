import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tasks',
        loadChildren: () =>
          import('../../features/tasks/tasks.routes').then(m => m.TASKS_ROUTES),
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('../../features/categories/categories.routes').then(m => m.CATEGORIES_ROUTES),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('../../features/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
      },
      {
        path: '',
        redirectTo: '/tabs/tasks',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tasks',
    pathMatch: 'full',
  },
];
