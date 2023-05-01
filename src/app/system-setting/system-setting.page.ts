import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { LoadingController, ToastController } from '@ionic/angular';
import * as XLSX from 'xlsx';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $: any;

@Component({
  selector: 'app-system-setting',
  templateUrl: './system-setting.page.html',
  styleUrls: ['./system-setting.page.scss'],
})

export class SystemSettingPage implements OnInit {

  saveData = this.getSaveData();
  tempSaveData = this.getTempSaveData();
  today: any = new Date();
  _taxExclusiveSKU: any = [];
  _getTaxExcStockData: any = [];
  importload: any;
  each_sheet_data: any = this.forjsondata1();
  all_sheet_data: any = this.forjsondata2();
  uploadedFileName: string = "";
  uploadFile: File;
  selectedFile: File;

  constructor(
    private http: HttpClient,
    private ics: ControllerService,
    private loadCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    
  }

  ngOnInit() {  

  }

  ionViewWillEnter() {
    this.saveData = this.getSaveData();
    this.tempSaveData = this.getTempSaveData();
    this.getAllConfig();
    this.importload = "";
    $('#skufilechose').val('');
  }

  rangeNotUse(){
    if(this.tempSaveData.isUseGPSLimitation == false){
      this.tempSaveData.gpsRange = "0";
    } else {
      this.tempSaveData.gpsRange = this.saveData.gpsRange;
    }
  }

  hlNotUse(){
    if(this.tempSaveData.isUseHotLineNumber == false){
      this.tempSaveData.hlNumber = "";
    } else {
      this.tempSaveData.hlNumber = this.saveData.hlNumber;
    }
  }

  EstimatedDeliDayNotUse(){
    if(this.tempSaveData.isUseEstimatedDeliDay == false){
      this.tempSaveData.estimatedDeliDay = "";
    } else {
      this.tempSaveData.estimatedDeliDay = this.saveData.estimatedDeliDay;
    }
  }
  orgNameNotUse(){
    if(this.tempSaveData.isUseOrgName == false){
      this.tempSaveData.orgName = "";
    } else {
      this.tempSaveData.orgName = this.saveData.orgName;
    }
  }
  backDateNotUse(){
    if(this.tempSaveData.isUseBackDate == false){
      this.tempSaveData.startBackDate = this.today;
      this.tempSaveData.endBackDate = this.today;
    } else {
      this.tempSaveData.startBackDate = this.saveData.startBackDate;
      this.tempSaveData.endBackDate = this.saveData.endBackDate;
    }
  }
  taxPercentNotUse(){
    if(this.tempSaveData.isUseTaxPercent == false){
      this.tempSaveData.taxPercent = "0";
    } else {
      this.tempSaveData.taxPercent = this.saveData.taxPercent;
    }
  }
  taxExclusiveSKUNotUse(){
    if(this.tempSaveData.isUseTaxExclusiveSKU == false){
      this._taxExclusiveSKU = [];
    } else {
      // this.tempSaveData.taxPercent = this.saveData.taxPercent;
    }
  }
  displayDeciPlaceNotUse(){
    if(this.tempSaveData.isUseDisplayDeciPlace == false){
      this.tempSaveData.displayDeciPlace = "0";
    } else {
      this.tempSaveData.displayDeciPlace = this.saveData.displayDeciPlace;
    }
  }
  calcDeciPlaceNotUse(){
    if(this.tempSaveData.isUseCalcDeciPlace == false){
      this.tempSaveData.calcDeciPlace = "0";
    } else {
      this.tempSaveData.calcDeciPlace = this.saveData.calcDeciPlace;
    }
  }
  cameraSettingNotUse(){
    if(this.tempSaveData.isUseCameraSetting == false){
      this.tempSaveData.isUseCamera = false;
      this.tempSaveData.isUseGallery = false;
      $('#camerasetting').attr('disabled', true);
      $('#galsetting').attr('disabled', true);
    } else {
      this.tempSaveData.isUseCamera = true;
      this.tempSaveData.isUseGallery = true;
      $('#camerasetting').attr('disabled', false);
      $('#galsetting').attr('disabled', false);
    }
  }

