import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient } from '@angular/common/http';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { AppComponent } from '../app.component';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Form, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete, MatSelectionList } from '@angular/material';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DeliveryListByBrandOwner, DIL001, SaleOrderReturnData, SaleOrderSearchData, searchOrderCri } from './interface';
import { Subscription } from 'rxjs';
import { window } from 'rxjs/operators';
import { unescapeIdentifier } from '@angular/compiler';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $: any;
var date = new Date();
@Component({
  selector: 'app-delievery-order',
  templateUrl: './delievery-order.page.html',
  styleUrls: ['./delievery-order.page.scss'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ opacity: 0 }),
            animate('0.5s ease-out',
              style({ opacity: 1 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ height: 300, opacity: 1 }),
            animate('0.2s ease-in',
              style({ height: 0, opacity: 0 }))
          ]
        )
      ],

    ),
    trigger('openClose', [
      // ...
      state('open', style({
        height: '200px',
        opacity: 1,

      })),
      state('closed', style({
        height: '100px',
        opacity: 0.5,

      })),
      transition('open => closed', [
        animate('1s')
      ]),
      transition('closed => open', [
        animate('0.5s')
      ]),
    ]),
  ]
})
export class DelieveryOrderPage implements OnInit {
  @ViewChild("invoiceDialog", { static: false }) invoiceDialog: TemplateRef<any>;
  @ViewChild("expiredStock", { static: false }) expireStockList: MatSelectionList;
  @ViewChild("criShopAutoComplete", { static: false })  cri_shop_autocomplete: MatAutocomplete;
  adminPannel = {
    isAdmin: false,
    isHide: true
  }
  config = {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  button = {
    void: true,
    save: true,
    invoice_badge: true,
    datechange: {
      access: true,
      show: true,
      get: (): boolean => {
        if (this.button.datechange.access && this.button.datechange.show) {
          return true;
        } else return false;
      }
    }
  }

  searchtab: boolean = false;
  btn: boolean = false;
  spinner: boolean = false;
  showOnlySelected: boolean = false;
  tran_status: any = [
    { code: 0, desc: "-" },
    { code: 6, desc: "Void" },
    { code: 128, desc: "Paid" }];
  orderType: any = [
    { code: this.manager.tranType.SaleOrder.code, desc: "Sale Order" },
    { code: this.manager.tranType.DeliveryOrder.code, desc: "Delivery Order" }];
  currentType: number = 1;
  amountStatus: any = [
    { code: 0, desc: "-" },
    { code: 1, desc: "equal" },
    { code: 20, desc: "greater than" },
    { code: 21, desc: "greater than & equal" },
    { code: 30, desc: "less than" },
    { code: 31, desc: "less than & equal" }
  ]
  isSo: boolean = true;
  orderDate: Date = new Date();
  obj: any;
  shoplist: any = [];
  soShop: any = this.getSoShopDetail();
  bolist: any = [];
  userlist: any = [];
  solist: any = [];
  skulist: any = [];
  emptyBOTList: any = [];
  orderNewSkuIndex: any = []
  orderDetailDistinctSkuList = [];
  sop002: any = [];
  sop003: any = [];
  sop003_original: any = [];
  finalSop001: any = this.getFinalSop001();
  removeSku: any = [];
  soObj: any = this.getSoObj();
  returnPriceRto: number = 10;
  shopObj: any = "";
  serverObj: any = this.getSoObj();
  myOrderObj: any = this.getMyOrderObj();
  advSearchObjTmp: any = this.searchObjTmp();
  minDate: any;
  maxDate: any = new Date();
  baseImg = '';
  skus: any = [];
  tab_flag = "Sale";
  redflag_report: boolean = false;
  redflag_dtlid: string = "";
  dateflag = {
    DB: 1,
    UI: 2
  };
  shopNameSearch: FormControl = new FormControl();
  shopNameSearchCri : FormControl = new FormControl();
  shopNameSearchCri_shopList = [];
  saveReturnStatus: number = 0;
  priceZone : any = [];
  expireSku = this.getExpiredSkuObj();
  newDelSearchFromGroup: FormGroup;
  newDelFormGroup: FormGroup;
  shopAddress :any;
  deciPlaceSetting: any = this.getDeciPlaceSetting();

  /* subscription list */
  delListByBoSubscription: Subscription;
  shopNameSearchAutoFillSubscription: Subscription;
  shopCodeSearchAutoFillSubscription: Subscription;
  stockListSubscriptin: Subscription;

  config2 = {
    id: 'config2',
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  restrictDates: any = {
    "isDisable": true,
    "startDate": "",
    "endDate": ""
  }

  // disableShop: boolean = true;
  stateList: any = [];
  districtList: any = [];
  townshipList: any = [];
  isUseEmptyBOT: boolean = false;
  salesTypeList: any = [];
  isUseSAP: boolean = false;
  isUseDisplayDeciPlace: boolean = false;

  backDate: any = false;
  townshipSyskey: any;
  allowBackDate: boolean = false;
  savebtnDisable: boolean = false;
  saleTypeDisable: boolean = false;

  constructor(
    private alertCtrl: AlertController,
    private loadCtrl: LoadingController,
    public manager: ControllerService,
    private http: HttpClient,
    private tostCtrl: ToastController,
    private router: Router,
    public activatedRoute: ActivatedRoute,
    public mat_dialog: MatDialog,
    public app: AppComponent) {
    this.advanceSearch(false)
  }

  ngOnInit() {
    this.newDeliveryEntry();
    this.getBtnAccess();
  }
  userRight() {
    const menu = this.manager.user.rightMenus.find(m => { return m.menu == 'deliveryorder' });
    if (menu !== undefined) {
      const btns: any = menu.btns;
      this.button.datechange.access = (btns.findIndex(b => { return b.menu == 'change date' }) !== -1) ? true : false
    }
  }
  useEmptyBOTFeature()
  {
    const url = this.manager.appConfig.apiurl + 'config/useEmptyBOTFeature';
    this.http.get(url, this.manager.getOptions()).subscribe(
      (data: any) => {
        if(data.message == 'SUCCESS'){
          if(data.isUseEmptyBOT == '1'){  //this.manager.settingData.n9 == '1'
            $("#getReturnSKU").addClass('mr1');
            this.isUseEmptyBOT = true ;
          }else{
            $("#getReturnSKU").addClass('mr3');
            this.isUseEmptyBOT = false ;
          }
        }else{
          $("#getReturnSKU").addClass('mr3');
          this.isUseEmptyBOT = false ;
        }
      },
      (error: any) => {
      }
    )

  }
  ionViewWillEnter() {
    this.adminPannel.isAdmin = this.manager.user.userId === 'admin' ? true : false;
    this.manager.isLoginUser();
    this.userRight();
    this.useEmptyBOTFeature();
    $('#delordlist-tab').tab('show');
    this.reset(false);
    this.btn = false;
    this.solist = [];
    this.backDate = false;
    this.currentType = this.manager.tranType.DeliveryOrder.code;
    this.main();
    this.isUseSAP = this.manager.settingData.n8 == '1' ? true : false;
    this.deciPlaceSetting.isUseDisplayDeciPlace = this.manager.settingData.n17 == 1 ? true : false;
    this.deciPlaceSetting.isUseDisplayDeciPlace ? this.deciPlaceSetting.displayDeciPlace = this.manager.settingData.n18 : this.deciPlaceSetting.displayDeciPlace =0;
    this.deciPlaceSetting.isUseCalcDeciPlace = this.manager.settingData.n19 == 1 ? true : false;
    this.deciPlaceSetting.isUseCalcDeciPlace ? this.deciPlaceSetting.calcDeciPlace = this.manager.settingData.n20 : this.deciPlaceSetting.calcDeciPlace = 0;

    $("#delisalesblock").hide();
    this.getRestrictDate();
    if(this.isUseSAP){
      this.getSalesTypeList();
    }
    this.savebtnDisable = false;
  }
  async main() {
    this.runSpinner(true);
    this.getDeliveryOrderListByBo(0, true).then(
      el => {
        this.runSpinner(false);
        this.getShopListForAutoComplete();
      }
    ).catch(error => {
      this.runSpinner(false);
      this.manager.showToast(this.tostCtrl, "Message", "Server Not Responding!", 1000);
    })

  }
  reset(isAfterSave?) {
    this.soObj = this.getSoObj();
    this.shopObj = "";
    this.soShop = this.getSoShopDetail();
    this.searchtab = false;
    this.myOrderObj = this.getMyOrderObj();
    //  this.advSearchObjTmp = this.searchObjTmp();
    this.removeSku = [];
    this.sop002 = [];
    this.sop003 = [];
    this.orderDetailDistinctSkuList = [];
    if (!isAfterSave) {
      this.solist = [];
      this.advSearchObjTmp = this.searchObjTmp();
      this.advSearchObjTmp.dateOptions = "today";
      this.dateOptionsChange();
    }

    this.baseImg = this.manager.appConfig.imgurl;
    this.orderNewSkuIndex = [];
    this.searchtab = false;
    this.redflag_report = false;
    this.saveReturnStatus = 0;
    this.expireSku = this.getExpiredSkuObj();


  }
  runSpinner(t: boolean) {
    this.spinner = t;
  }
  buttonControl(save: boolean, voidbtn: boolean, invoice_badge: boolean, datechange: boolean) {
    this.button.save = save;
    this.button.void = voidbtn;
    this.button.invoice_badge = invoice_badge,
      this.button.datechange.show = datechange
  }
  /* obj model start*/

  getExpiredSkuObj(def?) {
    return {
      expireSku: [],
      param: {
        "count": def ? def.count : 0,
        "brandownerSyskey": def ? def.brandownerSyskey : "0",
        "date": def ? def.date : "",
        "storeSyskey": def ? def.storeSyskey : "0",
        "index": -1
      }
    };
  }
  getFinalSop001() {
    return {
      sop003: []
    }
  }
  searchObjTmp() {
    return {
      adv_status: 0,
      adv_shopsyskey: "",
      adv_fromDate: "",
      adv_toDate: "",
      adv_brandOwnerSyskey: "",
      adv_usersyskey: "",
      adv_totalAmount: 0.0,
      adv_amountStatus: 0,
      activeStatus: 0,
      saveStatus: 0,
      current: 0,
      adv_syskey: "",
      currentNew: "",
      maxRow: "",
      dateOptions: "0"

    };
  }

  searchObj() {
    return {
      fromDate: "",
      toDate: "",
      usersyskey: "",
      saveStatus: 0,
      activeStatus: "",
      recordStatus: 0,
      brandOwnerSyskey: "",
      totalAmount: 0.0,
      amountStatus: 0,
      tranId: "",
      headerSyskey: "",
      userType: 0,
      shopsyskey: "",
      current: 0,
      maxrow: 0,
      dilAmount: 0.0,
      dilAmountStatus: 0
    };
  }
  getSoObj() {
    return {
      shopname: "",
      autokey: "",
      createddate: "",
      modifieddate: "",
      createdtime: "",
      n1: "",
      n4: 0,
      n5: 0,
      // oldN5: 0,
      n6: 0,
      n7: 0,
      n11: "",
      n12: 0,
      n13: 0,
      n14: 0,
      n21: '',
      n55: "",
      recordStatus: 1,
      saveStatus: 1,
      syskey: "",
      t1: "",
      t4: "",
      sop003: [],
      transType: 0,
      userid: "",
      username: "",
      dilsyskey: "0",
      t34: "Z215"
    }
  }
  getMyOrderObj() {
    return {
      brandOwner: [],
      total: 0.0
    }
  }
  getMyDtlObj() {
    return {
      code: "",
      name: "",
      price: 0.0,
      total: 0,

      t2: "",
      t3: "",
      t6: "",
      n1: "0",
      n2: "",
      n3: "",
      n6: 0,
      n7: "",
      n8: 0,
      n9: 0,
      n10: 0.0,
      n11: 0.0,
      n12: 0.0,
      n13: 0.0,
      n14: 0.0,
      n23: 0,

      n34: 0,
      n35: "0",
      n36: 0,
      n37: 0,
      n40: 0,
      n41: 0,
      n4: "0",
      redflag: false,
      normal: this.getDetailSkuObj(),
      return: this.getDetailSkuObj(),
      brandowner: {
        syskey: "",
        t1: "",
        t2: "",
        total: 0.0
      },

    }
  }
  getDetailSkuObj() {
    return {
      syskey: "",
      status: false,
      recordStatus: 4,
      n10: 0,
      n11: 0.0,
      n12: 0.0,
      n13: 0.0,
      n14: 0.0,
      n6: 0,
      n34: 0,
      stockPromotionDetailData: []
    }
  }
  getBrandOwnerObj(): BrandOwner_ui {
    return {
      autokey: "0",
      createddate: "",
      n1: "",
      n5: 0,
      n6: 0,
      n7: 0,
      n8: 0,
      n9: 0,
      n11: "0",
      n12: 0,
      n14: 0,
      syskey: "",
      t1: "",
      t4: "",
      t5: "",
      transDetailsData: [],
      skuOrderType: {
        "order": [],
        "return": [],
        "promotion": []
      },
      transType: 211,
      userid: "",
      username: "",
      normalSkuTotalAmount: 0,
      returnSkuTotalAmount: 0,
      total100Percent: 0.0,
      specialDiscount: 0.0,
      invDiscount: 0.0,
      hide: false,
      recordStatus: 4,
      n31: 0.0,
      n32: 0.0,
      n33: 0.0,
      n34: 0.0,
      n35: 0.0,
      n36: 0.0,
      n37: 0.0,
      n38: 0.0,
      promotionList: []
    }
  }
  getStockObj() {
    return {
      stock: '',
      qty: 1,
      price: 1.0,
      total: 1.0,
      order: false,
      returnSKU: false
    }
  }
  getSoShopDetail() {
    return {
      shopSysKey: "0",
      shopName: "",
      shopCode: "",
      latitude: "",
      longitude: "",
      address: "",
      phno: "",
      email: "",
      personName: "",
      zoneSyskey: "0",
      crdLimitAmt: 0
    }
  }
  getDeciPlaceSetting() {
    return {
      isUseDisplayDeciPlace: false,
      displayDeciPlace: 0,
      isUseCalcDeciPlace: false,
      calcDeciPlace: 0
    }
  }

  getHeaderObj() {
    return { "syskey": "", "createddate": "","createdtime": "", "modifieddate": "", "userid": "", "username": "", "saveStatus": 1, "recordStatus": 1, "transType": 0, "t4": "", "t1": "", "t5": "", "n1": "", "n4": 1, "n5": 0, "n6": 0, "n7": 0, "n11": "0", "n12": 1, "n14": 0, "n21": '', "n55": "0", "sop003": [], "t34":"" }
  }
  getSop003Obj(): Sop003 {
    return { 'autokey': "0", 'recordStatus': 1, 'modifieddate': "", 'n1': "", 'n5': 0, 'n6': 0, 'n7': 0, 'n8': 0, 'n9': 0, 'n11': "0", 'n12': 0, 'n14': 0, 'n31': 0.0, 'n32': 0.0, 'n33': 0.0, 'n34': 0.0, 'n35': 0.0, 'n36': 0.0, 'n37': 0.0, 'n38': 0.0, 'syskey': "", 't1': "", 't5': "", 'transDetailsData': [], 'transType': 0, 'userid': "", 'username': "", 'promotionList': [] }
  }
  _dil001(): DIL001 {
    return { "syskey": "0", "autokey": "0", "createddate": "", "modifieddate": "", "userid": "0", "username": "", "territorycode": "0", "salescode": "0", "projectcode": "0", "ref1": "0", "ref2": "0", "ref3": "0", "ref4": "0", "ref5": "0", "ref6": "0", "saveStatus": 0, "recordStatus": 0, "syncStatus": 0, "syncBatch": "", "transType": 0, "t1": "", "t2": "", "t3": "", "t4": "", "t5": "", "t6": "", "t7": "", "t8": "", "t9": "", "t10": "", "t11": "", "n1": "0", "n2": "0", "n3": "0", "n4": 0.0, "n5": 0.0, "n6": 0.0, "n7": 0.0, "n8": 0.0, "n9": 0.0, "n10": 0.0, "n11": "0", "n12": 0.0, "n13": 0, "n14": 0.0, "n15": 0.0, "n16": "0", "n17": 0, "n18": 0, "n19": 0, "n20": 0, "n21": "0", "n22": "0", "n23": "0", "n24": "0", "n25": "0", "n26": "0", "n27": "0", "n28": "0", "n29": "0", "t12": "", "t13": "", "t14": "", "t15": "", "t16": "", "t17": "", "t18": "", "n30": 0, "userSysKey": "0", "n31": 0.0, "n32": 0.0, "n33": 0.0, "n34": 0.0, "n35": 0.0, "n36": 0.0, "n37": 0.0, "n38": 0.0, "n39": 0.0, "n40": 0.0, "n41": 0.0, "n42": 0.0, "n43": 0.0, "n44": 0.0, "n45": 0.0, "n46": 0.0, "n47": 0.0, "t19": "", "t20": "", "t21": "", "t22": "", "t23": "", "t24": "", "t25": "", "t26": "", "t27": "", "t28": "", "t29": "", "t30": "", "t31": "", "t32": "", "t33": "", "n48": 0, "n49": 0, "n50": 0, "n51": 0, "n52": 0, "n53": "0", "n54": "0", "n55": "0", "n56": "0", "n57": "0", "t34": "", "t35": "", "t36": "", "t37": "", "t38": "", "t39": "", "t40": "", "t41": "", "t42": "", "t43": "", "t44": "", "t45": "", "t46": "", "customerCode": "", "customerName": "", "createdtime": "", "modifiedtime": "", "transactionID": "0", "glTransID": "0", "crossJunParent": "", "crossJunChild": "", "categoryCode": "", "userType": "", "shopname": "", "dilsyskey": "0", "dilTotalAmount": 0.0, "invsyskey": "0", "invTotalAmount": 0.0, "sop003": [], "deletedTransDetails": [] }

  }

  /* obj model end*/
  async launchStockModal() {
    // if (this.soObj.saveStatus !== 128) {
    //   return;
    // }
    $('#skuaddmodal2').appendTo("body").modal('show');
    this.orderNewSkuIndex = [];
    $('#stock-progressbar2').show();
    $('#stockaddtbl2').hide();
    $('.skulist-btnbar').hide();
    $('.searching-stock-icon2').show();
    this.getStockList().then(
      ok => {
        $('.searching-stock-icon2').hide();
        $('#stock-progressbar2').hide();
        $('#stockaddtbl2').show();
        $('.skulist-btnbar').show();
      }
    ).catch(
      error => {
        this.manager.showToast(this.tostCtrl, "Message", "Server Not Responding!\n Try to reload the page.", 1000).then(
          el => {
            $('#skuaddmodal2').appendTo("body").modal('hide');
          }
        )
      }
    )


  }
  getStockList() {
    return new Promise<void>((promise, reject) => {
      const url = this.manager.appConfig.apiurl + 'StockSetup/getstockbysyskey';
      const param = {
        syskey: "",
        zoneList: []
      };

      if(this.soShop.zoneSyskey != undefined && this.soShop.zoneSyskey != "0" && this.soShop.zoneSyskey != "")
      {
        param.zoneList.push(this.soShop.zoneSyskey);
      }

      this.stockListSubscriptin = this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {

          this.skulist = data.map((s, index, array) => {
            s.t1 = s.t1.length > 0 ? this.manager.appConfig.imgurl + s.t1 : 'assets/img/not-found.png';
            s.stkDetail = s.stkDetail.filter(d => {
              return d.uomType == "Confirm";
            });
            s.myStk = {
              'stock': '',
              'qty': 1,
              'price': 1.0,
              'total': 1.0,
              'isAddToCard': false,
              'isReturn': false
            };
            let pzList = this.priceZone.filter(pz => {
              return pz.n1 == s.syskey
            });
            if (pzList.length > 0) s.stkDetail[0].price = pzList[0].n3;
            return s;
          });
          promise();
        },
        error => {
          console.log(error);
          reject();
        }
      )


    })

  }
  async advanceSearch(s: boolean) {
    if (!this.searchtab) {
      this.getShopList();
      this.getBrandOwner();
      this.getUsers();

      this.runSpinner(true);
      this.searchtab = true;
      this.runSpinner(false);
    } else {
      this.searchtab = s;
    }
  }
  advanceSearchReset() {
    this.advSearchObjTmp = this.searchObjTmp();
    this.advSearchObjTmp.dateOptions = "today";
    this.dateOptionsChange();

    this.runSpinner(true);
    this.getDeliveryOrderListByBo(0, true);
    this.runSpinner(false);
  }

  getAllState(){
    let param = {
      "t2": ""
    };

    const url = this.manager.appConfig.apiurl +'placecode/getstate';

    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any) =>{
        this.stateList = data.stateList;
        this.stateList.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
      }
    );
  }

  cboStateChange(e){
    $("#cboDistrictDeli").prop('selectedIndex', 0);
    $("#cboDistrictDeli :selected").val("");
    $("#cboTownshipDeli").prop('selectedIndex', 0);
    $("#cboTownshipDeli :selected").val("");
    $("#newdel-shop").val('');
    $("#newdel-shopcode").val('');
    this.shopAddress = '';
    this.districtList = [];
    this.townshipList = [];
    this.newDelSearchFromGroup.get('store-list').setValue([]);
    $("#newdel-shop").prop('disabled', true);
    $("#newdel-shopcode").prop('disabled', true);
    $("#btnOdrSearch").prop('disabled', true);
    $("#btnNewOdr").prop('disabled', true);

    // if($("#cboStateDeli :selected").val().toString() == ""){
    //   return;
    // }
    if(e.target.value == ""){
      return;
    }

    let param = {
      "code": "",
      "description": "",
      "districtSyskey": "",
      "stateSyskey": e.target.value //$("#cboStateDeli :selected").val().toString()
    };

    const url = this.manager.appConfig.apiurl +'placecode/getdistrict';

    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any) =>{
        this.districtList = data.districtList;
        this.districtList.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
      }
    );
  }

  cboDistrictChange(e){
    $("#cboTownshipDeli").prop('selectedIndex', 0);
    $("#cboTownshipDeli :selected").val("");
    this.townshipList = [];
    this.newDelSearchFromGroup.get('store-list').setValue([]);
    $("#newdel-shop").prop('disabled', true);
    $("#newdel-shop").val('');
    $("#newdel-shopcode").prop('disabled', true);
    $("#newdel-shopcode").val('');
    this.shopAddress = '';
    $("#btnOdrSearch").prop('disabled', true);
    $("#btnNewOdr").prop('disabled', true);
     // this.disableShop = true;

    // if($("#cboDistrictDeli :selected").val().toString() == ""){
    //   return;
    // }
    if(e.target.value == ""){
      return;
    }
    
    let param = {
      "code": "",
      "description": "",
      "townshipSyskey": "",
      "districtSyskey": e.target.value //$("#cboDistrictDeli :selected").val().toString()
    };

    const url = this.manager.appConfig.apiurl +'placecode/gettsp';

    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any) =>{
        this.townshipList = data.tspList;
        this.townshipList.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
      }
    );
  }

  cboTownshipChange(e){
    $("#newdel-shop").val('');
    $("#newdel-shopcode").val('');
    this.shopAddress = '';
    this.newDelSearchFromGroup.get('store-list').setValue([]);
    $("#newdel-shop").prop('disabled', false);
    $("#newdel-shopcode").prop('disabled', false);
    $("#btnOdrSearch").prop('disabled', true);
    $("#btnNewOdr").prop('disabled', true);
    // this.disableShop = true;
    this.townshipSyskey = e.target.value;
    if( e.target.value == ""){ //$("#cboTownshipDeli :selected").val().toString()
      $("#newdel-shop").prop('disabled', true);
      $("#newdel-shopcode").prop('disabled', true);
      $("#btnOdrSearch").prop('disabled', true);
      $("#btnNewOdr").prop('disabled', true);
      return;
    }
  }

  txtShopNameEnter(e){
    if(e.key.toString() == "Enter"){
      $("#delisalesblock").hide();
      $('#newdel-progressbar').show();
      this.shopNameSearchAutoFillSubscription = this.manager.shopNameSearchAutoFill($("#newdel-shop").val().toString(), false, this.townshipSyskey).subscribe( //$("#cboTownshipDeli :selected").val().toString()
        (data: any) => {
          this.newDelSearchFromGroup.get('store-list').setValue(data);
          // this.newDelSearchFromGroup.get('store-list').sort((a, b) => (a.shopName.toLowerCase() > b.shopName.toLowerCase()) ? 1 : -1);
          $('#newdel-progressbar').hide();
        },
        error => {
          $('#newdel-progressbar').hide();
        }
      );
    }
  }
  txtShopCodeEnter(e){
    if(e.key.toString() == "Enter"){
      $("#delisalesblock").hide();
      $('#newdel-progressbar').show();
      this.shopCodeSearchAutoFillSubscription = this.manager.shopCodeSearchAutoFill2($("#newdel-shopcode").val().toString(), false, this.townshipSyskey).subscribe( //$("#cboTownshipDeli :selected").val().toString()
        (data: any) => {
          this.newDelSearchFromGroup.get('store-list').setValue(data);
          // this.newDelSearchFromGroup.get('store-list').sort((a, b) => (a.shopName.toLowerCase() > b.shopName.toLowerCase()) ? 1 : -1);
          $('#newdel-progressbar').hide();
        },
        error => {
          $('#newdel-progressbar').hide();
        }
      );
    }
  }
  getShopList() {
    return new Promise<void>((promise, reject) => {
      const url = this.manager.appConfig.apiurl + 'shop/shoplist';
      const param = {
        shopSysKey: "",
        shopName: "",
        shopCode: ""
      };
      let caller = this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.shoplist = data;
          promise();
        },
        error => {
          console.log(error);
          promise();
        }
      )
    })
  }
  
  async deleteDetail(parentIndex, index, type) {
    if (type == 1) {
      if (this.sop003[parentIndex].skuOrderType.order[index].n39 > 0) {
        this.manager.showToast(this.tostCtrl, "Message", "Cannnot delete. It is a expired stock", 1000);
        return;
      }
      if ((this.sop003[parentIndex].skuOrderType.order[index] as Sop002_Interface).n40 == 3) {
        this.sop003[parentIndex].skuOrderType.order.splice(index, 1);
        return;
      }
      if (this.sop003[parentIndex].skuOrderType.order[index].syskey !== "0"
        && this.sop003[parentIndex].skuOrderType.order[index].syskey !== "") {
        this.sop003[parentIndex].skuOrderType.order[index].recordStatus = 4;
      } else {
        const remStkSyskskey = this.sop003[parentIndex].skuOrderType.order[index].n1;
        this.sop003[parentIndex].skuOrderType.order.splice(index, 1);

      }

    } else {
      if (this.sop003[parentIndex].skuOrderType.return[index].syskey !== "0"
        && this.sop003[parentIndex].skuOrderType.return[index].syskey !== "") {
        this.sop003[parentIndex].skuOrderType.return[index].recordStatus = 4;

      } else {
        this.sop003[parentIndex].skuOrderType.return.splice(index, 1);
      }
    }
    $('#progressbar-1').show();
    $('#tabel-detail :input').attr('disabled', true);
    $('#btnPreview').attr('disabled', true);
    await this.addVolumeDiscountItem4();
    $('#tabel-detail :input').attr('disabled', false);
    $('#progressbar-1').hide();
    $('#btnPreview').attr('disabled', false);
    this.calculate2();
  }

  async addToCard(flag) { 
    $('#progressbar-1').show();
    this.savebtnDisable = true;
    this.stockListSubscriptin.unsubscribe();
    let checkedStocks;
    let sop003index;
    if(flag === "1")
        {
          checkedStocks = this.skulist.filter(stock => {
            return stock.myStk.isAddToCard == true;
          });
          checkedStocks.map((stock, index) => {
            sop003index = this.sop003.map(sop003 => {
              return sop003.n1; //brandowner syskey
            }).indexOf(stock.brandOwner.syskey);
            if (sop003index == -1) {
              /* new BrandOwner */
              let newBrandOwner = this.getBrandOwnerObj();
              newBrandOwner.recordStatus = 1;
              newBrandOwner.n1 = stock.brandOwner.syskey;
              newBrandOwner.t4 = stock.brandOwner.t1;
              newBrandOwner.t5 = stock.brandOwner.t2;
              if (stock.myStk.isReturn) {
                let sku = this.addToStock_bindSop002Interface(stock, 2);
                newBrandOwner.skuOrderType.return.push(sku);
              } else {
                let sku = this.addToStock_bindSop002Interface(stock, 1);
                newBrandOwner.skuOrderType.order.push(sku);
              }
              this.sop003.push(newBrandOwner);
            } else {
              /* Existing BrandOwner */
              let sop002Index;        
              if (stock.myStk.isReturn) {
                sop002Index = this.sop003[sop003index].skuOrderType.return.map(e => { return e.ref1; }).indexOf(stock.syskey); // from e.n1 to e.ref1
              } else {
                sop002Index = this.sop003[sop003index].skuOrderType.order.map(e => { return e.n1; }).indexOf(stock.syskey); // from e.n1 to e.ref1
              }
              if (sop002Index == -1) {
                //if there is no stock in mySop002 list
                if (stock.myStk.isReturn) {
                  this.sop003[sop003index].skuOrderType.return.push(this.mapStockToSop002(stock, 2));
                } else {
                  this.sop003[sop003index].skuOrderType.order.push(this.mapStockToSop002(stock, 1));
                }
              } else {
                //if there is stock in mySop002 list
                if (stock.myStk.isReturn) {
                  this.sop003[sop003index].skuOrderType.return[sop002Index].n6 += stock.myStk.qty;
                  this.sop003[sop003index].skuOrderType.return[sop002Index].recordStatus = 1;
                } else {
                  if (this.sop003[sop003index].skuOrderType.order[sop002Index].recordStatus == 4) {
                    // if deleted stock which syskey != 0, reset its quantity to selected qty;
                    this.sop003[sop003index].skuOrderType.order[sop002Index].n6 = stock.myStk.qty;
                    this.sop003[sop003index].skuOrderType.order[sop002Index].n34 = stock.stkDetail[0].price;
                    this.sop003[sop003index].skuOrderType.order[sop002Index].n10 = stock.stkDetail[0].price;
                    this.sop003[sop003index].skuOrderType.order[sop002Index].n14 = stock.stkDetail[0].price * stock.myStk.qty;
                  } else if(this.sop003[sop003index].skuOrderType.order[sop002Index].n34 != stock.stkDetail[0].price)
                  {
                    this.sop003[sop003index].skuOrderType.order.push(this.mapStockToSop002(stock, 1));
                  }
                  else {
                    // else add selected qty to its original
                    this.sop003[sop003index].skuOrderType.order[sop002Index].n6 += stock.myStk.qty;
                  }
                  this.sop003[sop003index].skuOrderType.order[sop002Index].recordStatus = 1;
                }
              }
            }
          });
        }else if(flag === "2")
        {
          checkedStocks = this.emptyBOTList.filter(stock => {
            return stock.myStk.isAddToCard == true;
          });
          checkedStocks.map((stock, index) => {
            sop003index = this.sop003.map(sop003 => {
              return sop003.n1; //brandowner syskey
            }).indexOf(stock.brandOwner.syskey);
            if (sop003index == -1) {
              /* new BrandOwner */
              let newBrandOwner = this.getBrandOwnerObj();
              newBrandOwner.recordStatus = 1;
              newBrandOwner.n1 = stock.brandOwner.syskey;
              newBrandOwner.t4 = stock.brandOwner.t1;
              newBrandOwner.t5 = stock.brandOwner.t2;
    
              let sku = this.addToStock_bindSop002Interface(stock, 4);
              newBrandOwner.skuOrderType.return.push(sku);
    
              this.sop003.push(newBrandOwner);
            } else {
              /* Existing BrandOwner */
              let sop002Index;        
              sop002Index = this.sop003[sop003index].skuOrderType.return.map(e => { return e.n1; }).indexOf(stock.syskey);
              if (sop002Index == -1) {
                //if there is no stock in mySop002 list
                this.sop003[sop003index].skuOrderType.return.push(this.mapStockToSop002(stock, 4));
              } else {
                //if there is stock in mySop002 list
                if (this.sop003[sop003index].skuOrderType.return[sop002Index].recordStatus == 4) {
                  // if deleted stock which syskey != 0, reset its quantity to selected qty;
                  this.sop003[sop003index].skuOrderType.return[sop002Index].n6 = stock.myStk.qty;
                } else {
                  // else add selected qty to its original
                  this.sop003[sop003index].skuOrderType.return[sop002Index].n6 += stock.myStk.qty;
                }
                this.sop003[sop003index].skuOrderType.return[sop002Index].recordStatus = 1;
              }
            }
          });
        }
        for (let i = 0; i < this.sop003.length; i++) {
          for (let y = 0; y < checkedStocks.length; y++) {
            if (!checkedStocks[y].myStk.isReturn)
              await this.addVolumeDiscountItem4();
          }
        }
       this.calculate2().then(()=>{
        $('#progressbar-1').hide();
        this.savebtnDisable = false;
       })
  
  }
  private mapStockToSop002(stock, orderType: number) {
    return {
      "syskey": "0",
      "recordStatus": 1,
      "ref1": "0",
      "ref2": "0",
      "ref3": "0",
      "parentid": "0",
      "t2": stock.t2,//stock code
      "t3": stock.t3,//stock name]
      "t7": this.manager.formatDate(new Date(), "yyyyMMdd"),
      "n1": stock.syskey,//stock sysksy
      "n2": stock.n12,
      "n3": "0",
      "n6": stock.myStk.qty,//qty
      "n7": stock.stkDetail[0].u31Syskey,
      "n8": 1,
      "n9": 0,
      "n10": orderType == 4? 0.0 : stock.stkDetail[0].price,//price
      "n11": 0.0,// discount
      "n12": 0.0,
      "n13": 0.0,
      "n14": orderType == 4? 0.0 : stock.stkDetail[0].price * stock.myStk.qty,
      "n23": 0,
      "n34": orderType == 4? 0.0 : stock.stkDetail[0].price,
      "n35": "0",
      "n36": 0,
      "n37": 0.0,
      "n40": orderType,// return or order
      "n42": 0,
      "stockPromotionDetailData": []
    }
  }
  private mapModelSop002(serviceSop002) {
    return {
      "syskey": serviceSop002.syskey,
      "recordStatus": 1,
      "ref1": serviceSop002.ref1,
      "ref2": serviceSop002.ref2,
      "ref3": serviceSop002.ref3,
      "parentid": serviceSop002.parentid,
      "t2": serviceSop002.t2,//stock code
      "t3": serviceSop002.t3,//stock name
      "t7": serviceSop002.t7,
      "n1": serviceSop002.n1,//stock sysksy
      "n2": serviceSop002.n2,
      "n3": serviceSop002.n3,
      "n6": serviceSop002.n6,//qty
      "n7": serviceSop002.n7,
      "n8": serviceSop002.n8,
      "n9": serviceSop002.n9,
      "n10": serviceSop002.n10,//price
      "n11": serviceSop002.n11,// discount
      "n12": serviceSop002.n12,
      "n13": serviceSop002.n13,
      "n14": serviceSop002.n34 * serviceSop002.n6,
      "n23": serviceSop002.n23,
      "n34": serviceSop002.n34,
      "n35": serviceSop002.n35,
      "n36": serviceSop002.n36,
      "n37": serviceSop002.n37,
      "n39": serviceSop002.n39,
      "n40": serviceSop002.n40,// return or order
      "n42": serviceSop002.n42,
      "stockPromotionDetailData": serviceSop002.stockPromotionDetailData
    }
  }
  getBrandOwner() {
    return new Promise<void>(promise => {
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
          this.bolist = data;
          this.bolist.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
          promise();
        },
        error => {
          console.log(error);
          promise();
        }
      )
    })
  }
  getUsers() {
    return new Promise<void>(promise => {
      const url = this.manager.appConfig.apiurl + 'user/userList';
      const param = {
        searchVal: ""
      };
      let caller = this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.userlist = data.dataList;
          this.userlist.sort((a, b) => (a.userName.toLowerCase() > b.userName.toLowerCase()) ? 1 : -1);
          promise();
        },
        error => {
          console.log(error);
          promise();
        }
      )
    })
  }
  async search() {
    this.runSpinner(true);
    this.advSearchObjTmp.current = 0;
    await this.getDeliveryOrderListByBo(0, true);
    this.runSpinner(false);
  }

  getDeliveryOrderListByBo(current: number, booflag) {
    return new Promise<void>((done, reject) => {
      const url = this.manager.appConfig.apiurl + 'sop/getdeliverylistbo';
      let search = {
        'fromDate': this.advSearchObjTmp.adv_fromDate == '' ? '' : this.manager.formatDate(new Date(this.advSearchObjTmp.adv_fromDate), "yyyyMMdd"),
        'toDate': this.advSearchObjTmp.adv_toDate == '' ? '' : this.manager.formatDate(new Date(this.advSearchObjTmp.adv_toDate), "yyyyMMdd"),
        'usersyskey': this.advSearchObjTmp.adv_usersyskey,
        'activeStatus': this.advSearchObjTmp.activeStatus,
        'brandOwnerSyskey': this.advSearchObjTmp.adv_brandOwnerSyskey,
        'shopsyskey': this.advSearchObjTmp.adv_shopsyskey,
        'currentNew': current,
        'maxRow': this.manager.itemsPerPage,
        'backDateOrder': this.backDate == true ? 1 : 0 
      }

      this.delListByBoSubscription = this.http.post(url, search, this.manager.getOptions()).subscribe(
        (data: any) => {
          if (data.dataList.length > 0) {
            this.config.totalItems = data.rowCount;

            let d = data.dataList.map((m) => {
              m.i = current++;
              m.usertype = this.manager.getUserTypeDesc(m.usertype);
              m.date = new Date(this.manager.formatDateByDb(m.date));
              return m;
            });
            if (d.status = 128)
              d.status = "paid";
            else
              d.status = "void";
            this.solist = d;
          } else {
            this.solist = data.dataList;
            this.config.currentPage = 0;
          }
          done();
        },
        error => {
          reject();
        }
      )
    },
    )
  }

  getDeliveryOrder(id) {
    return new Promise<void>((promise, reject) => {
      const url = this.manager.appConfig.apiurl + 'sop/getdillist';
      let caller = this.http.post(url, {
        'headerSyskey': id
      }, this.manager.getOptions()).subscribe(
        (data: any) => {
          if (data.length > 0) {
            this.soObj = data[0];
          }
          promise();
        },
        error => {
          console.log(error);
          reject();
        }
      )
    })
  }
  async detail(headersyskey) {
    this.saleTypeDisable = true;
    $("#delCdPickerInput").prop('disabled', true);
    this.manager.showLoading(this.loadCtrl, "Processing..", 0).then(
      async el => {
        el.present();
        this.getDeliveryOrder(headersyskey).then(
          pro => {
            el.dismiss();
            $('#so-tab').tab('show');
            this.btn = true;
            $('.slip-number').text('Invoice No.' + this.soObj.autokey);         
 
            if (typeof this.soObj.createddate.getMonth === 'function') {

            } else {
              this.soObj.createddate = new Date(this.manager.formatDateByDb(this.soObj.createddate));
              this.soObj.createddate.setMinutes(390);
            }            

            this.showDetail_New(this.soObj);
          }
        ).catch(
          error => {
            el.dismiss();
            this.manager.showToast(this.tostCtrl, "Message", "Server Not Responding!", 1000);
          }
        )
      }
    )
  }
  async showDetail_New(obj) {
    $('#delordnew-tab').tab('show');
    $('#delivery-detail-tab').show();
    $('#slip-detail-card').show();
    this.soObj = obj;

    this.prepareDataForAdmin(this.soObj);
    this.buttonControl((() => {
      if (this.soObj.saveStatus == 128) return true;
      else if (this.soObj.saveStatus == 6) return false;
    })(), (() => {
      if (this.soObj.saveStatus == 128) return true;
      else if (this.soObj.saveStatus == 6) return false;
    })(),
      true, false);
    this.getShopDetail(this.soObj.n1).then(
      () => {
        let date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, new Date());
        this.manager.getPriceChangeDetailDownload(date, this.soShop.shopSysKey, this.soShop.zoneSyskey).then(pz => {
          this.priceZone = pz;
        }).catch(() => {
          this.priceZone = [];
        });
      }
    );

    this.orderDate = new Date(this.manager.formatDateByDb(this.soObj.createddate));
    this.getPreSellerName(this.soObj.n55).then(d => { $('#preseller-name').text(d == '' ? 'NA' : d) }).catch(() => { $('#preseller-name').text('NA') });

    this.sop003 = [];
    for (let i = 0; i < this.soObj.sop003.length; i++) {
      let bo = this.getBrandOwnerObj();
      bo.syskey = this.soObj.sop003[i].syskey;
      bo.createddate = this.soObj.sop003[i].createddate;
      bo.recordStatus = 1;
      bo.userid = this.soObj.sop003[i].userid;
      bo.username = this.soObj.sop003[i].username;
      bo.t1 = this.soObj.sop003[i].t1;
      bo.t4 = this.soObj.sop003[i].t4;
      bo.t5 = this.soObj.sop003[i].t5;
      bo.n1 = this.soObj.sop003[i].n1;
      bo.n5 = this.soObj.sop003[i].n5;//Total
      bo.n6 = this.soObj.sop003[i].n6;
      bo.n7 = this.soObj.sop003[i].n7;
      bo.n8 = this.soObj.sop003[i].n8;
      bo.n9 = this.soObj.sop003[i].n9;
      bo.n11 = this.soObj.sop003[i].n11;
      bo.n12 = this.soObj.sop003[i].n12;
      bo.n14 = this.soObj.sop003[i].n14;
      bo.n33 = this.soObj.sop003[i].n33;
      bo.n34 = this.soObj.sop003[i].n34;
      bo.n35 = this.soObj.sop003[i].n35;
      bo.n36 = this.soObj.sop003[i].n36;
      bo.n37 = this.soObj.sop003[i].n37;
      bo.n38 = this.soObj.sop003[i].n38;
      bo.transType = this.soObj.sop003[i].transType;
      bo.promotionList = this.soObj.sop003[i].promotionList;
      for (let y = 0; y < this.soObj.sop003[i].transDetailsData.length; y++) {
        let detail: Sop002_Interface = this.mapSop002ToInterface(this.soObj.sop003[i].transDetailsData[y]);
        if (detail.n40 == 1) {
          bo.skuOrderType.order.push(detail);
          detail.stockPromotionDetailData.forEach((pro: Sop002_Interface) => {
            pro.parentSkuSyskey = detail.n1;
            pro.isEndTypeTotalItem = false;
            pro.maxQty = -1;
            pro.stockPromotionSubDetailData = [];
            bo.skuOrderType.order.push(pro)
          });
        } else {
          bo.skuOrderType.return.push(detail);
        }
      }
      let orderList = [];
      let groupOrderList = this.manager.groupArrayIntoOneArray(bo.skuOrderType.order);
      groupOrderList.forEach(group => {
        group.sort((a, b) => (a.n40 > b.n40) ? 1 : -1);
        orderList = [...orderList, ...group];
      });
      bo.skuOrderType.order = orderList;
      this.sop003.push(bo);
    }
    this.sop003_original = this.sop003.slice();
    this.calculate2();
  }

  getShopDetail(id) {
    return new Promise<void>(promise => {
      const url = this.manager.appConfig.apiurl + 'shop/shoplist';
      this.http.post(url, {
        shopSyskey: '',
        shopName: '',
        shopCode: id
      }, this.manager.getOptions()).subscribe(
        (data: any) => {
          promise();
          if (data.length > 0) {
            let shop = this.getSoShopDetail();
            shop.shopSysKey = data[0].shopSysKey;
            shop.shopName = data[0].shopName;
            shop.shopCode = data[0].shopCode;
            shop.latitude = data[0].latitude;
            shop.longitude = data[0].longitude;
            shop.address = data[0].address;
            shop.phno = data[0].phno;
            shop.email = data[0].email;
            shop.personName = data[0].personName;
            shop.zoneSyskey = data[0].zoneSyskey;
            shop.crdLimitAmt =  data[0].crdLimitAmt;
            this.soShop = shop;
          }
        },
        error => {
          promise();
        }
      )
    })
  }

  discountChange2(bo) {
    if (bo.n7 < 0 || bo.n7 == null || bo.n7 == '' || bo.n7 == undefined) {
      bo.n7 = 0;
    }
    this.calculate2();
  }

  normalDiscountAmountCalculate(percent: number, subTotal) {
    let result = (percent / 100) * subTotal;
    return result;
  }

  async prepareToSave2(inv: boolean) {
    // if(this.isUseSAP){
    //   this.getSalesTypeList();
    // }
    if(this.saveValidation())
    {
      $('.myOuterContainer').addClass('disabled');
      $('#btn-delivery-update').prop('disabled', true);
      $('#spinner-delivery-update').show();
      let invoice: boolean = inv;
      // $('#previewTbody').html("");
      const loading = await this.loadCtrl.create({ message: "Preparing .. " });
      await loading.present();
      let sop001 = this.getHeaderObj();
      sop001.syskey = this.soObj.syskey;
      sop001.createddate = this.soObj.createddate == '' ? '' : this.manager.formatDate(new Date(this.soObj.createddate), "yyyyMMdd");
      sop001.createdtime = this.soObj.createdtime;
      sop001.userid = this.manager.user.userId;
      sop001.username = this.manager.user.userName;
      sop001.saveStatus = this.soObj.saveStatus;
      sop001.recordStatus = 1;
      sop001.transType = this.soObj.transType;
      sop001.t4 = this.soObj.t4;
      sop001.t5 = this.soObj.t5;
      sop001.n1 = this.soObj.n1;
      sop001.n4 = this.soObj.n4;
      // sop001.n21 = this.soObj.n21;
      sop001.n21 = sessionStorage.getItem('usk');
      sop001.n55 = this.soObj.n55;
      sop001.t34 = this.soObj.t34;
      // sop001.oldN5 = this.soObj.oldN5;
      if (sop001.syskey !== '0' && sop001.syskey !== "") {
        sop001.saveStatus = 1;
      }
      for (let i = 0; i < this.sop003.length; i++) {
        let sop003: Sop003 = this.getSop003Obj();
        this.sop003[i].skuOrderType.order.map(orderSop002 => {
          let sop002: Sop002 = this._getSop002Obj();
          sop002.syskey = orderSop002.syskey;
          sop002.recordStatus = orderSop002.recordStatus;
          sop002.ref1 = orderSop002.ref1;
          sop002.ref2 = orderSop002.ref2;
          sop002.ref3 = orderSop002.ref3;
          sop002.t2 = orderSop002.t2;
          sop002.t6 = orderSop002.t6;
          sop002.t7 = orderSop002.t7;
          sop002.n1 = orderSop002.n1;
          sop002.n2 = orderSop002.n2;
          sop002.n3 = orderSop002.n3;
          sop002.n6 = orderSop002.n6;
          sop002.n7 = orderSop002.n7;
          sop002.n8 = orderSop002.n8;//lvlqty
          sop002.n9 = orderSop002.n9;
          sop002.n10 = orderSop002.n10;//price
          sop002.n11 = orderSop002.n11;//price
          sop002.n12 = orderSop002.n12;//price
          sop002.n13 = orderSop002.n13;//total discount
          sop002.n14 = orderSop002.n14;//sub total
          sop002.n23 = 0.0;//tax
          sop002.n34 = orderSop002.n34;
          sop002.n35 = "0";
          sop002.n36 = 1;
          sop002.n37 = 0.0;
          sop002.n40 = orderSop002.n40;
          sop002.n42 = orderSop002.n42;
          if (sop002.n40 == 1) {
            sop002.stockPromotionDetailData = this.sop003[i].skuOrderType.order.filter(sop002Promo => {
              return (sop002Promo.parentSkuSyskey == orderSop002.n1) && (sop002Promo.n6 > 0);
            }).map((pro: Sop002_Interface) => {
           
              let g: Sop002 = this._getSop002Obj();
              g.t2 = pro.t2;
              g.t3 = pro.t3;
              g.t4 = "";
              g.t7 = pro.t7;
              g.n1 = pro.n1;
              g.n6 = pro.n6;
              g.n10 = pro.n10;
              g.n11 = pro.n11;
              g.n12 = pro.n12;
              g.n34 = pro.n34;
              g.n40 = pro.n40;
              g.n42 = pro.n42
              g.ref1 = pro.ref1;
              g.ref3 = pro.ref3;
              g.syskey = pro.syskey;
              g.parentid = pro.parentid;
  
              return g;
  
            })
            sop003.transDetailsData.push(sop002);
          }
        })
        this.sop003[i].skuOrderType.return.map(orderSop002 => {
          let sop002: Sop002 = this._getSop002Obj();
          sop002.syskey = orderSop002.syskey;
          sop002.recordStatus = orderSop002.recordStatus;
          sop002.ref1 = orderSop002.ref1;
          sop002.ref2 = orderSop002.ref2;
          sop002.t2 = orderSop002.t2;
          sop002.t6 = orderSop002.t6;
          sop002.t15 = orderSop002.t15;
          sop002.n1 = orderSop002.n1;
          sop002.n2 = orderSop002.n2;
          sop002.n3 = orderSop002.n3;
          sop002.n6 = orderSop002.n6;
          sop002.n7 = orderSop002.n7;
          sop002.n8 = orderSop002.n8;//lvlqty
          sop002.n9 = orderSop002.n9;
          sop002.n10 = orderSop002.n10;//price
          sop002.n11 = orderSop002.n11;//price
          sop002.n12 = orderSop002.n12;//price
          sop002.n13 = orderSop002.n13;//total discount
          sop002.n14 = orderSop002.n14;//sub total
          sop002.n23 = 0.0;//tax
          sop002.n34 = orderSop002.n34;
          sop002.n35 = "0";
          sop002.n36 = 1;
          sop002.n37 = 0.0;
          sop002.n39 = orderSop002.n39;
          // sop002.n40 = 2;
          sop002.n40 = orderSop002.n40;
  
          sop003.transDetailsData.push(sop002);
        })
        sop003.syskey = this.sop003[i].syskey;
        sop003.userid = this.sop003[i].userid;
        sop003.username = this.sop003[i].username;
        sop003.transType = this.soObj.transType;
        sop003.recordStatus = this.sop003[i].recordStatus;
        sop003.t1 = this.sop003[i].t1;
        sop003.t5 = this.sop003[i].t5;
        sop003.n1 = this.sop003[i].n1;
        sop003.n6 = sop003.n6;
        sop003.n7 = this.sop003[i].n7;
        sop003.n35 = 0.0;
        sop003.n36 = 0.0;
        sop003.n37 = 0.0;
        sop003.n38 = 0.0;
        sop003.n31 = this.sop003[i].normalSkuTotalAmount;
        sop003.n32 = this.sop003[i].returnSkuTotalAmount;
        // const n5 = (sop003.n31 - sop003.n32) - sop003.n7;
        let n5 = sop003.n31 - sop003.n7;
  
        let gift: Sop002 = this._getSop002Obj();
        if (n5 > 0) {
          await new Promise<void>(invDis => {
            this.manager.getInvoiceDiscount(this.soShop.shopSysKey, sop003.n1, n5).subscribe(
              (data: any) => {
                console.log('data.message= ' + data.message);
                // console.log('data.data.GiftList=' + JSON.stringify(data.data.GiftList));
  
                if (data.message == 'Promo Available') {
                  console.log('Promo Available');
                  let proList =[];
  
                  let isEndType_TotalItem = false;
                  let totalQtyItem = -1;
                  let sku_child_list = [];
                  let group_child_list = [];
                  sop003.promotionList = [];
                  /*
                  [
                    [],[],[]
                  ]
                  */
                  data.data.GiftList.map(mulPro => { //[...]
                    let sku_subchild_list = [];
                    for (let i in mulPro) { // [[...]]
                      if (mulPro[i].discountItemRuleType == 'Total Item' && mulPro[i].discountItemEndType == 'END') {
                        isEndType_TotalItem = true;
                        totalQtyItem = mulPro[i].discountItemQty;
                      }
                      sku_subchild_list.push(((): Sop002_Interface => {
                        let s2: Sop002_Interface = this._getSop002Interface();
                        s2.t2 = mulPro[i].discountStockSyskey == '' ? mulPro[i].discountGiftCode : mulPro[i].discountStockCode;
                        s2.t3 = mulPro[i].discountItemDesc;
                        // s2.t7 = "";
                        s2.ref1 = mulPro[i].discountStockSyskey == '' ? 0 : mulPro[i].discountStockSyskey;
                        // s2.ref3 = mulPro.discountDetailSyskey;
                        // s2.parentid = "0";
                        s2.n1 = mulPro[i].discountItemSyskey;
                        s2.n6 = mulPro[i].discountItemQty;
                        s2.n8 = 1.0;
                        s2.n40 = 5;    // 1-normal,2-return,3-promotion
                        s2.n42 = mulPro[i].discountItemType == 'GIFT' ? 1 : 2;
                        s2.discountItemEndType = mulPro[i].discountItemEndType;
                        return s2;
                      })());
                    }
                    sku_child_list.push([...sku_subchild_list]);
                  });
                  if (isEndType_TotalItem) { // End Type is 'Total Item'
                    for (let i in sku_child_list) {
                      proList = [...proList, ...(sku_child_list[i].map(c => {
                        c.isEndTypeTotalItem = isEndType_TotalItem;
                        c.n6 = 1;
                        c.maxQty = totalQtyItem;
                        return c;
                      }))];
                    }
                  } else {
                    // let group_child_list = [];
                    for (let i in sku_child_list) {
                      let subChildItem = this._getSop002Interface();
                      for (let y = 0; y < sku_child_list[i].length; y++) {
                        let item = sku_child_list[i][y];
                        item.isEndTypeTotalItem = isEndType_TotalItem;
                        if (y == 0) {
                          // subChildItem.syskey = item.syskey;
                          // subChildItem.parentSkuSyskey = item.parentSkuSyskey;
                          subChildItem.t2 = item.t2;
                          subChildItem.t3 = item.t3;
                          // subChildItem.t7 = item.t7;
                          subChildItem.n1 = item.n1;
                          subChildItem.n6 = item.n6;
                          subChildItem.n8 = item.n8;
                          // subChildItem.n10 = item.n10;
                          // subChildItem.n11 = item.n11;
                          // subChildItem.n12 = item.n12;
                          // subChildItem.n34 = item.n34;
                          subChildItem.n40 = item.n40;
                          subChildItem.n42 = item.n42;
                          subChildItem.ref1 = item.ref1;
                          // subChildItem.ref3 = item.ref3;
                          // subChildItem.parentid = item.parentid;
                          subChildItem.isEndTypeTotalItem = isEndType_TotalItem;
                          subChildItem.discountItemEndType = item.discountItemEndType;
                        }
                      }
                      subChildItem.stockPromotionSubDetailData = sku_child_list[i];
                      group_child_list.push(subChildItem)
                    }
                    proList = [...proList, ...group_child_list];
                    // sop003.promotionList.push([...proList]);
                    // sop003.promotionList = proList;
                  }
                  // });
                  
                  // if(this.soObj.syskey != "" && this.soObj.syskey != "0")//for update
                  // {
                  //   if(proList.length == this.sop003[i].promotionList.length)
                  //   {
                  //     for(let j=0; j < this.sop003[i].promotionList.length; j++)
                  //     {
                  //       proList[j].syskey = this.sop003[i].promotionList[j].syskey;
                  //       proList[j].parentid = this.sop003[i].promotionList[j].parentid;
                  //       proList[j].ref1 = this.sop003[i].promotionList[j].ref1;                        
                  //       proList[j].n6 = this.sop003[i].promotionList[j].n6;
                  //       proList[j].n1 = this.sop003[i].promotionList[j].n1;
                  //       proList[j].t2 = this.sop003[i].promotionList[j].t2;
                  //       proList[j].t3 = this.sop003[i].promotionList[j].t3;
                  //       proList[j].n8 = this.sop003[i].promotionList[j].n8;
                  //       proList[j].n40 = this.sop003[i].promotionList[j].n40;
                  //       proList[j].n42 = this.sop003[i].promotionList[j].n42;  
                  //     }
                  //   }else
                  //   {
                  //     for(let j=0; j < proList.length; j++)
                  //     {
                  //       for(let k=0; k < this.sop003[i].promotionList.length; k++){
                  //         if(proList[j].n1 == this.sop003[i].promotionList[k].n1)
                  //         {                       
                  //           proList[j].n6 = this.sop003[i].promotionList[k].n6;
                  //         }else{
                  //           proList[j].n6 = 0;
                  //         }
                  //       }                  
                  //     }
                  //   }
                  // }
                  sop003.promotionList = proList;
  
                    // }                    
                  // });
                  gift.t1 = "Price";
                  sop003.n8 = parseFloat(data.data.DiscountPercent == '' ? '0' : data.data.DiscountPercent);
                  sop003.n33 = (sop003.n8 * n5) / 100;
                  sop003.n33 = this.deciPlaceSetting.isUseCalcDeciPlace ? parseFloat(sop003.n33.toFixed(this.deciPlaceSetting.calcDeciPlace)) : sop003.n33;
  
                } else if (data.message == 'Amount Not Enough') {
                  gift.t1 = 'Amount Not Enough';
                } else {
                  gift.t1 = 'Promo Unavailable';
                }
                invDis();
              },
              error => {
                invDis();
              }
            )
          });
        } else {
          sop003.n8 = 0;
          sop003.n33 = 0;
          sop003.promotionList = [];
        }
  
        if (sop003.n8 == 0 && sop003.n33 > 0) {
          sop003.n5 = n5 - sop003.n33;
        } else {
          sop003.n5 = this.manager.calculateNetDiscount(n5, sop003.n8, 2);
        }
        sop003.n5 = sop003.n5 - sop003.n32;
        sop003.n5 = Math.round(sop003.n5);
        this.cashAmountChangeAfterSave(sop003);
        sop001.n5 += sop003.n5;
        sop001.sop003.push(sop003);
      }
      $('#spinner-delivery-update').hide();
      $('#btn-delivery-update').prop('disabled', false);
      let status = 0;
      loading.dismiss();
      await new Promise<void>(dialog => {
        this.finalSop001 = sop001;
  
        $('#previewToSave').appendTo("body").modal('show');
        $('#previewToSave .previewSaveBtn').click(() => {
          status = 1;
          $('#previewToSave').appendTo("body").modal('hide');
          dialog();
        });
        $('#previewToSave .previewCloseBtn').click(() => {
          $('.myOuterContainer').removeClass('disabled');
          $('#previewToSave').appendTo("body").modal('hide');
          dialog();
        });
      })
      if (status == 1) {
        const loading = await this.loadCtrl.create({
          message: "Processing (delivery) .. <br>Do not close the window",
          backdropDismiss: false
        });
        await loading.present();
        let saveRtnResult: SaleOrderReturnData = null;
        this.finalSop001.t34 = this.soObj.t34;
        if(this.soObj.t34 === 'Z215' || this.soObj.t34 === ''){//cash sales
          // this.finalSop001.n6 += this.finalSop001.sop003[k].n5;
          this.finalSop001.n6 = this.finalSop001.n5;
        }
        for(let k=0; k< this.finalSop001.sop003.length; k++)
        {
          this.finalSop001.sop003[k].promotionList = this.finalSop001.sop003[k].promotionList.filter(promo => {
            return promo.n6 > 0
          });
        }
        await this.save(this.finalSop001).then((rs: SaleOrderReturnData) => { 
          saveRtnResult = rs ;
        }).catch((e) => {
          /* error saving delivery */
          $('.myOuterContainer').removeClass('disabled');
          loading.dismiss();
        })
        if (this.saveReturnStatus == 1) {
          if (invoice) {
            loading.message = "Processing (Invoice).. <br>Do not close the window";
            this.finalSop001.transType = this.manager.tranType.SaleInvoice.code;
            if (sop001.syskey !== "" && sop001.syskey !== "0")
              this.finalSop001.n55 = sop001.syskey;
            else
              this.finalSop001.n55 = saveRtnResult.returnOrderDetail.syskey;
  
            this.finalSop001.sop003 = sop001.sop003.map(bo => {
              bo.transType = this.manager.tranType.SaleInvoice.code;
              return bo;
            });
            for(let k=0; k< this.finalSop001.sop003.length; k++)
            {
              this.finalSop001.sop003[k].promotionList = this.finalSop001.sop003[k].promotionList.filter(promo => {
                return promo.n6 > 0
              });
            }
            this.finalSop001.saveStatus = 128;
            await this.save(this.finalSop001);
          }
          loading.dismiss();
          if (this.saveReturnStatus == 1) {
            this.manager.showToast(this.tostCtrl, "Message", "Success!", 1000).then(
              e => {
                this.afterSave();
              }
            )
          } else {
            this.manager.showToast(this.tostCtrl, "Message", "Something went wrong!", 1000).then(
              e => {
                this.afterSave();
              }
            )
          }
        } else if (this.saveReturnStatus == 2) {
          loading.dismiss();
          this.manager.showToast(this.tostCtrl, "Message", "Sales Block!", 1000, 'danger').then(
            e => {
              this.afterSave();
            }
          )
        }
        else if (this.saveReturnStatus == 3) {
          loading.dismiss();
          this.manager.showToast(this.tostCtrl, "Message", "Credit Sales Block!", 1000, 'danger').then(
            e => {
              // this.afterSave();
              $('.myOuterContainer').removeClass('disabled');
            }
          )
        }else if (this.saveReturnStatus == 4) {
          loading.dismiss();
          this.manager.showToast(this.tostCtrl, "Message", "Over Credit Limit!", 1000, 'danger').then(
            e => {
              // this.afterSave();
              $('.myOuterContainer').removeClass('disabled');
            }
          )
        } else {
          loading.dismiss();
          this.manager.showToast(this.tostCtrl, "Message", "Something went wrong!", 1000, 'danger').then(
            e => {
              this.afterSave();
            }
          )
        }
  
  
      } else {
        $('.myOuterContainer').removeClass('disabled');
      }
    }
  }
  saveValidation(): boolean 
  {
    if(this.isUseSAP)
    {  
      if(this.soObj.t34 == '')
      {
        this.manager.showToast(this.tostCtrl, "Message", "Please Choose Sales Type!", 1000, 'danger');
        return false;
      }    
    }
    return true;
  }
  async afterSave() {
    this.solist = [];
    this.btn = false;
    $('#delordlist-tab').tab('show');
    this.reset(true);
    this.runSpinner(true);
    await this.getDeliveryOrderListByBo(0, true);
    this.runSpinner(false);
    $('.myOuterContainer').removeClass('disabled');
  }
  save(obj) {
    return new Promise<SaleOrderReturnData>((res, rej) => {
      const url = this.manager.appConfig.apiurl + 'sop/saveso';
      let caller = this.http.post(url, obj, this.manager.getOptions()).subscribe(
        (data: SaleOrderReturnData) => {

          if (data.message == "SUCCESS") {
            this.saveReturnStatus = 1;
          } else if (data.message == "SALES_BLOCK") {
            this.saveReturnStatus = 2;
          }else if (data.message == "CREDIT_BLOCK") {
            this.saveReturnStatus = 3;
          }else if (data.message == "OVER_CREDIT") {
            this.saveReturnStatus = 4;
          }else {
            this.saveReturnStatus = 5;
          }
          res(data);
        },
        error => {
          this.saveReturnStatus = 0;
          rej();
        }
      )

    });
  }
  print() {
    let Export_Criteria = {
      "ShopName": "",
      "UserName": "",
      "FromDate": "",
      "ToDate": "",
      "BrandOwner": "",
      "Type": "",
      'backDateOrder': this.backDate == true ? 1 : 0 
    };

    let fdate = "";
    let tdate = "";
    if (this.advSearchObjTmp.adv_fromDate != "") {
      fdate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.advSearchObjTmp.adv_fromDate).toString();
    }
    if (this.advSearchObjTmp.adv_toDate != "") {
      tdate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.advSearchObjTmp.adv_toDate).toString();
    }

    Export_Criteria.ShopName = this.advSearchObjTmp.adv_shopsyskey;
    Export_Criteria.UserName = this.advSearchObjTmp.adv_usersyskey;
    Export_Criteria.FromDate = fdate;
    Export_Criteria.ToDate = tdate;
    Export_Criteria.BrandOwner = this.advSearchObjTmp.adv_brandOwnerSyskey;
    Export_Criteria.Type = this.currentType.toString();

    const url = this.manager.appConfig.apiurl + 'sop/getOrderListforExcel';

    this.http.post(url, Export_Criteria, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.message == "SUCCESS") {


          let cri_flag = 0;
          let excelDataList: any = [];
          let date_str: any;
          let excelTitle = "Deliver List";
          let excelHeaderData = [
            "Status", "Invoice No", "Date", "Brand Owner","Shop Name", "SubTotal Amount", "Order Total Amount",
            "Return Total Amount","Tax", "SalePerson Name", "SalePerson Type","SaleType"
          ];

          for (var data_i = 0; data_i < data.dataList.length; data_i++) {
            let excelData = [];

            date_str = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data.dataList[data_i].date);

            excelData.push(data.dataList[data_i].status=='128'?'paid':'void');
            excelData.push(data.dataList[data_i].orderNumber);
            excelData.push(date_str);
            excelData.push(data.dataList[data_i].brandOwner);
            excelData.push(data.dataList[data_i].shopName);
            excelData.push(data.dataList[data_i].subTotalAmount);
            excelData.push(data.dataList[data_i].orderTotalAmount);
            excelData.push(data.dataList[data_i].returnTotalAmount);
            excelData.push(data.dataList[data_i].taxAmount);
            excelData.push(data.dataList[data_i].salePersonName);
            excelData.push(this.manager.getUserTypeDesc(parseInt(data.dataList[data_i].salePersonType)));
            excelData.push(data.dataList[data_i].salesTypeDesc);

            excelDataList.push(excelData);
          }

          let workbook = new Workbook();
          let worksheet = workbook.addWorksheet('Delivery List Data');

          let titleRow = worksheet.addRow(["", "", excelTitle]);
          titleRow.font = { bold: true };
          worksheet.addRow([]);

          let criteriaRow;
          if (Export_Criteria.ShopName != "") {
            criteriaRow = worksheet.addRow(["Shop Name : " + data.dataList[0].shopName.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          if (Export_Criteria.UserName != "") {
            criteriaRow = worksheet.addRow(["User Name : " + data.dataList[0].salePersonName.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          if (Export_Criteria.FromDate != "") {
            criteriaRow = worksheet.addRow(["From Date : " + Export_Criteria.FromDate.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          if (Export_Criteria.ToDate != "") {
            criteriaRow = worksheet.addRow(["To Date : " + Export_Criteria.ToDate.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          if (Export_Criteria.BrandOwner != "") {
            criteriaRow = worksheet.addRow(["Brand Owner : " + data.dataList[0].brandOwner.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }

          if (cri_flag == 0) {
            criteriaRow = worksheet.addRow(["Search With No Criteria"]);
            criteriaRow.font = { bold: true };
          }
          worksheet.addRow([]);

          let headerRow = worksheet.addRow(excelHeaderData);
          headerRow.font = { bold: true };
          for (var i_data = 0; i_data < excelDataList.length; i_data++) {
            worksheet.addRow(excelDataList[i_data]);
          }

          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, "Delivery_List_export_" + new Date().getTime() + EXCEL_EXTENSION);
          });
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  print1() {


    let excelTitle = "Order Detail Report";
    let excelHeaderData1 = ["Name", "Code", "OwnerName", "Phone", "Address"];
    let excelHeaderData2 = ["Name", "Type", "Date"];
    let excelHeaderData3 = [
      "Order SKU Total Amount", "Return SKU Total Amount", "Subtotal", "Submitted Amount",
      "Discount Amount", "Due Amount", "Tax Amount", "Tax Percent", "Currency Code", "Currency Rate"
    ];
    let excelHeaderData4 = [
      "SKU Name", "SKU Code", "Brand Owner", "Price", "Rtn Price", "Rtn Qty",
      "Rtn Total Price", "Order Qty", "Order Total Price", "Subtotal"
    ];

    let excelData1 = this.prepareShopDetailExport();
    let excelData2 = this.prepareUserDetailExport();
    let excelData3 = this.prepareOrderHeaderExport();
    let excelData4 = this.prepareOrdersExport();

    let workbook = new Workbook();
    let worksheet1 = workbook.addWorksheet('Shop Detail');
    let worksheet2 = workbook.addWorksheet('User Detail');
    let worksheet3 = workbook.addWorksheet('Order Header');
    let worksheet4: any;

    if (this.tab_flag == "Sale") {
      worksheet4 = workbook.addWorksheet('Sale Orders');
    } else if (this.tab_flag == "Delivery") {
      worksheet4 = workbook.addWorksheet('Delivery Orders');
    }

    let titleRow1 = worksheet1.addRow(["", "", excelTitle]);
    titleRow1.font = { bold: true };
    worksheet1.addRow([]);
    let headerRow1 = worksheet1.addRow(excelHeaderData1);
    headerRow1.font = { bold: true };
    worksheet1.addRow(excelData1);

    let titleRow2 = worksheet2.addRow(["", "", excelTitle]);
    titleRow2.font = { bold: true };
    worksheet2.addRow([]);
    let headerRow2 = worksheet2.addRow(excelHeaderData2);
    headerRow2.font = { bold: true };
    worksheet2.addRow(excelData2);

    let titleRow3 = worksheet3.addRow(["", "", excelTitle]);
    titleRow3.font = { bold: true };
    worksheet3.addRow([]);
    let headerRow3 = worksheet3.addRow(excelHeaderData3);
    headerRow3.font = { bold: true };
    worksheet3.addRow(excelData3);

    let titleRow4 = worksheet4.addRow(["", "", excelTitle]);
    titleRow4.font = { bold: true };
    worksheet4.addRow([]);
    let headerRow4 = worksheet4.addRow(excelHeaderData4);
    headerRow4.font = { bold: true };
    for (var i_data = 0; i_data < excelData4.length; i_data++) {
      worksheet4.addRow(excelData4[i_data]);
    }

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: EXCEL_TYPE });
      FileSaver.saveAs(blob, "Order_Detail_List_export_" + new Date().getTime() + EXCEL_EXTENSION);
    });
  }

  prepareShopDetailExport() {
    return [
      this.soObj.shopname,
      this.soObj.n1,
      this.soShop.personName,
      this.soShop.phno,
      this.soShop.address
    ];

  }

  prepareUserDetailExport() {
    return [
      this.soObj.username,
      this.soObj.userType,
      this.manager.formatDate(this.orderDate, 'yyyyMMdd')
    ];

  }

  prepareOrderHeaderExport() {
    return [
      this.myOrderObj.normalSkuTotalAmount,
      this.myOrderObj.returnSkuTotalAmount,
      this.myOrderObj.subTotal,
      this.soObj.n5,
      this.myOrderObj.discount,
      this.myOrderObj.dueTotal,
      this.soObj.n14,
      this.soObj.n12,
      "MMK",
      this.soObj.n4
    ];

  }

  prepareOrdersExport() {
    let return_result: any = [];
    let res: any = {};
    let rtn_totprice = 0;
    let order_totprice = 0;

    for (var i = 0; i < this.sop003.length; i++) {
      for (var j = 0; j < this.sop003[i].transDetailsData.length; j++) {
        rtn_totprice = this.sop003[i].transDetailsData[j].return.n6 * this.sop003[i].transDetailsData[j].return.n10;
        order_totprice = this.sop003[i].transDetailsData[j].normal.n6 * this.sop003[i].transDetailsData[j].price;

        res = [
          this.sop003[i].transDetailsData[j].name,
          this.sop003[i].transDetailsData[j].code,
          this.sop003[i].transDetailsData[j].brandowner.t2,
          this.sop003[i].transDetailsData[j].price,
          this.sop003[i].transDetailsData[j].return.n10,
          this.sop003[i].transDetailsData[j].return.n6,
          rtn_totprice,
          this.sop003[i].transDetailsData[j].normal.n6,
          order_totprice,
          this.sop003[i].transDetailsData[j].total
        ];

        return_result.push(res);
      }
    }

    return return_result;

  }

  new() {
    $("#cboStateDeli").prop('selectedIndex', 0);
    $("#cboStateDeli :selected").val("");
    $("#cboDistrictDeli").prop('selectedIndex', 0);
    $("#cboDistrictDeli :selected").val("");
    $("#cboTownshipDeli").prop('selectedIndex', 0);
    $("#cboTownshipDeli :selected").val("");
    $("#newdel-shop").value = "";
    this.stateList = [];
    this.districtList = [];
    this.townshipList = [];
    this.newDelSearchFromGroup.get('store-list').setValue([]);

    this.getShopList();
    this.reset();
    this.advSearchObjTmp = this.searchObjTmp();
    this.currentType = this.manager.tranType.SaleOrder.code;
    this.soObj.transType = this.manager.tranType.SaleOrder.code;
    this.soObj.username = this.manager.user.userName;
    this.soObj.userType = this.manager.getUserTypeDesc(this.manager.user.usertype);

    this.orderDate = new Date();
    this.soObj.t4 = this.manager.formatDate(this.orderDate, 'yyyyMMdd');
    this.soObj.n21 = this.manager.user.userSk;
    this.btn = true;
    $('#delordnew-tab').tab('show');
  }
  compareDate(date1, date2, DateFormatFlag1, DateFormatFlag2) {
    let Your_Date: any;
    let Compare_Date: any;

    if (DateFormatFlag1 == 1) {
      Your_Date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoDTP, date1);
    } else if (DateFormatFlag1 == 2) {
      Your_Date = this.manager.dateFormatCorrector(this.manager.dateFormatter.UItoDTP, date1);
    } else {
      Your_Date = date1;
    }

    if (DateFormatFlag2 == 1) {
      Compare_Date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoDTP, date2);
    } else if (DateFormatFlag2 == 2) {
      Compare_Date = this.manager.dateFormatCorrector(this.manager.dateFormatter.UItoDTP, date2);
    } else {
      Compare_Date = date2;
    }

    Your_Date.setHours(0, 0, 0, 0);
    Compare_Date.setHours(0, 0, 0, 0);

    if (+Compare_Date > +Your_Date) {
      return false;
    }

    return true;
  }
  pageChanged(e) {
    this.config.currentPage = e;

    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.getDeliveryOrderListByBo(currentIndex, false);
  }
  getShopListForAutoComplete() {
    this.shopNameSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.shopNameSearchAutoFill(term).subscribe(
            data => {
              this.shoplist = data as any[];
            });
        }
      }
    );
    this.shopNameSearchCri.valueChanges.subscribe (
       (search:string)=>{
        if (search != '') {
          this.manager.shopNameSearchAutoFill(search).subscribe(
            data => {
             
              this.shopNameSearchCri_shopList = data as any[];
            });
        }
       }
    )
  }
  voidOrder(id) {

    if (id !== '' && id !== undefined) {
      this.alertCtrl.create({
        header: 'Confirm delete?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              //console.log('Confirm Cancel: blah');
            }
          },
          {
            text: 'Okay',
            handler: () => {
              this.loadCtrl.create({
                message: "Processing",
                backdropDismiss: false,
                duration: 5000
              }).then(
                el => {
                  el.present();
                  const url = this.manager.appConfig.apiurl + 'sop/void-web/' + id;
                  this.http.get(url, this.manager.getOptions()).subscribe(
                    (data: any) => {
                      el.dismiss();
                      if (data.message == "SUCCESS") {
                        this.manager.showToast(this.tostCtrl, "Message", "Success", 1000).then(
                          dis => {
                            this.afterSave();
                          }
                        )
                      } else {
                        this.manager.showToast(this.tostCtrl, "Message", data.message, 1000).then(
                          dis => {

                          }
                        )
                      }
                    },
                    (error: any) => {
                      el.dismiss();
                    }
                  )

                }
              )
            }
          }

        ]
      }).then(el => {
        el.present();
      })
    }

  }
  dateOptionsChange() {

    let dateOption = this.manager.getDateOptions(this.advSearchObjTmp.dateOptions);
    this.advSearchObjTmp.adv_fromDate = dateOption.fromDate;
    this.advSearchObjTmp.adv_toDate = dateOption.toDate;

  }
  streamOpened() {
    this.advSearchObjTmp.dateOptions = "NA"
  }
  async calculate2() {
    this.sop003.forEach(sop003 => {
      sop003.n5 = 0.0;
      sop003.normalSkuTotalAmount = 0.0;
      sop003.returnSkuTotalAmount = 0.0;
      sop003.total100Percent = 0.0;
      sop003.invDiscount = 0.0;
      if (sop003.n7 == null || sop003.n7 == '' || sop003.n7 == undefined) 
      {
        sop003.n7 = 0.0;
      }else
      {
        sop003.n7 = this.deciPlaceSetting.isUseCalcDeciPlace ? parseFloat(sop003.n7.toFixed(this.deciPlaceSetting.calcDeciPlace)) : sop003.n7;
      }
      sop003.skuOrderType.order.forEach((orderSku) => {
        if (orderSku.recordStatus !== 4) {
          // sop003.normalSkuTotalAmount += (orderSku.n10 * orderSku.n6);
          // orderSku.n13 = parseFloat((orderSku.n11 * orderSku.n6).toFixed(this.deciPlaceSetting.calcDeciPlace));
          orderSku.n14 = this.deciPlaceSetting.isUseCalcDeciPlace ? 
                        parseFloat(((orderSku.n34 * orderSku.n6) - orderSku.n13).toFixed(this.deciPlaceSetting.calcDeciPlace))  : 
                        (orderSku.n34 * orderSku.n6) -orderSku.n13;
          sop003.normalSkuTotalAmount += (orderSku.n14);
        }
      });
      sop003.skuOrderType.return.forEach(returnSku => {
        if (returnSku.recordStatus !== 4) {
          sop003.returnSkuTotalAmount += (returnSku.n10 * returnSku.n6);
          returnSku.n14 = (returnSku.n10 * returnSku.n6);
          // returnSku.n13 = parseFloat((returnSku.n11 * returnSku.n6).toFixed(this.deciPlaceSetting.calcDeciPlace));//for qty inc/desc
          // returnSku.n14 = this.deciPlaceSetting.isUseCalcDeciPlace ? 
          //               parseFloat(((returnSku.n34 * returnSku.n6) - returnSku.n13).toFixed(this.deciPlaceSetting.calcDeciPlace))  : 
          //               (returnSku.n34 * returnSku.n6) - returnSku.n13;
          // sop003.returnSkuTotalAmount += (returnSku.n14);
        }
      });
      sop003.total100Percent = (sop003.normalSkuTotalAmount - sop003.returnSkuTotalAmount);
      // const n5 = sop003.total100Percent - sop003.n7;
      let n5 = sop003.normalSkuTotalAmount - sop003.n7;

      if (sop003.n33 > 0 && sop003.n8 == 0) {
        sop003.n5 = n5 - sop003.n8;
      } else {
        sop003.n5 = this.manager.calculateNetDiscount(n5, sop003.n8, 2);
      }
      sop003.n5 = sop003.n5 - sop003.returnSkuTotalAmount;
      sop003.n5 = Math.round(sop003.n5);
      this.cashAmountChange(sop003);
    })
  }
  parseToDecimal(val) {
    let dec = 0.0;
    if(val != null && val != '' && val != undefined)
    {
      dec = this.deciPlaceSetting.isUseDisplayDeciPlace ? val.toFixed(this.deciPlaceSetting.displayDeciPlace) : val;
    }
    return this.manager.numberWithCommas(dec)
  }

  cashAmountChange(bo) {
    if (bo.total100Percent < 0) {
      bo.n37 = bo.total100Percent;
      bo.n38 = 0;
    } else {
      if (bo.n37 > bo.total100Percent)
        bo.n37 = 0;
      else {
        bo.n38 = bo.total100Percent - (bo.n35 + bo.n36 + bo.n37);
      }
    }
    //this.calculate();
  }
  cashAmountChangeAfterSave(bo) {
/*     if (bo.n5 < 0) {     //Original//don't delete
      bo.n37 = bo.n5;
      bo.n38 = 0;
    } else {
      if (bo.n37 > bo.n5)
        bo.n37 = 0;
      else {
        bo.n38 = bo.n5 - (bo.n35 + bo.n36 + bo.n37);
      }
    }
    //this.calculate(); */
    if(this.isUseSAP){
      if(this.soObj.t34 === 'Z215'){//cash sales
        bo.n37 = bo.n5;
        bo.n38 = 0;
      }else if(this.soObj.t34 === 'Z214'){//credit sales
        bo.n37 = 0;
        bo.n38 = bo.n5 - (bo.n35 + bo.n36 + bo.n37);
      }else{
        bo.n37 = bo.n5;
        bo.n38 = 0;
      }
    }else{
      bo.n37 = bo.n5;
      bo.n38 = 0;
    }    
  }

  getReturnSKU() {
    $('#returnSkuModel').appendTo("body").modal('show');
    this.getReturnSKUService();
    // $('#returnSkuModel #rollback-search-btn').click(() => {
    //   this.getReturnSKUService();
    // });

  }
  getReturnSKUService() {
    // let con = true;
    // if(isSearch == false){
    //   con = false;
    //   if (this.expireSku.expireSku.length == 0) con = true;
    // }

    // if (con) {

    // }
    let date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.soObj.createddate);
    const url = this.manager.appConfig.apiurl + 'sop/get-invoice-return';
    let param = {
      "count": parseInt($('#rollback-search-input').val()),
      "brandownerSyskey": "0",
      "date": date,
      "storeSyskey": this.soShop.shopSysKey
    }

    $('.spinner-rollback-invoice').addClass('show');
    $('#rollback-search-btn').prop('disabled', true);
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.status == "SUCCESS") {
          data.data.map(h => {
            h.createddate = this.manager.formatDateByDb(h.createddate);
          });
          this.expireSku.expireSku = data.data;
          $('.spinner-rollback-invoice').removeClass('show');
          $('#rollback-search-btn').prop('disabled', false);

          if (data.data.length == 0) {
            $('#returnSkuModel').appendTo("body").modal('hide');
            this.manager.showToast(this.tostCtrl, "Message", "No record!", 1000);
          }
        }
      }, () => {
        $('.spinner-rollback-invoice').removeClass('show');
        $('#rollback-search-btn').prop('disabled', false);
      }
    )

  }
  addReturnSkuBtn(model) {
    const selectedExpireStocks = model.selectedOptions.selected.map(selectedOption => {
      return { detail: this.mapModelSop002(selectedOption.value.detail), 
               brandOwner: selectedOption.value.brandOwner,
               header:  selectedOption.value.header};
    });
    this.expireStockList.deselectAll();
    // if (this.expireSku.param.index != -1) {
      selectedExpireStocks.map(ex => {
      if(ex.detail.n39 > 0)
      {
        const mySop003IndexList = this.sop003.map(sop003 => { return sop003.n1 });
        let mySop003Index = mySop003IndexList.indexOf(ex.brandOwner.n1);
        if (mySop003Index == -1) {
          let newBrandOwner = this.getBrandOwnerObj();
          newBrandOwner.recordStatus = 1;
          newBrandOwner.n1 = ex.brandOwner.brandowner.syskey;
          newBrandOwner.t4 = ex.brandOwner.brandowner.t1;
          newBrandOwner.t5 = ex.brandOwner.brandowner.t2;
  
          ex.detail.ref1 = ex.detail.syskey;
          ex.detail.t15 = ex.header.t2;
          ex.detail.syskey = "0";
          // ex.detail.n39 = parseInt(ex.detail.n6);
          ex.detail.n6 = 1;
          ex.detail.n40 = 2;
  
          ex.detail.n14 = ex.detail.n10 * ex.detail.n6;
          newBrandOwner.skuOrderType.return.push(ex.detail);
          this.sop003.push(newBrandOwner);
  
        } else {
          let expSop002Index = this.sop003[mySop003Index].skuOrderType.return.map(e => { return e.ref1; }).indexOf(ex.detail.syskey);
          if (expSop002Index == -1) {
            //expired stock not exist in remaining order
            ex.detail.ref1 = ex.detail.syskey;
            ex.detail.t15 = ex.header.t2;
            ex.detail.syskey = "0";
            // ex.detail.n39 = parseInt(ex.detail.n6);
            ex.detail.n6 = 1;
            ex.detail.n40 = 2;
  
            ex.detail.n14 = ex.detail.n10 * ex.detail.n6;
            this.sop003[mySop003Index].skuOrderType.return.push(ex.detail);
          } else {
            if (this.sop003[mySop003Index].skuOrderType.return[expSop002Index].recordStatus == 4)
              this.sop003[mySop003Index].skuOrderType.return[expSop002Index].recordStatus = 1;
            else
              this.manager.showToast(this.tostCtrl, "Message", "Item already exists", 1000)
          }
        }
      }else
      {
        this.manager.showToast(this.tostCtrl, "Message", "No More Return QTY", 1000)
      }

    });
    this.calculate2();

    // }

  }
  removeReturnSkuBtn() {
    this.expireStockList.deselectAll();
  }
  isLessthenZero(value) {
    return value < 0 ? true : false;
  }
  checkNewExpireStockQtyType(detail) {
    if (detail.ref1 !== "" && detail.ref1 !== "0") {
      return true;
    } else {
      return false;
    }
  }

  diplayFormatDate(dbDate) {
    if (dbDate == "") return "-"
    else
      return this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, dbDate);
  }

  async muldis4(isSave) {
    $('#progressbar-1').show();
    $('#btn-delivery-update').prop('disabled', true);
    if (isSave) {
      $('#spinner-delivery-update').show();
    }
    $('#tabel-detail :input').attr('disabled', true);

    for (let i = 0; i < this.sop003.length; i++) {
      let mainSkuList = this.sop003[i].skuOrderType.order.filter(sku => {
        return sku.n40 == 1 && sku.recordStatus !== 4;
      });
      let mainDeletedSkuList = this.sop003[i].skuOrderType.order.filter(sku => {
        return sku.n40 == 1 && sku.recordStatus == 4;
      });
      //multi
      let multiDis = {
        getPromoStockList: [],
        giftList: []
      }
      await this.manager.calculateMultiDiscount3(mainSkuList, this.soShop.shopSysKey, this.soObj.createddate).then((data) => {
        multiDis = data as any;
      }).catch(() => { });
      //single
      let singleDis = [];
      await this.manager.getVolDiscount2(
        mainSkuList.map(parentItem => {
          return {
            'itemTotalAmount': parentItem.n34 * parentItem.n6,
            'itemDesc': '',
            'itemAmount': parentItem.n34,
            'itemQty': parentItem.n6,
            'itemSyskey': parentItem.n1,
            'shopSyskey': this.soShop.shopSysKey,
            'date': parentItem.t7
          }
        })
      ).then((data: []) => { singleDis = data }).catch(() => { })

      let proList = []; // is a group of all promotion item by volume discount
      let orderList = []; //is a group of all stocks map by volume discount;
      let orderList2 = []; // is a final stock according to volume discount;
      for (let y = 0; y < mainSkuList.length; y++) {
        //single
        const sinVolRes: { p: any, c: any } = this.singleVolumeDiscount(mainSkuList[y], singleDis, i);
        mainSkuList[y] = sinVolRes.p;
        for (let child of sinVolRes.c) {
          proList.push(child);
        }

        //multi
        let promotionList = multiDis.getPromoStockList.filter(pro => {
          return pro.itemSyskey == mainSkuList[y].n1;
        });
        if (promotionList.length > 0) {
          if (promotionList[0].discountPercent > 0) {
            mainSkuList[y].n12 = promotionList[0].discountPercent;
            mainSkuList[y].ref3 = promotionList[0].discountDetailSyskey;
            if(this.deciPlaceSetting.calcDeciPlace)
            {
              mainSkuList[y].n11 = this.manager.calculateDiscount(mainSkuList[y].n34, promotionList[0].discountPercent, this.deciPlaceSetting.calcDeciPlace);
              mainSkuList[y].n10 = parseFloat(this.manager.calculateNetDiscount(mainSkuList[y].n34, promotionList[0].discountPercent, this.deciPlaceSetting.calcDeciPlace).toFixed(this.deciPlaceSetting.calcDeciPlace));
              mainSkuList[y].n13 = parseFloat((mainSkuList[y].n11 * mainSkuList[y].n6).toFixed(this.deciPlaceSetting.calcDeciPlace));
              mainSkuList[y].n14 = parseFloat(((mainSkuList[y].n34 * mainSkuList[y].n6) - mainSkuList[y].n13).toFixed(this.deciPlaceSetting.calcDeciPlace));    
            }else
            {
              mainSkuList[y].n11 = this.manager.calculateDiscount(mainSkuList[y].n34, promotionList[0].discountPercent, this.deciPlaceSetting.calcDeciPlace);
              mainSkuList[y].n10 = this.manager.calculateNetDiscount(mainSkuList[y].n34, promotionList[0].discountPercent, this.deciPlaceSetting.calcDeciPlace);
              mainSkuList[y].n13 = mainSkuList[y].n11 * mainSkuList[y].n6;
              mainSkuList[y].n14 = (mainSkuList[y].n34 * mainSkuList[y].n6) - mainSkuList[y].n13;    
            }     
          } else {
            mainSkuList[y].ref3 = promotionList[0].discountDetailSyskey;
          }
        }
        orderList.push(mainSkuList[y]);
      }

      multiDis.giftList.map(gl => {
        let isEndType_TotalItem = false;
        let totalQtyItem = -1;
        let sku_child_list = [];
        /*
        [
          [],[],[]
        ]
        */
        gl.giftInfoList.map(mulPro => { //[...]
          let sku_subchild_list = [];
          for (let i in mulPro) { // [[...]]
            if (mulPro[i].discountItemRuleType == 'Total Item' && mulPro[i].discountItemEndType == 'END') {
              isEndType_TotalItem = true;
              totalQtyItem = mulPro[i].discountItemQty;
            }
            sku_subchild_list.push(((): Sop002_Interface => {
              let s2: Sop002_Interface = this._getSop002Interface();
              s2.syskey = '0';
              s2.parentSkuSyskey = "0";
              s2.t2 = mulPro[i].discountStockSyskey == '' ? mulPro[i].discountGiftCode : mulPro[i].discountStockCode;
              s2.t3 = mulPro[i].discountItemDesc;
              s2.t7 = "";
              s2.ref1 = mulPro[i].discountStockSyskey == '' ? 0 : mulPro[i].discountStockSyskey;
              s2.ref3 = gl.discountDetailSyskey;
              s2.parentid = "0";
              s2.n1 = mulPro[i].discountItemSyskey;
              s2.n6 = mulPro[i].discountItemQty;
              s2.n10 = 0.0;
              s2.n11 = 0.0;  //dis amount
              s2.n12 = 0.0;  //dis %
              s2.n34 = 0.0;
              s2.n40 = 3;    // 1-normal,2-return,3-promotion
              s2.n42 = mulPro[i].discountItemType == 'GIFT' ? 1 : 2;
              return s2;
            })());
          }
          sku_child_list.push([...sku_subchild_list]);
        });
        if (isEndType_TotalItem) { // End Type is 'Total Item'
          for (let i in sku_child_list) {
            proList = [...proList, ...(sku_child_list[i].map(c => {
              c.isEndTypeTotalItem = isEndType_TotalItem;
              c.n6 = 1;
              c.maxQty = totalQtyItem;
              return c;
            }))];
          }
        } else {
          let group_child_list = [];
          for (let i in sku_child_list) {
            let subChildItem = this._getSop002Interface();
            for (let y = 0; y < sku_child_list[i].length; y++) {
              let item = sku_child_list[i][y];
              item.isEndTypeTotalItem = isEndType_TotalItem;
              if (y == 0) {
                subChildItem.syskey = item.syskey;
                subChildItem.parentSkuSyskey = item.parentSkuSyskey;
                subChildItem.t2 = item.t2;
                subChildItem.t3 = item.t3;
                subChildItem.t7 = item.t7;
                subChildItem.n1 = item.n1;
                subChildItem.n6 = item.n6;
                subChildItem.n10 = item.n10;
                subChildItem.n11 = item.n11;
                subChildItem.n12 = item.n12;
                subChildItem.n34 = item.n34;
                subChildItem.n40 = item.n40;
                subChildItem.n42 = item.n42;
                subChildItem.ref1 = item.ref1;
                subChildItem.ref3 = item.ref3;
                subChildItem.parentid = item.parentid;
                subChildItem.isEndTypeTotalItem = isEndType_TotalItem;
              }
            }
            subChildItem.stockPromotionSubDetailData = sku_child_list[i];
            group_child_list.push(subChildItem)
          }
          proList = [...proList, ...group_child_list];
        }
      });

      let groupOrderList = this.manager.groupArrayIntoOneArray(orderList);
      // groupOrderList.map(proDetailGroup => {
      for (let proDetailGroup of groupOrderList) {
        let stkRef3 = proDetailGroup[proDetailGroup.length - 1].ref3;
        let specProList = proList.filter((promo: Sop002_Interface) => {
          return promo.ref3 == stkRef3;
        });
        orderList2 = [...orderList2, ...proDetailGroup];
        specProList = specProList.map((specPro: Sop002_Interface) => {
          specPro.parentSkuSyskey = proDetailGroup[proDetailGroup.length - 1].n1;
          specPro.parentid = proDetailGroup[proDetailGroup.length - 1].syskey;
          specPro.stockPromotionSubDetailData.forEach((child: Sop002_Interface) => {
            child.parentSkuSyskey = proDetailGroup[proDetailGroup.length - 1].n1;
            child.parentid = proDetailGroup[proDetailGroup.length - 1].syskey;
          });
          return specPro;
        });
        orderList2 = [...orderList2, ...specProList];
      }
      this.sop003[i].skuOrderType.order = [...orderList2, ...mainDeletedSkuList];
    };
    this.calculate2();
    $('#tabel-detail :input').attr('disabled', false);
    $('#progressbar-1').hide();
    if (isSave) {
      $('#spinner-delivery-update').hide();
      
    }
    $('#btn-delivery-update').prop('disabled', false);
    if (isSave) {
      this.prepareToSave2(true);
    }
  }
  async quantityChange2(d, type) {
    if (type == 2) {
      if (d.n6 <= 0) {
        d.n6 = 1;
      } else {
        if (this.checkNewExpireStockQtyType(d)) {
          if (d.n6 > d.n39) d.n6 = 1;
          if (d.n6 < 0) d.n6 = 1;
        }
      }
      this.calculate2();
    } else {
      if (d.n6 <= 0) {
        d.n6 = 1;
      }
      $('#progressbar-1').show();
      $('#tabel-detail :input').attr('disabled', true);
      $('#btnPreview').attr('disabled', true);
      await this.addVolumeDiscountItem4();
      this.calculate2();
      $('#tabel-detail :input').attr('disabled', false);
      $('#progressbar-1').hide();
      $('#btnPreview').attr('disabled', false);
    }

  }
  async qtyProItemChange(bo, proItem) {
    let totalQty = bo.skuOrderType.order.filter(sku => {
      return sku.parentSkuSyskey == proItem.parentSkuSyskey;
    }).reduce((a, c) => {
      return a + c.n6
    }, 0);
    if (totalQty > proItem.maxQty) {
      proItem.n6 = 1;
      this.manager.showToast(this.tostCtrl, 'Alert',
        'Input exceeds maximum allowed qty of \n' + proItem.maxQty + ' by ' + (totalQty - proItem.maxQty) + '!',
        1500);
      proItem.n6 = 0;
    } else {
      if (proItem.n6 < 0) proItem.n6 = 0;
    }
  }
  async qtyInvProItemChange(bo, proItem) {
    let totalQty = 0;
    for (let i = 0; i < bo.promotionList.length; i++)
    {
       totalQty = totalQty + bo.promotionList[i].n6;
    }
    if (totalQty > proItem.maxQty) {
      proItem.n6 = 1;
      // this.showToast(this.tostCtrl, 'Alert',
      //   'Input exceeds maximum allowed qty of \n' + proItem.maxQty + ' by ' + (totalQty - proItem.maxQty) + '!',
      //   1500);
      $('#overmaxqtydeli').html('<span style="color:red;font-size:3;">Input exceeds maximum allowed QTY '+proItem.maxQty + ' by ' + (totalQty - proItem.maxQty) +'!</span>'); 
      proItem.n6 = 0;
    } else {
      if (proItem.n6 < 0) proItem.n6 = 0;
      $('#overmaxqtydeli').html('');
    }
  }
  async addVolumeDiscountItem4() {
    for (let i = 0; i < this.sop003.length; i++) {
      let result = [];
      let orderedStockList = this.sop003[i].skuOrderType.order.filter(sku => {
        return sku.n40 == 1 && sku.recordStatus !== 4;
      });
      let mainDeletedSkuList = this.sop003[i].skuOrderType.order.filter(sku => {
        return sku.n40 == 1 && sku.recordStatus == 4;
      });
      //single
      let getVolDiscountResult = [];
      await this.manager.getVolDiscount2(
        orderedStockList.map(parentItem => {
          return {
            'itemTotalAmount': parentItem.n34 * parentItem.n6,
            'itemAmount': parentItem.n34,
            'itemQty': parentItem.n6,
            'itemSyskey': parentItem.n1,
            'shopSyskey': this.soShop.shopSysKey,
            'date': parentItem.t7
          }
        })
      ).then(
        (data: []) => {
          getVolDiscountResult = data;
        }
      );
      orderedStockList.map((parentStock: Sop002_Interface) => {
        const sinVolRes: { p: any, c: any } = this.singleVolumeDiscount(parentStock, getVolDiscountResult, i);
        result.push(sinVolRes.p);
        result = [...result, ...sinVolRes.c];
      });
      this.sop003[i].skuOrderType.order = [...result, ...mainDeletedSkuList];
    }

  }
  mapPromotionStock4(sku, parent: MultiDiscount, child: MultiDiscount_Gift): Sop002_Interface {
    let m = this._getSop002Interface();
    m.syskey = '0';
    m.parentSkuSyskey = sku.n1;
    m.t2 = child.discountStockSyskey == '' ? child.discountGiftCode : child.discountStockCode;
    m.t3 = child.discountItemDesc;
    m.t7 = "";
    m.ref1 = child.discountStockSyskey == '' ? '0' : child.discountStockSyskey;
    m.ref3 = parent.discountDetailSyskey;
    m.parentid = sku.syskey;
    m.n1 = child.discountItemSyskey;
    m.n6 = child.discountItemQty;
    m.n10 = 0.0;
    m.n11 = 0.0;  //dis amount
    m.n12 = 0.0;  //dis %
    m.n34 = 0.0;
    m.n40 = 3;    // 1-normal,2-return,3-promotion
    m.n42 = child.discountItemType == 'GIFT' ? 1 : 2;
    m.discountItemEndType = child.discountItemEndType;
    //m.stockPromotionSubDetailData = child;
    return m;
  }
  selectPromotion(d: Sop002_Interface, i: number) {
    d.syskey = d.stockPromotionSubDetailData[i].syskey;
    d.parentSkuSyskey = d.stockPromotionSubDetailData[i].parentSkuSyskey;
    d.t2 = d.stockPromotionSubDetailData[i].t2;
    d.t3 = d.stockPromotionSubDetailData[i].t3;
    d.t7 = d.stockPromotionSubDetailData[i].t7;
    d.ref1 = d.stockPromotionSubDetailData[i].ref1;
    d.ref3 = d.stockPromotionSubDetailData[i].ref3;
    d.parentid = d.stockPromotionSubDetailData[i].parentid;
    d.n1 = d.stockPromotionSubDetailData[i].n1;
    d.n6 = d.stockPromotionSubDetailData[i].n6;
    d.n10 = d.stockPromotionSubDetailData[i].n10;
    d.n11 = d.stockPromotionSubDetailData[i].n11;
    d.n12 = d.stockPromotionSubDetailData[i].n12;
    d.n34 = d.stockPromotionSubDetailData[i].n34;
    d.n40 = d.stockPromotionSubDetailData[i].n40;
    d.n42 = d.stockPromotionSubDetailData[i].n42;
    d.isEndTypeTotalItem = d.stockPromotionSubDetailData[i].isEndTypeTotalItem;
    //d.maxQty = d.stockPromotionSubDetailData[i].maxQty;
  }
  getPreSellerName(syskey) {
    return new Promise((done, reject) => {
      const url = this.manager.appConfig.apiurl + 'sop/get-preseller/' + syskey + '/' + 421;
      this.http.get(url, this.manager.getOptions()).subscribe(
        (data: any) => {
          if (data.status == 'SUCCESS')
            done(data.data.userName);
          else reject();
        },
        error => {
          reject();
        }
      )
    })

  }
  singleVolumeDiscount(parentStock: Sop002_Interface, getVolDiscountResult: any, sop003Index: number) {
    let resParentItem, proItemList = [];

    let discountItemList = getVolDiscountResult.filter((discountItem: MultiDiscount) => {
      return discountItem.itemSyskey === parentStock.n1 //sku.n1 is stock syskey
    });
    if (discountItemList.length > 0) {
      parentStock.ref3 = discountItemList[0].discountDetailSyskey;
      if (discountItemList[0].discountPercent > 0) {
        parentStock.n12 = discountItemList[0].discountPercent;
        if(this.deciPlaceSetting.isUseCalcDeciPlace)
        {
          parentStock.n11 = this.manager.calculateDiscount(parentStock.n34, discountItemList[0].discountPercent, this.deciPlaceSetting.calcDeciPlace);
          parentStock.n10 = parseFloat(this.manager.calculateNetDiscount(parentStock.n34, discountItemList[0].discountPercent, this.deciPlaceSetting.calcDeciPlace).toFixed(this.deciPlaceSetting.calcDeciPlace));
          parentStock.n13 = parseFloat((parentStock.n11 * parentStock.n6).toFixed(this.deciPlaceSetting.calcDeciPlace));
          parentStock.n14 = parseFloat(((parentStock.n34 * parentStock.n6) - parentStock.n13).toFixed(this.deciPlaceSetting.calcDeciPlace)); 
        }else
        {
          parentStock.n11 = this.manager.calculateDiscount(parentStock.n34, discountItemList[0].discountPercent, this.deciPlaceSetting.calcDeciPlace);
          parentStock.n10 = this.manager.calculateNetDiscount(parentStock.n34, discountItemList[0].discountPercent, this.deciPlaceSetting.calcDeciPlace);
          parentStock.n13 = parentStock.n11 * parentStock.n6;
          parentStock.n14 = (parentStock.n34 * parentStock.n6) - parentStock.n13; 
        }
      }
      resParentItem = parentStock;

      let isEndType_TotalItem = false;
      let totalQtyItem = -1;
      let sku_child_list = [];
      for (let index in discountItemList[0].giftList) {
        let mulPro = discountItemList[0].giftList[index];
        let sub_child_list = [];
        for (let i in mulPro) {
          let multiDiscountGiftItem: MultiDiscount_Gift = mulPro[i];
          if (multiDiscountGiftItem.discountItemRuleType == 'Total Item'
            && multiDiscountGiftItem.discountItemEndType == 'END') {
            totalQtyItem = multiDiscountGiftItem.discountItemQty;
            isEndType_TotalItem = true;
          }
          sub_child_list.push(this.mapPromotionStock4(parentStock, discountItemList[0], multiDiscountGiftItem));
        }
        sku_child_list.push([...sub_child_list])
      }
      if (isEndType_TotalItem) { // End Type is 'Total Item'
        for (let i in sku_child_list) {
          proItemList = [...proItemList, ...(sku_child_list[i].map(c => {
            c.isEndTypeTotalItem = isEndType_TotalItem;
            c.n6 = 1;
            c.maxQty = totalQtyItem;
            return c;
          }))];
        }
      } else {
        for (let i in sku_child_list) {
          let subChildItem = this._getSop002Interface();
          for (let y = 0; y < sku_child_list[i].length; y++) {
            let item = sku_child_list[i][y];
            item.isEndTypeTotalItem = isEndType_TotalItem;
            if (y == 0) {
              const orignialIndex = this.comparePromotionEachTypeToOriginal(parentStock, sku_child_list[i], sop003Index);
              if (orignialIndex !== -1) {
                item = sku_child_list[i][orignialIndex];
              }
              subChildItem.syskey = item.syskey;
              subChildItem.parentSkuSyskey = item.parentSkuSyskey;
              subChildItem.t2 = item.t2;
              subChildItem.t3 = item.t3;
              subChildItem.t7 = item.t7;
              subChildItem.n1 = item.n1;
              subChildItem.n6 = item.n6;
              subChildItem.n10 = item.n10;
              subChildItem.n11 = item.n11;
              subChildItem.n12 = item.n12;
              subChildItem.n13 = item.n13;
              subChildItem.n14 = item.n34 * item.n6;
              subChildItem.n34 = item.n34;
              subChildItem.n40 = item.n40;
              subChildItem.n42 = item.n42;
              subChildItem.ref1 = item.ref1;
              subChildItem.ref3 = item.ref3;
              subChildItem.parentid = item.parentid;
              subChildItem.isEndTypeTotalItem = isEndType_TotalItem;
            }
          }
          subChildItem.stockPromotionSubDetailData = sku_child_list[i];
          proItemList.push(subChildItem)
        }
      }

    } else {
      parentStock.n12 = 0;
      parentStock.n11 = 0;
      parentStock.n10 = parentStock.n34;
      parentStock.ref3 = "0";
      parentStock.n13 = 0;
      parentStock.n14 = parentStock.n34 * parentStock.n6;
      resParentItem = parentStock;
    }
    return { p: resParentItem, c: proItemList }
  }
  comparePromotionEachTypeToOriginal(p: Sop002_Interface, c: any, sop003Index: number): number {
    let sop003: BrandOwner_ui = this.sop003_original[sop003Index];
    if(sop003 == undefined || sop003 == null){
      sop003 = this.sop003[sop003Index];
    }
    const sop002List = sop003.skuOrderType.order.filter((detail: Sop002_Interface) => {
      return detail.syskey == p.syskey;
    })
    if (sop002List.length == 1) {
      const sop002: Sop002_Interface = sop002List[0];
      for (let s of sop002.stockPromotionDetailData) {
        // c.find( (v:any,index:number)=>{
        //   if(v.t3 == s.t3){
        //     return true;
        //   }
        // })
        for (let i = 0; i < c.length; i++) {
          if (c[i].t3 == s.t3) return i;
        }
      }
    }
    return -1;
  }
  _getSop002Obj(): Sop002 {
    return {
      syskey: "0",
      recordStatus: 1,
      ref1: "0",
      ref2: "0",
      ref3: "0",
      parentid: "0",
      t1: "",
      t2: "",//stock code
      t3: "",//stock name
      t4: "",
      t6: "",
      t7: "",
      t15: "",
      n1: "0",//stock sysksy
      n2: "0",
      n3: "0",
      n6: 0,//qty
      n7: "",
      n8: 0,
      n9: 0,
      n10: 0.0,//price
      n11: 0.0,// discount
      n12: 0,
      n13: 0,
      n14: 0,
      n23: 0,
      n34: 0,
      n35: "0",
      n36: 0,
      n37: 0,
      n39: 0,
      n40: 0,// return or order
      n42: 0,
      stockPromotionDetailData: []
    }
  }
  _getSop002Interface(): Sop002_Interface {
    return {
      syskey: '',
      recordStatus: 1,
      ref1: '',
      ref2: '',
      ref3: '',
      parentid: '',
      parentSkuSyskey: '',
      t2: '',//stock code
      t3: '',//stock name
      t7: '',
      n1: '',//stock sysksy
      n2: '',
      n3: '',
      n6: 0,//qty
      n7: '',
      n8: 0,
      n9: 0,
      n10: 0,//price
      n11: 0,// discount
      n12: 0,
      n13: 0,
      n14: 0,
      n23: 0,
      n34: 0,
      n35: '',
      n36: 0,
      n37: 0,
      n39: 0,
      n40: 0,// return or order
      n42: 0,
      stockPromotionDetailData: [],
      stockPromotionSubDetailData: [],
      isEndTypeTotalItem: null,
      maxQty: -1,
      discountItemEndType: ""
    }
  }
  private addToStock_bindSop002Interface(stock, orderType: number) {
    let d = this._getSop002Interface();
    d.syskey = "0";
    d.recordStatus = 1;
    d.ref1 = "0";
    d.ref2 = "0";
    d.ref3 = "0";
    d.parentid = "0";
    d.t2 = stock.t2;//stock code
    d.t3 = stock.t3;//stock name]
    d.t7 = this.manager.formatDate(new Date(), "yyyyMMdd");
    d.n1 = stock.syskey;//stock sysksy
    d.n2 = stock.n12;
    d.n3 = "0";
    d.n6 = stock.myStk.qty;//qty
    d.n7 = stock.stkDetail[0].u31Syskey;
    d.n8 = 1;
    d.n9 = 0;
    d.n10 = stock.stkDetail[0].price;//price
    d.n11 = 0.0;// discount
    d.n12 = 0.0;
    d.n13 = 0.0;
    d.n14 = stock.stkDetail[0].price * stock.myStk.qty;
    d.n23 = 0;
    d.n34 = stock.stkDetail[0].price;
    d.n35 = "0";
    d.n36 = 0;
    d.n37 = 0.0;
    d.n39 = 0;
    d.n40 = orderType;// return or order
    d.n42 = 0;
    d.stockPromotionDetailData = []
    return d;
  }
  private mapSop002ToInterface(serviceSop002: Sop002): Sop002_Interface {
    let i = this._getSop002Interface();
    i.syskey = serviceSop002.syskey;
    i.recordStatus = 1;
    i.ref1 = serviceSop002.ref1;
    i.ref2 = serviceSop002.ref2;
    i.ref3 = serviceSop002.ref3;
    i.parentid = serviceSop002.parentid;
    i.t2 = serviceSop002.t2;//stock code
    i.t3 = serviceSop002.t3;//stock name
    i.t7 = serviceSop002.t7;
    i.n1 = serviceSop002.n1;//stock sysksy
    i.n2 = serviceSop002.n2;
    i.n3 = serviceSop002.n3;
    i.n6 = serviceSop002.n6;//qty
    i.n7 = serviceSop002.n7;
    i.n8 = serviceSop002.n8;
    i.n9 = serviceSop002.n9;
    i.n10 = serviceSop002.n10;//price
    i.n11 = serviceSop002.n11;// discount
    i.n12 = serviceSop002.n12;
    i.n13 = serviceSop002.n13;
    i.n14 = serviceSop002.n34 * serviceSop002.n6;
    i.n23 = serviceSop002.n23;
    i.n34 = serviceSop002.n34;
    i.n35 = serviceSop002.n35;
    i.n36 = serviceSop002.n36;
    i.n39 = serviceSop002.n39;
    i.n40 = serviceSop002.n40;// return or order
    i.n42 = serviceSop002.n42;
    i.stockPromotionDetailData = (() => {
      let final = [];
      for (let p of serviceSop002.stockPromotionDetailData) {
        let i = this._getSop002Interface();
        i.syskey = p.syskey;
        i.recordStatus = 1;
        i.ref1 = p.ref1;
        i.ref2 = p.ref2;
        i.ref3 = p.ref3;
        i.parentid = p.parentid;
        i.t2 = p.t2;//stock code
        i.t3 = p.t3;//stock name
        i.t7 = p.t7;
        i.n1 = p.n1;//stock sysksy
        i.n2 = p.n2;
        i.n3 = p.n3;
        i.n6 = p.n6;//qty
        i.n7 = p.n7;
        i.n8 = p.n8;
        i.n9 = p.n9;
        i.n10 = p.n10;//price
        i.n11 = p.n11;// discount
        i.n12 = p.n12;
        i.n13 = p.n13;
        i.n14 = p.n34 * p.n6;
        i.n23 = p.n23;
        i.n34 = p.n34;
        i.n35 = p.n35;
        i.n36 = p.n36;
        i.n39 = p.n39;
        i.n40 = p.n40;// return or order
        i.n42 = p.n42;
        final.push(i)
      }
      return final;
    })();
    return i;

  }
  getShortNum(num) {
    let stringNum = "" + num;
    let array1 = [];
    array1 = Array.from(stringNum);
    return array1.reduce((a, b) => a + parseInt(b), 0)
  }
  //..new delivery order
  getOrderSearchCri(): searchOrderCri {
    return {
      fromDate: '',
      toDate: '',
      usersyskey: '',
      brandOwnerSyskey: '',
      shopsyskey: '',
      currentNew: '',
      maxRow: '',
      shopName: ''
    }
  }
  getSaleOrderList(current: number) {
    return new Promise<void>(
      (done, reject) => {
        $('#newdel-progressbar').show();
        $('.newdel-modalbody').addClass('disabled');
        let search: SaleOrderSearchData = {
          fromDate: this.manager.formatDate(this.newDelSearchFromGroup.get('from-date').value),
          toDate: this.manager.formatDate(this.newDelSearchFromGroup.get('to-date').value),
          usersyskey: this.newDelSearchFromGroup.get('user-selected').value,
          saveStatus: 1,
          brandOwnerSyskey: this.newDelSearchFromGroup.get('bo-selected').value,
          shopsyskey: '',
          shopCode: '',
          shopName: '',
          currentNew: '' + current,
          maxrow: 20
        }
        if (typeof this.newDelSearchFromGroup.get('store-search').value === 'string') {
          search.shopName = this.newDelSearchFromGroup.get('store-search').value;
          search.shopsyskey = '';
        } else {
          search.shopName = '';
          search.shopsyskey = (this.newDelSearchFromGroup.get('store-search').value as any).shopSysKey;
        }
        const url = this.manager.appConfig.apiurl + 'sop/getsolistbo';
        this.http.post(url, search, this.manager.getOptions()).subscribe(
          (data: any) => {
            try {
              this.newDelFormGroup.get('so-list').setValue(data.dataList.map(e => {
                e.i = current++;
                e.date = this.manager.formatDate_StringToDate(e.date);
                return e
              }));
              this.config2.totalItems = data.rowCount;
            } catch {

            } finally {
              $('#newdel-progressbar').hide();
              $('.newdel-modalbody').removeClass('disabled');
              done();
            }
          },
          error => {
            $('#newdel-progressbar').hide();
            $('.newdel-modalbody').removeClass('disabled');
            reject();
          }
        );
      }
    );
  }

  newDelivery() {
    this.runSpinner(false);
    this.saleTypeDisable = false;
    if (this.delListByBoSubscription !== undefined) this.delListByBoSubscription.unsubscribe();
    this.newDeliveryEntry();
    $('#orderlist-model').appendTo('body').modal('show');
    $('#delivery-detail-tab').hide();
    $('#newdel-progressbar').hide();
    $("#newdel-shop").prop('disabled', true);
    $("#newdel-shopcode").prop('disabled', true);
    this.shopAddress = '';
    $("#btnOdrSearch").prop('disabled', true);
    $("#btnNewOdr").prop('disabled', true);
    $("#delisalesblock").hide();
    $("#delCdPickerInput").prop('disabled', false);
    /*
    this.newDelSearchFromGroup.get('store-search').valueChanges.subscribe(
      (changes: any) => {
        if (typeof changes === 'string') {
          $('#newdel-progressbar').show();
          this.shopNameSearchAutoFillSubscription = this.manager.shopNameSearchAutoFill(changes).subscribe(
            (data: any) => {
              this.newDelSearchFromGroup.get('store-list').setValue(data);
              $('#newdel-progressbar').hide();
            },
            error => {
              $('#newdel-progressbar').hide();
            }
          )
        }
      }
    );
    */

    this.getAllState();

    $('#btn-dismiss-orderlist-model').click(() => {
      $('#delordlist-tab').tab('show')
      $('#orderlist-model').appendTo('body').modal('hide');
      if (this.shopNameSearchAutoFillSubscription !== undefined) this.shopNameSearchAutoFillSubscription.unsubscribe();
      this.btn = false;
      this.newDeliveryEntry();
      // $('#delivery-detail-tab').show();
    });
    this.districtList = [];
    this.townshipList = [];
  }
  newDeliveryEntry() {
    this.newDelFormGroup = new FormGroup({
      'so-list': new FormControl([])
    });
    this.newDelSearchFromGroup = new FormGroup({
      'store-list': new FormControl([]),
      'store-selected': new FormControl(),
      'store-search': new FormControl('', Validators.required),
      'store-code': new FormControl('', Validators.required),
      'from-date': new FormControl(new Date()),
      'to-date': new FormControl(new Date()),
      'bo-selected': new FormControl(''),
      'user-selected': new FormControl(''),

    })
  }
  newDelStoreSearchDisplayWith(option) {
    return option == null ? '' : option.shopName;
  }
  newDelStoreCodeSearchDisplayWith(option) {
    return option == null ? '' : option.shopCode;
  }
  async optionSelectedNewOrder(e) {
    if (typeof this.newDelSearchFromGroup.get('store-search') === 'string') {
    } else {
      if (this.newDelSearchFromGroup.get('store-search').value.shopName === 'No Record Found') {
        this.newDelSearchFromGroup.get('store-search').setValue('')
      }else{
        this.shopAddress = (this.newDelSearchFromGroup.get('store-search').value as any).address;
        $("#btnOdrSearch").prop('disabled', false);
        $("#btnNewOdr").prop('disabled', false);
        $("#delisalesblock").hide();

        if(this.isUseSAP){
          let salesBlock : boolean = false;
          salesBlock = await this.getSAPSalesInfo((this.newDelSearchFromGroup.get('store-search').value as any).shopCode);
          if(salesBlock)
          {
            $("#btnOdrSearch").prop('disabled', true);
            $("#btnNewOdr").prop('disabled', true);
            $("#delisalesblock").show();
          }
        }
      }
    }
  }
  async optionSelectedNewOrder1(e) {
    if (typeof this.newDelSearchFromGroup.get('store-code') === 'string') {
    } else {
      if (this.newDelSearchFromGroup.get('store-code').value.shopCode === 'No Record Found') {
        this.newDelSearchFromGroup.get('store-code').setValue('')
      }else{
        this.shopAddress = (this.newDelSearchFromGroup.get('store-code').value as any).address;
        $("#btnOdrSearch").prop('disabled', false);
        $("#btnNewOdr").prop('disabled', false);
        $("#delisalesblock").hide();

        if(this.isUseSAP){
          let salesBlock : boolean = false;
          salesBlock = await this.getSAPSalesInfo((this.newDelSearchFromGroup.get('store-code').value as any).shopCode);
          if(salesBlock)
          {
            $("#btnOdrSearch").prop('disabled', true);
            $("#btnNewOdr").prop('disabled', true);
            $("#delisalesblock").show();
          }
        }
      }
    }
  }
  getSaleOrderBySyskey(id) {
    return new Promise<any>((promise, reject) => {
      $('#newdel-progressbar').show();
      $('.newdel-modalbody').addClass('disabled');
      const url = this.manager.appConfig.apiurl + 'sop/getsolistreport';
      this.http.post(url, {
        'headerSyskey': id
      }, this.manager.getOptions()).subscribe(
        (data: any) => {
          $('#newdel-progressbar').hide();
          $('.newdel-modalbody').removeClass('disabled');
          if (data.length > 0) {
            promise(data[0]);
          } else {
            reject('Sale order list is empty!')
          }
        },
        error => {
          $('#newdel-progressbar').hide();
          $('.newdel-modalbody').removeClass('disabled');
          reject("Server not response");
        }
      )
    })
  }
  newOrder(so: any) {
    const headerSyskey = so.headersyskey;

    this.getSaleOrderBySyskey(headerSyskey).then(
      (d: any) => {
        $('#so-tab').tab('show');
        this.btn = true;
        $('.slip-number').text('Order No.' + d.autokey);
        this.showDetail_NewOrder(d);
        $('#slip-detail-card').show();
      }
    ).catch(e => { console.log('get-solie-error', e) })
  }
  async showDetail_NewOrder(obj) {
    this.soObj = obj;
    this.soObj.n55 = this.soObj.syskey;
    this.soObj.transType = this.manager.tranType.DeliveryOrder.code; // change to delivery type;
    this.soObj.saveStatus = 1; // first time 128 then will change 1 to save
    this.soObj.syskey = '0';
    this.orderDate = new Date(this.manager.formatDateByDb(this.soObj.createddate));
    this.soObj.createddate = new Date();
    
    this.buttonControl(true, false, false, true);
    this.getShopDetail(this.soObj.n1).then(
      () => {
        let date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, new Date());
        this.manager.getPriceChangeDetailDownload(date, this.soShop.shopSysKey, this.soShop.zoneSyskey).then(pz => {
          this.priceZone = pz;
        }).catch(() => {
          this.priceZone = [];
        });
      }
    );

    this.getPreSellerName(this.soObj.n55).then(d => {
      $('#preseller-name').text(d == '' ? 'NA' : d)
    }).catch(() => {
      $('#preseller-name').text('NA')
    })
    $('#delivery-detail-tab').show();
    $('.btn-void').hide();
    $('#orderlist-model').appendTo('body').modal('hide');
    
    this.sop003 = [];
    for (let i = 0; i < this.soObj.sop003.length; i++) {
      let bo = this.getBrandOwnerObj();
      bo.syskey = '0';
      bo.createddate = this.soObj.sop003[i].createddate;
      bo.recordStatus = 1;
      bo.userid = this.soObj.sop003[i].userid;
      bo.username = this.soObj.sop003[i].username;
      bo.t1 = this.soObj.sop003[i].t1;
      bo.t4 = this.soObj.sop003[i].t4;
      bo.t5 = this.soObj.sop003[i].t5;
      bo.n1 = this.soObj.sop003[i].n1;
      bo.n5 = this.soObj.sop003[i].n5;
      bo.n6 = this.soObj.sop003[i].n6;
      bo.n7 = this.soObj.sop003[i].n7;
      bo.n8 = this.soObj.sop003[i].n8;
      bo.n9 = this.soObj.sop003[i].n9;
      bo.n11 = this.soObj.sop003[i].n11;
      bo.n12 = this.soObj.sop003[i].n12;
      bo.n14 = this.soObj.sop003[i].n14;
      bo.n33 = this.soObj.sop003[i].n33;
      bo.n34 = this.soObj.sop003[i].n34;
      bo.n35 = this.soObj.sop003[i].n35;
      bo.n36 = this.soObj.sop003[i].n36;
      bo.n37 = this.soObj.sop003[i].n37;
      bo.n38 = this.soObj.sop003[i].n38;
      bo.transType = this.manager.tranType.DeliveryOrder.code;
      bo.promotionList = this.soObj.sop003[i].promotionList;
      for (let y = 0; y < this.soObj.sop003[i].transDetailsData.length; y++) {
        let detail: Sop002_Interface = this.mapSop002ToInterface2(this.soObj.sop003[i].transDetailsData[y]);
        if (detail.n40 == 1) {
          bo.skuOrderType.order.push(detail);
          detail.stockPromotionDetailData.forEach((pro: Sop002_Interface) => {
            pro.parentSkuSyskey = detail.n1;
            pro.isEndTypeTotalItem = false;
            pro.maxQty = -1;
            pro.stockPromotionSubDetailData = [];
            bo.skuOrderType.order.push(pro)
          });
        } else {
          bo.skuOrderType.return.push(detail);
        }
      }
      let orderList = [];
      let groupOrderList = this.manager.groupArrayIntoOneArray(bo.skuOrderType.order);
      groupOrderList.forEach(group => {
        group.sort((a, b) => (a.n40 > b.n40) ? 1 : -1);
        orderList = [...orderList, ...group];
      });
      bo.skuOrderType.order = orderList;
      this.sop003.push(bo);
    }
    this.sop003_original = this.sop003.slice();
    this.calculate2();
  }
  private mapSop002ToInterface2(serviceSop002: Sop002): Sop002_Interface {
    let i = this._getSop002Interface();
    i.syskey = '0';
    i.recordStatus = 1;
    i.ref1 = serviceSop002.ref1;
    i.ref2 = serviceSop002.ref2;
    i.ref3 = serviceSop002.ref3;
    i.parentid = serviceSop002.parentid;
    i.t2 = serviceSop002.t2;//stock code
    i.t3 = serviceSop002.t3;//stock name
    i.t7 = serviceSop002.t7;
    i.n1 = serviceSop002.n1;//stock sysksy
    i.n2 = serviceSop002.n2;
    i.n3 = serviceSop002.n3;
    i.n6 = serviceSop002.n6;//qty
    i.n7 = serviceSop002.n7;
    i.n8 = serviceSop002.n8;
    i.n9 = serviceSop002.n9;
    i.n10 = serviceSop002.n10;//price
    i.n11 = serviceSop002.n11;// discount
    i.n12 = serviceSop002.n12;
    i.n13 = serviceSop002.n13;
    i.n14 = serviceSop002.n34 * serviceSop002.n6;
    i.n23 = serviceSop002.n23;
    i.n34 = serviceSop002.n34;
    i.n35 = serviceSop002.n35;
    i.n36 = serviceSop002.n36;
    i.n39 = serviceSop002.n39;
    i.n40 = serviceSop002.n40;// return or order
    i.n42 = serviceSop002.n42;
    i.stockPromotionDetailData = (() => {
      let final = [];
      for (let p of serviceSop002.stockPromotionDetailData) {
        let i = this._getSop002Interface();
        i.syskey = p.syskey;
        i.recordStatus = 1;
        i.ref1 = p.ref1;
        i.ref2 = p.ref2;
        i.ref3 = p.ref3;
        i.parentid = p.parentid;
        i.t2 = p.t2;//stock code
        i.t3 = p.t3;//stock name
        i.t7 = p.t7;
        i.n1 = p.n1;//stock sysksy
        i.n2 = p.n2;
        i.n3 = p.n3;
        i.n6 = p.n6;//qty
        i.n7 = p.n7;
        i.n8 = p.n8;
        i.n9 = p.n9;
        i.n10 = p.n10;//price
        i.n11 = p.n11;// discount
        i.n12 = p.n12;
        i.n13 = p.n13;
        i.n14 = p.n34 * p.n6;
        i.n23 = p.n23;
        i.n34 = p.n34;
        i.n35 = p.n35;
        i.n36 = p.n36;
        i.n39 = p.n39;
        i.n40 = p.n40;// return or order
        i.n42 = p.n42;
        final.push(i)
      }
      return final;
    })();
    return i;

  }
  async newDeliveryOrder() {
    $('#progressbar-1').hide();
    let dil001 = this._dil001();
    dil001.createddate = this.manager.formatDate(new Date());
    dil001.n21 = this.manager.user.userSk;
    dil001.username = this.manager.user.userName;
    dil001.userType = this.manager.getUserTypeDesc(2);
    if (typeof this.newDelSearchFromGroup.get('store-search').value === 'string') {
      let shopName = this.newDelSearchFromGroup.get('store-search').value;

      await new Promise<void>((resolve, reject) => {
        this.manager.shopNameSearchAutoFill(shopName).subscribe(
          (data: any) => {
            if (data[0].shopName == "No Record Found") {
              reject();
            } else {
              dil001.n1 = data[0].shopCode ;
              resolve();
            }
          },
          error=>{
            reject();
          }
        );
      });
    } else {
      dil001.n1 = (this.newDelSearchFromGroup.get('store-search').value as any).shopCode;   
    }
    $('#orderlist-model').appendTo('body').modal('hide');
    $('#so-tab').tab('show');
    this.btn = true;
    $('.slip-number').text('Order No. TBA');
    this.showDetail_NewOrder(dil001);
    $('#slip-detail-card').hide();
    // this.soObj.t34 = "Z215";
  }
  prepareDataForAdmin( obj ) {
    for(let o in obj) {
      $("#admin-dashboard").append('<li><b>'+ o + '</b> - ' + obj[o] +'</li>');
    }
  }

  async geEmptyBottleSKU()
  {    
    // if (this.soObj.saveStatus !== 128) {
    //   return;
    // }
    $('#addemptybotmodel').appendTo("body").modal('show');
    this.orderNewSkuIndex = [];
    $('#stock-progressbar2').show();
    $('#stockaddtbl2').hide();
    $('.skulist-btnbar').hide();
    $('.searching-stock-icon2').show();
    this.getEmptyBotList().then(
      ok => {
        $('.searching-stock-icon2').hide();
        $('#stock-progressbar2').hide();
        $('#stockaddtbl2').show();
        $('.skulist-btnbar').show();
      }
    ).catch(
      error => {
        this.manager.showToast(this.tostCtrl, "Message", "Server Not Responding!\n Try to reload the page.", 1000).then(
          el => {
            $('#addemptybotmodel').appendTo("body").modal('hide');
          }
        )
      }
    )
  }
  getEmptyBotList() {
    return new Promise<void>((promise, reject) => {
      if (this.emptyBOTList.length > 0) {
        this.emptyBOTList = this.emptyBOTList.map(sku => {
          sku.myStk = {
            'stock': '',
            'qty': 1,
            'price': 1.0,
            'total': 1.0,
            'isAddToCard': false,
            'isReturn': false
          };
          return sku;
        });
        promise();

      } else {
        const url = this.manager.appConfig.apiurl + 'StockSetup/getEmptyStockList';
        const param = {
          syskey: "",

        };
        this.stockListSubscriptin = this.http.post(url, param, this.manager.getOptions()).subscribe(
          (data: any) => {

            this.emptyBOTList = data.map((s, index, array) => {
              s.t1 = s.t1.length > 0 ? this.manager.appConfig.imgurl + s.t1 : 'assets/img/not-found.png';
              // s.stkDetail = s.stkDetail.filter(d => {
              //   return d.uomType == "Confirm";
              // });
              s.myStk = {
                'stock': '',
                'qty': 1,
                'price': 1.0,
                'total': 1.0,
                'isAddToCard': false,
                'isReturn': false
              }
              // let pzList = this.priceZone.filter(pz => {
              //   return pz.n1 == s.syskey
              // });
              // if (pzList.length > 0) s.stkDetail[0].price = pzList[0].n3;
              return s;
            });
            promise();
          },
          error => {
            console.log(error);
            reject();
          }
        )
      }
    })
  }
  getSalesTypeList()
  {
    const url = this.manager.appConfig.apiurl + 'sop/getSalesType';
    this.http.get(url, this.manager.getOptions()).subscribe(
      (data: any) => {
        if(data.message == 'SUCCESS'){
          this.salesTypeList = data.dataList;
          // if(this.soObj.t34 === ''){
          //   this.soObj.t34 = "Z215";
          // }
        }
        // else{
          
        // }
      },
      (error: any) => {
      }
    )
  }
  salesTypeChange() {
    // if(this.soObj.t34 === 'Z215'){//cash sales
    //   bo.n37 = bo.n5;
    //   bo.n38 = 0;
    // }else if(this.soObj.t34 === 'Z214'){//credit sales
    //   bo.n37 = 0;
    //   bo.n38 = bo.n5 - (bo.n35 + bo.n36 + bo.n37);
    // }
    this.finalSop001.sop003 = this.finalSop001.sop003.map((bo) => {
      if(this.soObj.t34 === 'Z215'){//cash sales
        bo.n37 = bo.n5;
        bo.n38 = 0;
      }else if(this.soObj.t34 === 'Z214'){//credit sales
        bo.n37 = 0;
        bo.n38 = bo.n5 - (bo.n35 + bo.n36 + bo.n37);
      }else{
        bo.n37 = bo.n5;
        bo.n38 = 0;
      }
      return bo;
    });
    
  }

  getSAPSalesInfo(shopCode) {
    return new Promise<boolean>((promise, reject) => {
      const url = this.manager.appConfig.apiurl + 'shop/getcreditBalance';
      this.http.post(url, {
        'shopcode': shopCode
      }, this.manager.getOptions()).subscribe(
        (data: any) => {
          if (data.dataList.length > 0) {
            promise(data.dataList[0].blockStatus);
          } else {
            promise(false);
          }
        },
        error => {
          promise(false);
        }
      )
    })
  }
  getRestrictDate(){
    const url = this.manager.appConfig.apiurl +'config/getAllConfig';

    this.http.post(url, {}, this.manager.getOptions()).subscribe(
      (data:any) =>{
        this.restrictDates.isDisable = data.configData.isUseBackDate.toString() == "1" ? false : true;
        this.restrictDates.startDate = data.configData.startBackDate.toString();
        this.restrictDates.endDate = data.configData.endBackDate.toString();
      }
    );
  }
  getBtnAccess() {
    const pages = this.app.appPages;
    for (let i = 0; i < pages.length; i++) {
      for (let y = 0; y < pages[i].child.length; y++) {
        if (pages[i].child[y].btns) {
          for (let z = 0; z < pages[i].child[y].btns.length; z++) {
            if (pages[i].child[y].btns[z].code === 'allow-backdate' && pages[i].child[y].btns[z].status === true) {
              this.allowBackDate = true;
              console.log("this.allowBackDate =  " + this.allowBackDate);
            }            
          }
        }
      }
    }
  }
  

}