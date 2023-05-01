import { Router, ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { MatDatepicker } from '@angular/material/datepicker';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { AppComponent } from '../app.component';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import { FormControl } from '@angular/forms';
import moment from 'moment';
import { MatOption, MatSelect } from '@angular/material';
import { using } from 'rxjs';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
var date = new Date();
// var firstDay = moment().startOf('week').toDate();
// var lastDay = moment().endOf('week').toDate()
var expanded = false;
declare var $: any;
@Component({
  selector: 'app-order-delivery-report',
  templateUrl: './order-delivery-report.page.html',
  styleUrls: ['./order-delivery-report.page.scss'],
})
export class OrderDeliveryReportPage implements OnInit {
  @ViewChild('picker', { static: false }) matDatepicker: MatDatepicker<Date>;
  @ViewChild('triggerAllUserSelectOption', { static: false }) triggerAllUserSelectOption: MatOption;
  userSelectOptions
  // shopCodeSearch: FormControl = new FormControl();
  // shopNameSearch: FormControl = new FormControl();
  config = {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  //obj: any = this.getPersonShopObj();
  _tspList: any;
  tspNameSearch: FormControl = new FormControl();
  obj: any = this.getCriteriaData();
  TypeList: any = [];
  orderDeliveryList: any = [];
  load: boolean = false;
  minDate: any;
  maxDate: any = new Date();
  spinner: boolean = false;
  searchtab: boolean = false;
  shopList1: any = [];
  shopList2: any = [];
  ownerList1: any = [];
  criteria: any = this.getCriteriaData();
  total: any;
  pagination_flag: any = 0;
  userlist: any = [];
  username: any = [];
  value: any = []
  flag: boolean = false;
  flag1: boolean = false;
  toppings = new FormControl();

  stateList: any = [];
  statesyskey: any = "";

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
  toggleUserAllSelect() {


    if (this.triggerAllUserSelectOption.selected) {
      this.criteria.syskey = [];
      this.criteria.syskey.push(-1)
      for (let u of this.userlist) {
        this.criteria.syskey.push(u.syskey)
      }
    } else {
      this.criteria.syskey = [];
    }



  }
  ngOnInit() {
    this.manager.isLoginUser();
  }

  async ionViewWillEnter() {
    this.manager.isLoginUser();
    this.criteria.type = 211;
    this.criteria.status = 1;
    this.criteria.dateOptions = "today";
    this.dateOptionsChange();
    this.search(0);
    this.allList();
  }

  ionViewDidEnter() {
    this.load = true;
  }

  runSpinner(t: boolean) {
    this.spinner = t;
  }
  dateOptionsChange() {
    let dateOption = this.manager.getDateOptions(this.criteria.dateOptions);
    this.criteria.fromDate = dateOption.fromDate;
    this.criteria.toDate = dateOption.toDate;
  }

  advanceSearch(option) {
    this.getUsers();
    this.searchtab = option;
    this.flag1 = true;
    this.flag = true;
  }

  advanceSearchReset() {
    this.criteria = this.getCriteriaData();
    this.criteria.type = 211;  //order
    this.criteria.status = 1;
    this.criteria.dateOptions = "today";
    this.dateOptionsChange();
    this.criChange();
    this.search(0);
  }
  criChange() {
    this.userlist = "";
    this.getUsers();
  }
  getUsers() {
    return new Promise<void>(promise => {
      let param = { userType: 1 };
      const url = this.manager.appConfig.apiurl + 'user/userReportList';
      this.criteria.type == 211 ? param = { userType: 1 } : param = { userType: 2 };
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

  search(currIndex) {
    this.spinner = true;

    const url = this.manager.appConfig.apiurl + 'reports/orderDeliveryRoutingList';
    this.obj.maxRow = this.config.itemsPerPage;
    this.obj.current = currIndex;
    this.value = "";

    this.obj.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
    this.obj.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
    this.obj.shopcode = this.criteria.shopcode;
    this.obj.shopName = this.criteria.shopName;
    this.obj.location = this.criteria.location;
    this.obj.state = this.criteria.state;
    this.obj.township = this.criteria.township;
    this.obj.status = this.criteria.status;
    this.obj.userName = this.criteria.userName;
    //this.obj.select = this.criteria.select;
    this.obj.type = this.criteria.type;
    // for (var i = 0; i < this.criteria.syskey.length; i++) {
    //   this.value += this.criteria.syskey[i] + ",";
    // }
    if (this.criteria.syskey != '') {
      const reInd = this.criteria.syskey.indexOf(-1);
      if(reInd != -1)this.criteria.syskey.splice( reInd, 1);
      this.obj.syskey = this.criteria.syskey.reduce((rs, cur) => {
        if (rs == '') {
          return cur;
        } else {
            return rs + "," + cur;
        }
      }, '');
    }

    if (this.obj.fromDate.toString() == "false") {
      this.alert("Message", "Add Correct Date Format");
      this.obj.fromDate = "";
    }
    if (this.obj.toDate.toString() == "false") {
      this.alert("Message", "Add Correct Date Format");
      this.obj.toDate = "";
    }
    else {
      this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
        (data: any) => {

          this.spinner = false;
          this.config.totalItems = data.totalCount;
          //this.config.itemsPerPage= data.dataList.length;
          if (currIndex == 0) {
            this.config.currentPage = 1;
          }

          this.orderDeliveryList = [];
          this.orderDeliveryList = data.dataList;

          for (var i = 0; i < this.orderDeliveryList.length; i++) {
            this.orderDeliveryList[i].date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.orderDeliveryList[i].date);
          }

        },
        error => {
          this.spinner = false;
        }
      );
    }
  }

  loop(type) {
    if (type == 1) {
      return "Complete"
    } else if (type == 2) {
      return "Incomplete"
    } else {
      return "All"
    }
  }

  loop1(type) {
    if (type == 211) {
      return "Order"
    } else {
      return "Delivery"
    }
  }

  pageChanged(e) {
    this.config.currentPage = e;
    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.search(currentIndex);
  }

  print() {
    this.loading.create({
      message: "Processing..",

      backdropDismiss: false
    }).then(
      el => {
        el.present();
        const url = this.manager.appConfig.apiurl + 'reports/orderDeliveryRoutingList';
        this.value = "";
        let send_data1 = this.criteria.fromDate;
        let send_data2 = this.criteria.toDate;
        for (var i = 0; i < this.criteria.syskey.length; i++) {
          this.value += this.criteria.syskey[i] + ",";
        }

        this.obj.shopcode = this.criteria.shopcode;
        this.obj.shopName = this.criteria.shopName;
        this.obj.location = this.criteria.location;
        this.obj.state = this.criteria.state;
        this.obj.township = this.criteria.township;
        this.obj.status = this.criteria.status;
        this.obj.maxRow = "";
        this.obj.current = "";
        this.obj.userName = this.criteria.userName;
        this.value = this.value.slice(0, -1);
        this.obj.syskey = this.value;
        if (this.criteria.fromDate.toString() != "") {
          this.obj.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
        }
        // if (this.criteria.toDate.toString() != "") {
        //   this.obj.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
        // }
        if (this.obj.fromDate.toString() == "false") {
          this.alert("Message", "Add Correct Date Format");
          this.obj.fromDate = "";
        }
        if (this.obj.toDate.toString() == "false") {
          this.alert("Message", "Add Correct Date Format");
          this.obj.toDate = "";
        } else {
          this.http.post(url, this.obj, this.manager.getOptions()).subscribe(

            (data: any) => {
              let cri_date1 = "";
              let cri_date2 = "";
              if (this.obj.fromDate.toString() != "") {
                cri_date1 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.obj.fromDate).toString();
              }
              if (this.obj.toDate.toString() != "") {
                cri_date2 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.obj.toDate).toString();
              }
              this.criteria.fromDate = send_data1;
              this.criteria.toDate = send_data2;
              if (data.status == "SUCCESS") {
                // let data1 = data.dataList;   
                el.dismiss();
                let cri_flag = 0;
                let excel_date = "";

                let type_flag = "";
                let status_flag = "";

                let excelTitle = "Order Delivery Report";
                let excelHeaderData = [
                  "Date", "Shop_Code", "Shop_Name", "State", "Township", "UserName", "Type", "Status"
                ];

                let excelDataList: any = [];
                let workbook = new Workbook();
                let worksheet = workbook.addWorksheet('Order Delivery Data');

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

                if (this.criteria.shopcode.toString() != "") {
                  criteriaRow = worksheet.addRow(["Shop Code : " + this.criteria.shopcode.toString()]);
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
                if (this.criteria.state.toString() != "") {
                  criteriaRow = worksheet.addRow(["State : " + this.criteria.state.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                if (this.criteria.township.toString() != "") {
                  criteriaRow = worksheet.addRow(["TownShip : " + this.criteria.township.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                if (this.criteria.syskey.toString() != "") {
                  criteriaRow = worksheet.addRow([" Search by userName "]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                if (this.criteria.userName.toString() != "") {
                  criteriaRow = worksheet.addRow(["User Name : " + this.criteria.userName.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                if (this.criteria.type.toString() != "") {
                  if (this.criteria.type.toString() == "211") {
                    type_flag = "Order";
                  } else if (this.criteria.type.toString() == "421") {
                    type_flag = "Delivery";
                  }
                  criteriaRow = worksheet.addRow(["Type : " + type_flag]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }

                if (this.criteria.status.toString() != "") {
                  if (this.criteria.status.toString() == "1") {
                    status_flag = "Complete";
                  } else if (this.criteria.status.toString() == "2") {
                    status_flag = "Incomplete";
                  } else {
                    status_flag = "Both Status";
                  }
                  criteriaRow = worksheet.addRow([" Status : " + status_flag]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }

                if (cri_flag == 0) {
                  criteriaRow = worksheet.addRow(["Search With No Criteria"]);
                  criteriaRow.font = { bold: true };
                }
                let headerRow = worksheet.addRow(excelHeaderData);
                headerRow.font = { bold: true };

                for (var exCount = 0; exCount < data.dataList.length; exCount++) {

                  let excelData: any = [];
                  excel_date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data.dataList[exCount].date).toString();

                  excelData.push(excel_date);
                  excelData.push(data.dataList[exCount].shopcode);
                  excelData.push(data.dataList[exCount].shopName);
                  excelData.push(data.dataList[exCount].state);
                  excelData.push(data.dataList[exCount].township);
                  excelData.push(data.dataList[exCount].userName);
                  excelData.push(this.loop1(data.dataList[exCount].type));
                  excelData.push(this.loop(data.dataList[exCount].status));

                  excelDataList.push(excelData);
                }
                for (var i_data = 0; i_data < excelDataList.length; i_data++) {
                  worksheet.addRow(excelDataList[i_data]);
                }

                if (this.criteria.type == 211) {
                  workbook.xlsx.writeBuffer().then((data) => {
                    let blob = new Blob([data], { type: EXCEL_TYPE });
                    FileSaver.saveAs(blob, "stores purchased_" + new Date().getTime() + EXCEL_EXTENSION);
                  });
                } else {
                  workbook.xlsx.writeBuffer().then((data) => {
                    let blob = new Blob([data], { type: EXCEL_TYPE });
                    FileSaver.saveAs(blob, "Deliveries completed_" + new Date().getTime() + EXCEL_EXTENSION);
                  });
                }

              } else {
                el.dismiss();
              }
            }
          );

        }

      }
    )

  }

  dblClickFunc() {
    this.criteria.createdDate = "";
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

  getCriteriaData() {
    return {
      "select": "",
      "shopcode": "",
      "shopName": "",
      "fromDate": "",
      "toDate": "",
      "location": "",
      "userName": "",
      "syskey": "",
      "current": "",
      "maxRow": "",
      "type": "211",
      "status": "",
      "dateOptions": "0",
      "state": "",
      "township": "",
    };
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

    url = this.manager.appConfig.apiurl + 'placecode/state';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.stateList = data.dataList;
        this.stateList.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
      }
    )

    // this.shopCodeSearch.valueChanges.subscribe(
    //   term => {
    //     if (term != '') {
    //       this.manager.shopCodeSearchAutoFill(term).subscribe(
    //         data => {
    //           this.shopList2 = data as any[];

    //           console.log("code" + this.shopList2[0].shopCode);
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

  }

  stateChange() {
    let ds = this.stateList.filter(
      s => {
        return s.syskey == this.criteria.state;
      }
    );

    if (ds.length > 0) {
      this.statesyskey = ds[0].syskey;
    }

    this.getTspListForAutoComplete(this.statesyskey);
  }

  getTspListForAutoComplete(stsyskey) {
    this.criteria.township = "";

    this.tspNameSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.tspNameSearchAutoFill(stsyskey, term).subscribe(
            data => {
              this._tspList = data as any[];
              this._tspList.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
            }
          );
        }
      }
    );
  }
}