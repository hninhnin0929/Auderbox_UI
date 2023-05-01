import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ImageShellComponent } from './image-shell/image-shell.component';
import { RegionContentDialogComponent } from '../surveyor-summary/region-content-dialog/region-content-dialog.component';
import { AssignRegionDialogComponent } from '../surveyor-routing/assign-region-dialog/assign-region-dialog.component';

import { MatDialogModule, MatListModule, MatDatepickerModule, MatCheckboxModule, MatTreeModule, MatIconModule, MatMenuModule, MatCardModule } from '@angular/material';
import { CdkFixedSizeVirtualScroll, ScrollingModule } from '@angular/cdk/scrolling';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MatDialogModule,
        MatListModule,
        ScrollingModule,
        NgxPaginationModule,
        MatDatepickerModule,
        MatCheckboxModule,
        MatTreeModule,
        MatIconModule,
        MatMenuModule,
        MatCardModule,
        ReactiveFormsModule
    ],
    declarations: [ImageShellComponent, RegionContentDialogComponent,AssignRegionDialogComponent ],
    exports: [ImageShellComponent],
    entryComponents: [RegionContentDialogComponent,AssignRegionDialogComponent]
})
export class ComponentModule { }
