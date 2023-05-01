import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PacksizePage } from './packsize.page';

const routes: Routes = [
  {
    path: '',
    component: PacksizePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PacksizePageRoutingModule {}
