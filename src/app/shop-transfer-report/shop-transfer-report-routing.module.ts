import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShopTransferReportPage } from './shop-transfer-report.page';

const routes: Routes = [
  {
    path: '',
    component: ShopTransferReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShopTransferReportPageRoutingModule {}
