import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UOMPage } from './uom.page';

const routes: Routes = [
  {
    path: '',
    component: UOMPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UOMPageRoutingModule {}
