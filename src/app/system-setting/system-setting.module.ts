import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SystemSettingPageRoutingModule } from './system-setting-routing.module';
import { SystemSettingPage } from './system-setting.page';
import { MatDatepickerModule, MatNativeDateModule, MatTabsModule} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SystemSettingPageRoutingModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule
  ],
  declarations: [SystemSettingPage]
})
export class SystemSettingPageModule {

  
}
