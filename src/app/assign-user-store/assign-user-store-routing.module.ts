import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssignUserStorePage } from './assign-user-store.page';

const routes: Routes = [
  {
    path: '',
    component: AssignUserStorePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssignUserStorePageRoutingModule {}
