import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SapReturnSkuPageRoutingModule } from './sap-return-sku-routing.module';
import { MatButtonToggleModule, MatDatepickerModule, MatInputModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SapReturnSkuPageRoutingModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ]
})
export class SapReturnSkuPageModule {}
