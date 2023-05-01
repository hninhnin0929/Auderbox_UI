import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PacktypePageRoutingModule } from './packtype-routing.module';

import { PacktypePage } from './packtype.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PacktypePageRoutingModule
  ],
  declarations: [PacktypePage]
})
export class PacktypePageModule {}
