import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoyaltyReportPage } from './loyalty-report.page';

const routes: Routes = [
  {
    path: '',
    component: LoyaltyReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoyaltyReportPageRoutingModule {}
