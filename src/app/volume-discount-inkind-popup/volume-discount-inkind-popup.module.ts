import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VolumeDiscountInkindPopupPageRoutingModule } from './volume-discount-inkind-popup-routing.module';

import { VolumeDiscountInkindPopupPage } from './volume-discount-inkind-popup.page';

import { MatAutocompleteModule, MatInputModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VolumeDiscountInkindPopupPageRoutingModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule
  ],
})
export class VolumeDiscountInkindPopupPageModule {}
