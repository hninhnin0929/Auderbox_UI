import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SapPaymentPage } from './sap-payment.page';

const routes: Routes = [
  {
    path: '',
    component: SapPaymentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SapPaymentPageRoutingModule {}
