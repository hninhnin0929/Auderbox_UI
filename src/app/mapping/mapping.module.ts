import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MappingPageRoutingModule } from './mapping-routing.module';

import { MappingPage } from './mapping.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MappingPageRoutingModule
  ],
  declarations: [MappingPage]
})
export class MappingPageModule {}
