import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaymentCollectionPage } from './payment-collection.page';

const routes: Routes = [
  {
    path: '',
    component: PaymentCollectionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentCollectionPageRoutingModule {}
