import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmptyBottleReportPage } from './empty-bottle-report.page';

const routes: Routes = [
  {
    path: '',
    component: EmptyBottleReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmptyBottleReportPageRoutingModule {}
