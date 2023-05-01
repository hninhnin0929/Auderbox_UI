import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SapDeliveryPage } from './sap-delivery.page';

const routes: Routes = [
  {
    path: '',
    component: SapDeliveryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SapDeliveryPageRoutingModule {}
