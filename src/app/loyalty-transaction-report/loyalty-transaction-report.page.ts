import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../controller.service';
import { LoadingController,AlertController} from '@ionic/angular';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import moment from 'moment';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
var firstDay = moment().startOf('month').toDate();
var lastDay = moment().endOf('month').toDate()
@Component({
  selector: 'app-loyalty-transaction-report',
  templateUrl: './loyalty-transaction-report.page.html',
  styleUrls: ['./loyalty-transaction-report.page.scss'],
})
export class LoyaltyTransactionReportPage implements OnInit {
  config =  {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
    
  shopNameSearch : FormControl = new FormControl();
  constructor(
    public manager: ControllerService,
    public loading : LoadingController,
    public http : HttpClient,
    public alertController:AlertController,

  ) { 
  }
  ownerList1: any = [];
  loyaltyList: any= [];
  obj:any =this.getCriteriaData();
  spinner: boolean = false;
  searchtab: boolean = false;
  shoplist: any = []; 
  criteria: any = this.getCriteriaData();

  ngOnInit() {
  }
  ionViewWillEnter() {
    this.manager.isLoginUser();
    this.criteria.dateOptions = "this_month";
    this.dateOptionsChange();
    this.search(0);
    this.allList();
  }
  pageChanged(e){
    this.config.currentPage = e;
    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.search(currentIndex);
  }
  dateOptionsChange() {
    let dateOption = this.manager.getDateOptions(this.criteria.dateOptions);
    this.criteria.fromdate = dateOption.fromDate;
    this.criteria.todate = dateOption.toDate;
  }
  runSpinner(t: boolean) {
    this.spinner = t;
  }
  advanceSearch(option) {
    this.searchtab = option;
  }
  advanceSearchReset() {
    this.obj=this.getCriteriaData();
    this.criteria.dateOptions = "this_month";
    this.dateOptionsChange();
    this.config.currentPage = 0;
    this.search(0);
    
  }
  dblClickFunc(){

  }
  search(currentIndex){
  const url =this.manager.appConfig.apiurl +'reports/loyaltlist';
  this.obj.maxRow = this.config.itemsPerPage;
  this.obj.current = currentIndex;

  this.obj.fromdate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromdate);
  this.obj.todate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.todate);
  this.obj.shopname=this.criteria.shopname;
  this.http.post(url,this.obj,this.manager.getOptions()).subscribe(
    (data:any) =>{      
      this.loyaltyList = [];          
      this.loyaltyList = data.dataList;
      this.config.totalItems = data.rowCount;
      if (currentIndex == 0) {
        this.config.currentPage = 1;
      }
      for(var i = 0; i < this.loyaltyList.length; i++){
        this.loyaltyList[i].date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.loyaltyList[i].date);
      }
      this.obj.date = "";
    }
  );
}

print(){
   const url = this.manager.appConfig.apiurl + 'reports/loyaltlist';
      this.criteria.current="";
      let send_data1 = this.criteria.fromdate;
      let send_data2 = this.criteria.todate;
      if (this.obj.fromdate.toString() != "") {
        this.obj.fromdate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromdate);
      }
      if (this.obj.todate.toString() != "") {
        this.obj.todate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.todate);
      }
     this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
      (data:any)  => {
        let cri_date1 = "";
        let cri_date2 = "";
        if (this.obj.fromdate.toString() != "") {
          cri_date1 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.obj.fromdate).toString();
        }
        if (this.obj.todate.toString() != "") {
          cri_date2 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.obj.todate).toString();
        }
        this.obj.fromdate = send_data1;
        this.obj.todate = send_data2;
       
        if(data.message == "SUCCESS"){
          let data1 = data.dataList;
          let cri_flag = 0;
          let excel_date = "";

          let excelTitle = "Loyalty Report";
          let excelHeaderData = [
            "Date", "Shop Name", "Brand Owner",
            "Invoice Amount", "Net Invoice Amount", "Type",
            "Discount"
          ];
          let excelDataList: any = [];

          let workbook = new Workbook();
          let worksheet = workbook.addWorksheet('Loyalty Data');

          
          for(var exCount = 0; exCount < data1.length; exCount++){
            let excelData: any = [];
            excel_date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].date).toString();

            excelData.push(excel_date);
            excelData.push(data1[exCount].shopname);
            excelData.push(data1[exCount].brandowner);
            excelData.push(data1[exCount].invoicamt);
            excelData.push(data1[exCount].netamt);
            excelData.push(data1[exCount].type);
            excelData.push(data1[exCount].discount);

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
          
          if (this.criteria.brandOwner.toString() != "") {
            criteriaRow = worksheet.addRow(["Brand Owner : " + data.dataList[0].detailList[0].brandOwner.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          if (this.criteria.shopname.toString() != "") {
            criteriaRow = worksheet.addRow(["Shop Name : " + this.criteria.shopname.toString()]);
            criteriaRow.font = { bold: true };
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
            FileSaver.saveAs(blob, "Loyalty_export_" + new  Date().getTime() + EXCEL_EXTENSION);
          });
        }
      }
    );
}
allList(){
  var url = "";
  var param = {};

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
 
}
  getCriteriaData(){
    return {
      "shopsyskey":"",
      "date": "",
      "shopacc": "",
      "shopname": "",
      "brandOwner": "",
      "fromdate": "",
      "todate": "",
      "invoicamt": 0.0,
      "netamt": 0.0,
      "type":0,
      "discount":0.0,
      "current": "",
      "maxRow": ""

    };
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
