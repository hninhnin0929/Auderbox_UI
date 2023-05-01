import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CreditRequestFormPageRoutingModule } from './credit-request-form-routing.module';
import { CreditRequestFormPage } from './credit-request-form.page';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule, MatInputModule, MatRadioModule } from '@angular/material';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule, MatExpansionModule } from '@angular/material';;
@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    CreditRequestFormPageRoutingModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatNativeDateModule,
    MatRadioModule,
    MatDatepickerModule,
    MatExpansionModule
  ],
  declarations: [CreditRequestFormPage]
})
export class CreditRequestFormPageModule {}
