import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderReportBySummaryPage } from './order-report-by-summary.page';

const routes: Routes = [
  {
    path: '',
    component: OrderReportBySummaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderReportBySummaryPageRoutingModule {}
