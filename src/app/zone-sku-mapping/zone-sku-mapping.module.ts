import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ZoneSkuMappingPageRoutingModule } from './zone-sku-mapping-routing.module';

import { ZoneSkuMappingPage } from './zone-sku-mapping.page';
import { MatAutocompleteModule, MatCheckboxModule, MatExpansionModule, MatListModule, MatOptionModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ZoneSkuMappingPageRoutingModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatListModule,
    MatOptionModule,
    NgxPaginationModule,
    ReactiveFormsModule
  ],
  declarations: [ZoneSkuMappingPage]
})
export class ZoneSkuMappingPageModule {}
