import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VoidReportPage } from './void-report.page';

const routes: Routes = [
  {
    path: '',
    component: VoidReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VoidReportPageRoutingModule {}
