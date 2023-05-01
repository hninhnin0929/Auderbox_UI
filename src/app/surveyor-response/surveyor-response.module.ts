import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { ImageCropperModule } from 'ngx-image-cropper';

import { NgxPaginationModule } from 'ngx-pagination';
import { MatAutocompleteModule, MatInputModule, MatNativeDateModule, MatCheckboxModule, MatRadioModule, MatExpansionPanel, MatExpansionPanelTitle, MatExpansionPanelHeader, MatExpansionModule, MatTabsModule, MatDatepickerModule, MatIconModule, MatMenuModule, MatButtonModule, MatFormField, MatFormFieldModule, MatSelectModule, MatButtonToggleModule, MatTooltipModule } from '@angular/material';
import { SurveyorPage } from '../surveyor/surveyor.page';
import { SurveyorResponsePage } from './surveyor-response.page';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { SurveyorResponsePageRoutingModule } from './surveyor-response-routing.module';
import { ComponentModule } from '../components/component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentModule,
    ImageCropperModule,
    SurveyorResponsePageRoutingModule,
    NgxPaginationModule,
    MatAutocompleteModule,
    MatInputModule,
    MatRadioModule,
    MatTabsModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    NgxMaterialTimepickerModule,
    MatNativeDateModule,
    MatTooltipModule
  ],
  declarations: [SurveyorResponsePage]
})
export class SurveyorResponsePageModule { }
