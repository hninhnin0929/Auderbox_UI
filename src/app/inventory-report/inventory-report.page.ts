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

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import { FormControl } from '@angular/forms';
import moment from 'moment';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $: any;
// var firstDay = moment().startOf('week').toDate();
// var lastDay = moment().endOf('week').toDate()
@Component({
  selector: 'app-inventory-report',
  templateUrl: './inventory-report.page.html',
  styleUrls: ['./inventory-report.page.scss'],
})

export class InventoryReportPage implements OnInit {

  @ViewChild('picker', { static: false }) matDatepicker: MatDatepicker<Date>;
  stockCodeSearch : FormControl= new FormControl();
  stockNameSearch : FormControl = new FormControl();
  config =  {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  obj : any = this.getPersonShopObj();
  TypeList : any =[];
  shopList : any =[];
  shopSysKeyList:any=[];
  inventoryList : any =[];
  personList : any =[];
  load:boolean = false;
  spinner: boolean = false;
  searchtab: boolean = false;
  shopList1: any = [];
  shopList2: any = [];
  ownerList1: any = [];
  criteria: any = this.getCriteriaData();
  stockList1: any = [];
  stockList2: any = [];
  userList: any = [];
  constructor(
    public manager: ControllerService,
    public http: HttpClient,
    public router: Router,
    public alertController: AlertController,
    public event: Events,
    public app: AppComponent,
    public tostCtrl: ToastController,
    public activatedRoute: ActivatedRoute,
    public loading : LoadingController
  ) {
    this.manager.isLoginUser();
  }

  define = [{  }]

  ngOnInit() {
    this.manager.isLoginUser();
  }

  getPersonShopObj(){
    return {
      userSysKey:"",
      brandOwner:"",
      shopCode:"",
      date:"",
      quantity:"",
      expiredQuantity:"",
      skuCode:"",
      skuName:"",
      shopName:"",
      type:"",
      shopSysKeyList: [],
      maxRow:"",
      current:"",
      fromDate:"",
      toDate:""

    }
  }

  ionViewWillEnter() {
    this.manager.isLoginUser();
    this.criteria.dateOptions = "today";
    this.dateOptionsChange();
    this.getAll();
    this.allList();
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
    this.criteria.dateOptions = "today";
    this.dateOptionsChange();
    this.config.currentPage = 0;
    this.getAll();
  }

  dateOptionsChange() {
    let dateOption = this.manager.getDateOptions(this.criteria.dateOptions);
    this.criteria.fromDate = dateOption.fromDate;
    this.criteria.toDate = dateOption.toDate;
  }

  getAll(){
      this.loading.create({
        message: "Processing..",
        backdropDismiss: false
      }).then(
        el => {
          el.present();
    this.obj.maxRow = this.config.itemsPerPage;
    this.obj.current = "0";
    const url =this.manager.appConfig.apiurl +'reports/inventoryReport';
    // let dateT = new Date();
    // this.obj.date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, dateT);
    // this.obj.fromDate=firstDay;
    // this.obj.toDate=lastDay;
    this.obj.fromDate=this.criteria.fromDate;
    this.obj.toDate=this.criteria.toDate;
    this.obj.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.obj.fromDate);
    this.obj.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.obj.toDate);


    this.http.post(url,this.obj,this.manager.getOptions()).subscribe(
      (data:any) =>{
        this.loading.dismiss();      
        this.inventoryList = [];          
        this.inventoryList = data.dataList;
        this.config.currentPage = 1;
        // this.config.totalItems = this.inventoryList.length;
        this.config.totalItems = data.rowCount;

        for(var i = 0; i < this.inventoryList.length; i++){
          this.inventoryList[i].date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.inventoryList[i].date);
        }

        this.obj.date = "";
      }
    );
  })
  }
    
  search(currIndex){
    this.loading.create({
      message: "Processing..",
      backdropDismiss: false
    }).then(
      el => {
        el.present();
    this.criteria.maxRow = this.config.itemsPerPage;
    if(currIndex == undefined){
      this.criteria.current = 0;
    }else{
      this.criteria.current = currIndex;

    }
   
    const url =this.manager.appConfig.apiurl +'reports/inventoryReport';

    let send_from_date = this.criteria.fromDate;
    let send_to_date = this.criteria.toDate;
    this.criteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, send_from_date);
    this.criteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, send_to_date);
    // if (this.criteria.fromDate.toString() != "") {
    //   this.criteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
    // }
    // else{     
    //   this.criteria.fromDate=firstDay;
    //   this.criteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
    // }
    // if (this.criteria.toDate.toString() != "") {
    //   this.criteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
    // }
    // else{
    //   this.criteria.toDate=lastDay;
    //   this.criteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
    // }
  
    
    if(((this.criteria.fromDate.toString() == "false") && (this.criteria.toDate.toString() == "false"))){
      this.alert("Message", "Add Correct Date Format");
      this.criteria.date = "";
    } else {
      this.http.post(url, this.criteria, this.manager.getOptions()).subscribe(
        (data:any) =>{
          this.loading.dismiss();
          this.config.totalItems = data.rowCount;
          if(currIndex == 0){
            this.config.currentPage = 1;
          }   
          this.criteria.fromDate = send_from_date;  
          this.criteria.toDate = send_to_date;   
          this.inventoryList = [];          
          this.inventoryList = data.dataList;
  
          for(var i = 0; i < this.inventoryList.length; i++){
            this.inventoryList[i].date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.inventoryList[i].date);
          }
        }
      );
    }
  })
  }
  pageChanged(e){
    this.config.currentPage = e;
    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.search(currentIndex);
  }

  print(){
    this.loading.create({
      message: "Processing..",
      backdropDismiss: false
    }).then(
      el => {
        el.present();
    const url = this.manager.appConfig.apiurl + 'reports/inventoryExcelReport';
         this.criteria.current="";
         let send_data1 = this.criteria.fromDate;
        let send_data2 = this.criteria.toDate;
        if (this.criteria.fromDate.toString() != "") {
          this.criteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
        }
        if (this.criteria.toDate.toString() != "") {
          this.criteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
        }
        if (this.criteria.fromDate.toString() == "false") {
          this.alert("Message", "Add Correct Date Format");
          this.criteria.fromDate = "";
        }
        if (this.criteria.toDate.toString() == "false") {
          this.alert("Message", "Add Correct Date Format");
          this.criteria.toDate = "";
        } else {
      this.http.post(url, this.criteria, this.manager.getOptions()).subscribe(
        (data:any)  => {
          let cri_date1 = "";
          let cri_date2 = "";
          if (this.criteria.fromDate.toString() != "") {
            cri_date1 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.criteria.fromDate).toString();
          }
          if (this.criteria.toDate.toString() != "") {
            cri_date2 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.criteria.toDate).toString();
          }
          this.criteria.fromDate = send_data1;
          this.criteria.toDate = send_data2;
         
          if(data.message == "SUCCESS"){
            this.loading.dismiss();
            let data1 = data.dataList;
            let cri_flag = 0;
            let excel_date = "";

            let excelTitle = "Inventory Report";
            let excelHeaderData = [
              "Date", "User Name","BrandOwner Name", "Shop Code", "Shop Name",
              "State", "Township","Brand SKU Code", "Stock Code", "Stock Name",
              "Qty", "ExpiredQty", "Warehouse"
            ];
            let excelDataList: any = [];

            let workbook = new Workbook();
            let worksheet = workbook.addWorksheet('Inventory Data');

            
            for(var exCount = 0; exCount < data1.length; exCount++){
              let excelData: any = [];
              excel_date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].date).toString();

              excelData.push(excel_date);
              excelData.push(data1[exCount].username);
              excelData.push(data1[exCount].brandOwner);
              excelData.push(data1[exCount].shopCode);
              excelData.push(data1[exCount].shopName);
              excelData.push(data1[exCount].state);
              excelData.push(data1[exCount].township);
              excelData.push(data1[exCount].spSKUCode);
              excelData.push(data1[exCount].skuCode);
              excelData.push(data1[exCount].skuName);
              excelData.push(data1[exCount].quantity);
              excelData.push(data1[exCount].expiredQuantity);
              excelData.push(data1[exCount].warehouse);

              excelDataList.push(excelData);
            }

            let titleRow = worksheet.addRow(["","",excelTitle]);
            titleRow.font = {bold: true};
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
            if(this.criteria.brandOwner.toString() != ""){
              criteriaRow = worksheet.addRow(["Brand Owner : " + data1[0].brandOwner.toString()]);
              criteriaRow.font = {bold: true};
              cri_flag++;
            }
            if(this.criteria.shopCode.toString() != ""){
              criteriaRow = worksheet.addRow(["Shop Code : " + data1[0].shopCode.toString()]);
              criteriaRow.font = {bold: true};
              cri_flag++;
            }
            if(this.criteria.shopName.toString() != ""){
              criteriaRow = worksheet.addRow(["Shop Name : " + data1[0].shopName.toString()]);
              criteriaRow.font = {bold: true};
              cri_flag++;
            }
            if(this.criteria.state.toString() != ""){
              criteriaRow = worksheet.addRow(["State : " + this.criteria.state.toString()]);
              criteriaRow.font = {bold: true};
              cri_flag++;
            }
            if(this.criteria.township.toString() != ""){
              criteriaRow = worksheet.addRow(["Township : " + this.criteria.township.toString()]);
              criteriaRow.font = {bold: true};
              cri_flag++;
            }
            if(this.criteria.location.toString() != ""){
              criteriaRow = worksheet.addRow(["Address : " + this.criteria.location.toString()]);
              criteriaRow.font = {bold: true};
              cri_flag++;
            }
            if(this.criteria.spSKUCode.toString() != ""){
              criteriaRow = worksheet.addRow(["Brand SKU Code : " + this.criteria.spSKUCode.toString()]);
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

            if(this.criteria.username.toString() != ""){
              criteriaRow = worksheet.addRow(["User Name : " + this.criteria.username.toString()]);
              criteriaRow.font = {bold: true};
              cri_flag++;
            }

            if(cri_flag == 0){
              criteriaRow = worksheet.addRow(["Search With No Criteria"]);
              criteriaRow.font = {bold: true};
            }
            worksheet.addRow([]);

            let headerRow = worksheet.addRow(excelHeaderData);
            headerRow.font = {bold: true};
            for(var i_data = 0; i_data < excelDataList.length; i_data++){
              worksheet.addRow(excelDataList[i_data]);
            }

            workbook.xlsx.writeBuffer().then((data) => {
              let blob = new Blob([data], {type: EXCEL_TYPE});
              FileSaver.saveAs(blob, "Inv_export_" + new  Date().getTime() + EXCEL_EXTENSION);
            });
          }
        }
      );
    }
  })
  }

  // private saveAsExcelFile(buffer: any, fileName: string): void {
  //   const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
  //   FileSaver.saveAs(data, fileName + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
  // }

  dblClickFunc(){
    this.criteria.date = "";
    this.criteria.fromDate = "";
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
      "date":"",
      "fromDate": "",
      "toDate": "",
      "location": "",
      "spSKUCode": "",
      "current": "",
      "maxRow": "",
      "username":"",
      "state" : "",
      "township" : ""
    };
  }

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

   /* param = {
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
    );*/
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
    param = {
      "searchVal" : ""
    };
    url = this.manager.appConfig.apiurl + 'user/userList';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any)  => {
        this.userList = data.dataList;
        this.userList.sort((a, b) => (a.userName.toLowerCase() > b.userName.toLowerCase()) ? 1 : -1);
      }
    );
  }
  getUsers() {
    return new Promise<void>(promise => {
      const url = this.manager.appConfig.apiurl + 'user/userReportList';
      const param = {
        userType: 2
      };
      let caller = this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.userList = data.dataList;
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