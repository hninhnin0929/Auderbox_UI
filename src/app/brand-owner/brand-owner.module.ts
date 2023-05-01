import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BrandOwnerPageRoutingModule } from './brand-owner-routing.module';

import { BrandOwnerPage } from './brand-owner.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BrandOwnerPageRoutingModule
  ],
  declarations: [BrandOwnerPage]
})
export class BrandOwnerPageModule {}
