import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DelieveryOrderPageRoutingModule } from './delievery-order-routing.module';

import { DelieveryOrderPage } from './delievery-order.page';
import { MatDatepickerModule, MatNativeDateModule, matDialogAnimations, MatDialogActions, MatDialogModule, MatProgressBarModule, MatExpansionModule, MatTooltipModule, MatListModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';

import { MatAutocompleteModule, MatInputModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DelieveryOrderPageRoutingModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatTooltipModule,
    MatListModule
  ],
  declarations: [DelieveryOrderPage]
})
export class DelieveryOrderPageModule {}
