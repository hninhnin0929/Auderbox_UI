import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapPageRoutingModule } from './map-routing.module';

import { MapPage } from './map.page';
import { MatAutocompleteModule, MatInputModule, MatRadioModule, MatExpansionModule, MatCardModule, MatListModule, MatBadgeModule, MatIconModule, MatDialogModule, MatTabsModule, MatCard, MatFormFieldModule, MatSelectModule, MatChipsModule, MatCheckboxModule, MatProgressBarModule, MatProgressSpinnerModule, MatButtonModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapPageRoutingModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatExpansionModule,
    MatCardModule,
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
  
  ],
  declarations: [MapPage]
})
export class MapPageModule {}
