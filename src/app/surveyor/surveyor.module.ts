import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SurveyorPageRoutingModule } from './surveyor-routing.module';

import { SurveyorPage } from './surveyor.page';

import { MatDatepickerModule, MatNativeDateModule, MatTooltipModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatAutocompleteModule, MatInputModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SurveyorPageRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    MatAutocompleteModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule
  ],
  declarations: [SurveyorPage]
})
export class SurveyorPageModule {}
