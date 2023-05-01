import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SapSalesOrderPageRoutingModule } from './sap-salesorder-routing.module';

import { SapSalesOrderPage } from './sap-salesorder.page';
import { MatButtonToggleModule, MatDatepickerModule, MatInputModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SapSalesOrderPageRoutingModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ],
})
export class SapSalesOrderPageModule {}
