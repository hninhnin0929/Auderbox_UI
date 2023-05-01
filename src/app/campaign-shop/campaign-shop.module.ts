import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NgbModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule,MatTooltipModule } from '@angular/material';
import { ImageCropperModule } from 'ngx-image-cropper';
import {MatCheckboxModule} from '@angular/material/checkbox';

import { NgxPaginationModule } from 'ngx-pagination';

import { CampaignShopPageRoutingModule } from './campaign-shop-routing.module';

import { CampaignShopPage } from './campaign-shop.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgbModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ImageCropperModule,
    MatInputModule,
    MatIconModule,
    NgbDatepickerModule,
    MatFormFieldModule,
    CampaignShopPageRoutingModule,
    MatTooltipModule,
    NgxPaginationModule
  ],
  declarations: [CampaignShopPage]
})
export class CampaignShopPageModule {}
