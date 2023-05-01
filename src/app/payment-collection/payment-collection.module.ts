import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaymentCollectionPageRoutingModule } from './payment-collection-routing.module';

import { PaymentCollectionPage } from './payment-collection.page';

import { NgxPaginationModule } from 'ngx-pagination';
import { MatDatepickerModule, MatNativeDateModule, MatRadioModule, MatExpansionModule, MatAutocompleteModule, MatInputModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PaymentCollectionPageRoutingModule,
    NgxPaginationModule,
    MatDatepickerModule, 
    MatNativeDateModule, 
    MatRadioModule, 
    MatExpansionModule, 
    MatAutocompleteModule, 
    MatInputModule,
    ReactiveFormsModule
  ],
  declarations: [PaymentCollectionPage]
})
export class PaymentCollectionPageModule {}
