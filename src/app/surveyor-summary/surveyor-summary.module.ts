import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { NgxPaginationModule } from 'ngx-pagination';

import { SurveyorSummaryPageRoutingModule } from './surveyor-summary-routing.module';

import { SurveyorSummaryPage } from './surveyor-summary.page';
import { MatAutocompleteModule, MatInputModule,MatListModule, MatNativeDateModule, MatCheckboxModule, MatRadioModule, MatExpansionPanel, MatExpansionPanelTitle, MatExpansionPanelHeader, MatExpansionModule, MatTabsModule, MatDatepickerModule, MatIconModule, MatMenuModule, MatButtonModule, MatFormField, MatFormFieldModule, MatSelectModule, MatButtonToggleModule, MatCardModule } from '@angular/material';
import { ComponentModule } from '../components/component.module';

@NgModule({
  imports: [
    CommonModule,
    ComponentModule,
    FormsModule,
    IonicModule,
    SurveyorSummaryPageRoutingModule,
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
    MatCardModule,
    MatNativeDateModule,
    MatListModule
  ],
  declarations: [SurveyorSummaryPage]
})
export class SurveyorSummaryPageModule { }
