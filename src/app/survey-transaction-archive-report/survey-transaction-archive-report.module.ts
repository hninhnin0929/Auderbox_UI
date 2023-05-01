import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SurveyTransactionArchiveReportPageRoutingModule } from './survey-transaction-archive-report-routing.module';

import { SurveyTransactionArchiveReportPage } from './survey-transaction-archive-report.page';
import { NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatAutocompleteModule, MatCheckboxModule, MatDatepickerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatNativeDateModule } from '@angular/material';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxPaginationModule } from 'ngx-pagination';

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
  
    MatIconModule,
    NgbDatepickerModule,
    MatFormFieldModule,
    NgxPaginationModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    SurveyTransactionArchiveReportPageRoutingModule
  ],
  declarations: [SurveyTransactionArchiveReportPage]
})
export class SurveyTransactionArchiveReportPageModule {}
