import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PluscodeExcelImportPage } from './pluscode-excel-import.page';

const routes: Routes = [
  {
    path: '',
    component: PluscodeExcelImportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PluscodeExcelImportPageRoutingModule {}
