import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CouponEntryPageRoutingModule } from './coupon-entry-routing.module';

import { CouponEntryPage } from './coupon-entry.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CouponEntryPageRoutingModule
  ],
  declarations: [CouponEntryPage]
})
export class CouponEntryPageModule {}
