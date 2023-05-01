import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuNewPageRoutingModule } from './menu-new-routing.module';

import { MenuNewPage } from './menu-new.page';
import { MatCheckboxModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuNewPageRoutingModule,
    MatCheckboxModule
  ],
  declarations: [MenuNewPage]
})
export class MenuNewPageModule {}
