import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MerchandizingPageRoutingModule } from './merchandizing-routing.module';

import { MerchandizingPage } from './merchandizing.page';
import {MatStepperModule} from '@angular/material/stepper';
import { MatOptionModule } from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MerchandizingPageRoutingModule,
    MatStepperModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule
    ,MatOptionModule,
    MatSelectModule,
    MatProgressBarModule
  ],
  declarations: [MerchandizingPage]
})
export class MerchandizingPageModule {}
