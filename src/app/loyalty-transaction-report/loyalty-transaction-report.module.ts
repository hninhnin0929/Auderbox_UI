import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoyaltyTransactionReportPageRoutingModule } from './loyalty-transaction-report-routing.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { LoyaltyTransactionReportPage } from './loyalty-transaction-report.page';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatAutocompleteModule, MatInputModule } from '@angular/material';
import {  ReactiveFormsModule } from '@angular/forms';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoyaltyTransactionReportPageRoutingModule,
    NgxPaginationModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule
  ],
  declarations: [LoyaltyTransactionReportPage]
})
export class LoyaltyTransactionReportPageModule {}
