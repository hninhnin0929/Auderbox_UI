import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient } from '@angular/common/http';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { AppComponent } from '../app.component';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { iif, scheduled, Subscription } from 'rxjs';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
declare var $: any;
var date = new Date();
var firstDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 6);
var lastDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})

export class OrderPage implements OnInit {

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
    save: true,
    delete: true,
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
  sessionObj = this.getSessionObj(false, "", "", "", new Date());
  spinner: boolean = false;
  sku_spinner: boolean = false;
  showOnlySelected: boolean = false;
  status: any = [
    { code: 0, desc: "-" },
    { code: 1, desc: "Padding" },
    { code: 128, desc: "Completed" }];
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
  shoplist2: any = [];
  soShop: any = this.getSoShopDetail();
  bolist: any = [];
  userlist: any = [];
  userlist2: any = [];
  solist: any = [];
  skulist: any = [];
  oriSkuList: any = [];
  orderNewSkuIndex: any = []
  orderDetailDistinctSkuList = [];
  sop002: any = [];
  sop003: any = [];
  sop003_original: any = [];
  removeSku: any = [];
  soObj: any = this.getSoObj();
  returnPriceRto: number = 10;
  shopObj: any = "";
  skus: any = [];
  myOrderObj: any = this.getMyOrderObj();
  advSearchObj: any = this.searchObj();
  advSearchObjTmp: any = this.searchObjTmp();
  finalSop001: any = this.getFinalSop001();
  minDate: any;
  maxDate: any = new Date();
  currentPageSize = 0;
  baseImg = '';
  tab_flag = "Sale";
  redflag_report: boolean = false;
  redflag_dtlid: string = "";
  advSearchObj1: any = this.searchObj();
  dateflag = {
    DB: 1,
    UI: 2
  };
  priceZone: any = [];
  saveReturnStatus: number = 0;
  getShopSpinner: boolean = false;
  shopNameSearch: FormControl = new FormControl();
  shopNameSearch_newOrder: FormControl = new FormControl();
  shopCodeSearch_newOrder: FormControl = new FormControl();
  shopNameSearchSubscription: Subscription;
  getRecentSoListSubscription: Subscription;
  getSoListByBoSubscription: Subscription;
  recentOrder_fg = new FormGroup({
    'list': new FormControl([]),
    'cri-date': new FormControl(new Date()),
    'form-status-running': new FormControl(false)
  });
  
  stateList: any = [];
  districtList: any = [];
  townshipList: any = [];

  selectedAddress: any = "";
  salesTypeList: any = [];
  isUseSAP: boolean = false;
  salesBlock : boolean = false;
  townshipSyskey: any;
  deciPlaceSetting: any = this.getDeciPlaceSetting();
  constructor(
    private alertCtrl: AlertController,
    private loadCtrl: LoadingController,
    public manager: ControllerService,
    private http: HttpClient,
    private tostCtrl: ToastController,
    public activatedRoute: ActivatedRoute,
    public app: AppComponent) {
    this.manager.isLoginUser();
    this.activatedRoute.queryParams.subscribe(params => {
      let id = params['sysKey'];
      let dtlid = params['dtl'];
      if (id != null && id != "") {
        this.advSearchObjTmp = this.searchObjTmp();
        this.advSearchObjTmp.adv_syskey = id;
        this.loadCtrl.create({
          message: "Processing.."
        }).then(async el => {
          el.present();
          await this.getSaleOrderBySyskey(id);
          $('#so-tab').tab('show');
          this.redflag_report = true;
          this.redflag_dtlid = dtlid;
          this.showDetail_New(this.soObj);
          // this.btn = true;
          el.dismiss();
          return;
        })

      }
    });
  }

  ngOnInit() {
  }
  ionViewWillEnter() {
    this.adminPannel.isAdmin = this.manager.user.userId === 'admin' ? true : false;
    this.userRight();
    this.reset(false);
    this.btn = false;
    this.redflag_report = false;
    this.currentType = this.manager.tranType.SaleOrder.code;
    this.advSearchObjTmp.dateOptions = "today";
    this.dateOptionsChange();
    this.orderTypeChange(0);
    $('#ordlist-tab').tab('show');
    this.getShopList_AdvSearch();
    this.getAllState();
    // this.getShopList_NewOrder();
    this.isUseSAP = this.manager.settingData.n8 == '1' ? true : false;
    this.deciPlaceSetting.isUseDisplayDeciPlace = this.manager.settingData.n17 == 1 ? true : false;
    this.deciPlaceSetting.isUseDisplayDeciPlace ? this.deciPlaceSetting.displayDeciPlace = this.manager.settingData.n18 : this.deciPlaceSetting.displayDeciPlace =0;
    this.deciPlaceSetting.isUseCalcDeciPlace = this.manager.settingData.n19 == 1 ? true : false;
    this.deciPlaceSetting.isUseCalcDeciPlace ? this.deciPlaceSetting.calcDeciPlace = this.manager.settingData.n20 : this.deciPlaceSetting.calcDeciPlace = 0;
    $("#odrsalesblock").hide();
    $("#btn-addNew-storeModelForNewOrder").prop('disabled', false);
    if(this.isUseSAP){
      this.getSalesTypeList();
    }
  }

  ionViewDidLeave() {
    // $(".header-btn").removeClass("show");
    this.btn = false;
    if (this.sessionObj.id === this.manager.user.userId) {
      this.setSession(this.soObj.syskey, '0');
    }
  }

  userRight() {
    const menu = this.manager.user.rightMenus.find(m => { return m.menu == 'order/211' });
    if (menu !== undefined) {
      const btns: any = menu.btns;
      this.button.datechange.access = (btns.findIndex(b => { return b.menu == 'change date' }) !== -1) ? true : false
    }
  }

  reset(isAfterSave) {
    this.soObj = this.getSoObj();
    this.shopObj = "";
    this.soShop = this.getSoShopDetail();
    this.searchtab = false;
    this.myOrderObj = this.getMyOrderObj();
    this.advSearchObjTmp = this.searchObjTmp();
    this.removeSku = [];
    this.sop002 = [];
    this.sop003 = [];
    this.orderDetailDistinctSkuList = [];
    if (isAfterSave) {
      this.solist = [];
    }
    this.baseImg = this.manager.appConfig.imgurl;
    this.orderNewSkuIndex = [];
    this.searchtab = false;
    this.redflag_report = false;
    this.saveReturnStatus = 0;
    this.advSearchObjTmp = this.searchObjTmp();
    this.advSearchObjTmp.dateOptions = "today";
    this.dateOptionsChange();
    this.recentOrder_fg.get('list').setValue([])
    $('#order_detail').hide();
  }

  async orderTypeChange(FLday) {
    this.runSpinner(true);
    this.getSaleOrderListByBo(FLday, true).then(() => {
      this.runSpinner(false);
    }).catch(() => {
      this.runSpinner(false);
    })

  }

