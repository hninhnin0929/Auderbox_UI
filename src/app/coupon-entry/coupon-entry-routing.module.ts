import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CouponEntryPage } from './coupon-entry.page';

const routes: Routes = [
  {
    path: '',
    component: CouponEntryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CouponEntryPageRoutingModule {}
