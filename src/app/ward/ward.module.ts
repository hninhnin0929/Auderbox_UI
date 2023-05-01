import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { WardPageRoutingModule } from './ward-routing.module';
import { WardPage } from './ward.page';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule, MatInputModule, MatRadioModule } from '@angular/material';
import { MatNativeDateModule } from '@angular/material/core';
//import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    WardPageRoutingModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatNativeDateModule,
MatRadioModule

 
  ],
  declarations: [WardPage]
})
export class WardPageModule {}
