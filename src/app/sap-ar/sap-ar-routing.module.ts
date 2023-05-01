import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SapArPage } from './sap-ar.page';

const routes: Routes = [
  {
    path: '',
    component: SapArPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SapArPageRoutingModule {}
