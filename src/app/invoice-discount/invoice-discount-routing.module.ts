import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InvoiceDiscountPage } from './invoice-discount.page';

const routes: Routes = [
  {
    path: '',
    component: InvoiceDiscountPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceDiscountPageRoutingModule {}
