import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssignUserStorePageRoutingModule } from './assign-user-store-routing.module';

import { AssignUserStorePage } from './assign-user-store.page';
import { MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatExpansionModule, MatProgressBarModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssignUserStorePageRoutingModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    MatChipsModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatExpansionModule,
  ],
  declarations: [AssignUserStorePage]
})
export class AssignUserStorePageModule {}
