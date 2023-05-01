import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ControllerService } from '../controller.service';
import { AlertController, LoadingController, ToastController, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';
import { MatOption } from '@angular/material';
import { AppComponent } from '../app.component';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $ : any;
var date = new Date();
var todayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

@Component({
  selector: 'app-sap-payment',
  templateUrl: './sap-payment.page.html',
  styleUrls: ['./sap-payment.page.scss'],
})


export class SapPaymentPage implements OnInit,AfterViewInit {

  @ViewChild('triggerAllDisChanSelectOption', { static: false }) triggerAllDisChanSelectOption: MatOption;

  config = {
    itemsPerPage: 20,
    currentPage: 1,
    totalItems: 0,
    id: 'paypagi'
  };
  criteria: any = this.getCriteriaData();
  filterBoxFormGroup:FormGroup = new FormGroup({
    'fromDate' : new FormControl('',Validators.required),
    'toDate' : new FormControl('',Validators.required),
    'shop' : new FormControl('',Validators.required),
  });
  tableData = [{}]
  paymentDataList : any = [];
  disChanList: any = [];
  crdCollectionExport_Access: boolean = false;

  constructor(
    private http: HttpClient,
    private manager: ControllerService,
    public alertController: AlertController,
    public loading: LoadingController,
    public tostCtrl: ToastController,
    public app: AppComponent,
  ) { }

  ngAfterViewInit(): void 
  {
    console.log("ngAfterViewInit");
    $('#progress-bar-payment').hide();
    $('#payment-upload-result').hide(); 
  }
  
  ngOnInit()
  {
    this.paymentDataList = [];
    this.criteria.dateOptions = "today";
    this.dateOptionsChange();
    this.getPartnerData();
    this.getBtnAccess();
  }
  ionViewWillEnter() 
  {
    console.log("ionViewWillEnter");
  }

  async search(uploadStatus)
  {
    this.paymentDataList = [];
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
    const url = this.manager.appConfig.apiurl + 'sap/paymentUploadManual';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {        
        if (data.message == "SUCCESS") {
          $('#progress-bar-payment').hide();
          this.paymentDataList = data.collectData;
          this.config.totalItems = this.paymentDataList.length;
          this.config.currentPage = 1;
          this.config.id = "paypagi";
          $('#payment-detail-table').show();
          if(uploadStatus){
            this.printFile("PAYMENT");
          }
          loading.dismiss();
          if(this.paymentDataList.length==0){
            $('#payment-detail-table').hide();
          }
        } else if(data.message == "NODATA"){
          $('#progress-bar-payment').hide();
          this.manager.showToast(this.tostCtrl, "Message", "No Data to Upload!", 1000);
        }else{
          $('#progress-bar-payment').hide();
          this.manager.showToast(this.tostCtrl, "Message", "Fail!", 1000);
        }
      },
      error=>{
        loading.dismiss();
        $('#progress-bar-payment').hide();
        this.manager.showToast(this.tostCtrl, "Message", "Upload Fail!", 1000);
      }
    );
    $('#payment-search-result').show();
  }

  upload()
  {
    $('#payment-detail-table').hide();
    $('#payment-search-result').hide();
    $('#payment-upload-result').hide();
    $('#progress-bar-payment').show();

    // const param = {
    //   "path":"D:\\Projects\\SAP\\ImportFiles\\.",
    //   "fileName": "ZTABLE.xlsx"
    // }

    const param = {
      "fromDate": "",
      "toDate": "",
      "shop": this.filterBoxFormGroup.get("shop").value,
      "disChanSyskey": ""
    }
    const url = this.manager.appConfig.apiurl + 'sap/paymentUpload';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        console.log(data.message);
        if (data.message == "SUCCESS") {
          $('#progress-bar-payment').hide();
          this.manager.showToast(this.tostCtrl, "Message", "Upload Success!", 1000);
          $('#payment-upload-result').show();
        } else if(data.message == "NODATA"){
          $('#progress-bar-payment').hide();
          this.manager.showToast(this.tostCtrl, "Message", "No Data to Upload!", 1000);
        }else if(data.message == "NOFILEPATH"){
          $('#progress-bar-payment').hide();
          this.manager.showToast(this.tostCtrl, "Message", "File Path is not Found to Upload!", 1000);
        }else{
          $('#progress-bar-payment').hide();
          this.manager.showToast(this.tostCtrl, "Message", "Upload Fail!", 1000);
        }
      },
      error=>{
        $('#progress-bar-payment').hide();
        this.manager.showToast(this.tostCtrl, "Message", "Upload Fail!", 1000);
      }
    );
    // setTimeout(() => {
    //   $('#payment-upload-result').hide();
    // }, 3000);
  }

  getCriteriaData() 
  {
    return {
      "fromDate": "",
      "toDate": "",
      "dateOptions": "0",
      "shopCode": "",
      "disChanSyskey": "",
      "checkAll": false
    };
  }
  pageChanged(e){
    this.config.currentPage = e;
    this.config.id = "paypagi";
  }
  async printToPreview()
  {
    // this.printFile("PAYMENT_PREVIEW");
    const loading = await this.loading.create({
      cssClass: 'custom-class custom-loading', //my-custom-class
      message: 'Please wait...'
    });
    await loading.present();
    return new Promise<void>(
      (res, rej) => {
        this.printFile("PAYMENT_PREVIEW");
        loading.dismiss();
        res();
    })
  }

  async printToExport()
  {
     this.search(true);
     this.paymentDataList = [];
  }

  printFile(filename){

    if (this.paymentDataList != undefined && this.paymentDataList != null && this.paymentDataList.length > 0) {
      let data1 = this.paymentDataList;

      let excelHeaderData = [
        "USERNAME", "CUSTOMER_ID", "TRANS_DATE", "INVOICE_NUMBER", 
        "INVOICE_DATE", "CURRENCY", "AMOUNT", "PSTNG_DATE", 
        "REF_DOC_NO", "SALES_OFFICE"
      ];
      let excelDataList: any = [];

      let workbook = new Workbook();
      let worksheet = workbook.addWorksheet('Payment Upload Data');
      let headerRow = worksheet.addRow(excelHeaderData);
      headerRow.font = { bold: true };

      for (var exCount = 0; exCount < data1.length; exCount++) {
        let excelData: any = [];

        excelData.push(data1[exCount].userName);
        excelData.push(data1[exCount].customerId.toString());
        excelData.push(data1[exCount].transDate);
        excelData.push(data1[exCount].invNum);

        excelData.push(data1[exCount].invDate);
        excelData.push(data1[exCount].currency);
        excelData.push(data1[exCount].amount.toString());
        excelData.push(data1[exCount].pstngDate);

        excelData.push(data1[exCount].refDocNo);
        excelData.push(data1[exCount].salesOffice);
        // excelData.push(data1[exCount].updateFlag);
        // excelData.push(data1[exCount].deleteFlag);

        // excelDataList.push(excelData);
        worksheet.addRow(excelData);
      }

      // if(param.fromDate != undefined && param.fromDate != null && param.fromDate.toString() != ""){
      //   criteriaRow = worksheet.addRow(["From Date : " + param.fromDate.toString()]);
      //   criteriaRow.font = { bold: true };
      //   cri_flag++;
      // }

      // if(param.toDate != undefined && param.toDate != null && param.toDate.toString() != ""){
      //   criteriaRow = worksheet.addRow(["To Date : " + param.toDate.toString()]);
      //   criteriaRow.font = { bold: true };
      //   cri_flag++;
      // }

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
      $('#payment-detail-table').hide();
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

  async resetStatus(){
    this.alertController.create({
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
                // this.paymentDataList = [];
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
            
                const url = this.manager.appConfig.apiurl + 'sap/resetStatusPaymentUpload';
            
                this.http.post(url, param, this.manager.getOptions()).subscribe(
                  (data: any) => {
                    el.dismiss();
                    if (data.message == "SUCCESS") {
                      this.manager.showToast(this.tostCtrl, "Message", "Reset Successful!", 1000);
                    } else if (data.message == "NODATA"){
                      this.manager.showToast(this.tostCtrl, "Message", "No Data to Reset!", 1000);
                    } else {
                      this.manager.showToast(this.tostCtrl, "Message", "Reset Fail!", 1000);
                    }
                  },
                  (error: any) => {
                    el.dismiss();
                    // this.loading.dismiss();
                    // $('#progress-bar-invoice').hide();
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
  getBtnAccess() {
    const pages = this.app.appPages;
    for (let i = 0; i < pages.length; i++) {
      for (let y = 0; y < pages[i].child.length; y++) {
        if (pages[i].child[y].btns) {
          for (let z = 0; z < pages[i].child[y].btns.length; z++) {
            if (pages[i].child[y].btns[z].code === 'allow_arimport' && pages[i].child[y].btns[z].status === true) {
              this.crdCollectionExport_Access = true;
            }
          }
        }
      }
    }
  }
}
