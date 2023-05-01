import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SurveyTransactionArchiveReportPage } from './survey-transaction-archive-report.page';

const routes: Routes = [
  {
    path: '',
    component: SurveyTransactionArchiveReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveyTransactionArchiveReportPageRoutingModule {}
