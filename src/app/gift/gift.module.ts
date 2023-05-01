import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GiftPageRoutingModule } from './gift-routing.module';
import { GiftPage } from './gift.page';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule, MatInputModule } from '@angular/material';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GiftPageRoutingModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatInputModule
    


  ],
  declarations: [GiftPage]
})
export class GiftPageModule {}
