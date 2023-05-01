import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatOption } from '@angular/material';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { IonContent, AlertController, NavController, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { AppComponent } from '../app.component';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { FormControl } from '@angular/forms';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $: any;
var date = new Date();
var firstDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 6);
var lastDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());


@Component({
  selector: 'app-order-report',
  templateUrl: './order-report.page.html',
  styleUrls: ['./order-report.page.scss'],
})

export class OrderReportPage implements OnInit,AfterViewInit {
  tspNameSearch: FormControl = new FormControl();
  @ViewChild('picker', { static: false }) matDatepicker: MatDatepicker<Date>;
  @ViewChild('triggerAllUserSelectOption', { static: false }) triggerAllUserSelectOption: MatOption;

  config = {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  obj: any = this.getPersonShopObj();
  TypeList: any = [];
  shopList: any = [];
  shopSysKeyList: any = [];
  shopPersonList: any = [];
  personList: any = [];
  load: boolean = false;
  minDate: any;
  maxDate: any = new Date();
  spinner: boolean = false;
  searchtab: boolean = false;
  shopList1: any = []; shopList2: any = [];
  ownerList1: any = [];
  criteria: any = this.getCriteriaData();
  searchCriteria: any = this.getCriteriaData();
  stockList1: any = [];
  stockList2: any = [];
  stockCodeSearch: FormControl = new FormControl();
  stockNameSearch: FormControl = new FormControl();
  pagination_flag: any = 0;
  // shopCodeSearch: FormControl = new FormControl();
  // shopNameSearch: FormControl = new FormControl();
  stateList: any = [];
  tspList: any = [];
  staobj = this.getStateObj();
  tspobj = this.getTspObj();
  statesyskey: any;
  userList1: any = [];
  toppings = new FormControl();
  value: any;
  isUseSAP: boolean = false;
  constructor(
    public manager: ControllerService,
    public http: HttpClient,
    public router: Router,
    public alertController: AlertController,
    public event: Events,
    public app: AppComponent,
    public tostCtrl: ToastController,
    public activatedRoute: ActivatedRoute,
    public loading: LoadingController
  ) {
    this.manager.isLoginUser();
  }
  ngAfterViewInit(): void {
    this.tspNameSearch.valueChanges.subscribe(
      (search:string)=>{
        if(search == ""){
          this.tspList = [];
        }
      }
    )
  }

  define = [{}]

  ngOnInit() {
    this.manager.isLoginUser();
  }

  getPersonShopObj() {
    return {
      syskey: "",
      userSysKey: "",
      brandOwner: "",
      shopCode: "",
      fromDate: "",
      toDate: "",
      quantity: "",
      prices: "",
      skuCode: "",
      skuName: "",
      shopName: "",
      type: "",
      current: "",
      maxRow: "",
      shopSysKeyList: [],
      disamt: 0.0,
      dispercent: 0.0,
      distype: 0,
      dissku: "",
      saveStatus: "",
      giftquantity: 0
    }
  }

  async ionViewWillEnter() {
    this.manager.isLoginUser();
    this.getCriteriaData();
    this.allList();
    this.getStateList();
    this.getUsers();

    this.criteria.fromDate = lastDay;
    this.criteria.toDate = lastDay;
    this.spinner = true;
    await this.getAll();
    this.spinner = false;
    $('#spinner-tsp').hide();
    this.isUseSAP = this.manager.settingData.n8 == '1' ? true : false;
  }

  ionViewDidEnter() {
    this.load = true;
  }

  new() {
    this.router.navigate(['/personshop-new']);
  }

  runSpinner(t: boolean) {
    this.spinner = t;
  }

  advanceSearch(option) {
    this.searchtab = option;
  }
  advanceSearchReset() {
    $('#sta').val('');
    this.criteria = this.getCriteriaData();
    this.criteria.fromDate = lastDay;
    this.criteria.toDate = lastDay;
    this.getAll();
  }


  toggleUserAllSelect() {
    if (this.triggerAllUserSelectOption.selected) {
      this.criteria.syskey = [];
      this.criteria.syskey.push(-1);
      for (let u of this.userList1) {
        this.criteria.syskey.push(u.syskey)
      }
    } else {
      this.criteria.syskey = [];
    }
  }

  getAll() {
    this.loading.create({
      message: 'Please wait...',
      backdropDismiss: false
    }).then(loadCtrl => {
      loadCtrl.present();
      const url = this.manager.appConfig.apiurl + 'reports/orderreport';
      this.obj.maxRow = this.config.itemsPerPage;
      this.obj.current = 0;

      //let dateT = new Date();
      // this.obj.createdDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, dateT);
      this.obj.fromDate = lastDay;
      this.obj.toDate = lastDay;
      this.obj.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.obj.fromDate);
      this.obj.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.obj.toDate);

      this.searchCriteria.fromDate = this.obj.fromDate;
      this.searchCriteria.toDate = this.obj.toDate;
      this.shopPersonList = [];
      this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
        (data: any) => {
          if (data.message == "SUCCESS") {
            this.config.totalItems = data.rowCount;
            this.config.currentPage = 1;

            // this.shopPersonList = [];
            this.shopPersonList = data.dataList;

            for (var i = 0; i < this.shopPersonList.length; i++) {
              // this.shopPersonList[i].createdDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.shopPersonList[i].fromDate);
              this.shopPersonList[i].fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.shopPersonList[i].fromDate);
              if (this.shopPersonList[i].applieddate.toString() != "") {
                this.shopPersonList[i].applieddate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.shopPersonList[i].applieddate);
              } 
            }

            this.obj.fromDate = "";
            loadCtrl.dismiss();
          }
        },
        (error)=>{
          loadCtrl.dismiss();
          console.log(error)
        }
      );
    });

  }

  search(currIndex, criFlag) {
    this.loading.create({
      message: "Processing..",

      backdropDismiss: false
    }).then(
      el => {
        el.present();

        this.searchCriteria.maxRow = this.config.itemsPerPage;
        this.searchCriteria.current = currIndex;
        const url = this.manager.appConfig.apiurl + 'reports/orderreport';
        this.value = "";


        for (var i = 0; i < this.criteria.syskey.length; i++) {
          this.value += this.criteria.syskey[i] + ",";
        }
        console.log(this.value);
        this.value = this.value.slice(0, -1);
        this.searchCriteria.syskey = this.value;

        if (criFlag == true) {
          this.searchCriteria.skuCode = this.criteria.skuCode;
          this.searchCriteria.shopCode = this.criteria.shopCode;
          this.searchCriteria.skuName = this.criteria.skuName;
          this.searchCriteria.shopName = this.criteria.shopName;
          this.searchCriteria.brandOwner = this.criteria.brandOwner;
          this.searchCriteria.spSKUCode = this.criteria.spSKUCode;
          this.searchCriteria.type = this.criteria.type;
          this.searchCriteria.location = this.criteria.location;
          this.searchCriteria.township = this.criteria.township;
          this.searchCriteria.syskey = this.value;
          this.searchCriteria.state = this.staobj.syskey;

          if (this.criteria.fromDate.toString() != "") {
            this.searchCriteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
          } else {
            // this.criteria.fromDate=firstDay;
            // this.criteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
            this.searchCriteria.fromDate = "";
          }

          if (this.criteria.toDate.toString() != "") {
            this.searchCriteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
          } else {
            // this.criteria.toDate=lastDay;
            // this.criteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
            this.searchCriteria.toDate = "";
          }
        }

        this.shopPersonList = [];
        this.http.post(url, this.searchCriteria, this.manager.getOptions()).subscribe(
          (data: any) => {
            this.loading.dismiss();

            if (data.message == "SUCCESS") {
              this.config.totalItems = data.rowCount;
              if (currIndex == 0) {
                this.config.currentPage = 1;
              }

              // this.shopPersonList = [];
              this.shopPersonList = data.dataList;

              for (var i = 0; i < this.shopPersonList.length; i++) {
                this.shopPersonList[i].fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.shopPersonList[i].fromDate);
                if (this.shopPersonList[i].applieddate.toString() != "") {
                  this.shopPersonList[i].applieddate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.shopPersonList[i].applieddate);
                }          
              }
            }
          },error => {
            console.log(error);
            this.loading.dismiss();
          }
        );
      }
    );
  }


  pageChanged(e) {
    this.config.currentPage = e;

    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.search(currentIndex, false);
  }
  print() {
    this.loading.create({
      message: "Processing..",
      backdropDismiss: false
    }).then(
      el => {
        el.present();
        this.value = "";
        this.searchCriteria.maxRow = "";
        this.searchCriteria.current = "";
        const url = this.manager.appConfig.apiurl + 'reports/orderreport';

        for (var i = 0; i < this.criteria.syskey.length; i++) {
          this.value += this.criteria.syskey[i] + ",";
        }
        console.log(this.value);
        this.value = this.value.slice(0, -1);

        this.searchCriteria.skuCode = this.criteria.skuCode;
        this.searchCriteria.shopCode = this.criteria.shopCode;
        this.searchCriteria.skuName = this.criteria.skuName;
        this.searchCriteria.shopName = this.criteria.shopName;
        this.searchCriteria.brandOwner = this.criteria.brandOwner;
        this.searchCriteria.spSKUCode = this.criteria.spSKUCode;
        this.searchCriteria.type = this.criteria.type;
        this.searchCriteria.location = this.criteria.location;
        this.searchCriteria.township = this.criteria.township;
        this.searchCriteria.state = this.staobj.syskey;
        this.searchCriteria.syskey = this.value;
        if (this.criteria.fromDate.toString() != "") {
          this.searchCriteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
        }
        if (this.criteria.toDate.toString() != "") {
          this.searchCriteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
        }

        this.http.post(url, this.searchCriteria, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            let cri_date1 = "";
            let cri_date2 = "";

            if (this.criteria.fromDate.toString() != "") {
              cri_date1 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI, this.criteria.fromDate).toString();
            }
            if (this.criteria.toDate.toString() != "") {
              cri_date2 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI, this.criteria.toDate).toString();
            }


            if (data.message == "SUCCESS") {

              let data1 = data.dataList;
              let cri_flag = 0;

              let excel_date = "";
              let type_flag = "";

              let excelTitle = "Order Detail Report"; 
              let excelHeaderData = [
                "Date", "Time", "Transaction ID","Order Number","State","TownShip", "User Name", "Order By", "BrandOwner Name", "Brand Shop Code", "Shop Code", "Shop Name",
                "Address", "Brand SKU Code", "Stock Code", "Stock Name",
                "Quantity", "Standard Price", "Selling Price", "Sub Total", "Discount Amt", "Percentage", "Gift Qty", "Gift Type", "Type",
                "Invoice Dis Percentage", "Invoice Discount Amt", "Sub Total after all discounts"
              ];
              if(this.isUseSAP){
                excelHeaderData.push("Sales Type");
              }
              let excelDataList: any = [];

              let workbook = new Workbook();
              let worksheet = workbook.addWorksheet('Order Detail Data');

              for (var exCount = 0; exCount < data1.length; exCount++) {
                let excelData: any = [];
                excel_date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].fromDate).toString();
                excelData.push(excel_date); 
                if(data1[exCount].createdTime.length >= 6)
                {
                  data1[exCount].createdTime = data1[exCount].createdTime.slice(-6);
                  data1[exCount].createdTime = data1[exCount].createdTime.slice(0,2) + ":"+ data1[exCount].createdTime.slice(2,4)+":"+ data1[exCount].createdTime.slice(4);
                }
                excelData.push(data1[exCount].createdTime);
                excelData.push(data1[exCount].transactionID);
                excelData.push(data1[exCount].orderNumber);
                excelData.push(data1[exCount].state);
                excelData.push(data1[exCount].township);
                excelData.push(data1[exCount].userName);
                excelData.push(data1[exCount].order);
                excelData.push(data1[exCount].brandOwner);
                excelData.push(data1[exCount].spShopCode);
                excelData.push(data1[exCount].shopCode);
                excelData.push(data1[exCount].shopName);
                excelData.push(data1[exCount].location);
                excelData.push(data1[exCount].spSKUCode);
                excelData.push(data1[exCount].skuCode);
                excelData.push(data1[exCount].skuName);
                excelData.push(data1[exCount].quantity);
                excelData.push(data1[exCount].nprice);
                excelData.push(data1[exCount].prices);
                excelData.push(data1[exCount].subTotal);
                excelData.push(data1[exCount].disamt);
                excelData.push(data1[exCount].dispercent);
                excelData.push(data1[exCount].giftquantity)
                excelData.push(data1[exCount].saveStatus);
                excelData.push(data1[exCount].type);
                excelData.push(data1[exCount].invDisPercent + '%');
                excelData.push(data1[exCount].invDisAmount);
                excelData.push(data1[exCount].invAftDisAmount);
                if(this.isUseSAP){
                  excelData.push(data1[exCount].salesTypeDesc);
                }

                excelDataList.push(excelData);
              }

              let titleRow = worksheet.addRow(["", "", excelTitle]);
              titleRow.font = { bold: true };
              worksheet.addRow([]);

              let criteriaRow;
              if (cri_date1.toString() != "") {
                criteriaRow = worksheet.addRow(["From Date : " + cri_date1.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (cri_date2.toString() != "") {
                criteriaRow = worksheet.addRow(["To Date : " + cri_date2.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.brandOwner.toString() != "") {
                criteriaRow = worksheet.addRow(["Brand Owner : " + data1[0].brandOwner.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.shopCode.toString() != "") {
                criteriaRow = worksheet.addRow(["Shop Code : " + this.criteria.shopCode.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.shopName.toString() != "") {
                criteriaRow = worksheet.addRow(["Shop Name : " + this.criteria.shopName.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.location.toString() != "") {
                criteriaRow = worksheet.addRow(["Address : " + this.criteria.location.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.spSKUCode.toString() != "") {
                criteriaRow = worksheet.addRow(["Brand SKU Code : " + this.criteria.spSKUCode.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.skuCode.toString() != "") {
                criteriaRow = worksheet.addRow(["Stock Code : " + this.criteria.skuCode.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.skuName.toString() != "") {
                criteriaRow = worksheet.addRow(["Stock Name : " + this.criteria.skuName.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.township.toString() != "") {
                criteriaRow = worksheet.addRow(["Township Name : " + this.criteria.township.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.type.toString() != "") {
                if (this.criteria.type.toString() == "1") {
                  type_flag = "Order Product";
                } else if (this.criteria.type.toString() == "2") {
                  type_flag = "Return Product";
                }
                criteriaRow = worksheet.addRow(["Type : " + type_flag]);
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
                FileSaver.saveAs(blob, "SDetailO_export_" + new Date().getTime() + EXCEL_EXTENSION); //SO_export_
              });
            }
          }
        );


      }
    )

  }

  // private saveAsExcelFile(buffer: any, fileName: string): void {
  //   const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
  //   FileSaver.saveAs(data, fileName + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
  // }

  dblClickFunc() {
    this.criteria.fromDate = "";
  }

  alert(title, messages) {
    this.alertController.create({
      translucent: true,
      header: title,
      message: messages,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          handler: (ok) => {
          }
        }
      ]
    }).then(alert => alert.present());
  }
  getStateObj() {
    return {
      syskey: "0",
      createddate: "",
      modifieddate: "",
      userid: "",
      username: "",
      RecordStatus: 0,
      SyncStatus: 0,
      SyncBatch: "",
      t1: "",
      t2: "",
      t3: "",
      n1: 0,
      n2: 0,
      n3: "",
      Usersyskey: ""
    };
  }

  getTspObj() {
    return {
      syskey: "0",
      createddate: "",
      modifieddate: "",
      userid: "",
      username: "",
      RecordStatus: 0,
      SyncStatus: 0,
      SyncBatch: "",
      t1: "",
      t2: "",
      t3: "",
      n1: 0,
      n2: 0,
      n3: "",
      Usersyskey: ""
    };
  }
  getCriteriaData() {
    return {
      "syskey": "",
      "skuCode": "",
      "skuName": "",
      "shopCode": "",
      "shopName": "",
      "brandOwner": "",
      "fromDate": "",
      "toDate": "",
      "location": "",
      "spSKUCode": "",
      "type": "",
      "current": "",
      "maxRow": "",
      "userName": "",
      "saveStatus": "",
      "township": "",
      "state":""

    };
  }
  getStateList() {
    const url = this.manager.appConfig.apiurl + 'placecode/state';
    var param = {
      code: "",
      description: ""
    };

    var subscribe = this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.stateList = data.dataList.sort( (a:any,b:any)=>{
          const first = $.trim(a.t2.toLocaleUpperCase());
          const sec = $.trim(b.t2.toLocaleUpperCase());
          if (first < sec) {
            return -1;
          }
        })
      }
    );
  }

  stateChange() {
    this.tspNameSearch.setValue("")
  }


  getTspListForAutoComplete() {
    $('#spinner-tsp').show();
    this.manager.tspNameSearchAutoFill(this.staobj.syskey, this.tspNameSearch.value).subscribe(
      data => {
        this.tspList = data as any[];
        this.tspList.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
        $('#spinner-tsp').hide();
      },error=>{
        $('#spinner-tsp').hide();
      }
    );
  }

  allList() {
    var url = "";
    var param = {};

    param = {
      "code": "",
      "description": ""
    };
    url = this.manager.appConfig.apiurl + 'brandowner/getbrandowner';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.ownerList1 = data.dataList;
        this.ownerList1.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
      }
    );
    // this.shopCodeSearch.valueChanges.subscribe(
    //   term => {
    //     if (term != '') {
    //       this.manager.shopCodeSearchAutoFill(term).subscribe(
    //         data => {
    //           this.shopList2 = data as any[];

    //           // console.log("code" + this.shopList2[0].shopCode);
    //           //  this.stockList2 = data as any[];
    //         });
    //     }
    //   }
    // );

    // this.shopNameSearch.valueChanges.subscribe(
    //   term => {
    //     if (term != '') {
    //       this.manager.shopNameSearchAutoFill(term).subscribe(
    //         data => {
    //           this.shopList1 = data as any[];

    //           //  this.stockList2 = data as any[];
    //         });
    //     }
    //   }
    // );
    this.stockCodeSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.stockCodeSearchAutoFill(term).subscribe(
            data => {
              this.stockList2 = data as any[];

              console.log("code" + this.stockList2[0].skuCode);
              //  this.stockList2 = data as any[];
            });
        }
      }
    );

    this.stockNameSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.stockNameSearchAutoFill(term).subscribe(
            data => {
              this.stockList1 = data as any[];

              //  this.stockList2 = data as any[];
            });
        }
      }
    );

    // param = {
    //   "searchVal": ""
    // };
    // url = this.manager.appConfig.apiurl + 'user/userList';
    // this.http.post(url, param, this.manager.getOptions()).subscribe(
    //   (data: any) => {
    //     this.userList1 = data.dataList;
    //     this.userList1.sort((a, b) => (a.userName.toLowerCase() > b.userName.toLowerCase()) ? 1 : -1);
    //   }
    // );
    
  }
  getUsers() {
    return new Promise<void>(promise => {
      const url = this.manager.appConfig.apiurl + 'user/userCriReportList';
      const param = {
        userType: 1
      };
      let caller = this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.userList1 = data.dataList;
          this.userList1.sort((a, b) => (a.userName.toLowerCase() > b.userName.toLowerCase()) ? 1 : -1);
          console.log("user count = " +data.totalCount);
          promise();
        },
        error => {
          console.log(error);
          promise();
        }
      )
    })
  }
}