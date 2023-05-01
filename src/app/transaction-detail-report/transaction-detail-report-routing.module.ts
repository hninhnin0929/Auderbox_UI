import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransactionDetailReportPage } from './transaction-detail-report.page';

const routes: Routes = [
  {
    path: '',
    component: TransactionDetailReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionDetailReportPageRoutingModule {}
