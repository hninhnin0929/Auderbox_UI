import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TspPage } from './tsp.page';

const routes: Routes = [
  {
    path: '',
    component: TspPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TspPageRoutingModule {}
