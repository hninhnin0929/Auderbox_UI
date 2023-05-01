import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoyaltyTransactionReportPage } from './loyalty-transaction-report.page';

const routes: Routes = [
  {
    path: '',
    component: LoyaltyTransactionReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoyaltyTransactionReportPageRoutingModule {}