  getAllConfig(){
    const url = this.ics.appConfig.apiurl +'config/getAllConfig';

    this.http.post(url, {}, this.ics.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          let configData = data.configData;
          this.saveData = this.getSaveData();

          if(configData.isUseHotLineNumber == 1){
            this.tempSaveData.isUseHotLineNumber = true;
            this.tempSaveData.hlNumber = configData.hlNumber;
            this.saveData.isUseHotLineNumber = configData.isUseHotLineNumber;
            this.saveData.hlNumber = configData.hlNumber;
          }

          if(configData.isUseGPSLimitation == 1){
            this.tempSaveData.isUseGPSLimitation = true;
            this.tempSaveData.gpsRange = configData.gpsRange;
            this.saveData.isUseGPSLimitation = configData.isUseGPSLimitation;
            this.saveData.gpsRange = configData.gpsRange;
          }

          if(configData.isUseEstimatedDeliDay == 1){
            this.tempSaveData.isUseEstimatedDeliDay = true;
            this.tempSaveData.estimatedDeliDay = configData.estimatedDeliDay;
            this.saveData.isUseEstimatedDeliDay = configData.isUseEstimatedDeliDay;
            this.saveData.estimatedDeliDay = configData.estimatedDeliDay;
          }

          if(configData.isUseEmptyBottle == 1){
            this.tempSaveData.isUseEmptyBottle = true;
            this.saveData.isUseEmptyBottle = configData.isUseEmptyBottle;
          }
          if(configData.isUseSAP == 1){
            this.tempSaveData.isUseSAP = true;
            this.saveData.isUseSAP = configData.isUseSAP;
          }
          if(configData.isUseOrgName == 1){
            this.tempSaveData.isUseOrgName = true;
            this.tempSaveData.orgName = configData.orgName;
            this.saveData.isUseOrgName = configData.isUseOrgName;
            this.saveData.orgName = configData.orgName;
          }
          if(configData.isUseTaxDesc == 1){
            this.tempSaveData.isUseTaxDesc = true;
            this.tempSaveData.taxDesc = configData.taxDesc;
            this.saveData.isUseTaxDesc = configData.isUseOrgName;
            this.saveData.taxDesc = configData.taxDesc;
          }
          if(configData.isUseBackDate == 1){
            this.tempSaveData.isUseBackDate = true;
            this.tempSaveData.startBackDate = this.ics.dateFormatCorrector(this.ics.dateFormatter.DBtoDTP, configData.startBackDate);
            this.tempSaveData.endBackDate = this.ics.dateFormatCorrector(this.ics.dateFormatter.DBtoDTP, configData.endBackDate);
            this.saveData.isUseBackDate = configData.isUseBackDate;
            this.saveData.startBackDate = configData.startBackDate;
            this.saveData.endBackDate = configData.endBackDate;
          }
          if(configData.isUseTaxPercent == 1){
            this.tempSaveData.isUseTaxPercent = true;
            this.tempSaveData.taxPercent = configData.taxPercent;
            this.saveData.isUseTaxPercent = configData.isUseTaxPercent;
            this.saveData.taxPercent = configData.taxPercent;
          }
          if(configData.isUseTaxExclusiveSKU == 1){
            this.tempSaveData.isUseTaxExclusiveSKU = true;
          }
          if(configData.isUseDisplayDeciPlace == 1){
            this.tempSaveData.isUseDisplayDeciPlace = true;
            this.tempSaveData.displayDeciPlace = configData.displayDeciPlace;
            this.saveData.isUseDisplayDeciPlace = configData.isUseDisplayDeciPlace;
            this.saveData.displayDeciPlace = configData.displayDeciPlace;
          }
          if(configData.isUseCalcDeciPlace == 1){
            this.tempSaveData.isUseCalcDeciPlace = true;
            this.tempSaveData.calcDeciPlace = configData.calcDeciPlace;
            this.saveData.isUseCalcDeciPlace = configData.isUseCalcDeciPlace;
            this.saveData.calcDeciPlace = configData.calcDeciPlace;
          }
          if(configData.isUseCameraSetting == 1){
            this.tempSaveData.isUseCameraSetting = true;  
            $('#camerasetting').attr('disabled', false);
            $('#galsetting').attr('disabled', false);          
            this.saveData.isUseCameraSetting = configData.isUseCameraSetting;           
            if(configData.isUseCamera == 1)
            {
              this.tempSaveData.isUseCamera = true;
              this.saveData.isUseCamera = "1";
            }
            if(configData.isUseGallery == 1)
            {
              this.tempSaveData.isUseGallery = true;
              this.saveData.isUseGallery = "1";
            }
          }else
          {
            $('#camerasetting').attr('disabled', true);
            $('#galsetting').attr('disabled', true);
          }
        }
      }
    );
  }

  validationBeforeUpdate(){
    if(this.saveData.isUseGPSLimitation == "1" && 
      (this.saveData.gpsRange == null || this.saveData.gpsRange == "" || this.saveData.gpsRange == "0")){
        this.ics.showToast(this.toastCtrl, "Message", "Add GPS Limit", 1000);
        return false;
    }

    if(this.saveData.isUseEstimatedDeliDay == "1" && 
      (this.saveData.estimatedDeliDay == null || this.saveData.estimatedDeliDay == "" || this.saveData.estimatedDeliDay == "0")){
        this.ics.showToast(this.toastCtrl, "Message", "Add Estimated Delivery Day", 1000);
        return false;
    }

    if(this.saveData.isUseHotLineNumber == "1" && this.saveData.hlNumber == ""){
      this.ics.showToast(this.toastCtrl, "Message", "Add HotLine Number", 1000);
      return false;
    }
    if(this.saveData.isUseOrgName == "1" && this.saveData.orgName == ""){
      this.ics.showToast(this.toastCtrl, "Message", "Add Company Name", 1000);
      return false;
    }
    if(this.saveData.isUseTaxPercent == "1" && this.saveData.taxPercent == ""){
      this.ics.showToast(this.toastCtrl, "Message", "Add Tax Percent", 1000);
      return false;
    }
    if(this.saveData.isUseDisplayDeciPlace == "1" && this.saveData.displayDeciPlace == null){
      this.ics.showToast(this.toastCtrl, "Message", "Add Display Decimal Place", 1000);
      return false;
    }
    if(this.saveData.isUseCalcDeciPlace == "1" && this.saveData.calcDeciPlace == null){
      this.ics.showToast(this.toastCtrl, "Message", "Add Calculation Decimal Place", 1000);
      return false;
    }
    if(this.saveData.isUseCameraSetting == "1" && (this.saveData.isUseCamera ==  "0" && this.saveData.isUseGallery ==  "0")){
      this.ics.showToast(this.toastCtrl, "Message", "Choose Camera Setting", 1000);
      return false;
    }

    return true;
  }

  update(){
    const url = this.ics.appConfig.apiurl + 'config/updateConfig';

    this.saveData.isUseGPSLimitation = (this.tempSaveData.isUseGPSLimitation ? 1 : 0).toString();
    this.saveData.isUseEstimatedDeliDay = (this.tempSaveData.isUseEstimatedDeliDay ? 1 : 0).toString();
    this.saveData.isUseHotLineNumber = (this.tempSaveData.isUseHotLineNumber ? 1 : 0).toString();
    this.saveData.isUseEmptyBottle = (this.tempSaveData.isUseEmptyBottle ? 1 : 0).toString();
    this.saveData.hlNumber = this.tempSaveData.hlNumber;
    this.saveData.gpsRange = this.tempSaveData.gpsRange;
    this.saveData.estimatedDeliDay = this.tempSaveData.estimatedDeliDay;
    this.saveData.isUseSAP = (this.tempSaveData.isUseSAP ? 1 : 0).toString();
    this.saveData.isUseOrgName = (this.tempSaveData.isUseOrgName ? 1 : 0).toString();
    this.saveData.orgName = this.tempSaveData.orgName;
    this.saveData.isUseTaxDesc = (this.tempSaveData.isUseTaxDesc ? 1 : 0).toString();
    this.saveData.taxDesc = this.tempSaveData.taxDesc;
    this.saveData.isUseBackDate = (this.tempSaveData.isUseBackDate ? 1 : 0).toString();
    this.saveData.startBackDate = this.ics.dateFormatCorrector(this.ics.dateFormatter.DTPtoDB, this.tempSaveData.startBackDate).toString();
    this.saveData.endBackDate = this.ics.dateFormatCorrector(this.ics.dateFormatter.DTPtoDB, this.tempSaveData.endBackDate).toString();
    this.saveData.taxPercent = this.tempSaveData.taxPercent;
    this.saveData.isUseTaxPercent = (this.tempSaveData.isUseTaxPercent ? 1 : 0).toString();
    this.saveData.isUseTaxExclusiveSKU = (this.tempSaveData.isUseTaxExclusiveSKU ? 1 : 0).toString();
    this.saveData.isUseDisplayDeciPlace = (this.tempSaveData.isUseDisplayDeciPlace ? 1 : 0).toString();
    this.saveData.displayDeciPlace = this.tempSaveData.displayDeciPlace;
    this.saveData.isUseCalcDeciPlace = (this.tempSaveData.isUseCalcDeciPlace ? 1 : 0).toString();
    this.saveData.calcDeciPlace = this.tempSaveData.calcDeciPlace;
    this.saveData.isUseCameraSetting = (this.tempSaveData.isUseCameraSetting ? 1 : 0).toString();
    this.saveData.isUseCamera = (this.tempSaveData.isUseCamera ? 1 : 0).toString();
    this.saveData.isUseGallery = (this.tempSaveData.isUseGallery ? 1 : 0).toString();
    if(this.tempSaveData.isUseTaxExclusiveSKU)
    {
      this.prepareTaxExcSKU();
      this.saveData.taxExclusiveSKU = this._taxExclusiveSKU;
    }

    if(this.validationBeforeUpdate()){
      this.loadCtrl.create({
        message: "Saving...",
       
        backdropDismiss: false
      }).then(
        el => {
          el.present();

          this.http.post(url, this.saveData, this.ics.getOptions()).subscribe(
            (data:any) =>{
              el.dismiss();

              if(data.message == "SUCCESS"){
                this.getAllConfig();
                this.ics.showToast(this.toastCtrl, "Message", "Save Successful", 1000);
              } else {
                this.ics.showToast(this.toastCtrl, "Message", "Save Failed", 1000);
              }
            }
          );
        }
      );
    }
  }

  getSaveData(){
    return {
      "hlNumber": "",
      "isUseHotLineNumber": "",
      "gpsRange": "0",
      "isUseGPSLimitation": "",
      "isUseEmptyBottle": "",
      "isUseEstimatedDeliDay": "",
      "estimatedDeliDay": "0",
      "isUseSAP": "",
      "orgName": "",
      "isUseOrgName": "",
      "startBackDate": this.today,
      "endBackDate": this.today,
      "isUseBackDate": "",
      "isUseTaxDesc": "",
      "taxDesc": "",
      "isUseTaxPercent": "",
      "taxPercent": "0",
      "isUseTaxExclusiveSKU": "",
      "taxExclusiveSKU": [],
      "isUseDisplayDeciPlace": "",
      "displayDeciPlace": "0",
      "isUseCalcDeciPlace": "",
      "calcDeciPlace": "0",
      "isUseCameraSetting": "",
      "isUseCamera": "",
      "isUseGallery": "",
    }
  }

  getTempSaveData(){
    return {
      "hlNumber": "",
      "isUseHotLineNumber": false,
      "gpsRange": "0",
      "isUseGPSLimitation": false,
      "isUseEmptyBottle": false,
      "estimatedDeliDay": "0",
      "isUseEstimatedDeliDay": false,
      "isUseSAP": false,
      "orgName": "",
      "isUseOrgName": false,
      "startBackDate": this.today,
      "endBackDate": this.today,
      "isUseBackDate": false,
      "isUseTaxDesc": false,
      "taxDesc": "",
      "isUseTaxPercent": false,
      "taxPercent": "0",
      "isUseTaxExclusiveSKU": false,
      "isUseDisplayDeciPlace": false,
      "displayDeciPlace": "0",
      "isUseCalcDeciPlace": false,
      "calcDeciPlace": "0",
      "isUseCameraSetting": false,
      "isUseCamera": false,
      "isUseGallery": false,
    }
  }
  forjsondata1() {
    return {
      "SKU_CODE": "",
      "SKU_NAME": ""
    };
  }

  forjsondata2() {
    return {
      uploadData: [
        {
          "SKU_CODE": "",
          "SKU_NAME": ""
        }
      ]
    };
  }

  resetValue() {

  }

  onUpload(event) {
    if(event.target.files.length)
    {
      this._taxExclusiveSKU = [];  
      this.each_sheet_data = this.forjsondata1();
      this.all_sheet_data = this.forjsondata2();
      let excelFileName = event.target.files[0].name;
      let pos = excelFileName.indexOf(".");
      this.uploadedFileName = excelFileName.substring(0, pos);
      this.uploadFile = event.target.files[0];
  
      let reader = new FileReader();
      reader.readAsArrayBuffer(this.uploadFile);
      reader.onload = (event: any) => {
        let data = new Uint8Array(event.target.result);
        let workbook = XLSX.read(data, { type: "array" });
  
        for (let k = 0; k < workbook.SheetNames.length; k++) {
          let first_sheet_name = workbook.SheetNames[k];
          let worksheet = workbook.Sheets[first_sheet_name];
          this.each_sheet_data = XLSX.utils.sheet_to_json(worksheet, {
            raw: true
          });
  
          for (let i = 0; i < this.each_sheet_data.length; i++) {
            // this.each_sheet_data[i].shop_id="+this.each_sheet_data[i].shop_id;
            // this.each_sheet_data[i].shop_id = ('' + this.each_sheet_data[i].shop_id).replace(/\s/g, '');
  
            this.all_sheet_data.uploadData.push(this.each_sheet_data[i]);
          }
        }
  
        this.all_sheet_data.uploadData.splice(0, 1);
      };
    }else
    {
      this.uploadedFileName = "";
    } 
  }
  prepareTaxExcSKU(){
    if(this.uploadedFileName != "" && this.uploadedFileName != null) {
      this._taxExclusiveSKU.splice(0,this._taxExclusiveSKU.length);
      
      for(let i=0; i < this.all_sheet_data.uploadData.length; i++) {
        this._taxExclusiveSKU.push(this.all_sheet_data.uploadData[i]); 
      }
    }else{
      this._taxExclusiveSKU = [];
    }
  }
  async getTaxExcStockData()
  {
    const loading = await this.loadCtrl.create({
      cssClass: 'custom-class custom-loading', //my-custom-class
      message: 'Please wait...'
    });

    await loading.present();
    const url = this.ics.appConfig.apiurl+ 'config/getTaxExcSKU';
    return new Promise<void>(
      (res, rej) => {
        this.http.get(url, this.ics.getOptions()).subscribe((data: any) => {
            loading.dismiss();
            this._getTaxExcStockData = data.dataList;
            res();
          }, error => {
            loading.dismiss();
            rej();
          }
        );
      }
    );
  }
  downloadFile(){

    let data1 = this._getTaxExcStockData;
    let excelHeaderData = [
      "SKU_CODE",
      "SKU_NAME"
    ];
    let excelDataList: any = [];

    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Tax_Exclusive_SKU');

    for (var exCount = 0; exCount < data1.length; exCount++) {
      let excelData: any = [];

      excelData.push(data1[exCount].skuCode);
      excelData.push(data1[exCount].skuName);

      excelDataList.push(excelData);
    }

    let headerRow = worksheet.addRow(excelHeaderData);
    headerRow.font = { bold: true };
    for (var i_data = 0; i_data < excelDataList.length; i_data++) {
      worksheet.addRow(excelDataList[i_data]);
    }

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: EXCEL_TYPE });
      FileSaver.saveAs(blob, "TaxExclusiveSKU" + EXCEL_EXTENSION);
    });
  }
  async exportTaxExcSKUFile()
  {
    await this.getTaxExcStockData();
    this.downloadFile();
  }
 
}

