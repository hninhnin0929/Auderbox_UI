import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { FormsModule } from '@angular/forms';
import {MatToolbarModule,MatCardModule,MatCheckboxModule,MatListModule, MatRadioModule} from '@angular/material';
import { IonicModule } from '@ionic/angular';
import { TownPageRoutingModule } from './town-routing.module';
import { TownPage } from './town.page';
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
    TownPageRoutingModule,
    MatCheckboxModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatNativeDateModule,
    MatIconModule,
    MatRadioModule
  ],
  declarations: [TownPage]
})
export class TownPageModule {}
