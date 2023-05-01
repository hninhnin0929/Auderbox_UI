import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoyaltyDiscountRunPageRoutingModule } from './loyalty-discount-run-routing.module';

import { LoyaltyDiscountRunPage } from './loyalty-discount-run.page';
import { MatExpansionModule, MatProgressBarModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoyaltyDiscountRunPageRoutingModule,
    MatProgressBarModule,
    MatExpansionModule
  ],
  declarations: [LoyaltyDiscountRunPage]
})
export class LoyaltyDiscountRunPageModule {}
