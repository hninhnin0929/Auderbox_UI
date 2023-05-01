import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FloverPageRoutingModule } from './flover-routing.module';

import { FloverPage } from './flover.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FloverPageRoutingModule
  ],
  declarations: [FloverPage]
})
export class FloverPageModule {}
