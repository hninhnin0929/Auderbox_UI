import { Component, OnInit, ViewChild } from '@angular/core';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';
import { MatOption } from '@angular/material';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $ : any;
var date = new Date();
var todayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

@Component({
  selector: 'app-sap-return-sku',
  templateUrl: './sap-return-sku.page.html',
  styleUrls: ['./sap-return-sku.page.scss'],
})
export class SapReturnSkuPage implements OnInit {

  @ViewChild('triggerAllDisChanSelectOption', { static: false }) triggerAllDisChanSelectOption: MatOption;
  @ViewChild('triggerSalesRegSelectOption', { static: false }) triggerSalesRegSelectOption: MatOption;


  config = {
    itemsPerPage: 20,
    currentPage: 1,
    totalItems: 0,
    id: 'invpagi'
  };
  criteria: any = this.getCriteriaData();
  filterBoxFormGroup:FormGroup = new FormGroup({
    'fromDate' : new FormControl('',Validators.required),
    'toDate' : new FormControl('',Validators.required),
    'shop' : new FormControl('',Validators.required),
  });
  tableData = [{}]
  retSKUDataList : any = [];
  disChanList: any = [];
  salesRegList: any = [];

  constructor(
    private http: HttpClient,
    private manager: ControllerService,
    public alertController: AlertController,
    public loading: LoadingController,
    public tostCtrl: ToastController,
    private alertCtrl: AlertController,
  ) { }

  ngAfterViewInit(): void 
  {  
    $('#progress-bar-return-sku').hide();
    $('#return-sku-upload-result').hide();
  }
  
  ngOnInit()
  {
    // this.criteria.fromDate = todayDate;
    // this.criteria.toDate = todayDate;
    this.retSKUDataList = [];
    this.criteria.dateOptions = "today";
    this.dateOptionsChange();
    this.getPartnerData();
    // this.getState();
  }
  ionViewWillEnter() 
  {

  }

  async search(uploadStatus)
  {
    this.retSKUDataList = [];
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
    var url = this.manager.appConfig.apiurl + 'sap/invoiceReturnSKUUploadManual';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {        
        if (data.message == "SUCCESS") {
          $('#progress-bar-return-sku').hide();
          this.retSKUDataList = data.collectData;
          this.config.totalItems = this.retSKUDataList.length;
          this.config.currentPage = 1;
          this.config.id = "retskupagi";
          $('#return-sku-detail-table').show();
          if(uploadStatus){
            this.printFile("INVOICE_RETURN_SKU");
          }
          loading.dismiss();
          if(this.retSKUDataList.length==0){
            $('#return-sku-detail-table').hide();
          }
        } else if(data.message == "NODATA"){
          $('#progress-bar-return-sku').hide();
          this.manager.showToast(this.tostCtrl, "Message", "No Data to Upload!", 1000);
        }else{
          $('#progress-bar-return-sku').hide();
          this.manager.showToast(this.tostCtrl, "Message", "Fail!", 1000);
        }
      },
      error=>{
        loading.dismiss();
        $('#progress-bar-return-sku').hide();
        // this.manager.showToast(this.tostCtrl, "Message", "Upload Fail!", 1000);
      }
    );

