import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { FormControl } from '@angular/forms';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $: any;

@Component({
  selector: 'app-invoice-discount',
  templateUrl: './invoice-discount.page.html',
  styleUrls: ['./invoice-discount.page.scss'],
})
export class InvoiceDiscountPage implements OnInit {
  @ViewChild('chosefile', {static: false}) myInputVariable: ElementRef;

  config =  {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  config1 =  {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };

  spinner: boolean = false;
  searchtab: boolean = false;
  btn: any = false;
  dtlFlag: any = false;

  criteria: any = this.getCriteriaData();
  searchCriteria: any = this.getCriteriaData();

  disTypeList: any = [];
  saveData: any = this.getSaveData();

  tempSaveData: any = this.getSaveData();
  // tempSearch: any = {
  //   "shopDesc": "",
  //   "townshipDesc": ""
  // };
  tempSearch: any = this.getShopListPageChangeData();
  tempSearchCri: any = this.getShopListPageChangeData();

  shopDataList: any = [];
  townList: any = [];

  disCodeList: any = [];
  disDescList: any = [];
  disPercentList: any = [];
  shopDescList: any = [];

  disCodeSearch: FormControl = new FormControl();
  disDescSearch: FormControl = new FormControl();
  // disPercentSearch: FormControl = new FormControl();
  shopDescSearch: FormControl = new FormControl();
  giftSearch: FormControl = new FormControl();
  couponSearch: FormControl = new FormControl();

  giftList: any = [];
  couponList: any = [];

  saveDataDates: any = {
    "fromDate": "",
    "toDate": ""
  }

  dropdown:boolean = false;

  brandOwnerList: any = [];
  // tempBOtempData: any = this.getTempBOtempData();
  detailDataList = this.getInvDisDtlDataList();
  updateIndex: any = -1;
  tempShopList: any = [];

  brandOwnerList1: any = [];
  disItemList: any = [];
  brandOwnerSearch: FormControl = new FormControl();
  disItemSearch: FormControl = new FormControl();

  getGiftDataList: any = [];
  inkindEditFlag: any = false;

  tempE: any = {
    "currentTarget": {
      "checked": false
    }
  };
  shopListItemPerPage = 20;
  tsLoadingFlag: any = false;
  importload: any;
  value: any;
  shopListFromExcel: any = [];
  each_sheet_data: any = this.forjsondata1();
  all_sheet_data: any = this.forjsondata2();
  uploadedFileName: string = "";
  uploadFile: File;
  selectedFile: File;
  _shoplistdata: any = [];

  constructor(
    private http: HttpClient,
    private manager: ControllerService,
    public alertController: AlertController,
    public tostCtrl: ToastController,
    public loading: LoadingController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    $("#invoiceDisNew").hide();
    $("#invoiceDisList").show();
    $("#invoiceDisList-tab").tab("show");
    $('#invSaveDisCode').css('border-color', '');
    this.disItemSearch.disable();

    this.btn = false;
    this.dtlFlag = false;

    this.manager.isLoginUser();

    this.clearProperties();
    this.runSpinner(true);
    this.allList();
    this.runSpinner(false);
    this.getAllDataList();
  }

  discountTypeListTab(){
    $('#invoiceDisNew').hide();
    $('#invoiceDisList').show();
    this.clearProperties();
    this.getAllDataList();
  }

  discountTypeNewTab(){
    $('#invoiceDisList').hide();
    $('#invoiceDisNew').show();
    $('#invDisHdr-tab').tab('show');
    $('#invDisHdr').show();
    $('#invDisShopJuncList').hide();
    $('#invDisDtlList').hide();
    $('#invDiscountItem0').show();
    $('#invDiscountItem1').hide();
    $('#invDiscountItem2').hide();
    $('#invSaveDisCode').css('border-color', '');

    this.btn = true;
    this.dtlFlag = false;
    this.config1.currentPage = 1;
    this.clearProperties();
    this.allList();

    // this.getAllShopByTown();
    this.searchTownship();
  }

  hdrListTab(){
    $('#invDisDtlList').hide();
    $('#invDisShopJuncList').hide();
    $('#invDisHdr').show();
  }

  dtlListTab(){
    $('#invDisHdr').hide();
    $('#invDisShopJuncList').hide();
    $('#invDisDtlList').show();
  }

  shopJuncTab(){
    $('#invDisHdr').hide();
    $('#invDisDtlList').hide();
    $('#invDisShopJuncList').show();
  }

  advanceSearch(option) {
    this.searchtab = option;
  }

  runSpinner(t: boolean) {
    this.spinner = t;
  }

  focusFunction() {
    $('#invSaveDisCode').css('border-color', '');
  }

  refresh(){
    this.ionViewWillEnter();
  }

  dateChange1(event){
    if(this.criteria.toDate != "" || this.criteria.toDate != undefined){
      let tempFromDate = new Date(event.target.value);
      let tempToDate = new Date(this.criteria.toDate);

      tempFromDate.setHours(0, 0, 0, 0);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.manager.showToast(this.tostCtrl, "Message", "From Date must be sooner than To Date", 5000);
        this.criteria.fromDate = "";
        this.criteria.toDate = "";
      }
    }
  }

