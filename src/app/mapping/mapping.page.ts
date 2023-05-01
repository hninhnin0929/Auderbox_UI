import { Component, OnInit, ViewChild } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, HttpHandler } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, Events, AlertController, LoadingController, ToastController } from '@ionic/angular';
declare var $: any;
@Component({
  selector: 'app-mapping',
  templateUrl: './mapping.page.html',
  styleUrls: ['./mapping.page.scss'],
})
export class MappingPage implements OnInit {

  _warehouseList: any;
   btn:boolean = false;
  _vendorList: any;
  _objvendor: any = this.getVendorObj();
  _objwarehouse: any = this.getWareHouseObj();
  searchtab :boolean = false;
  spinner: boolean = false;
  search_param = this.getDefaultSearchObject();
  delete_param = this.getDefaultDeleteObject();
  constructor(
    private http: HttpClient,
    public alertCtrl: AlertController,
    private ics: ControllerService,
    public activeRoute: ActivatedRoute,
    public loading: LoadingController,
    private tostCtrl: ToastController
  ) {
    this.getWareHouseList();
  }

  ngOnInit() {   
  }

  ionViewWillEnter() {
    this.ics.isLoginUser();
    this.getWareHouseList();
    this.getVendorList();
    this.btn = false;
    $('#camtasklist-tab').tab('show');
  }
  listTab() {
    this.search_param = this.getDefaultSearchObject();
    this.search_param.vendorSyskey = "0";
    this.getWareHouseList();
    $('#camtasklist-tab').tab('show');
  }
  newTabClick(e){
    this.searchtab =  false;
    this._objwarehouse = this.getWareHouseObj();
    this.getVendorList();
  }
  tab(e){

  }
  detail(item) {
    this.getVendorList();
    this._objwarehouse = item;
    console.log("Detail Warehouse = " + JSON.stringify(this._objwarehouse))
    $('#camtasknew-tab').tab('show');
  }
  getVendorList() {
    let url: string = this.ics.appConfig.apiurl + 'vendor/getlist';
    this.http.post(url, this._objvendor, this.ics.getOptions()).subscribe(
      (data: any) => {
        console.log("Vender List= ", JSON.stringify(data));
        if (data.vendorList != null && data.vendorList != undefined && data.vendorList.length > 0) {
          this._vendorList = data.vendorList;          
          if(this._objwarehouse.n4 == "0" || this._objwarehouse.n4 == ""){
            this._objwarehouse.n4 = this._vendorList[0].syskey;
          }else{
            for (let i = 0; i < this._vendorList.length; i++) {
              if(this._vendorList[i].syskey==this._objwarehouse.n4){
                this._objwarehouse.n4 = this._vendorList[i].syskey;
              }
            }
          }
        } else {
          this._vendorList = [];
        }
      },
      error => {
      }
    );
  }

