import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CampaignbrandPage } from './campaignbrand.page';

const routes: Routes = [
  {
    path: '',
    component: CampaignbrandPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignbrandPageRoutingModule {}
