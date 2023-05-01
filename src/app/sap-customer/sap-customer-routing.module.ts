import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SapCustomerPage } from './sap-customer.page';

const routes: Routes = [
  {
    path: '',
    component: SapCustomerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SapCustomerPageRoutingModule {}
