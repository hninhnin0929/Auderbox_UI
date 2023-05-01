import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AverageOrderAmountPage } from './average-order-amount.page';

const routes: Routes = [
  {
    path: '',
    component: AverageOrderAmountPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AverageOrderAmountPageRoutingModule {}
