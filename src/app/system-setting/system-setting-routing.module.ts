import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SystemSettingPage } from './system-setting.page';

const routes: Routes = [
  {
    path: '',
    component: SystemSettingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SystemSettingPageRoutingModule {}
