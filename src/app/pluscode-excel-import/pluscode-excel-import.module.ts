import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { MatButtonModule} from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { PluscodeExcelImportPageRoutingModule } from './pluscode-excel-import-routing.module';
import { MatCardModule, } from '@angular/material/card';
import { PluscodeExcelImportPage } from './pluscode-excel-import.page';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {
  MatFormFieldModule,
  MatInputModule,
  MatRippleModule
} from '@angular/material';
@NgModule({
  imports: [
    CommonModule,
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
    IonicModule,
    PluscodeExcelImportPageRoutingModule,FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
 
  ],
  

  declarations: [PluscodeExcelImportPage]
})
export class PluscodeExcelImportPageModule {}
