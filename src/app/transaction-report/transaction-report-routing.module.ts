import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransactionReportPage } from './transaction-report.page';


const routes: Routes = [
  {
    path: '',
    component: TransactionReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
 
})
export class TransactionReportPageRoutingModule {}
