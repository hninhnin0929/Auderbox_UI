import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuParentPage } from './menu-parent.page';

const routes: Routes = [
  {
    path: '',
    component: MenuParentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuParentPageRoutingModule {}
