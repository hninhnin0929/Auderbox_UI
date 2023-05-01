import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SurveyTransactionReportPage } from './survey-transaction-report.page';

const routes: Routes = [
  {
    path: '',
    component: SurveyTransactionReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveyTransactionReportPageRoutingModule {}
