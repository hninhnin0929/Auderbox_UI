import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoyaltyDiscountPage } from './loyalty-discount.page';

const routes: Routes = [
  {
    path: '',
    component: LoyaltyDiscountPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoyaltyDiscountPageRoutingModule {}
