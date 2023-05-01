import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FloverPage } from './flover.page';

const routes: Routes = [
  {
    path: '',
    component: FloverPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FloverPageRoutingModule {}
