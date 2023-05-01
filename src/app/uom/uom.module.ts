import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UOMPageRoutingModule } from './uom-routing.module';

import { UOMPage } from './uom.page';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UOMPageRoutingModule,
    NgxPaginationModule
  ],
  declarations: [UOMPage]
})
export class UOMPageModule {}
