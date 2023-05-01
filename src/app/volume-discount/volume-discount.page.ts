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
  selector: 'app-volume-discount',
  templateUrl: './volume-discount.page.html',
  styleUrls: ['./volume-discount.page.scss'],
})
export class VolumeDiscountPage implements OnInit {
  @ViewChild('chosefile', {static: false}) myInputVariable: ElementRef;
  config =  {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0,
    id: "configId"
  };
  config1 =  {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  shopListItemPerPage = 20;

  spinner: boolean = false;
  searchtab: boolean = false;
  btn: any = false;
  dtlFlag: any = false;
  tsLoadingFlag: any = false;

  criteria: any = this.getCriteriaData();
  searchCriteria: any = this.getCriteriaData();
  dropdown = false;
  headerList: any = [];
  saveData: any = this.getSaveData();
  tempE: any = {
    "currentTarget": {
      "checked": false
    }
  };

  vdCodeSearch: FormControl = new FormControl();
  disItemSearch: FormControl = new FormControl();
  vdDescSearch: FormControl = new FormControl();
  promoItemSearch: FormControl = new FormControl();
  brandOwnerSearch: FormControl = new FormControl();

  vdCodeList: any = [];
  disItemList: any = [];
  vdDescList: any = [];
  promoItemList: any = [];
  brandOwnerList: any = [];

  tempSaveData: any = this.getSaveData();
  townList: any = [];
  tempSearch: any = this.getShopListPageChangeData();
  tempSearchCri: any = this.getShopListPageChangeData();
  // saveDataDates: any = {
  //   "fromDate": "",
  //   "toDate": ""
  // };
  detailDataList: any = this.getVolDisDtlDataList();

  updateIndex: any = -1;

  vendorSearch: FormControl = new FormControl();
  promoItemInfoSearch: FormControl = new FormControl();
  giftSearch: FormControl = new FormControl();
  couponSearch: FormControl = new FormControl();

  vendorList: any = [];
  promoItemInfoList: any = [];
  giftList: any = [];
  couponList: any = [];

  tempSearch1: any = this.getItemSearch1Data();
  itemList: any = [];

  serialNo = 1;
  giftSerialNo = 1;
  tempShopList: any = [];
  // getGiftData: any = this.getGetGiftData();
  getGiftDataList: any = [];
  tempGiftDataList : any = [];
  tempGiftDataList1 : any = [];
  size = 0;

  isShow: any = false;
  inkindEditFlag: any = false;
  importload: any;
  each_sheet_data: any = this.forjsondata1();
  all_sheet_data: any = this.forjsondata2();
  uploadedFileName: string = "";
  uploadFile: File;
  selectedFile: File;
  _shoplistdata: any = [];
  value: any;
  shopListFromExcel: any = [];

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
    $("#volDisNew").hide();
    $("#volDisList").show();
    $("#volDisList-tab").tab("show");
    $('#saveVolDisCode').css('border-color', '');
    this.disItemSearch.disable();

    this.btn = false;
    this.dtlFlag = false;
    this.isShow = false;

    this.manager.isLoginUser();

    this.clearProperties();
    this.runSpinner(true);
    this.allList();
    this.runSpinner(false);
    this.getAllDataList();
  }

  volDisListTab(){
    $('#volDisNew').hide();
    $('#volDisList').show();

    this.btn = false;
    this.dtlFlag = false;

    this.clearProperties();
    this.getAllDataList();
    this.allList();
  }

  volDisNewTab(){
    $('#volDisList').hide();
    $('#volDisNew').show();
    $('#volDisHdr-tab').tab('show');
    $('#volDisHdr').show();
    $('#volDisShopJuncList').hide();
    $('#volDisDtlList').hide();
    $('#saveVolDisCode').css('border-color', '');
    // this.giftSearch.disable();
    $('#discountItem0').show();
    $('#discountItem1').hide();
    $('#discountItem2').hide();
    this.promoItemInfoSearch.disable();

    this.dtlFlag = false;
    this.btn = true;
    this.config1.currentPage = 1;

    this.clearProperties();
    // this.clearGetGiftList();
    // this.searchShop("0", 0, '');
    this.searchTownship();
  }

  hdrListTab(){
    $('#volDisDtlList').hide();
    $('#volDisShopJuncList').hide();
    $('#volDisHdr').show();
  }

  dtlListTab(){
    $('#volDisHdr').hide();
    $('#volDisShopJuncList').hide();
    $('#volDisDtlList').show();
  }

  shopJuncTab(){
    $('#volDisHdr').hide();
    $('#volDisDtlList').hide();
    $('#volDisShopJuncList').show();
    this.importload = "";
    this.uploadedFileName = "";
    this.shopListFromExcel = [];
    // this.uploadFile = new File();
  }

  advanceSearch(option) {
    this.searchtab = option;
  }

  runSpinner(t: boolean) {
    this.spinner = t;
  }

