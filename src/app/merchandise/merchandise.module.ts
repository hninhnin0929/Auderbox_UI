import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MerchandisePageRoutingModule } from './merchandise-routing.module';

import { MerchandisePage } from './merchandise.page';
import { MatDatepickerModule, MatNativeDateModule, MatRadioModule, MatButtonToggleModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatAutocompleteModule, MatInputModule,MatSelectModule } from '@angular/material';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MerchandisePageRoutingModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    NgxPaginationModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  declarations: [MerchandisePage]
})
export class MerchandisePageModule {}
