import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ZoneSkuMappingPage } from './zone-sku-mapping.page';

const routes: Routes = [
  {
    path: '',
    component: ZoneSkuMappingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ZoneSkuMappingPageRoutingModule {}
