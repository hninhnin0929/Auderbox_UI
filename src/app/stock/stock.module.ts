import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';
import { StockPageRoutingModule } from './stock-routing.module';
import { StockPage } from './stock.page';
import { ImageCropperModule, ImageCropperComponent } from 'ngx-image-cropper';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule, MatExpansionModule, MatNativeDateModule, MatRadioModule, MatSelectModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatAutocompleteModule, MatInputModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockPageRoutingModule,
    ImageCropperModule,
    MatSortModule,
    MatTableModule,
    InfiniteScrollModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxPaginationModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatRadioModule,
    MatSelectModule
  ],
  declarations: [StockPage]
})
export class StockPageModule {}
