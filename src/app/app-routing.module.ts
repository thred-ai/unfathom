import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ShareComponent } from './share/share.component';
import { PrototypeModuleComponent } from './prototype-module/prototype-module.component';

const routes: Routes = [
  { path: 'account', component: AuthComponent, pathMatch: 'full' },

  {
    path: 'dashboard/:user',
    component: DashboardComponent,
    pathMatch: 'full',
  },
  {
    path: 'share/:id/scene/:scene',
    component: PrototypeModuleComponent,
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
