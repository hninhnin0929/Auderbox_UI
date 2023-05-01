import { Router, NavigationExtras,ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { MatDatepicker } from '@angular/material/datepicker';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { IonContent, AlertController, NavController, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { AppComponent } from '../app.component';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { FormControl } from '@angular/forms';
import { MatOption } from '@angular/material';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import moment from 'moment';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';


declare var $: any;
var date = new Date();
var sop13 =5;
var pages= 0;
@Component({
  selector: 'app-order-report-by-summary',
  templateUrl: './order-report-by-summary.page.html',
  styleUrls: ['./order-report-by-summary.page.scss'],
})

export class OrderReportBySummaryPage implements OnInit {
  tspNameSearch : FormControl= new FormControl();
  @ViewChild('picker', { static: false }) matDatepicker: MatDatepicker<Date>;
  @ViewChild('triggerAllUserSelectOption', { static: false }) triggerAllUserSelectOption: MatOption;

  config =  {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };

  obj : any = this.getPersonShopObj();
  TypeList : any =[];
  shopList : any =[];
  shopSysKeyList:any=[];
  shopPersonList : any =[];
  personList : any =[];
  load:boolean = false;

  spinner: boolean = false;
  searchtab: boolean = false;
  shopList1: any = [];
  shopList2: any = [];
  ownerList1: any = [];
  criteria: any = this.getCriteriaData();
  // stockList1: any = [];
  // stockList2: any = [];
  shoplist1: any = [];
  shoplist2: any = [];
  userList1: any = [];
  stateList: any = [];
  tspList: any = [];
  staobj = this.getStateObj();
  tspobj = this.getTspObj();
  statesyskey:any;
  stockCodeSearch : FormControl = new FormControl();
  stockNameSearch : FormControl = new FormControl();
  // shopCodeSearch : FormControl = new FormControl();
  // shopNameSearch : FormControl = new FormControl();
  toppings = new FormControl();
  
  fromDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  toDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  value:any;
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

  define = [{  }]

  ngOnInit() {
    this.manager.isLoginUser();
  }

  
  ionViewWillEnter() {
    this.manager.isLoginUser();
    this.getAll();
    this.getDataListForAutoComplete();
    this.getStateList();
    this.getUsers();
    this.isUseSAP = this.manager.settingData.n8 == '1' ? true : false;
  }

  ionViewDidEnter(){
    this.load = true;
  }

  new(){
    this.router.navigate(['/personshop-new']);
  }

  runSpinner(t: boolean) {
    this.spinner = t;
  }

  advanceSearch(option) {
    this.searchtab = option;
  }
  advanceSearchReset() {
    this.criteria = this.getCriteriaData();
    this.getAll();
    $('#sta').val('');
  }

  getAll(){
    this.loading.create({
      message: 'Please wait...',
      backdropDismiss: false
    }).then(loadCtrl => {
      loadCtrl.present();
      const url =this.manager.appConfig.apiurl +'reports/orderReportSummaryList';
  
      this.criteria.fromDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      this.criteria.toDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      //this.criteria.maxRow = "20";
      //this.criteria.currentNew = "0";
  
      let param = {
        fromDate: this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, new Date(date.getFullYear(), date.getMonth(), date.getDate())).toString(),
        toDate : this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, new Date(date.getFullYear(), date.getMonth(), date.getDate())).toString(),
        // maxRow : 
        // "20",
        // currentNew : "0"
        maxRow : this.config.itemsPerPage,
        current : 0
      }
  
  
      this.http.post(url,param,this.manager.getOptions()).subscribe(
        (data:any) =>{
      
            this.config.currentPage = 1;
            // this.config.totalItems = (data.rowCount / sop13) * data.dataList.length;
            // this.config.itemsPerPage= data.dataList.length;
            this.config.totalItems = data.rowCount;
            console.log("total item=" +this.config.totalItems);

  
            this.shopPersonList = [];
            this.shopPersonList = data.dataList;
  
            for(var i = 0; i < this.shopPersonList.length; i++){
              this.shopPersonList[i].fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.shopPersonList[i].fromDate);
            }
  
            this.obj.createdDate = "";
            loadCtrl.dismiss();
          
        },
        (error)=>{
          loadCtrl.dismiss();
          console.log(error)
        }
      );
    })
  }
    
  search(currIndex){
    this.loading.create({
      message: 'Please wait...',
      backdropDismiss: false
    }).then(loadCtrl => {
      loadCtrl.present();
      let param = this.getCriteriaData()
      param.maxRow = this.config.itemsPerPage;
      param.current = currIndex;
      param.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate).toString();
      param.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate).toString();
      param.skuCode = this.criteria.skuCode;
      param.skuName = this.criteria.skuCode;
  
      param.shopCode= this.criteria.shopCode;
      param.shopName= this.criteria.shopName;
      param.brandOwner = this.criteria.brandOwner;
      
      param.location= this.criteria.location;
      param.spSKUCode= this.criteria.spSKUCode;
      param.type= this.criteria.type;
      param.userName = this.criteria.userName;
      param.township = this.criteria.township;
      param.state = this.criteria.state;
      this.value="";
  
      const url =this.manager.appConfig.apiurl +'reports/orderReportSummaryList';
      for(var i=0;i<this.criteria.syskey.length;i++){
        this.value+=this.criteria.syskey[i]+","; 
    }
    console.log(this.value);
    this.value=this.value.slice(0,-1);
    param.syskey=this.value;
      
      if(param.fromDate.toString() == "false" || param.toDate.toString() == "false"){
        this.alert("Message", "Add Correct Date Format");
        this.criteria.fromDate = "";
        this.criteria.toDate = "";
      } else {
        this.http.post(url, param, this.manager.getOptions()).subscribe(
          (data:any) =>{
            // this.config.totalItems = (data.rowCount / sop13) * data.dataList.length;
            this.config.totalItems = data.rowCount;
            console.log("total item=" +this.config.totalItems);
            if (currIndex == 0) {
              this.config.currentPage = 1;
            }
              this.shopPersonList = [];          
              this.shopPersonList = data.dataList;
      
              for(var i = 0; i < this.shopPersonList.length; i++){
                this.shopPersonList[i].fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.shopPersonList[i].fromDate);
              }
              loadCtrl.dismiss();
            }, error => {
              console.log(error);
              loadCtrl.dismiss();
            }
            
        );
      }
    }
    );

  }

  print(){
    this.loading.create({
      message: "Processing..",
      backdropDismiss: false
    }).then(
      el => {
        el.present();
        let param = this.getCriteriaData()
        const url = this.manager.appConfig.apiurl + 'reports/orderSummaryExcelReport';
        param.maxRow = 0;
        param.current = "";
        param.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate).toString();
        param.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate).toString();
        param.skuCode = this.criteria.skuCode;
        param.skuName = this.criteria.skuCode;
    
        param.shopCode= this.criteria.shopCode;
        param.shopName= this.criteria.shopName;
        param.brandOwner = this.criteria.brandOwner;
        
        param.location= this.criteria.location;
        param.spSKUCode= this.criteria.spSKUCode;
        param.type= this.criteria.type;
        param.userName = this.criteria.userName;
        param.township = this.criteria.township;
        param.state = this.criteria.state;
        this.value="";
        for(var i=0;i<this.criteria.syskey.length;i++){
          this.value+=this.criteria.syskey[i]+","; 
        }
        this.value=this.value.slice(0,-1);
        param.syskey=this.value;

        this.http.post(url, param, this.manager.getOptions()).subscribe(
          (data:any)  => {
            el.dismiss();
            let cri_date = "";
            let cri_to_date = "";
            if(this.criteria.fromDate.toString() != ""){
              cri_date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI, this.criteria.fromDate).toString();
            }
            if(this.criteria.toDate.toString() != ""){
              cri_to_date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI, this.criteria.toDate).toString();
            }
          
            // if(data.message == "SUCCESS"){
            //   let exampleDataList: any = [];
            //   let data1 = data.dataList;
              
            //   for(var exCount = 0; exCount < data1.length; exCount++){
            //     let exampleData = {
            //       "Date": "", "Owner_Name": "",
            //       "Shop_Code": "", "Shop_Name": "",
            //       "Address": "", "SP_SKU_Code": "",
            //       "Stock_Code": "", "Stock_Name": "",
            //       "Qty": "", "Price": "", "Sub_Total": ""
            //     };

            //     exampleData.Date = data1[exCount].createdDate;
            //     exampleData.Owner_Name = data1[exCount].brandOwner;
            //     exampleData.Shop_Code = data1[exCount].shopCode;
            //     exampleData.Shop_Name = data1[exCount].shopName;
            //     exampleData.Address = data1[exCount].location;
            //     exampleData.SP_SKU_Code = data1[exCount].spSKUCode;
            //     exampleData.Stock_Code = data1[exCount].skuCode;
            //     exampleData.Stock_Name = data1[exCount].skuName;
            //     exampleData.Qty = data1[exCount].quantity;
            //     exampleData.Price = data1[exCount].prices;
            //     exampleData.Sub_Total = data1[exCount].subTotal;
                
            //     exampleDataList.push(exampleData);
            //   }

            //   const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exampleDataList);
            //   const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
            //   const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            //   this.saveAsExcelFile(excelBuffer, "DO");
            // }

            if(data.message == "SUCCESS"){
              // let data1 = data.dataList;            
              let cri_flag = 0;
              let excel_date = "";
              let type_flag = "";

              let excelTitle = "Order Report";
              let excelHeaderData = [
                "Date", "Transaction ID","State","TownShip","User Name","Order By", "Brand Owner", "Brand Shop Code", "Shop Code", "Shop Name",
                "Address", "Order Number", "Brand SKU Code", "Stock Code", "Stock Name",
                "OrderQTY", "ReturnQTY","Standard Price", "Selling Price", "Dis Amt","Percentage", "Sub Total(100%)", "Type","Gift QTY","Gift Type"
              ];
              if(this.isUseSAP){
                excelHeaderData.push("Sales Type");
              }
              let excelTotalData = [
                "orderTotalAmt",
                "returnTotalAmt",
                "specialDiscount",
                "totalAmt"
              ];
              let excelDataList: any = [];

              let workbook = new Workbook();
              let worksheet = workbook.addWorksheet('Order Summary Data');

              let titleRow = worksheet.addRow(["","",excelTitle]);
              titleRow.font = {bold: true};
              worksheet.addRow([]);

              let criteriaRow;
              if(cri_date.toString() != "" && cri_to_date.toString() != ""){
                criteriaRow = worksheet.addRow(["From Date : " + cri_date.toString()]);
                criteriaRow.font = {bold: true};
                cri_flag++;
              }
              if(cri_to_date.toString() != ""){
                criteriaRow = worksheet.addRow(["To Date : " + cri_to_date.toString()]);
                criteriaRow.font = {bold: true};
                cri_flag++;
              }
              if(this.criteria.brandOwner.toString() != ""){
                if(data.dataList.length){
                  criteriaRow = worksheet.addRow(["Brand Owner : " + data.dataList[0].detailList[0].brandOwner.toString()]);
                }else{
                  criteriaRow = worksheet.addRow(["Brand Owner : " + '']);
                }
                criteriaRow.font = {bold: true};
                cri_flag++;
              }
              if(this.criteria.shopCode.toString() != ""){
                criteriaRow = worksheet.addRow(["Shop Code : " + this.criteria.shopCode.toString()]);
                criteriaRow.font = {bold: true};
                cri_flag++;
              }
              if(this.criteria.shopName.toString() != ""){
                criteriaRow = worksheet.addRow(["Shop Name : " + this.criteria.shopName.toString()]);
                criteriaRow.font = {bold: true};
                cri_flag++;
              }
              if(this.criteria.userName.toString() != ""){
                criteriaRow = worksheet.addRow(["User Name : " + data.dataList[0].detailList[0].userName.toString()]);
                criteriaRow.font = {bold: true};
                cri_flag++;
              }
              if(this.criteria.township.toString() != ""){
                criteriaRow = worksheet.addRow(["Township Name  : " + data.dataList[0].detailList[0].township.toString()]);
                criteriaRow.font = {bold: true};
                cri_flag++;
              }
              /*
              if(this.criteria.location.toString() != ""){
                criteriaRow = worksheet.addRow(["Address : " + this.criteria.location.toString()]);
                criteriaRow.font = {bold: true};
                cri_flag++;
              }
              if(this.criteria.spSKUCode.toString() != ""){
                criteriaRow = worksheet.addRow(["SP SKU Code : " + this.criteria.spSKUCode.toString()]);
                criteriaRow.font = {bold: true};
                cri_flag++;
              }
              if(this.criteria.skuCode.toString() != ""){
                criteriaRow = worksheet.addRow(["Stock Code : " + this.criteria.skuCode.toString()]);
                criteriaRow.font = {bold: true};
                cri_flag++;
              }
              if(this.criteria.skuName.toString() != ""){
                criteriaRow = worksheet.addRow(["Stock Name : " + this.criteria.skuName.toString()]);
                criteriaRow.font = {bold: true};
                cri_flag++;
              }
              if(this.criteria.type.toString() != ""){
                if(this.criteria.type.toString() == "1"){
                  type_flag = "Order Product";
                } else if(this.criteria.type.toString() == "2"){
                  type_flag = "Return Product";
                }
                criteriaRow = worksheet.addRow(["Type : " + type_flag]);
                criteriaRow.font = {bold: true};
                cri_flag++;
              }
              */

              if(cri_flag == 0){
                criteriaRow = worksheet.addRow(["Search With No Criteria"]);
                criteriaRow.font = {bold: true};
              }
              worksheet.addRow([]);

              let headerRow = worksheet.addRow(excelHeaderData);
              headerRow.font = {bold: true};
              
              for(var exCount = 0; exCount < data.dataList.length; exCount++){
                excelDataList = [];
                let hashmapData = data.dataList[exCount];
                let detail = hashmapData.detailList;
                let total = hashmapData.totalList;
                // let gift =hashmapData.ivGift;
                // let totalData = {
                //   "orderTotalAmt": "",
                //   "returnTotalAmt": "",
                //   "specialDiscount": "",
                //   "totalAmt": ""
                // };

                for(var exCount1 = 0; exCount1 < detail.length; exCount1++){
                  let excelData: any = [];
                  excel_date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, detail[exCount1].fromDate).toString();

                  excelData.push(excel_date);
                  excelData.push(detail[exCount1].transactionID);
                  //excelData.push(detail[exCount1].transaction);
                  excelData.push(detail[exCount1].state);
                  excelData.push(detail[exCount1].township);
                  excelData.push(detail[exCount1].userName);
                  excelData.push(detail[exCount1].order);
                  excelData.push(detail[exCount1].brandOwner);
                  excelData.push(detail[exCount1].spShopCode);
                  excelData.push(detail[exCount1].shopCode);
                  excelData.push(detail[exCount1].shopName);
                  excelData.push(detail[exCount1].location);
                  excelData.push(detail[exCount1].orderNumber);
                  excelData.push(detail[exCount1].spSKUCode);
                  excelData.push(detail[exCount1].skuCode);
                  excelData.push(detail[exCount1].skuName);
                  // excelData.push(data1[exCount].quantity);
                  excelData.push(detail[exCount1].reportQTY);
                  excelData.push(detail[exCount1].returnQTY);
                  excelData.push(detail[exCount1].nprice);
                  excelData.push(detail[exCount1].prices);
                  excelData.push(detail[exCount1].disamt);
                  excelData.push(detail[exCount1].dispercent);

                  excelData.push(detail[exCount1].subTotal);
                  excelData.push(detail[exCount1].type);
                  excelData.push(detail[exCount1].giftquantity);
                  excelData.push(detail[exCount1].saveStatus);
                  if(this.isUseSAP){
                    excelData.push(detail[exCount1].salesTypeDesc);
                  }

                  excelDataList.push(excelData);
                }

                let excelExportTempDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, detail[0].fromDate).toString();
              
                
                // totalData.orderTotalAmt = total.orderTotalAmt;
                // totalData.returnTotalAmt = total.returnTotalAmt;
                // totalData.specialDiscount = total.specialDiscount;
                // totalData.totalAmt = total.totalAmt;

                // excelTotalList.push(totalData);

                for(var i_data = 0; i_data < excelDataList.length; i_data++){
                  worksheet.addRow(excelDataList[i_data]);
                }           
                // for(var i=0; i<gift.length;i++){
                //   let d5 = worksheet.addRow(
                //     [
                //       excelExportTempDate, detail[0].transactionID, detail[0].userName, 
                //       detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, 
                //       detail[0].shopName, detail[0].location, "", 
                //       gift[i].ivGiftCode, gift[i].ivGift, "", "", ""," ", " ",gift[i].qty,"Invoice Gift"
                //     ]
                //   );
                  
                // }
                
                let d1 = worksheet.addRow(
                  [
                    excelExportTempDate, detail[0].transactionID,detail[0].state,detail[0].township,detail[0].userName, 
                    detail[0].order, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, 
                    detail[0].shopName, detail[0].location, "", 
                    "", "", "Order Total Amount ", total.orderTotalAmt
                  ]
                );
                let d2 = worksheet.addRow(
                  [
                    excelExportTempDate, detail[0].transactionID,detail[0].state,detail[0].township,detail[0].userName, 
                    detail[0].order, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, 
                    detail[0].shopName, detail[0].location, "", 
                    "", "", "Return Total Amount", total.returnTotalAmt
                  ]
                );
                let d3 = worksheet.addRow(
                  [
                    excelExportTempDate, detail[0].transactionID,detail[0].state,detail[0].township,detail[0].userName, 
                    detail[0].order, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, 
                    detail[0].shopName, detail[0].location, "", 
                    "", "", "Invoice Discount Amount("+total.orderPercent+"%)", total.InvoiceDiscountAmt
                  ]
                );
                // let d3 = worksheet.addRow(["", "", "", "","","","","","","","", "Special Discount", total.specialDiscount]);
                let d4 = worksheet.addRow(
                  [
                    excelExportTempDate, detail[0].transactionID,detail[0].state,detail[0].township,detail[0].userName, 
                    detail[0].order, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, 
                    detail[0].shopName,  detail[0].location, "", 
                    "", "", "Total Amount", total.totalAmt
                  ]
                );
                
                d1.font = {bold: true};
                d2.font = {bold: true};
                d3.font = {bold: true};
                d4.font = {bold: true};
              
                // worksheet.addRow([]);
              }

              workbook.xlsx.writeBuffer().then((data) => {
                let blob = new Blob([data], {type: EXCEL_TYPE});
                FileSaver.saveAs(blob, "SO_export_" + new  Date().getTime() + EXCEL_EXTENSION);
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

  dateChange1(event){
    if(this.criteria.toDate != ""){
      let tempFromDate = new Date(event.target.value);
      let tempToDate = new Date(this.criteria.toDate);

      if (+tempFromDate > +tempToDate) {
        this.manager.showToast(this.tostCtrl, "Message", "From Date must be sooner than To Date", 5000);
        this.criteria.fromDate = "";
        this.criteria.toDate = "";
      }
    }
  }

  dateChange2(event){
    if(this.criteria.fromDate == ""){
      this.criteria.toDate = "";
      $("#date2").val("").trigger("change");
      this.manager.showToast(this.tostCtrl, "Message", "Add From Date First", 2000);
    } else {
      let tempFromDate = new Date(this.criteria.fromDate);
      let tempToDate = new Date(event.target.value);

      if (+tempFromDate > +tempToDate) {
        this.criteria.toDate = "";
        $("#date2").val("").trigger("change");
        this.manager.showToast(this.tostCtrl, "Message", "To Date must be later than From Date", 5000);
      }
    }
  }

  dblClickFunc1(){
    this.criteria.fromDate = "";
    this.criteria.toDate = "";
  }

  dblClickFunc2(){
    this.criteria.toDate = "";
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

  getCriteriaData(){
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
      "maxRow": 0,
      "userName": "",
      "township":"",
      "syskey":"",
      "state": ""
    };
  }
  getPersonShopObj(){
    return {
      userSysKey:"",
      brandOwner:"",
      shopCode:"",
      createdDate:"",
      quantity:"",
      prices:"",
      skuCode:"",
      skuName:"",
      shopName:"",
      type:"",
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
  /*
  allList(){
    var url = "";
    var param = {};
    
    param = {
      "shopSyskey" : "",
      "shopCode" : "",
      "shopName" : "",
      "phno" : "",
      "email" : "",
      "personName" : "",
      "address" : "",
    }
    url = this.manager.appConfig.apiurl + 'shop/shoplist';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any)  => {
        this.shopList1 = data;
        this.shopList2 = data;
        this.shopList1.sort((a, b) => (a.shopCode.toLowerCase() > b.shopCode.toLowerCase()) ? 1 : -1);
        this.shopList2.sort((a, b) => (a.shopName.toLowerCase() > b.shopName.toLowerCase()) ? 1 : -1);
      }
    );

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

    param = {
      "code": "",
      "description": "",
      "categorySyskey": ""
    };
    url = this.manager.appConfig.apiurl + 'StockSetup/allStockList';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.stockList1 = data.dataList;
        this.stockList2 = data.dataList;
        this.stockList1.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
        this.stockList2.sort((a, b) => (a.t3.toLowerCase() > b.t3.toLowerCase()) ? 1 : -1);
      }
    );
  }
  */

  getDataListForAutoComplete(){
    // this.shopCodeSearch.valueChanges.subscribe(
    //   term => {
    //     if (term != '') {
    //       this.manager.shopCodeSearchAutoFill(term).subscribe(
    //         data => {
    //           this.shoplist1 = data as any[];
    //         }
    //       );
    //     }
    //   }
    // );

    // this.shopNameSearch.valueChanges.subscribe(
    //   term => {
    //     if (term != '') {
    //       this.manager.shopNameSearchAutoFill(term).subscribe(
    //         data => {
    //           this.shoplist2 = data as any[];
    //         }
    //       );
    //     }
    //   }
    // );

    let param = {};
    let url = "";

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

    // param = {
    //   "searchVal" : ""
    // };
    // url = this.manager.appConfig.apiurl + 'user/userList';
    // this.http.post(url, param, this.manager.getOptions()).subscribe(
    //   (data:any)  => {
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

  pageChanged(e) {
    this.config.currentPage = e;
    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.search(currentIndex);
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
      for (let u of this.userList1) {
        this.criteria.syskey.push(u.syskey)
      }
    } else {
      this.criteria.syskey = [];
    }
  }
}
