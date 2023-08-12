import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: 'account', component: AuthComponent, pathMatch: 'full' },

  {
    path: 'dashboard/:user',
    component: DashboardComponent,
    pathMatch: 'full',
  },
  { path: '', redirectTo: '/account', pathMatch: 'full' },
  { path: ':any', redirectTo: '/account', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
