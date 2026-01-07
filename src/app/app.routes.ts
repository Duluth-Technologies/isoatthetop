import { Routes } from '@angular/router';

import { HomeRedirectPage } from './pages/home-redirect.page';
import { MentionsLegalesPage } from './pages/mentions-legales.page';
import { NotFoundPage } from './pages/not-found.page';
import { SeasonPage } from './pages/season.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeRedirectPage },
  { path: 'winter', component: SeasonPage, data: { season: 'winter' } },
  { path: 'summer', component: SeasonPage, data: { season: 'summer' } },
  { path: 'hiver', component: SeasonPage, data: { season: 'winter' } },
  { path: 'ete', component: SeasonPage, data: { season: 'summer' } },
  { path: 'mentions-legales', component: MentionsLegalesPage },
  { path: '404', component: NotFoundPage },
  { path: '**', component: NotFoundPage },
];
