import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ZonePageRoutingModule } from './zone-routing.module';

import { ZonePage } from './zone.page';
import { MatAutocompleteModule, MatCheckboxModule, MatExpansionModule, MatListModule, MatOptionModule,MatProgressBarModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ZonePageRoutingModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatCheckboxModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatProgressBarModule
  ],
  declarations: [ZonePage]
})
export class ZonePageModule {}
