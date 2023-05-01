import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoyaltyDiscountPageRoutingModule } from './loyalty-discount-routing.module';

import { LoyaltyDiscountPage } from './loyalty-discount.page';
import { MatAutocompleteModule, MatButtonModule, MatCheckboxModule, MatDatepickerModule, MatExpansionModule, MatInputModule, MatProgressBarModule, MatRadioModule, MatSelectModule, MatSlideToggleModule, MatTooltipModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoyaltyDiscountPageRoutingModule,
    MatDatepickerModule,
    MatRadioModule,
    MatSelectModule,
    NgxPaginationModule,
    MatProgressBarModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatExpansionModule,
    MatButtonModule,
    MatCheckboxModule,
    MatRadioModule
  ],
  declarations: [LoyaltyDiscountPage]
})
export class LoyaltyDiscountPageModule {}
