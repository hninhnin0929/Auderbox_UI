import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MerchandizePageRoutingModule } from './merchandize-routing.module';

import { MerchandizePage } from './merchandize.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MerchandizePageRoutingModule
  ],
  declarations: [MerchandizePage]
})
export class MerchandizePageModule {}
