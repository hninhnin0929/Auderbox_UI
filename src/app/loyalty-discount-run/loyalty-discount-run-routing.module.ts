import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoyaltyDiscountRunPage } from './loyalty-discount-run.page';

const routes: Routes = [
  {
    path: '',
    component: LoyaltyDiscountRunPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoyaltyDiscountRunPageRoutingModule {}
