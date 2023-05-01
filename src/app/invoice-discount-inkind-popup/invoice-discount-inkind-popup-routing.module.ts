import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InvoiceDiscountInkindPopupPage } from './invoice-discount-inkind-popup.page';

const routes: Routes = [
  {
    path: '',
    component: InvoiceDiscountInkindPopupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceDiscountInkindPopupPageRoutingModule {}
