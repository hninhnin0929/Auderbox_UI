import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DiscountTypePageRoutingModule } from './discount-type-routing.module';

import { DiscountTypePage } from './discount-type.page';

import { MatDatepickerModule, MatNativeDateModule, MatRadioModule, MatExpansionModule, MatAutocompleteModule, MatInputModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DiscountTypePageRoutingModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    NgxPaginationModule,
    MatAutocompleteModule,
    MatInputModule,
    MatExpansionModule
  ],
  declarations: [DiscountTypePage]
})
export class DiscountTypePageModule {}
