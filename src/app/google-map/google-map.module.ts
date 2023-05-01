import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GoogleMapPageRoutingModule } from './google-map-routing.module';

import { GoogleMapPage } from './google-map.page';
import { MatAutocompleteModule, MatInputModule, MatRadioModule, MatExpansionModule, MatCardModule, MatListModule, MatBadgeModule, MatIconModule, MatDialogModule, MatTabsModule, MatFormFieldModule, MatSelectModule, MatChipsModule, MatCheckboxModule, MatProgressBarModule, MatProgressSpinnerModule, MatButtonModule, MatRipple, MatRippleModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GoogleMapPageRoutingModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatExpansionModule,
    MatListModule,
    MatBadgeModule,
    MatIconModule,
    MatDialogModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatChipsModule,
  MatCheckboxModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatButtonModule, 
  MatRippleModule
  ],
  declarations: [GoogleMapPage]
})
export class GoogleMapPageModule {}
