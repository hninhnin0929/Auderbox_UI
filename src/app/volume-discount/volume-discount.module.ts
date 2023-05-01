import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VolumeDiscountPageRoutingModule } from './volume-discount-routing.module';

import { VolumeDiscountPage } from './volume-discount.page';

import { MatDatepickerModule, MatNativeDateModule, MatRadioModule, MatExpansionModule, MatAutocompleteModule, MatInputModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';
import { VolumeDiscountInkindPopupPage } from '../volume-discount-inkind-popup/volume-discount-inkind-popup.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VolumeDiscountPageRoutingModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxPaginationModule,
    MatAutocompleteModule,
    MatInputModule,
    MatRadioModule,
    MatExpansionModule
  ],
  declarations: [
    VolumeDiscountPage,
    VolumeDiscountInkindPopupPage
  ]
})
export class VolumeDiscountPageModule {}
