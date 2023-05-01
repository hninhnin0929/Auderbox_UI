import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BrandOwnerPage } from './brand-owner.page';

const routes: Routes = [
  {
    path: '',
    component: BrandOwnerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BrandOwnerPageRoutingModule {}
