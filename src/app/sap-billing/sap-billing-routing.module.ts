import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SapBillingPage } from './sap-billing.page';

const routes: Routes = [
  {
    path: '',
    component: SapBillingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SapBillingPageRoutingModule {}
