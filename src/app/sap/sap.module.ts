import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SapPageRoutingModule } from './sap-routing.module';

import { SapPage } from './sap.page';
import { SapCustomerPage } from '../sap-customer/sap-customer.page';
import { MatButtonToggleModule, MatDatepickerModule, MatInputModule, MatAutocompleteModule ,MatSelectModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';
import { SapMaterialPage } from '../sap-material/sap-material.page';
import { SapArPage } from '../sap-ar/sap-ar.page';
import { SapSalesOrderPage } from '../sap-salesorder/sap-salesorder.page';
import { SapDeliveryPage } from '../sap-delivery/sap-delivery.page';
import { SapBillingPage } from '../sap-billing/sap-billing.page';
import { SapPaymentPage } from '../sap-payment/sap-payment.page';
import { SapCreditBalancePage } from '../sap-credit-balance/sap-credit-balance.page';
import { SapReturnSkuPage } from '../sap-return-sku/sap-return-sku.page';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SapPageRoutingModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    MatAutocompleteModule,
    MatSelectModule
  ],
  declarations: [SapPage,SapCustomerPage,SapMaterialPage,SapArPage,SapSalesOrderPage,SapDeliveryPage,SapBillingPage,SapPaymentPage,SapCreditBalancePage,SapReturnSkuPage]
})
export class SapPageModule {}
