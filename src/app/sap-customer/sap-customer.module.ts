import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SapCustomerPageRoutingModule } from './sap-customer-routing.module';

import { SapCustomerPage } from './sap-customer.page';
import { MatButtonToggleModule, MatDatepickerModule, MatInputModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SapCustomerPageRoutingModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ],
})
export class SapCustomerPageModule {}
