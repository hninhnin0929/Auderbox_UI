import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserPageRoutingModule } from './user-routing.module';

import { UserPage } from './user.page';
import { NgbModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ImageCropperModule } from 'ngx-image-cropper';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { NgxPaginationModule } from 'ngx-pagination';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgbModule,
    UserPageRoutingModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
   
    MatInputModule,
    MatIconModule,
    NgbDatepickerModule,
    MatFormFieldModule,
     ImageCropperModule,
     NgxPaginationModule
  ],
  declarations: [UserPage],
  providers: [ { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }]
 
})
export class UserPageModule {}
