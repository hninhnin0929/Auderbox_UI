import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreRoutingPageRoutingModule } from './store-routing-routing.module';

import { StoreRoutingPage } from './store-routing.page';
import { MatAutocompleteModule, MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatExpansionModule, MatNativeDateModule, MatProgressBarModule, MatTooltipModule, MatSelectModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StoreRoutingPageRoutingModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    MatChipsModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatSelectModule,
    MatNativeDateModule,
    MatMomentDateModule,
  ],
  declarations: [StoreRoutingPage]
})
export class StoreRoutingPageModule {}
