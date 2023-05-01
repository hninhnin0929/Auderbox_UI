import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { LoyaltyReportPageRoutingModule } from './loyalty-report-routing.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { LoyaltyReportPage } from './loyalty-report.page';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatAutocompleteModule, MatInputModule } from '@angular/material';
import {  ReactiveFormsModule } from '@angular/forms';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoyaltyReportPageRoutingModule,
    NgxPaginationModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
  ],
  declarations: [LoyaltyReportPage]
})
export class LoyaltyReportPageModule {}
