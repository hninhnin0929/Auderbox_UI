import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CampaignShopPage } from './campaign-shop.page';

const routes: Routes = [
  {
    path: '',
    component: CampaignShopPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignShopPageRoutingModule {}
