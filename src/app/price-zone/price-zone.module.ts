import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PriceZonePageRoutingModule } from './price-zone-routing.module';

import { PriceZonePage } from './price-zone.page';

import { MatDatepickerModule, MatNativeDateModule, MatRadioModule, MatExpansionModule, MatAutocompleteModule, MatInputModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PriceZonePageRoutingModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    NgxPaginationModule,
    MatAutocompleteModule,
    MatInputModule,
    MatExpansionModule
  ],
  declarations: [PriceZonePage]
})
export class PriceZonePageModule {}
