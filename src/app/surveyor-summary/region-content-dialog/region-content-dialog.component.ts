import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ControllerService } from 'src/app/controller.service';

@Component({
  selector: 'app-region-content-dialog',
  templateUrl: './region-content-dialog.component.html',
  styleUrls: ['./region-content-dialog.component.scss'],
})
export class RegionContentDialogComponent implements OnInit {
  config = {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0,
    id: 'region-content-id'
  };
  searchterm: any = "";

  val: any = {};

  constructor(private manager: ControllerService, public dialogRef: MatDialogRef<RegionContentDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, @Inject(MAT_DIALOG_DATA) public storedata: any) { }

  ngOnInit() {
    const val = this.storedata;

    this.val = val;
  }

  close() {
    console.log(this.dialogRef);

    this.dialogRef.close();

  }
  searchRegion() {
    if (this.searchterm != "") {
      //--------- Filter By Shopname -------------
      const data = this.storedata.Shop.AssignShop.filter((val) => {
        return (val.ShopName.toString().toLowerCase().indexOf(this.searchterm.toString().toLowerCase()) > -1);
      })

      this.val.Shop.AssignShop = data;

      console.log(">>>" + JSON.stringify(this.data.Shop.AssignShop.length));
    }
    else {
      this.ngOnInit();
    }
  }
}
