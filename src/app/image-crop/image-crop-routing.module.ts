import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImageCropPage } from './image-crop.page';

const routes: Routes = [
  {
    path: '',
    component: ImageCropPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImageCropPageRoutingModule {}
