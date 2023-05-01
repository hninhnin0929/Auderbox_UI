import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserListPageRoutingModule } from './user-list-routing.module';

import { UserListPage } from './user-list.page';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatExpansionModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserListPageRoutingModule,
    NgxPaginationModule,
    MatExpansionModule
  ],
  declarations: [UserListPage]
})
export class UserListPageModule {}
