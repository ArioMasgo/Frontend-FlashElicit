import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { ElicitationComponent } from './pages/elicitation/elicitation.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'elicit',
    component: ElicitationComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