  advanceSearchReset(){
    this.criteria = this.getCriteriaData();
    this.searchCriteria = this.getCriteriaData();
    this.headerList = [];

    this.getAllDataList();
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
      $("#tDate").val("").trigger("change");
      this.manager.showToast(this.tostCtrl, "Message", "Add From Date First", 2000);
    } else {
      let tempFromDate = new Date(this.criteria.fromDate);
      let tempToDate = new Date(event.target.value);

      tempFromDate.setHours(0, 0, 0, 0);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.criteria.toDate = "";
        $("#tDate").val("").trigger("change");
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
      this.saveData.t3 = "";
      event.target.value = "";
      // $("#validFD").val("").trigger("change");
    } else if(this.saveData.t4 != "" || this.saveData.t4 != undefined){
      let tempToDate = new Date(this.saveData.t4);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.manager.showToast(this.tostCtrl, "Message", "From Date must be sooner than To Date", 5000);
        this.saveData.t3 = "";
        this.saveData.t4 = "";
      }
    }
  }

  dateChange4(event){
    if(this.saveData.t3 == "" || this.saveData.t3 == undefined){
      this.saveData.t4 = "";
      event.target.value = "";
      // $("#validTD").val("").trigger("change");
      this.manager.showToast(this.tostCtrl, "Message", "Add From Date First", 2000);
    } else {
      let tempFromDate = new Date(this.saveData.t3);
      let tempToDate = new Date(event.target.value);

      tempFromDate.setHours(0, 0, 0, 0);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.saveData.t4 = "";
        event.target.value = "";
        // $("#validTD").val("").trigger("change");
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
    this.saveData.t3 = "";
    this.saveData.t4 = "";
  }

  dblClickFunc4(){
    this.saveData.t4 = "";
  }

  dblClickFunc5(){
    this.criteria.startDate = "";
    this.criteria.endDate = "";
  }

  dblClickFunc6(){
    this.criteria.endDate = "";
  }

  focusFunction() {
    $('#saveVolDisCode').css('border-color', '');
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

  searchItem(){
    const url = this.manager.appConfig.apiurl +'pricezone/getAllItemByCategory';
    this.itemList = [];

    this.http.post(url, this.tempSearch1, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          if(data.dataList.length > 0){
            this.itemList = data.dataList;
            this.itemList.sort((a, b) => (a.CategoryDesc > b.CategoryDesc) ? 1 : -1);
  
            for(let i = 0; i < this.itemList.length; i++){
              this.itemList[i].subCatList.sort((a, b) => 
                (a.SubCategoryDesc > b.SubCategoryDesc) ? 1 : -1
              );
  
              for(let j = 0; j < this.itemList[i].subCatList.length; j++){
                this.itemList[i].subCatList[j].itemList.sort((a, b) => 
                  (a.ItemDesc > b.ItemDesc) ? 1 : -1
                );
              }
            }
          } else {
            this.manager.showToast(this.tostCtrl, "Message", "No Stock is existed for the selected Brand Owner", 3000);
          }
        }
      }
    );
  }

  promoItemSearching(){
    // this.itemList = [];

    if(this.detailDataList.n2 == "" || this.detailDataList.t2 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Valid Brand Owner", 2000);
      return;
    }

    $('#promoItem-Search').appendTo("body").modal('show');
  }

  addGiftList(flagValue, viewIndex){
    this.inkindEditFlag = flagValue;

    if(viewIndex >= 0){
      this.getGiftDataList = [];

      for(let i = 0; i < this.saveData.volDisDtlDataList[viewIndex].getGiftList.length; i++){
        this.getGiftDataList.push(this.commonDataExchange(this.saveData.volDisDtlDataList[viewIndex].getGiftList[i]));
      }
    }

    $('#addInkindDetail').appendTo("body").modal('show');

    // $("#addInkindDetail").modal(
    //   {
    //     backdrop: 'static',
    //     keyboard: false
    //   }
    // );

    // this.clearGetGiftData();
  }

  addpromoItem(selectedItem){
    this.detailDataList.n8 = selectedItem.ItemSyskey;
    this.detailDataList.t4 = selectedItem.ItemDesc;

    this.tempSearch1 = this.getItemSearch1Data();
    this.tempSearch1.brandOwner = this.detailDataList.n2;
    // this.itemList = [];
    // this.searchItem();

    $("#promoItem-Search").modal("hide");
  }

  criChange(cri_type, cri_id){
    if(cri_type == "1"){
      if(cri_id == "cri-disType"){
        this.criteria.disItem = "";
        this.criteria.disPriceType = "";
        this.criteria.disAmt = "";

        if(this.criteria.disType == "2"){
          this.disItemSearch.enable();
        } else {
          this.disItemSearch.disable();
        }
      } else if((cri_id == "cri-disItem" && this.criteria.disItem == "") || cri_id == "cri-disPriceType"){
        this.criteria.disAmt = "";
      }
    } else {    //if(cri_type == "2"){
      if(cri_id == "cri-promoItem" && this.criteria.promoItem == ""){
        this.criteria.promoType = "";
        this.criteria.promoAmt = "";
        this.criteria.operator = "";
      } else if(cri_id == "cri-promoType"){
        this.criteria.promoAmt = "";
        this.criteria.operator = "";
      } else if(cri_id == "cri-promoAmt" && this.criteria.promoAmt == ""){
        this.criteria.operator = "";
      }
    }
  }

  disTypeChange(){
    this.detailDataList.n4 = "";
    this.detailDataList.n5 = "";

    if (this.detailDataList.n3 == '1')
    {
        this.size = this.getGiftDataList.length;
        if ( this.size > 0)
        {

            this.getGiftDataList = this.getGiftDataList.filter(
              data => {
                  return data.syskey != '';
              }
            );

            this.getGiftDataList = this.getGiftDataList.map(
              data => {
                  data.rsTemp = data.recordStatus;
                  data.recordStatus = '4';
                  return data;
              }
            );

        }

    } else 
    { 
        this.size = this.getGiftDataList.length;
        if ( this.size >0)
        {
            this.getGiftDataList = this.getGiftDataList.map (
              data => {
                  data.recordStatus = data.rsTemp;
                  return data; 
              }
            );
        }
       
    }

    // this.clearGetGiftData();
    // this.detailDataList.t3 = "";
    // this.detailDataList.n6 = "";
    // this.detailDataList.n7 = "";
    // this.detailDataList.n12 = "";

    // $('#discountItem0').show();
    // $('#discountItem1').hide();
    // $('#discountItem2').hide();
  }

  /*
  disItemTypeChange(){
    if(this.getGiftData.n2 == "1"){
      $('#discountItem0').hide();
      $('#discountItem1').show();
      $('#discountItem2').hide();
    } else if(this.getGiftData.n2 == "2"){
      $('#discountItem0').hide();
      $('#discountItem1').hide();
      $('#discountItem2').show();
    } else {
      $('#discountItem0').show();
      $('#discountItem1').hide();
      $('#discountItem2').hide();
    }

    this.getGiftData.t1 = "";
  }
  */

  vendorChange(e){   //    n2
    let check = false;
    this.detailDataList.n8 = "";
    this.detailDataList.t4 = "";

    /*                    For Auto-Filled Search Textbox
    if(this.detailDataList.t2 != ""){
      for(let i = 0; i < this.vendorList.length; i++){
        if(this.vendorList[i].t2.toLowerCase() == this.detailDataList.t2.toLowerCase() 
            && this.vendorList[i].t2 != "No Record Found"){

          this.detailDataList.n2 = this.vendorList[i].syskey;
          this.detailDataList.t2 = this.vendorList[i].t2;
          check = true;
        }
      }

      if(check == false){
        this.detailDataList.n2 = "";
        this.promoItemInfoSearch.disable();
      } else {
        this.promoItemInfoSearch.enable();
      }
    } else {
      this.detailDataList.n2 = "";
      this.promoItemInfoSearch.disable();
    }
    */

    if(e.target.value != ""){
      for(let i = 0; i < this.vendorList.length; i++){
        if(this.vendorList[i].syskey == this.detailDataList.n2){
          this.detailDataList.t2 = this.vendorList[i].t2;
          check = true;
          break;
        }
      }

      if(check == false){
        this.detailDataList.n2 = "";
        this.detailDataList.t2 = "";
        this.promoItemInfoSearch.disable();
      } else {
        this.promoItemInfoSearch.enable();

        this.tempSearch1 = this.getItemSearch1Data();
        this.tempSearch1.brandOwner = this.detailDataList.n2;
        this.searchItem();
      }
    } else {
      this.detailDataList.n2 = "";
      this.detailDataList.t2 = "";
      this.promoItemInfoSearch.disable();
    }
  }

  promoItemChange(){    //    n8
    let check = false;

    if(this.detailDataList.t4 != ""){
      for(let i = 0; i < this.promoItemInfoList.length; i++){
        if(this.promoItemInfoList[i].skuName.toLowerCase() == this.detailDataList.t4.toLowerCase()
            && this.promoItemInfoList[i].skuName != "No Record Found"){

          this.detailDataList.n8 = this.promoItemInfoList[i].skusyskey;
          this.detailDataList.t4 = this.promoItemInfoList[i].skuName;
          check = true;
        }
      }
    
      if(check == false){
        this.detailDataList.n8 = "";
        // this.manager.showToast(this.tostCtrl, "Message", "Add existing Promo Item", 2000);
      }
    } else {
      this.detailDataList.n8 = "";
    }
  }

  /*
  discountItemChange(event, itemType){   //    n6
    let check = false;
    let itemList = [];

    if(itemType == "gift"){
      itemList = this.giftList;
    } else if(itemType == "coupon"){
      itemList = this.couponList;
    }

    if(this.getGiftData.t1 != ""){
      for(let i = 0; i < itemList.length; i++){
        if(itemType == "gift"){
          if(itemList[i].t2.toLowerCase() == this.getGiftData.t1.toLowerCase()
              && itemList[i].t2 != "No Record Found"){

            this.getGiftData.n3 = itemList[i].syskey;
            this.getGiftData.t1 = itemList[i].t2;
            
            check = true;

            break;
          }
        } else if(itemType == "coupon"){
          if(itemList[i].t1.toLowerCase() == this.getGiftData.t1.toLowerCase()
              && itemList[i].t1 != "No Record Found"){

            this.getGiftData.n3 = itemList[i].syskey;
            this.getGiftData.t1 = itemList[i].t1;
            
            check = true;

            break;
          }
        }
        
        /*
        if(itemList[i].syskey == this.getGiftData.syskey
            && itemList[i].syskey != ""){

          this.getGiftData.n3 = itemList[i].syskey;

          if(itemType == "gift"){
            this.getGiftData.t1 = itemList[i].t2;
          } else if(itemType == "coupon"){
            this.getGiftData.t1 = itemList[i].t1;
          }
          
          check = true;

          break;
        }
        /
      }
    
      if(check == false){
        this.getGiftData.n3 = "";
        // this.manager.showToast(this.tostCtrl, "Message", "Add existing Dis Item", 2000);
      }
    } else {
      this.getGiftData.n3 = "";
    }
  }
  */

  endTypeChange(){
    $('#discountItem0').show();
    $('#discountItem1').hide();
    $('#discountItem2').hide();

    this.detailDataList.n3 = "";
    this.detailDataList.n4 = "";
    this.detailDataList.n5 = "";
    this.detailDataList.n6 = "";
    this.detailDataList.n7 = "";
    this.detailDataList.n12 = "";
    this.detailDataList.t3 = "";

    if(this.detailDataList.n15 == '0')
    { 
      this.size = 0; 
      this.size = this.getGiftDataList.length;
      if (this.size > 0)
      { 

        this.getGiftDataList = this.getGiftDataList.map(
          data => {
            data.recordStatus = data.rsTemp;
            return data;
          }
        );

      }
    } else {
      this.size = 0; 
      this.size = this.getGiftDataList.length;
      if (this.size > 0)
      {

        this.getGiftDataList = this.getGiftDataList.filter(
          data => {
            return data.syskey != ''; 
          }
        );

        this.getGiftDataList = this.getGiftDataList.map(
          data => {
            data.rsTemp = data.recordStatus;
            data.recordStatus = "4";
            return data;
          }
        );

      }
    }

  }

  volDisHdrStatusChange(detail){
    const param = {
      "n1": detail.n1 ? "0": "1",
      "syskey":detail.syskey
    };

    this.volDisHdrStatusChangeService(param).then( 
      ()=>{
        this.manager.showToast(this.tostCtrl, "Message", "Status changed", 1000);
      }
    ).catch( 
      ()=>{
        detail.n1 = detail.n1? false : true;
        this.manager.showToast(this.tostCtrl, "Message", "Status didn't change", 1000);
      }
    );
  }

  volDisHdrStatusChangeService(p){
    return new Promise<void>( 
      (done,reject)=>{
        const url = this.manager.appConfig.apiurl +'PromoAndDiscount/volDisHdrStatusChange';

        this.http.post(url, p, this.manager.getOptions()).subscribe(
          (data:any) =>{
            if(data.message == "SUCCESS"){
              done();
              
            } else {
              reject();
            
            }
          },
          error=>{
            reject()
          }
        );
      }
    );
  }

  pmo7StatusChange(e, passData){
    const url = this.manager.appConfig.apiurl +'PromoAndDiscount/pmo7StatusChange';

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

  pmo7RecordStatusChange(e, passData){
    if(passData.recordStatus == "1"){
      passData.recordStatus = "4";

      this.saveData.changesAndNewShopList.push(passData);
    } else if(passData.recordStatus == "4"){
      passData.recordStatus = "1";

      this.saveData.changesAndNewShopList = this.saveData.changesAndNewShopList.filter(
        data => {
          return data.syskey != passData.syskey;
        }
      );
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

    /*
    this.http.post(url, this.tempSearchCri, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          let configId = "";
          this.townList = data.dataList;
          this.townList.sort((a, b) => (a.TownDesc > b.TownDesc) ? 1 : -1);

          for(let i = 0; i < this.townList.length; i++){
            this.townList[i].ShopDataList.sort((a, b) => (a.shopName > b.shopName) ? 1 : -1);

            configId = "shopConfig" + i;
            this.townList[i].shopListConfig = {
              itemsPerPage: this.shopListItemPerPage,
              currentPage: 1,
              totalItems: this.townList[i].Count,
              id: configId,
              panelExpanded: false
            };

            if(curPage > 0){
              this.townList[i].shopListConfig.currentPage = curPage;
              this.townList[i].panelExpanded = true;
            }
            
          }
        }
      }
    );
    */
  }

  checkedSelectedShop(pageChangeFlag, passShopList){
    for(let i = 0; i < passShopList.length; i++){
      this.tempSaveData.volDisShopJuncDataList.map(
        data => {
          if(data.n2 == passShopList[i].shopSysKey){
            passShopList[i].checkFlag = true;
          }
        }
      );
    }

    /*
    let check = false;
    let cbid = "";

    if(pageChangeFlag){

      for(let i = 0; i < passShopList.length; i++){
        check = this.tempSaveData.volDisShopJuncDataList.some(
          data => data.n2 == passShopList[i].shopSysKey
        );

        if(check){
          cbid = "#" + passShopList[i].shopSysKey + "";
          $(cbid).prop('checked', true);
        }
      }
    } else {
      for(let i = 0; i < this.tempSaveData.volDisShopJuncDataList.length; i++){
        // check = passShopList.some(
        //   data => data.shopSysKey == this.tempSaveData.volDisShopJuncDataList[i].n2
        // );

        // if(check){
        //   cbid = "#" + passShopList[i].shopSysKey + "";
        //   $(cbid).prop('checked', true);
        // }

        passShopList.map(
          data => {
            if(data.shopSysKey = this.tempSaveData.volDisShopJuncDataList.n2){
              data.checkFlag = true;
            }
          }
        );
      }
    }
    */
  }

  searchAppliedShop(e){
    let searchValue = e.target.value.toString().toLowerCase();
    this.config1.currentPage = 1;

    this.searchAppliedShop1(searchValue);
  }

  searchAppliedShop1(searchValue){
    this.tempShopList = this.saveData.volDisShopJuncDataList.filter(
      shopList => {
        return shopList.t2.toLowerCase().includes(searchValue);
      }
    );
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
              sameShopCheck = this.tempSaveData.volDisShopJuncDataList.some(
                tempShopData => tempShopData.n2 == shopList[i].shopSysKey
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

  /*          Work fine with "selectTown" func
  selectAllShopByTown(e, tsSyskey){
    const url = this.manager.appConfig.apiurl +'shop/getAllShopByTownSK';

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
  */

  selectShop(e, townshipData, storeData, allFlag){  //  townshipData = tsIndex, storeData = shopIndex
    let returnTempData = this.getVolDisJunDataList();
    let found = false;
    // let cbid = "";

    if(e.currentTarget.checked){
      for(let i = 0; i < this.saveData.volDisShopJuncDataList.length; i++){
        if(this.saveData.volDisShopJuncDataList[i].n2 == storeData.shopSysKey){
          found = true;
          break;
        }
      }
  
      if(found == false){
        returnTempData.syskey = "";
        returnTempData.n1 = this.saveData.syskey;
        returnTempData.n2 = storeData.shopSysKey;  //  this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey;
        returnTempData.n3 = "1";
        returnTempData.t1 = "";
        returnTempData.t2 = storeData.shopName;  //  this.townList[tsIndex].ShopDataList[shopIndex].shopName;
        returnTempData.t3 = "";
        returnTempData.t4 = "";
        returnTempData.recordStatus = "1";
        returnTempData.townSyskey = townshipData.TownSyskey;  //  this.townList[tsIndex].TownSyskey;
        returnTempData.shopCode = storeData.shopCode;  //  this.townList[tsIndex].ShopDataList[shopIndex].shopCode;
        returnTempData.address = storeData.address;  // this.townList[tsIndex].ShopDataList[shopIndex].address;
  
        this.tempSaveData.volDisShopJuncDataList.push(returnTempData);

        // cbid = "#townCb" + tsIndex + "and" + shopIndex;
        // cbid = "#" + this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey + "";
        // $(cbid).prop('checked', true);
  
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
        // cbid = "#townCb" + tsIndex + "and" + shopIndex;
        // cbid = "#" + this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey + "";
        // $(cbid).prop('checked', false);

        if(!allFlag){
          // storeData.checkFlag = false;

          let cbid = "#" + storeData.shopSysKey + "";
          $(cbid).prop('checked', false);

          this.manager.showToast(this.tostCtrl, "Message", "Already Added", 2000);
        }
      }
    } else {
      for(let i = 0; i < this.tempSaveData.volDisShopJuncDataList.length; i++){
        if(this.tempSaveData.volDisShopJuncDataList[i].n2 == storeData.shopSysKey){
          // cbid = "#townCb" + tsIndex + "and" + shopIndex;
          // cbid = "#" + this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey + "";
          // $(cbid).prop('checked', false);

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

          this.tempSaveData.volDisShopJuncDataList.splice(i, 1);
          break;
        }
      }
    }
  }

  addShop(){
    let cbid = "";

    // if(this.saveDataDates.fromDate == ""){
    //   this.manager.showToast(this.tostCtrl, "Message", "Add From Date", 2000);
    // } else if(this.saveDataDates.toDate == ""){
    //   this.manager.showToast(this.tostCtrl, "Message", "Add To Date", 2000);
    // } else {

    if(this.tempSaveData.volDisShopJuncDataList.length > 0){
      this.tsLoadingFlag = true;

      for(let i = 0; i < this.tempSaveData.volDisShopJuncDataList.length; i++){
        for(let j = 0; j < this.townList.length; j++){
          if(this.tempSaveData.volDisShopJuncDataList[i].townSyskey == this.townList[j].TownSyskey){
            /*
            cbid = "#townCombo" + j + "";

            for(let k = 0; k < this.townList[j].ShopDataList.length; k++){
              if(this.tempSaveData.volDisShopJuncDataList[i].n2 == this.townList[j].ShopDataList[k].shopSysKey){
                this.townList[j].ShopDataList.splice(k, 1);
                break;
              }
            }
            */

            cbid = "#" + this.townList[j].TownSyskey + "";
            $(cbid).prop('checked', false);

            this.townList[j].ShopDataList.map(
              data => {
                if(data.shopSysKey == this.tempSaveData.volDisShopJuncDataList[i].n2){
                  data.checkFlag = false;
                }
              }
            );

            break;
          }
        }

        let returnTempData = this.getVolDisJunDataList();
        returnTempData.syskey = "";
        returnTempData.n1 = this.tempSaveData.volDisShopJuncDataList[i].n1;
        returnTempData.n2 = this.tempSaveData.volDisShopJuncDataList[i].n2;
        returnTempData.n3 = this.tempSaveData.volDisShopJuncDataList[i].n3;
        returnTempData.t1 = "";
        returnTempData.t2 = this.tempSaveData.volDisShopJuncDataList[i].t2;
        // returnTempData.t3 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.saveDataDates.fromDate).toString();
        // returnTempData.t4 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.saveDataDates.toDate).toString();
        returnTempData.t3 = "";
        returnTempData.t4 = "";
        returnTempData.recordStatus = this.tempSaveData.volDisShopJuncDataList[i].recordStatus;
        returnTempData.townSyskey = this.tempSaveData.volDisShopJuncDataList[i].townSyskey;
        returnTempData.shopCode = this.tempSaveData.volDisShopJuncDataList[i].shopCode;
        returnTempData.address = this.tempSaveData.volDisShopJuncDataList[i].address;
        
        this.saveData.volDisShopJuncDataList.push(returnTempData);
        this.saveData.changesAndNewShopList.push(returnTempData);
        this.tempShopList.push(returnTempData);
        // this.saveData.volDisShopJuncDataList.push(this.tempSaveData.volDisShopJuncDataList[i]);
      }
  
      this.saveData.volDisShopJuncDataList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
      this.tempShopList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
      this.searchAppliedShop1("");

      this.tempSaveData.volDisShopJuncDataList.splice(0, this.tempSaveData.volDisShopJuncDataList.length);

      $("#searchBoxAS").val("");

      // this.saveDataDates.fromDate = "";
      // this.saveDataDates.toDate = "";

      this.tsLoadingFlag = false;
    } else {
      this.manager.showToast(this.tostCtrl, "Message", "Choose some shops", 2000);
    }

    // }
  }

  removeShop(e, index){
    /*
    let returnTempData = {
      "shopSysKey": "",
      "shopCode": "",
      "shopName": "",
      "address": ""
    };

    for(let i = 0; i < this.townList.length; i++){
      if(this.townList[i].TownSyskey == this.tempShopList[index].townSyskey){
        let check = this.townList[i].ShopDataList.some(
          data => data.shopSysKey == this.tempShopList[index].n2
        );

        if(!check){
          returnTempData = {
            "shopSysKey": "",
            "shopCode": "",
            "shopName": "",
            "address": ""
          };
  
          returnTempData.shopSysKey = this.tempShopList[index].n2;
          returnTempData.shopCode = this.tempShopList[index].shopCode;
          returnTempData.shopName = this.tempShopList[index].t2;
          returnTempData.address = this.tempShopList[index].address;
  
          this.townList[i].ShopDataList.push(returnTempData);
          this.townList[i].ShopDataList.sort((a, b) => (a.shopName > b.shopName) ? 1 : -1);
        }
  
        break;
      }
    }
    */

    for(let j = 0; j < this.saveData.volDisShopJuncDataList.length; j++){
      if(this.saveData.volDisShopJuncDataList[j].n2 == this.tempShopList[index].n2){
        this.saveData.volDisShopJuncDataList.splice(j, 1);
        break;
      }
    }

    for(let j = 0; j < this.saveData.changesAndNewShopList.length; j++){
      if(this.saveData.changesAndNewShopList[j].n2 == this.tempShopList[index].n2){
        this.saveData.changesAndNewShopList.splice(j, 1);
        break;
      }
    }

    this.tempShopList.splice(index, 1);
  }

  /*
  removeGiftData(dtlIndex){
    if(this.getGiftDataList[dtlIndex].syskey != ""){
      if(this.getGiftDataList[dtlIndex].recordStatus == "1"){
        this.getGiftDataList[dtlIndex].recordStatus = "4";
      } else if(this.getGiftDataList[dtlIndex].recordStatus == "4"){
        this.getGiftDataList[dtlIndex].recordStatus = "1";
      }
    } else {
      this.getGiftDataList.splice(dtlIndex, 1);
    }

    let tempI = 0;
    for(var i = 0; i < this.getGiftDataList.length; i++){
      if(this.getGiftDataList[i].recordStatus == "4"){
        this.getGiftDataList[i].n5 = "0";
      } else {
        tempI++;
        this.getGiftDataList[i].n5 = "" + tempI;
      }
    }
    this.giftSerialNo = tempI + 1;
  }

  addGetGift(){
    let getGifttemp = this.getGetGiftData();

    getGifttemp.syskey = "";
    getGifttemp.recordStatus = "1";
    getGifttemp.n1 = "";
    getGifttemp.n2 = this.getGiftData.n2;
    getGifttemp.n3 = this.getGiftData.n3;
    getGifttemp.n4 = this.getGiftData.n4;
    getGifttemp.n5 = this.giftSerialNo.toString();
    getGifttemp.n6 = this.getGiftData.n6;
    getGifttemp.t1 = this.getGiftData.t1;

    this.getGiftDataList.push(getGifttemp);
    this.giftSerialNo++;
    this.clearGetGiftData();
  }

  updateGetGiftData(index){

  }
  */

  modifyGetGiftList(e){
    this.getGiftDataList = [];

    if(e.length > 0){
      // let tempInkindData = this.getGetGiftData();

      for(var i = 0; i < e.length; i++){
        /*
        tempInkindData = this.getGetGiftData();

        tempInkindData.syskey = e[i].syskey;
        tempInkindData.recordStatus = e[i].recordStatus;
        tempInkindData.n1 = e[i].n1;
        tempInkindData.n2 = e[i].n2;
        tempInkindData.n3 = e[i].n3;
        tempInkindData.n4 = e[i].n4;
        tempInkindData.n5 = e[i].n5;
        tempInkindData.n6 = e[i].n6;
        tempInkindData.t1 = e[i].t1;
        */
  
        this.getGiftDataList.push(this.commonDataExchange(e[i]));
      }
    }

    $('#addInkindDetail').modal('toggle');
  }

  addDtlValidation(){
    if(this.detailDataList.n17 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Detail Rule Number", 2000);
      return false;
    }

    if(this.detailDataList.n16 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Detail Rule Priority", 2000);
      return false;
    }

    if(this.detailDataList.n15 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Detail End Type", 2000);
      return false;
    }

    if(this.detailDataList.n2 == "" || this.detailDataList.t2 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Detail Brand Owner", 2000);
      return false;
    }

    if(this.detailDataList.n8 == "" || this.detailDataList.t4 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Detail Promo Item", 2000);
      return false;
    }

    if(this.detailDataList.n9 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Detail Promotion Requirement", 2000);
      return false;
    }

    if(this.detailDataList.n14 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Detail Rule Type", 2000);
      return false;
    }

    if(this.detailDataList.n18 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Detail Get Type", 2000);
      return false;
    }

    if(this.detailDataList.n18 == "1"){
      if(this.detailDataList.n19 == ""){
        this.manager.showToast(this.tostCtrl, "Message", "Add Detail Buy Limit", 2000);
        return false;
      }
    }

    if(this.detailDataList.n11 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Detail Operator", 2000);
      return false;
    }

    if(this.detailDataList.n10 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Detail Revenue 1", 2000);
      return false;
    }

    if(this.detailDataList.n11 == "5"){
      if(this.detailDataList.n13 == ""){
        this.manager.showToast(this.tostCtrl, "Message", "Add Detail Revenue 2", 2000);
        return false;
      }
    }

    if(this.detailDataList.n15 == "0"){
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
          if(this.detailDataList.n5 < 0 || this.detailDataList.n5 > 100){
            this.manager.showToast(this.tostCtrl, "Message", "Not a Valid Percent Amount", 2000);
            return false;
          }
        }
  
        /*
        for(let i = 0; i < this.saveData.volDisDtlDataList.length; i++){
          if(this.saveData.volDisDtlDataList[i].n2 == this.detailDataList.n2 
              && this.saveData.volDisDtlDataList[i].n8 == this.detailDataList.n8 
              && this.saveData.volDisDtlDataList[i].n9 == this.detailDataList.n9 
              && this.saveData.volDisDtlDataList[i].n10 == this.detailDataList.n10 
              && this.saveData.volDisDtlDataList[i].n13 == this.detailDataList.n13 
              && this.saveData.volDisDtlDataList[i].n11 == this.detailDataList.n11 
              && this.saveData.volDisDtlDataList[i].n4 == this.detailDataList.n4 
              && this.saveData.volDisDtlDataList[i].n5 == this.detailDataList.n5){
    
            this.manager.showToast(this.tostCtrl, "Message", "Add Different Promotion Rule", 2000);
            return false;
          }
        }
        */
  
        this.detailDataList.n7 = "0";
      } else {
        if(this.getGiftDataList.length < 1){
          this.manager.showToast(this.tostCtrl, "Message", "Add Inkind Detail", 2000);
          return false;
        }

        /*
        if(this.detailDataList.n12 == ""){
          this.manager.showToast(this.tostCtrl, "Message", "Add Detail Dis Item Type", 2000);
          return false;
        }
  
        if(this.detailDataList.n6 == "" || this.detailDataList.t3 == ""){
          this.manager.showToast(this.tostCtrl, "Message", "Add Detail Dis Item", 2000);
          return false;
        }
  
        if(this.detailDataList.n7 == ""){
          this.manager.showToast(this.tostCtrl, "Message", "Add Detail Dis Item Qty", 2000);
          return false;
        }
        */
  
        /*
        for(let i = 0; i < this.saveData.volDisDtlDataList.length; i++){
          if(this.saveData.volDisDtlDataList[i].n2 == this.detailDataList.n2 
              && this.saveData.volDisDtlDataList[i].n8 == this.detailDataList.n8 
              && this.saveData.volDisDtlDataList[i].n9 == this.detailDataList.n9 
              && this.saveData.volDisDtlDataList[i].n10 == this.detailDataList.n10 
              && this.saveData.volDisDtlDataList[i].n13 == this.detailDataList.n13 
              && this.saveData.volDisDtlDataList[i].n11 == this.detailDataList.n11 
              && this.saveData.volDisDtlDataList[i].n6 == this.detailDataList.n6 
              && this.saveData.volDisDtlDataList[i].n7 == this.detailDataList.n7 
              && this.saveData.volDisDtlDataList[i].n12 == this.detailDataList.n12){
    
            this.manager.showToast(this.tostCtrl, "Message", "Add Different Promotion Rule", 2000);
            return false;
          }
        }
        */
  
        this.detailDataList.n4 = "0";
        this.detailDataList.n5 = "0";
      }
    }

    return true;
  }

  addDtlLine(){
    if(this.addDtlValidation()){
      if(this.updateIndex < 0){
        let tempDtlLine = this.getVolDisDtlDataList();

        tempDtlLine.n6 = "0";
        tempDtlLine.n7 = "0";
        tempDtlLine.n12 = "0";
        tempDtlLine.t3 = "";
  
        tempDtlLine.n1 = this.saveData.syskey;
        tempDtlLine.n2 = this.detailDataList.n2;
        tempDtlLine.n3 = this.detailDataList.n3;
        tempDtlLine.n8 = this.detailDataList.n8;
        tempDtlLine.n9 = this.detailDataList.n9;
        tempDtlLine.n10 = this.detailDataList.n10;
        tempDtlLine.n11 = this.detailDataList.n11;
        tempDtlLine.n13 = this.detailDataList.n13;
        tempDtlLine.n14 = this.detailDataList.n14;
        tempDtlLine.n15 = this.detailDataList.n15;
        tempDtlLine.n16 = this.detailDataList.n16;
        tempDtlLine.n17 = this.detailDataList.n17;
        tempDtlLine.n18 = this.detailDataList.n18;
        tempDtlLine.n19 = this.detailDataList.n19;
        tempDtlLine.n20 = this.serialNo.toString();
        this.serialNo++;

        if(this.detailDataList.n3 == "1"){
          tempDtlLine.n4 = this.detailDataList.n4;
          tempDtlLine.n5 = this.detailDataList.n5;

          /*
          tempDtlLine.n6 = "0";
          tempDtlLine.n7 = "0";
          tempDtlLine.n12 = "0";
          tempDtlLine.t3 = "";
          */

          tempDtlLine.getGiftList = [];
        } else {
          tempDtlLine.n4 = "";
          tempDtlLine.n5 = "";

          /*
          tempDtlLine.n6 = this.detailDataList.n6;
          tempDtlLine.n7 = this.detailDataList.n7;
          tempDtlLine.n12 = this.detailDataList.n12;
          tempDtlLine.t3 = this.detailDataList.t3;
          */

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
        tempDtlLine.t2 = this.detailDataList.t2;
        tempDtlLine.t4 = this.detailDataList.t4;
        tempDtlLine.t5 = "";
  
        this.saveData.volDisDtlDataList.push(tempDtlLine);
      } else {
        this.saveData.volDisDtlDataList[this.updateIndex].n6 = "";
        this.saveData.volDisDtlDataList[this.updateIndex].n7 = "";
        this.saveData.volDisDtlDataList[this.updateIndex].n12 = "";
        this.saveData.volDisDtlDataList[this.updateIndex].t3 = "";
        
        this.saveData.volDisDtlDataList[this.updateIndex].syskey = this.detailDataList.syskey;
        this.saveData.volDisDtlDataList[this.updateIndex].recordStatus = this.detailDataList.recordStatus;
  
        this.saveData.volDisDtlDataList[this.updateIndex].n1 = this.detailDataList.n1;
        this.saveData.volDisDtlDataList[this.updateIndex].n2 = this.detailDataList.n2;
        this.saveData.volDisDtlDataList[this.updateIndex].n3 = this.detailDataList.n3;
        this.saveData.volDisDtlDataList[this.updateIndex].n8 = this.detailDataList.n8;
        this.saveData.volDisDtlDataList[this.updateIndex].n9 = this.detailDataList.n9;
        this.saveData.volDisDtlDataList[this.updateIndex].n10 = this.detailDataList.n10;
        this.saveData.volDisDtlDataList[this.updateIndex].n11 = this.detailDataList.n11;
        this.saveData.volDisDtlDataList[this.updateIndex].n13 = this.detailDataList.n13;
        this.saveData.volDisDtlDataList[this.updateIndex].n14 = this.detailDataList.n14;
        this.saveData.volDisDtlDataList[this.updateIndex].n15 = this.detailDataList.n15;
        this.saveData.volDisDtlDataList[this.updateIndex].n16 = this.detailDataList.n16;
        this.saveData.volDisDtlDataList[this.updateIndex].n17 = this.detailDataList.n17;
        this.saveData.volDisDtlDataList[this.updateIndex].n18 = this.detailDataList.n18;
        this.saveData.volDisDtlDataList[this.updateIndex].n19 = this.detailDataList.n19;

        this.saveData.volDisDtlDataList[this.updateIndex].getGiftList = [];
        for(var v = 0; v < this.getGiftDataList.length; v++){
          this.saveData.volDisDtlDataList[this.updateIndex].getGiftList.push(this.commonDataExchange(this.getGiftDataList[v]));
        }

        if(this.detailDataList.n3 == "1"){
          this.saveData.volDisDtlDataList[this.updateIndex].n4 = this.detailDataList.n4;
          this.saveData.volDisDtlDataList[this.updateIndex].n5 = this.detailDataList.n5;

          /*
          this.saveData.volDisDtlDataList[this.updateIndex].n6 = "";
          this.saveData.volDisDtlDataList[this.updateIndex].n7 = "";
          this.saveData.volDisDtlDataList[this.updateIndex].n12 = "";
          this.saveData.volDisDtlDataList[this.updateIndex].t3 = "";
          */
        } else {
          this.saveData.volDisDtlDataList[this.updateIndex].n4 = "";
          this.saveData.volDisDtlDataList[this.updateIndex].n5 = "";

          /*
          this.saveData.volDisDtlDataList[this.updateIndex].n6 = this.detailDataList.n6;
          this.saveData.volDisDtlDataList[this.updateIndex].n7 = this.detailDataList.n7;
          this.saveData.volDisDtlDataList[this.updateIndex].n12 = this.detailDataList.n12;
          this.saveData.volDisDtlDataList[this.updateIndex].t3 = this.detailDataList.t3;
          */
        }

        this.saveData.volDisDtlDataList[this.updateIndex].t1 = "";
        this.saveData.volDisDtlDataList[this.updateIndex].t2 = this.detailDataList.t2;
        this.saveData.volDisDtlDataList[this.updateIndex].t4 = this.detailDataList.t4;
        this.saveData.volDisDtlDataList[this.updateIndex].t5 = this.detailDataList.t5;
      }

      this.clear();
    } else {

    }
  }

  updateDtlLine(event, dtlIndex){
    this.detailDataList.n6 = "";
    this.detailDataList.n7 = "";
    this.detailDataList.n12 = "";
    this.detailDataList.t3 = "";
    
    this.detailDataList.syskey = this.saveData.volDisDtlDataList[dtlIndex].syskey;
    this.detailDataList.recordStatus = this.saveData.volDisDtlDataList[dtlIndex].recordStatus;

    this.detailDataList.n1 = this.saveData.volDisDtlDataList[dtlIndex].n1;
    this.detailDataList.n2 = this.saveData.volDisDtlDataList[dtlIndex].n2;
    this.detailDataList.n3 = this.saveData.volDisDtlDataList[dtlIndex].n3;
    this.detailDataList.n8 = this.saveData.volDisDtlDataList[dtlIndex].n8;
    this.detailDataList.n9 = this.saveData.volDisDtlDataList[dtlIndex].n9;
    this.detailDataList.n10 = this.saveData.volDisDtlDataList[dtlIndex].n10;
    this.detailDataList.n11 = this.saveData.volDisDtlDataList[dtlIndex].n11;

    if(this.saveData.volDisDtlDataList[dtlIndex].n13 == "" || this.saveData.volDisDtlDataList[dtlIndex].n13 == "0"){
      this.detailDataList.n13 = "";
    } else {
      this.detailDataList.n13 = this.saveData.volDisDtlDataList[dtlIndex].n13;
    }
    
    this.detailDataList.n14 = this.saveData.volDisDtlDataList[dtlIndex].n14;
    this.detailDataList.n15 = this.saveData.volDisDtlDataList[dtlIndex].n15;
    this.detailDataList.n16 = this.saveData.volDisDtlDataList[dtlIndex].n16;
    this.detailDataList.n17 = this.saveData.volDisDtlDataList[dtlIndex].n17;
    this.detailDataList.n18 = this.saveData.volDisDtlDataList[dtlIndex].n18;

    if(this.saveData.volDisDtlDataList[dtlIndex].n19 == "" || this.saveData.volDisDtlDataList[dtlIndex].n19 == "0"){
      this.detailDataList.n19 = "";
    } else {
      this.detailDataList.n19 = this.saveData.volDisDtlDataList[dtlIndex].n19;
    }
    
    this.getGiftDataList = [];

    for(var v = 0; v < this.saveData.volDisDtlDataList[dtlIndex].getGiftList.length; v++){
      this.getGiftDataList.push(this.commonDataExchange(this.saveData.volDisDtlDataList[dtlIndex].getGiftList[v]));
    }

    if(this.detailDataList.n3 == "1"){
      this.detailDataList.n4 = this.saveData.volDisDtlDataList[dtlIndex].n4;
      this.detailDataList.n5 = this.saveData.volDisDtlDataList[dtlIndex].n5;

      /*
      this.detailDataList.n6 = "";
      this.detailDataList.n7 = "";
      this.detailDataList.n12 = "";
      this.detailDataList.t3 = "";
      */
    } else {
      this.detailDataList.n4 = "";
      this.detailDataList.n5 = "";

      if(this.saveData.volDisDtlDataList[dtlIndex].n7 == "" || this.saveData.volDisDtlDataList[dtlIndex].n7 == "0"){
        this.detailDataList.n7 = "";
      } else {
        this.detailDataList.n7 = this.saveData.volDisDtlDataList[dtlIndex].n7;
      }

      /*
      this.detailDataList.n6 = this.saveData.volDisDtlDataList[dtlIndex].n6;
      this.detailDataList.n7 = this.saveData.volDisDtlDataList[dtlIndex].n7;
      this.detailDataList.n12 = this.saveData.volDisDtlDataList[dtlIndex].n12;
      this.detailDataList.t3 = this.saveData.volDisDtlDataList[dtlIndex].t3;
      */
    }

    this.detailDataList.t1 = "";
    this.detailDataList.t2 = this.saveData.volDisDtlDataList[dtlIndex].t2;
    this.detailDataList.t4 = this.saveData.volDisDtlDataList[dtlIndex].t4;
    this.detailDataList.t5 = this.saveData.volDisDtlDataList[dtlIndex].t5;

    this.updateIndex = dtlIndex;

    this.promoItemInfoSearch.enable();
    /*
    if(this.detailDataList.n3 == "2"){
      if(this.detailDataList.n12 == "1"){
        // this.giftSearch.disable();
        $('#discountItem0').hide();
        $('#discountItem1').show();
        $('#discountItem2').hide();
      } else if(this.detailDataList.n12 == "2"){
        // this.giftSearch.enable();
        $('#discountItem0').hide();
        $('#discountItem1').hide();
        $('#discountItem2').show();
      } else {
        $('#discountItem0').show();
        $('#discountItem1').hide();
        $('#discountItem2').hide();
      }
    } else {
      $('#discountItem0').show();
      $('#discountItem1').hide();
      $('#discountItem2').hide();
    }
    */
  }

  deleteDtlLine(event, dtlIndex){
    if(this.saveData.volDisDtlDataList[dtlIndex].syskey != ""){
      if(this.saveData.volDisDtlDataList[dtlIndex].recordStatus == "1"){
        this.saveData.volDisDtlDataList[dtlIndex].recordStatus = "4";
      } else if(this.saveData.volDisDtlDataList[dtlIndex].recordStatus == "4"){
        this.saveData.volDisDtlDataList[dtlIndex].recordStatus = "1";
      }

      for(let i = 0; i < this.saveData.volDisDtlDataList[dtlIndex].getGiftList.length; i++){
        if(this.saveData.volDisDtlDataList[dtlIndex].getGiftList[i].recordStatus == "1"){
          this.saveData.volDisDtlDataList[dtlIndex].getGiftList[i].recordStatus = "4";
        } else if(this.saveData.volDisDtlDataList[dtlIndex].getGiftList[i].recordStatus == "4"){
          this.saveData.volDisDtlDataList[dtlIndex].getGiftList[i].recordStatus = "1";
        }
      }
    } else {
      this.saveData.volDisDtlDataList.splice(dtlIndex, 1);
    }

    let tempI = 0;
    for(var i = 0; i < this.saveData.volDisDtlDataList.length; i++){
      if(this.saveData.volDisDtlDataList[i].recordStatus == "4"){
        this.saveData.volDisDtlDataList[i].n20 = "0";
      } else {
        tempI++;
        this.saveData.volDisDtlDataList[i].n20 = "" + tempI;
      }
    }
    this.serialNo = tempI + 1;
  }

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

        const url = this.manager.appConfig.apiurl +'PromoAndDiscount/getAllVolDisList';

        this.http.post(url, this.criteria, this.manager.getOptions()).subscribe(
          (data:any) =>{
            el.dismiss();

            if(data.message == "SUCCESS"){
              this.config.totalItems = data.rowCount;
              this.config.currentPage = 1;

              this.headerList = data.dataList;

              for(var i = 0; i < this.headerList.length; i++){
                //1 for active, 0 for inactive
                this.headerList[i].n1 = this.headerList[i].n1 == 1 ? true:false;
                this.headerList[i].t3 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.headerList[i].t3);
                this.headerList[i].t4 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.headerList[i].t4);
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

        const url = this.manager.appConfig.apiurl +'PromoAndDiscount/getAllVolDisList';
        /*
        if(this.criteria.fromDate != ""){
          this.criteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
        }
        if(this.criteria.toDate != ""){
          this.criteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
        }
        */

        if(criFlag == true){
          this.searchCriteria.code = this.criteria.code;
          this.searchCriteria.desc = this.criteria.desc;
          this.searchCriteria.disType = this.criteria.disType;
          this.searchCriteria.disItem = this.criteria.disItem;
          this.searchCriteria.disPriceType = this.criteria.disPriceType;
          this.searchCriteria.disAmt = this.criteria.disAmt;
          this.searchCriteria.disItemQty = this.criteria.disItemQty;
          this.searchCriteria.brandOwner = this.criteria.brandOwner;
          this.searchCriteria.promoItem = this.criteria.promoItem;
          this.searchCriteria.promoType = this.criteria.promoType;
          this.searchCriteria.promoAmt = this.criteria.promoAmt;
          this.searchCriteria.operator = this.criteria.operator;

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
        }
        
        this.http.post(url, this.searchCriteria, this.manager.getOptions()).subscribe(
          (data:any) =>{
            el.dismiss();

            if(data.message == "SUCCESS"){
              this.config.totalItems = data.rowCount;

              if(currIndex == 0){
                this.config.currentPage = 1;
              }

              this.headerList = data.dataList;

              for(var i = 0; i < this.headerList.length; i++){
                this.headerList[i].n1 = this.headerList[i].n1 == 1 ? true:false; 
                this.headerList[i].t3 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.headerList[i].t3);
                this.headerList[i].t4 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.headerList[i].t4);
              }
            }
          }
        );
      }
    );
  }

  detail(e, index){
    $('#volDisNew-tab').tab('show');
    $('#volDisList').hide();
    $('#volDisNew').show();
    $('#volDisHdr-tab').tab('show');
    $('#volDisHdr').show();
    $('#volDisShopJuncList').hide();
    $('#volDisDtlList').hide();
    // this.giftSearch.disable();
    // $('#discountItem0').show();
    // $('#discountItem1').hide();
    // $('#discountItem2').hide();
    // this.clearGetGiftList();
    this.promoItemInfoSearch.disable();

    this.btn = true;
    this.dtlFlag = true;
    this.config1.currentPage = 1;

    this.saveData = this.getSaveData();
    this.tempSearch = this.getShopListPageChangeData();
    this.tempSearchCri = this.getShopListPageChangeData();
    this.townList = [];

    // this.searchShop("0", 0, '');

    this.saveData.syskey = this.headerList[index].syskey;
    this.saveData.n1 = this.headerList[index].n1;
    this.saveData.t1 = this.headerList[index].t1;
    this.saveData.t2 = this.headerList[index].t2;
    this.saveData.t3 = this.manager.dateFormatCorrector(this.manager.dateFormatter.UItoDTP, this.headerList[index].t3);
    this.saveData.t4 = this.manager.dateFormatCorrector(this.manager.dateFormatter.UItoDTP, this.headerList[index].t4);
    this.saveData.volDisDtlDataList = [];
    this.saveData.volDisShopJuncDataList = [];
    this.saveData.changesAndNewShopList = [];

    const url = this.manager.appConfig.apiurl + 'PromoAndDiscount/volDisSearchAutoFill';
    let sendTempData = {
      "syskey": this.headerList[index].syskey,
      "townCheck": "a",
      "zoneSyskey" : "0"
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
              let returnTempDtlDataList = [];
              let returnTempJuncDataList = [];
              let returnTempDtlData = this.getVolDisDtlDataList();
              let returnTempJuncData = this.getVolDisJunDataList();
    
              returnTempDtlDataList = data.dataList[0].volDisDtlDataList;
              returnTempJuncDataList = data.dataList[0].volDisShopJuncDataList;
    
              for(let i = 0; i < returnTempDtlDataList.length; i++){
                returnTempDtlData = this.getVolDisDtlDataList();
    
                returnTempDtlData.syskey = returnTempDtlDataList[i].syskey;
                returnTempDtlData.recordStatus = "1";
                returnTempDtlData.n1 = returnTempDtlDataList[i].n1;
                returnTempDtlData.n2 = returnTempDtlDataList[i].n2;
                returnTempDtlData.n3 = returnTempDtlDataList[i].n3.toString();
                returnTempDtlData.n4 = returnTempDtlDataList[i].n4.toString();
                returnTempDtlData.n5 = returnTempDtlDataList[i].n5.toString();
                returnTempDtlData.n6 = returnTempDtlDataList[i].n6;
                returnTempDtlData.n7 = returnTempDtlDataList[i].n7.toString();
                returnTempDtlData.n8 = returnTempDtlDataList[i].n8;
                returnTempDtlData.n9 = returnTempDtlDataList[i].n9.toString();
                returnTempDtlData.n10 = returnTempDtlDataList[i].n10.toString();
                returnTempDtlData.n11 = returnTempDtlDataList[i].n11.toString();
                returnTempDtlData.n12 = returnTempDtlDataList[i].n12.toString();
                returnTempDtlData.n13 = returnTempDtlDataList[i].n13.toString();
                returnTempDtlData.n14 = returnTempDtlDataList[i].n14.toString();
                returnTempDtlData.n15 = returnTempDtlDataList[i].n15.toString();
                returnTempDtlData.n16 = returnTempDtlDataList[i].n16.toString();
                returnTempDtlData.n17 = returnTempDtlDataList[i].n17.toString();
                returnTempDtlData.n18 = returnTempDtlDataList[i].n18.toString();
                returnTempDtlData.n19 = returnTempDtlDataList[i].n19.toString();
                returnTempDtlData.n20 = returnTempDtlDataList[i].n20.toString();
                returnTempDtlData.t1 = returnTempDtlDataList[i].t1;
                returnTempDtlData.t2 = returnTempDtlDataList[i].t2;
                returnTempDtlData.t3 = returnTempDtlDataList[i].t3;
                returnTempDtlData.t4 = returnTempDtlDataList[i].t4;
                returnTempDtlData.t5 = returnTempDtlDataList[i].t5;
                returnTempDtlData.getGiftList = returnTempDtlDataList[i].getGiftList;
                
                this.saveData.volDisDtlDataList.push(returnTempDtlData);
              }
              // this.saveData.volDisDtlDataList.sort((a, b) => (a.n20 > b.n20) ? 1 : -1);
              this.serialNo = returnTempDtlDataList.length + 1;
    
              for(let i = 0; i < returnTempJuncDataList.length; i++){
                returnTempJuncData = this.getVolDisJunDataList();
    
                returnTempJuncData.syskey = returnTempJuncDataList[i].syskey;
                returnTempJuncData.recordStatus = "1";
                returnTempJuncData.n1 = returnTempJuncDataList[i].n1;
                returnTempJuncData.n2 = returnTempJuncDataList[i].n2;
                returnTempJuncData.n3 = returnTempJuncDataList[i].n3;
                returnTempJuncData.t1 = returnTempJuncDataList[i].t1;
                returnTempJuncData.t2 = returnTempJuncDataList[i].t2;
                returnTempJuncData.t3 = returnTempJuncDataList[i].t3;
                returnTempJuncData.t4 = returnTempJuncDataList[i].t4;
                returnTempJuncData.townSyskey = returnTempJuncDataList[i].townSyskey;
                returnTempJuncData.shopCode = returnTempJuncDataList[i].shopCode;
                returnTempJuncData.address = returnTempJuncDataList[i].address;
    
                this.saveData.volDisShopJuncDataList.push(returnTempJuncData);
                this.tempShopList.push(returnTempJuncData);
              }
            }
            this.saveData.volDisShopJuncDataList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
            this.tempShopList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
    
            this.searchTownship();

            el.dismiss();
            
            // this.searchShop("0", 0, '');
    
            // this.tempShopList = this.saveData.volDisShopJuncDataList;
          }
        );
      }
    );
  }

  validationBeforeSave(){
    if(this.saveData.t1 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Header Code", 2000);
      return false;
    }
    
    if(this.saveData.t2 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Header Description", 2000);
      return false;
    }

    if(this.saveData.t3 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Header From Date", 2000);
      return false;
    }
    
    if(this.saveData.t4 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Header To Date", 2000);
      return false;
    }
    
    if(this.saveData.volDisDtlDataList.length < 1){
      this.manager.showToast(this.tostCtrl, "Message", "Add Promotion Rule", 2000);
      return false;
    }

    if(this.saveData.volDisShopJuncDataList.length < 1){
      this.manager.showToast(this.tostCtrl, "Message", "Add Shop", 2000);
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

        const url = this.manager.appConfig.apiurl +'PromoAndDiscount/saveVolumeDiscount';

        if(this.validationBeforeSave()){
          let tempFD: any;
          let tempTD: any;
          tempFD = this.saveData.t3;
          tempTD = this.saveData.t4;

          this.saveData.n1 = this.saveData.n1? 1:0;
          this.saveData.t3 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.saveData.t3);
          this.saveData.t4 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.saveData.t4);
          
          this.http.post(url, this.saveData, this.manager.getOptions()).subscribe(
            (data:any) =>{
              el.dismiss();

              if(data.message == "SUCCESS"){
                this.manager.showToast(this.tostCtrl, "Message", "Save Successful", 1000);
      
                $("#volDisNew").hide();
                $("#volDisList").show();
                $("#volDisList-tab").tab("show");
      
                this.btn = false;
                this.dtlFlag = false;
      
                this.clearProperties();
                this.allList();
                this.getAllDataList();
              } else if(data.message == "CODEEXISTED"){
                this.saveData.t3 = tempFD;
                this.saveData.t4 = tempTD;
                this.manager.showToast(this.tostCtrl, "Message", "Volume Discount Code Already Existed", 2000);
                $('#saveVolDisCode').css('border-color', 'red');
              } else {
                this.saveData.t3 = tempFD;
                this.saveData.t4 = tempTD;
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

  goDelete(){
    this.loading.create({
      message: "Processing..",

      backdropDismiss: false
    }).then(
      el => {
        el.present();

        const url = this.manager.appConfig.apiurl + 'PromoAndDiscount/deleteVolumeDiscount';

        this.http.post(url, this.saveData, this.manager.getOptions()).subscribe(
          (data:any) =>{
            el.dismiss();

            if(data.message == "SUCCESS"){
              this.manager.showToast(this.tostCtrl, "Message", "Delete Successful", 1000);
      
              $("#volDisNew").hide();
              $("#volDisList").show();
              $("#volDisList-tab").tab("show");
    
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
        const url = this.manager.appConfig.apiurl +'PromoAndDiscount/getVolumeDiscountExportData';

        this.searchCriteria.maxRows = "";
        this.searchCriteria.current = "";
        this.searchCriteria.code = this.criteria.code;
        this.searchCriteria.desc = this.criteria.desc;
        this.searchCriteria.disType = this.criteria.disType;
        this.searchCriteria.disItem = this.criteria.disItem;
        this.searchCriteria.disPriceType = this.criteria.disPriceType;
        this.searchCriteria.disAmt = this.criteria.disAmt;
        this.searchCriteria.disItemQty = this.criteria.disItemQty;
        this.searchCriteria.brandOwner = this.criteria.brandOwner;
        this.searchCriteria.promoItem = this.criteria.promoItem;
        this.searchCriteria.promoType = this.criteria.promoType;
        this.searchCriteria.promoAmt = this.criteria.promoAmt;
        this.searchCriteria.operator = this.criteria.operator;

        if(this.criteria.fromDate != ""){
          this.searchCriteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
          cri_fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate).toString();
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
          cri_startDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.startDate).toString();
        } else {
          this.searchCriteria.startDate = "";
        }
        
        if(this.criteria.endDate != ""){
          this.searchCriteria.endDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.endDate);
          cri_endDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.endDate).toString();
        } else {
          this.searchCriteria.endDate = "";
        }
        
        this.http.post(url, this.searchCriteria, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            if(data.message == "SUCCESS"){
              let data1 = data.dataList;
              let cri_flag = 0;

              let excelTitle = "Volume Discount Report";
              let excelHdrHeaderData = [
                "Created Date", "Status", "Code", "Description", "Start Date", "End Date"
              ];
              let excelDtlHeaderData = [
                "Rule No", "Rule Priority", "Get Type", "Buy Limit", 
                "Brand Owner", "Promotion Item", "Rule Type", "Promotion Requirement", 
                "Operator", "Revenue 1", "Revenue 2", "Discount Type", 
                "Discount Price Type", "Price Discount Rate", "Discount Item Type", "Discount Item", 
                "Discount Item Qty", "End Type"
              ];
              let excelShopHeaderData = [
                "Status", "Shop Code", "Shop Description"
              ];

              let excelDataList: any = [];
              let excelData: any = [];
              let excelDataList1: any = [];
              let excelData1: any = [];
              let data2 = [];
              for(var exCount = 0; exCount < data1.length; exCount++){
                excelData = [];
                data1[exCount].createdDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].createdDate);
                data1[exCount].startDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].startDate);
                data1[exCount].endDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].endDate);

                excelData.push(data1[exCount].createdDate);
                excelData.push(data1[exCount].status);
                excelData.push(data1[exCount].code);
                excelData.push(data1[exCount].desc);
                excelData.push(data1[exCount].startDate);
                excelData.push(data1[exCount].endDate);

                excelDataList.push(excelData);

                var exCount1;
                excelDataList1 = [];
                data2 = data1[exCount].dtlList;
                for(exCount1 = 0; exCount1 < data2.length; exCount1++){
                  excelData1 = [];

                  excelData1.push(data2[exCount1].ruleNo);
                  excelData1.push(data2[exCount1].rulePriority);
                  excelData1.push(data2[exCount1].getType);
                  excelData1.push(data2[exCount1].buyLimit);
                  excelData1.push(data2[exCount1].brandOwner);
                  excelData1.push(data2[exCount1].promoItem);
                  excelData1.push(data2[exCount1].ruleType);
                  excelData1.push(data2[exCount1].promoRequirement);
                  excelData1.push(data2[exCount1].operator);
                  excelData1.push(data2[exCount1].amt1);
                  excelData1.push(data2[exCount1].amt2);
                  excelData1.push(data2[exCount1].disType);
                  excelData1.push(data2[exCount1].disPriceType);
                  excelData1.push(data2[exCount1].priceDisRate);
                  excelData1.push(data2[exCount1].disItemType);
                  excelData1.push(data2[exCount1].disItem);
                  excelData1.push(data2[exCount1].disItemQty);
                  excelData1.push(data2[exCount1].endType);

                  excelDataList1.push(excelData1);
                }
                excelDataList.push(excelDataList1);

                excelDataList1 = [];
                data2 = data1[exCount].shopList;
                data2.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
                for(exCount1 = 0; exCount1 < data2.length; exCount1++){
                  excelData1 = [];
                  if(data2[exCount1].n3.toString() == "1"){
                    data2[exCount1].n3 = "Active";
                  } else if(data2[exCount1].n3.toString() == "0"){
                    data2[exCount1].n3 = "Inactive";
                  }

                  excelData1.push(data2[exCount1].n3);
                  excelData1.push(data2[exCount1].shopCode);
                  excelData1.push(data2[exCount1].t2);

                  excelDataList1.push(excelData1);
                }
                excelDataList.push(excelDataList1);
              }

              let workbook = new Workbook();
              let worksheet = workbook.addWorksheet('Volume Discount Data');

              let titleRow = worksheet.addRow(["", "", excelTitle]);
              titleRow.font = { bold: true };
              worksheet.addRow([]);

              let criteriaRow;

              if(this.searchCriteria.fromdate != null && this.searchCriteria.fromdate != "" 
                && this.searchCriteria.todate != null && this.searchCriteria.todate != ""){
                  criteriaRow = worksheet.addRow(["FromDate : " + cri_fromDate + " - ToDate : " + cri_toDate]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
              } else if(this.searchCriteria.fromdate != null && this.searchCriteria.fromdate != "") {
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

              if(this.searchCriteria.code.toString() != ""){
                criteriaRow = worksheet.addRow(["Code : " + this.searchCriteria.code.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.searchCriteria.desc.toString() != ""){
                criteriaRow = worksheet.addRow(["Description : " + this.searchCriteria.desc.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.searchCriteria.brandOwner.toString() != ""){
                criteriaRow = worksheet.addRow(["Brand Owner : " + this.searchCriteria.brandOwner.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.searchCriteria.promoItem.toString() != ""){
                criteriaRow = worksheet.addRow(["Promotion Item : " + this.searchCriteria.promoItem.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.searchCriteria.promoType.toString() != ""){
                let promoType = "";
                if(this.searchCriteria.promoType.toString() == "1"){
                  promoType = "Price";
                } else {    //    if(this.searchCriteria.promoType.toString() == "2"){
                  promoType = "Qty";
                }

                criteriaRow = worksheet.addRow(["Promotion Type : " + promoType]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.searchCriteria.promoAmt.toString() != ""){
                criteriaRow = worksheet.addRow(["Promotion Amount : " + this.searchCriteria.promoAmt.toString()]);
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

              if(this.searchCriteria.disPriceType.toString() != ""){
                let disPriceType = "";
                if(this.searchCriteria.disPriceType.toString() == "1"){
                  disPriceType = "Amount";
                } else {    //    if(this.searchCriteria.disPriceType.toString() == "2"){
                  disPriceType = "Percentage";
                }

                criteriaRow = worksheet.addRow(["Discount Price Type : " + disPriceType]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.searchCriteria.disAmt.toString() != ""){
                criteriaRow = worksheet.addRow(["Price Discount Rate : " + this.searchCriteria.disAmt.toString()]);
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
                FileSaver.saveAs(blob, "Volume_Discount_export_" + new Date().getTime() + EXCEL_EXTENSION);
              });
            }
          }
        );
      }
    );
  }

  allList(){
    this.vdCodeSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          let vdCode_term = {
            "code": term
          };

          this.manager.volDisSearchAutoFill(vdCode_term).subscribe(
            data => {
              this.vdCodeList = data as any[];
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

    this.vdDescSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          let vdDesc_term = {
            "desc": term
          };

          this.manager.volDisSearchAutoFill(vdDesc_term).subscribe(
            data => {
              this.vdDescList = data as any[];
            }
          );
        }
      }
    );

    this.promoItemSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.stockNameSearchAutoFill(term).subscribe(
            data => {
              this.promoItemList = data as any[];
            }
          );
        }
      }
    );

    /*
    this.vendorSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          let vdDesc_term = {
            "desc": term
          };

          this.manager.brandOwnerSearchAutoFill(vdDesc_term).subscribe(
            data => {
              this.vendorList = data as any[];
            }
          );
        }
      }
    );
    */

    this.brandOwnerSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          let vdDesc_term = {
            "desc": term
          };

          this.manager.brandOwnerSearchAutoFill(vdDesc_term).subscribe(
            data => {
              this.brandOwnerList = data as any[];
            }
          );
        }
      }
    );

    /*
    this.promoItemInfoSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          let vdDesc_term = {
            "skuName": term,
            "vendor": this.detailDataList.n2
          };

          this.manager.stockNameSearchAutoFill(vdDesc_term).subscribe(
            data => {
              this.promoItemInfoList = data as any[];
            }
          );
        }
      }
    );
    */
     
    /*
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
    */

    let url = "";
    let param = {};

    url = this.manager.appConfig.apiurl + 'brandowner/brandOwnerSearchAutoFill';
    param = {
      "desc": ""
    };
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.vendorList = data.dataList;
          this.vendorList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
        }
      }
    );

    url = this.manager.appConfig.apiurl + 'Gift/getGift';
    param = {
      "t2": ""
    };
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.giftList = data.giftdata;
          this.giftList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
        }
      }
    );

    url = this.manager.appConfig.apiurl + 'coupon/getcoupon';
    param = {
      "t1": ""
    };
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.couponList = data.CouponList;
          this.couponList.sort((a, b) => (a.t1 > b.t1) ? 1 : -1);
        }
      }
    );
  }

  commonDataExchange(data){
    let returnData = this.getGetGiftData();

    returnData.syskey = data.syskey;
    returnData.recordStatus = data.recordStatus;
    returnData.rsTemp = data.rsTemp;
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

  pageChanged(e){
    this.config.currentPage = e;

    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.search(currentIndex, false);
  }

  shopListPageChanged(e, townshipInfo){
    townshipInfo.shopListConfig.currentPage = e;

    let currentIndex = (townshipInfo.shopListConfig.currentPage - 1) * townshipInfo.shopListConfig.itemsPerPage;
    this.searchShop(currentIndex.toString(), townshipInfo.shopListConfig.currentPage, townshipInfo.TownSyskey);
  }

  assignedShopListPageChanged(e){
    this.config1.currentPage = e;
  }

  clear(){
    this.detailDataList = this.getVolDisDtlDataList();
    this.getGiftDataList = [];
    this.updateIndex = -1;
    // this.giftSearch.disable();
    // $('#discountItem0').show();
    // $('#discountItem1').hide();
    // $('#discountItem2').hide();
    this.promoItemInfoSearch.disable();
  }

  /*
  clearGetGiftData(){
    $('#discountItem0').show();
    $('#discountItem1').hide();
    $('#discountItem2').hide();

    this.getGiftData = this.getGetGiftData();
  }

  clearGetGiftList(){
    this.clearGetGiftData();
    this.getGiftDataList = [];
    this.giftSerialNo = 1;
  }
  */

  clearProperties(){
    this.criteria = this.getCriteriaData();
    this.searchCriteria = this.getCriteriaData();
    this.disItemSearch.disable();

    // this.headerList = [];
    this.saveData = this.getSaveData();

    this.vdCodeList = [];
    this.disItemList = [];
    this.vdDescList = [];
    this.promoItemList = [];

    this.tempSaveData = this.getSaveData();
    this.townList = [];
    this.tempSearch = this.getShopListPageChangeData();
    this.tempSearchCri = this.getShopListPageChangeData();
    // this.saveDataDates = {
    //   "fromDate": "",
    //   "toDate": ""
    // };
    this.detailDataList = this.getVolDisDtlDataList();

    // this.vendorList = [];
    this.promoItemInfoList = [];
    this.giftList = [];
    this.couponList = [];

    this.dropdown = false;
    this.updateIndex = -1;

    this.tempSearch1 = this.getItemSearch1Data();
    this.itemList = [];

    this.tempShopList = [];

    this.serialNo = 1;
    this.giftSerialNo = 1;
  
    this.getGiftDataList = [];

    this.isShow = false;
    this.inkindEditFlag = false;
  }

  getCriteriaData(){
    return {
      "fromDate": "",
      "toDate": "",
      "startDate": "",
      "endDate": "",
      "code": "",
      "desc": "",
      "disType": "",
      "disItem": "",
      "disItemQty": "",
      "disPriceType": "",
      "disAmt": "",
      "brandOwner": "",
      "promoItem": "",
      "promoType": "",
      "promoAmt": "",
      "operator": ""
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

  getSaveData(){
    return {
      "syskey": "",
      "userSyskey": sessionStorage.getItem("usk"),
      "userId": sessionStorage.getItem("uid"),
      "userName": sessionStorage.getItem("uname"),
      "n1": "0",
      "n2": "0",
      "n3": "0",
      "t1": "",
      "t2": "",
      "t3": "",
      "t4": "",
      "volDisDtlDataList": [],
      "volDisShopJuncDataList": [],
      "changesAndNewShopList": []
    };
  }

  getVolDisDtlDataList(){
    return {
      "syskey": "",
      "recordStatus": "",
      "n1": "0",
      "n2": "",
      "n3": "",
      "n4": "",
      "n5": "",
      "n6": "0",
      "n7": "",
      "n8": "0",
      "n9": "",
      "n10": "",
      "n11": "",
      "n12": "",
      "n13": "",
      "n14": "0",
      "n15": "0",
      "n16": "",
      "n17": "",
      "n18": "0",
      "n19": "",
      "n20": "",
      "t1": "",
      "t2": "",
      "t3": "",
      "t4": "",
      "t5": "",
      "getGiftList": []
    };
  }

  getVolDisJunDataList(){
    return {
      "syskey": "",
      "n1": "0",
      "n2": "0",
      "n3": "0",
      "t1": "",
      "t2": "",
      "t3": "",
      "t4": "",
      "townSyskey": "",
      "recordStatus": "",
      "shopCode": "",
      "address": ""
    };
  }

  getItemSearch1Data(){
    return {
      "category": "",
      "subCategory": "",
      "itemCode": "",
      "itemName": "",
      "brandOwner": ""
    };
  }

  getGetGiftData(){
    return {
      "syskey": "",
      "recordStatus": "",
      "rsTemp" : "",
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
                  tempShopData => tempShopData.n2 == this.shopListFromExcel[i].n2
                );
  
                if(sameShopCheck == false){
                  this.tempSaveData.volDisShopJuncDataList.push(this.shopListFromExcel[i]);
                }
              }
              if(this.tempSaveData.volDisShopJuncDataList.length > 0) {
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
}