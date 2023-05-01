
import { Router, ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { MatDatepicker } from '@angular/material/datepicker';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, AlertController,ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { AppComponent } from '../app.component';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import { FormControl } from '@angular/forms';
import moment from 'moment';
import { MatOption } from '@angular/material';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
var date = new Date();
var firstDay = moment().startOf('week').toDate();
var lastDay = moment().endOf('week').toDate()
var expanded = false;
declare var $: any;
@Component({
  selector: 'app-transaction-detail-report',
  templateUrl: './transaction-detail-report.page.html',
  styleUrls: ['./transaction-detail-report.page.scss'],
})
export class TransactionDetailReportPage implements OnInit {
  @ViewChild('triggerAllUserSelectOption', { static: false }) triggerAllUserSelectOption: MatOption;
  @ViewChild('picker', { static: false }) matDatepicker: MatDatepicker<Date>;
  stockCodeSearch: FormControl = new FormControl();
  stockNameSearch: FormControl = new FormControl();
  // shopCodeSearch: FormControl = new FormControl();
  // shopNameSearch: FormControl = new FormControl();
  tspNameSearch : FormControl= new FormControl();
  config =  {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  //obj: any = this.getPersonShopObj();
  obj: any = this.getCriteriaData();
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
  shopList1: any = [];
  shopList2: any = [];
  ownerList1: any = [];
  criteria: any = this.getCriteriaData();
  stockList1: any = [];
  stockList2: any = [];
  total: any;
  pagination_flag: any = 0;
  userlist: any = [];
  username:any=[];
  value:any=[]
  stateList: any = [];
  tspList: any = [];
  staobj = this.getStateObj();
  tspobj = this.getTspObj();
  statesyskey:any;
  userType = [
    { code: 0, val: "NA" },
    { code: 1, val: "Sales rep" },
    { code: 2, val: "Deliverer" },
    { code: 3, val: "Surveyor" },
    { code: 4, val: "Store Owner" }
  ];
  flag: boolean = false;
  flag1: boolean = false;
  toppings = new FormControl();
  isUseSAP: boolean = false;
  isUseTaxPercent : boolean = false;

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

  ngOnInit() {
    this.manager.isLoginUser();
  }

  getPersonShopObj() {
    return {
      userSysKey: "",
      brandOwner: "",
      shopCode: "",
      createdDate: "",
      quantity: "",
      prices: "",
      skuCode: "",
      skuName: "",
      shopName: "",
      type: "",
      current: "",
      maxRow: "",
      shopSysKeyList: []
    }
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
  async ionViewWillEnter() {
    this.manager.isLoginUser();
    this.criteria.dateOptions = "today";
    this.dateOptionsChange();
    this.search(0);
    this.allList();
    this.getStateList();
    this.isUseSAP = this.manager.settingData.n8 == '1' ? true : false;
    this.isUseTaxPercent = this.manager.settingData.n4 == '1' ? true : false;
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
    this.criteria.dateOptions = "today";
    this.dateOptionsChange();
    this.search(0);
    $('#sta').val('');
  }

 /* userclick(index){
   
      let userInfo = {
        "userSyskey": "",
        "userName": ""
      };
      for(var loop=0;loop<this.userlist.length;loop++){
        if(this.username[loop].userSyskey==this.userlist[loop].syskey){
          this.username.splice(loop, 1);
          
        }
        else{
          userInfo.userSyskey = this.userlist[index].syskey;
          userInfo.userName = this.userlist[index].userName;
          this.username.push(userInfo);
          console.log(this.username);
          break;
        }
      }
  }

userclick(index){

for( var i=0; i<this.userlist.length ; i++){​​​​​​​

    let user = this.userlist.filter( e=> {​​​​​​​​return e.syskey == this.userlist[index].syskey}​​​​​​​​ );
     if(user.length>0){​​​​​​​
      if( user[i].userName==this.userlist[index].userName){
        this.username.push(user[i].userName);
        console.log(this.username);
      }
     
      //let username = user[0].userName;
      }​​​​​​​    
}​​​​​​​}
*/
  getUsers() {
    return new Promise(promise => {
      const url = this.manager.appConfig.apiurl + 'user/userReportList';
      const param = {
        userType: 2
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

  search(currIndex) {
    this.spinner = true;
    
    const url = this.manager.appConfig.apiurl + 'reports/deliveryReportList';
    this.obj.maxRow =this.config.itemsPerPage;
    this.obj.current = currIndex;
    this.value="";

    this.obj.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
    this.obj.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
    this.obj.skuCode = this.criteria.skuCode;
    this.obj.skuName = this.criteria.skuName;
    this.obj.shopCode = this.criteria.shopCode;
    this.obj.shopName = this.criteria.shopName;
    this.obj.brandOwner = this.criteria.brandOwner;
    this.obj.location = this.criteria.location;
    this.obj.spSKUCode = this.criteria.spSKUCode;
    this.obj.type = this.criteria.type;
    this.obj.userType = this.criteria.userType;
    this.obj.userName = this.criteria.userName;
    this.obj.township = this.criteria.township;
    this.obj.state = this.criteria.state;
   
    for(var i=0;i<this.criteria.syskey.length;i++){
        this.value+=this.criteria.syskey[i]+","; 
    }
    console.log(this.value);
    this.value=this.value.slice(0,-1);
    this.obj.syskey=this.value;
    //this.obj.syskey =  this.criteria.syskey;
    //this.obj.newdata = this.criteria.newdata;

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
          this.config.totalItems = data.rowCount ;
          //this.config.itemsPerPage= data.dataList.length;

          if (currIndex == 0) {
            this.config.currentPage = 1;
          }

          this.shopPersonList = [];
          this.shopPersonList = data.dataList;

          for (var i = 0; i < this.shopPersonList.length; i++) {
            this.shopPersonList[i].fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.shopPersonList[i].fromDate);
            // if(this.shopPersonList[i].type.toString() == "Return Product"){
            //   this.shopPersonList[i].nprice = "";
            // }
          }

          this.shopPersonList.sort((a, b) => {
            if(a.fromDate == b.fromDate){
              if(a.userName == b.userName){
                if(a.shopName == b.shopName){
                  if(a.type > b.type){
                    return 1;
                  } else {
                    return -1;
                  }
                } else if(a.shopName > b.shopName){
                  return 1;
                } else {
                  return -1;
                }
              } else if(a.userName > b.userName){
                return 1;
              } else {
                return -1;
              }
            } else if(a.fromDate > b.fromDate){
              return 1;
            } else {
              return -1;
            }
          });

        },
        error => {
          this.spinner = false;
        }
      );
    }
  }




  pageChanged(e){
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
        // const url = this.manager.appConfig.apiurl + 'reports/deliveryExcelReport';
        const url = this.manager.appConfig.apiurl + 'reports/transactionDetailExcelReport';
        this.value="";
        let send_data1 = this.criteria.fromDate;
        let send_data2 = this.criteria.toDate;
        for(var i=0;i<this.criteria.syskey.length;i++){
          this.value+=this.criteria.syskey[i]+",";
        
      }
        this.value=this.value.slice(0,-1);
        this.obj.syskey=this.value;
        if (this.criteria.fromDate.toString() != "") {
          this.obj.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
        }
        if (this.criteria.toDate.toString() != "") {
          this.obj.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
        }
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
              if (data.message == "SUCCESS") {
                // let data1 = data.dataList;   
                el.dismiss();
                let cri_flag = 0;
                let excel_date = "";

                let type_flag = "";

                let excelTitle = "Delivery Detail Report";
                // let excelHeaderData = [
                //   "Date", "Transaction Time", "Transaction ID","State","Township","User Name", "Order By", "BrandOwner Name", "Brand Shop Code", "Shop Code","Shop Name",
                //    "Invoice Number","Brand SKU Code","AB SKU Code","SKU Name","Order Qty","Returnable Packaging QTY","Return Qty","Standard Price", "Selling Price", "Dis Amount","Discount Percent",
                //    "Total Discount Amount","Effected Price","Inkind", "Gift Qty", "Gift Type", 
                //    "Order Amount","Return Amount","Shop Zone","Shop GeoLoc","Shop Pluscode",
                //    "Invoice Dis Percentage", "Invoice Discount Amt", "Sub Total After All Discount"
                // ];
                let excelHeaderData = [
                  "Date", "Transaction Time", "Transaction ID","State","Township","User Name", "Order by", "BrandOwner Name", "Brand Shop Code", "Shop Code","Shop Name",
                   "Invoice Number","Brand SKU Code","Stock Code","Stock Name","OrderQty","Returnable Packaging QTY","Return Qty","Standard Price", "Selling Price", "Dis Amount","Discount Percent",
                   "Dis_Total_Amount","Effected Price","Inkind", "Gift Qty", "Gift Type", 
                   "Order Amount","Return Amount","Shop Zone","Shop GeoLoc","Shop Pluscode", "Other Discount",
                   "Percentage", "Dis Amt", "Sub Total After All Discount"
                ];
                if(this.isUseTaxPercent){
                  excelHeaderData.push("Tax Amount");
                }
                if(this.isUseSAP){
                  excelHeaderData.push("Sales Type");
                }
                let excelTotalData = [
                  "orderTotalAmt",
                  "returnTotalAmt",
                  "specialDiscount",
                  "invoiceTotalAmt",
                  "totalAmt",
                  "boPayAmt",
                  "auderboxPayAmt",
                  "cashAmt",
                  "creditAmt"
                ];


 
                //let cashReceive : any = [];
                let excelDataList: any = [];
                let giftList : any = [];
                let workbook = new Workbook();
                let worksheet = workbook.addWorksheet('Delivery Detail Data');

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
                  criteriaRow = worksheet.addRow(["Brand Owner : " + data.dataList[0].detailList[0].brandOwner.toString()]);
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
                  criteriaRow = worksheet.addRow(["Stock Name : " + this.criteria.township.toString()]);
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
                let headerRow = worksheet.addRow(excelHeaderData);
                headerRow.font = { bold: true };

                for (var exCount = 0; exCount < data.dataList.length; exCount++) {
                  excelDataList = [];
                  giftList = [];
                  let hashmapData = data.dataList[exCount];
                  // let detail = hashmapData.detailList;
                  let detail = hashmapData.detailList.map(u => {
                    u.userType = this.manager.getUserTypeDesc(u.userType);
                    return u;
                  });
                  let total = hashmapData.totalList;
                  let cashReceive = hashmapData.cashReceive;
                 
                  

                 // let invoiceGift = hashmapData.ivGift;
                  let totalData = {
                    "orderTotalAmt": "",
                    "returnTotalAmt": "",
                    "specialDiscount": "",
                    "totalAmt": ""
                  };

                  for (var exCount1 = 0; exCount1 < detail.length; exCount1++) {
                    let excelData: any = [];
                    excel_date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, detail[exCount1].fromDate).toString();

                    if(detail[exCount1].createdTime.length >= 6) {
                      detail[exCount1].createdTime = detail[exCount1].createdTime.slice(-6);
                      detail[exCount1].createdTime = detail[exCount1].createdTime.slice(0,2) + ":"+ detail[exCount1].createdTime.slice(2,4)+":"+ detail[exCount1].createdTime.slice(4);
                    }

                    excelData.push(excel_date);
                    excelData.push(detail[exCount1].createdTime);
                    excelData.push(detail[exCount1].transactionID);
                    excelData.push(detail[exCount1].state);
                    excelData.push(detail[exCount1].township);
                    excelData.push(detail[exCount1].userName);
                    excelData.push(detail[exCount1].order);
                    excelData.push(detail[exCount1].brandOwner);
                    excelData.push(detail[exCount1].spShopCode);
                    excelData.push(detail[exCount1].shopCode);
                    excelData.push(detail[exCount1].shopName);
                    excelData.push(detail[exCount1].orderNumber);
                    excelData.push(detail[exCount1].spSKUCode);
                    excelData.push(detail[exCount1].skuCode);
                    excelData.push(detail[exCount1].skuName);
                    excelData.push(detail[exCount1].reportQTY);
                    excelData.push(detail[exCount1].emptyBotQTY);
                    excelData.push(detail[exCount1].returnQTY);
                    // if(detail[exCount1].type.toString() == "Return Product"){
                    //   detail[exCount1].nprice = "";
                    // }
                    excelData.push(detail[exCount1].nprice);
                    excelData.push(detail[exCount1].prices);
                    excelData.push(detail[exCount1].disamt);
                    excelData.push(detail[exCount1].dispercent);
                    excelData.push(detail[exCount1].reportQTY * detail[exCount1].disamt);
                    excelData.push(detail[exCount1].prices);
                    excelData.push(detail[exCount1].inkind);
                    excelData.push(detail[exCount1].giftquantity)
                    excelData.push(detail[exCount1].saveStatus);
                    excelData.push(detail[exCount1].reportQTY * detail[exCount1].prices);
                    excelData.push(detail[exCount1].returnQTY * detail[exCount1].prices);
                    excelData.push(detail[exCount1].township);
                    excelData.push(detail[exCount1].latitude+","+detail[exCount1].longitude);
                    excelData.push(detail[exCount1].pluscode);
                    excelData.push(detail[exCount1].specialDiscount);
                    excelData.push(detail[exCount1].invDisPercent + '%');
                    console.log("detail[exCount1].invDisPercent => " , detail[exCount1].invDisPercent);
                    excelData.push(detail[exCount1].invDisAmount); // Dis Amount
                    // excelData.push(((detail[exCount1].reportQTY * detail[exCount1].prices)- detail[exCount1].specialDiscount) *((detail[exCount1].invDisPercent)/ 100) );
                    // excelData.push(detail[exCount1].specialDiscount);
                    excelData.push(detail[exCount1].invAftDisAmount); // Sub Total
                    // excelData.push((detail[exCount1].reportQTY * detail[exCount1].prices) -(detail[exCount1].specialDiscount) - (((detail[exCount1].reportQTY * detail[exCount1].prices)- detail[exCount1].specialDiscount) *((detail[exCount1].invDisPercent)/ 100)));

                  //  excelData.push(detail[exCount1].shopCode);
                    // excelData.push(detail[exCount1].userType);
                    // excelData.push(detail[exCount1].location);
                    // excelData.push(detail[exCount1].skuCode);
                    // excelData.push(data1[exCount].quantity);
                    // excelData.push(detail[exCount1].subTotal);
                    // excelData.push(detail[exCount1].type);
                    // excelData.push(detail[exCount1].giftquantity);
                    // excelData.push(detail[exCount1].saveStatus);
                    if(this.isUseTaxPercent){
                      excelData.push(detail[exCount1].taxAmount);
                    }
                    if(this.isUseSAP){
                      excelData.push(detail[exCount1].salesTypeDesc);
                    }
                    excelDataList.push(excelData);
                  }
                  for (var i_data = 0; i_data < excelDataList.length; i_data++) {
                    worksheet.addRow(excelDataList[i_data]);
                  }
                  
                  // for(var i=0;i<giftList.length;i++)
                  // {
                  //    worksheet.addRow(giftList[i]);
                  // }

                  // let d1 = worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName, detail[0].userType, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, detail[0].shopName, "", "", "", "", "", "", "", "", "", "Order Total Amount" , total.orderTotalAmt]);
                  
                  // let d2 = worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName, detail[0].userType, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, detail[0].shopName, "", "", "", "", "", "", "", "", "", "Return Total Amount" , total.returnTotalAmt]);

                  // let d3 = worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName, detail[0].userType, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, detail[0].shopName, "", "", "", "", "", "", "", "", "", "Special Discount", total.specialDiscount]);
                  // let d4 = worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName, detail[0].userType, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, detail[0].shopName, "", "", "", "", "", "", "", "", "", "Invoice Discount(" + total.order_disc + "%)", total.invoiceDiscount]);
                  // //let d11 = worksheet.addRow(giftRow);

                  // let d5 = worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName, detail[0].userType, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, detail[0].shopName, "", "", "", "", "", "", "", "", "", "Total Amount", total.totalAmt]);
                  // let d6 = worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName, detail[0].userType, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, detail[0].shopName, "", "", "", "", "", "", "", "", "", "Brandowner Payment", total.boPayment]);
                  // let d7 = worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName, detail[0].userType, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, detail[0].shopName, "", "", "", "", "", "", "", "", "", "Auderbox Payment", total.auderboxPayment]);
                  // let d8 = worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName, detail[0].userType, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, detail[0].shopName, "", "", "", "", "", "", "", "", "", "Cash Amount", total.cashAmount]);
                  // let d9 = worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName, detail[0].userType, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, detail[0].shopName, "", "", "", "", "", "", "", "", "", "Credit Amount", total.creditAmount]);
                  // let d10 = worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName, detail[0].userType, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, detail[0].shopName, "", "", "", "", "", "", "", "", "", "Additional Cash Payment",cashReceive.cashReceive == null ? "                  0" : cashReceive.cashReceive]);

                  // d1.getCell(18).font = { bold: true };
                  // d2.getCell(18).font = { bold: true };
                  // d3.getCell(18).font = { bold: true };
                  // d4.getCell(18).font = { bold: true };
                  // d5.getCell(18).font = { bold: true };
                  // d6.getCell(18).font = { bold: true };
                  // d7.getCell(18).font = { bold: true };
                  // d8.getCell(18).font = { bold: true };
                  // d9.getCell(18).font = { bold: true };
                  // d10.getCell(18).font = { bold: true };
                 // d11.getCell(13).font = { bold : true }; d11.getCell(15).font = { bold : true };
                 // d11.getCell(17).font = { bold : true };
                  //worksheet.addRow([]);
                  //  d1.getCell('Order Total Amount(90%)').font={'bold':true};
                  // d1.getCell('total.orderTotalAmt').font={'bold':true};
                  // worksheet.getColumn('Order Total Amount(90%)').font ={'bold':true};

                }
                workbook.xlsx.writeBuffer().then((data) => {
                  let blob = new Blob([data], { type: EXCEL_TYPE });
                  FileSaver.saveAs(blob, "DDetailO_export_" + new Date().getTime() + EXCEL_EXTENSION);
                });
              } else {
                el.dismiss();
              }
            }
          );

        }

      }
    )

  }

  // private saveAsExcelFile(buffer: any, fileName: string): void {
  //   const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
  //   FileSaver.saveAs(data, fileName + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
  // }

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
      "dateOptions": "0",
      "userType": 0,
      "userName": "",
      "syskey":"",
      "giftquantity":"0",
      "township":""
    };
  }

  allList(){
    var url = "";
    var param = {};
    
   param = {
      "code" : "",
      "description" : ""
    };
    url = this.manager.appConfig.apiurl + 'brandowner/getbrandowner';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any)  => {
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
             
    //           console.log("code"+this.shopList2[0].shopCode);
    //         //  this.stockList2 = data as any[];
    //       });
    //     }
    //   }
    // );

    // this.shopNameSearch.valueChanges.subscribe(
    //   term => {
    //     if (term != '') {
    //       this.manager.shopNameSearchAutoFill(term).subscribe(
    //         data => {
    //           this.shopList1 = data as any[];
             
    //         //  this.stockList2 = data as any[];
    //       });
    //     }
    //   }
    // );
    this.stockCodeSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.stockCodeSearchAutoFill(term).subscribe(
            data => {
              this.stockList2 = data as any[];
             
              console.log("code"+this.stockList2[0].skuCode);
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
  }
  getStateList() {
 
    let status = "";
    const url = this.manager.appConfig.apiurl + 'placecode/state';
    var param = {
      code: "",
      description: ""
    }
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
  stateChange(){
    let ds = this.stateList.filter(s=>{
          return s.syskey==this.staobj.syskey;
        });
        if(ds.length>0) this.statesyskey=ds[0].syskey;
        // this.getTspListForAutoComplete(this.statesyskey);
        this.tspNameSearch.setValue("");
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
  toggleUserAllSelect() {
    if (this.triggerAllUserSelectOption.selected) {
      this.criteria.syskey = [];
      this.criteria.syskey.push(-1);
      for (let u of this.userlist) {
        this.criteria.syskey.push(u.syskey)
      }
    } else {
      this.criteria.syskey = [];
    }
  }
}
