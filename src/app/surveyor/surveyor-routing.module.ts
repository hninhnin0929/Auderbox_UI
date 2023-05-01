import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SurveyorPage } from './surveyor.page';

const routes: Routes = [
  {
    path: '',
    component: SurveyorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveyorPageRoutingModule {}
