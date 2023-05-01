import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PriceZonePage } from './price-zone.page';

const routes: Routes = [
  {
    path: '',
    component: PriceZonePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PriceZonePageRoutingModule {}
