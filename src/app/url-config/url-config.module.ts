import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UrlConfigPageRoutingModule } from './url-config-routing.module';

import { UrlConfigPage } from './url-config.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UrlConfigPageRoutingModule
  ],
  declarations: [UrlConfigPage]
})
export class UrlConfigPageModule {}
