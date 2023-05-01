import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UrlPageRoutingModule } from './url-routing.module';

import { UrlPage } from './url.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UrlPageRoutingModule
  ],
  declarations: [UrlPage]
})
export class UrlPageModule {}
