import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DiscountTypePage } from './discount-type.page';

const routes: Routes = [
  {
    path: '',
    component: DiscountTypePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DiscountTypePageRoutingModule {}
