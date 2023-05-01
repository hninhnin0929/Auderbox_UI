import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SapArPage } from '../sap-ar/sap-ar.page';
import { SapCreditBalancePage } from '../sap-credit-balance/sap-credit-balance.page';
import { SapCustomerPage } from '../sap-customer/sap-customer.page';
import { SapMaterialPage } from '../sap-material/sap-material.page';

import { SapPage } from './sap.page';

const routes: Routes = [
  {
    path: '',
    component: SapPage,
    children:[
      {
        path:'customer',component:SapCustomerPage
      },
      {
        path:'material',component:SapMaterialPage
      },
      {
        path:'ar',component:SapArPage
      },
      {
        path:'credit-balance',component:SapCreditBalancePage
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SapPageRoutingModule {}
