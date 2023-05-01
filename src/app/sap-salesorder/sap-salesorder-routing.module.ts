import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SapSalesOrderPage } from './sap-salesorder.page';

const routes: Routes = [
  {
    path: '',
    component: SapSalesOrderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SapSalesOrderPageRoutingModule {}
