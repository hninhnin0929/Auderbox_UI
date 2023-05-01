import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExportRecomendedSKUPage } from './export-recomended-sku.page';

const routes: Routes = [
  {
    path: '',
    component: ExportRecomendedSKUPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExportRecomendedSKUPageRoutingModule {}
