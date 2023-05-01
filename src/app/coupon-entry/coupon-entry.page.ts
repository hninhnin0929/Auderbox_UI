import { HttpClient, HttpErrorResponse, HttpHandler, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, Events, LoadingController, ModalController, ToastController } from '@ionic/angular';

import { ControllerService } from '../controller.service';

declare var $: any;

@Component({
  selector: 'app-coupon-entry',
  templateUrl: './coupon-entry.page.html',
  styleUrls: ['./coupon-entry.page.scss'],
})
export class CouponEntryPage implements OnInit {
  _couponList: any = [];
  _couponList1: any = [];
  _obj = this.getObj();
  _obj1=this.getObj1();
  btn: boolean = false;
  spinner: boolean = false;
  searchtab: boolean = false;
  criteria: any = this.getCriteriaData();
  update: boolean = false;

  constructor(private http: HttpClient,
    public alertCtrl: AlertController,
    private ics: ControllerService,
    public activeRoute: ActivatedRoute,
    public loading: LoadingController,
    private tostCtrl: ToastController,
    public tost: ToastController
  ) {
    this.getCouponList();
  }


  ngOnInit() {
  }

  ionViewWillEnter() {
    this.ics.isLoginUser();
    this.getCouponList();
    //this.allList();
    this.btn = false;
    $('#clist-tab').tab('show');
  }
  listTab() {
    this.btn = false;
    this._obj = this.getObj();
    this.getCouponList();
    this.ionViewWillEnter();
    this.criteria = this.getCriteriaData();
    $('#clist-tab').tab('show');
  }
  newTabClick(e) {
    this._obj = this.getObj();
  }
  tab(e) {

  }
  detailTab() {
    this._obj = this.getObj();
    this.getCouponList();
    $('#dnew-tab').tab('show');
  }
  runSpinner(t: boolean) {
    this.spinner = t;
  }

  advanceSearch(option) {
    this.searchtab = option;
    if (!this.searchtab) { this.advanceSearchReset(); }
  }
  getdefaultSearchObject() {
    return { "code": "", "description": "" };
  }


