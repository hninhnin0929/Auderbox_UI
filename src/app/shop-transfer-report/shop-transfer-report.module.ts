import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShopTransferReportPageRoutingModule } from './shop-transfer-report-routing.module';

import { ShopTransferReportPage } from './shop-transfer-report.page';

import { MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatAutocompleteModule, MatInputModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShopTransferReportPageRoutingModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxPaginationModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  declarations: [ShopTransferReportPage]
})
export class ShopTransferReportPageModule {}
