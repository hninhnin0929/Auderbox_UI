import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TransactionDetailReportPageRoutingModule } from './transaction-detail-report-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransactionDetailReportPage } from './transaction-detail-report.page';
import { NgbModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ImageCropperModule } from 'ngx-image-cropper';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatAutocompleteModule, MatInputModule, MatSelectModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransactionDetailReportPageRoutingModule,
    NgbModule,
    NgbDatepickerModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatIconModule,
    ImageCropperModule,
    MatCheckboxModule,
    NgxPaginationModule,
    MatAutocompleteModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  declarations: [TransactionDetailReportPage]
})
export class TransactionDetailReportPageModule {}