  config = {
    itemsPerPage: this.ics.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  getObj() {
    return {
      syskey: "",
      autokey: 0,
      createddate: "",
      modifieddate: "",
      userid: "",
      username: "",
      RecordStatus: 0,
      SyncStatus: 0,
      SyncBatch: 0,
      t1: "",
      t2: "",
      t3: "",
      n1: 0,
      n2: 0,
      n3: 0,

    };
  }
  getObj1(){
    return{
      syskey:""
    }
  }

  couponStatusChange(detail){
    const param = {
      "n2": detail.n2.toString(),
      "syskey": detail.syskey
    };

    this.couponStatusChangeService(param).then( 
      ()=>{
        this.ics.showToast(this.tost, "Message", "Status changed", 1000);
        if(detail.n2.toString() == "0"){
          detail.n2 = "1";
          detail.switch = 0;
        } else if(detail.n2.toString() == "1"){
          detail.n2 = "0";
          detail.switch = 1;
        }
      }
    ).catch( 
      ()=>{
        detail.n2 = detail.n2 ? false : true;
        this.ics.showToast(this.tost, "Message", "Status didn't change", 1000);
      }
    );
  }

  couponStatusChangeService(p){
    return new Promise<void>( 
      (done,reject)=>{
        const url = this.ics.appConfig.apiurl +'coupon/couponStatusChange';

        this.http.post(url, p, this.ics.getOptions()).subscribe(
          (data:any) =>{
            if(data.message == "SUCCESS"){
              done();
            } else {
              reject();
            }
          },
          error=>{
            reject()
          }
        );
      }
    );
  }

  detail(item) {
    this.btn = true;
    this._obj = item;
    this.getCouponList();
    $('#dnew-tab').tab('show');
    
  }
  getsyskey() {

  }
  getCouponList() {
    let url: string = this.ics.appConfig.apiurl + 'coupon/getcoupon';
    this.http.post(url, this._obj, this.ics.getOptions()).subscribe(
      (data: any) => {


        if (data.CouponList != null && data.CouponList != undefined && data.CouponList.length > 0) {
          this._couponList = data.CouponList;
          this._couponList1 = data.CouponList;
          
          this._couponList.map(cL => {
            if(cL.n2.toString() == "0"){
              cL.switch = 1;
            } else if(cL.n2.toString() == "1"){
              cL.switch = 0;
            }
          });
        } else {
          //this.ics.showToast(this.tostCtrl, "Message", "No User!", 1000)
          this._couponList = [];
        }
      },
      error => {
      }
    );
  }
 
  gotoDelete() {
    this.alertCtrl.create({
      header: 'Confirm delete?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
           
          }
        },
        {
          text: 'Okay',
          handler: () => {
            this.loading.create({
              message: "Processing",
              backdropDismiss: false,
              duration: 5000
            }).then(
              el => {
              el.present();
              const url = this.ics.appConfig.apiurl + 'coupon/delete/' + this._obj.syskey;
              this.http.post(url, this._obj, this.ics.getOptions()).subscribe(
                (data: any) => {
                  el.dismiss();
                  if (data.message == "Success") {
                    this.ics.showToast(this.tostCtrl, "Message", "Deleted Successfully!", 1000).then(
                              e => {
                                this.btn = false;
                                this._obj = this.getObj();
                                this.getCouponList();
                                this.ionViewWillEnter();
                                this.criteria = this.getCriteriaData();
                                $('#clist-tab').tab('show');
                              }
                            );
                          } else {
                            this.ics.showToast(this.tostCtrl, "Message", "Deleting Fail!", 1000);
                          }
                        },
                        (error: any) => {
                          this.ics.showToast(this.tostCtrl, "Message", "Deleting Fail!", 1000);
                        });
              }
              )
          }
        }
      ]
    }).then(el => {
      el.present();
    })
  }
  
  save() {
    if (!this.valide()) {
      this.ics.showToast(this.tostCtrl, "Warnning", "fill all blanks", 1000);
      return;
    }
    let url: string = this.ics.appConfig.apiurl + 'coupon/save';
    this.http.post(url, this._obj, this.ics.getOptions()).subscribe(
      (data: any) => {
        if (data.message == "success") {

          //  this.alert("message","Save Successful");
          this.ics.showToast(this.tostCtrl, "Message", "Success", 1000).then(
            e => {
              this.btn = false;
              this._obj = this.getObj();
             
              this.getCouponList();
              this.ionViewWillEnter();
              this.criteria = this.getCriteriaData();
              $('#clist-tab').tab('show');
            }
          );

        } else if (data.message == "exit") {
          this.ics.showToast(this.tostCtrl, "Message", "Code Already Exists!", 1000);
        } else {
          this.ics.showToast(this.tostCtrl, "Message", "Saving Fail!", 1000);
        }
      },
      (error: any) => {

        this.ics.showToast(this.tostCtrl, "Message", "Fail", 1000);
      });

  }
  valide(): boolean {
    if (this._obj.t1 == "") return false;
    
    if (this._obj.t2 == "") return false;

    return true;
  }


  pageChanged(e) {
    this.config.currentPage = e;


  }
  getCriteriaData() {
    return {
      "Syskey":"",
      "coupon": "",
      "code": "",

    };
  }
  allList() {
    return {
      "Syskey": "",
      "coupon": "",
      "code": "",
    }
  }
  search() {
    this.criteria.maxRow = this.config.itemsPerPage;

    const url = this.ics.appConfig.apiurl + 'coupon/getcoupon';

    this.http.post(url, this.criteria, this.ics.getOptions()).subscribe(
      (data: any) => {

        console.log(data);
        if (data.CouponList != null && data.CouponList != undefined && data.CouponList.length > 0) {
          this._couponList = data.CouponList;
          this._couponList.map(cL => {
            if(cL.n2.toString() == "0"){
              cL.switch = 1;
            } else if(cL.n2.toString() == "1"){
              cL.switch = 0;
            }
          });
        } else {
          this.ics.showToast(this.tostCtrl, "Message", "No Coupon!", 1000)
          this._couponList = [];
        }
      }

    );

  }
  advanceSearchReset() {
    this.criteria = this.getCriteriaData();
    this.getCouponList();
  }

}
