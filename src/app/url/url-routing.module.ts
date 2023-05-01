import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UrlPage } from './url.page';

const routes: Routes = [
  {
    path: '',
    component: UrlPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UrlPageRoutingModule {}
