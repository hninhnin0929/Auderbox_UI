import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DelieveryOrderPage } from './delievery-order.page';

const routes: Routes = [
  {
    path: '',
    component: DelieveryOrderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DelieveryOrderPageRoutingModule {}
