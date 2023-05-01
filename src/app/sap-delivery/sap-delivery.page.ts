import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ControllerService } from '../controller.service';
import { AlertController, LoadingController, ToastController, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';

declare var $ : any;
var date = new Date();
var todayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  selector: 'app-sap-delivery',
  templateUrl: './sap-delivery.page.html',
  styleUrls: ['./sap-delivery.page.scss'],
})

export class SapDeliveryPage implements  OnInit,AfterViewInit  
{

  config = {
    itemsPerPage: 20,
    currentPage: 1,
    totalItems: 0,
    id: "matlmap"
  };
  criteria: any = this.getCriteriaData();
  searchCriteria: any = this.getSearchCriteriaData();
  rowCount: any = 0;
  filterBoxFormGroup:FormGroup = new FormGroup({
    'start-date' : new FormControl('',Validators.required),
    'end-date' : new FormControl('',Validators.required),
  });
  skuList = [];
  skuListTemp: any = [];
  skuListTempUI: any = [];

  constructor(
    private http: HttpClient,
    private manager: ControllerService,
    public alertController: AlertController,
    public loading: LoadingController,
    public tostCtrl: ToastController,
  ) { }

  ngAfterViewInit(): void 
  {
    $('#progress-bar-mapping').hide();
    $('#delivery-upload-result').hide();
  }
  
  ngOnInit()
  {
    this.criteria.checkAll = true;
    this.criteria.fromDate = todayDate;
    this.criteria.toDate = todayDate;
  }
  ionViewWillEnter() 
  {

  }

  pageChanged(e){
    this.config.currentPage = e;
    this.config.id = "matlmap";
    // let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    // this.skuListTemp = this.skuList;
    // this.skuListTempUI = this.skuListTemp.splice(currentIndex,this.config.itemsPerPage);
  }

