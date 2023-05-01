import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InvoiceDiscountInkindPopupPageRoutingModule } from './invoice-discount-inkind-popup-routing.module';

import { InvoiceDiscountInkindPopupPage } from './invoice-discount-inkind-popup.page';

import { MatAutocompleteModule, MatInputModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InvoiceDiscountInkindPopupPageRoutingModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule
  ],
})
export class InvoiceDiscountInkindPopupPageModule {}
