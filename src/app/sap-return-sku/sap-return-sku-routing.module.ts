import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SapReturnSkuPage } from './sap-return-sku.page';

const routes: Routes = [
  {
    path: '',
    component: SapReturnSkuPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SapReturnSkuPageRoutingModule {}
