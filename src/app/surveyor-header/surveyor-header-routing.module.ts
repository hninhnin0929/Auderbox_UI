import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SurveyorHeaderPage } from './surveyor-header.page';

const routes: Routes = [
  {
    path: '',
    component: SurveyorHeaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveyorHeaderPageRoutingModule {}
