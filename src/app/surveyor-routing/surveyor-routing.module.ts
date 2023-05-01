import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { ImageCropperModule } from 'ngx-image-cropper';

import { NgxPaginationModule } from 'ngx-pagination';
import { MatAutocompleteModule, MatInputModule, MatCheckboxModule, MatRadioModule, MatExpansionPanel, MatExpansionPanelTitle, MatExpansionPanelHeader, MatExpansionModule, MatTabsModule, MatDatepicker, MatDatepickerModule, MatTreeModule, MatIconModule, MatButtonModule, MatMenuModule, MatCardModule } from '@angular/material';
import { SurveyorRoutingPageRoutingModule } from './surveyor-routing-routing.module';
import { SurveyorRoutingPage } from './surveyor-routing.page';
import { ComponentModule } from '../components/component.module';

@NgModule({
  imports: [
    CommonModule,
    ComponentModule,
    FormsModule,
    IonicModule,
    ImageCropperModule,
    SurveyorRoutingPageRoutingModule,
    NgxPaginationModule,
    MatAutocompleteModule,
    MatInputModule,
    MatRadioModule,
    MatTabsModule,
    MatButtonModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatTreeModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    ReactiveFormsModule
  ],
  declarations: [SurveyorRoutingPage]
})
export class SurveyorRoutingPageModule { }
