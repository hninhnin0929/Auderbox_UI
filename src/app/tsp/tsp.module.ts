import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TspPageRoutingModule } from './tsp-routing.module';

import { TspPage } from './tsp.page';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule, MatInputModule } from '@angular/material';
import { MatNativeDateModule } from '@angular/material/core';
//import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TspPageRoutingModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatNativeDateModule,
    MatIconModule
  ],
  declarations: [TspPage]
})
export class TspPageModule {}
