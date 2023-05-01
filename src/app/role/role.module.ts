import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RolePageRoutingModule } from './role-routing.module';

import { RolePage } from './role.page';
import { MatCheckboxModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RolePageRoutingModule,
    MatCheckboxModule
  ],
  declarations: [RolePage]
})
export class RolePageModule {}
