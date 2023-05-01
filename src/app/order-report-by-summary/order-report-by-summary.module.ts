import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderReportBySummaryPageRoutingModule } from './order-report-by-summary-routing.module';

import { OrderReportBySummaryPage } from './order-report-by-summary.page';
import { NgbModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ImageCropperModule } from 'ngx-image-cropper';
import {MatCheckboxModule} from '@angular/material/checkbox';

import { NgxPaginationModule } from 'ngx-pagination';
import { MatAutocompleteModule ,MatSelectModule} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgbModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ImageCropperModule,
    MatInputModule,
    MatIconModule,
    NgbDatepickerModule,
    MatFormFieldModule,
    OrderReportBySummaryPageRoutingModule,
    NgxPaginationModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatSelectModule
  ],
  declarations: [OrderReportBySummaryPage]
})
export class OrderReportBySummaryPageModule {}
