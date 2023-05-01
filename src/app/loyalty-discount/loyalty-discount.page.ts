import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAccordion, MatGridTileHeaderCssMatStyler } from '@angular/material';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { ControllerService } from '../controller.service';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import { MyStore, ResultData } from './interface';
import { ShopData } from '../delievery-order/interface';
import { myStoreData } from '../store-routing/interface';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $: any;

@Component({
  selector: 'app-loyalty-discount',
  templateUrl: './loyalty-discount.page.html',
  styleUrls: ['./loyalty-discount.page.scss'],
})
export class LoyaltyDiscountPage implements OnInit,AfterViewInit {
  @ViewChild('browseTownship', { static: false }) ld_shopMatAccordion: MatAccordion;
  @ViewChild('chosefile', {static: false}) myInputVariable: ElementRef;
  page: any = this.getPage();
  config = {
    itemsPerPage: 20,
    currentPage: 0,
    totalItems: 0
  };

  shopSearchFC = new FormControl();
  shopNameSearch = new FormControl();
  shopList = [];
  filterShops = [];

  loyaltyHeader = this.getLoyaltyHeader();
  loyaltyHeaderList = [];
  loyaltyDetail = this.getLoyaltyDetail();
  loyaltyDetailDeleted = [];
  loyaltyJun = this.getLoyaltyJun();
  loyaltyJunDeleted = [];

  giftList = [];
  couponList = [];

  searchCri = this.getSearchCri();
  discountType = {
    price: 1,
    inkind: 2
  }
  inKindItemType = [

    { code: 1, desc: "Gift SKU" },
    { code: 2, desc: "Lucky Draw" },
  ]
  redemptionOrRebate = [
    { code: 1, desc: "Redemption" },
    { code: 2, desc: "Rebate" }
  ]
  Redemption = 1;
  Rebate = 2;
  defaultNgValue = { syskey: "0", t2: "" };
  todayDate = new Date();

  store_formgroup: FormGroup;
  assigned_store_formgroup: FormGroup;
  pagination_stores_config = {
    id: "pagination_stores_config",
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  }
  pagination_assignedstores_config = {
    id: "pagination_assignedstores_config",
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  }

  importload: any;
  each_sheet_data: any = this.forjsondata1();
  all_sheet_data: any = this.forjsondata2();
  uploadedFileName: string = "";
  uploadFile: File;
  selectedFile: File;
  _shoplistdata: any = [];
  value: any;
  shopListFromExcel: any = [];