    $('#return-sku-search-result').show();

  }
  showDetail()
  {
    $('#return-sku-detail-table').slideToggle();
  }
  upload()
  {
    $('#return-sku-detail-table').hide();
    $('#return-sku-search-result').hide();
    $('#return-sku-upload-result').hide();
    $('#progress-bar-return-sku').show();

    const param = {
      "path":"D:\\Documentation\\Auderbox\\Documentation\\Upload Testing\\",
      "fileName": "ZTABLE.xlsx"
    }
    var url = this.manager.appConfig.apiurl + 'sap/invoiceReturnSKUUpload';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        console.log(data.message);
        if (data.message == "SUCCESS") {
          $('#progress-bar-return-sku').hide();
          this.manager.showToast(this.tostCtrl, "Message", "Upload Success!", 1000);
          $('#return-sku-upload-result').show();
        } else if(data.message == "NODATA"){
          $('#progress-bar-return-sku').hide();
          this.manager.showToast(this.tostCtrl, "Message", "No Data to Upload!", 1000);
        }else if(data.message == "NOFILEPATH"){
          $('#progress-bar-return-sku').hide();
          this.manager.showToast(this.tostCtrl, "Message", "File Path is not Found to Upload!", 1000);
        }else{
          $('#progress-bar-return-sku').hide();
          this.manager.showToast(this.tostCtrl, "Message", "Upload Fail!", 1000);
        }
      },
      error=>{
        $('#progress-bar-return-sku').hide();
        this.manager.showToast(this.tostCtrl, "Message", "Upload Fail!", 1000);
      }
    );
    // setTimeout(() => {
    //   $('#billing-upload-result').hide();
    // }, 3000);
  }

  getCriteriaData() 
  {
    return {
      "fromDate": "",
      "toDate": "",
      "shopCode": "",
      "dateOptions": "0",
      "disChanSyskey": "",
      "stateSyskey": "",
      "checkAll": false
    };
  }
  pageChanged(e){
    this.config.currentPage = e;
    this.config.id = "retskupagi";
  }
  async printToPreview()
  {
    // this.printFile("INVOICE_RETURN_SKU_PREVIEW");    
    const loading = await this.loading.create({
      cssClass: 'custom-class custom-loading', //my-custom-class
      message: 'Please wait...'
    });
    await loading.present();
    return new Promise<void>(
      (res, rej) => {
        this.printFile("INVOICE_RETURN_SKU_PREVIEW");    
        loading.dismiss();
        res();
    })
  }

  async printToExport()
  {
     this.search(true);
     this.retSKUDataList = [];
  }

  printFile(filename){
    if (this.retSKUDataList != undefined && this.retSKUDataList != null && this.retSKUDataList.length > 0) {
      let data1 = this.retSKUDataList;
      let excelHeaderData = [
        "CUSTOMER_ID", "DOC_TYPE", "RETURN_DOC_NO", "INVOICE_REFERENCE", "RETURN_DATE", "MATERIAL", 
        "RETURN_QTY", "UOM", "RETURN_PRICE"
      ];
      let excelDataList: any = [];

      let workbook = new Workbook();
      let worksheet = workbook.addWorksheet('Invoice Return SKU Upload Data');
      let headerRow = worksheet.addRow(excelHeaderData);
      headerRow.font = { bold: true };

      for (var exCount = 0; exCount < data1.length; exCount++) {
        let excelData: any = [];

        excelData.push(data1[exCount].customerId);
        excelData.push(data1[exCount].docType);
        excelData.push(data1[exCount].returnDocNum);
        excelData.push(data1[exCount].invRef);

        excelData.push(data1[exCount].returnDate);
        excelData.push(data1[exCount].material);

        excelData.push(data1[exCount].returnQTY.toString());
        excelData.push(data1[exCount].uom);
        excelData.push(data1[exCount].returnPrice.toString());

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
      $('#return-sku-detail-table').hide();
      this.manager.showToast(this.tostCtrl, "Message", "No Data to Upload!", 1000);
    }
  }
  dateOptionsChange() {
    let dateOption = this.manager.getDateOptions(this.criteria.dateOptions);
    this.criteria.fromDate = dateOption.fromDate;
    this.criteria.toDate = dateOption.toDate;
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
  getState() {
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'placecode/state';
      this.http.post(url, { code: "", description: "" }, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.salesRegList = [];
          // this.criStateList = [];

          data.dataList.forEach(e => {
            this.salesRegList.push({ syskey: e.syskey, t2: e.t2 });
            // this.criStateList.push({ syskey: e.syskey, t2: e.t2 });
          });

          this.salesRegList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
          // this.criStateList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
        },
        error => {
          done();
        }
      )
    })
  }
  toggleStateAllSelect() {
    if (this.triggerSalesRegSelectOption.selected) {
      this.criteria.stateSyskey = [];
      this.criteria.stateSyskey.push(-1);
      for (let s of this.salesRegList) {
        this.criteria.stateSyskey.push(s.syskey)
      }
    } else {
      this.criteria.stateSyskey = [];
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
                value = value.slice(0,-1);
                param.disChanSyskey = value;
                const url = this.manager.appConfig.apiurl + 'sap/resetStatusInvReturnSKUUpload';
                this.http.post(url, param, this.manager.getOptions()).subscribe(
                (data: any) => {
                    el.dismiss();
                    if (data.message == "SUCCESS") {
                      $('#progress-bar-return-sku').hide();
                      this.manager.showToast(this.tostCtrl, "Message", "Reset Successful!", 1000);
                    } else if (data.message == "NODATA") {
                      $('#progress-bar-return-sku').hide();
                      this.manager.showToast(this.tostCtrl, "Message", "No Data to Reset!", 1000);
                    }else{
                      $('#progress-bar-return-sku').hide();
                      this.manager.showToast(this.tostCtrl, "Message", "Reset Fail!", 1000);
                    }
                  },
                  (error: any) => {
                    el.dismiss();
                    // this.loading.dismiss();
                    $('#progress-bar-return-sku').hide();
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
