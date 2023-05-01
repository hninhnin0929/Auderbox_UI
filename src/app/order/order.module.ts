import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderPageRoutingModule } from './order-routing.module';

import { OrderPage } from './order.page';
import { MatBadgeModule, MatDatepickerModule, MatExpansionModule, MatListModule, MatNativeDateModule, MatProgressBarModule, MatProgressSpinnerModule, MatRadioButton, MatRadioGroup, MatRadioModule, MatSelectModule } from '@angular/material';

import { NgxPaginationModule } from 'ngx-pagination';
import { MatAutocompleteModule, MatInputModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderPageRoutingModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    MatAutocompleteModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatListModule,
    MatRadioModule,
    MatBadgeModule
  ],
  declarations: [OrderPage]
})
export class OrderPageModule {}
