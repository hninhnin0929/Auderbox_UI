import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuParentPageRoutingModule } from './menu-parent-routing.module';

import { MenuParentPage } from './menu-parent.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuParentPageRoutingModule
  ],
  declarations: [MenuParentPage]
})
export class MenuParentPageModule {}
