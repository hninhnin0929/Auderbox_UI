import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VolumeDiscountPage } from './volume-discount.page';

const routes: Routes = [
  {
    path: '',
    component: VolumeDiscountPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VolumeDiscountPageRoutingModule {}
