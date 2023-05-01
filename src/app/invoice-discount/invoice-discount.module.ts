import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InvoiceDiscountPageRoutingModule } from './invoice-discount-routing.module';

import { InvoiceDiscountPage } from './invoice-discount.page';

import { MatDatepickerModule, MatNativeDateModule, MatRadioModule, MatExpansionModule, MatAutocompleteModule, MatInputModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';
import { InvoiceDiscountInkindPopupPage } from '../invoice-discount-inkind-popup/invoice-discount-inkind-popup.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InvoiceDiscountPageRoutingModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    NgxPaginationModule,
    MatAutocompleteModule,
    MatInputModule,
    MatExpansionModule
  ],
  declarations: [
    InvoiceDiscountPage,
    InvoiceDiscountInkindPopupPage
  ]
})
export class InvoiceDiscountPageModule {}