  // tempSaveData: any = this.getSaveData();
  tempSearchCri: any = this.getShopListPageChangeData();
  shopListItemPerPage = 20;
  townList: any = [];
  tempSearch: any = this.getShopListPageChangeData();
  tsLoadingFlag: any = false;
  saveData: any = this.getSaveData();
  tempSaveData: any = this.getSaveData();
  tempShopList: any = [];
  dropdown = false;
  config1 =  {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  tempE: any = {
    "currentTarget": {
      "checked": false
    }
  };
  

  urlSave = this.manager.appConfig.apiurl + 'loyalty-discount/' + 'save';
  urlGetPromotionSetup = this.manager.appConfig.apiurl + 'loyalty-discount/' + 'get-promotion-setup';
  urlGetPromotionDetail = this.manager.appConfig.apiurl + 'loyalty-discount/' + 'get-promotion-detail/';
  urlGetStoreJunDetail = this.manager.appConfig.apiurl + 'loyalty-discount/' + 'get-promotion-store-junction/';
  urlCouponList = this.manager.appConfig.apiurl + 'coupon/' + 'getcoupon';
  urlActive = this.manager.appConfig.apiurl + 'loyalty-discount/active-header/';
  constructor(
    private manager: ControllerService,
    private tostCtrl: ToastController,
    private http: HttpClient,
    private loading: LoadingController,
    private alertCtrl: AlertController
    
  ) { }
  ngAfterViewInit(): void {
    $(".searchbox-input").focusin(()=>{
      $('.pagination-block-stores').addClass('disabled')
    });
    $(".searchbox-input").focusout(()=>{
      $('.pagination-block-stores').removeClass('disabled');
      //this.searchStores()
    });
  }

  ngOnInit() {
    this.store_formgroup = this.getStoreFormGroup();
    this.assigned_store_formgroup = this.getAssignedStoreFormGroup();
    this.shopSearchFC.valueChanges.subscribe(
      value => {
        if (value != '' && typeof value !== 'object') {
          if (this.filterShops.length > 0) {
            this.manager.shopNameSearchAutoFill(value, this.filterShops).subscribe(
              data => {
                this.shopList = data;
              });
          } else {
            this.manager.shopNameSearchAutoFill(value).subscribe(
              data => {
                this.shopList = data;
              });
          }
        }
      }
    )
    this.shopNameSearch.valueChanges.subscribe(
      shopName => {
        if (shopName != '') {
          //this.ld_shopMatAccordion.openAll();
          this.page.townShipsFilter = this.page.townShips.filter((t) => {
            let filterShops = t.ShopDataList.filter(s => {
              return s.shopName.toLowerCase().indexOf(shopName) != -1;
            });
            if (filterShops.length > 0) {
              return t;
            }
          })
        } else {
          this.page.townShipsFilter = this.page.townShips;
        }
      }
    );
  }

  async ionViewWillEnter() {
    this.manager.isLoginUser();
    this.page = this.getPage();
    this.default();
    this.page.spinner = true;
    await this.getBrandOwner();
    $('#loyalty-list-tab').tab('show');
    this.getPromotionSetup(0);
  }
  getStoreFormGroup(): FormGroup {
    return new FormGroup({
      'stores': new FormControl([]),
      'stores-search': new FormControl('')
    })
  }
  getAssignedStoreFormGroup(): FormGroup {
    return new FormGroup({
      'stores': new FormControl([])
    })
  }
  default() {

    this.loyaltyHeader = this.getLoyaltyHeader();
    this.loyaltyDetail = this.getLoyaltyDetail();
    this.searchCri = this.getSearchCri();
    this.loyaltyDetailDeleted = [];
    this.loyaltyJunDeleted = [];
    this.filterShops = [];
    this.clear();
    this.getPromotionSetup(0);
  }
  listClick() {
    $('#loyalty-list-tab').tab('show');
    this.page.btn = false;
  }
  detailClick() {
    $('#setup-tab').tab('show');
    this.showDetailPage();
    this.default();
    this.searchTownship();
    this.config1.currentPage = 1;
    this.tempShopList = [];
  }
  showDetailPage() {
    $('#loyalty-new-tab').tab('show');
    this.page.btn = true;
  }
  getPage() {
    return {
      spinner: false,
      searchtab: false,
      btn: false,
      brandOwnerList: [],
      auderboxType: { syskey: '0', t1: "auderbox", t2: "Auderbox Discount" },
      amountStatus: this.manager.amountStatus,
      townShips: [],
      townShipsFilter: [],
      selectedShops: []
    }
  }
  getLoyaltyHeader() {
    return { 'syskey': "0", 'createdDate': "", 'modifiedDate': "", 'userId': "", 'userName': "", 'recordStatus': 1, 'saveStatus': 1, 't1': "", 't2': "", 't3': new Date(), 't4': new Date(), 't5': new Date(), 't6': new Date(), 'n1': "0", 'n2': "0", 'n3': "0", 'n4': "0", 'n5': "0", 'n6': 0.0, 'n7': 0.0, 'n8': 0.0, 'n9': 0.0, 'n10': 0.0, 'n11': 1, 'n12': 1, 'n13': 0, 'n14': 0, 'detail': [], 'junction': [] }
  }
  getLoyaltyDetail() {
    return { 'syskey': "0", 'createdDate': "", 'modifiedDate': "", 'userId': "", 'userName': "", 'recordStatus': 1, 'saveStatus': 1, 't1': "", 't2': "", 't3': "", 't4': "", 'n1': "0", 'n2': "0", 'n3': "0", 'n4': "0", 'n5': "0", 'n6': 0.0, 'n7': 0.0, 'n8': 0.0, 'n9': 0.0, 'n10': 0.0, 'n11': 0, 'n12': { code: 1, desc: "equal" }, 'n13': 0, 'n14': 0 }
  }
  getLoyaltyJun() {
    return { 'syskey': "0", 'createdDate': "", 'modifiedDate': "", 'userId': "", 'userName': "", 'recordStatus': 1, 'saveStatus': 1, 't1': "", 't2': "", 't3': "", 't4': "", 'n1': { shopCode: '', address: '', shopName: "" }, 'n2': "0", 'n3': "0", 'n4': "0", 'n5': "0", 'n6': 0.0, 'n7': 0.0, 'n8': 0.0, 'n9': 0.0, 'n10': 0.0, 'n11': true, 'n12': { code: 1, desc: "Redemption" }, 'n13': 0, 'n14': 0 }
  }
  getSearchCri() {
    return {
      'fromDate': '',
      'toDate': '',
      't1': '',
      't2': ''
    }
  }
  getBrandOwner() {
    return new Promise<void>(promise => {
      if (this.page.brandOwnerList.length > 0) {
        promise();
      }

      const url = this.manager.appConfig.apiurl + 'brandowner/getlist';
      const param = {
        code: "",
        codeType: "",
        descriptionType: "",
        description: "",
        vendorSyskey: "0"
      };
      let caller = this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          promise();
          this.page.brandOwnerList = data;
          this.page.brandOwnerList.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
        },
        error => {
          console.log(error);
          promise();
        }
      )
    })


  }
  getPromotionSetup(row) {
    let cri = {
      "t1": this.searchCri.t1,
      "t2": this.searchCri.t2,
      "t3": this.searchCri.fromDate == '' ? '' : this.manager.formatDate(this.searchCri.fromDate as any, 'yyyyMMdd'),
      "t4": this.searchCri.toDate == '' ? '' : this.manager.formatDate(this.searchCri.toDate as any, 'yyyyMMdd'),

      'maxRow': this.manager.itemsPerPage,
      'currentRow': row,
      'totalCount': this.config.totalItems
    }
    this.page.spinner = true;
    this.http.post(this.urlGetPromotionSetup, cri, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.page.spinner = false;
        if (data.status == 'SUCCESS') {
          this.config.totalItems = data.totalCount;
          this.config.itemsPerPage = this.manager.itemsPerPage;
          this.loyaltyHeaderList = data.dataList.map(e => {
            try {
              e.t3 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoDTP, e.t3);
              e.t4 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoDTP, e.t4);
              e.t5 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoDTP, e.t5);
              e.t6 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoDTP, e.t6);
            } catch {
              e.t3 = '';
              e.t4 = '';
              e.t5 = '';
              e.t6 = '';
            }
            e.n12 = e.n12 == 1 ? true : false;
            return e;
          })
        } else {

        }

      },
      error => {
        this.page.spinner = false;
      }
    )
  }
  // getPromotionJunction() {
  //   if (this.loyaltyHeader.syskey !== "0" && this.loyaltyHeader.syskey !== "") {
  //     // if (this.assigned_store_formgroup.get('stores').value.length > 0) return;
  //     this.assigned_store_formgroup.get('stores').setValue([]);
  //     this.page.spinner = true;
  //     const url = this.urlGetStoreJunDetail + this.loyaltyHeader.syskey;
  //     this.http.get(url, this.manager.getOptions()).subscribe(
  //       (data: any) => {
  //         this.filterShops = [];
  //         this.page.spinner = false;
  //         if (data.status == 'SUCCESS') {
  //           console.log(data);
  //           this.assigned_store_formgroup.get('stores').setValue(
  //             data.dataList.map( (d:any)=>{
  //               const store:ShopData = d.shop;
  //               let s:MyStore = {
  //                 no:0,
  //                 shop_name: store.shopName,
  //                 shop_code:store.shopCode,
  //                 shop_syskey: store.shopSysKey,
  //                 shop_address: store.address,
  //                 check:false,
  //                 red_reb: d.n12,
  //                 active:d.n11 == 1 ? true : false,
  //                 state_syskey: '0',
  //                 state_name: '',
  //                 district_syskey:'0',
  //                 district_name:'',
  //                 township_syskey:'0',
  //                 township_name:'',
  //                 town_syskey :'0',
  //                 town_name:'',
  //                 ward_village_name:'',
  //                 ward_village_syskey:'0',
  //               }
  //               return s;
  //             })
  //           )
  //         } else {
  //         }
  //       },
  //       error => {
  //         this.page.spinner = false;
  //       }
  //     )
  //   }
  //     this.store_formgroup.get('stores-search').setValue(''); 
  //     this.getStores(0)
  // }
  getPromotionJunction() {
    if (this.loyaltyHeader.syskey !== "0" && this.loyaltyHeader.syskey !== "") {
      // if (this.assigned_store_formgroup.get('stores').value.length > 0) return;
      this.tempShopList = [];
      this.config1.currentPage = 1;
      this.page.spinner = true;      
      let returnTempJuncData = this.getVolDisJunDataList();
      const url = this.urlGetStoreJunDetail + this.loyaltyHeader.syskey;
      this.http.get(url, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.filterShops = [];
          this.page.spinner = false;
          if (data.status == 'SUCCESS') {
            console.log(data);
            // this.assigned_store_formgroup.get('stores').setValue(
              data.dataList.map( (d:any)=>{
                const store:ShopData = d.shop;

                returnTempJuncData = this.getVolDisJunDataList();
    
                returnTempJuncData.syskey = "0";
                returnTempJuncData.recordStatus = "1";
                returnTempJuncData.n1 = store.n1;
                returnTempJuncData.n2 = store.shopSysKey;
                // returnTempJuncData.n3 = store.n3;
                returnTempJuncData.t1 = store.t1;
                returnTempJuncData.t2 = store.shopName;
                returnTempJuncData.t3 = store.t3;
                returnTempJuncData.t4 = store.t4;
                // returnTempJuncData.townSyskey = store.townSyskey;
                returnTempJuncData.shopCode = store.shopCode;
                returnTempJuncData.address = store.address;
                returnTempJuncData.red_reb = d.n12,
                returnTempJuncData.active = d.n11 == 1 ? true : false,
                // returnTempJuncData.check = false,
    
                this.saveData.volDisShopJuncDataList.push(returnTempJuncData);
                this.tempShopList.push(returnTempJuncData);
              })

              this.tempShopList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
              this.searchTownship();
            // )
          } else {
          }
        },
        error => {
          this.page.spinner = false;
        }
      )
    }
      this.store_formgroup.get('stores-search').setValue(''); 
      this.getStores(0)
  }
  search() {
    this.getPromotionSetup(0);
  }
  addLoyaltyDetail() {
    if (this.beforeAddLoyaltyDetail(this.loyaltyDetail)) {
      if ((this.loyaltyDetail.n2 as any).t1 == 'auderbox')
        this.loyaltyHeader.detail.unshift(this.loyaltyDetail);
      else
        this.loyaltyHeader.detail.push(this.loyaltyDetail);
      this.loyaltyDetail = this.getLoyaltyDetail();
    }

  }
  beforeAddLoyaltyDetail(d) {
    if (d.n2 == "0") {
      this.manager.showToast(this.tostCtrl, "Warnning", "Select brand owner", 1000);
      return false;
    } else {
      let auderbox = this.loyaltyHeader.detail.filter(detail => {
        return (detail.n2.t1 && d.n2.t1) == 'auderbox'
      });
      if (auderbox.length > 0) {
        this.manager.showToast(this.tostCtrl, "Warnning", "Duplicate brand owner", 1000);
        return false;
      }
    }
    if (this.loyaltyHeader.n11 == this.discountType.price) {
      if (d.n12 == 0) {
        this.manager.showToast(this.tostCtrl, "Warnning", "Invalid operator", 1000);
        return false;
      }
      if (d.n12.code == 32) {
        if (d.n6 > d.n7) {
          this.manager.showToast(this.tostCtrl, "Warnning", "First revenue must be less than second one", 1000);
          return false;
        }
      }
      if (d.n6 == 0) {
        this.manager.showToast(this.tostCtrl, "Warnning", "Invalid revenue amount", 1000);
        return false;
      }
      if (d.n8 == 0) {
        this.manager.showToast(this.tostCtrl, "Warnning", "Invalid discount amount", 1000);
        return false;
      }
    } else {
      if (d.n3 == "0") {
        this.manager.showToast(this.tostCtrl, "Warnning", "Select item", 1000);
        return false;
      }
      if (d.n13 == 0) {
        this.manager.showToast(this.tostCtrl, "Warnning", "Select Gift SKU or LuckyDraw", 1000);
        return false;
      }
      if (d.n14 == 0) {
        this.manager.showToast(this.tostCtrl, "Warnning", "Item qty must be greater than 0", 1000);
        return false;
      }
    }
    return true;
  }
  bindDetail(mdetail) {
    return {
      'syskey': mdetail.syskey,

      'recordStatus': mdetail.recordStatus,
      'saveStatus': mdetail.saveStatus,
      't1': mdetail.n2.t1 == 'auderbox' ? 'auderbox' : '',
      't2': "",
      't3': "",
      't4': "",

      'n1': this.loyaltyHeader.syskey,
      'n2': mdetail.n2 == "0" ? "0" : mdetail.n2.syskey,
      'n3': mdetail.n3 == "0" ? "0" : mdetail.n3.syskey,
      'n4': "0",
      'n5': "0",
      'n6': mdetail.n6,
      'n7': mdetail.n7,
      'n8': mdetail.n8,
      'n9': 0.0,
      'n10': 0.0,
      'n11': this.loyaltyHeader.n11,
      'n12': mdetail.n12.code,
      'n13': mdetail.n13 == 0 ? 0 : mdetail.n13.code,
      'n14': mdetail.n14
    }

  }
  // bindJun(jun:MyStore) {
  //   return {
  //     'syskey': '0',

  //     'recordStatus': 1,
  //     'saveStatus': 1,

  //     'n1': jun.shop_syskey,
  //     'n2': "0",
  //     'n3': "0",
  //     'n4': "0",
  //     'n5': "0",
  //     'n6': 0.0,
  //     'n7': 0.0,
  //     'n8': 0.0,
  //     'n9': 0.0,
  //     'n10': 0.0,
  //     'n11': jun.active ? 1 : 0,
  //     'n12': jun.red_reb,
  //     'n13': 0,
  //     'n14': 0
  //   }
  // }
  bindJun(jun) {
    return {
      'syskey': '0',

      'recordStatus': 1,
      'saveStatus': 1,

      'n1': jun.n2,
      'n2': "0",
      'n3': "0",
      'n4': "0",
      'n5': "0",
      'n6': 0.0,
      'n7': 0.0,
      'n8': 0.0,
      'n9': 0.0,
      'n10': 0.0,
      'n11': jun.active ? 1 : 0,
      'n12': jun.red_reb,
      'n13': 0,
      'n14': 0
    }
  }
  deleteHeader() {
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
              el.dismiss();
              this.beforeSave(4);
             
              })
            }
          }]}
          ).then(el => {
            el.present();
          })
        }
    

  beforeSave(deleteKey?) {
    if (!this.validationHeader(this.loyaltyHeader)) return;
    let finalDetail = [];
    for (let i = 0; i < this.loyaltyHeader.detail.length; i++) {
      let mdetail = this.loyaltyHeader.detail[i];
      finalDetail.push(this.bindDetail(mdetail));
    }
    for (let i = 0; i < this.loyaltyDetailDeleted.length; i++) {
      finalDetail.push(this.bindDetail(this.loyaltyDetailDeleted[i]));
    }
    // let junList = this.assigned_store_formgroup.get('stores').value.map( (s:MyStore)=>{
    //   return this.bindJun(s);
    // })
    let junList = this.tempShopList.map( s =>{
      return this.bindJun(s);
    })
    let header = {
      'syskey': this.loyaltyHeader.syskey,
      'recordStatus': this.loyaltyHeader.recordStatus,
      'saveStatus': this.loyaltyHeader.saveStatus,
      't1': this.loyaltyHeader.t1,
      't2': this.loyaltyHeader.t2,
      't3': this.manager.formatDate(this.loyaltyHeader.t3, 'yyyyMMdd'),
      't4': this.manager.formatDate(this.loyaltyHeader.t4, 'yyyyMMdd'),
      't5': this.manager.formatDate(this.loyaltyHeader.t5, 'yyyyMMdd'),
      't6': this.manager.formatDate(this.loyaltyHeader.t6, 'yyyyMMdd'),
      'n11': this.loyaltyHeader.n11,
      'n12': this.loyaltyHeader.n12 ? 1 : 2,
      'detail': finalDetail,
      'junction': junList
    }
    if (deleteKey) {
      header.recordStatus = 4;
    }
    this.save(header);
  }
  validationHeader(h) {
    if (h.t1 == '') {
      this.manager.showToast(this.tostCtrl, "Warnning", "Invalid code", 1000);
      return false;
    }
    if (h.t2 == '') {
      this.manager.showToast(this.tostCtrl, "Warnning", "Invalid name", 1000);
      return false;
    }
    if (this.loyaltyHeader.detail.length == 0) {
      this.manager.showToast(this.tostCtrl, "Warnning", "Create new promotion", 1000);
      return false;
    }
    if(this.assigned_store_formgroup.get('stores').value.filter( (s:MyStore)=>{ return s.red_reb !==1 && s.red_reb !==2 }).length > 0 ){
      this.manager.showToast(this.tostCtrl, "Warnning", "Invalid assigned stores", 1000);
      return false;
    }

    return true;
  }
  save(data) {
    this.loading.create({
      backdropDismiss: false,
      message: 'Processing .. '
    }).then(loadEl => {
      loadEl.present();
      let progressOptions = this.manager.getProgressOptions() as any;
      this.http.post(this.urlSave, data,
        progressOptions
      ).subscribe(
        (data: any) => {
          let status = this.manager.getStatusMessage(data);
          if (status.response) {
            loadEl.dismiss();
            if (status.body.body.status == 'SUCCESS') {
              this.manager.showToast(this.tostCtrl, "Message", "Success", 1000).then(
                e => {
                  this.ionViewWillEnter();
                }
              )
            } else {
              this.manager.showToast(this.tostCtrl, "Message", "Fail", 1000).then(
                e => {
                  console.log(status)
                }
              )
            }
          } else {
            console.log(status)
          }
        },
        error => {
          loadEl.dismiss();
          console.log(error)
        }
      )
    })

  }
  pageChanged(e) {
    this.config.currentPage = e;
    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.getPromotionSetup(currentIndex);

  }
  getPromotionDetail(headerId, index) {
    this.loyaltyHeader = this.loyaltyHeaderList[index];

    this.page.spinner = true;
    $('#setup-tab').tab('show');
    const url = this.urlGetPromotionDetail + headerId;
    this.http.get(url, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.status == "SUCCESS") {
          console.log(data)
          this.showDetailPage();
          this.page.spinner = false;
          this.loyaltyHeader.detail = data.dataList.map(detail => {
            let brandOwner = {
              syskey: "0",
              t2: "",
              t1: ""
            }
            if (detail.t1 == 'auderbox') {
              brandOwner.syskey = "0";
              brandOwner.t2 = "Auderbox Discount";
              brandOwner.t1 = 'auderbox';
            } else {
              for (let i = 0; i < this.page.brandOwnerList.length; i++) {
                if (this.page.brandOwnerList[i].syskey == detail.n2) {
                  brandOwner.syskey = this.page.brandOwnerList[i].syskey;
                  brandOwner.t2 = this.page.brandOwnerList[i].t2;
                }
              }
            }

            detail.n2 = brandOwner;

            for (let i = 0; i < this.page.amountStatus.length; i++) {
              if (this.page.amountStatus[i].code == detail.n12) {
                detail.n12 = this.page.amountStatus[i];
              }
            }
            if (this.loyaltyHeader.n11 == this.discountType.price) {

            } else {
              for (let i = 0; i < this.inKindItemType.length; i++) {
                if (this.inKindItemType[i].code == detail.n13) {
                  detail.n13 = this.inKindItemType[i];
                }
              }
              if (detail.n13.code == 1) {  //    gift sku

                const url = this.manager.appConfig.apiurl + 'Gift/getGift';
                this.http.post(url, {
                  'syskey': detail.n3
                }, this.manager.getOptions()).subscribe(
                  (data: any) => {
                    detail.n3 = data.giftdata[0];
                  },
                  error => {
                  }
                )

              } else {                      //    lucky draw
                //detail.n3 = this.defaultNgValue;
                this.http.post(this.urlCouponList, {
                  'syskey': detail.n3
                }, this.manager.getOptions()).subscribe(
                  (data: any) => {
                    if (data.CouponList.length > 0) {
                      detail.n3 = data.CouponList[0];
                    }
                  },
                  error => {
                  }
                );
              }
            }
            console.log(detail)
            return detail;
          })
          this.loyaltyHeader.detail.sort(
            function (a, b) {
              return ((a.n2.t1 == 'auderbox') ? -1 : 1)
            }
          );
        } else {
          this.page.spinner = false;
        }
      },
      error => {
        this.page.spinner = false;
      }
    )
  }
  deletePromotionDetail(index) {
    let detail = this.loyaltyHeader.detail[index];
    if (detail.syskey !== "0" && detail.syskey !== "") {
      detail.recordStatus = 4;
      this.loyaltyDetailDeleted.push(detail);
      this.loyaltyHeader.detail.splice(index, 1);
    } else {
      this.loyaltyHeader.detail.splice(index, 1);
    }
  }
  optionSelected() {

  }
  public displayProperty(value) {
    if (value) {
      return value.shopName;
    }
  }
  addStore() {
    if (this.loyaltyJun.n1.shopCode !== "" && this.loyaltyJun.n1.shopCode !== undefined) {
      this.filterShops.push((this.loyaltyJun.n1 as any).shopSysKey)
      this.loyaltyHeader.junction.push(this.loyaltyJun);
      this.loyaltyJun = this.getLoyaltyJun();
    }

  }
  deleteStore(index) {
    if (this.loyaltyHeader.junction[index].syskey !== "" && this.loyaltyHeader.junction[index].syskey !== "0") {
      this.loyaltyHeader.junction[index].recordStatus = 4;
      this.loyaltyJunDeleted.push(this.loyaltyHeader.junction[index]);
    }
    this.loyaltyHeader.junction.splice(index, 1);

  }
  async inKindItemTypeChange(e) {
    if ((this.loyaltyDetail.n13 as any).code == 1) { //  gift
      this.giftList = [];
      await this.getGiftSku();
    } else {
      this.giftList = [];
      await this.getCouponList();
    }
  }
  private getGiftSku(syskey?) {
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'Gift/getGift';
      this.http.post(url, {
        'syskey': syskey ? syskey : ''
      }, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          // console.log(data.giftdata);
          this.giftList = data.giftdata;
          return data.giftdata;
        },
        error => {
          done();
        }
      )
    })

  }
  private getCouponList() {
    $('#inkinditem-select').attr("placeholder", "Loading..");
    return new Promise<void>(done => {
      this.http.post(this.urlCouponList, {
        'syskey': ''
      }, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.giftList = data.CouponList;
          if (this.giftList.length == 0) {
            $('#inkinditem-select').attr("placeholder", "No record");
          } else {
            $('#inkinditem-select').attr("placeholder", "Select");
          }
        },
        error => {
          $('#inkinditem-select').attr("placeholder", "Server doesn't response");
          done();
        }
      );
    })

  }
  async browsePairShop() {

    this.page.selectedShops = [];
    $('.ld-btn-browseShops').prop('disabled', true);
    await this.getAllShopByTown();

    if (this.page.townShips.length == 0) return;
    $('#ld-browse-shop').appendTo("body").modal('show');
    $('.ld-browseShop-close').click(() => {
      console.log('close');
    });
    $('.ld-browseShop-save').click(() => {
      console.log('save');
      this.page.selectedShops.forEach(shops => {
        let jun = this.getLoyaltyJun();
        jun.n1 = shops;
        let list = this.loyaltyHeader.junction.filter(j => {
          return j.n1.shopSysKey == (jun.n1 as any).shopSysKey;
        });
        if (list.length == 0) {
          this.loyaltyHeader.junction.push(jun);
        }

      });



    });
  }
  getAllShopByTown() {
    return new Promise<void>(done => {
      let param = {
        "syskey": "",
        "userSyskey": sessionStorage.getItem("usk"),
        "userId": sessionStorage.getItem("uid"),
        "userName": sessionStorage.getItem("uname"),
        "n1": "0",
        "n2": "0",
        "n3": "0",
        "t1": "",
        "t2": "",
        "t3": "",
        "t4": "",
        "volDisDtlDataList": [],
        "volDisShopJuncDataList": []
      };
      let townList;
      const url = this.manager.appConfig.apiurl + 'shop/getAllShopByTown';

      $('.ld-spinner-browseShops').addClass('show');
      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          if (data.message == "SUCCESS") {
            townList = data.dataList;
            townList.sort((a, b) => (a.TownDesc > b.TownDesc) ? 1 : -1);
            for (let i = 0; i < townList.length; i++) {
              townList[i].show = false;
              townList[i].ShopDataList.sort((a, b) => {
                return (a.shopName > b.shopName) ? 1 : -1
              });
              townList[i].ShopDataList.map(s => { s.check = false; })
            }

          }
          this.page.townShips = townList;
          this.page.townShipsFilter = townList;
          $('.ld-spinner-browseShops').removeClass('show');
          $('.ld-btn-browseShops').prop('disabled', false);
          done();

        },
        error => {
          $('.ld-spinner-browseShops').removeClass('show');
          $('.ld-btn-browseShops').prop('disabled', false);
          done();
        }
      );
    })

  }
  selectShops(s) {
    //this.page.selectedShops = [];
    for (let i = 0; i < this.page.townShipsFilter.length; i++) {
      for (let y = 0; y < this.page.townShipsFilter[i].ShopDataList.length; y++) {
        if (this.page.townShipsFilter[i].ShopDataList[y].check &&
          (this.page.selectedShops.indexOf(this.page.townShipsFilter[i].ShopDataList[y]) == -1)) {
          this.page.selectedShops.push(this.page.townShipsFilter[i].ShopDataList[y]);
        } else {
          let index = this.page.selectedShops.indexOf(this.page.townShipsFilter[i].ShopDataList[y]);
          if (index != -1 && !this.page.townShipsFilter[i].ShopDataList[y].check) {
            this.page.selectedShops.splice(index, 1);
          }
        }
      }
    }

  }
  activeHeaderChange(header) {
    const url = this.urlActive + header.syskey + '/' + header.n12;
    $('#spinner-header-active-' + header.syskey).css("display", "block");
    this.http.get(url, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.status == "SUCCESS") {
          this.manager.showToast(this.tostCtrl, "Message", "Success", 1000);
        } else {
          this.manager.showToast(this.tostCtrl, "Message", "Something went wrong!", 1000);
          header.n12 = false;
        }
        $('#spinner-header-active-' + header.syskey).css("display", "none");
      },
      error => {
        $('#spinner-header-active-' + header.syskey).css("display", "none");
      }
    )
  }

  public comparisonRedemptionOrRebateFunction = function (option, value): boolean {
    return option.code === value.code;
  }
  public comparisonOperatorFunction = function (option, value): boolean {
    return option.code === value.code;
  }
  public comparisonGiftLuckyDrawFunction = function (option, value): boolean {
    return option.code === value.code;
  }

  print() {
    this.loading.create({
      message: "Processing..",

      backdropDismiss: false
    }).then(
      el => {
        el.present();
        const url = this.manager.appConfig.apiurl + 'loyalty-discount/exportLoyaltyDiscount';

        let cri_fromDate = "";
        let cri_toDate = "";

        if (this.searchCri.fromDate != "") {
          cri_fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI, this.searchCri.fromDate).toString();
        } else {
          this.searchCri.fromDate = "";
        }

        if (this.searchCri.toDate != "") {
          cri_toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI, this.searchCri.toDate).toString();
        } else {
          this.searchCri.toDate = "";
        }

        let passCri = {
          "t2": this.searchCri.t2,
          "fromDate": this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchCri.fromDate).toString(),
          "toDate": this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchCri.toDate).toString()
        };

        this.http.post(url, passCri, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            if (data.message == "SUCCESS") {
              let data1 = data.dataList;
              let cri_flag = 0;

              let excelTitle = "Loyalty Discount Report";
              let excelHdrHeaderData = [
                "Code", "Name", "Promotion Start Date", "Promotion End Date",
                "Invoice Start Date", "Invoice End Date", "Discount Type", "Status"
              ];
              let excelDtlHeaderData = [
                "Brand Owner", "Operator", "Revenue 1",
                "Revenue 2", "Discount Type", "Discount Percent",
                "Inkind Type", "Inkind Description", "Item Count"
              ];
              let excelShopHeaderData = [
                "Status", "Shop Description"
              ];

              let excelDataList: any = [];
              let excelData: any = [];
              let excelDataList1: any = [];
              let excelData1: any = [];
              let data2 = [];
              for (var exCount = 0; exCount < data1.length; exCount++) {
                excelData = [];
                data1[exCount].promoStartDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].promoStartDate);
                data1[exCount].promoEndDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].promoEndDate);
                data1[exCount].InvStartDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].InvStartDate);
                data1[exCount].InvEndDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].InvEndDate);

                excelData.push(data1[exCount].lytCode);
                excelData.push(data1[exCount].lytName);
                excelData.push(data1[exCount].promoStartDate);
                excelData.push(data1[exCount].promoEndDate);
                excelData.push(data1[exCount].InvStartDate);
                excelData.push(data1[exCount].InvEndDate);
                excelData.push(data1[exCount].disType);
                excelData.push(data1[exCount].lytStatus);

                excelDataList.push(excelData);

                var exCount1;
                excelDataList1 = [];
                data2 = data1[exCount].lytDisDetail;
                for (exCount1 = 0; exCount1 < data2.length; exCount1++) {
                  excelData1 = [];

                  excelData1.push(data2[exCount1].brandOwner);
                  excelData1.push(data2[exCount1].operator);
                  excelData1.push(data2[exCount1].revenue1);
                  excelData1.push(data2[exCount1].revenue2);
                  excelData1.push(data2[exCount1].discountType);
                  excelData1.push(data2[exCount1].discountPercent);
                  excelData1.push(data2[exCount1].inkindType);
                  excelData1.push(data2[exCount1].inkindDesc);
                  excelData1.push(data2[exCount1].itemCount);

                  excelDataList1.push(excelData1);
                }
                excelDataList.push(excelDataList1);

                excelDataList1 = [];
                data2 = data1[exCount].lytShopDetail;
                data2.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
                for (exCount1 = 0; exCount1 < data2.length; exCount1++) {
                  excelData1 = [];
                  if (data2[exCount1].n11.toString() == "1") {
                    data2[exCount1].n11 = "Active";
                  } else if (data2[exCount1].n11.toString() == "0") {
                    data2[exCount1].n11 = "Inactive";
                  }

                  excelData1.push(data2[exCount1].n11);
                  excelData1.push(data2[exCount1].shop.shopName);

                  excelDataList1.push(excelData1);
                }
                excelDataList.push(excelDataList1);
              }

              let workbook = new Workbook();
              let worksheet = workbook.addWorksheet('Loyalty Discount Data');

              let titleRow = worksheet.addRow(["", "", excelTitle]);
              titleRow.font = { bold: true };
              worksheet.addRow([]);

              let criteriaRow;

              if (this.searchCri.fromDate != "" != null && this.searchCri.fromDate != ""
                && this.searchCri.toDate != null && this.searchCri.toDate != "") {
                criteriaRow = worksheet.addRow(["Start Date : " + cri_fromDate + " - End Date : " + cri_toDate]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              } else if (this.searchCri.fromDate != null && this.searchCri.fromDate != "") {
                criteriaRow = worksheet.addRow(["Date : " + cri_fromDate]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if (this.searchCri.t2.toString() != "") {
                criteriaRow = worksheet.addRow(["Promotion Name : " + this.searchCri.t2.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if (cri_flag == 0) {
                criteriaRow = worksheet.addRow(["Search With No Criteria"]);
                criteriaRow.font = { bold: true };
              }
              worksheet.addRow([]);

              let hdrHeaderRow;
              let dtlHeaderRow;
              let shopHeaderRow;
              let tempList;
              for (var i_data = 0; i_data < excelDataList.length; i_data += 3) {
                hdrHeaderRow = worksheet.addRow(excelHdrHeaderData);
                hdrHeaderRow.font = { bold: true };
                worksheet.addRow(excelDataList[i_data]);
                worksheet.addRow([]);

                var i_data1;
                tempList = excelDataList[i_data + 1];
                dtlHeaderRow = worksheet.addRow(excelDtlHeaderData);
                dtlHeaderRow.font = { bold: true };
                for (i_data1 = 0; i_data1 < tempList.length; i_data1++) {
                  worksheet.addRow(tempList[i_data1]);
                }
                worksheet.addRow([]);

                tempList = excelDataList[i_data + 2];
                shopHeaderRow = worksheet.addRow(excelShopHeaderData);
                shopHeaderRow.font = { bold: true };
                for (i_data1 = 0; i_data1 < tempList.length; i_data1++) {
                  worksheet.addRow(tempList[i_data1]);
                }
                worksheet.addRow([]);
                worksheet.addRow([]);
                worksheet.addRow([]);
              }

              workbook.xlsx.writeBuffer().then((data) => {
                let blob = new Blob([data], { type: EXCEL_TYPE });
                FileSaver.saveAs(blob, "Loyalty_Discount_export_" + new Date().getTime() + EXCEL_EXTENSION);
              });
            }
          }
        );
      }
    );
  }
  pageChangedStores(e) {
    this.pagination_stores_config.currentPage = e;
    let currentIndex = (this.pagination_stores_config.currentPage - 1) * this.pagination_stores_config.itemsPerPage;
    this.getStores(currentIndex);

  }
  pageChangedAssignedStores(e) {
    this.pagination_assignedstores_config.currentPage = e;
    let currentIndex = (this.pagination_assignedstores_config.currentPage - 1) * this.pagination_assignedstores_config.itemsPerPage;


  }
  removeStore(myindex: number, s: MyStore){
    const index = this.store_formgroup.get('stores').value.findIndex( (s1:MyStore)=>{
      return s1.shop_syskey ===  s.shop_syskey;
    });
    if(index!==-1){
      this.store_formgroup.get('stores').value[index].check = false;
    }
    try{
      this.assigned_store_formgroup.get('stores').value.splice(myindex,1);
    }catch(e){

    }
    this.pagination_assignedstores_config.totalItems = this.assigned_store_formgroup.get('stores').value.length;
    
  }
  changeCheckedStore(e, s: MyStore) {
    if (!e) {
      const index = this.assigned_store_formgroup.get('stores').value.findIndex((csl: myStoreData) => {
        return csl.shop_syskey === s.shop_syskey
      });
      if (index !== -1) this.assigned_store_formgroup.get('stores').value.splice(index, 1);
      this.pagination_assignedstores_config.totalItems = this.assigned_store_formgroup.get('stores').value.length;
    } else {
      const mystore: MyStore = {
        'no': 0,
        'shop_name': s.shop_name,
        'shop_code': s.shop_code,
        'shop_syskey': s.shop_syskey,
        'shop_address': s.shop_address,
        'check': false,
        'red_reb': 0,
        'active': true,
        'state_syskey': '0',
        'state_name': '',
        'district_syskey': '0',
        'district_name': '',
        'township_syskey': '0',
        'township_name': '',
        'town_syskey': '0',
        'town_name': '',
        'ward_village_name': '',
        'ward_village_syskey': '0',
      }
      this.assigned_store_formgroup.get('stores').value.push(mystore);
      this.pagination_assignedstores_config.totalItems = this.assigned_store_formgroup.get('stores').value.length;
    }
  }
  pageBoundsCorrectionStores(e) {

  }
  pageBoundsCorrectionAssignedStores(e) {

  }
  searchStores(){
    this.getStores(0);
    this.pagination_stores_config.currentPage=1;
  }
  async getStores(current: number) {
    const loading = await this.loading.create({ message: "Retrieving data..", backdropDismiss: false });
    await loading.present();
    let param = {
      data: {
        shopName: this.store_formgroup.get('stores-search').value
      },
      current: current,
      maxrow: this.pagination_stores_config.itemsPerPage
    }
    const url = this.manager.appConfig.apiurl + 'shop/shoplist-cri';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: ResultData<ShopData>) => {
        loading.dismiss();
        if (data.status == 'SUCCESS') {
          this.pagination_stores_config.totalItems = data.totalCount
          this.store_formgroup.get('stores').setValue(
            data.dataList.map((s: ShopData) => {
              const index = this.assigned_store_formgroup.get('stores').value.findIndex( (my:MyStore)=>{
                return my.shop_syskey === s.shopSysKey
              })
              let mystore: MyStore = {
                'no': current++,
                'shop_name': s.shopName,
                'shop_code': s.shopCode,
                'shop_syskey': s.shopSysKey,
                'shop_address': s.address,
                'check': index == -1 ?  false:true,
                'red_reb': 0,
                'active': true,
                'state_syskey': '0',
                'state_name': '',
                'district_syskey': '0',
                'district_name': '',
                'township_syskey': '0',
                'township_name': '',
                'town_syskey': '0',
                'town_name': '',
                'ward_village_name': '',
                'ward_village_syskey': '0',
              }
              return mystore;
            })
          )
        }

      }, error => {
        loading.dismiss();
      }
    )
  }
  clear(){
    this.assigned_store_formgroup.get('stores').setValue([]);
    this.store_formgroup.get('stores').setValue([]);
    this.dropdown = false;
    this.tempShopList = [];
  }

  resetValue() {
    console.log(this.myInputVariable.nativeElement.files);
    this.myInputVariable.nativeElement.value = "";
    console.log(this.myInputVariable.nativeElement.files);
    this.value = "";
    this.shopListFromExcel = [];
  }

  onUpload(event) {
    if(event.target.files.length)
    {
      this.shopListFromExcel = [];
      this.value = "";
      this._shoplistdata = [];
      this.config.totalItems = 0;
      this.config.currentPage = 1;
  
      this.each_sheet_data = this.forjsondata1();
      this.all_sheet_data = this.forjsondata2();
      let excelFileName = event.target.files[0].name;
      let pos = excelFileName.indexOf(".");
      this.uploadedFileName = excelFileName.substring(0, pos);
      this.uploadFile = event.target.files[0];
  
      let reader = new FileReader();
      reader.readAsArrayBuffer(this.uploadFile);
      reader.onload = (event: any) => {
        let data = new Uint8Array(event.target.result);
        let workbook = XLSX.read(data, { type: "array" });
  
        for (let k = 0; k < workbook.SheetNames.length; k++) {
          let first_sheet_name = workbook.SheetNames[k];
          let worksheet = workbook.Sheets[first_sheet_name];
          this.each_sheet_data = XLSX.utils.sheet_to_json(worksheet, {
            raw: true
          });
  
          for (let i = 0; i < this.each_sheet_data.length; i++) {
            // this.each_sheet_data[i].shop_id="+this.each_sheet_data[i].shop_id;
            // this.each_sheet_data[i].shop_id = ('' + this.each_sheet_data[i].shop_id).replace(/\s/g, '');
            if(this.each_sheet_data[i].ShopCode != undefined && this.each_sheet_data[i].ShopCode != null && this.each_sheet_data[i].ShopCode != '') {
              this.value += "'" + this.each_sheet_data[i].ShopCode + "',";
            }
            // this.all_sheet_data.uploadData.push(this.each_sheet_data[i]);
          }
        }
        this.value = this.value.slice(0, -1);
        // this.all_sheet_data.uploadData.splice(0, 1);        
      };
    }else
    {
      this.uploadedFileName = "";
      // this._matllistdata = [];
      // this.config.totalItems = 0;
      // this.config.currentPage = 1;
    } 

  }

  appliedExcelShopData() {
    this.loading.create({
      message: 'Please wait...'
    }).then(loadEl => {
      loadEl.present();
      if(this.value != "" && this.value !=undefined && this.value != null) {
        let current = 0 ;
        var param = {
          // "syskey": this.saveData.syskey,
          data: {
            "shopCode": this.value 
          },
          current: current,
          maxrow: this.pagination_stores_config.itemsPerPage
        };
        // var url = this.manager.appConfig.apiurl + "PromoAndDiscount/parepareShopDataFromExcel"
        const url = this.manager.appConfig.apiurl + 'shop/shoplist-cri';
        // this.http.post(url, param, this.manager.getOptions()).subscribe(
        //   (data:any) => {
        //     if(data.length > 0) {
        //       this.shopListFromExcel = data;
        //       this.changeCheckedStore(true,this.shopListFromExcel);
        //       // for(let i = 0; i < this.shopListFromExcel.length; i++){
        //       //   let sameShopCheck = false;
        //       //   // sameShopCheck = this.saveData.promoAndDisJunDataList.some(
        //       //   //   tempShopData => tempShopData.n2 == this.shopListFromExcel[i].n2
        //       //   // );
  
        //       //   if(sameShopCheck == false){
        //       //     // this.tempSaveData.promoAndDisJunDataList.push(this.shopListFromExcel[i]);
        //       //   }
        //       // }
        //       // if(this.tempSaveData.promoAndDisJunDataList.length > 0) { //  volDisShopJuncDataList
        //       //   this.addShop();
        //       // } else {
        //       //   this.manager.showToast(this.tostCtrl, "Message", "Already Added", 2000);
        //       // }
        //       this.resetValue();
        //       loadEl.dismiss();
        //       console.log(data);
        //     } else {
        //       loadEl.dismiss();
        //       this.manager.showToast(this.tostCtrl, "No applied shop!", "", 2000);
        //     }
        // }, error => {
        //   loadEl.dismiss();
        //   console.log(error);
        // }
        // );
        this.http.post(url, param, this.manager.getOptions()).subscribe(
          (data: ResultData<ShopData>) => {
            // loading.dismiss();
            if (data.status == 'SUCCESS') {
              loadEl.dismiss();
              this.resetValue();
              this.pagination_stores_config.totalItems = data.totalCount
              this.assigned_store_formgroup.get('stores').setValue(
                data.dataList.map((s: ShopData) => {
                  const index = this.assigned_store_formgroup.get('stores').value.findIndex( (my:MyStore)=>{
                    return my.shop_syskey === s.shopSysKey
                  })
                  let mystore: MyStore = {
                    // 'no': current++,
                    // 'shop_name': s.shopName,
                    // 'shop_code': s.shopCode,
                    // 'shop_syskey': s.shopSysKey,
                    // 'shop_address': s.address,
                    // 'check': index == -1 ?  false:true,
                    // 'red_reb': 0,
                    // 'active': true,
                    // 'state_syskey': '0',
                    // 'state_name': '',
                    // 'district_syskey': '0',
                    // 'district_name': '',
                    // 'township_syskey': '0',
                    // 'township_name': '',
                    // 'town_syskey': '0',
                    // 'town_name': '',
                    // 'ward_village_name': '',
                    // 'ward_village_syskey': '0',

                    'no': 0,
        'shop_name': s.shopName,
        'shop_code': s.shopCode,
        'shop_syskey': s.shopSysKey,
        'shop_address': s.address,
        'check': false,
        'red_reb': 0,
        'active': true,
        'state_syskey': '0',
        'state_name': '',
        'district_syskey': '0',
        'district_name': '',
        'township_syskey': '0',
        'township_name': '',
        'town_syskey': '0',
        'town_name': '',
        'ward_village_name': '',
        'ward_village_syskey': '0',
                  }
                  return mystore;
                })
              )
            }
    
          }, error => {
          loadEl.dismiss();
          console.log(error);
          }
        )
      } else {
        loadEl.dismiss();
        this.manager.showToast(this.tostCtrl, "Message", "Please Choose File!", 2000);
      }
    })
  }

  forjsondata1() {
    return {
      "SHOP_CODE": "",
      "SHOP_DESC": ""
    };
  }

  forjsondata2() {
    return {
      uploadData: [
        {
          "SHOP_CODE": "",
          "SHOP_DESC": ""
        }
      ]
    };
  }

  shopTabClick() {
    this.importload = "";
  }

  getShopListPageChangeData(){
    return {
      "shopDesc": "",
      "townDesc": "",
      "townshipSyskey": "",
      "maxRow": this.shopListItemPerPage,
      "current": "0"
    };
  }
  searchTownship(){
    this.tsLoadingFlag = true;
    const url = this.manager.appConfig.apiurl +'township/getAllTownshipForDis';

    this.tempSearchCri.shopDesc = this.tempSearch.shopDesc;
    this.tempSearchCri.townDesc = this.tempSearch.townDesc;

    this.http.post(url, this.tempSearchCri, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.townList = data.dataList;
          this.townList.sort((a, b) => (a.TownDesc > b.TownDesc) ? 1 : -1);

          this.townList.map(
            data => {
              data.shopSearchFlag = false;
              data.shopListConfig = {
                itemsPerPage: this.shopListItemPerPage,
                currentPage: 1,
                totalItems: 0,
                id: data.TownSyskey.toString(),
                panelExpanded: false
              };
            }
          );
        }
        this.tsLoadingFlag = false;
      }
    );
  }
  openPanel(tsList){
    if(!tsList.shopSearchFlag){
      this.searchShop("0", 1, tsList.TownSyskey);
      tsList.shopSearchFlag = true;
    }
  }
  searchShop(curIndex, curPage, tsSyskey){    //    if curPage > 0, it's called from shopListPageChange
    this.tempSearchCri.current = curIndex;

    if(curPage > 0){
      const url = this.manager.appConfig.apiurl +'shop/getAllShopByTownSK';
      this.tempSearchCri.townshipSyskey = tsSyskey;

      this.http.post(url, this.tempSearchCri, this.manager.getOptions()).subscribe(
        (data:any) =>{
          if(data.message == "SUCCESS"){
            // let configId = "";
  
            for(let i = 0; i < this.townList.length; i++){
              if(this.townList[i].TownSyskey == tsSyskey){
                this.townList[i].ShopDataList = data.dataList;
                this.townList[i].ShopDataList.sort((a, b) => (a.shopName > b.shopName) ? 1 : -1);
                this.townList[i].ShopDataList.map(
                  data => {
                    data.checkFlag = false;
                  }
                );
  
                // configId = "shopConfig" + i;
                this.townList[i].shopListConfig = {
                  itemsPerPage: this.shopListItemPerPage,
                  currentPage: curPage,
                  totalItems: data.Count,
                  id: this.townList[i].TownSyskey.toString(), //  configId
                  panelExpanded: false
                };

                this.checkedSelectedShop(true, this.townList[i].ShopDataList);
              }
            }
          }
        }
      );
    } else {
      const url = this.manager.appConfig.apiurl +'shop/getAllShopByTown';
      this.tempSearchCri.shopDesc = this.tempSearch.shopDesc;
      this.tempSearchCri.townDesc = this.tempSearch.townDesc;
      this.tempSearchCri.townshipSyskey = "";

      this.http.post(url, this.tempSearchCri, this.manager.getOptions()).subscribe(
        (data:any) =>{
          if(data.message == "SUCCESS"){
            // let configId = "";
            this.townList = data.dataList;
            this.townList.sort((a, b) => (a.TownDesc > b.TownDesc) ? 1 : -1);
  
            for(let i = 0; i < this.townList.length; i++){
              this.townList[i].ShopDataList.sort((a, b) => (a.shopName > b.shopName) ? 1 : -1);
              this.townList[i].ShopDataList.map(
                data => {
                  data.checkFlag = false;
                }
              );
  
              // configId = "shopConfig" + i;
              this.townList[i].shopListConfig = {
                itemsPerPage: this.shopListItemPerPage,
                currentPage: 1,
                totalItems: this.townList[i].Count,
                id: this.townList[i].TownSyskey.toString(), //  configId
                panelExpanded: false
              };

              this.checkedSelectedShop(false, this.townList[i].ShopDataList);
            }
          }
        }
      );
    }
  }
  checkedSelectedShop(pageChangeFlag, passShopList){
    // for(let i = 0; i < passShopList.length; i++){
    //   this.tempSaveData.volDisShopJuncDataList.map(
    //     data => {
    //       if(data.n2 == passShopList[i].shopSysKey){
    //         passShopList[i].checkFlag = true;
    //       }
    //     }
    //   );
    // }
  }
  getVolDisJunDataList(){
    return {
      "syskey": "",
      "n1": "0",
      "n2": "0",
      "n3": "0",
      "t1": "",
      "t2": "",
      "t3": "",
      "t4": "",
      "townSyskey": "",
      "recordStatus": "",
      "shopCode": "",
      "address": "",
      "red_reb": 0,
      "active": true,
    };
  }
  getSaveData(){
    return {
      "syskey": "",
      "userSyskey": sessionStorage.getItem("usk"),
      "userId": sessionStorage.getItem("uid"),
      "userName": sessionStorage.getItem("uname"),
      "n1": "0",
      "n2": "0",
      "n3": "0",
      "t1": "",
      "t2": "",
      "t3": "",
      "t4": "",
      "volDisDtlDataList": [],
      "volDisShopJuncDataList": [],
      "changesAndNewShopList": []
    };
  }
  
  selectShop(e, townshipData, storeData, allFlag){  //  townshipData = tsIndex, storeData = shopIndex
    let returnTempData = this.getVolDisJunDataList();
    let found = false;
    // let cbid = "";

    if(e.currentTarget.checked){
      for(let i = 0; i < this.saveData.volDisShopJuncDataList.length; i++){
        if(this.saveData.volDisShopJuncDataList[i].n2 == storeData.shopSysKey){
          found = true;
          break;
        }
      }
  
      if(found == false){
        returnTempData.syskey = "";
        returnTempData.n1 = this.saveData.syskey;
        returnTempData.n2 = storeData.shopSysKey;  //  this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey;
        returnTempData.n3 = "1";
        returnTempData.t1 = "";
        returnTempData.t2 = storeData.shopName;  //  this.townList[tsIndex].ShopDataList[shopIndex].shopName;
        returnTempData.t3 = "";
        returnTempData.t4 = "";
        returnTempData.recordStatus = "1";
        returnTempData.townSyskey = townshipData.TownSyskey;  //  this.townList[tsIndex].TownSyskey;
        returnTempData.shopCode = storeData.shopCode;  //  this.townList[tsIndex].ShopDataList[shopIndex].shopCode;
        returnTempData.address = storeData.address;  // this.townList[tsIndex].ShopDataList[shopIndex].address;
  
        this.tempSaveData.volDisShopJuncDataList.push(returnTempData);

        // cbid = "#townCb" + tsIndex + "and" + shopIndex;
        // cbid = "#" + this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey + "";
        // $(cbid).prop('checked', true);
  
        if(allFlag){
          this.townList.map(
            data => {
              if(data.TownSyskey == townshipData.TownSyskey){
                data.ShopDataList.map(
                  shopdata => {
                    if(shopdata.shopSysKey == storeData.shopSysKey){
                      shopdata.checkFlag = true;
                    }
                  }
                );
              }
            }
          );
        }
      } else {
        // cbid = "#townCb" + tsIndex + "and" + shopIndex;
        // cbid = "#" + this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey + "";
        // $(cbid).prop('checked', false);

        if(!allFlag){
          // storeData.checkFlag = false;

          let cbid = "#" + storeData.shopSysKey + "";
          $(cbid).prop('checked', false);

          this.manager.showToast(this.tostCtrl, "Message", "Already Added", 2000);
        }
      }
    } else {
      for(let i = 0; i < this.tempSaveData.volDisShopJuncDataList.length; i++){
        if(this.tempSaveData.volDisShopJuncDataList[i].n2 == storeData.shopSysKey){
          // cbid = "#townCb" + tsIndex + "and" + shopIndex;
          // cbid = "#" + this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey + "";
          // $(cbid).prop('checked', false);

          if(allFlag){
            this.townList.map(
              data => {
                if(data.TownSyskey == townshipData.TownSyskey){
                  data.ShopDataList.map(
                    shopdata => {
                      shopdata.checkFlag = false;
                    }
                  );
                }
              }
            );
          }

          this.tempSaveData.volDisShopJuncDataList.splice(i, 1);
          break;
        }
      }
    }
  }

  searchAppliedShop(e){
    let searchValue = e.target.value.toString().toLowerCase();
    this.config1.currentPage = 1;

    this.searchAppliedShop1(searchValue);
  }
  searchAppliedShop1(searchValue){
    this.tempShopList = this.saveData.volDisShopJuncDataList.filter(
      shopList => {
        return shopList.t2.toLowerCase().includes(searchValue);
      }
    );
  }
  assignedShopListPageChanged(e){
    this.config1.currentPage = e;
  }
  addShop(){
    let cbid = "";

    // if(this.saveDataDates.fromDate == ""){
    //   this.manager.showToast(this.tostCtrl, "Message", "Add From Date", 2000);
    // } else if(this.saveDataDates.toDate == ""){
    //   this.manager.showToast(this.tostCtrl, "Message", "Add To Date", 2000);
    // } else {

    if(this.tempSaveData.volDisShopJuncDataList.length > 0){
      this.tsLoadingFlag = true;

      for(let i = 0; i < this.tempSaveData.volDisShopJuncDataList.length; i++){
        for(let j = 0; j < this.townList.length; j++){
          if(this.tempSaveData.volDisShopJuncDataList[i].townSyskey == this.townList[j].TownSyskey){
            /*
            cbid = "#townCombo" + j + "";

            for(let k = 0; k < this.townList[j].ShopDataList.length; k++){
              if(this.tempSaveData.volDisShopJuncDataList[i].n2 == this.townList[j].ShopDataList[k].shopSysKey){
                this.townList[j].ShopDataList.splice(k, 1);
                break;
              }
            }
            */

            cbid = "#" + this.townList[j].TownSyskey + "";
            $(cbid).prop('checked', false);

            this.townList[j].ShopDataList.map(
              data => {
                if(data.shopSysKey == this.tempSaveData.volDisShopJuncDataList[i].n2){
                  data.checkFlag = false;
                }
              }
            );

            break;
          }
        }

        let returnTempData = this.getVolDisJunDataList();
        returnTempData.syskey = "";
        returnTempData.n1 = this.tempSaveData.volDisShopJuncDataList[i].n1;
        returnTempData.n2 = this.tempSaveData.volDisShopJuncDataList[i].n2;
        returnTempData.n3 = this.tempSaveData.volDisShopJuncDataList[i].n3;
        returnTempData.t1 = "";
        returnTempData.t2 = this.tempSaveData.volDisShopJuncDataList[i].t2;
        // returnTempData.t3 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.saveDataDates.fromDate).toString();
        // returnTempData.t4 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.saveDataDates.toDate).toString();
        returnTempData.t3 = "";
        returnTempData.t4 = "";
        returnTempData.recordStatus = this.tempSaveData.volDisShopJuncDataList[i].recordStatus;
        returnTempData.townSyskey = this.tempSaveData.volDisShopJuncDataList[i].townSyskey;
        returnTempData.shopCode = this.tempSaveData.volDisShopJuncDataList[i].shopCode;
        returnTempData.address = this.tempSaveData.volDisShopJuncDataList[i].address;
        returnTempData.red_reb = 0;
        returnTempData.active = true;
        
        this.saveData.volDisShopJuncDataList.push(returnTempData);
        this.saveData.changesAndNewShopList.push(returnTempData);
        this.tempShopList.push(returnTempData);
        // this.saveData.volDisShopJuncDataList.push(this.tempSaveData.volDisShopJuncDataList[i]);
      }
  
      this.saveData.volDisShopJuncDataList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
      this.tempShopList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
      this.searchAppliedShop1("");

      this.tempSaveData.volDisShopJuncDataList.splice(0, this.tempSaveData.volDisShopJuncDataList.length);

      $("#searchBoxAS").val("");

      // this.saveDataDates.fromDate = "";
      // this.saveDataDates.toDate = "";

      this.tsLoadingFlag = false;
    } else {
      this.manager.showToast(this.tostCtrl, "Message", "Choose some shops", 2000);
    }

    // }
  }

  selectTown(e, tsSyskey){  //  tsSyskey = tsIndex
    const url = this.manager.appConfig.apiurl +'shop/getAllShopByTownSK';
    let param = {
      "townshipSyskey": tsSyskey.toString(),
      "TownSyskey": tsSyskey.toString(),
      "shopDesc": this.tempSearch.shopDesc.toString()
    };
    let tempFlag = e.currentTarget.checked;

    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          let shopList = data.dataList;
          let sameShopCheck = false;
          this.tempE.currentTarget.checked = tempFlag;

          if(this.tempE.currentTarget.checked){
            for(let i = 0; i < shopList.length; i++){
              sameShopCheck = this.tempSaveData.volDisShopJuncDataList.some(
                tempShopData => tempShopData.n2 == shopList[i].shopSysKey
              );

              if(sameShopCheck == false){
                this.selectShop(this.tempE, param, shopList[i], true);
              }
            }
          } else {
            for(let i = 0; i < shopList.length; i++){
              this.selectShop(this.tempE, param, shopList[i], true);
            }
          }
        }
      }
    );
  }

  removeShop(e, index){

    for(let j = 0; j < this.saveData.volDisShopJuncDataList.length; j++){
      if(this.saveData.volDisShopJuncDataList[j].n2 == this.tempShopList[index].n2){
        this.saveData.volDisShopJuncDataList.splice(j, 1);
        break;
      }
    }

    for(let j = 0; j < this.saveData.changesAndNewShopList.length; j++){
      if(this.saveData.changesAndNewShopList[j].n2 == this.tempShopList[index].n2){
        this.saveData.changesAndNewShopList.splice(j, 1);
        break;
      }
    }

    this.tempShopList.splice(index, 1);
  }

  shopListPageChanged(e, townshipInfo){
    townshipInfo.shopListConfig.currentPage = e;

    let currentIndex = (townshipInfo.shopListConfig.currentPage - 1) * townshipInfo.shopListConfig.itemsPerPage;
    this.searchShop(currentIndex.toString(), townshipInfo.shopListConfig.currentPage, townshipInfo.TownSyskey);
  }

}