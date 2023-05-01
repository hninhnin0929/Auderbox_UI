import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PacktypePage } from './packtype.page';

const routes: Routes = [
  {
    path: '',
    component: PacktypePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PacktypePageRoutingModule {}
