import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SurveyorResponsePage } from './surveyor-response.page';

const routes: Routes = [
  {
    path: '',
    component: SurveyorResponsePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveyorResponsePageRoutingModule { }
