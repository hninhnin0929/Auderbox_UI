import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SurveyorSummaryPage } from './surveyor-summary.page';

const routes: Routes = [
  {
    path: '',
    component: SurveyorSummaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  
})
export class SurveyorSummaryPageRoutingModule {}
