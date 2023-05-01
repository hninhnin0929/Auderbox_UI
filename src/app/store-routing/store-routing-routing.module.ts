import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreRoutingPage } from './store-routing.page';

const routes: Routes = [
  {
    path: '',
    component: StoreRoutingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreRoutingPageRoutingModule {}
