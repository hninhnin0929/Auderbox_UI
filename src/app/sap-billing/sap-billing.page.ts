import { AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ControllerService } from '../controller.service';
import { AlertController, LoadingController, ToastController, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';
import { MatOption } from '@angular/material';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $ : any;
var date = new Date();
var todayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

@Component({
  selector: 'app-sap-billing',
  templateUrl: './sap-billing.page.html',
  styleUrls: ['./sap-billing.page.scss'],
})
export class SapBillingPage implements  OnInit,AfterViewInit  
{
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
  invoiceDataList : any = [];
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
    $('#progress-bar-invoice').hide();
    $('#billing-upload-result').hide();
  }
  
  ngOnInit()
  {
    // this.criteria.fromDate = todayDate;
    // this.criteria.toDate = todayDate;
    this.invoiceDataList = [];
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
    this.invoiceDataList = [];
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
    var url = this.manager.appConfig.apiurl + 'sap/invoiceUploadManual';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.message == "SUCCESS") {
          $('#progress-bar-invoice').hide();
          this.invoiceDataList = data.collectData;
          this.config.totalItems = this.invoiceDataList.length;
          this.config.currentPage = 1;
          this.config.id = "invpagi";
          $('#billing-detail-table').show();
          // this.invoiceDataList.map((shop) => {
          //   shop.CreditLimitAmount = shop.CreditLimitAmount.toString();
          // })
          if(uploadStatus){
            this.printFile("INVOICE");
          }
          loading.dismiss();
          if(this.invoiceDataList.length==0){
            $('#billing-detail-table').hide();
          }
        } else if(data.message == "NODATA"){
          $('#progress-bar-invoice').hide();
          this.manager.showToast(this.tostCtrl, "Message", "No Data to Upload!", 1000);
        }else{
          $('#progress-bar-invoice').hide();
          this.manager.showToast(this.tostCtrl, "Message", "Fail!", 1000);
        }
        $('#billing-search-result').show();
      },
      error=>{
        loading.dismiss();
        $('#progress-bar-invoice').hide();
        $('#billing-search-result').show();
      }
    );
  }
  showDetail()
  {
    $('#billing-detail-table').slideToggle();
  }
  upload()
  {
    $('#billing-detail-table').hide();
    $('#billing-search-result').hide();
    $('#billing-upload-result').hide();
    $('#progress-bar-invoice').show();

    const param = {
      "path":"D:\\Documentation\\Auderbox\\Documentation\\Upload Testing\\",
      "fileName": "ZTABLE.xlsx"
    }
    var url = this.manager.appConfig.apiurl + 'sap/invoiceUpload';
    // const url = this.manager.appConfig.apiurl + 'sap/invoiceUpload';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        console.log(data.message);
        if (data.message == "SUCCESS") {
          $('#progress-bar-invoice').hide();
          this.manager.showToast(this.tostCtrl, "Message", "Upload Success!", 1000);
          $('#billing-upload-result').show();
        } else if(data.message == "NODATA"){
          $('#progress-bar-invoice').hide();
          this.manager.showToast(this.tostCtrl, "Message", "No Data to Upload!", 1000);
        }else if(data.message == "NOFILEPATH"){
          $('#progress-bar-invoice').hide();
          this.manager.showToast(this.tostCtrl, "Message", "File Path is not Found to Upload!", 1000);
        }else{
          $('#progress-bar-invoice').hide();
          this.manager.showToast(this.tostCtrl, "Message", "Upload Fail!", 1000);
        }
      },
      error=>{
        $('#progress-bar-invoice').hide();
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
    this.config.id = "invpagi";
  }
  async printToPreview()
  {
    // this.printFile("INVOICE_PREVIEW");
    const loading = await this.loading.create({
      cssClass: 'custom-class custom-loading', //my-custom-class
      message: 'Please wait...'
    });
    await loading.present();
    return new Promise<void>(
      (res, rej) => {
        this.printFile("INVOICE_PREVIEW");
        loading.dismiss();
        res();
    })
    
  }

  async printToExport()
  {
     this.search(true);
     this.invoiceDataList = [];
  }

  printFile(filename){

    if (this.invoiceDataList != undefined && this.invoiceDataList != null && this.invoiceDataList.length > 0) {
      let data1 = this.invoiceDataList;
      let excelHeaderData = [
        "CUSTOMER_ID", "SALES_ORG", "DIS_CHANNEL", "DIVISION", 
        "INVOICE_NUMBER", "INVOICE_DATE", "ORDER_DATE", "MATERIAL", 
        "REQ_QTY", "UOM", "DOC_TYPE", "STANDARD_PRICE", 
        "DISCOUNT_PERCENT", "DISCOUNT_AMOUNT", "GROSS_AMOUNT", "CURRENCY", 
        "SALES_OFF", "SALES_GRP", "PARTN_ROLE", "PARTNER_ID", 
        "ITEM_CATEG", "PLANT", "SHIPPING_POINT", 
        "ROUTE","H_DISCOUNT_PERCENT","H_DISCOUNT_AMOUNT"
      ];
      let excelDataList: any = [];

      let workbook = new Workbook();
      let worksheet = workbook.addWorksheet('Invoice Upload Data');
      let headerRow = worksheet.addRow(excelHeaderData);
      headerRow.font = { bold: true };

      for (var exCount = 0; exCount < data1.length; exCount++) {
        let excelData: any = [];

        excelData.push(data1[exCount].customerId);
        excelData.push(data1[exCount].salesOrg);
        excelData.push(data1[exCount].disChan);
        excelData.push(data1[exCount].division);

        excelData.push(data1[exCount].invNum);
        excelData.push(data1[exCount].invDate);
        excelData.push(data1[exCount].odrDate);
        excelData.push(data1[exCount].material);

        excelData.push(data1[exCount].reqQTY.toString());
        excelData.push(data1[exCount].uom);
        excelData.push(data1[exCount].docType);
        excelData.push(data1[exCount].standardPrice.toString());

        excelData.push(data1[exCount].disPercent.toString());
        excelData.push(data1[exCount].disAmount.toString());
        excelData.push(data1[exCount].grossPrice.toString());
        excelData.push(data1[exCount].currency);

        excelData.push(data1[exCount].salesOff);
        excelData.push(data1[exCount].salesGrp);
        excelData.push(data1[exCount].partnerRole);
        excelData.push(data1[exCount].partnerId);

        excelData.push(data1[exCount].itmCategory);
        excelData.push(data1[exCount].plant);
        excelData.push(data1[exCount].shipPoint);

        excelData.push(data1[exCount].route);
        // excelData.push(data1[exCount].updateFlag);
        // excelData.push(data1[exCount].deleteFlag);
        excelData.push(data1[exCount].hDiscPercent.toString());
        excelData.push(data1[exCount].hDiscAmt.toString());

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
      $('#billing-detail-table').hide();
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
                const url = this.manager.appConfig.apiurl + 'sap/resetStatusInvUpload';
                this.http.post(url, param, this.manager.getOptions()).subscribe(
                (data: any) => {
                    el.dismiss();
                    if (data.message == "SUCCESS") {
                      $('#progress-bar-invoice').hide();
                      this.manager.showToast(this.tostCtrl, "Message", "Reset Successful!", 1000);
                    } else if (data.message == "NODATA") {
                      $('#progress-bar-invoice').hide();
                      this.manager.showToast(this.tostCtrl, "Message", "No Data to Reset!", 1000);
                    }else{
                      $('#progress-bar-invoice').hide();
                      this.manager.showToast(this.tostCtrl, "Message", "Reset Fail!", 1000);
                    }
                  },
                  (error: any) => {
                    el.dismiss();
                    // this.loading.dismiss();
                    $('#progress-bar-invoice').hide();
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
