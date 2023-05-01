import { Router, NavigationExtras,ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { MatDatepicker } from '@angular/material/datepicker';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, PLATFORM_INITIALIZER } from '@angular/core';
import { IonContent, AlertController, NavController, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { AppComponent } from '../app.component';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import { FormControl } from '@angular/forms';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

var date=new Date();
var firstDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 6);
var lastDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
declare var $: any;

@Component({
  selector: 'app-void-report',
  templateUrl: './void-report.page.html',
  styleUrls: ['./void-report.page.scss'],
})
export class VoidReportPage implements OnInit {
  
  @ViewChild('picker', { static: false }) matDatepicker: MatDatepicker<Date>;
  stockCodeSearch : FormControl= new FormControl();
  stockNameSearch : FormControl = new FormControl();
  shopCodeSearch : FormControl= new FormControl();
  shopNameSearch : FormControl = new FormControl();
  config =  {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  obj : any = this.getCriteriaData();
  shopPersonList : any =[];
  load:boolean = false;
  spinner: boolean = false;
  searchtab: boolean = false;
  criteria: any = this.getCriteriaData();
  total : any;
  bolist: any = [];
  skucodeList: any = [];
  skunameList: any = [];
  shopcodeList: any = [];
  shopnameList: any = [];

  constructor(
    public manager: ControllerService,
    public http: HttpClient,
    public router: Router,
    public alertController: AlertController,
    public event: Events,
    public app: AppComponent,
    public tostCtrl: ToastController,
    public activatedRoute: ActivatedRoute,
    public loading:LoadingController
  ) {
    this.manager.isLoginUser();
  }

  ngOnInit() {
    this.manager.isLoginUser();
  }

  async ionViewWillEnter() {
    this.manager.isLoginUser();
    this.spinner = true;
    this.criteria.dateOptions = "today";
    this.dateOptionsChange();
    this.search(0);
    //await this.getAll();
    this.getBrandOwner();
    this.spinner = false;
    this.getListForAutoComplete();
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
  getCriteriaData(){
    return {
      "skuCode": "",
      "skuName": "",
      "shopCode": "",
      "shopName": "",
      "brandOwner": "",
      "fromDate": "",
      "toDate":"",
      "location": "",
      "spSKUCode": "",
      "type": "",
      "current": "",
      "maxRow": "",
      "dateOptions":"",
      "state" : "",
      "township" : ""
    };
  }


  ionViewDidEnter(){
    this.load = true;
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
    this.search(0);
    //this.getAll();
  }
  dateOptionsChange() {
    let dateOption = this.manager.getDateOptions(this.criteria.dateOptions);
    this.criteria.fromDate = dateOption.fromDate;
    this.criteria.toDate = dateOption.toDate;
  }


  pageChanged(e){
    this.config.currentPage = e;
    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.search(currentIndex);
  }

  getBrandOwner() {
    return new Promise(promise => {
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

  getListForAutoComplete(){
   this.stockCodeSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.stockCodeSearchAutoFill(term).subscribe(
            data => {
              this.skucodeList = data as any[];

            });
        }
      }
    );
    this.stockNameSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.stockNameSearchAutoFill(term).subscribe(
            data => {
              this.skunameList = data as any[];

            });
        }
      }
    );
    this.shopCodeSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.shopCodeSearchAutoFill(term,1).subscribe(
            data => {
              this.shopcodeList = data as any[];

            });
        }
      }
    );
    this.shopNameSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.shopNameSearchAutoFill(term).subscribe(
            data => {
              this.shopnameList = data as any[];

            });
        }
      }
    );
  }


  // getAll() {
  //   this.loading.create({
  //     message: "Processing..",
     
  //     backdropDismiss: false
  //   }).then(
  //     el => {
  //       el.present();
  //       const url = this.manager.appConfig.apiurl + 'reports/getvoidReport';
  //       this.obj.maxRow = this.config.itemsPerPage;
  //       this.obj.current = "0";
  //       this.obj.fromDate = firstDay;
  //       this.obj.toDate = lastDay;
  //       this.obj.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.obj.fromDate);
  //       this.obj.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.obj.toDate);
  //       this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
  //         (data: any) => {
  //           console.log(data);
  //           el.dismiss();

  //           this.config.currentPage = 1;
  //           this.config.totalItems = data.rowCount;
          
  //           this.shopPersonList = [];
  //           this.shopPersonList = data.voidreportList;
    
  //           for (var i = 0; i < this.shopPersonList.length; i++) {
  //             this.shopPersonList[i].createdDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.shopPersonList[i].createdDate);
  //           }
  //         }
  //       );
  //     }
  //   );
  // }
 
  
  search(currIndex) {
    this.loading.create({
      message: "Processing..",
     
      backdropDismiss: false
    }).then(
      el => {
        el.present();
        const url = this.manager.appConfig.apiurl + 'reports/getvoidReport';
        this.obj.maxRow = this.config.itemsPerPage;
        this.obj.current = currIndex;
        this.obj.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
        this.obj.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
        this.obj.skuCode = this.criteria.skuCode;
        this.obj.shopCode = this.criteria.shopCode;
        this.obj.skuName = this.criteria.skuName;
        this.obj.shopName = this.criteria.shopName;
        this.obj.brandOwner = this.criteria.brandOwner;
        this.obj.spSKUCode = this.criteria.spSKUCode;
        this.obj.state = this.criteria.state;
        this.obj.township = this.criteria.township;
        this.obj.location = this.criteria.location;
      
        if (this.criteria.fromDate.toString() == "false") {
          this.alert("Message", "Add Correct Date Format");
          this.criteria.fromDate = "";
        }
        if (this.criteria.toDate.toString() == "false") {
          this.alert("Message", "Add Correct Date Format");
          this.criteria.toDate = "";
        } else {
          this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
            (data: any) => {
              el.dismiss();
              this.config.totalItems = data.rowCount;
              if(currIndex == 0){
                this.config.currentPage = 1;
              }
             
              this.shopPersonList = [];
              this.shopPersonList = data.voidreportList;

              for (var i = 0; i < this.shopPersonList.length; i++) {
                this.shopPersonList[i].createdDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.shopPersonList[i].createdDate);

              }
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
        const url = this.manager.appConfig.apiurl + 'reports/voidExcelReport';

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
          let cri_date2="";
              if (this.criteria.fromDate.toString() != "") {
                cri_date1 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.criteria.fromDate).toString();
              }
              if (this.criteria.toDate.toString() != "") {
                cri_date2 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.criteria.toDate).toString();
              }
              this.criteria.fromDate = send_data1;
              this.criteria.toDate = send_data2;
        
          if(data.message == "SUCCESS"){
            // let data1 = data.dataList;   
            this.loading.dismiss();         
            let cri_flag = 0;
            let excel_date = "";
           
            let type_flag = "";

            let excelTitle = "Delivery Void Report";
            let excelHeaderData = [
              "Date", "Transaction ID", "User Name", "BrandOwner Name", "SP Shop Code", "Shop Code", "Shop Name",
              "Address", "SP SKU Code", "Stock Code", "Stock Name",
              "OrderQTY", "ReturnQTY","Price", "Sub Total(100%)", "Type","Status"
            ];
            let excelTotalData = [
              "orderTotalAmt",
              "returnTotalAmt",
              "specialDiscount",
              "totalAmt"
            ];
            let excelDataList: any = [];

            let workbook = new Workbook();
            let worksheet = workbook.addWorksheet('Delivery Void Data');

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
              criteriaRow = worksheet.addRow(["Brand Owner : " + data.dataList[0].detailList[0].brandOwner.toString()]);
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
            if(this.criteria.state.toString() != ""){
              criteriaRow = worksheet.addRow(["State : " + this.criteria.state.toString()]);
              criteriaRow.font = {bold: true};
              cri_flag++;
            }
            if(this.criteria.township.toString() != ""){
              criteriaRow = worksheet.addRow(["Township: " + this.criteria.township.toString()]);
              criteriaRow.font = {bold: true};
              cri_flag++;
            }
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

            if(cri_flag == 0){
              criteriaRow = worksheet.addRow(["Search With No Criteria"]);
              criteriaRow.font = {bold: true};
            }
          
            let headerRow = worksheet.addRow(excelHeaderData);
            headerRow.font = {bold: true};
            
            for(var exCount = 0; exCount < data.dataList.length; exCount++){
              excelDataList = [];
              let hashmapData = data.dataList[exCount];
              let detail = hashmapData.detailList;
              let total = hashmapData.totalList;
              let cashReceive = hashmapData.cashReceive;
              let totalData = {
                "orderTotalAmt": "",
                "returnTotalAmt": "",
                "specialDiscount": "",
                "totalAmt": ""
              };

              for(var exCount1 = 0; exCount1 < detail.length; exCount1++){
                let excelData: any = [];
                excel_date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, detail[exCount1].fromDate).toString();
                

                excelData.push(excel_date);
                excelData.push(detail[exCount1].transactionID);
                excelData.push(detail[exCount1].userName);
                excelData.push(detail[exCount1].brandOwner);
                excelData.push(detail[exCount1].spShopCode);
                excelData.push(detail[exCount1].shopCode);
                excelData.push(detail[exCount1].shopName);
                excelData.push(detail[exCount1].location);
                excelData.push(detail[exCount1].spSKUCode);
                excelData.push(detail[exCount1].skuCode);
                excelData.push(detail[exCount1].skuName);
                excelData.push(detail[exCount1].reportQTY);
                excelData.push(detail[exCount1].returnQTY);
                excelData.push(detail[exCount1].prices);
                excelData.push(detail[exCount1].subTotal);
                excelData.push(detail[exCount1].type);
                excelData.push(detail[exCount1].saveStatus);

                excelDataList.push(excelData);
              }
         

              for(var i_data = 0; i_data < excelDataList.length; i_data++){
                worksheet.addRow(excelDataList[i_data]);
              }           

              let d1= worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, detail[0].shopName,"","","","", "Order Total Amount("+total.order_disc+"%)", total.orderTotalAmt]);  
            
              let d2 = worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName,detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, detail[0].shopName,"","","","", "Return Total Amount", total.returnTotalAmt]);
             
              let d3 = worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName, detail[0].brandOwner,detail[0].spShopCode,detail[0].shopCode,detail[0].shopName,"","","","", "Special Discount", total.specialDiscount]);
              
              let d4 = worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName, detail[0].brandOwner,detail[0].spShopCode,detail[0].shopCode,detail[0].shopName,"","","","","Invoice Discount", total.invoiceDiscount]);            
              
              let d5 = worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName, detail[0].brandOwner,detail[0].spShopCode,detail[0].shopCode,detail[0].shopName,"","","","","Total Amount", total.totalAmt]);

              let d6 = worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, detail[0].shopName, "", "", "", "", "Brandowner Payment", total.boPayment]);
              let d7 = worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, detail[0].shopName, "", "", "", "", "Auderbox Payment", total.auderboxPayment]);
              let d8 = worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, detail[0].shopName, "", "", "", "", "Cash Amount", total.cashAmount]);
              let d9 = worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, detail[0].shopName, "", "", "", "", "Credit Amount", total.creditAmount]);
              let d10 = worksheet.addRow([excel_date, detail[0].transactionID, detail[0].userName, detail[0].brandOwner, detail[0].spShopCode, detail[0].shopCode, detail[0].shopName, "", "", "", "", "Cash Receive",cashReceive.cashReceive == null ? "                 0" : cashReceive.cashReceive]);           
              d1.getCell(12).font = { bold: true };
              d1.getCell(13).font = { bold: true };
              d2.getCell(12).font = { bold: true };
              d2.getCell(13).font = { bold: true };
              d3.getCell(12).font = { bold: true };
              d3.getCell(13).font = { bold: true };
              d4.getCell(12).font = { bold: true };
              d4.getCell(13).font = { bold: true };
              d5.getCell(12).font = { bold: true };
              d5.getCell(13).font = { bold: true };
              d6.getCell(12).font = { bold: true };
              d6.getCell(13).font = { bold: true };
              d7.getCell(12).font = { bold: true };
              d7.getCell(13).font = { bold: true };
              d8.getCell(12).font = { bold: true };
              d8.getCell(13).font = { bold: true };
              d9.getCell(12).font = { bold: true };
              d9.getCell(13).font = { bold: true };
              d10.getCell(12).font = { bold: true };
              d10.getCell(13).font = { bold: true };

            }
            workbook.xlsx.writeBuffer().then((data) => {
              let blob = new Blob([data], {type: EXCEL_TYPE});
              FileSaver.saveAs(blob, "Void_export_" + new  Date().getTime() + EXCEL_EXTENSION);
            });
          }
        }
      );
     
    }
   
  }
 )

  }

  dblClickFunc(){
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

}
