import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AverageOrderAmountPageRoutingModule } from './average-order-amount-routing.module';

import { AverageOrderAmountPage } from './average-order-amount.page';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ImageCropperModule } from 'ngx-image-cropper';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ImageCropperModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    NgxPaginationModule,
    AverageOrderAmountPageRoutingModule
  ],
  declarations: [AverageOrderAmountPage]
})
export class AverageOrderAmountPageModule {}
