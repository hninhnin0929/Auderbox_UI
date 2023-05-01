import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RedflagReportPage } from './redflag-report.page';

const routes: Routes = [
  {
    path: '',
    component: RedflagReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RedflagReportPageRoutingModule {}
