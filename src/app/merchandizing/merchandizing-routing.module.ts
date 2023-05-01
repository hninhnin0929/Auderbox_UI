import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MerchandizingPage } from './merchandizing.page';

const routes: Routes = [
  {
    path: '',
    component: MerchandizingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MerchandizingPageRoutingModule {}
