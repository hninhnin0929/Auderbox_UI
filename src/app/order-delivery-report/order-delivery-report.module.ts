import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { OrderDeliveryReportPageRoutingModule } from './order-delivery-report-routing.module';
import { IonicModule } from '@ionic/angular';
import { OrderDeliveryReportPage } from './order-delivery-report.page';
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
    ReactiveFormsModule,
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
    OrderDeliveryReportPageRoutingModule
  ],
  declarations: [OrderDeliveryReportPage]
})
export class OrderDeliveryReportPageModule {}
