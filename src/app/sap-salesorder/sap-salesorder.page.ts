import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { ControllerService } from '../controller.service';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import { MatOption } from '@angular/material';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $ : any;
var date = new Date();
var todayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

@Component({
  selector: 'app-sap-salesorder',
  templateUrl: './sap-salesorder.page.html',
  styleUrls: ['./sap-salesorder.page.scss'],
})
export class SapSalesOrderPage implements  OnInit,AfterViewInit {
  @ViewChild('triggerAllDisChanSelectOption', { static: false }) triggerAllDisChanSelectOption: MatOption;
  msg: any = "";

  config = {
    itemsPerPage: 20,
    currentPage: 1,
    totalItems: 0,
    id: 'rppagi'
  };

  criteria: any = this.getCriteriaData();
  filterBoxFormGroup:FormGroup = new FormGroup({
    'fromDate' : new FormControl('',Validators.required),
    'toDate' : new FormControl('',Validators.required),
    'shop' : new FormControl('',Validators.required),
  });
  rtPackagingList = [];
  disChanList: any = [];

  constructor(
    public manager: ControllerService,
    private http: HttpClient,
    public loading: LoadingController,
    public tostCtrl: ToastController,
    private alertCtrl: AlertController,
  ) { }

  ngAfterViewInit(): void {
    $('#progress-bar-sales').hide();
    $('#sales-upload-result').hide();
  }
  
  ngOnInit() {
    console.log("ngOnInit");
    this.rtPackagingList = [];
    this.criteria.dateOptions = "today";
    this.dateOptionsChange();
    this.getPartnerData();
  }

  ionViewWillEnter() {
    console.log("ionViewWillEnter");
  }

  // search() {
  //   console.log("fromdate= " + this.criteria.fromDate);
  //   console.log("todate= " + this.criteria.toDate);
  //   let date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
  //   console.log("fromdate= " + date);

  //   $('#sales-search-result').show();
  // }

  showDetail() {
    $('#sales-detail-table').slideToggle();
  }

  upload() {
    $('#sales-detail-table').hide();
    $('#sales-search-result').hide();

    this.loading.create({
      message: "Processing..",
     
      backdropDismiss: false
    }).then(
      el => {
        el.present();

        const url = this.manager.appConfig.apiurl +'sap/ReturnablePackagingUpload';
        const param = {
          "fromDate": "",
          "toDate": "",
          "shop": this.filterBoxFormGroup.get("shop").value,
          "disChanSyskey":""
        };

        this.http.post(url, param, this.manager.getOptions()).subscribe(
          (data:any) =>{
            el.dismiss();
            if(data.message == "SUCCESS"){
              this.msg = "Success";
            } else if(data.message == "NOFILEPATH") {
              this.msg = "File Not Found";
            } else {
              this.msg = "Fail";
            }

            $('#sales-upload-result').show();
            setTimeout(() => {
              $('#sales-upload-result').hide();
            }, 3000);
          }
        );
      }
    );
  }

  getCriteriaData() {
    return {
      "fromDate": "",
      "toDate": "",
      "shopCode": "",
      "disChanSyskey":"",
      "checkAll": false
    };
  }

  dateOptionsChange() {
    let dateOption = this.manager.getDateOptions(this.criteria.dateOptions);
    this.criteria.fromDate = dateOption.fromDate;
    this.criteria.toDate = dateOption.toDate;
  }

