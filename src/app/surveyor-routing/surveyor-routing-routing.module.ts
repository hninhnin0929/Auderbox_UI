import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SurveyorRoutingPage } from './surveyor-routing.page';

const routes: Routes = [
  {
    path: '',
    component: SurveyorRoutingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveyorRoutingPageRoutingModule {}
