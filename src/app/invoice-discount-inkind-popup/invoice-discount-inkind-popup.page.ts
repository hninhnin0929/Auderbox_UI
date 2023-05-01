import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { NavigationExtras, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

declare var $: any;

@Component({
  selector: 'app-invoice-discount-inkind-popup',
  templateUrl: './invoice-discount-inkind-popup.page.html',
  styleUrls: ['./invoice-discount-inkind-popup.page.scss'],
})
export class InvoiceDiscountInkindPopupPage implements OnInit {

  giftList: any = [];
  couponList: any = [];

  getGiftData: any = this.getGetGiftData();
  getGiftDataList: any = [];
  tempGetGiftDataList: any = [];
  giftSerialNo = 1;

  updateIndex = -1;

  @Output() outputInkindList: any = new EventEmitter();
  @Input() inputInkindList : any = [];
  @Input() isInkindEdit = true;

  constructor(
    private _router: Router,
    private http: HttpClient,
    public tostCtrl: ToastController,
    private manager: ControllerService
  ) {
    this.ionViewWillEnter();
  }

  ngOnInit() {
  }

  ngOnChanges(){
    this.clearGetGiftList();

    if(this.inputInkindList.length > 0){
      this.addDetailDataList();
    }
  }

  ionViewWillEnter() {
    this.allList();
  }

  addDetailDataList(){
    var i = 0;

    for(i = 0; i < this.inputInkindList.length; i++){

      this.getGiftDataList.push(this.commonDataExchange(this.inputInkindList[i]));
      this.tempGetGiftDataList.push(this.commonDataExchange(this.inputInkindList[i]));
    }

    this.giftSerialNo = i + 1;
  }

  disItemTypeChange(){
    this.getGiftData.t1 = "";
  }

  discountItemChange(event, itemType){
    let check = false;
    let itemList = [];

    if(itemType == "gift"){
      itemList = this.giftList;
    } else if(itemType == "coupon"){
      itemList = this.couponList;
    }

    if(this.getGiftData.n3 != ""){
      for(let i = 0; i < itemList.length; i++){
        if(itemList[i].syskey == this.getGiftData.n3
            && itemList[i].syskey != ""){

          this.getGiftData.n3 = itemList[i].syskey;

          if(itemType == "gift"){
            this.getGiftData.t1 = itemList[i].t2;
          } else if(itemType == "coupon"){
            this.getGiftData.t1 = itemList[i].t1;
          }
          
          check = true;

          break;
        }
        
      }
    
      if(check == false){
        this.getGiftData.n3 = "";
      }
    } else {
      this.getGiftData.n3 = "";
    }
  }

  validationBeforeAdd(){
    if(this.getGiftData.n2 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Discount Item Type", 2000);
      return false;
    }

    if(this.getGiftData.n3 == "" || this.getGiftData.t1 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Discount Item", 2000);
      return false;
    }

    if(this.getGiftData.n4 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Discount Item Qty", 2000);
      return false;
    }

    if(this.getGiftData.n6 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Inkind End Type", 2000);
      return false;
    }

    if(this.getGiftData.n7 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Inkind Rule Type", 2000);
      return false;
    }

    return true;
  }

  addGetGift(){
    if(this.validationBeforeAdd()){
      if(this.updateIndex < 0){
        let getGifttemp = this.getGetGiftData();
  
        getGifttemp.syskey = "";
        getGifttemp.recordStatus = "1";
        getGifttemp.n1 = "";
        getGifttemp.n2 = this.getGiftData.n2.toString();
        getGifttemp.n3 = this.getGiftData.n3.toString();
        getGifttemp.n4 = this.getGiftData.n4.toString();
        getGifttemp.n5 = this.giftSerialNo.toString();
        getGifttemp.n6 = this.getGiftData.n6.toString();
        getGifttemp.n7 = this.getGiftData.n7.toString();
        getGifttemp.t1 = this.getGiftData.t1.toString();
    
        this.tempGetGiftDataList.push(getGifttemp);
        this.giftSerialNo++;
      } else {
        this.tempGetGiftDataList[this.updateIndex] = this.commonDataExchange(this.getGiftData);
      }

      this.clearGetGiftData();
    }
  }

  updateGetGiftData(index){
    this.updateIndex = index;
    this.getGiftData = this.commonDataExchange(this.tempGetGiftDataList[index]);
  }

  removeGiftData(dtlIndex){
    if(this.tempGetGiftDataList[dtlIndex].syskey != ""){
      if(this.tempGetGiftDataList[dtlIndex].recordStatus == "1"){
        this.tempGetGiftDataList[dtlIndex].recordStatus = "4";
      } else if(this.tempGetGiftDataList[dtlIndex].recordStatus == "4"){
        this.tempGetGiftDataList[dtlIndex].recordStatus = "1";
      }
    } else {
      this.tempGetGiftDataList.splice(dtlIndex, 1);
    }

    let tempI = 0;
    for(var i = 0; i < this.tempGetGiftDataList.length; i++){
      if(this.tempGetGiftDataList[i].recordStatus == "4"){
        this.tempGetGiftDataList[i].n5 = "0";
      } else {
        tempI++;
        this.tempGetGiftDataList[i].n5 = "" + tempI;
      }
    }
    this.giftSerialNo = tempI + 1;
  }

  closePopup(str){
    let navigationExtras : NavigationExtras;
    navigationExtras = {
      queryParams: {
      "syskey" : ""
      }
    };

    if(str == "save"){
      this.getGiftDataList = [];

      for(var i = 0; i < this.tempGetGiftDataList.length; i++){
        this.getGiftDataList.push(this.commonDataExchange(this.tempGetGiftDataList[i]));
      }
    }

    this.outputInkindList.emit(this.getGiftDataList);
    this._router.navigate(['/invoice-discount'], navigationExtras);
  }

  commonDataExchange(data){
    let returnData = this.getGetGiftData();

    returnData.syskey = data.syskey;
    returnData.recordStatus = data.recordStatus;
    returnData.rsTemp = (data.rsTemp == undefined) ? data.recordStatus : data.rsTemp;
    returnData.n1 = data.n1.toString();
    returnData.n2 = data.n2.toString();
    returnData.n3 = data.n3.toString();
    returnData.n4 = data.n4.toString();
    returnData.n5 = data.n5.toString();
    returnData.n6 = data.n6.toString();
    returnData.n7 = data.n7.toString();
    returnData.t1 = data.t1.toString();

    return returnData;
  }

  clearGetGiftData(){
    $('#invDiscountItem0').show();
    $('#invDiscountItem1').hide();
    $('#invDiscountItem2').hide();

    this.updateIndex = -1;
    this.getGiftData = this.getGetGiftData();
  }

  clearGetGiftList(){
    this.clearGetGiftData();
    this.getGiftDataList = [];
    this.tempGetGiftDataList = [];
    this.giftSerialNo = 1;
  }

  // clearProperties(){
  //   this.clearGetGiftList();
  // }

  allList(){
    /*
    this.giftSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          let vdDesc_term = {
            "t2": term
          };

          this.manager.disItemGiftSearchAutoFill(vdDesc_term).subscribe(
            data => {
              this.giftList = data as any[];
            }
          );
        }
      }
    );

    this.couponSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          let vdDesc_term = {
            "t1": term
          };

          this.manager.disItemCouponSearchAutoFill(vdDesc_term).subscribe(
            data => {
              this.couponList = data as any[];
            }
          );
        }
      }
    );
    */

    let url = "";
    let param = {};

    url = this.manager.appConfig.apiurl + 'Gift/getGift';
    param = {
      "t2": ""
    };
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.giftList = data.giftdata;
          this.giftList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
        }
      }
    );

    url = this.manager.appConfig.apiurl + 'coupon/getcoupon';
    param = {
      "t1": ""
    };
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any) =>{
        this.couponList = data.CouponList;
        this.couponList.sort((a, b) => (a.t1 > b.t1) ? 1 : -1);
      }
    );
  }

  getGetGiftData(){
    return {
      "syskey": "",
      "recordStatus": "",
      "rsTemp": "",
      "n1": "",
      "n2": "",
      "n3": "",
      "n4": "",
      "n5": "",
      "n6": "0",
      "n7": "0",
      "t1": "",
    };
  }
}