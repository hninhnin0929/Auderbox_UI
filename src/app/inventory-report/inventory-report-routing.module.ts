import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InventoryReportPage } from './inventory-report.page';

const routes: Routes = [
  {
    path: '',
    component: InventoryReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryReportPageRoutingModule {}
