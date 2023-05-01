import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SapCreditBalancePage } from './sap-credit-balance.page';

const routes: Routes = [
  {
    path: '',
    component: SapCreditBalancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SapCreditBalancePageRoutingModule {}