  async search(uploadStatus)
  {
    this.rtPackagingList = [];
    let value: any ="";
    // let date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
    var fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.filterBoxFormGroup.get("fromDate").value);
    var toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.filterBoxFormGroup.get("toDate").value);
    const param = {
      "uploadStatus": uploadStatus,
      "fromDate": fromDate,
      "toDate": toDate,
      "shop": this.filterBoxFormGroup.get("shop").value,
      "disChanSyskey": ""
    }

    if(this.criteria.checkAll == true){
      param.fromDate = "";
      param.toDate = "";
    }
    
    for(var i=0;i<this.criteria.disChanSyskey.length;i++){
      value+=this.criteria.disChanSyskey[i]+","; 
    }
    value = value.slice(0,-1);
    param.disChanSyskey = value;
    const loading = await this.loading.create({
      cssClass: 'custom-class custom-loading', //my-custom-class
      message: 'Please wait...'
    });

    await loading.present();
    const url = this.manager.appConfig.apiurl + 'sap/ReturnablePackagingUploadManual';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {        
        if (data.message == "SUCCESS") {
          $('#progress-bar-sales').hide();
          this.rtPackagingList = data.collectData;
          this.config.totalItems = this.rtPackagingList.length;
          this.config.currentPage = 1;
          this.config.id = "rppagi";
          $('#sales-detail-table').show();
          if(uploadStatus){
            this.printFile("Returnable_Packaging_Pickup");
          }
          loading.dismiss();
          if(this.rtPackagingList.length==0){
            $('#sales-detail-table').hide();
          }
        }
        //  else if(data.message == "NODATA"){
        //   $('#progress-bar-sales').hide();
        //   this.manager.showToast(this.tostCtrl, "Message", "No Data to Upload!!", 1000);
        // }
        else{
          $('#progress-bar-sales').hide();
          this.manager.showToast(this.tostCtrl, "Message", "Fail!", 1000);
        }
      },
      error=>{
        loading.dismiss();
        $('#progress-bar-sales').hide();
        // this.manager.showToast(this.tostCtrl, "Message", "Upload Fail!", 1000);
      }
    );

    $('#sales-search-result').show();

  }

  pageChanged(e){
    this.config.currentPage = e;
    this.config.id = "rppagi";
  }
  async printToPreview()
  {
    // this.printFile("Returnable_Packaging_Pickup_PREVIEW");
    const loading = await this.loading.create({
      cssClass: 'custom-class custom-loading', //my-custom-class
      message: 'Please wait...'
    });
    await loading.present();
    return new Promise<void>(
      (res, rej) => {
        this.printFile("Returnable_Packaging_Pickup_PREVIEW");
        loading.dismiss();
        res();
    })   
  }

  async printToExport()
  {
    this.rtPackagingList = [];
    this.search(true);
  }

  printFile(filename){

    if (this.rtPackagingList != undefined && this.rtPackagingList != null && this.rtPackagingList.length > 0) {
      let data1 = this.rtPackagingList;
      let excelHeaderData = [
        "CUSTOMER_ID", "SALES_ORG", "DIS_CHANNEL", "DIVISION", 
        "INVOICE_DATE", "MATERIAL", 
        "QTY", "UOM", "PURCH_NO_C",
        "PLANT", "SHIPPING_POINT", 
        "ROUTE"
      ];
      let excelDataList: any = [];

      let workbook = new Workbook();
      let worksheet = workbook.addWorksheet('R_Packaging_Pickup_Data');
      let headerRow = worksheet.addRow(excelHeaderData);
      headerRow.font = { bold: true };

      for (var exCount = 0; exCount < data1.length; exCount++) {
        let excelData: any = [];

        excelData.push(data1[exCount].customerId);
        excelData.push(data1[exCount].salesOrg);
        excelData.push(data1[exCount].disChan);
        excelData.push(data1[exCount].division);

        excelData.push(data1[exCount].odrDate);
        excelData.push(data1[exCount].material);

        excelData.push(data1[exCount].qty.toString());
        excelData.push(data1[exCount].uom);

        excelData.push(data1[exCount].purchNoC);
        excelData.push(data1[exCount].plant);
        excelData.push(data1[exCount].shipPoint);

        excelData.push(data1[exCount].route);

        // excelDataList.push(excelData);
        worksheet.addRow(excelData);
      }

      // let headerRow = worksheet.addRow(excelHeaderData);
      // headerRow.font = { bold: true };
      // for (var i_data = 0; i_data < excelDataList.length; i_data++) {
      //   worksheet.addRow(excelDataList[i_data]);
      // }

      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: EXCEL_TYPE });
        FileSaver.saveAs(blob, filename + EXCEL_EXTENSION);
      });
    }else{
      $('#sales-detail-table').hide();
      this.manager.showToast(this.tostCtrl, "Message", "No Data to Upload!", 1000);
    }
  }
  getPartnerData() {
    const url = this.manager.appConfig.apiurl+ 'shop/getPartnerData';
    this.http.get(url, this.manager.getOptions()).subscribe((data: any) => {
      if(data.message == 'SUCCESS') {
        // this.divList = data.dataList.divisionList;
        // this.salesOfficeList = data.dataList.saleOfficeList;
        this.disChanList = data.dataList.disChannelList;
        // this.bpGroupList = data.dataList.partGpList;
        // this.saleDistrictList = data.dataList.saleDistrictList;
        // this.paymentTermList = data.dataList.paymentTermList;
        // this.creditControlList = data.dataList.creditControlList;
      }
    });
  }
  toggleDisChanAllSelect() {
    if (this.triggerAllDisChanSelectOption.selected) {
      this.criteria.disChanSyskey = [];
      this.criteria.disChanSyskey.push(-1);
      for (let dischan of this.disChanList) {
        this.criteria.disChanSyskey.push(dischan.syskey)
      }
    } else {
      this.criteria.disChanSyskey = [];
    }
  }
  async resetToExport()
  {
    this.alertCtrl.create({
      header: 'Confirm to Reset?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            //console.log('Confirm Cancel: blah');
          }
        },
        {
          text: 'Okay',
          handler: () => {
            this.loading.create({
              message: "Please wait...",
              backdropDismiss: false,
              duration: 5000
            }).then(
              el => {
                el.present();
                let value: any ="";
                var fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.filterBoxFormGroup.get("fromDate").value);
                var toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.filterBoxFormGroup.get("toDate").value);
            
                const param = {
                  "fromDate": fromDate,
                  "toDate": toDate,
                  "shop": this.filterBoxFormGroup.get("shop").value,
                  "disChanSyskey": ""
                }
            
                if(this.criteria.checkAll == true){
                  param.fromDate = "";
                  param.toDate = "";
                }
            
                for(var i=0;i<this.criteria.disChanSyskey.length;i++){
                  value+=this.criteria.disChanSyskey[i]+","; 
                }
                const url = this.manager.appConfig.apiurl + 'sap/resetStatusRPUpload';
                this.http.post(url, param, this.manager.getOptions()).subscribe(
                (data: any) => {
                    el.dismiss();
                    if (data.message == "SUCCESS") {
                      $('#progress-bar-sales').hide();
                      this.manager.showToast(this.tostCtrl, "Message", "Reset Successful!", 1000);
                    } else if (data.message == "NODATA") {
                      $('#progress-bar-sales').hide();
                      this.manager.showToast(this.tostCtrl, "Message", "No Data to Reset!", 1000);
                    }else{
                      $('#progress-bar-sales').hide();
                      this.manager.showToast(this.tostCtrl, "Message", "Reset Fail!", 1000);
                    }
                  },
                  (error: any) => {
                    el.dismiss();
                    // this.loading.dismiss();
                    $('#progress-bar-sales').hide();
                    this.manager.showToast(this.tostCtrl, "Message", "Reset Fail!", 1000);
                  }
                )

              }
            )
          }
        }

      ]
    }).then(el => {
      el.present();
    })   
  }

}