  dateChange2(event){
    if(this.criteria.fromDate == "" || this.criteria.fromDate == undefined){
      this.criteria.toDate = "";
      // $("#tDate").val("").trigger("change");
      event.target.value = "";
      this.manager.showToast(this.tostCtrl, "Message", "Add From Date First", 2000);
    } else {
      let tempFromDate = new Date(this.criteria.fromDate);
      let tempToDate = new Date(event.target.value);

      tempFromDate.setHours(0, 0, 0, 0);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.criteria.toDate = "";
        // $("#tDate").val("").trigger("change");
        event.target.value = "";
        this.manager.showToast(this.tostCtrl, "Message", "To Date must be later than From Date", 3000);
      }
    }
  }

  dateChange3(event){
    let tempFromDate = new Date(event.target.value);
    let tempTodayDate = new Date();

    tempFromDate.setHours(0, 0, 0, 0);
    tempTodayDate.setHours(0, 0, 0, 0);

    if (+tempTodayDate > +tempFromDate) {
      this.manager.showToast(this.tostCtrl, "Message", "From Date must not be sooner than Today Date", 5000);
      this.saveDataDates.fromDate = "";
      event.target.value = "";
    } else if(this.saveDataDates.toDate != "" || this.saveDataDates.toDate != undefined){
      let tempToDate = new Date(this.saveDataDates.toDate);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.manager.showToast(this.tostCtrl, "Message", "From Date must be sooner than To Date", 5000);
        this.saveDataDates.fromDate = "";
        this.saveDataDates.toDate = "";
      }
    }
  }

  dateChange4(event){
    if(this.saveDataDates.fromDate == "" || this.saveDataDates.fromDate == undefined){
      this.saveDataDates.toDate = "";
      event.target.value = "";
      this.manager.showToast(this.tostCtrl, "Message", "Add From Date First", 2000);
    } else {
      let tempFromDate = new Date(this.saveDataDates.fromDate);
      let tempToDate = new Date(event.target.value);

      tempFromDate.setHours(0, 0, 0, 0);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.saveDataDates.toDate = "";
        event.target.value = "";
        this.manager.showToast(this.tostCtrl, "Message", "To Date must be later than From Date", 3000);
      }
    }
  }

  dateChange5(event){
    if(this.criteria.endDate != "" || this.criteria.endDate != undefined){
      let tempFromDate = new Date(event.target.value);
      let tempToDate = new Date(this.criteria.endDate);

      tempFromDate.setHours(0, 0, 0, 0);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.manager.showToast(this.tostCtrl, "Message", "From Date must be sooner than To Date", 5000);
        this.criteria.startDate = "";
        this.criteria.endDate = "";
      }
    }
  }

  dateChange6(event){
    if(this.criteria.startDate == "" || this.criteria.startDate == undefined){
      this.criteria.endDate = "";
      event.target.value = "";
      this.manager.showToast(this.tostCtrl, "Message", "Add From Date First", 2000);
    } else {
      let tempFromDate = new Date(this.criteria.startDate);
      let tempToDate = new Date(event.target.value);

      tempFromDate.setHours(0, 0, 0, 0);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.criteria.endDate = "";
        event.target.value = "";
        this.manager.showToast(this.tostCtrl, "Message", "To Date must be later than From Date", 3000);
      }
    }
  }

  dblClickFunc1(){
    this.criteria.fromDate = "";
    this.criteria.toDate = "";
  }

  dblClickFunc2(){
    this.criteria.toDate = "";
  }

  dblClickFunc3(){
    this.saveDataDates.fromDate = "";
    this.saveDataDates.toDate = "";
  }

  dblClickFunc4(){
    this.saveDataDates.toDate = "";
  }

  dblClickFunc5(){
    this.criteria.startDate = "";
    this.criteria.endDate = "";
  }

  dblClickFunc6(){
    this.criteria.endDate = "";
  }

  /*
  decimalDisable(e){
    if(e.key == "."){
      this.detailDataList.n5 = this.detailDataList.n5.substring(0, this.detailDataList.n5.length - 1);
      this.manager.showToast(this.tostCtrl, "Message", "Only Integer Allowed", 1000);
    }
  }
  */

  validateDisPercent(e){
    let key = e.key;
    var rgx = /^[0-9]*\.?[0-9]*$/;
    let result = key.match(rgx);

    if(result == null){// && key != "Backspace" && key != "Delete"){
      this.manager.showToast(this.tostCtrl, "Message", "Can only type numbers(0-9) and dot(.)", 1000);
      return false;
    }

    return true;
  }

  disTypeChange(){
    this.detailDataList.n4 = "";
    this.detailDataList.n5 = "";
    this.detailDataList.n8 = "";
    this.detailDataList.t2 = "";
    this.detailDataList.n6 = "";
    this.detailDataList.n7 = "";

    if(this.getGiftDataList.length > 0){
      this.ChangeGiftorPrice();
    }

    $('#invDiscountItem0').show();
    $('#invDiscountItem1').hide();
    $('#invDiscountItem2').hide();
  }

  ChangeGiftorPrice(){
    if(this.detailDataList.n3=="1"){
      this.getGiftDataList=this.getGiftDataList.filter(
        data=>{
          return data.syskey != "";
        }
      );

      this.getGiftDataList = this.getGiftDataList.map(
        data=>{
          data.rsTemp = data.recordStatus;
          data.recordStatus = "4";
          return data;
        }
      );
    }
    
    else if(this.detailDataList.n3=="2"){
      this.getGiftDataList = this.getGiftDataList.map(
        data=>{
          data.recordStatus = data.rsTemp;
          return data;
        }
      );
    }
  }
  /*
  disItemTypeChange(){
    if(this.detailDataList.n8 == "1"){
      $('#invDiscountItem0').hide();
      $('#invDiscountItem1').show();
      $('#invDiscountItem2').hide();
    } else if(this.detailDataList.n8 == "2"){
      $('#invDiscountItem0').hide();
      $('#invDiscountItem1').hide();
      $('#invDiscountItem2').show();
    } else {
      $('#invDiscountItem0').show();
      $('#invDiscountItem1').hide();
      $('#invDiscountItem2').hide();
    }

    this.detailDataList.t2 = "";
    this.detailDataList.n6 = "";
  }
  */

  discountItemChange(itemType){   //    n6
    let check = false;
    let itemList = [];

    if(itemType == "gift"){
      itemList = this.giftList;
    } else if(itemType == "coupon"){
      itemList = this.couponList;
    }

    if(this.detailDataList.t2 != ""){
      for(let i = 0; i < itemList.length; i++){
        if(itemType == "gift"){
          if(itemList[i].t2.toLowerCase() == this.detailDataList.t2.toLowerCase()
              && itemList[i].t2 != "No Record Found"){

            this.detailDataList.n6 = itemList[i].syskey;
            this.detailDataList.t2 = itemList[i].t2;
            
            check = true;
          }
        } else if(itemType == "coupon"){
          if(itemList[i].t1.toLowerCase() == this.detailDataList.t2.toLowerCase()
              && itemList[i].t1 != "No Record Found"){

            this.detailDataList.n6 = itemList[i].syskey;
            this.detailDataList.t2 = itemList[i].t1;
            
            check = true;
          }
        }
      }
    
      if(check == false){
        this.detailDataList.n6 = "";
      }
    } else {
      this.detailDataList.n6 = "";
    }
  }

  /*
  disTypeStatusChange(e, passData){
    e.stopPropagation();
    const url = this.manager.appConfig.apiurl +'PromoAndDiscount/pmo011StatusChange';

    this.http.post(url, passData, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          if(passData.invDisStatus == "0"){
            passData.invDisStatus = "1";
          } else if(passData.invDisStatus == "1"){
            passData.invDisStatus = "0";
          }

          this.manager.showToast(this.tostCtrl, "Message", "Status changed", 1000);
        } else {
          this.manager.showToast(this.tostCtrl, "Message", "Status didn't change", 1000);
        }
      }
    );
  }
  */

  disTypeStatusChange(detail){
    const param = {
      "invDisStatus": detail.invDisStatus ? "0": "1",
      "invDisSyskey": detail.invDisSyskey
    };

    this.invDisHdrStatusChangeService(param).then( 
      ()=>{
        this.manager.showToast(this.tostCtrl, "Message", "Status changed", 1000);
      }
    ).catch( 
      ()=>{
        detail.n1 = detail.invDisStatus? false : true;
        this.manager.showToast(this.tostCtrl, "Message", "Status didn't change", 1000);
      }
    );
  }

  invDisHdrStatusChangeService(p){
    return new Promise<void>( 
      (done,reject)=>{
        const url = this.manager.appConfig.apiurl +'PromoAndDiscount/pmo011StatusChange';

        this.http.post(url, p, this.manager.getOptions()).subscribe(
          (data:any) =>{
            if(data.message == "SUCCESS"){
              done();
            } else {
              reject();
            }
          },
          error=>{
            reject();
          }
        );
      }
    );
  }

  disTypeJuncStatusChange(e, passData){
    const url = this.manager.appConfig.apiurl +'PromoAndDiscount/pmo010StatusChange';

    this.http.post(url, passData, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          if(passData.n3 == "0"){
            passData.n3 = "1";
          } else if(passData.n3 == "1"){
            passData.n3 = "0";
          }

          this.manager.showToast(this.tostCtrl, "Message", "Status changed", 1000);
        } else {
          this.manager.showToast(this.tostCtrl, "Message", "Status didn't change", 1000);
        }
      }
    );
  }

  juncRecordStatusChange(e, passData){
    if(passData.recordStatus == "1"){
      passData.recordStatus = "4";
    } else if(passData.recordStatus == "4"){
      passData.recordStatus = "1";
    }
  }

  criChange(cri_id){
    if(cri_id == "criInv-disType"){
      this.criteria.disItem = "";
      this.criteria.disPriceType = "";
      this.criteria.disAmt = "";

      if(this.criteria.disType == "2"){
        this.disItemSearch.enable();
      } else {
        this.disItemSearch.disable();
      }
    } else if((cri_id == "criInv-disItem" && this.criteria.disItem == "") || cri_id == "criInv-disPriceType"){
      this.criteria.disAmt = "";
    }
  }

  clear(){
    this.detailDataList = this.getInvDisDtlDataList();
    this.getGiftDataList = [];
    this.updateIndex = -1;
    $("#invDiscountBOcb").val("");

    // $('#invDiscountItem0').show();
    // $('#invDiscountItem1').hide();
    // $('#invDiscountItem2').hide();
  }

  addGiftList(flagValue, viewIndex){
    this.inkindEditFlag = flagValue;

    if(viewIndex >= 0){
      this.getGiftDataList = [];

      for(let i = 0; i < this.saveData.invDisDetailList[viewIndex].getGiftList.length; i++){
        this.getGiftDataList.push(this.commonDataExchange(this.saveData.invDisDetailList[viewIndex].getGiftList[i]));
      }
    }

    $('#addInkindDetailInv').appendTo("body").modal('show');
  }

  modifyGetGiftList(e){
    this.getGiftDataList = [];

    if(e.length > 0){
      for(var i = 0; i < e.length; i++){
  
        this.getGiftDataList.push(this.commonDataExchange(e[i]));
      }
    }

    $('#addInkindDetailInv').modal('toggle');
  }

  addDtlValidation(){
    if(this.detailDataList.n10 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Detail Operator", 2000);
      return false;
    }

    if(this.detailDataList.n11 == "" && this.detailDataList.t3 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Detail Brand Owner", 2000);
      return false;
    }

    if(this.detailDataList.n2 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Detail Revenue 1", 2000);
      return false;
    }

    if(this.detailDataList.n10 == "5"){
      if(this.detailDataList.n9 == ""){
        this.manager.showToast(this.tostCtrl, "Message", "Add Detail Revenue 2", 2000);
        return false;
      }
    }

    if(this.detailDataList.n3 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Detail Dis Type", 2000);
      return false;
    }

    if(this.detailDataList.n3 == "1"){
      if(this.detailDataList.n4 == ""){
        this.manager.showToast(this.tostCtrl, "Message", "Add Detail Dis Price Type", 2000);
        return false;
      }

      if(this.detailDataList.n5 == ""){
        this.manager.showToast(this.tostCtrl, "Message", "Add Detail Percent", 2000);
        return false;
      }

      if(this.detailDataList.n4 == "2"){
        if(Number(this.detailDataList.n5) < 0 || Number(this.detailDataList.n5) > 100){
          this.manager.showToast(this.tostCtrl, "Message", "Not a Valid Percent Amount", 2000);
          return false;
        }
      }

      for(let i = 0; i < this.saveData.invDisDetailList.length; i++){
        if(this.saveData.invDisDetailList[i].n2 == this.detailDataList.n2
            && this.saveData.invDisDetailList[i].n9 == this.detailDataList.n9
            && this.saveData.invDisDetailList[i].n10 == this.detailDataList.n10
            && this.saveData.invDisDetailList[i].n11 == this.detailDataList.n11
            && this.saveData.invDisDetailList[i].t3 == this.detailDataList.t3
            && this.saveData.invDisDetailList[i].n4 == this.detailDataList.n4
            && this.saveData.invDisDetailList[i].n5 == this.detailDataList.n5){

          this.manager.showToast(this.tostCtrl, "Message", "Add Different Promotion Amount", 2000);
          return false;
        }
      }

      this.detailDataList.n7 = "";
    } else {
      /*
      if(this.detailDataList.n8 == ""){
        this.manager.showToast(this.tostCtrl, "Message", "Add Detail Dis Item Type", 2000);
        return false;
      }

      if(this.detailDataList.n6 == "" || this.detailDataList.t2 == ""){
        this.manager.showToast(this.tostCtrl, "Message", "Add Detail Dis Item", 2000);
        return false;
      }

      if(this.detailDataList.n7 == ""){
        this.manager.showToast(this.tostCtrl, "Message", "Add Detail Dis Item Qty", 2000);
        return false;
      }

      for(let i = 0; i < this.saveData.invDisDetailList.length; i++){
        if(this.saveData.invDisDetailList[i].n2 == this.detailDataList.n2
            && this.saveData.invDisDetailList[i].n9 == this.detailDataList.n9
            && this.saveData.invDisDetailList[i].n10 == this.detailDataList.n10
            && this.saveData.invDisDetailList[i].n11 == this.detailDataList.n11
            && this.saveData.invDisDetailList[i].t3 == this.detailDataList.t3
            && this.saveData.invDisDetailList[i].n6 == this.detailDataList.n6
            && this.saveData.invDisDetailList[i].n7 == this.detailDataList.n7
            && this.saveData.invDisDetailList[i].n8 == this.detailDataList.n8){

          this.manager.showToast(this.tostCtrl, "Message", "Add Different Promotion Amount", 2000);
          return false;
        }
      }
      */

      if(this.getGiftDataList.length < 1){
        this.manager.showToast(this.tostCtrl, "Message", "Add Inkind Detail", 2000);
        return false;
      }

      this.detailDataList.n4 = "0";
      this.detailDataList.n5 = "0";
    }

    return true;
  }

  addDtlLine(){
    if(this.addDtlValidation()){
      if(this.updateIndex < 0){
        let tempDtlLine = this.getInvDisDtlDataList();

        tempDtlLine.n6 = "";
        tempDtlLine.n7 = "";
        tempDtlLine.n8 = "";
        tempDtlLine.t2 = "";
  
        tempDtlLine.n1 = this.saveData.syskey;
        tempDtlLine.n2 = this.detailDataList.n2;
        tempDtlLine.n3 = this.detailDataList.n3;
        tempDtlLine.n9 = this.detailDataList.n9;
        tempDtlLine.n10 = this.detailDataList.n10;
        tempDtlLine.n11 = this.detailDataList.n11;

        if(this.detailDataList.n3 == "1"){
          tempDtlLine.n4 = this.detailDataList.n4;
          tempDtlLine.n5 = this.detailDataList.n5;

          tempDtlLine.getGiftList = [];
        } else {
          tempDtlLine.n4 = "";
          tempDtlLine.n5 = "";

          let tempGiftData = this.getGetGiftData();
          for(var v = 0; v < this.getGiftDataList.length; v++){
            tempGiftData = this.getGetGiftData();

            tempGiftData.syskey = "";
            tempGiftData.recordStatus = "1";
            tempGiftData.n1 = this.getGiftDataList[v].n1;
            tempGiftData.n2 = this.getGiftDataList[v].n2;
            tempGiftData.n3 = this.getGiftDataList[v].n3;
            tempGiftData.n4 = this.getGiftDataList[v].n4;
            tempGiftData.n5 = this.getGiftDataList[v].n5;
            tempGiftData.n6 = this.getGiftDataList[v].n6;
            tempGiftData.n7 = this.getGiftDataList[v].n7;
            tempGiftData.t1 = this.getGiftDataList[v].t1;

            tempDtlLine.getGiftList.push(tempGiftData);
          }
        }

        tempDtlLine.t1 = "";
        tempDtlLine.t3 = this.detailDataList.t3;
  
        this.saveData.invDisDetailList.push(tempDtlLine);
      } else {
        this.saveData.invDisDetailList[this.updateIndex].n6 = "";
        this.saveData.invDisDetailList[this.updateIndex].n7 = "";
        this.saveData.invDisDetailList[this.updateIndex].n8 = "";
        this.saveData.invDisDetailList[this.updateIndex].t2 = "";

        this.saveData.invDisDetailList[this.updateIndex].syskey = this.detailDataList.syskey;
        this.saveData.invDisDetailList[this.updateIndex].recordStatus = this.detailDataList.recordStatus;
  
        this.saveData.invDisDetailList[this.updateIndex].n1 = this.detailDataList.n1;
        this.saveData.invDisDetailList[this.updateIndex].n2 = this.detailDataList.n2;
        this.saveData.invDisDetailList[this.updateIndex].n3 = this.detailDataList.n3;
        this.saveData.invDisDetailList[this.updateIndex].n9 = this.detailDataList.n9;
        this.saveData.invDisDetailList[this.updateIndex].n10 = this.detailDataList.n10;
        this.saveData.invDisDetailList[this.updateIndex].n11 = this.detailDataList.n11;

        this.saveData.invDisDetailList[this.updateIndex].getGiftList = [];

        if(this.detailDataList.n3 == "1"){
          this.saveData.invDisDetailList[this.updateIndex].n4 = this.detailDataList.n4;
          this.saveData.invDisDetailList[this.updateIndex].n5 = this.detailDataList.n5;

        } else {
          this.saveData.invDisDetailList[this.updateIndex].n4 = "";
          this.saveData.invDisDetailList[this.updateIndex].n5 = "";
        }
        for(var v = 0; v < this.getGiftDataList.length; v++){
          this.saveData.invDisDetailList[this.updateIndex].getGiftList.push(this.commonDataExchange(this.getGiftDataList[v]));
        }
        this.saveData.invDisDetailList[this.updateIndex].t1 = "";
        this.saveData.invDisDetailList[this.updateIndex].t3 = this.detailDataList.t3;
      }

      this.clear();
    }
  }

  updateDtlLine(event, dtlIndex){
    this.detailDataList.n6 = "";
    this.detailDataList.n7 = "";
    this.detailDataList.n8 = "";
    this.detailDataList.t2 = "";

    this.detailDataList.syskey = this.saveData.invDisDetailList[dtlIndex].syskey;
    this.detailDataList.recordStatus = this.saveData.invDisDetailList[dtlIndex].recordStatus;

    this.detailDataList.n1 = this.saveData.invDisDetailList[dtlIndex].n1;
    this.detailDataList.n2 = this.saveData.invDisDetailList[dtlIndex].n2;
    this.detailDataList.n3 = this.saveData.invDisDetailList[dtlIndex].n3;
    this.detailDataList.n9 = this.saveData.invDisDetailList[dtlIndex].n9;
    this.detailDataList.n10 = this.saveData.invDisDetailList[dtlIndex].n10;
    this.detailDataList.n11 = this.saveData.invDisDetailList[dtlIndex].n11;

    this.getGiftDataList = [];

    if(this.detailDataList.n3 == "1"){
      this.detailDataList.n4 = this.saveData.invDisDetailList[dtlIndex].n4;
      this.detailDataList.n5 = this.saveData.invDisDetailList[dtlIndex].n5;
    } else {
      this.detailDataList.n4 = "";
      this.detailDataList.n5 = "";

      for(var v = 0; v < this.saveData.invDisDetailList[dtlIndex].getGiftList.length; v++){
        this.getGiftDataList.push(this.commonDataExchange(this.saveData.invDisDetailList[dtlIndex].getGiftList[v]));
      }
    }

    this.detailDataList.t1 = "";
    this.detailDataList.t3 = this.saveData.invDisDetailList[dtlIndex].t3;

    $("#invDiscountBOcb").val(this.detailDataList.n11);

    this.updateIndex = dtlIndex;

    /*
    if(this.detailDataList.n3 == "2"){
      if(this.detailDataList.n8 == "1"){
        $('#invDiscountItem0').hide();
        $('#invDiscountItem1').show();
        $('#invDiscountItem2').hide();
      } else if(this.detailDataList.n8 == "2"){
        $('#invDiscountItem0').hide();
        $('#invDiscountItem1').hide();
        $('#invDiscountItem2').show();
      } else {
        $('#invDiscountItem0').show();
        $('#invDiscountItem1').hide();
        $('#invDiscountItem2').hide();
      }
    } else {
      $('#invDiscountItem0').show();
      $('#invDiscountItem1').hide();
      $('#invDiscountItem2').hide();
    }
    */
  }

  deleteDtlLine(event, dtlIndex){
    if(this.saveData.invDisDetailList[dtlIndex].syskey != ""){
      if(this.saveData.invDisDetailList[dtlIndex].recordStatus == "1"){
        this.saveData.invDisDetailList[dtlIndex].recordStatus = "4";
      } else if(this.saveData.invDisDetailList[dtlIndex].recordStatus == "4"){
        this.saveData.invDisDetailList[dtlIndex].recordStatus = "1";
      }
    } else {
      this.saveData.invDisDetailList.splice(dtlIndex, 1);
    }
  }

  /*
  getAllShopByTown(){
    const url = this.manager.appConfig.apiurl +'shop/getAllShopByTown';

    this.http.post(url, this.saveData, this.manager.getOptions()).subscribe(
      (data:any) =>{
        
        if(data.message == "SUCCESS"){
          this.townList = data.dataList;
          this.townList.sort((a, b) => (a.TownDesc > b.TownDesc) ? 1 : -1);

          for(let i = 0; i < this.townList.length; i++){
            this.townList[i].ShopDataList.sort((a, b) => (a.shopName > b.shopName) ? 1 : -1);
          }
        }
      }
    );
  }

  searchShop(){
    const url = this.manager.appConfig.apiurl +'shop/getAllShopByTown';

    this.http.post(url, this.tempSearch, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.townList = data.dataList;
          this.townList.sort((a, b) => (a.TownDesc > b.TownDesc) ? 1 : -1);

          for(let i = 0; i < this.townList.length; i++){
            this.townList[i].ShopDataList.sort((a, b) => (a.shopName > b.shopName) ? 1 : -1);
          }
        }
      }
    );
  }
  */

  searchTownship(){
    this.tsLoadingFlag = true;
    const url = this.manager.appConfig.apiurl +'township/getAllTownshipForDis';

    this.tempSearchCri.shopDesc = this.tempSearch.shopDesc;
    this.tempSearchCri.townDesc = this.tempSearch.townDesc;

    this.http.post(url, this.tempSearchCri, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.townList = data.dataList;
          this.townList.sort((a, b) => (a.TownDesc > b.TownDesc) ? 1 : -1);

          this.townList.map(
            data => {
              data.shopSearchFlag = false;
              data.shopListConfig = {
                itemsPerPage: this.shopListItemPerPage,
                currentPage: 1,
                totalItems: 0,
                id: data.TownSyskey.toString(),
                panelExpanded: false
              };
            }
          );
        }
        this.tsLoadingFlag = false;
      }
    );
  }

  openPanel(tsList){
    if(!tsList.shopSearchFlag){
      this.searchShop("0", 1, tsList.TownSyskey);
      tsList.shopSearchFlag = true;
    }
  }

  searchShop(curIndex, curPage, tsSyskey){    //    if curPage > 0, it's called from shopListPageChange
    this.tempSearchCri.current = curIndex;

    if(curPage > 0){
      const url = this.manager.appConfig.apiurl +'shop/getAllShopByTownSK';
      this.tempSearchCri.townshipSyskey = tsSyskey;

      this.http.post(url, this.tempSearchCri, this.manager.getOptions()).subscribe(
        (data:any) =>{
          if(data.message == "SUCCESS"){
            // let configId = "";

            /*    replace with Map
            for(let i = 0; i < this.townList.length; i++){
              if(this.townList[i].TownSyskey == tsSyskey){
                this.townList[i].ShopDataList = data.dataList;
                this.townList[i].ShopDataList.sort((a, b) => (a.shopName > b.shopName) ? 1 : -1);
                this.townList[i].ShopDataList.map(
                  data => {
                    data.checkFlag = false;
                  }
                );

                // configId = "shopConfig" + i;
                this.townList[i].shopListConfig = {
                  itemsPerPage: this.shopListItemPerPage,
                  currentPage: curPage,
                  totalItems: data.Count,
                  id: this.townList[i].TownSyskey.toString(), //  configId
                  panelExpanded: false
                };

                this.checkedSelectedShop(true, this.townList[i].ShopDataList);
              }
            }
            */

            this.townList.map(
              tlData => {
                if(tlData.TownSyskey == tsSyskey){
                  tlData.ShopDataList = data.dataList;
                  tlData.ShopDataList.sort((a, b) => (a.shopName > b.shopName) ? 1 : -1);
                  tlData.ShopDataList.map(
                    data => {
                      data.checkFlag = false;
                    }
                  );
  
                  // configId = "shopConfig" + i;
                  tlData.shopListConfig = {
                    itemsPerPage: this.shopListItemPerPage,
                    currentPage: curPage,
                    totalItems: data.Count,
                    id: tlData.TownSyskey.toString(), //  configId
                    panelExpanded: false
                  };
  
                  this.checkedSelectedShop(true, tlData.ShopDataList);
                }
              }
            );
          }
        }
      );
    } else {
      const url = this.manager.appConfig.apiurl +'shop/getAllShopByTown';
      this.tempSearchCri.shopDesc = this.tempSearch.shopDesc;
      this.tempSearchCri.townDesc = this.tempSearch.townDesc;
      this.tempSearchCri.townshipSyskey = "";

      this.http.post(url, this.tempSearchCri, this.manager.getOptions()).subscribe(
        (data:any) =>{
          if(data.message == "SUCCESS"){
            // let configId = "";
            this.townList = data.dataList;
            this.townList.sort((a, b) => (a.TownDesc > b.TownDesc) ? 1 : -1);

            for(let i = 0; i < this.townList.length; i++){
              this.townList[i].ShopDataList.sort((a, b) => (a.shopName > b.shopName) ? 1 : -1);
              this.townList[i].ShopDataList.map(
                data => {
                  data.checkFlag = false;
                }
              );

              // configId = "shopConfig" + i;
              this.townList[i].shopListConfig = {
                itemsPerPage: this.shopListItemPerPage,
                currentPage: 1,
                totalItems: this.townList[i].Count,
                id: this.townList[i].TownSyskey.toString(), //  configId
                panelExpanded: false
              };

              this.checkedSelectedShop(false, this.townList[i].ShopDataList);
            }
          }
        }
      );
    }
  }

  checkedSelectedShop(pageChangeFlag, passShopList){
    for(let i = 0; i < passShopList.length; i++){
      this.tempSaveData.promoAndDisJunDataList.map(
        data => {
          if(data.n1 == passShopList[i].shopSysKey){
            passShopList[i].checkFlag = true;
          }
        }
      );
    }
  }

  searchAppliedShop(e){
    let searchValue = e.target.value.toString().toLowerCase();
    this.config1.currentPage = 1;

    this.searchAppliedShop1(searchValue);
  }

  searchAppliedShop1(searchValue){
    // this.tempShopList = this.saveData.promoAndDisJunDataList.filter(
      this.tempShopList = this.saveData.volDisShopJuncDataList.filter(
      shopList => {
        return shopList.t1.toLowerCase().includes(searchValue);
      }
    );
  }

  boChange(e){
    let value = e.target.value;
    this.detailDataList.n11 = "";
    this.detailDataList.t3 = "";
    // this.tempBOtempData = this.getTempBOtempData();
    
    for(let i = 0; i < this.brandOwnerList.length; i++){
      if(this.brandOwnerList[i].syskey == value){
        this.detailDataList.n11 = this.brandOwnerList[i].syskey;
        this.detailDataList.t3 = this.brandOwnerList[i].t2;

        break;
      }
    }
  }

  selectTown(e, tsSyskey){  //  tsSyskey = tsIndex
    const url = this.manager.appConfig.apiurl +'shop/getAllShopByTownSK';
    let param = {
      "townshipSyskey": tsSyskey.toString(),
      "TownSyskey": tsSyskey.toString(),
      "shopDesc": this.tempSearch.shopDesc.toString()
    };
    let tempFlag = e.currentTarget.checked;

    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          let shopList = data.dataList;
          let sameShopCheck = false;
          this.tempE.currentTarget.checked = tempFlag;

          if(this.tempE.currentTarget.checked){
            for(let i = 0; i < shopList.length; i++){
              // sameShopCheck = this.tempSaveData.promoAndDisJunDataList.some( //-
              //   tempShopData => tempShopData.n1 == shopList[i].shopSysKey
              // );
              sameShopCheck = this.saveData.volDisShopJuncDataList.some(
                tempShopData => tempShopData.n1 == shopList[i].shopSysKey
              );

              if(sameShopCheck == false){
                this.selectShop(this.tempE, param, shopList[i], true);
              }
            }
          } else {
            for(let i = 0; i < shopList.length; i++){
              this.selectShop(this.tempE, param, shopList[i], true);
            }
          }
        }
      }
    );
  }

  selectShop(e, townshipData, storeData, allFlag){  //  townshipData = tsIndex, storeData = shopIndex
    let returnTempData = this.getPromoAndDisJunDataList();
    let found = false;
    // let cbid = "";

    if(e.currentTarget.checked){
      for(let i = 0; i < this.saveData.volDisShopJuncDataList.length; i++){  //-
        if(this.saveData.volDisShopJuncDataList[i].n1 == storeData.shopSysKey){
          found = true;
          break;
        }
      }
  
      if(found == false){
        returnTempData.syskey = "";
        returnTempData.n1 = storeData.shopSysKey;  //  this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey;
        returnTempData.n3 = "1";
        returnTempData.n4 = "";
        returnTempData.t1 = storeData.shopName;  //  this.townList[tsIndex].ShopDataList[shopIndex].shopName;
        returnTempData.t3 = "";
        returnTempData.recordStatus = "1";
        returnTempData.townSyskey = townshipData.TownSyskey;  //  this.townList[tsIndex].TownSyskey;
        returnTempData.shopCode = storeData.shopCode;  //  this.townList[tsIndex].ShopDataList[shopIndex].shopCode;
        returnTempData.address = storeData.address;  // this.townList[tsIndex].ShopDataList[shopIndex].address;
  
        this.tempSaveData.promoAndDisJunDataList.push(returnTempData);
  
        if(allFlag){
          this.townList.map(
            data => {
              if(data.TownSyskey == townshipData.TownSyskey){
                data.ShopDataList.map(
                  shopdata => {
                    if(shopdata.shopSysKey == storeData.shopSysKey){
                      shopdata.checkFlag = true;
                    }
                  }
                );
              }
            }
          );
        }
      } else {
        if(!allFlag){
          let cbid = "#" + storeData.shopSysKey + "";
          $(cbid).prop('checked', false);

          this.manager.showToast(this.tostCtrl, "Message", "Already Added", 2000);
        }
      }
    } else {
      for(let i = 0; i < this.tempSaveData.promoAndDisJunDataList.length; i++){
        if(this.tempSaveData.promoAndDisJunDataList[i].n1 == storeData.shopSysKey){
          if(allFlag){
            this.townList.map(
              data => {
                if(data.TownSyskey == townshipData.TownSyskey){
                  data.ShopDataList.map(
                    shopdata => {
                      shopdata.checkFlag = false;
                    }
                  );
                }
              }
            );
          }

          this.tempSaveData.promoAndDisJunDataList.splice(i, 1);
          break;
        }
      }
    }
  }

  addShop(){
    let cbid = "";

    if(this.tempSaveData.promoAndDisJunDataList.length > 0){ // invDisDetailList -- this.tempSaveData.promoAndDisJunDataList.length > 0
      for(let i = 0; i < this.tempSaveData.promoAndDisJunDataList.length; i++){
        for(let j = 0; j < this.townList.length; j++){
          if(this.tempSaveData.promoAndDisJunDataList[i].townSyskey == this.townList[j].TownSyskey){
            cbid = "#" + this.townList[j].TownSyskey + "";
            $(cbid).prop('checked', false);

            this.townList[j].ShopDataList.map(
              data => {
                if(data.shopSysKey == this.tempSaveData.promoAndDisJunDataList[i].n1){
                  data.checkFlag = false;
                }
              }
            );
          }
        }

        let returnTempData = this.getPromoAndDisJunDataList();
        returnTempData.syskey = "";
        returnTempData.n1 = this.tempSaveData.promoAndDisJunDataList[i].n1; // change from promoAndDisJunDataList to  volDisShopJuncDataList
        returnTempData.n3 = this.tempSaveData.promoAndDisJunDataList[i].n3;
        returnTempData.t1 = this.tempSaveData.promoAndDisJunDataList[i].t1;
        returnTempData.recordStatus = this.tempSaveData.promoAndDisJunDataList[i].recordStatus;
        returnTempData.townSyskey = this.tempSaveData.promoAndDisJunDataList[i].townSyskey;
        returnTempData.shopCode = this.tempSaveData.promoAndDisJunDataList[i].shopCode;
        returnTempData.address = this.tempSaveData.promoAndDisJunDataList[i].address;
        
        this.saveData.volDisShopJuncDataList.push(returnTempData); //-
        this.tempShopList.push(returnTempData);
      }
  
      this.saveData.volDisShopJuncDataList.sort((a, b) => (a.t1 > b.t1) ? 1 : -1); //-
      this.tempShopList.sort((a, b) => (a.t1 > b.t1) ? 1 : -1);
      this.searchAppliedShop1("");

      this.tempSaveData.promoAndDisJunDataList.splice(0, this.tempSaveData.promoAndDisJunDataList.length);

      $("#searchBoxAS").val("");
    } else {
      this.manager.showToast(this.tostCtrl, "Message", "Choose some shops", 2000);
    }
  }

  removeShop(e, index){
    // for(let j = 0; j < this.saveData.promoAndDisJunDataList.length; j++){
    //   if(this.saveData.promoAndDisJunDataList[j].n1 == this.tempShopList[index].n1){
    //     this.saveData.promoAndDisJunDataList.splice(j, 1);
    //     break;
    //   }
    // }

    for(let j = 0; j < this.saveData.volDisShopJuncDataList.length; j++){
      if(this.saveData.volDisShopJuncDataList[j].n1 == this.tempShopList[index].n1){
        this.saveData.volDisShopJuncDataList.splice(j, 1);
        break;
      }
    }

    this.tempShopList.splice(index, 1);
  }

  /*        Version 2
  selectTown(e, tsIndex){
    let sameShopCheck = false;

    if(e.currentTarget.checked){
      for(let i = 0; i < this.townList[tsIndex].ShopDataList.length; i++){
        sameShopCheck = this.tempSaveData.promoAndDisJunDataList.some(
          tempShopData => tempShopData.n1 == this.townList[tsIndex].ShopDataList[i].shopSysKey
        );

        if(sameShopCheck == false){
          this.selectShop(e, tsIndex, i);
        }
      }
    } else {
      for(let i = 0; i < this.townList[tsIndex].ShopDataList.length; i++){
        this.selectShop(e, tsIndex, i);
      }
    }
  }

  selectShop(e, tsIndex, shopIndex){
    let returnTempData = this.getPromoAndDisJunDataList();
    let found = false;
    let cbid = "";

    if(e.currentTarget.checked){
      for(let i = 0; i < this.saveData.promoAndDisJunDataList.length; i++){
        if(this.saveData.promoAndDisJunDataList[i].n1 == this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey){
          found = true;
          break;
        }
      }
  
      if(found == false){
        returnTempData.syskey = "";
        returnTempData.n1 = this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey;
        returnTempData.n3 = "1";
        returnTempData.n4 = "";
        returnTempData.t1 = this.townList[tsIndex].ShopDataList[shopIndex].shopName;
        returnTempData.t3 = "";
        returnTempData.recordStatus = "1";
        returnTempData.townSyskey = this.townList[tsIndex].TownSyskey;
        returnTempData.shopCode = this.townList[tsIndex].ShopDataList[shopIndex].shopCode;
        returnTempData.address = this.townList[tsIndex].ShopDataList[shopIndex].address;
  
        this.tempSaveData.promoAndDisJunDataList.push(returnTempData);

        cbid = "#cb1" + tsIndex + "and" + shopIndex;
        $(cbid).prop('checked', true);
      } else {
        cbid = "#cb1" + tsIndex + "and" + shopIndex;
        $(cbid).prop('checked', false);

        this.manager.showToast(this.tostCtrl, "Message", "Already Added", 2000);
      }
    } else {
      for(let i = 0; i < this.tempSaveData.promoAndDisJunDataList.length; i++){
        if(this.tempSaveData.promoAndDisJunDataList[i].n1 == this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey){
          cbid = "#cb1" + tsIndex + "and" + shopIndex;
          $(cbid).prop('checked', false);

          this.tempSaveData.promoAndDisJunDataList.splice(i, 1);
          break;
        }
      }
    }
  }

  addShop(){
    let cbid = "";

    if(this.tempSaveData.promoAndDisJunDataList.length > 0){
      for(let i = 0; i < this.tempSaveData.promoAndDisJunDataList.length; i++){
        for(let j = 0; j < this.townList.length; j++){
          if(this.tempSaveData.promoAndDisJunDataList[i].townSyskey == this.townList[j].TownSyskey){
            cbid = "#combo1" + j + "";
            $(cbid).prop('checked', false);

            for(let k = 0; k < this.townList[j].ShopDataList.length; k++){
              if(this.tempSaveData.promoAndDisJunDataList[i].n1 == this.townList[j].ShopDataList[k].shopSysKey){
                this.townList[j].ShopDataList.splice(k, 1);
                break;
              }
            }
          }
        }

        let returnTempData = this.getPromoAndDisJunDataList();
        returnTempData.syskey = "";
        returnTempData.n1 = this.tempSaveData.promoAndDisJunDataList[i].n1;
        returnTempData.n3 = "1";
        returnTempData.t1 = this.tempSaveData.promoAndDisJunDataList[i].t1;
        returnTempData.recordStatus = this.tempSaveData.promoAndDisJunDataList[i].recordStatus;
        returnTempData.townSyskey = this.tempSaveData.promoAndDisJunDataList[i].townSyskey;
        returnTempData.shopCode = this.tempSaveData.promoAndDisJunDataList[i].shopCode;
        returnTempData.address = this.tempSaveData.promoAndDisJunDataList[i].address;
        
        this.saveData.promoAndDisJunDataList.push(returnTempData);
        this.tempShopList.push(returnTempData);
      }
  
      this.tempSaveData.promoAndDisJunDataList.splice(0, this.tempSaveData.promoAndDisJunDataList.length);
    } else {
      this.manager.showToast(this.tostCtrl, "Message", "Choose some shops", 2000);
    }
  }

  removeShop(e, index){
    let returnTempData = {
      "shopSysKey": "",
      "shopCode": "",
      "shopName": "",
      "address": ""
    };

    for(let i = 0; i < this.townList.length; i++){
      if(this.townList[i].TownSyskey == this.tempShopList[index].townSyskey){
        returnTempData = {
          "shopSysKey": "",
          "shopCode": "",
          "shopName": "",
          "address": ""
        };

        returnTempData.shopSysKey = this.tempShopList[index].n1;
        returnTempData.shopCode = this.tempShopList[index].shopCode;
        returnTempData.shopName = this.tempShopList[index].t1;
        returnTempData.address = this.tempShopList[index].address;

        this.townList[i].ShopDataList.push(returnTempData);
        this.townList[i].ShopDataList.sort((a, b) => (a.shopName > b.shopName) ? 1 : -1);

        break;
      }
    }

    for(let j = 0; j < this.saveData.promoAndDisJunDataList.length; j++){
      if(this.saveData.promoAndDisJunDataList[j].n1 == this.tempShopList[index].n1){
        this.saveData.promoAndDisJunDataList.splice(j, 1);
        break;
      }
    }

    this.tempShopList.splice(index, 1);
  }
  /*

  /*      Version 1
  selectShop(e, tsIndex, shopIndex){
    let returnTempData = this.getPromoAndDisJunDataList();
    let cbid = "";
    // let found = false;

    if(e.currentTarget.checked){
      returnTempData.syskey = "";
      returnTempData.n1 = this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey;
      returnTempData.n3 = "1";
      returnTempData.n4 = "";
      returnTempData.t1 = this.townList[tsIndex].ShopDataList[shopIndex].shopName;
      returnTempData.t3 = "";
      returnTempData.townSyskey = this.townList[tsIndex].TownSyskey;
      returnTempData.recordStatus = "1";

      this.tempSaveData.promoAndDisJunDataList.push(returnTempData);

      cbid = "#cb1" + tsIndex + "and" + shopIndex;
      $(cbid).prop('checked', true);

      /*
      for(let i = 0; i < this.saveData.promoAndDisJunDataList.length; i++){
        if(this.saveData.promoAndDisJunDataList[i].n1 == this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey){
          found = true;
          break;
        }
      }
  
      if(found == false){
        returnTempData.syskey = "";
        returnTempData.n1 = this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey;
        returnTempData.n3 = "1";
        returnTempData.t1 = this.townList[tsIndex].ShopDataList[shopIndex].shopName;
        returnTempData.townSyskey = this.townList[tsIndex].TownSyskey;
        returnTempData.recordStatus = "1";
  
        this.tempSaveData.promoAndDisJunDataList.push(returnTempData);

        cbid = "#cb" + tsIndex + "and" + shopIndex;
        $(cbid).prop('checked', true);
      } else {
        cbid = "#cb" + tsIndex + "and" + shopIndex;
        $(cbid).prop('checked', false);

        this.manager.showToast(this.tostCtrl, "Message", "Already Added", 2000);
      }
      /
    } else {
      for(let i = 0; i < this.tempSaveData.promoAndDisJunDataList.length; i++){
        if(this.tempSaveData.promoAndDisJunDataList[i].n1 == this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey){
          cbid = "#cb1" + tsIndex + "and" + shopIndex;
          $(cbid).prop('checked', false);

          this.tempSaveData.promoAndDisJunDataList.splice(i, 1);
          break;
        }
      }
    }
  }

  addShop(){
    let cbid = "";
    let cbidShop = "";
    let found = false;
    let tempLength = this.tempSaveData.promoAndDisJunDataList.length;
    let shopNames = "";

    if(tempLength > 0){
      if(this.tempBOtempData.syskey != ""){
        for(let i = tempLength - 1; i >= 0; i--){
          found = false;
          this.tempSaveData.promoAndDisJunDataList[i].n4 = this.tempBOtempData.syskey;
          this.tempSaveData.promoAndDisJunDataList[i].t3 = this.tempBOtempData.t2;
  
          for(let n = 0; n < this.saveData.promoAndDisJunDataList.length; n++){
            if(this.saveData.promoAndDisJunDataList[n].n1 == this.tempSaveData.promoAndDisJunDataList[i].n1
                && this.saveData.promoAndDisJunDataList[n].n4 == this.tempSaveData.promoAndDisJunDataList[i].n4){
                  found = true;
  
                  break;
            }
          }
  
          for(let j = 0; j < this.townList.length; j++){
            if(this.tempSaveData.promoAndDisJunDataList[i].townSyskey == this.townList[j].TownSyskey){
              cbid = "#combo1" + j + "";
              $(cbid).prop('checked', false);
  
              for(let k = 0; k < this.townList[j].ShopDataList.length; k++){
                if(this.tempSaveData.promoAndDisJunDataList[i].n1 == this.townList[j].ShopDataList[k].shopSysKey){
                  // this.townList[j].ShopDataList.splice(k, 1);
                  cbidShop = "#cb1" + j + "and" + k;
                  $(cbidShop).prop('checked', false);

                  break;
                }
              }
            }
          }
  
          if(found == false){
            this.saveData.promoAndDisJunDataList.push(this.tempSaveData.promoAndDisJunDataList[i]);
          } else {
            shopNames += this.tempSaveData.promoAndDisJunDataList[i].t1 + ", ";
          }
          this.tempSaveData.promoAndDisJunDataList.splice(i, 1);
        }

        if(shopNames != ""){
          shopNames = shopNames.substring(0, shopNames.length - 2);
          this.manager.showToast(this.tostCtrl, "Message", "The following Shops are not added : " + shopNames, 4000);
        }
    
        // this.tempSaveData.promoAndDisJunDataList.splice(0, this.tempSaveData.promoAndDisJunDataList.length);
      } else {
        this.manager.showToast(this.tostCtrl, "Message", "Select Brand Owner", 2000);
      }
    } else {
      this.manager.showToast(this.tostCtrl, "Message", "Choose some shops", 2000);
    }
  }

  removeShop(e, index){
    /*
    let returnTempData = {
      "shopSysKey": "",
      "shopName": ""
    };

    for(let i = 0; i < this.townList.length; i++){
      if(this.townList[i].TownSyskey == this.saveData.promoAndDisJunDataList[index].townSyskey){
        returnTempData = {
          "shopSysKey": "",
          "shopName": ""
        };

        returnTempData.shopSysKey = this.saveData.promoAndDisJunDataList[index].n1;
        returnTempData.shopName = this.saveData.promoAndDisJunDataList[index].t1;

        this.townList[i].ShopDataList.push(returnTempData);
        this.townList[i].ShopDataList.sort((a, b) => (a.shopName > b.shopName) ? 1 : -1);

        break;
      }
    }
    /

    this.saveData.promoAndDisJunDataList.splice(index, 1);
  }
  */

  getAllDataList(){
    this.loading.create({
      message: "Processing..",
     
      backdropDismiss: false
    }).then(
      el => {
        el.present();

        this.criteria = this.getCriteriaData();
        this.criteria.maxRows = this.config.itemsPerPage;
        this.criteria.current = "0";
        this.criteria.searchFlag = "";

        const url = this.manager.appConfig.apiurl +'PromoAndDiscount/getInvoiceDiscountHeader';

        this.http.post(url, this.criteria, this.manager.getOptions()).subscribe(
          (data:any) =>{
            el.dismiss();
            
            if(data.message == "SUCCESS"){
              this.config.totalItems = data.rowCount;
              this.config.currentPage = 1;
              this.disTypeList = [];

              for(var i = 0; i < data.promoanddiscountList.length; i++){
                let tempReturnData = this.getTempSaveData();
                
                tempReturnData.invDisDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data.promoanddiscountList[i].date).toString();
                tempReturnData.invDisSyskey = data.promoanddiscountList[i].syskey;
                tempReturnData.invDisCode = data.promoanddiscountList[i].t1;
                tempReturnData.invDisDesc = data.promoanddiscountList[i].t2;
                tempReturnData.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data.promoanddiscountList[i].t3).toString();
                tempReturnData.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data.promoanddiscountList[i].t4).toString();
                //1 active , 0 inactive
                tempReturnData.invDisStatus = data.promoanddiscountList[i].n1;

                this.disTypeList.push(tempReturnData);
              }
            }
          }
        );
      }
    );
  }

  search(currIndex, criFlag){
    this.loading.create({
      message: "Processing..",
     
      backdropDismiss: false
    }).then(
      el => {
        el.present();

        this.searchCriteria.maxRows = this.config.itemsPerPage;
        this.searchCriteria.current = currIndex;
        this.searchCriteria.searchFlag = "";

        const url = this.manager.appConfig.apiurl +'PromoAndDiscount/getInvoiceDiscountHeader';

        /*
        let send_data1 = this.criteria.fromDate;
        let send_data2 = this.criteria.toDate;
        let send_data3 = this.criteria.startDate;
        let send_data4 = this.criteria.endDate;

        if(this.criteria.fromDate != ""){
          this.criteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
        }
        if(this.criteria.toDate != ""){
          this.criteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
        }
        if(this.criteria.startDate != ""){
          this.criteria.startDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.startDate);
        }
        if(this.criteria.endDate != ""){
          this.criteria.endDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.endDate);
        }
        */
        
        if(criFlag == true){
          this.searchCriteria.discountCode = this.criteria.discountCode;
          this.searchCriteria.discountDesc = this.criteria.discountDesc;
          this.searchCriteria.discountPercent = this.criteria.discountPercent;
          this.searchCriteria.shopDesc = this.criteria.shopDesc;
          this.searchCriteria.brandOwner = this.criteria.brandOwner;
          this.searchCriteria.operator = this.criteria.operator;
          this.searchCriteria.disType = this.criteria.disType;
          this.searchCriteria.disAmt = this.criteria.disAmt;
          this.searchCriteria.disItem = this.criteria.disItem;
          this.searchCriteria.disItemQty = this.criteria.disItemQty;

          if(this.criteria.fromDate != ""){
            this.searchCriteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
          } else {
            this.searchCriteria.fromDate = "";
          }
          if(this.criteria.toDate != ""){
            this.searchCriteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
          } else {
            this.searchCriteria.toDate = "";
          }
          if(this.criteria.startDate != ""){
            this.searchCriteria.startDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.startDate);
          } else {
            this.searchCriteria.startDate = "";
          }
          if(this.criteria.endDate != ""){
            this.searchCriteria.endDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.endDate);
          } else {
            this.searchCriteria.endDate = "";
          }

          // this.searchCriteria.fromDate = this.criteria.fromDate;
          // this.searchCriteria.toDate = this.criteria.toDate;
          // this.searchCriteria.startDate = this.criteria.startDate;
          // this.searchCriteria.endDate = this.criteria.endDate;
        }
        
        this.http.post(url, this.searchCriteria, this.manager.getOptions()).subscribe(
          (data:any) =>{
            el.dismiss();

            if(data.message == "SUCCESS"){
              // this.criteria.fromDate = send_data1;
              // this.criteria.toDate = send_data2;
              // this.criteria.startDate = send_data3;
              // this.criteria.endDate = send_data4;

              this.config.totalItems = data.rowCount;
              this.disTypeList = [];

              if(currIndex == 0){
                this.config.currentPage = 1;
              }

              for(var i = 0; i < data.promoanddiscountList.length; i++){
                let tempReturnData = this.getTempSaveData();
                
                tempReturnData.invDisDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data.promoanddiscountList[i].date).toString();
                tempReturnData.invDisSyskey = data.promoanddiscountList[i].syskey;
                tempReturnData.invDisCode = data.promoanddiscountList[i].t1;
                tempReturnData.invDisDesc = data.promoanddiscountList[i].t2;
                tempReturnData.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data.promoanddiscountList[i].t3).toString();
                tempReturnData.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data.promoanddiscountList[i].t4).toString();

                tempReturnData.invDisStatus = data.promoanddiscountList[i].n1;

                this.disTypeList.push(tempReturnData);
              }
            }
          }
        );
      }
    );
  }

  validation(){
    if(this.saveData.t1 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Code", 2000);
      return false;
    }

    if(this.saveData.t2 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Description", 2000);
      return false;
    }

    if(this.saveDataDates.fromDate == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Start Date", 2000);
      return false;
    }

    if(this.saveDataDates.toDate == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add End Date", 2000);
      return false;
    }

    if(this.saveData.invDisDetailList.length < 1){
      this.manager.showToast(this.tostCtrl, "Message", "Add Rules", 2000);
      return false;
    }

    if(this.saveData.volDisShopJuncDataList.length < 1){ //-
      this.manager.showToast(this.tostCtrl, "Message", "Add Shops", 2000);
      return false;
    }

    return true;
  }

  save(){
    this.loading.create({
      message: "Processing..",
     
      backdropDismiss: false
    }).then(
      el => {
        el.present();

        const url = this.manager.appConfig.apiurl +'PromoAndDiscount/saveInvoiceDiscount';

        if(this.validation()){
          if(this.saveDataDates.fromDate != ""){
            this.saveData.t3 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.saveDataDates.fromDate);
          }

          if(this.saveDataDates.toDate != ""){
            this.saveData.t4 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.saveDataDates.toDate);
          }
          
          this.http.post(url, this.saveData, this.manager.getOptions()).subscribe(
            (data:any) =>{
              el.dismiss();

              if(data.message == "SUCCESS"){
                if(data.ShopNames == "" || data.ShopNames == undefined){
                  this.manager.showToast(this.tostCtrl, "Message", "Save Successful", 1000);
                } else {
                  let temp_str = "Save Successful<br>The following shops already have discount:<br>" + data.ShopNames;
                  this.manager.showToast(this.tostCtrl, "Message", temp_str, 5000);
                }
      
                $("#invoiceDisNew").hide();
                $("#invoiceDisList").show();
                $("#invoiceDisList-tab").tab("show");
      
                this.btn = false;
                this.dtlFlag = false;
      
                this.clearProperties();
                this.allList();
                this.getAllDataList();
              } else if(data.message == "CODEEXISTED"){
                this.manager.showToast(this.tostCtrl, "Message", "Discount Code Already Existed", 2000);
                $('#invSaveDisCode').css('border-color', 'red');
              } else if(data.message == "JUNCSAVEFAIL"){
                this.manager.showToast(this.tostCtrl, "Message", "Discount Junction Save Failed", 2000);
              } else if(data.message == "FAIL"){
                this.manager.showToast(this.tostCtrl, "Message", "Save Failed", 2000);
              }
            }
          );
        } else {
          el.dismiss();
        }
      }
    );
  }

  detail(event, index){
    $("#invoiceDisNew").show();
    $("#invoiceDisList").hide();
    $("#invoiceDisNew-tab").tab("show");

    $('#invDisHdr-tab').tab('show');
    $('#invDisHdr').show();
    $('#invDisShopJuncList').hide();
    $('#invDisDtlList').hide();
    $('#invDiscountItem0').show();
    $('#invDiscountItem1').hide();
    $('#invDiscountItem2').hide();

    this.btn = true;
    this.dtlFlag = true;
    this.config1.currentPage = 1;

    this.saveData.syskey = this.disTypeList[index].invDisSyskey;
    this.saveData.n1 = this.disTypeList[index].invDisStatus;
    
    this.saveData.t1 = this.disTypeList[index].invDisCode;
    this.saveData.t2 = this.disTypeList[index].invDisDesc;
    this.saveData.t3 = this.disTypeList[index].fromDate;
    this.saveData.t4 = this.disTypeList[index].toDate;

    this.saveDataDates.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.UItoDTP, this.saveData.t3);
    this.saveDataDates.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.UItoDTP, this.saveData.t4);

    this.saveData.invDisDetailList = [];
    this.saveData.promoAndDisJunDataList = [];

    let url = this.manager.appConfig.apiurl + 'PromoAndDiscount/getPMO009DataByPMO011';
    let sendTempData = {
      "DisTypeSyskey": this.disTypeList[index].invDisSyskey,
      "tsCheck": "a"
    };

    this.loading.create({
      message: "Processing..",
     
      backdropDismiss: false
    }).then(
      el => {
        el.present();

        this.http.post(url, sendTempData, this.manager.getOptions()).subscribe(
          (data:any) =>{
            if(data.message == "SUCCESS"){
              let returnTempDataList = [];
              let returnTempDataList1 = [];
              let returnTempData = this.getInvDisDtlDataList();
              let returnTempData1 = this.getPromoAndDisJunDataList();

              returnTempDataList = data.dataList;
              returnTempDataList1 = data.dataList1;

              for(let i = 0; i < returnTempDataList.length; i++){
                returnTempData = this.getInvDisDtlDataList();

                returnTempData.syskey = returnTempDataList[i].syskey;
                returnTempData.n1 = returnTempDataList[i].n1;
                returnTempData.n2 = returnTempDataList[i].n2;
                returnTempData.n3 = returnTempDataList[i].n3;
                returnTempData.n4 = returnTempDataList[i].n4;
                returnTempData.n5 = returnTempDataList[i].n5;
                returnTempData.n6 = returnTempDataList[i].n6;
                returnTempData.n7 = returnTempDataList[i].n7;
                returnTempData.n8 = returnTempDataList[i].n8;
                returnTempData.n9 = returnTempDataList[i].n9;
                returnTempData.n10 = returnTempDataList[i].n10;
                returnTempData.n11 = returnTempDataList[i].n11;
                returnTempData.t1 = returnTempDataList[i].t1;
                returnTempData.t2 = returnTempDataList[i].t2;
                returnTempData.t3 = returnTempDataList[i].t3;
                returnTempData.recordStatus = "1";
                returnTempData.getGiftList = returnTempDataList[i].getGiftList;

                this.saveData.invDisDetailList.push(returnTempData);
              }

              for(let i = 0; i < returnTempDataList1.length; i++){
                returnTempData1 = this.getPromoAndDisJunDataList();
    
                returnTempData1.syskey = returnTempDataList1[i].syskey;
                returnTempData1.recordStatus = "1";
                returnTempData1.n1 = returnTempDataList1[i].n1;
                returnTempData1.n3 = returnTempDataList1[i].n3;
                returnTempData1.n4 = returnTempDataList1[i].n4;
                returnTempData1.t1 = returnTempDataList1[i].t1;
                returnTempData1.t3 = returnTempDataList1[i].t3;
                returnTempData1.townSyskey = returnTempDataList1[i].townSyskey;
                returnTempData1.shopCode = returnTempDataList1[i].shopCode;
                returnTempData1.address = returnTempDataList1[i].address;
    
                // this.saveData.promoAndDisJunDataList.push(returnTempData1); //-
                this.saveData.volDisShopJuncDataList.push(returnTempData1);
                this.tempShopList.push(returnTempData1);
              }
            }

            // this.saveData.promoAndDisJunDataList.sort((a, b) => (a.t1 > b.t1) ? 1 : -1);
            this.saveData.volDisShopJuncDataList.sort((a, b) => (a.t1 > b.t1) ? 1 : -1); //-
            this.tempShopList.sort((a, b) => (a.t1 > b.t1) ? 1 : -1);

            this.searchTownship();
            el.dismiss();

            /*
            url = this.manager.appConfig.apiurl + 'PromoAndDiscount/getPMO010DataByPMO011';

            this.http.post(url, sendTempData, this.manager.getOptions()).subscribe(
              (data:any) =>{
                if(data.message == "SUCCESS"){
                  let returnTempDataList = [];
                  let returnTempData = this.getPromoAndDisJunDataList();
        
                  returnTempDataList = data.dataList;
        
                  for(let i = 0; i < returnTempDataList.length; i++){
                    returnTempData = this.getPromoAndDisJunDataList();
        
                    returnTempData.syskey = returnTempDataList[i].syskey;
                    returnTempData.n1 = returnTempDataList[i].n1;
                    returnTempData.n3 = returnTempDataList[i].n3;
                    returnTempData.n4 = returnTempDataList[i].n4;
                    returnTempData.t1 = returnTempDataList[i].t1;
                    returnTempData.t3 = returnTempDataList[i].t3;
                    returnTempData.recordStatus = "1";
                    returnTempData.townSyskey = returnTempDataList[i].townSyskey;
                    returnTempData.shopCode = returnTempDataList[i].shopCode;
                    returnTempData.address = returnTempDataList[i].address;
        
                    this.saveData.promoAndDisJunDataList.push(returnTempData);
                    this.tempShopList.push(returnTempData);
                  }
                  this.saveData.promoAndDisJunDataList.sort((a, b) => (a.t1 > b.t1) ? 1 : -1);
                  this.tempShopList.sort((a, b) => (a.t1 > b.t1) ? 1 : -1);
        
                  // this.tempShopList = this.saveData.promoAndDisJunDataList;
                  
                  // this.getAllShopByTown();
                  this.searchTownship();
                }

                el.dismiss();
              }
            );
            */
          }
        );
      }
    );
  }

  goDelete(){
    this.loading.create({
      message: "Processing..",
     
      backdropDismiss: false
    }).then(
      el => {
        el.present();

        const url = this.manager.appConfig.apiurl + 'PromoAndDiscount/deletePMO011';

        this.http.post(url, this.saveData, this.manager.getOptions()).subscribe(
          (data:any) =>{
            el.dismiss();

            if(data.message == "SUCCESS"){
              this.manager.showToast(this.tostCtrl, "Message", "Delete Successful", 1000);
      
              $("#invoiceDisNew").hide();
              $("#invoiceDisList").show();
              $("#invoiceDisList-tab").tab("show");
    
              this.btn = false;
              this.dtlFlag = false;
    
              this.clearProperties();
              this.allList();
              this.getAllDataList();
            } else if(data.message == "FAIL"){
              this.manager.showToast(this.tostCtrl, "Message", "Delete Failed", 1000);
            }
          }
        );
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
        let cri_fromDate = "";
        let cri_toDate = "";
        let cri_startDate = "";
        let cri_endDate = "";
        const url = this.manager.appConfig.apiurl +'PromoAndDiscount/getInvoiceDiscountHeader';
        
        this.searchCriteria.inActiveFlag = "1"; // to get active only in excel
        this.searchCriteria.maxRows = "";
        this.searchCriteria.current = "";
        this.searchCriteria.searchFlag = "false";
        this.searchCriteria.discountCode = this.criteria.discountCode;
        this.searchCriteria.discountDesc = this.criteria.discountDesc;
        this.searchCriteria.discountPercent = this.criteria.discountPercent;
        this.searchCriteria.shopDesc = this.criteria.shopDesc;
        this.searchCriteria.brandOwner = this.criteria.brandOwner;
        this.searchCriteria.operator = this.criteria.operator;
        this.searchCriteria.disType = this.criteria.disType;
        this.searchCriteria.disAmt = this.criteria.disAmt;
        this.searchCriteria.disItem = this.criteria.disItem;
        this.searchCriteria.disItemQty = this.criteria.disItemQty;

        if(this.criteria.fromDate != ""){
          this.searchCriteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
          cri_fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI, this.criteria.fromDate).toString();
        } else {
          this.searchCriteria.fromDate = "";
        }
        
        if(this.criteria.toDate != ""){
          this.searchCriteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
          cri_toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI, this.criteria.toDate).toString();
        } else {
          this.searchCriteria.toDate = "";
        }

        if(this.criteria.startDate != ""){
          this.searchCriteria.startDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.startDate);
          cri_startDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI, this.criteria.startDate).toString();
        } else {
          this.searchCriteria.startDate = "";
        }
        
        if(this.criteria.endDate != ""){
          this.searchCriteria.endDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.endDate);
          cri_endDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI, this.criteria.endDate).toString();
        } else {
          this.searchCriteria.endDate = "";
        }
        
        this.http.post(url, this.searchCriteria, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            if(data.message == "SUCCESS"){
              let data1 = data.promoanddiscountList;
              let cri_flag = 0;

              let excelTitle = "Invoice Discount Report";
              let excelHdrHeaderData = [
                "Created Date", "Status", "Code", "Description", "Start Date", "End Date"
              ];
              let excelDtlHeaderData = [
                "Operator", "Revenue 1", "Revenue 2", "Brand Owner", 
                "Discount Type", "Discount Price Type", "Price Discount Rate", 
                "Discount Item Type", "Discount Item", "Discount Item Qty"
              ];
              let excelShopHeaderData = [
                "Status", "Shop Code","Shop Description"
              ];

              let excelDataList: any = [];
              let excelData: any = [];
              let excelDataList1: any = [];
              let excelData1: any = [];
              let data2 = [];
              for(var exCount = 0; exCount < data1.length; exCount++){
                excelData = [];
                data1[exCount].date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].date);
                data1[exCount].t3 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].t3);
                data1[exCount].t4 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].t4);

                if(data1[exCount].n1.toString() == "1"){
                  data1[exCount].n1 = "Active";
                } else if(data1[exCount].n1.toString() == "0"){
                  data1[exCount].n1 = "Inactive";
                }

                excelData.push(data1[exCount].date);
                excelData.push(data1[exCount].n1);
                excelData.push(data1[exCount].t1);
                excelData.push(data1[exCount].t2);
                excelData.push(data1[exCount].t3);
                excelData.push(data1[exCount].t4);

                excelDataList.push(excelData);

                var exCount1;
                excelDataList1 = [];
                data2 = data1[exCount].invDisDetailList;
                for(exCount1 = 0; exCount1 < data2.length; exCount1++){
                  excelData1 = [];
                  if(data2[exCount1].n3.toString() == "1"){
                    data2[exCount1].n3 = "Price";

                    if(data2[exCount1].n4.toString() == "1"){
                      data2[exCount1].n4 = "Amount";
                    } else if(data2[exCount1].n4.toString() == "2"){
                      data2[exCount1].n4 = "Percentage";
                    } else {
                      data2[exCount1].n4 = "-";
                    }

                    data2[exCount1].t2 = "-";
                    data2[exCount1].n7 = "-";
                    data2[exCount1].n8 = "-";
                  } else if(data2[exCount1].n3.toString() == "2"){
                    data2[exCount1].n3 = "Inkind";

                    if(data2[exCount1].n8.toString() == "1"){
                      data2[exCount1].n8 = "Gift";
                    } else if(data2[exCount1].n8.toString() == "2"){
                      data2[exCount1].n8 = "Coupon";
                    } else {
                      data2[exCount1].n8 = "-";
                    }

                    data2[exCount1].n4 = "-";
                    data2[exCount1].n5 = "-";
                  } else {
                    data2[exCount1].n3 = "-";

                    data2[exCount1].n4 = "-";
                    data2[exCount1].n5 = "-";

                    data2[exCount1].t2 = "-";
                    data2[exCount1].n7 = "-";
                    data2[exCount1].n8 = "-";
                  }

                  if(data2[exCount1].n10.toString() == "1"){
                    data2[exCount1].n10 = "less than";
                  } else if(data2[exCount1].n10.toString() == "2"){
                    data2[exCount1].n10 = "equal";
                  } else if(data2[exCount1].n10.toString() == "3"){
                    data2[exCount1].n10 = "equal and greater than";
                  } else if(data2[exCount1].n10.toString() == "4"){
                    data2[exCount1].n10 = "greater than";
                  } else if(data2[exCount1].n10.toString() == "5"){
                    data2[exCount1].n10 = "between";
                  } else {
                    data2[exCount1].n10 = "-";
                  }

                  excelData1.push(data2[exCount1].n10);
                  excelData1.push(data2[exCount1].n2);
                  excelData1.push(data2[exCount1].n9);
                  excelData1.push(data2[exCount1].t3);
                  excelData1.push(data2[exCount1].n3);
                  excelData1.push(data2[exCount1].n4);
                  excelData1.push(data2[exCount1].n5);
                  excelData1.push(data2[exCount1].n8);
                  excelData1.push(data2[exCount1].t2);
                  excelData1.push(data2[exCount1].n7);

                  excelDataList1.push(excelData1);
                }
                excelDataList.push(excelDataList1);

                excelDataList1 = [];
                data2 = data1[exCount].promoAndDisJunDataList;
                data2.sort((a, b) => (a.t1 > b.t1) ? 1 : -1);
                for(exCount1 = 0; exCount1 < data2.length; exCount1++){
                  excelData1 = [];
                  if(data2[exCount1].n3.toString() == "1"){
                    data2[exCount1].n3 = "Active";
                  } else if(data2[exCount1].n3.toString() == "0"){
                    data2[exCount1].n3 = "Inactive";
                  }

                  excelData1.push(data2[exCount1].n3);
                  excelData1.push(data2[exCount1].shopCode);
                  excelData1.push(data2[exCount1].t1);

                  excelDataList1.push(excelData1);
                }
                excelDataList.push(excelDataList1);
              }

              let workbook = new Workbook();
              let worksheet = workbook.addWorksheet('Invoice Discount Data');

              let titleRow = worksheet.addRow(["", "", excelTitle]);
              titleRow.font = { bold: true };
              worksheet.addRow([]);

              let criteriaRow;

              if(this.searchCriteria.fromDate != null && this.searchCriteria.fromDate != "" 
                && this.searchCriteria.toDate != null && this.searchCriteria.toDate != ""){
                  criteriaRow = worksheet.addRow(["FromDate : " + cri_fromDate + " - ToDate : " + cri_toDate]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
              } else if(this.searchCriteria.fromDate != null && this.searchCriteria.fromDate != "") {
                criteriaRow = worksheet.addRow(["Date : " + cri_fromDate]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.searchCriteria.startDate != null && this.searchCriteria.startDate != "" 
                && this.searchCriteria.endDate != null && this.searchCriteria.endDate != ""){
                  criteriaRow = worksheet.addRow(["StartDate : " + cri_startDate + " - EndDate : " + cri_endDate]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
              } else if(this.searchCriteria.startDate != null && this.searchCriteria.startDate != "") {
                criteriaRow = worksheet.addRow(["ValidDate : " + cri_startDate]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.searchCriteria.discountCode.toString() != ""){
                criteriaRow = worksheet.addRow(["Code : " + this.searchCriteria.discountCode.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.searchCriteria.discountDesc.toString() != ""){
                criteriaRow = worksheet.addRow(["Description : " + this.searchCriteria.discountDesc.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.searchCriteria.brandOwner.toString() != ""){
                criteriaRow = worksheet.addRow(["Brand Owner : " + this.searchCriteria.brandOwner.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.searchCriteria.discountPercent.toString() != ""){
                criteriaRow = worksheet.addRow(["Revenue : " + this.searchCriteria.discountPercent.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.searchCriteria.operator.toString() != ""){
                let operator = "";
                if(this.searchCriteria.operator.toString() == "1"){
                  operator = "less than";
                } else if(this.searchCriteria.operator.toString() == "2"){
                  operator = "equal";
                } else if(this.searchCriteria.operator.toString() == "3"){
                  operator = "equal and greater than";
                } else if(this.searchCriteria.operator.toString() == "4"){
                  operator = "greater than";
                } else {    //    if(this.searchCriteria.operator.toString() == "5"){
                  operator = "between";
                }

                criteriaRow = worksheet.addRow(["Operator : " + operator]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.searchCriteria.disType.toString() != ""){
                let disType = "";
                if(this.searchCriteria.disType.toString() == "1"){
                  disType = "Price";
                } else {    //    if(this.searchCriteria.disType.toString() == "2"){
                  disType = "Inkind";
                }

                criteriaRow = worksheet.addRow(["Discount Type : " + disType]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.searchCriteria.disAmt.toString() != ""){
                criteriaRow = worksheet.addRow(["Discount Amount : " + this.searchCriteria.disAmt.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.searchCriteria.disItem.toString() != ""){
                criteriaRow = worksheet.addRow(["Discount Item : " + this.searchCriteria.disItem.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.searchCriteria.disItemQty.toString() != ""){
                criteriaRow = worksheet.addRow(["Discount Item Qty : " + this.searchCriteria.disItemQty.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.searchCriteria.shopDesc.toString() != ""){
                criteriaRow = worksheet.addRow(["Shop : " + this.searchCriteria.shopDesc.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(cri_flag == 0){
                criteriaRow = worksheet.addRow(["Search With No Criteria"]);
                criteriaRow.font = { bold: true };
              }
              worksheet.addRow([]);

              let hdrHeaderRow;
              let dtlHeaderRow;
              let shopHeaderRow;
              let tempList;
              for (var i_data = 0; i_data < excelDataList.length; i_data+=3) {
                hdrHeaderRow = worksheet.addRow(excelHdrHeaderData);
                hdrHeaderRow.font = { bold: true };
                worksheet.addRow(excelDataList[i_data]);
                worksheet.addRow([]);

                var i_data1;
                tempList = excelDataList[i_data+1];
                dtlHeaderRow = worksheet.addRow(excelDtlHeaderData);
                dtlHeaderRow.font = { bold: true };
                for(i_data1 = 0; i_data1 < tempList.length; i_data1++){
                  worksheet.addRow(tempList[i_data1]);
                }
                worksheet.addRow([]);

                tempList = excelDataList[i_data+2];
                shopHeaderRow = worksheet.addRow(excelShopHeaderData);
                shopHeaderRow.font = { bold: true };
                for(i_data1 = 0; i_data1 < tempList.length; i_data1++){
                  worksheet.addRow(tempList[i_data1]);
                }
                worksheet.addRow([]);
                worksheet.addRow([]);
                worksheet.addRow([]);
              }

              workbook.xlsx.writeBuffer().then((data) => {
                let blob = new Blob([data], { type: EXCEL_TYPE });
                FileSaver.saveAs(blob, "Invoice_Discount_export_" + new Date().getTime() + EXCEL_EXTENSION);
              });
            }
          }
        );
      }
    );
  }

  commonDataExchange(data){
    let returnData = this.getGetGiftData();

    returnData.syskey = data.syskey;
    returnData.recordStatus = data.recordStatus;
    returnData.rsTemp = (data.rsTemp == undefined) ? data.recordStatus : data.rsTemp;
    returnData.n1 = data.n1;
    returnData.n2 = data.n2;
    returnData.n3 = data.n3;
    returnData.n4 = data.n4;
    returnData.n5 = data.n5;
    returnData.n6 = data.n6;
    returnData.n7 = data.n7;
    returnData.t1 = data.t1;

    return returnData;
  }

  /*
  validateDisPercent(e) {
    let key = e.key;
    var rgx = /^[0-9]*\.?[0-9]*$/;
    let result = key.match(rgx);

    if(result == null){// && key != "Backspace" && key != "Delete"){
      this.manager.showToast(this.tostCtrl, "Message", "Can only type numbers(0-9) and dot(.)", 1000);
      return false;
    }

    return true;
  }
  */

  pageChanged(e){
    this.config.currentPage = e;

    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.search(currentIndex, false);
  }

  assignedShopListPageChanged(e){
    this.config1.currentPage = e;
  }

  shopListPageChanged(e, townshipInfo){
    townshipInfo.shopListConfig.currentPage = e;

    let currentIndex = (townshipInfo.shopListConfig.currentPage - 1) * townshipInfo.shopListConfig.itemsPerPage;
    this.searchShop(currentIndex.toString(), townshipInfo.shopListConfig.currentPage, townshipInfo.TownSyskey);
  }

  allList(){
    this.disCodeSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          let param = {
            "discountCode": term,
            "discountDesc": "",
            "discountPercent": ""
          };

          this.manager.disTypeSearchAutoFill(param).subscribe(
            data => {
              this.disCodeList = data as any[];
            }
          );
        }
      }
    );

    this.disDescSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          let param = {
            "discountCode": "",
            "discountDesc": term,
            "discountPercent": ""
          };

          this.manager.disTypeSearchAutoFill(param).subscribe(
            data => {
              this.disDescList = data as any[];
            }
          );
        }
      }
    );

    /*
    this.disPercentSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          let param = {
            "code": "",
            "desc": "",
            "percent": term
          };

          this.manager.disTypeSearchAutoFill(param).subscribe(
            data => {
              this.disPercentList = data as any[];
            }
          );
        }
      }
    );
    */

    this.shopDescSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.shopNameSearchAutoFill(term).subscribe(
            data => {
              this.shopDescList = data as any[];
              this.shopDescList.sort((a, b) => (a.shopName > b.shopName) ? 1 : -1);
            }
          );
        }
      }
    );

    this.giftSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          let vdDesc_term = {
            "t2": term
          };

          this.manager.disItemGiftSearchAutoFill(vdDesc_term).subscribe(
            data => {
              this.giftList = data as any[];
            }
          );
        }
      }
    );

    this.couponSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          let vdDesc_term = {
            "t1": term
          };

          this.manager.disItemCouponSearchAutoFill(vdDesc_term).subscribe(
            data => {
              this.couponList = data as any[];
            }
          );
        }
      }
    );

    this.brandOwnerSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          let vdDesc_term = {
            "desc": term
          };

          this.manager.brandOwnerSearchAutoFill(vdDesc_term).subscribe(
            data => {
              this.brandOwnerList1 = data as any[];
            }
          );
        }
      }
    );

    this.disItemSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          let vdDesc_term = {
            "t2": term
          };
          this.manager.disItemGiftSearchAutoFill(vdDesc_term).subscribe(
            data => {
              this.disItemList = data as any[];
            }
          );
        }
      }
    );

    let url = "";
    let params = {};

    url = this.manager.appConfig.apiurl + 'PromoAndDiscount/invDisSearchAutoFill';
    params = {
      "discountPercent": ""
    };
    this.http.post(url, params, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.disPercentList = data.dataList;
        }
      }
    );

    url = this.manager.appConfig.apiurl + 'brandowner/brandOwnerSearchAutoFill';
    let param = {
      "syskey": ""
    };
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.brandOwnerList = data.dataList;
          this.brandOwnerList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
        }
      }
    );
  }

  clearProperties(){
    this.criteria = this.getCriteriaData();
    this.searchCriteria = this.getCriteriaData();
    this.saveData = this.getSaveData();
    this.tempSaveData = this.getSaveData();
    this.disItemSearch.disable();
    // this.tempBOtempData = this.getTempBOtempData();

    this.shopDataList = [];
    this.townList = [];
    this.brandOwnerList = [];
    this.disTypeList = [];

    this.tempSearch = {
      "shopDesc": "",
      "townshipDesc": ""
    };

    // this.saveDataDates = {
    //   "fromDate": "",
    //   "toDate": ""
    // };

    this.brandOwnerList = [];
    this.detailDataList = this.getInvDisDtlDataList();

    this.giftList = [];
    this.couponList = [];

    this.tempShopList = [];

    this.dropdown = false;
    this.updateIndex = -1;

    this.getGiftDataList = [];
    this.inkindEditFlag = false;
  }

  resetValue() {
    console.log(this.myInputVariable.nativeElement.files);
    this.myInputVariable.nativeElement.value = "";
    console.log(this.myInputVariable.nativeElement.files);
    this.value = "";
    this.shopListFromExcel = [];
  }

  onUpload(event) {
    if(event.target.files.length)
    {
      this.shopListFromExcel = [];
      this.value = "";
      this._shoplistdata = [];
      this.config.totalItems = 0;
      this.config.currentPage = 1;
  
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
            if(this.each_sheet_data[i].ShopCode != undefined && this.each_sheet_data[i].ShopCode != null && this.each_sheet_data[i].ShopCode != '') {
              this.value += "'" + this.each_sheet_data[i].ShopCode + "',";
            }
            // this.all_sheet_data.uploadData.push(this.each_sheet_data[i]);
          }
        }
        this.value = this.value.slice(0, -1);
        // this.all_sheet_data.uploadData.splice(0, 1);        
      };
    }else
    {
      this.uploadedFileName = "";
      // this._matllistdata = [];
      // this.config.totalItems = 0;
      // this.config.currentPage = 1;
    } 

  }

  appliedExcelShopData() {
    this.loading.create({
      message: 'Please wait...'
    }).then(loadEl => {
      loadEl.present();
      if(this.value != "" && this.value !=undefined && this.value != null) {
        var param = {
          "syskey": this.saveData.syskey,
          "shopCodeString": this.value 
        };
        var url = this.manager.appConfig.apiurl + "PromoAndDiscount/parepareShopDataFromExcel"
        this.http.post(url, param, this.manager.getOptions()).subscribe(
          (data:any) => {
            if(data.length > 0) {
              this.shopListFromExcel = data;
              for(let i = 0; i < this.shopListFromExcel.length; i++){
                let sameShopCheck = false;
                sameShopCheck = this.saveData.volDisShopJuncDataList.some(
                  tempShopData => tempShopData.n1 == this.shopListFromExcel[i].n1
                );
  
                if(sameShopCheck == false){
                  this.tempSaveData.promoAndDisJunDataList.push(this.shopListFromExcel[i]);
                }
              }
              if(this.tempSaveData.promoAndDisJunDataList.length > 0) { //  volDisShopJuncDataList -- promoAndDisJunDataList//-
                this.addShop();
              } else {
                this.manager.showToast(this.tostCtrl, "Message", "Already Added", 2000);
              }
              this.resetValue();
              loadEl.dismiss();
              console.log(data);
            } else {
              loadEl.dismiss();
              this.manager.showToast(this.tostCtrl, "No applied shop!", "", 2000);
            }
        }, error => {
          loadEl.dismiss();
          console.log(error);
        }
        );
      } else {
        loadEl.dismiss();
        this.manager.showToast(this.tostCtrl, "Message", "Please Choose File!", 2000);
      }
    })
  }

  forjsondata1() {
    return {
      "SHOP_CODE": "",
      "SHOP_DESC": ""
    };
  }

  forjsondata2() {
    return {
      uploadData: [
        {
          "SHOP_CODE": "",
          "SHOP_DESC": ""
        }
      ]
    };
  }

  shopTabClick() {
    this.importload = "";
  }
  
  getCriteriaData(){
    return {
      "discountCode": "",
      "discountDesc": "",
      "discountPercent": "",
      "shopDesc": "",
      "brandOwner": "",
      "operator": "",
      "disType": "",
      "disAmt": "",
      "disItem": "",
      "disItemQty": "",
      "fromDate": "",
      "toDate": "",
      "startDate": "",
      "endDate": "",
      "current": "",
      "maxRows": "",
      "inActiveFlag": "0",
      "tsCheck": ""
    };
  }

  getShopListPageChangeData(){
    return {
      "shopDesc": "",
      "townDesc": "",
      "townshipSyskey": "",
      "maxRow": this.shopListItemPerPage,
      "current": "0"
    };
  }

  getTempSaveData(){
    return {
      "invDisSyskey": "",
      "invDisDate": "",
      "invDisCode": "",
      "invDisDesc": "",
      "invDisStatus": true,
      "promoAmt": "",
      "disType": "",
      "disPriceType": "",
      "disAmt": "",
      "giftSyskey": "",
      "giftDesc": "",
      "giftQty": "",
      "disItemType": "",
      "fromDate": "",
      "toDate": ""
    };
  }

  getSaveData(){
    return {
      "syskey": "",
      "userSyskey": sessionStorage.getItem("usk"),
      "userId": sessionStorage.getItem("uid"),
      "userName": sessionStorage.getItem("uname"),
      "n1": "1",
      "n2": "0",
      "n3": "0",
      "t1": "",
      "t2": "",
      "t3": "",
      "t4": "",
      "promoAndDisJunDataList": [],
      "volDisShopJuncDataList": [], // to test
      "invDisDetailList": []
    };
  }

  getInvDisDtlDataList(){
    return {
      "syskey": "",
      "recordStatus": "",
      "n1": "0",
      "n2": "",
      "n3": "",
      "n4": "",
      "n5": "",
      "n6": "",
      "n7": "",
      "n8": "",
      "n9": "",
      "n10": "",
      "n11": "",
      "t1": "",
      "t2": "",
      "t3": "",
      "t4": "",
      "t5": "",
      "t6": "",
      "getGiftList": []
    };
  }

  getPromoAndDisJunDataList(){
    return {
      "syskey": "",
      "n1": "0",
      "n3": "0",
      "n4": "0",
      "t1": "",
      "t3": "",
      "townSyskey": "",
      "recordStatus": "",
      "shopCode": "",
      "address": ""
    };
  }

  getGetGiftData(){
    return {
      "syskey": "",
      "recordStatus": "",
      "rsTemp":"",
      "n1": "",
      "n2": "",
      "n3": "",
      "n4": "",
      "n5": "",
      "n6": "",
      "n7": "",
      "t1": "",
    };
  }

  /*
  getTempBOtempData(){
    return {
      "n11": "",
      "t3": ""
    };
  }
  */
}