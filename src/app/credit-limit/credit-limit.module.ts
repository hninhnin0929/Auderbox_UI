import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreditLimitPageRoutingModule } from './credit-limit-routing.module';

import { CreditLimitPage } from './credit-limit.page';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule, MatInputModule, MatCheckboxModule, MatRadioModule, MatExpansionPanel, MatExpansionPanelTitle, MatExpansionPanelHeader, MatExpansionModule, MatTabsModule, MatTooltipModule, MatSelectModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreditLimitPageRoutingModule,
    NgxPaginationModule,
    MatDatepickerModule,
    MatInputModule,
    MatRadioModule,
    MatTabsModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatSelectModule
  ],
  declarations: [CreditLimitPage]
})
export class CreditLimitPageModule {}
