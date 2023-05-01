import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UrlConfigPage } from './url-config.page';

const routes: Routes = [
  {
    path: '',
    component: UrlConfigPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UrlConfigPageRoutingModule {}
