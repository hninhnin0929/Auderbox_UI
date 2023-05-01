import { Router, NavigationExtras,ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { MatDatepicker } from '@angular/material/datepicker';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { IonContent, AlertController, NavController, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Workbook } from 'exceljs';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { AppComponent } from '../app.component';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';


import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  selector: 'app-average-order-amount',
  templateUrl: './average-order-amount.page.html',
  styleUrls: ['./average-order-amount.page.scss'],
})
export class AverageOrderAmountPage implements OnInit {
  @ViewChild('picker', { static: false }) matDatepicker: MatDatepicker<Date>;
  config =  {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  obj : any = this.getRedflagReportObj();
  redflagReportList : any =[];
  shopSysKeyList:any=[];
  load:boolean = false;
  constructor(
    public manager: ControllerService,
    public http: HttpClient,
    public router: Router,
    public alertController: AlertController,
    public event: Events,
    public app: AppComponent,
    public tostCtrl: ToastController,
    public activatedRoute: ActivatedRoute,
  ) { 
    this.manager.isLoginUser();
  }

  define = [{  }]
  ngOnInit() {
      this.manager.isLoginUser();

    }

    getRedflagReportObj(){
      return {
        shopSysKey:"",
        countDate:"1",
        shopCode:"",
        date:"",
        totalAmount:"",
        averagetotalAmount:"",
        skuCode:"",
        skuName:"",
        brandOwner:"",
        shopName:"",
        address:"",
        percentage:"",
        shopSysKeyList: []

      }
    }

    ionViewWillEnter() {
      this.manager.isLoginUser();
      this.getAll();
      this.getShopList();

    }

    
    getAll(){
      
      const url =this.manager.appConfig.apiurl +'averageAmountReport/averageAmountReportList';

      this.http.post(url,this.obj,this.manager.getOptions()).subscribe(
        (data:any) =>{      
          this.redflagReportList = [];          
          this.redflagReportList =data;
        }
     
      )
    }

    search(){
      const url =this.manager.appConfig.apiurl +'averageAmountReport/averageAmountReportList';
    this.http.post(url,this.obj,this.manager.getOptions()).subscribe(
      (data:any) =>{      
        this.redflagReportList = [];          
        this.redflagReportList =data;
      }
   
    )
}

/*print(){
  const url = this.manager.appConfig.apiurl + 'averageAmountReport/averageAmountReportList';
  this.http.post(url,this.obj, this.manager.getOptions()).subscribe(
    (data:any)  => {
      let exampleData : any = [];
      exampleData = data;
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exampleData);
      const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "AverageAmount_Report");
    }
  );
}*/

print() {
  const url = this.manager.appConfig.apiurl + 'averageAmountReport/averageAmountReportList';
  this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
    (data: any) => {
      var cpercentages =100 - this.obj.percentage.toString();
      let excelTitle = "Average RegFlag Report";
      let cri_flag = 0;
      let excelHeaderData = [
        "Date","Transaction ID", "Shop Code", "Shop Name", "State", "Township", "brandOwner","Total Amount",
        cpercentages+"% Avg Quantity","Avg Total Amount"
      ];

      let excelDataList: any = [];

      let workbook = new Workbook();
      let worksheet = workbook.addWorksheet('Average RegFlag Data');


      for(var exCount = 0; exCount < data.length; exCount++){
        let excelData: any = [];
        excelData.push(data[exCount].date);
        excelData.push(data[exCount].transactionId);
        excelData.push(data[exCount].shopCode);
        excelData.push(data[exCount].shopName);
        excelData.push(data[exCount].state);
        excelData.push(data[exCount].township);
        excelData.push(data[exCount].brandOwner);
        excelData.push(data[exCount].totalAmount);
        excelData.push(data[exCount].rpercentage);
        excelData.push(data[exCount].averageQuantity);
        excelDataList.push(excelData);
      }

      let titleRow = worksheet.addRow(["","",excelTitle]);
      titleRow.font = {bold: true};
      worksheet.addRow([]);
      if(this.obj.shopSysKey != "")
      {
        this.obj.shopName= this.getShopName(this.obj.shopSysKey);
      }
      let criteriaRow;
      if(this.obj.date.toString() != ""){
        criteriaRow = worksheet.addRow([" Order Date : " + this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI,this.obj.date.toString())]);
        criteriaRow.font = {bold: true};
        cri_flag++;
      }
     // worksheet.addRow([]);

      if(this.obj.percentage.toString() != ""){
        criteriaRow = worksheet.addRow([" Percentage  : " + this.obj.percentage.toString()+"%"]);
        criteriaRow.font = {bold: true};
        cri_flag++;
      }

     // worksheet.addRow([]);
      if(this.obj.shopName.toString() != ""){
        criteriaRow = worksheet.addRow([" Shop Name : "+this.obj.shopName.toString() ]);
        criteriaRow.font = {bold: true};
        cri_flag++;
      }else{
        criteriaRow = worksheet.addRow([" Shop Name :  All Shop"]);
        criteriaRow.font = {bold: true};
        cri_flag++;
      }

      //worksheet.addRow([]);

      if(this.obj.countDate.toString() != ""){
        criteriaRow = worksheet.addRow([" Past Visit Count : " + this.obj.countDate.toString()]);                                    
        criteriaRow.font = {bold: true};
        cri_flag++;
      }

       worksheet.addRow([]);

      let headerRow = worksheet.addRow(excelHeaderData);
      headerRow.font = {bold: true};
      for(var i_data = 0; i_data < excelDataList.length; i_data++){
        worksheet.addRow(excelDataList[i_data]);
      }

      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], {type: EXCEL_TYPE});
        FileSaver.saveAs(blob, "AverageOrderAmount_export_" + new  Date().getTime() + EXCEL_EXTENSION);
      });


     /* let exampleData: any = [];
      exampleData = data;
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exampleData);
      const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "Redflag_report");*/
    }
  );
}

private saveAsExcelFile(buffer: any, fileName: string): void {
  const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
  FileSaver.saveAs(data, fileName + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
}

    ionViewDidEnter(){
      this.load = true;
    }

    getShopList() {
      const url = this.manager.appConfig.apiurl + 'shopPerson/getShopList';
      this.http.post(url,this.obj, this.manager.getOptions()).subscribe(
        (data:any)  => {
          this.shopSysKeyList = data.dataList;

        }
      );
    }

    getShopName(id) {
      const url = this.manager.appConfig.apiurl + 'averageAmountReport/getShopName';
      this.obj.shopSysKey=id;
      this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
        (data: any) => {       
         this.obj.shopName= data.dataList.shopName;
        
        }
       
      )
    
      return this.obj.shopName;
    }

    pageChanged(e){
      this.config.currentPage = e;
    }

}