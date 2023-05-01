import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WardPage } from './ward.page';

const routes: Routes = [
  {
    path: '',
    component: WardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WardPageRoutingModule {}
