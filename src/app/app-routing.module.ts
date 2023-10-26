import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ShareComponent } from './share/share.component';
import { PrototypeModuleComponent } from './prototype-module/prototype-module.component';
import { DesignerComponent } from './designer/designer.component';

const routes: Routes = [
  // { path: 'account', component: AuthComponent, pathMatch: 'full' },
  {
    path: 'account',
    component: AuthComponent,
    pathMatch: 'full',
    runGuardsAndResolvers: 'always',
  },

  {
    path: 'dashboard/:user',
    component: DashboardComponent,
    pathMatch: 'full',
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'share/:id',
    component: PrototypeModuleComponent,
    pathMatch: 'full',
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'design/:id',
    component: DesignerComponent,
    pathMatch: 'full',
    runGuardsAndResolvers: 'always',
    
  },
  {
    path: '',
    redirectTo: '/account',
    pathMatch: 'full',
    runGuardsAndResolvers: 'always',
  },
  {
    path: ':any',
    redirectTo: '/account',
    pathMatch: 'full',
    runGuardsAndResolvers: 'always',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