  getWareHouseList() {
    this.btn = false;
    this.spinner = true;
    if (this.ics.user.orgId.length == 0) return;
    let status = "";
        let url: string = this.ics.appConfig.apiurl + 'warehouse/searchWarehouseList';
        var param = { "codeType": this.search_param.codeType, "code": this.search_param.code, "descriptionType": this.search_param.descriptionType, "description": this.search_param.description, "currentPage": 1, "pageSize": 0, "vendorSyskey":this.search_param.vendorSyskey };
        var subscribe = this.http.post(url, param, this.ics.getOptions()).subscribe(
          (data: any) => {
            this._warehouseList = data.dataList;
            this.spinner = false;
            // this.getVendorList();
          }
        )
  }
  getDefaultDeleteObject() {
    return { 
      "inUsed_Table" : "STK001", 
      "count_Column" : "SYSKEY", 
      "inUsed_Column" : "n12", 
      "delete_Table" : "STK006",      
      "delete_Column" : "SYSKEY",
      "delete_Key" : "" 
    };
  }
  // gotoDelete() {    
  //   const url = this.ics.appConfig.apiurl + 'delete/tempDelete';
  //   this.delete_param.delete_Key = this._objwarehouse.syskey;
  //   var subscribe = this.http.post(url, this.delete_param, this.ics.getOptions()).subscribe(
  //     (data: any) => {
  //       if (data.message == "SUCCESS!") {
  //         this.ics.showToast(this.tostCtrl,"Message","Deleted Successfully!",1000).then(
  //           e => {
  //             this.getWareHouseList();
  //             $('#camtasklist-tab').tab('show');
  //           }
  //         );            
  //       } else if (data.message == "USED!") {
  //         this.ics.showToast(this.tostCtrl,"Message","This Warehouse Already in Used!",1000);
  //       } else {
  //         this.ics.showToast(this.tostCtrl,"Message","Deleting Fail!",1000);
  //       }
  //     },
  //     (error: any) => {
  //       this.ics.showToast(this.tostCtrl,"Message","Deleting Fail!",1000);
  //     });
  // }
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
              const url = this.ics.appConfig.apiurl + 'delete/tempDelete';
              this.delete_param.delete_Key = this._objwarehouse.syskey;
              var subscribe = this.http.post(url, this.delete_param, this.ics.getOptions()).subscribe(
                (data: any) => {
                  el.dismiss();
                  if (data.message == "SUCCESS!") {
                    this.ics.showToast(this.tostCtrl,"Message","Deleted Successfully!",1000).then(
                      e => {
                        this.getWareHouseList();
                        $('#camtasklist-tab').tab('show');
                      }
                    );            
                  } else if (data.message == "USED!") {
                    this.ics.showToast(this.tostCtrl,"Message","This Warehouse Already in Used!",1000);
                  } else {
                    this.ics.showToast(this.tostCtrl,"Message","Deleting Fail!",1000);
                  }
                },
                (error: any) => {
                  this.ics.showToast(this.tostCtrl,"Message","Deleting Fail!",1000);
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
    if (this.isvalid()) {
      let url: string = this.ics.appConfig.apiurl + 'warehouse/save';
      this.http.post(url, this._objwarehouse, this.ics.getOptions()).subscribe(
        (data: any) => {
          if (data.message == "SUCCESS") {
            this.ics.showToast(this.tostCtrl,"Message","Saved Successfully!",1000).then(
              e => {
                this.getWareHouseList();
                $('#camtasklist-tab').tab('show')
              }
              );            
          } else if (data.message == "CODEEXISTS") {
            this.ics.showToast(this.tostCtrl,"Message","Code Already Exists!",1000);
          } else {
            this.ics.showToast(this.tostCtrl,"Message","Saving Fail!",1000);
          }
        },
        (error: any) => {
          this.ics.showToast(this.tostCtrl,"Message","Saving Fail!",1000);
        });
    }
  }
  getWareHouseObj() {
    return {
      syskey: "0",
      createddate: "",
      modifieddate: "",
      userid: this.ics.user.userId,
      username: this.ics.user.userName,
      RecordStatus: 0,
      SyncStatus: 0,
      SyncBatch: "",
      code: "",
      desc: "",
      t3: "",
      n1: "0",
      n2: 0,
      n3: 0,
      n4: "0",
      Usersyskey: this.ics.user.userSk,
      t4:"",
      n5: "",
      l1: "",
      l2: "",
      l3: 0,
      l4:""
    };
  }
  getVendorObj() {
    return {
      syskey: "0",
      createdDate: "",
      modifiedDate: "",
      userId: "",
      userName: "",
      recordStatus: 1,
      syncStatus: 0,
      t1: "",
      t2: "",
      t3: "",
      t4: "",
      t5: "",
      t6: "",
      t7: "",
      t8: "",
      t9: "",
      t10: "",
      t11: "",
      t12: "",
      t13: "",
      t14: "",
      t15: "",
      t16: "",
      n1: "0",
      n2: 0,
      n3: 0,
      n4: "0",
      userSyskey: "0",
      n5: "0",
      n6: "0",
      n7: "0",
      n8: "0"
    };
  }

  isvalid() {
    if (this._objwarehouse.code.trim().length === 0) {
      this.ics.showToast(this.tostCtrl,"Message","Invalid Code!",1000);
      return false;
    }
    else if (this._objwarehouse.desc.trim().length === 0) {
      this.ics.showToast(this.tostCtrl,"Message","Invalid Description!",1000);
      return false;
    }
    else if (this._objwarehouse.n4 == "0" || this._objwarehouse.n4 == "-" || this._objwarehouse.n4 == "") {
      this.ics.showToast(this.tostCtrl,"Message","Invalid Vendor!",1000);
      return false;
    }
    else return true;
  }  

  advanceSearch(option) {
    this.searchtab = option;
    if(!this.searchtab){this.refresh();}
  }

  getDefaultSearchObject() {
    return { "codeType": "c", "descriptionType": "c", "code": "", "description": "", "vendorSyskey":"" };
  }

  refresh(){
    this.search_param = this.getDefaultSearchObject();
    this.getWareHouseList();
  }

}