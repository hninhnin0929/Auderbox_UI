import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SurveyorHeaderPageRoutingModule } from './surveyor-header-routing.module';

import { SurveyorHeaderPage } from './surveyor-header.page';

import { MatDatepickerModule, MatNativeDateModule, MatRadioModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatAutocompleteModule, MatInputModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SurveyorHeaderPageRoutingModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxPaginationModule,
    MatAutocompleteModule,
    MatInputModule,
    MatRadioModule
  ],
  declarations: [SurveyorHeaderPage]
})
export class SurveyorHeaderPageModule {}
