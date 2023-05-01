import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CheckinReportPage } from './checkin-report.page';

const routes: Routes = [
  {
    path: '',
    component: CheckinReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckinReportPageRoutingModule {}
