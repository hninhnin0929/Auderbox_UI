import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SapArPageRoutingModule } from './sap-ar-routing.module';

import { SapArPage } from './sap-ar.page';
import { MatButtonToggleModule, MatDatepickerModule, MatInputModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SapArPageRoutingModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ],
})
export class SapArPageModule {}
