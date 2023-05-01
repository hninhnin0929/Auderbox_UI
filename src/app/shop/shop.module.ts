import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ShopPageRoutingModule } from './shop-routing.module';

import { ShopPage } from './shop.page';
import { ImageCropperModule } from 'ngx-image-cropper';

import { NgxPaginationModule } from 'ngx-pagination';
import { MatAutocompleteModule, MatInputModule, MatCheckboxModule, MatRadioModule, MatExpansionPanel, MatExpansionPanelTitle, MatExpansionPanelHeader, MatExpansionModule, MatTabsModule, MatTooltipModule, MatSelectModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImageCropperModule,
    ShopPageRoutingModule,
    NgxPaginationModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatInputModule,
    MatRadioModule,
    MatTabsModule,
    MatExpansionModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatSelectModule
  ],
  declarations: [ShopPage]
})
export class ShopPageModule { }
