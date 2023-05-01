import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CampaigntaskPage } from './campaigntask.page';

const routes: Routes = [
  {
    path: '',
    component: CampaigntaskPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaigntaskPageRoutingModule {}
