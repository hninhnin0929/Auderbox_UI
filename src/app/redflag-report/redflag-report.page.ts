import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { MatDatepicker } from '@angular/material/datepicker';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { IonContent, AlertController, NavController, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { FormControl } from '@angular/forms';
import { Workbook } from 'exceljs';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { AppComponent } from '../app.component';



import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-redflag-report',
  templateUrl: './redflag-report.page.html',
  styleUrls: ['./redflag-report.page.scss'],
})
export class RedflagReportPage implements OnInit {
  config =  {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  date = new FormControl(new Date());
  serializedDate = new FormControl((new Date()).toISOString());
  obj: any = this.getRedflagReportObj();
  redflagReportList: any = [];
  shopSysKeyList: any = [];
  formatsDateTest: string[] = [
    'dd/MM/yyyy'

  ];
  load: boolean = false;
  btn: boolean = false;
  constructor(
    public manager: ControllerService,
    public http: HttpClient,
    public router: Router,
    public alertController: AlertController,
    public event: Events,
    public app: AppComponent,
    public tostCtrl: ToastController,
    public activatedRoute: ActivatedRoute,
    private loadCtrl: LoadingController
  ) {
    this.manager.isLoginUser();
  }

  define = [{}]
  ngOnInit() {
    this.manager.isLoginUser();

  }

  getRedflagReportObj() {
    return {
      shopSysKey: "",
      countDate: "1",
      shopCode: "",
      date: "",
      quantity: "",
      averageQuantity: "",
      skuCode: "",
      skuName: "",
      shopName: "",
      address: "",
      percentage: "50",
      rpstatus: "",
      cPercentage:0,
      rpercentage:"",
      headerSyskey: "",
      shopSysKeyList: []

    }
  }

  ionViewWillEnter() {
    this.manager.isLoginUser();
    this.getAll();
    this.getShopList();
    // this.currentDate();

  }


  getAll() {
    return new Promise(done => {
      const url = this.manager.appConfig.apiurl + 'regFlagReport/orderreport';
      this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.redflagReportList = [];
          this.redflagReportList = data;
        },
        e => {
          done();
        }

      )
    })

  }

  search() {
    const url = this.manager.appConfig.apiurl + 'regFlagReport/orderreport';
    this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.redflagReportList = [];
        this.redflagReportList = data;
      }

    )
  }

  getShopName(id) {
    const url = this.manager.appConfig.apiurl + 'regFlagReport/getShopName';
    this.obj.shopSysKey=id;
    this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
      (data: any) => {       
       this.obj.shopName= data.dataList.shopName;
      
      }
     
    )
  
    return this.obj.shopName;
  }

  print() {
    const url = this.manager.appConfig.apiurl + 'regFlagReport/orderreport';
    this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
      (data: any) => {
        var cpercentages =100 - this.obj.percentage.toString();
        let excelTitle = "RegFlag Report";
        let cri_flag = 0;
        let excelHeaderData = [
          "Date", "Transaction ID","Shop Code", "Shop Name","State", "Township",  "Sku Code", "Sku Name",   "Qty",
          cpercentages+"% Avg Quantity", "Avg Quantity"
        ];

        let excelDataList: any = [];

        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet('RegFlag Data');


        for (var exCount = 0; exCount < data.length; exCount++) {
          let excelData: any = [];
          excelData.push(data[exCount].date);
          excelData.push(data[exCount].transactionId);
          excelData.push(data[exCount].shopCode);
          excelData.push(data[exCount].shopName);
          excelData.push(data[exCount].state);
          excelData.push(data[exCount].township);
          excelData.push(data[exCount].skuCode);
          excelData.push(data[exCount].skuName);
          excelData.push(data[exCount].quantity);
          excelData.push(data[exCount].rpercentage);
          excelData.push(data[exCount].averageQuantity);
          excelDataList.push(excelData);
        }

        let titleRow = worksheet.addRow(["", "", excelTitle]);
        titleRow.font = { bold: true };
        worksheet.addRow([]);
        if(this.obj.shopSysKey != ""){
          this.obj.shopName= this.getShopName(this.obj.shopSysKey);
        }
       

        let criteriaRow;
        if (this.obj.date.toString() != "") {
          criteriaRow = worksheet.addRow([" Order Date : " + this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI, this.obj.date.toString())]);
          criteriaRow.font = { bold: true };
          cri_flag++;
        }
      //  worksheet.addRow([]);

        if (this.obj.percentage.toString() != "") {
          criteriaRow = worksheet.addRow([" Percentage  : " + this.obj.percentage.toString() + "%"]);
          criteriaRow.font = { bold: true };
          cri_flag++;
        }

        //worksheet.addRow([]);

        if( this.obj.shopName.toString() != ""){
          criteriaRow = worksheet.addRow([" Shop Name :"+ this.obj.shopName.toString()]);
          criteriaRow.font = {bold: true};

          cri_flag++;
        } else {
          criteriaRow = worksheet.addRow([" Shop Name :  All Shop"]);
          criteriaRow.font = { bold: true };
          cri_flag++;
        }
        
      //  worksheet.addRow([]);

       if (this.obj.countDate.toString() != "") {
          criteriaRow = worksheet.addRow([" Past Visit Count : " + this.obj.countDate.toString()]);
          criteriaRow.font = { bold: true };
          cri_flag++;
        }

        worksheet.addRow([]);

        let headerRow = worksheet.addRow(excelHeaderData);
        headerRow.font = { bold: true };
        for (var i_data = 0; i_data < excelDataList.length; i_data++) {
          worksheet.addRow(excelDataList[i_data]);
        }
        this.obj.shopName="";
        workbook.xlsx.writeBuffer().then((data) => {
          let blob = new Blob([data], { type: EXCEL_TYPE });
          FileSaver.saveAs(blob, "RegFlagSku_export_" + new Date().getTime() + EXCEL_EXTENSION);
        });
      }
    );
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  ionViewDidEnter() {
    this.load = true;
  }

  getShopList() {
    const url = this.manager.appConfig.apiurl + 'shopPerson/getShopList';
    this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.shopSysKeyList = data.dataList;

      }
    );
  }

  async detail(dtl, status) {

    this.loadCtrl.create({
      message: "Processing.."
    }).then(
      async el => {
        el.present();
        await this.changeStatus(dtl, status);
        if (status == "1") {
          el.dismiss();
          this.orderDetail(dtl);
        }
        if (status == "2") {
          await this.getAll();
          el.dismiss();
        }else{
          el.dismiss();
        }
      }
    )


  }
  orderDetail(dtl) {
    this.router.navigate(['/order'], { queryParams: { sysKey: dtl.headerSysKey, dtl: dtl.syskey } });
  }

  changeStatus(dtl, s) {
    return new Promise(p => {
      let id = dtl.syskey;
      let status = s;
      const url = this.manager.appConfig.apiurl + 'regFlagReport/changeButton/' + id + '/' + status;
      this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
        (data: any) => {
          p();

        },
        error => {
          p();
          console.log(error);
        }
      );
    })


  }

  changeDateFormat(date) {
    var startDate = date;

    var year = startDate.substring(0, 4);
    var month = startDate.substring(4, 6);
    var day = startDate.substring(6, 8);

    return year + '-' + month + '-' + day;
  }
  percentage() {
    if (this.obj.percentage > 100) {
      this.obj.percentage = 50;
    }
  }
  
  pageChanged(e){
    this.config.currentPage = e;
  }

}