  preview() {
    this.loading.create({
      message: "Please wait..."
    }).then(loadEl => {
      loadEl.present();
      if(this.criteria.checkAll === false) {
        this.searchCriteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
        this.searchCriteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
      }
      const url = this.manager.appConfig.apiurl + 'sap/skuMappingUploadManual';
      this.http.post(url, this.searchCriteria, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.searchCriteria = this.getSearchCriteriaData();
          loadEl.dismiss();
          if (data.message == "SUCCESS") {
            $('#progress-bar-mapping').hide();
            this.skuList = data.data;
            this.config.totalItems = data.data.length;
            this.config.id = "matlmap";
            this.skuListTemp = data.data;
            this.rowCount = data.count;
            this.config.currentPage = 1;
            $('#delivery-search-result').show();
            $('#delivery-detail-table').show();
          } else if(data.message == "NODATA"){
            this.manager.showToast(this.tostCtrl, "Message", "No Data!", 1000);
          }else {
            $('#progress-bar-mapping').hide();
            this.rowCount = data.count;
            $('#delivery-search-result').show();
            this.manager.showToast(this.tostCtrl, "Message", "Server Fail!", 1000);
          }
        },
        error=>{
          loadEl.dismiss();
          $('#progress-bar-mapping').hide();
          this.searchCriteria = this.getSearchCriteriaData();
          this.manager.showToast(this.tostCtrl, "Message", "Server Fail!", 1000);
        }
      );
    }).catch(error => {});
  }

  export(buttonText) {
    this.loading.create({
      message: "Processing..",
      backdropDismiss: false
    }).then(
      el => {
        el.present();
        this.searchCriteria.buttonText = buttonText;
        if(this.criteria.checkAll === false) {
          this.searchCriteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
          this.searchCriteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
        }
        const url = this.manager.appConfig.apiurl + 'sap/skuMappingUploadManual';

        this.http.post(url, this.searchCriteria, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();

            if (data.message == "SUCCESS") {
              let data1 = data.data;
              let excelHeaderData = [
                "SAP_MATERIAL_CODE",
                "SAP_MATERIAL_DESCRIPTION",
                "SAP_TYPE",
                "SAP_UOM",
                "DMS_MATERIAL_CODE",
                "DMS_MATERIAL_DESCRIPTION",
                "DMS_TYPE"
              ];
              let excelDataList: any = [];

              let workbook = new Workbook();
              let worksheet = workbook.addWorksheet('ZTABLES');
              for (var exCount = 0; exCount < data1.length; exCount++) {
                let excelData: any = [];
                // excel_date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].fromDate).toString();
                // excelData.push(excel_date);
                excelData.push(data1[exCount].sapcode);
                excelData.push(data1[exCount].sapdesc);
                excelData.push(data1[exCount].saptype);
                excelData.push(data1[exCount].uom);
                excelData.push(data1[exCount].dmscode);
                excelData.push(data1[exCount].dmsdesc);
                excelData.push(data1[exCount].dmstype);

                excelDataList.push(excelData);
              }

              let headerRow = worksheet.addRow(excelHeaderData);
              headerRow.font = { bold: true };
              for (var i_data = 0; i_data < excelDataList.length; i_data++) {
                worksheet.addRow(excelDataList[i_data]);
              }

              workbook.xlsx.writeBuffer().then((data) => {
                let blob = new Blob([data], { type: EXCEL_TYPE });
                if(buttonText === 'export') {
                  FileSaver.saveAs(blob, "ZTABLE" + EXCEL_EXTENSION);
                } else {
                  FileSaver.saveAs(blob, "ZTABLE_PREVIEW" + EXCEL_EXTENSION);
                }
              });
            }
          }
        );


      }
    )

  }

  

  // search()
  // {
  //   console.log("fromdate= " + this.criteria.fromDate);
  //   console.log("todate= " + this.criteria.toDate);
  //   let date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
  //   console.log("fromdate= " + date);
  //   let type = this.criteria.type;
  //   console.log("type= " + type);

  //   $('#delivery-search-result').show();
  // }
  showDetail()
  {
    $('#delivery-detail-table').slideToggle();
  }
  upload()
  {
    $('#delivery-upload-result').hide();
    $('#progress-bar-mapping').show();
    $('#delivery-detail-table').hide();
    $('#delivery-search-result').hide();

    const param = {
      "path":"D:\\Workspace\\Auderbox-GitLab\\auderbox\\SAP\\ImportFiles\\.",
      "fileName": "ZTABLE.xlsx"
    }
    const url = this.manager.appConfig.apiurl + 'sap/skuMappingUpload';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.message == "SUCCESS") {
          $('#progress-bar-mapping').hide();
          this.manager.showToast(this.tostCtrl, "Message", "Upload Success!", 1000);
          $('#delivery-upload-result').show();
        } else if(data.message == "NODATA"){
          $('#progress-bar-mapping').hide();
          this.manager.showToast(this.tostCtrl, "Message", "No Data to Upload!", 1000);
        }else if(data.message == "NOFILEPATH"){
          $('#progress-bar-mapping').hide();
          this.manager.showToast(this.tostCtrl, "Message", "File Path is not Found to Upload!", 1000);
        }else {
          $('#progress-bar-mapping').hide();
          this.manager.showToast(this.tostCtrl, "Message", "Upload Fail!", 1000);
        }
      },
      error=>{
        $('#progress-bar-mapping').hide();
        this.manager.showToast(this.tostCtrl, "Message", "Upload Fail!", 1000);
      }
    );


    // setTimeout(() => {
    //   $('#delivery-upload-result').hide();
    // }, 3000);

  }

  getCriteriaData() 
  {
    return {
      "fromDate": "",
      "toDate": "",
      "type": "1",
      "checkAll": false
    };
  }

  getSearchCriteriaData() 
  {
    return {
      "fromDate": "",
      "toDate": "",
      "buttonText": ""
    };
  }


}
