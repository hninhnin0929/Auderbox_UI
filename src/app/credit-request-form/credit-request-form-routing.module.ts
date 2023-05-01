import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreditRequestFormPage } from './credit-request-form.page';

const routes: Routes = [
  {
    path: '',
    component: CreditRequestFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreditRequestFormPageRoutingModule {}
