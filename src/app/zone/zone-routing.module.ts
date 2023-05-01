import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ZonePage } from './zone.page';

const routes: Routes = [
  {
    path: '',
    component: ZonePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ZonePageRoutingModule {}
