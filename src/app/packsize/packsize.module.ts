import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PacksizePageRoutingModule } from './packsize-routing.module';

import { PacksizePage } from './packsize.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PacksizePageRoutingModule
  ],
  declarations: [PacksizePage]
})
export class PacksizePageModule {}
