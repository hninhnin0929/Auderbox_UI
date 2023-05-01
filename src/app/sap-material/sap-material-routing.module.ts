import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SapMaterialPage } from './sap-material.page';

const routes: Routes = [
  {
    path: '',
    component: SapMaterialPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SapMaterialPageRoutingModule {}
