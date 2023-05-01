import { HttpClient, HttpErrorResponse, HttpHandler, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, Events, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Workbook } from 'exceljs';
import { AppComponent } from '../app.component';

import { ControllerService } from '../controller.service';
import * as FileSaver from 'file-saver';
import { MatOption } from '@angular/material';

declare var $: any;
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  selector: 'app-credit-limit',
  templateUrl: './credit-limit.page.html',
  styleUrls: ['./credit-limit.page.scss'],
})
export class CreditLimitPage implements OnInit {
  @ViewChild('triggerAllDisChanSelectOption', { static: false }) triggerAllDisChanSelectOption: MatOption;
  
  spinner: boolean = false;
  searchtab: boolean = false;
  shoplist: any = [];
  searchObj: any = this.getSearchObj();
  storeType: any = [];
  chooseStoreType: String = "";
  criStateList: any = [];
  criDistrictList: any = [];
  criTownshipList: any = [];
  criTownList: any = [];
  criWardList: any = [];
  // isAdminRole = false;
  value: any;
  payTermList: any = [];
  payTermCode: String = "";
  saveBtn_Access: boolean = false;

  config = {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  oldcreditlimit: any = 0;
  paymentTerm: any;
  crdLimitAmount: any;
  crdLimitPartial: any;
  selectedCrdAmt: any;
  currentShop: any;
  partialShopCheck = false;
  checkPayTerm = false;
  checkCrdLimit = false
  shoplistToExport = [];
  disChannelList: any = [];
  isUseSAP: boolean = false;
  settingData: any;

  constructor(private http: HttpClient,
    public alertCtrl: AlertController,
    private manager: ControllerService,
    public activeRoute: ActivatedRoute,
    public loading: LoadingController,
    private tostCtrl: ToastController,
    private loadCtrl: LoadingController,
    public app: AppComponent
  ) {

  }


  ngOnInit() {
    this.getBtnAccess();
    this.settingData = JSON.parse(sessionStorage.getItem('settingData'));
    this.isUseSAP = this.settingData.n8 == '1' ? true : false;
  }

  async ionViewWillEnter() {
    this.runSpinner(true);
    this.manager.isLoginUser();
    this.searchObj.dateOptions = "";
    this.payTermCode = "";
    this.dateOptionsChange();
    this.getStoreType();
    $('#shop-list-tab').tab('show');
    this.getState();
    this.getPaymentTerm();
    this.getBtnAccess();
    this.shoplist = [];
    this.config.totalItems = 0;
    await this.getPartnerData();
    this.checkPayTerm = false;
    this.checkCrdLimit = false;
    this.searchObj = this.getSearchObj();
    this.settingData = JSON.parse(sessionStorage.getItem('settingData'));
    this.isUseSAP = this.settingData.n8 == '1' ? true : false;
    // await this.getShopList(0);
    this.runSpinner(false);    
  }

  getBtnAccess() {
    console.log('this.saveBtn_Access= ' + this.saveBtn_Access);
    const pages = this.app.appPages;
    for (let i = 0; i < pages.length; i++) {
      for (let y = 0; y < pages[i].child.length; y++) {
        if (pages[i].child[y].btns) {
          for (let z = 0; z < pages[i].child[y].btns.length; z++) {
            if (pages[i].child[y].btns[z].code === 'credit-limit-save' && pages[i].child[y].btns[z].status === true) {
              this.saveBtn_Access = true;
            }
          }
        }
      }
    }
  }


  runSpinner(t: boolean) {
    this.spinner = t;
  }

  advanceSearch(option) {
    this.searchtab = option;
    // if (!this.searchtab) { this.advanceSearchReset(); }
  }

  
  async search() {
    this.runSpinner(true);
    await this.getShopList(0);
    this.runSpinner(false);  
  }
  async advanceSearchReset() {
    this.searchObj = this.getSearchObj();
    this.chooseStoreType = "";
    this.searchObj.dateOptions = "";
    this.payTermCode = "";
    this.dateOptionsChange();
    this.shoplist = [];
    this.config.totalItems = 0;
    this.checkPayTerm = false;
    this.checkCrdLimit = false;
    this.runSpinner(true);
    await this.getShopList(0);
    this.runSpinner(false);
  }
  getSearchObj() {
    return {
      shopSysKey: "",
      fromdate: "",
      todate: "",
      modifiedfrom: "",
      modifiedto: "",
      shopName: "",
      shopCode: "",
      address: "",
      phno: "",
      ownerphno: "",
      latitide: "",
      longitude: "",
      pluscode: "",
      dateOptions: "",
      //  email: "",
      personName: "",
      activeStatus: -1,
      t14: "",
      n20: "",
      n21: "",
      n22: "",
      n23: "",
      n24: "",
      n31: "0",
      checkAll: false,
      "disChanSyskey": "",
      n27: ""
    }
  }

  toggleDisChanAllSelect() {
    if (this.triggerAllDisChanSelectOption.selected) {
      this.searchObj.disChanSyskey = [];
      this.searchObj.disChanSyskey.push(-1);
      for (let dischan of this.disChannelList) {
        this.searchObj.disChanSyskey.push(dischan.syskey)
      }
    } else {
      this.searchObj.disChanSyskey = [];
    }
  }

  checkAllShops(e) {
    if(e.checked) {
        this.shoplist.map((s: any) => {        
          s.isChangePayTerm = true;
          // return s;
        });
    } else {
        this.shoplist.map((s: any) => {        
          s.isChangePayTerm = false;
          // return s;
        });
    }
  }

  checkShop(s) {
    this.searchObj.checkAll = true;
    if(!s.isChangePayTerm){
      this.searchObj.checkAll = false;
    } else {
      this.shoplist.map(s => {
        if(!s.isChangePayTerm) {
          this.searchObj.checkAll = false;
        }
      });
    }
    if(this.searchObj.checkAll) {
      this.partialShopCheck = false;
    } else {
      this.partialShopCheck = true;
    }

  }

  async getShopList(current:number) {
    return new Promise<void>((resolve) => {      
      let send_data1 = this.searchObj.fromdate;
      let send_data2 = this.searchObj.todate;
      this.value = "";
      this.shoplist = [];
      this.shoplistToExport = [];
      this.config.totalItems = 0;      
      this.checkCrdLimit = false;
      this.checkPayTerm = false;
      this.searchObj.checkAll = false;
      let disvalue = "";

      if (this.searchObj.fromdate != null && this.searchObj.todate != null &&
        this.searchObj.fromdate.toString() != "" && this.searchObj.todate.toString() != "") {
        this.searchObj.fromdate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.fromdate);
        this.searchObj.todate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.todate);
      }
      else if (this.searchObj.fromdate != null && this.searchObj.fromdate.toString() != "") {
        this.searchObj.fromdate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.fromdate);
      }
      let send_data3 = this.searchObj.modifiedfrom;
      let send_data4 = this.searchObj.modifiedto;
      if (this.searchObj.modifiedfrom != null && this.searchObj.modifiedto != null &&
        this.searchObj.modifiedfrom.toString() != "" && this.searchObj.modifiedto.toString() != "") {
        this.searchObj.modifiedfrom = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.modifiedfrom);
        this.searchObj.modifiedto = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.modifiedto);
      }
      else if (this.searchObj.modifiedfrom != null && this.searchObj.modifiedfrom.toString() != "") {
        this.searchObj.modifiedfrom = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.modifiedfrom);
      }
      
      for (var i = 0; i < this.chooseStoreType.length; i++) {
        this.value += "'" + this.chooseStoreType[i] + "',";
      }
      console.log(this.value);
      this.value = this.value.slice(0, -1);
      this.searchObj.t14 = this.value;

      for(var i=0;i<this.searchObj.disChanSyskey.length;i++){
        disvalue+=this.searchObj.disChanSyskey[i]+","; 
      }
      disvalue = disvalue.slice(0,-1);
      this.searchObj.n27 = disvalue;
      // const url = this.manager.appConfig.apiurl + 'shop/shoplist-cri';
      const url = this.manager.appConfig.apiurl + 'shop/getCreditShopList';
      // this.searchObj.activeStatus = 0;
      const cri = {
        "data": this.searchObj,
        "current" : current,
        "maxrow": this.manager.itemsPerPage
      }
      console.log(cri)
      this.http.post(url, cri, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.config.totalItems = data.totalCount;
          this.shoplist = data.dataList;  
          this.shoplistToExport = data.dataList;             
          resolve();
        },
        error => {
          resolve();
        }
      )
    });
  }
  pageChanged(e) {
    this.config.currentPage = e;
    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.shoplist.slice(currentIndex, this.config.itemsPerPage);
    // this.runSpinner(true);
    // this.getShopList(currentIndex).then( ()=>{
    //   this.runSpinner(false);
    // }).catch(()=>{ this.runSpinner(false);})
  }
  changeCrdLmtAmt(shopSysKey)
  {
    alert("Hello "+shopSysKey);
  }

  // valid(shop) {
  //   if(shop.n31 <=0 ){
  //     this.manager.showToast(this.tostCtrl, "Message", "Please Choose Payment Term!", 2000);
  //     return false;
  //   }else {
  //     return true;
  //   }
  // }

  async save(shop){
    // if(this.valid(shop)) {

      const loading = await this.loadCtrl.create({
        cssClass: 'my-custom-class',
        message: 'Please wait...',
      });
      await loading.present();
      var shopListTemp = [];
      shop.userId = this.manager.user.userId;
      shop.userName = this.manager.user.userName;
      shop.userSyskey = this.manager.user.userSk;
      // shop.payTermCode = this.payTermCode;
      this.payTermList.map(payT => {
        if(payT.syskey === shop.n31) {
          shop.payTermCode = payT.code;
        } 
       });
       shopListTemp.push(shop);
      // const param = {
      //   "userId": this.manager.user.userId,
      //   "userName": this.manager.user.userName,
      //   "userSyskey": this.manager.user.userSk,
      //   "shopSyskey": shop.shopSysKey,
      //   "oldCrdLimitAmt": this.oldcreditlimit,
      //   "crdLimitAmt": shop.n15, // shop.n15
      //   "shopCode" : shop.shopCode,
      //   "shopName": shop.shopName,
      //   "shopAddress": shop.address,
      //   "payTerm": shop.n31,
      //   "payTermCode": this.payTermCode
      // }
      const url = this.manager.appConfig.apiurl + 'shop/updateCreditLimitAll';
      this.http.post(url, shopListTemp, this.manager.getOptions()).subscribe(
        (data: any) => {
          loading.dismiss();
          this.manager.showToast(this.tostCtrl, "Message", "" + data.message, 1000).then(
            e => {
              if (data.message == "SUCCESS") {
  
              } else {
                this.manager.showToast(this.tostCtrl, "Message", "FAIL!", 1000);
                this.shoplist.map(
                  s => {
                    if(s.shopSysKey == shop.shopSysKey){
                      s.check = false;
                      s.n15 = 0;
                    }
                  }
                )
              }
            }
          )
        },
        error => {
          loading.dismiss();
          this.manager.showToast(this.tostCtrl, "Message", "Server Fail!", 1000);
        }
      );
    // }
  }

  getStoreType() {
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'shop/getStoreType';
      this.http.post(url, { code: "", description: "" }, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.storeType = data.dataList;
        },
        error => {
          done();
        }
      )
    })
  }
  dateOptionsChange() {
    let dateOption = this.manager.getDateOptions(this.searchObj.dateOptions);
    this.searchObj.fromdate = dateOption.fromDate;
    this.searchObj.todate = dateOption.toDate;
  }
  getState() {
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'placecode/state';
      this.http.post(url, { code: "", description: "" }, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.criStateList = [];

          data.dataList.forEach(e => {
            this.criStateList.push({ syskey: e.syskey, t2: e.t2 });
          });

          this.criStateList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
        },
        error => {
          done();
        }
      )
    })
  }

  getDistrict(state: string) {
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'placecode/getdistrict';
      this.http.post(url, {
        code: "",
        description: "",
        stateSyskey: state,
        districtSyskey: ""
      }, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.criDistrictList = [];

          data.districtList.forEach(e => {
            this.criDistrictList.push({ syskey: e.syskey, t2: e.t2 });
          });

          this.criDistrictList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
        },
        error => {
          done();
        }
      )
    })
  }

  getTsp(dis: string) {
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'placecode/gettsp';
      this.http.post(url, {
        code: "",
        description: "",
        stateSyskey: "",
        districtSyskey: dis,
        townshipSyskey: '0'
      }, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.criTownshipList = [];

          data.tspList.forEach(e => {
            this.criTownshipList.push({ syskey: e.syskey, t2: e.t2 });
          });
          this.criTownshipList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
        },
        error => {
          done();
        }
      )
    })
  }
  criStateChange() {
    this.searchObj.n21 = "";
    this.searchObj.n22 = "";
    this.searchObj.n23 = "";
    this.searchObj.n24 = "";
    this.getDistrict(this.searchObj.n20);
  }

  criDistrictChange() {
    this.searchObj.n22 = "";
    this.searchObj.n23 = "";
    this.searchObj.n24 = "";
    this.getTsp(this.searchObj.n21);
  }

  criTownshipChange() {
    this.searchObj.n23 = "";
    this.searchObj.n24 = "";
    this.getTownOrVillage({ n2: "0", n3: this.searchObj.n22 });
  }

  criTownChange() {
    this.searchObj.n24 = "";
    this.getWards({ n2: "0", n3: this.searchObj.n23 });
  }
  private getTownOrVillage(param) {
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'placecode/gettown';
      this.http.post(url,
        //   {n2: parseInt(this.townvillage),n3: this.shopObj.n22}, 
        param,
        this.manager.getOptions()).subscribe(
          (data: any) => {
            done();
            this.criTownList = [];

            data.townList.forEach(e => {
              this.criTownList.push({ syskey: e.syskey, t2: e.t2 });
            });

            this.criTownList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
          },
          error => {
            done();
          }
        )
    })
  }
  getWards(param) {
    if (param.n3 == "0") return;
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'placecode/ward';
      this.http.post(url,
        param
        , this.manager.getOptions()).subscribe(
          (data: any) => {
            this.criWardList = [];

            data.wardList.forEach(e => {
              this.criWardList.push({ syskey: e.syskey, t2: e.t2, n2: e.n2 });
            });

            this.criWardList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
          },
          error => {
            done();
          }
        )
    })
  }
  getPaymentTerm() {
    const url = this.manager.appConfig.apiurl+ 'shop/getPaymentTerm';
    this.http.get(url, this.manager.getOptions()).subscribe((data: any) => {
      if(data.message == 'SUCCESS') {
        this.payTermList = data.dataList.payTermList;
      }
    });
  }
  changePaymentTerm(event, shopIndex) {
    console.log(event.target.options.selectedIndex);
    console.log(shopIndex);
    // this.payTermCode = this.payTermList[event.target.options.selectedIndex-1].syskey;
    // if(event.target.options.selectedIndex >0) {
      this.payTermCode = this.payTermList[event.target.options.selectedIndex].code;
      this.shoplist[(shopIndex) + (this.config.itemsPerPage* (this.config.currentPage-1))].check = true;
      this.oldcreditlimit = this.shoplist[(shopIndex) + (this.config.itemsPerPage* (this.config.currentPage-1))].oldCrdLimitAmt;
      this.currentShop = this.shoplist[(shopIndex) + (this.config.itemsPerPage* (this.config.currentPage-1))];
      if(this.checkPayTerm) {
        this.shoplist.map(s => {
          if(s.isChangePayTerm) {
            s.n31 = this.currentShop.n31;
          }
        });
      }
    // } else {
    //   this.shoplist[shopIndex].isChangePayTerm = false;
    //   this.oldcreditlimit = 0;
    // }
  }

  setCreditLimitAll(shop) {
    if(this.checkCrdLimit) {
      this.shoplist.map(s => {
        if(s.isChangePayTerm) {
          s.n15 = shop.n15;
        }
      });
    }
  }

  print() {

    let data1 = this.shoplist;
    let excelHeaderData = [
      "Shop Code",
      "Shop Name",
      "Shop Address",
      "Payment Term",
      "Credit Limit"
    ];
    let excelDataList: any = [];

    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Credit Limit Data');
    for (var exCount = 0; exCount < data1.length; exCount++) {
      let excelData: any = [];
      // excel_date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].fromDate).toString();
      // excelData.push(excel_date);
      excelData.push(data1[exCount].shopCode);
      excelData.push(data1[exCount].shopName);
      excelData.push(data1[exCount].address);
      this.payTermList.map(pay => {
        if(data1[exCount].n31=== pay.syskey)
        excelData.push(pay.desc);
      });
      excelData.push(data1[exCount].n15);

      excelDataList.push(excelData);
    }

    let headerRow = worksheet.addRow(excelHeaderData);
    headerRow.font = { bold: true };
    for (var i_data = 0; i_data < excelDataList.length; i_data++) {
      worksheet.addRow(excelDataList[i_data]);
    }

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: EXCEL_TYPE });
      FileSaver.saveAs(blob, "Credit Limit" + EXCEL_EXTENSION);
    });
  }

  async saveAll() {    

    const loading = await this.loadCtrl.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
    });
    await loading.present();
    var shopListTemp = [];
    // if(this.searchObj.checkAll) {
      this.shoplist.map(
        s => {
          if(s.isChangePayTerm) {
              s.userId = this.manager.user.userId,
              s.userName = this.manager.user.userName,
              s.userSyskey = this.manager.user.userSk,
              this.payTermList.map(payT => {
                if(payT.syskey === s.n31) {
                  s.payTermCode = payT.code;
                } 
               });
               shopListTemp.push(s);
          }
        }
      );
    if(shopListTemp.length > 0) {
      const url = this.manager.appConfig.apiurl + 'shop/updateCreditLimitAll';
      this.http.post(url, shopListTemp, this.manager.getOptions()).subscribe(
        (data: any) => {
          loading.dismiss();
          this.manager.showToast(this.tostCtrl, "Message", "" + data.message, 1000).then(
            e => {
              if (data.message == "SUCCESS") {
                this.shoplist = [];
                this.searchObj.checkAll = false;
                this.config.totalItems = 0;
                this.checkPayTerm = false;
                this.checkCrdLimit = false;
              } else {
                this.manager.showToast(this.tostCtrl, "Message", "FAIL!", 1000);
              }
            }
          )
        },
        error => {
          loading.dismiss();
          this.manager.showToast(this.tostCtrl, "Message", "Server Fail!", 1000);
        }
      );
    } else {
      loading.dismiss();
      this.manager.showToast(this.tostCtrl, "Message", "Please select at least one shop!", 1000);
    }

  }

  amountChange(e) {

  }

  async getPartnerData() {
    const url = this.manager.appConfig.apiurl+ 'shop/getPartnerData';
    this.http.get(url, this.manager.getOptions()).subscribe((data: any) => {
      if(data.message == 'SUCCESS') {
        // this.saleOrgList = data.dataList.saleOrgList;
        // this.divisionList = data.dataList.divisionList;
        this.disChannelList = data.dataList.disChannelList;
        // this.saleOfficeList = data.dataList.saleOfficeList;
        // this.saleGrpList = data.dataList.saleGrpList;
        // this.payTermList = data.dataList.payTermList;
        // this.cusGrpList = data.dataList.cusGrpList;
        // this.plantList = data.dataList.plantList;
        // this.stolocList = data.dataList.stolocList;
        // this.shippingList = data.dataList.shippingList;
        // this.routeList = data.dataList.routeList;
        // this.ptnrRoleList = data.dataList.ptnrRoleList;
      }
    });
  }


}
