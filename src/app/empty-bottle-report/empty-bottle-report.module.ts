import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EmptyBottleReportPageRoutingModule } from './empty-bottle-report-routing.module';
import { EmptyBottleReportPage } from './empty-bottle-report.page';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule ,MatSelectModule,MatInputModule} from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxPaginationModule } from 'ngx-pagination';
import {MatCheckboxModule} from '@angular/material/checkbox';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmptyBottleReportPageRoutingModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    NgxPaginationModule,
    MatCheckboxModule
  ],
  declarations: [EmptyBottleReportPage]
})
export class EmptyBottleReportPageModule {}
