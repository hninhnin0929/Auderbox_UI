import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ControllerService } from 'src/app/controller.service';

@Component({
  selector: 'app-assign-region-dialog',
  templateUrl: './assign-region-dialog.component.html',
  styleUrls: ['./assign-region-dialog.component.scss'],
})
export class AssignRegionDialogComponent implements OnInit {

  constructor(public manager: ControllerService, public dialogRef: MatDialogRef<AssignRegionDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }


  ngOnInit() { }

}