  listClick() {
    // $(".header-btn").removeClass("show");
    this.btn = false;
    if (this.sessionObj.id === this.manager.user.userId) {
      this.setSession(this.soObj.syskey, '0');
    }
    this.soObj = this.getSoObj();
    this.shopObj = "";
    this.soShop = this.getSoShopDetail();
    this.myOrderObj = this.getMyOrderObj();
    this.removeSku = [];
    this.sop002 = [];
    this.sop003 = [];
    this.orderDetailDistinctSkuList = [];
    this.currentType = this.manager.tranType.SaleOrder.code;
    this.baseImg = this.manager.appConfig.imgurl;
    this.orderNewSkuIndex = [];
    this.redflag_report = false;
    this.recentOrder_fg.get('list').setValue([]);
    $('#ordlist-tab').tab('show');
  }
  runSpinner(t: boolean) {
    this.spinner = t;
  }
  async advanceSearch(s: boolean) {
    if (!this.searchtab) {
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
    this.advSearchObj = this.searchObj();
    this.advSearchObjTmp = this.searchObjTmp();
    this.advSearchObjTmp.dateOptions = "today";
    this.dateOptionsChange();
    this.orderTypeChange(0);
    this.getSaleOrderListByBo(0, true);
  }
  getShopList_AdvSearch() {
    this.shopNameSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.shopNameSearchAutoFill(term).subscribe(
            (data: any) => {
              this.shoplist = data;
            }),
            error => {
              console.log("error")
            }
        }
      }
    );
  }

  /*
  getShopList_NewOrder() {
    this.shoplist2 = [];
    this.shopNameSearch_newOrder.valueChanges.subscribe(
      term => {
        if (term != '' && typeof term === 'string') {
          $('#shopnamesearch-progressbar').show();
          this.shopNameSearchSubscription = this.manager.shopNameSearchAutoFill(term).subscribe(
            data => {
              this.shoplist2 = data as any[];
              $('#shopnamesearch-progressbar').hide();
       
            },
            error => {
              $('#shopnamesearch-progressbar').hide();
       
            })
        }
      }
    );
  }
  */

  getUserByid(id) {
    return new Promise<void>(p => {
      const url = this.manager.appConfig.apiurl + "user/read/" + id;
      this.http.get(url, this.manager.getOptions()).subscribe(
        (data: any) => {
          p();
          this.sessionObj = this.getSessionObj(true, data.userId, data.userName, data.syskey, this.manager.formatDateTimeByDb(this.soObj.t20));
        }
      )
    })

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
          promise();
        },
        error => {
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
          this.userlist = data.dataList.sort((a: any, b: any) => {
            const first = $.trim(a.userName.toLocaleUpperCase());
            const sec = $.trim(b.userName.toLocaleUpperCase());
            if (first < sec) {
              return -1;
            }
          })
          promise();
        },
        error => {
          promise();
        }
      )
    })
  }
  async search() {
    this.advSearchObjTmp.current = 0;
    this.orderTypeChange(0);
  }

  getSaleOrderBySyskey(id) {
    return new Promise<void>((promise, reject) => {
      const url = this.manager.appConfig.apiurl + 'sop/getsolistreport';
      this.http.post(url, {
        'headerSyskey': id
      }, this.manager.getOptions()).subscribe(
        (data: any) => {
          if (data.length > 0) {
            this.soObj = data[0];
            this.soObj.orderby = { syskey: "", userName: "" }
          }
          promise();
        },
        error => {
          reject("Server not response");
        }
      )
    })
  }

  getSaleOrderListByBo(current: number, booflag) {
    return new Promise<void>(
      (done, reject) => {
        let search = {
          'fromDate': this.advSearchObjTmp.adv_fromDate == '' ? '' : this.manager.formatDate(new Date(this.advSearchObjTmp.adv_fromDate), "yyyyMMdd"),
          'toDate': this.advSearchObjTmp.adv_toDate == '' ? '' : this.manager.formatDate(new Date(this.advSearchObjTmp.adv_toDate), "yyyyMMdd"),
          'usersyskey': this.advSearchObjTmp.adv_usersyskey,
          'brandOwnerSyskey': this.advSearchObjTmp.adv_brandOwnerSyskey,
          'shopsyskey': '',
          'currentNew': current,
          'maxRow': this.manager.itemsPerPage,
          // 'shopName': this.shopNameSearch.value,
          'shopName': this.advSearchObjTmp.adv_shopsyskey,
          'saveStatus': 0
        }
        const url = this.manager.appConfig.apiurl + 'sop/getsolistbo';
        this.getSoListByBoSubscription = this.http.post(url, search, this.manager.getOptions()).subscribe(
          (data: any) => {
            if (data.dataList.length > 0) {
              this.config.totalItems = data.rowCount;
              this.solist = data.dataList.map(m => {
                m.i = current++;
                m.usertype = this.manager.getUserTypeDesc(m.usertype);
                m.date = new Date(this.manager.formatDateByDb(m.date));
                return m;
              });
            } else {
              this.currentPageSize = data.dataList.length;
              this.config.currentPage = 1;
              this.solist = [];
            }
            /// console.log(this.solist)
            done();
          },
          error => {
            reject();
          }
        );
      }
    );
  }
  getSaleOrderListByBo2(param: { date: string, shopsyskey: string }) {
    return new Promise((res, rej) => {
      let search = {
        "brandOwnerSyskey": "",
        "currentNew": 0,
        "fromDate": param.date,
        "maxRow": 20,
        "shopsyskey": "" + param.shopsyskey,
        "toDate": param.date,
        "usersyskey": ""
      }
      // console.log(search)
      const url = this.manager.appConfig.apiurl + 'sop/getsolistbo';
      this.http.post(url, search, this.manager.getOptions()).subscribe(
        (data: any) => {
          res(data)
        },
        error => {
          rej("error")
        }
      )
    })

  }

  checkSession(i, e): boolean {
    let id = i;
    let endtime = e;

    let nowDate = new Date();
    if (endtime == "") {
      return true;
    }
    let endDate: Date;
    try {
      endDate = this.manager.formatDateTimeByDb(endtime);
    } catch {
      return true;
    }
    if (nowDate > endDate) {
      return true;
    } else if (nowDate < endDate && id === this.manager.user.userSk) {
      return true;
    } else if (nowDate < endDate && id !== this.manager.user.userSk) {
      return false;
    }
  }

  setSession(headerid, time) {
    if (headerid === '') return;
    if (time === '') return;
    const url = this.manager.appConfig.apiurl + "sop/lock/" + headerid + "/" + time
      ;
    this.http.get(url, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data == true) {

        }

      }, error => {

      }
    )
  }

  getSessionObj(locks: boolean, ids: string, names: string, syskeys: string, endtimes: Date) {
    return {
      lock: locks,
      id: ids,
      name: names,
      syskey: syskeys,
      endtime: endtimes
    }
  }

  getTime(dt: Date, minutes) {
    return new Date(dt.getTime() + minutes * 60000);
  }

  removeSession() {
    this.setSession(this.soObj.syskey, '0');
    this.listClick();

  }

  breakSession() {
    this.sessionObj = this.getSessionObj(
      false,
      this.manager.user.userId,
      this.manager.user.userName,
      this.manager.user.userSk,
      this.getTime(new Date(), 5));
    this.setSession(this.soObj.syskey, this.manager.formatDate(this.sessionObj.endtime, 'yyyyMMddHHmmss'));
  }

  async detail(headersyskey) {
    this.manager.showLoading(this.loadCtrl, "Processing..", 0).then(
      async el => {
        el.present();
        this.getSaleOrderBySyskey(headersyskey).then(() => {
          if (this.checkSession(this.soObj.t19, this.soObj.t20)) {
            this.sessionObj = this.getSessionObj(
              false,
              this.manager.user.userId,
              this.manager.user.userName,
              this.manager.user.userSk,
              this.getTime(new Date(), 5));
            this.setSession(this.soObj.syskey, this.manager.formatDate(this.sessionObj.endtime, 'yyyyMMddHHmmss'));

          } else {
            this.getUserByid(this.soObj.t19);

          }
          $('#so-tab').tab('show');
          $('#order-detail-main').show();
          // $(".header-btn").addClass("show");
          this.btn = true;

          if (typeof this.soObj.createddate.getMonth === 'function') {

          } else {
            this.soObj.createddate = new Date(this.manager.formatDateByDb(this.soObj.createddate));
            this.soObj.createddate.setMinutes(390);
          }
          this.showDetail_New(this.soObj);
          el.dismiss();
        }).catch((e) => {

          el.dismiss();
          this.manager.showToast(this.tostCtrl, "Message", e, 0)
        })


      }
    )
  }

  startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = this.checkTime(m);
    s = this.checkTime(s);
    document.getElementById('txt').innerHTML =
      h + ":" + m + ":" + s;
    var t = setTimeout(this.startTime, 500);
  }

  checkTime(i) {
    if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
    return i;
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

  print() {
    let Export_Criteria = {
      "ShopName": "",
      "UserName": "",
      "FromDate": "",
      "ToDate": "",
      "BrandOwner": "",
      "Type": "",
      "backDateOrder":0
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
    Export_Criteria.backDateOrder=0;
    Export_Criteria.BrandOwner = this.advSearchObjTmp.adv_brandOwnerSyskey;
    Export_Criteria.Type = this.currentType.toString();

    const url = this.manager.appConfig.apiurl + 'sop/getOrderListforExcel';
    console.log('solist-bybo-print', Export_Criteria)
    this.http.post(url, Export_Criteria, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.message == "SUCCESS") {


          let cri_flag = 0;
          let excelDataList: any = [];
          let date_str: any;
          let status="";
          let excelTitle = "Order List";
          let excelHeaderData = [
            "Order Number", "Date", "TransactionID", "Brand Owner", "SubTotal Amount", "Order Total Amount",
            "Return Total Amount", "Shop Name", "SalePerson Name", "Order By", "SalePerson Type","Status"
          ];
          if(this.isUseSAP)excelHeaderData.push("SaleType");

          for (var data_i = 0; data_i < data.dataList.length; data_i++) {
            let excelData = [];

            date_str = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data.dataList[data_i].date);

            excelData.push(data.dataList[data_i].orderNumber);
            excelData.push(date_str);
            excelData.push(data.dataList[data_i].transactionID);
            excelData.push(data.dataList[data_i].brandOwner);
            excelData.push(data.dataList[data_i].subTotalAmount);
            excelData.push(data.dataList[data_i].orderTotalAmount);
            excelData.push(data.dataList[data_i].returnTotalAmount);
            excelData.push(data.dataList[data_i].shopName);
            excelData.push(data.dataList[data_i].salePersonName);
            excelData.push(data.dataList[data_i].orderby);
            excelData.push(this.manager.getUserTypeDesc(parseInt(data.dataList[data_i].salePersonType)));
            if(data.dataList[data_i].status=="1"){
              excelData.push("Order");
            }
            if(data.dataList[data_i].status=="128"){
              excelData.push("Invoiced")
            }
            if(data.dataList[data_i].status=="6"){
              excelData.push("Cancel");
            }
            if(this.isUseSAP)excelData.push(data.dataList[data_i].salesTypeDesc);
            excelDataList.push(excelData);
          }

          let workbook = new Workbook();
          let worksheet = workbook.addWorksheet('Order List Data');

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
            FileSaver.saveAs(blob, "Order_List_export_" + new Date().getTime() + EXCEL_EXTENSION);
          });
        }
      },
      error => {
      }
    );
  }

  printdetail() {
    let excelTitle = "Order Detail Report";
    let excelHeaderData1 = ["Name", "Code", "OwnerName", "Phone", "Address"];
    let excelHeaderData2 = ["Name", "Type", "Date"];
    let excelHeaderData3 = [
      "Name","Order SKU Total Amount", "Invoice Discount Amount", "Sub Total", "Expired SKU Amount",
      "Other Discount Amount", "Total", "Tax Amount", "Tax Percent", "Currency Code", "Currency Rate"
    ];
    let excelHeaderData4 = [
      "Type","Date","Brand Owner", "SKU Name", "SKU Code","Standard Price", "Selling Price", "Qty",
      "Promo Discount", "Total"
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
    for (var i_data = 0; i_data < excelData3.length; i_data++) {
      worksheet3.addRow(excelData3[i_data]);
    }
    // worksheet3.addRow(excelData3);

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
      this.manager.formatDate(this.orderDate, 'yyyy/MM/dd')
    ];
  }

  prepareOrderHeaderExport() {
    let ret_result: any = [];
    let res: any = {}
    for (var i = 0; i < this.sop003.length; i++) {
      res = [
        this.sop003[i].t5,
        this.sop003[i].normalSkuTotalAmount,
        this.sop003[i].n33,
        this.sop003[i].normalSkuTotalAmount - this.sop003[i].n33,
        this.sop003[i].returnSkuTotalAmount,
        this.sop003[i].specialDiscount,
        this.sop003[i].n5,
        this.soObj.n14,
        this.soObj.n12,
        "MMK",
        this.soObj.n4
      ];
      ret_result.push(res);
    }
   return ret_result;
  }

  // prepareOrdersExport() {
  //   let return_result: any = [];
  //   let res: any = {};
  //   let rtn_totprice = 0;
  //   let order_totprice = 0;
  //   for (var i = 0; i < this.sop003.length; i++) {
  //     for (var j = 0; j < this.sop003[i].transDetailsData.length; j++) {
  //       rtn_totprice = this.sop003[i].transDetailsData[j].return.n6 * this.sop003[i].transDetailsData[j].return.n10;
  //       order_totprice = this.sop003[i].transDetailsData[j].normal.n6 * this.sop003[i].transDetailsData[j].price;
  //       res = [
  //         this.sop003[i].transDetailsData[j].name,
  //         this.sop003[i].transDetailsData[j].code,
  //         this.sop003[i].transDetailsData[j].brandowner.t2,
  //         this.sop003[i].transDetailsData[j].price,
  //         this.sop003[i].transDetailsData[j].return.n10,
  //         this.sop003[i].transDetailsData[j].return.n6,
  //         rtn_totprice,
  //         this.sop003[i].transDetailsData[j].normal.n6,
  //         order_totprice,
  //         this.sop003[i].transDetailsData[j].total
  //       ];

  //       return_result.push(res);
  //     }
  //   }
  //   return return_result;

  // }

  prepareOrdersExport() {
    let return_result: any = [];
    let res: any = {};
    let res1: any = {};
    let rtn_totprice = 0;
    let order_totprice = 0;
    let type="";
    let date="";
    for (var i = 0; i < this.sop003.length; i++) {
      for (var j = 0; j < this.sop003[i].skuOrderType.order.length; j++) {
        if (this.sop003[i].skuOrderType.order[j].n40==1)type="Order";
        if (this.sop003[i].skuOrderType.order[j].n40==3)type="Vol Pro";
        date=this.diplayFormatDate(this.sop003[i].skuOrderType.order[j].t7);
        res = [
          type,
          date,//date
          this.sop003[i].t5,//brandowner
          this.sop003[i].skuOrderType.order[j].t3,//stock name
          this.sop003[i].skuOrderType.order[j].t2,//stock code
          this.sop003[i].skuOrderType.order[j].n10,//selling price
          this.sop003[i].skuOrderType.order[j].n34,// standard price
          this.sop003[i].skuOrderType.order[j].n6,//Qty
          this.sop003[i].skuOrderType.order[j].n12,//Discount
          this.sop003[i].skuOrderType.order[j].n14//Total
        ];

        return_result.push(res);
      }

      for (var j = 0; j < this.sop003[i].promotionList.length; j++) { 
        res1 = this.sop003[i].promotionList[j];     
        type="Inv Pro";
        res = [
          type,
          this.sop003[i].createddate,//date
          this.sop003[i].t5,//brandowner
          this.sop003[i].promotionList[j].t3,//stock name
          this.sop003[i].promotionList[j].t2,//stock code
          this.sop003[i].promotionList[j].n10,//selling price
          this.sop003[i].promotionList[j].n34,// standard price
          this.sop003[i].promotionList[j].n6,//Qty
          this.sop003[i].promotionList[j].n12,//Discount
          this.sop003[i].promotionList[j].n14//Total
        ];

        return_result.push(res);
      }

      for (var j = 0; j < this.sop003[i].skuOrderType.return.length; j++) {           
        type="Expired";       
        res = [
          type,
          this.sop003[i].createddate,//date
          this.sop003[i].t5,//brandowner
          this.sop003[i].skuOrderType.return[j].t3,//stock name
          this.sop003[i].skuOrderType.return[j].t2,//stock code
          this.sop003[i].skuOrderType.return[j].n10,//selling price
          this.sop003[i].skuOrderType.return[j].n34,// standard price
          this.sop003[i].skuOrderType.return[j].n6,//Qty
          this.sop003[i].skuOrderType.return[j].n12,//Discount
          this.sop003[i].skuOrderType.return[j].n14//Total
        ];

        return_result.push(res);
      }
    }
    return return_result;

  }

  async shopChange() {
    if (this.soShop.shopName == 'No Record Found') {
      this.shopNameSearch_newOrder.setValue('');
      return;
    }
    $('#storeModelForNewOrder').appendTo("body").modal('hide');
    $('#order-detail-main').show();
    this.searchtab = false;
    this.soObj.shopname = this.soShop.shopName;
    this.soObj.n1 = this.soShop.shopCode;
    let date = this.manager.formatDate(new Date(), "yyyyMMdd");
    $('#order_detail').show();
    this.manager.getPriceChangeDetailDownload(date, this.soShop.shopSysKey, this.soShop.zoneSyskey).then(pz => {
      this.priceZone = pz;
    }).catch(() => {
      this.priceZone = [];
    })
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
    $("#cboDistrict").prop('selectedIndex', 0);
    $("#cboDistrict :selected").val("");
    $("#cboTownship").prop('selectedIndex', 0);
    $("#cboTownship :selected").val("");
    $("#cri-shop").value = "";
    $("#cri-shop2").value = "";
    this.districtList = [];
    this.townshipList = [];
    this.shoplist2 = [];
    this.soShop = this.getSoShopDetail();
    this.selectedAddress = "";
    $("#cri-shop").prop('disabled', true);
    $("#cri-shop2").prop('disabled', true);
    $('#btn-addNew-storeModelForNewOrder').hide();
    this.recentOrder_fg.get('form-status-running').setValue(true);

    // if($("#cboState :selected").val().toString() == ""){
    //   return;
    // }
    if(e.target.value == ""){
      return;
    }

    let param = {
      "code": "",
      "description": "",
      "districtSyskey": "",
      "stateSyskey": e.target.value //$("#cboState :selected").val().toString()
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
    $("#cboTownship").prop('selectedIndex', 0);
    $("#cboTownship :selected").val("");
    $("#cri-shop").value = "";
    $("#cri-shop2").value = "";
    this.townshipList = [];
    this.shoplist2 = [];
    this.soShop = this.getSoShopDetail();
    this.selectedAddress = "";
    $("#cri-shop").prop('disabled', true);
    $("#cri-shop2").prop('disabled', true);
    $('#btn-addNew-storeModelForNewOrder').hide();
    this.recentOrder_fg.get('form-status-running').setValue(true);

    // if($("#cboDistrict :selected").val().toString() == ""){
    //   return;
    // }
    if(e.target.value == ""){
      return;
    }
    
    let param = {
      "code": "",
      "description": "",
      "townshipSyskey": "",
      "districtSyskey": e.target.value //$("#cboDistrict :selected").val().toString()
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
    $("#cri-shop").value = "";
    $("#cri-shop2").value = "";
    this.shoplist2 = [];
    this.soShop = this.getSoShopDetail();
    this.selectedAddress = "";
    $("#cri-shop").prop('disabled', false);
    $("#cri-shop2").prop('disabled', false);
    $('#btn-addNew-storeModelForNewOrder').hide();
    this.recentOrder_fg.get('form-status-running').setValue(true);
    this.townshipSyskey = e.target.value;
    if( e.target.value == ""){ //$("#cboTownship :selected").val().toString()
      $("#cri-shop").prop('disabled', true);
      $("#cri-shop2").prop('disabled', true);
      return;
    }
  }

  txtShopNameEnter(e){
    if(e.key.toString() == "Enter"){
      $("#odrsalesblock").hide();
      $("#btn-addNew-storeModelForNewOrder").prop('disabled', false);
      $('#shopnamesearch-progressbar').show();
      this.manager.shopNameSearchAutoFill(this.soShop, false, this.townshipSyskey).subscribe( //$("#cboTownship :selected").val().toString()
        (data: any) => {
          this.shoplist2 = data as any[];
          // this.shoplist2.sort((a, b) => (a.shopName.toLowerCase() > b.shopName.toLowerCase()) ? 1 : -1);

          let containShop = this.shoplist2.some(
            data => {
              return data.shopName == this.soShop;
            }
          );

          if(!containShop || this.soShop.shopSyskey == undefined){
            this.selectedAddress = "";
            $('#btn-addNew-storeModelForNewOrder').hide();
            this.recentOrder_fg.get('form-status-running').setValue(true);
          }

          $('#shopnamesearch-progressbar').hide();
        },
        error => {
          $('#shopnamesearch-progressbar').hide();
        }
      );
    }
  }
  txtShopCodeEnter(el){
    if(el.key.toString() == "Enter"){
      $("#odrsalesblock").hide();
      $("#btn-addNew-storeModelForNewOrder").prop('disabled', false);
      $('#shopnamesearch-progressbar').show();
      this.manager.shopCodeSearchAutoFill2(this.soShop, false, this.townshipSyskey).subscribe( //$("#cboTownship :selected").val().toString()
        (data: any) => {
          this.shoplist2 = data as any[];
          // this.shoplist2.sort((a, b) => (a.shopName.toLowerCase() > b.shopName.toLowerCase()) ? 1 : -1);

          let containShop = this.shoplist2.some(
            data => {
              return data.shopCode == this.soShop;
            }
          );

          if(!containShop || this.soShop.shopSyskey == undefined){
            this.selectedAddress = "";
            $('#btn-addNew-storeModelForNewOrder').hide();
            this.recentOrder_fg.get('form-status-running').setValue(true);
          }

          $('#shopnamesearch-progressbar').hide();
        },
        error => {
          $('#shopnamesearch-progressbar').hide();
        }
      );
    }
  }
  async shopChange2() {
    this.selectedAddress = this.soShop.address;
    $("#odrsalesblock").hide();
    $("#btn-addNew-storeModelForNewOrder").prop('disabled', false);

    if (this.soShop.shopName == 'No Record Found') {
      this.shopNameSearch_newOrder.setValue('')
      return;
    }
    $('#btn-addNew-storeModelForNewOrder').show();
    $('#shopnamesearch-progressbar').show();
    $('.storeModelForNewOrder-content').addClass('disabled');
    let param = {
      shopsyskey: this.soShop.shopSysKey,
      usersyskey: '',
      fromDate: this.manager.formatDate(new Date(this.recentOrder_fg.get('cri-date').value), 'yyyyMMdd'),
      toDate: this.manager.formatDate(new Date(this.recentOrder_fg.get('cri-date').value), 'yyyyMMdd')
    };
    this.recentOrder_fg.get('form-status-running').setValue(true);
    const url = this.manager.appConfig.apiurl + "sop/getsolistreport";
    await new Promise<void>(promise => {
      this.getRecentSoListSubscription = this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.recentOrder_fg.get('list').setValue(data.map(r => {
            r.createddate = new Date(this.manager.formatDateByDb(r.createddate));
            return r;
          }));
          promise();
        },
        error => {
          console.log("error");
          promise();
        }
      )
    });

    this.recentOrder_fg.get('form-status-running').setValue(false);
    $('#shopnamesearch-progressbar').hide();
    $('.storeModelForNewOrder-content').removeClass('disabled');
    this.button.datechange.show = true;
    if(this.isUseSAP){
      this.salesBlock = await this.getSAPSalesInfo(this.soShop.shopCode);
      if(this.salesBlock)
      {
        $("#odrsalesblock").show();
        $("#btn-addNew-storeModelForNewOrder").prop('disabled', true);
      }
    }
  }
  async shopChange3() {
    this.selectedAddress = this.soShop.address;
    $("#odrsalesblock").hide();
    $("#btn-addNew-storeModelForNewOrder").prop('disabled', false);

    if (this.soShop.shopCode == 'No Record Found') {
      this.shopCodeSearch_newOrder.setValue('')
      return;
    }
    $('#btn-addNew-storeModelForNewOrder').show();
    $('#shopnamesearch-progressbar').show();
    $('.storeModelForNewOrder-content').addClass('disabled');
    let param = {
      shopsyskey: this.soShop.shopSysKey,
      usersyskey: '',
      fromDate: this.manager.formatDate(new Date(this.recentOrder_fg.get('cri-date').value), 'yyyyMMdd'),
      toDate: this.manager.formatDate(new Date(this.recentOrder_fg.get('cri-date').value), 'yyyyMMdd')
    };
    this.recentOrder_fg.get('form-status-running').setValue(true);
    const url = this.manager.appConfig.apiurl + "sop/getsolistreport";
    await new Promise<void>(promise => {
      this.getRecentSoListSubscription = this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.recentOrder_fg.get('list').setValue(data.map(r => {
            r.createddate = new Date(this.manager.formatDateByDb(r.createddate));
            return r;
          }));
          promise();
        },
        error => {
          console.log("error");
          promise();
        }
      )
    });

    this.recentOrder_fg.get('form-status-running').setValue(false);
    $('#shopnamesearch-progressbar').hide();
    $('.storeModelForNewOrder-content').removeClass('disabled');
    this.button.datechange.show = true;
    if(this.isUseSAP){
      this.salesBlock = await this.getSAPSalesInfo(this.soShop.shopCode);
      if(this.salesBlock)
      {
        $("#odrsalesblock").show();
        $("#btn-addNew-storeModelForNewOrder").prop('disabled', true);
      }
    }
  }
  addNew() {
    if (this.soShop.shopName == 'No Record Found') {
      this.shopNameSearch_newOrder.setValue('')
      return;
    }

    this.searchtab = false;
    this.soObj.shopname = this.soShop.shopName;
    this.soObj.n1 = this.soShop.shopCode;
    this.soObj.createddate = new Date();
    // this.soObj.t34 = "Z215";
    let date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, new Date());
    this.manager.getPriceChangeDetailDownload(date, this.soShop.shopSysKey, this.soShop.zoneSyskey).then(pz => {
      this.priceZone = pz;
    }).catch(() => {
      this.priceZone = [];
    });
    $('#storeModelForNewOrder').appendTo("body").modal('hide');
    $('#order-detail-main').show();

  }
  addRecentOrder(order) {
    this.searchtab = false;
 
    if (typeof order.createddate.getMonth === 'function') {

    } else {
      order.createddate = new Date(this.manager.formatDateByDb(order.createddate));     
    }  
    order.createddate.setMinutes(390);          

    this.showDetail_New(order);
    $('#storeModelForNewOrder').appendTo("body").modal('hide');
    $('#order-detail-main').show();
  }
  getSoList(storeId: String) {
    return new Promise((resolve, reject) => {
      const url = this.manager.appConfig.apiurl + 'sop/getsolistbo';
      const param = {

      }
    })
  }

  async new() {
    $("#cboState").prop('selectedIndex', 0);
    $("#cboState :selected").val("");
    $("#cboDistrict").prop('selectedIndex', 0);
    $("#cboDistrict :selected").val("");
    $("#cboTownship").prop('selectedIndex', 0);
    $("#cboTownship :selected").val("");
    $("#cri-shop").value = "";
    $("#cri-shop2").value = "";
    $("#odrsalesblock").hide();
    $("#btn-addNew-storeModelForNewOrder").prop('disabled', false);
    this.districtList = [];
    this.townshipList = [];
    this.shoplist2 = [];
    this.selectedAddress = "";

    // $(".header-btn").addClass("show");
    this.btn = true;
    $("#order-detail-main").hide();
    this.recentOrder_fg.get('form-status-running').setValue(true);
    this.reset(false);
    if (this.getSoListByBoSubscription !== undefined) this.getSoListByBoSubscription.unsubscribe();
    this.currentType = this.manager.tranType.SaleOrder.code;
    this.soObj.transType = this.manager.tranType.SaleOrder.code;
    this.soObj.username = this.manager.user.userName;
    this.soObj.userType = this.manager.getUserTypeDesc(this.manager.user.usertype);
    this.orderDate = new Date();
    this.soObj.t4 = this.manager.formatDate(this.orderDate, 'yyyyMMdd');
    this.soObj.n21 = this.manager.user.userSk;
    $('#storeModelForNewOrder').appendTo("body").modal('show');
    $("#cri-shop").prop('disabled', true);
    $("#cri-shop2").prop('disabled', true);
    $('#btn-addNew-storeModelForNewOrder').hide();
    this.recentOrder_fg.get('cri-date').valueChanges.subscribe(
      (changes: any) => {
        this.shopChange2();
        }
    )
    $('#storeModelForNewOrder .btn-close-storeModelForNewOrder').click(() => {
      $('#storeModelForNewOrder').appendTo("body").modal('hide');
      if (this.shopNameSearchSubscription !== undefined) this.shopNameSearchSubscription.unsubscribe();
      if (this.getRecentSoListSubscription !== undefined) this.getRecentSoListSubscription.unsubscribe();
      this.listClick();
    });
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

  delete() {
    this.loadCtrl.create({
      message: "Processing..",

    }).then(el => {
      el.present();
      const param = {
        "syskey" : this.soObj.syskey,
        "recordStatus" : 4 ,
        "saveStatus" : 0
      }
      const url = this.manager.appConfig.apiurl + "sop/update-status";
      this.http.post(url,param, this.manager.getOptions()).subscribe(
        (data: any) => {
          if (data.status === "SUCCESS") {
            el.dismiss();
            this.manager.showToast(this.tostCtrl, "Message", "Success", 1000).then(
              el => {
                this.afterSave();
              }
            )
          } else {
            el.dismiss();
            this.manager.showToast(this.tostCtrl, "Message", "Fail</br>"+ data.message, 2000).then(
              el => {

              }
            )
          }
        }
      )
    })
  }
  cancel() {
    this.alertCtrl.create({
      header: 'Confirm cancel?',
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
            this.loadCtrl.create({
              message: "Processing",
              backdropDismiss: false,
              duration: 5000
            }).then(
              el => {
              el.present();
      const param = {
        "syskey" : this.soObj.syskey,
        "recordStatus" : 0 ,
        "saveStatus" : 6
      }
      const url = this.manager.appConfig.apiurl + "sop/update-status";
      this.http.post(url,param, this.manager.getOptions()).subscribe(
        (data: any) => {
          el.dismiss();
          if (data.status === "SUCCESS") {
            el.dismiss();
            this.manager.showToast(this.tostCtrl, "Message", "Success", 1000).then(
              el => {
                this.config.currentPage=1;
                this.afterSave();
              }
            )
          } else {
            el.dismiss();
            this.manager.showToast(this.tostCtrl, "Message", "Fail</br>"+ data.message, 2000).then(
              el => {

              }
            )
          }
        },
        (error: any) => {
          el.dismiss();
          this.manager.showToast(this.tostCtrl,"Message","Fail!",1000);
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

  async pageChanged(e) {
    this.config.currentPage = e;
    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.runSpinner(true);
    await this.getSaleOrderListByBo(currentIndex, false);
    this.runSpinner(false);
  }

  dateOptionsChange() {
    let dateOption = this.manager.getDateOptions(this.advSearchObjTmp.dateOptions);
    this.advSearchObjTmp.adv_fromDate = dateOption.fromDate;
    this.advSearchObjTmp.adv_toDate = dateOption.toDate;
  }
  //new------------------------------------------------------
  /* obj group */

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
      shopcode: "",
      autokey: "",
      createddate: "",
      modifieddate: "",
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
      n22: '',
      orderby: {
        userName: '',
        syskey: ''
      },
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
      t34: "",
      salesType:"",
      Status:""
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
        order: [],
        return: [],
        promotion: []
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
    return { "syskey": "", "createddate": "", "modifieddate": "", "userid": "", "username": "", "saveStatus": 1, "recordStatus": 1, "transType": 0, "t4": "", "t1": "", "t5": "", "n1": "", "n4": 1, "n5": 0, "n6": 0, "n7": 0, "n11": "0", "n12": 1, "n14": 0, "n21": '', 'n22': '', "n55": "0", "sop003": [], "t34": "" }
  }
  getSop003Obj(): Sop003 {
    return { 'autokey': "0", 'recordStatus': 1, 'modifieddate': "", 'n1': "", 'n5': 0, 'n6': 0, 'n7': 0, 'n8': 0, 'n9': 0, 'n11': "0", 'n12': 0, 'n14': 0, 'n31': 0.0, 'n32': 0.0, 'n33': 0.0, 'n34': 0.0, 'n35': 0.0, 'n36': 0.0, 'n37': 0.0, 'n38': 0.0, 'syskey': "", 't1': "", 't5': "", 'transDetailsData': [], 'transType': 0, 'userid': "", 'username': "", 'promotionList': [] }
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
      n13: 0,//total dis amount
      n14: 0,//sub total
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
      n13: 0,//total discount amt
      n14: 0,//sub total
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
  //obj group end

  async showDetail_New(obj) {
    obj.orderby = {
      userName: '',
      syskey: ''
    }
    this.soObj = obj;
    if (typeof this.soObj.createddate.getMonth === 'function') {

    } else {
      this.soObj.createddate = new Date(this.manager.formatDateByDb(this.soObj.createddate));
    }
    this.button.datechange.show = false;
    this.prepareOrderPerson();
    this.getShopDetail(this.soObj.n1).then(() => {
      this.manager.getPriceChangeDetailDownload(this.soObj.createddate, this.soShop.shopSysKey, this.soShop.zoneSyskey).then(
        pz => {
          this.priceZone = pz;
        }
      )
    })
    $('#ordnew-tab').tab('show');
    $('#order_detail').show();

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
        bo.transDetailsData.push(detail);

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
  async addToCard() {
    const loading = await this.loadCtrl.create({ message: 'Retrieving promotions..' });
    await loading.present();
    let checkedStocks = this.skulist.filter(stock => {
      return stock.myStk.isAddToCard == true;
    })
    let sop003index;
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
          sop002Index = this.sop003[sop003index].skuOrderType.return.map(e => { return e.n1; }).indexOf(stock.syskey);
        } else {
          sop002Index = this.sop003[sop003index].skuOrderType.order.map(e => { return e.n1; }).indexOf(stock.syskey);
        }
        if (sop002Index == -1) {
          //if there is no stock in mySop002 list
          if (stock.myStk.isReturn) {
            this.sop003[sop003index].skuOrderType.return.push(this.addToStock_bindSop002Interface(stock, 2));
          } else {
            this.sop003[sop003index].skuOrderType.order.push(this.addToStock_bindSop002Interface(stock, 1));
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
            }
            else if(this.sop003[sop003index].skuOrderType.order[sop002Index].n34 != stock.stkDetail[0].price)
            {
              this.sop003[sop003index].skuOrderType.order.push(this.addToStock_bindSop002Interface(stock, 1));
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
    for (let i = 0; i < this.sop003.length; i++) {
      for (let y = 0; y < checkedStocks.length; y++) {
        if (!checkedStocks[y].myStk.isReturn)
          await this.addVolumeDiscountItem4();
      }
      loading.message = "Calculating " + i + 1 + ' of ' + this.sop003.length
    }
    this.calculate2();
    loading.dismiss();
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
    d.n14 = stock.stkDetail[0].price * stock.myStk.qty;//sub total
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
  calculate2() {
    this.sop003.forEach(sop003 => {
      sop003.n5 = 0.0;
      sop003.normalSkuTotalAmount = 0.0;
      sop003.returnSkuTotalAmount = 0.0;
      sop003.total100Percent = 0.0;
      sop003.invDiscount = 0.0;
      sop003.n7 = this.deciPlaceSetting.isUseCalcDeciPlace ? parseFloat(sop003.n7.toFixed(this.deciPlaceSetting.calcDeciPlace)) : sop003.n7;
      sop003.skuOrderType.order.forEach((orderSku) => {
        if (orderSku.recordStatus !== 4) {
          // sop003.normalSkuTotalAmount += (orderSku.n10 * orderSku.n6);
          orderSku.n14 = this.deciPlaceSetting.isUseCalcDeciPlace ? 
                        parseFloat(((orderSku.n34 * orderSku.n6) - orderSku.n13).toFixed(this.deciPlaceSetting.calcDeciPlace))  : 
                        (orderSku.n34 * orderSku.n6) -orderSku.n13;
          sop003.normalSkuTotalAmount += (orderSku.n14);
        }
      });
      sop003.skuOrderType.return.forEach(returnSku => {
        if (returnSku.recordStatus !== 4) {
          // sop003.returnSkuTotalAmount += (returnSku.n10 * returnSku.n6);
          returnSku.n13 = parseFloat((returnSku.n11 * returnSku.n6).toFixed(this.deciPlaceSetting.calcDeciPlace));//for qty inc/des
          returnSku.n14 = this.deciPlaceSetting.isUseCalcDeciPlace ? 
                        parseFloat(((returnSku.n34 * returnSku.n6) - returnSku.n13).toFixed(this.deciPlaceSetting.calcDeciPlace))  : 
                        (returnSku.n34 * returnSku.n6) -returnSku.n13;
          sop003.returnSkuTotalAmount += (returnSku.n14);
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
  parseToDecimal(val): string {
    let dec = this.deciPlaceSetting.isUseDisplayDeciPlace ? val.toFixed(this.deciPlaceSetting.displayDeciPlace) : val;
    return this.manager.numberWithCommas(dec);
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
  }
  cashAmountChangeAfterSave(bo) {
/*     if (bo.n5 < 0) {
      bo.n37 = bo.n5;
      bo.n38 = 0;
    } else {
      if (bo.n37 > bo.n5)
        bo.n37 = 0;
      else {
        bo.n38 = bo.n5 - (bo.n35 + bo.n36 + bo.n37);
      }
    } */
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
  }
  checkNewExpireStockQtyType(detail) {
    if (detail.ref1 !== "" && detail.ref1 !== "0") {
      return true;
    } else {
      return false;
    }
  }
  discountChange2(bo) {
    if (bo.n7 < 0) {
      bo.n7 = 0;
    }
    this.calculate2();
  }

  async prepareToSave2(inv: boolean) {

    if(this.saveValidation())
    {
      $('.myOuterContainer').addClass('disabled');
      $('#btn-delivery-update').prop('disabled', true);
      $('#spinner-delivery-update').show();
      let invoice: boolean = inv;
  
      const loading = await this.loadCtrl.create({ message: "Preparing .. " });
      await loading.present();
      let sop001 = this.getHeaderObj();
      sop001.syskey = this.soObj.syskey;
      sop001.createddate = this.soObj.createddate == '' ? '' : this.manager.formatDate(new Date(this.soObj.createddate), "yyyyMMdd");
      sop001.userid = this.manager.user.userId;
      sop001.username = this.manager.user.userName;
      sop001.saveStatus = this.soObj.saveStatus;
      sop001.recordStatus = 1;
      sop001.transType = this.soObj.transType;
      sop001.t4 = this.soObj.t4;
      sop001.t5 = this.soObj.t5;
      sop001.n1 = this.soObj.n1;
      sop001.n4 = this.soObj.n4;
      sop001.n21 = this.soObj.n21;
      sop001.n22 = this.soObj.orderby.syskey === "" ? this.soObj.n21 : this.soObj.orderby.syskey;
      sop001.n55 = this.soObj.n55;
      sop001.t34 = this.soObj.t34;
      // sop001.oldN5 = this.soObj.oldN5;
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
          sop002.n13 = orderSop002.n13;
          sop002.n14 = orderSop002.n14;
          sop002.n23 = 0.0;//tax
          sop002.n34 = orderSop002.n34;
          sop002.n35 = "0";
          sop002.n36 = 1;
          sop002.n37 = 0.0;
          sop002.n40 = orderSop002.n40;
          sop002.n42 = orderSop002.n42;
  
          if (sop002.n40 == 1) {
            sop002.stockPromotionDetailData = this.sop003[i].skuOrderType.order.filter((sop002Promo: Sop002_Interface) => {
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
          sop002.n13 = orderSop002.n13;//total dis amount
          sop002.n14 = orderSop002.n14;//sub total
          sop002.n23 = 0.0;//tax
          sop002.n34 = orderSop002.n34;
          sop002.n35 = "0";
          sop002.n36 = 1;
          sop002.n37 = 0.0;
          sop002.n39 = orderSop002.n39;
          sop002.n40 = 2;
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
                if (data.message == 'Promo Available') {
                  console.log('Promo Available');
                  // console.log(JSON.stringify(data.data.GiftList));
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
                  
                  if(this.soObj.syskey != "" && this.soObj.syskey != "0")//for update
                  {
                    if(proList.length == this.sop003[i].promotionList.length)
                    {
                      for(let j=0; j < this.sop003[i].promotionList.length; j++)
                      {
                        proList[j].syskey = this.sop003[i].promotionList[j].syskey;
                        proList[j].parentid = this.sop003[i].promotionList[j].parentid;
                        proList[j].ref1 = this.sop003[i].promotionList[j].ref1;                        
                        proList[j].n6 = this.sop003[i].promotionList[j].n6;
                        proList[j].n1 = this.sop003[i].promotionList[j].n1;
                        proList[j].t2 = this.sop003[i].promotionList[j].t2;
                        proList[j].t3 = this.sop003[i].promotionList[j].t3;
                        proList[j].n8 = this.sop003[i].promotionList[j].n8;
                        proList[j].n40 = this.sop003[i].promotionList[j].n40;
                        proList[j].n42 = this.sop003[i].promotionList[j].n42;  
                      }
                    }else
                    {
                      for(let j=0; j < proList.length; j++)
                      {
                        for(let k=0; k < this.sop003[i].promotionList.length; k++){
                          if(proList[j].n1 == this.sop003[i].promotionList[k].n1)
                          {                       
                            proList[j].n6 = this.sop003[i].promotionList[k].n6;
                          }else{
                            proList[j].n6 = 0;
                          }
                        }                  
                      }
                    }
                  }
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
        $('#previewToSaveOdr').appendTo("body").modal('show');
        $('#previewToSaveOdr .previewSaveBtn').click(() => {
          status = 1;
          dialog();
        });
        $('#previewToSaveOdr .previewCloseBtn').click(() => {
          $('.myOuterContainer').removeClass('disabled');
          dialog();
        });
      })
      if (status == 1) {
        this.loadCtrl.create({
          message: "Processing",
          backdropDismiss: false
        }).then(
          async el => {
            el.present();
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
            console.log(this.finalSop001);
            
            await this.save(this.finalSop001);
            el.dismiss();
            if (this.saveReturnStatus == 1) {
              this.manager.showToast(this.tostCtrl, "Message", "Success!", 1000).then(
                e => {
                  this.config.currentPage=1;
                  this.afterSave();
                }
              )
            } else if (this.saveReturnStatus == 2) {
              this.manager.showToast(this.tostCtrl, "Message", "Sales Block!", 1000, 'danger').then(
                e => {
                  this.afterSave();
                }
              )
            }
             else if (this.saveReturnStatus == 3) {
              this.manager.showToast(this.tostCtrl, "Message", "Credit Sales Block!", 1000, 'danger').then(
                e => {
                  // this.afterSave();
                  $('.myOuterContainer').removeClass('disabled');
                }
              )
            }else if (this.saveReturnStatus == 4) {
              this.manager.showToast(this.tostCtrl, "Message", "Over Credit Limit!", 1000, 'danger').then(
                e => {
                  // this.afterSave();
                  $('.myOuterContainer').removeClass('disabled');
                }
              )
            }else if (this.saveReturnStatus == 6) {
              this.manager.showToast(this.tostCtrl, "Message", "Credit Sale already exists!", 1000, 'danger').then(
                e => {
                  // this.afterSave();
                  $('.myOuterContainer').removeClass('disabled');
                }
              )
            }  else {
              this.manager.showToast(this.tostCtrl, "Message", "Something went wrong!", 1000).then(
                e => {
                }
              );
              $('.myOuterContainer').removeClass('disabled');
            }
  
          }
        )
      }else{
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
    this.orderTypeChange(0);
    // $(".header-btn").removeClass("show");
    this.btn = false;
    $('#ordlist-tab').tab('show');
    $('#order_detail').hide();
    $('.myOuterContainer').removeClass('disabled');
  }

  save(obj) {
    return new Promise<void>(promise => {
      const url = this.manager.appConfig.apiurl + 'sop/saveso';
      let caller = this.http.post(url, obj, this.manager.getOptions()).subscribe(
        (data: any) => {
          promise();
          if (data.message == "SUCCESS") {
            this.saveReturnStatus = 1;
          }else if (data.message == "SALES_BLOCK") {
            this.saveReturnStatus = 2;
          }else if (data.message == "CREDIT_BLOCK") {
            this.saveReturnStatus = 3;
          }else if (data.message == "OVER_CREDIT") {
            this.saveReturnStatus = 4;
          }else if (data.message == "EXIST") {
            this.saveReturnStatus = 6;
          }else {
            this.saveReturnStatus = 5;
          }
        },
        error => {
          this.saveReturnStatus = 0;
          promise();
        }
      )

    });
  }
  async launchStockModal(boSyskey) {
    if (this.soObj.saveStatus == 128) return;
    if (this.sessionObj.lock) return;
    $('#skuaddmodal').appendTo("body").modal('show');
    this.orderNewSkuIndex = [];
    $('#stock-progressbar').show();
    $('#stockaddtbl').hide();
    $('.searching-stock-icon').show();
    this.getStockList(boSyskey).then(
      ok => {
        $('.searching-stock-icon').hide();
        $('#stock-progressbar').hide();
        $('#stockaddtbl').show();
      }
    ).catch(
      error => {
        this.manager.showToast(this.tostCtrl, "Message", "Server Not Responding!\n Try to reload the page.", 1000).then(
          el => {
            $('#skuaddmodal').appendTo("body").modal('hide');
          }
        )
      }
    )

    // }

  }
  getStockList(boSyskey) {
    return new Promise<void>((promise, reject) => {
      const url = this.manager.appConfig.apiurl + 'StockSetup/getstockbysyskey';
      // const url = ' http://52.255.142.115:8084/auderbox/StockSetup/getstockbysyskey';
      let param;
      if (boSyskey == -1) {
        param = {
          syskey: "",
          zoneList: []
        };
      } else {
        param = {
          syskey: "",
          n7: boSyskey,
          zoneList: []
        };
      }

      if(this.soShop.zoneSyskey != undefined && this.soShop.zoneSyskey != "0" && this.soShop.zoneSyskey != "")
      {
        param.zoneList.push(this.soShop.zoneSyskey);
      }

      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.skulist = data.map((s) => {
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
            }
            let pzList = this.priceZone.filter(pz => {
              return pz.n1 == s.syskey
            });
            if (pzList.length > 0) s.stkDetail[0].price = pzList[0].n3;

            return s;
          });
          promise();

        },
        error => {
          reject();
        }
      )
    })
  }
  getShopNameAutoComplete(option) {
    return option == null ? '' : option.shopName;
  }
  getShopCodeAutoComplete(option) {
    return option == null ? '' : option.shopCode;
  }
  displayNone(val) {
    return val == '' ? '-' : val;
  }
  diplayFormatDate(dbDate) {
    if (dbDate == "") return this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI, new Date());
    else
      return this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, dbDate);
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
      $('#progress-bar-getdiscount').show();
      $('#tabel-detail :input').attr('disabled', true);
      $('#btnPreview').attr('disabled', true);
      await this.addVolumeDiscountItem4();
      this.calculate2();
      $('#tabel-detail :input').attr('disabled', false);
      $('#progress-bar-getdiscount').hide();
      $('#btnPreview').attr('disabled', false);
    }

  }

  getShortNum(num) {
    let stringNum = "" + num;
    let array1 = [];
    array1 = Array.from(stringNum);
    return array1.reduce((a, b) => a + parseInt(b), 0)
  }
  showOrderbyModal() {
    let cri = {
      userType: 1,
      otherId: '',
      status: '0',
      userId: '',
      userName: '',
      syskey: '',
      gender: '',
      dob: '',
      nrc: '',
      teamtype: ''
    }
    this.manager.getUserListByCri(cri).then(
      (result) => {
        this.userlist2 = result;
        $('#orderbyModel').appendTo('body').modal('show');
      }
    ).catch(() => {
      this.userlist2 = []
    });


  }
  prepareOrderPerson() {
    if (this.soObj.n22 !== '') {
      this.manager.getUserListByCri({
        userType: 1,
        otherId: '',
        status: '',
        userId: '',
        userName: '',
        syskey: this.soObj.n22,
        gender: '',
        dob: '',
        nrc: '',
        teamtype: ''
      }).then(
        (rs: any) => {
          if (rs.length > 0) {
            this.soObj.orderby = rs[0];
          }

        }
      ).catch(() => { });
    }
  }
  /** 10/5/2021 */
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
      $('#overmaxqty').html('<span style="color:red;font-size:3;">Input exceeds maximum allowed QTY '+proItem.maxQty + ' by ' + (totalQty - proItem.maxQty) +'!</span>'); 
      proItem.n6 = 0;
    } else {
      if (proItem.n6 < 0) proItem.n6 = 0;
      $('#overmaxqty').html('');
    }
  }
  async muldis4(isSave) {
    $('#progress-bar-getdiscount').show();
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
              s2.n13 = 0.0;
              s2.n14 = 0.0;
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
    $('#tabel-detail :input').attr('disabled', false);
    $('#progress-bar-getdiscount').hide();
    this.calculate2();
    if (isSave) {
      this.prepareToSave2(true);
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
    m.n13 = 0.0; //total dis amount
    m.n14 = 0.0;
    m.n34 = 0.0;
    m.n40 = 3;    // 1-normal,2-return,3-promotion
    m.n42 = child.discountItemType == 'GIFT' ? 1 : 2;
    m.discountItemEndType = child.discountItemEndType;
    //m.stockPromotionSubDetailData = child;
    return m;
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
    $('#progress-bar-getdiscount').show();
    $('#tabel-detail :input').attr('disabled', true);
    $('#btnPreview').attr('disabled', true);
    await this.addVolumeDiscountItem4();
    $('#tabel-detail :input').attr('disabled', false);
    $('#progress-bar-getdiscount').hide();
    $('#btnPreview').attr('disabled', false);

    this.calculate2();
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
    d.n13 = d.stockPromotionSubDetailData[i].n13;
    d.n34 = d.stockPromotionSubDetailData[i].n34;
    d.n40 = d.stockPromotionSubDetailData[i].n40;
    d.n42 = d.stockPromotionSubDetailData[i].n42;
    d.isEndTypeTotalItem = d.stockPromotionSubDetailData[i].isEndTypeTotalItem;
    //d.maxQty = d.stockPromotionSubDetailData[i].maxQty;
  }
//   showToast(tostcontroller: ToastController, header: string, message: string, duration: number, css?) {
//     return this.tostCtrl.create({
//       header: header,
//       message: message,
//       duration: duration,
//       cssClass: 'info1',
//       mode: "md",
//       position: 'bottom',
//       color: css ? css : 'primary'
//     }).then(
//       e => {
//         e.present();
//         return e.onDidDismiss();
//       }
//     )
//   }

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
  // }else{
  //   bo.n37 = bo.n5;
  //   bo.n38 = 0;
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

}
