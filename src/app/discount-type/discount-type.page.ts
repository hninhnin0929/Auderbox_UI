import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { FormControl } from '@angular/forms';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $: any;

@Component({
  selector: 'app-discount-type',
  templateUrl: './discount-type.page.html',
  styleUrls: ['./discount-type.page.scss'],
})

export class DiscountTypePage implements OnInit {

  config =  {
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
  tempSearch: any = {
    "shopDesc": "",
    "townshipDesc": ""
  };

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

  dropdown:boolean = false;

  constructor(
    private http: HttpClient,
    private manager: ControllerService,
    public alertController: AlertController,
    public loading: LoadingController,
    public tostCtrl: ToastController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    $("#discountTypeNew").hide();
    $("#discountTypeList").show();
    $("#discountTypeList-tab").tab("show");
    $('#saveDisCode').css('border-color', '');

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
    $('#discountTypeNew').hide();
    $('#discountTypeList').show();

    this.getAllDataList();
  }

  discountTypeNewTab(){
    $('#discountTypeList').hide();
    $('#discountTypeNew').show();
    $('#saveDisCode').css('border-color', '');

    this.btn = true;
    this.dtlFlag = false;
    this.clearProperties();
    this.allList();

    this.getAllShopByTown();
  }

  advanceSearch(option) {
    this.searchtab = option;
  }

  runSpinner(t: boolean) {
    this.spinner = t;
  }

  focusFunction() {
    $('#saveDisCode').css('border-color', '');
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

  dblClickFunc1(){
    this.criteria.fromDate = "";
    this.criteria.toDate = "";
  }

  dblClickFunc2(){
    this.criteria.toDate = "";
  }

  disTypeStatusChange(e, passData){
    e.stopPropagation();
    const url = this.manager.appConfig.apiurl +'PromoAndDiscount/uvm041StatusChange';

    this.http.post(url, passData, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          if(passData.disTypeStatus == "0"){
            passData.disTypeStatus = "1";
          } else if(passData.disTypeStatus == "1"){
            passData.disTypeStatus = "0";
          }

          this.manager.showToast(this.tostCtrl, "Message", "Status changed", 1000);
        } else {
          this.manager.showToast(this.tostCtrl, "Message", "Status didn't change", 1000);
        }
      }
    );
  }

  disTypeJuncStatusChange(e, passData){
    const url = this.manager.appConfig.apiurl +'PromoAndDiscount/jun014StatusChange';

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

  selectTown(e, tsIndex){
    if(e.currentTarget.checked){
      for(let i = 0; i < this.townList[tsIndex].ShopDataList.length; i++){
        this.selectShop(e, tsIndex, i);
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
        returnTempData.t1 = this.townList[tsIndex].ShopDataList[shopIndex].shopName;
        returnTempData.townSyskey = this.townList[tsIndex].TownSyskey;
        returnTempData.recordStatus = "1";
  
        this.tempSaveData.promoAndDisJunDataList.push(returnTempData);

        cbid = "#cb" + tsIndex + "and" + shopIndex;
        $(cbid).prop('checked', true);
  
        // this.townList[tsIndex].ShopDataList.splice(shopIndex, 1);
      } else {
        cbid = "#cb" + tsIndex + "and" + shopIndex;
        $(cbid).prop('checked', false);

        this.manager.showToast(this.tostCtrl, "Message", "Already Added", 2000);
      }
    } else {
      for(let i = 0; i < this.tempSaveData.promoAndDisJunDataList.length; i++){
        if(this.tempSaveData.promoAndDisJunDataList[i].n1 == this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey){
          cbid = "#cb" + tsIndex + "and" + shopIndex;
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
            cbid = "#combo" + j + "";
            $(cbid).prop('checked', false);

            for(let k = 0; k < this.townList[j].ShopDataList.length; k++){
              if(this.tempSaveData.promoAndDisJunDataList[i].n1 == this.townList[j].ShopDataList[k].shopSysKey){
                this.townList[j].ShopDataList.splice(k, 1);
              }
            }
          }
        }
        this.saveData.promoAndDisJunDataList.push(this.tempSaveData.promoAndDisJunDataList[i]);
      }
  
      this.tempSaveData.promoAndDisJunDataList.splice(0, this.tempSaveData.promoAndDisJunDataList.length);
    } else {
      this.manager.showToast(this.tostCtrl, "Message", "Choose some shops", 2000);
    }
  }

  removeShop(e, index){
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

    this.saveData.promoAndDisJunDataList.splice(index, 1);
  }

  getAllDataList(){
    this.criteria = this.getCriteriaData();
    this.criteria.maxRows = this.config.itemsPerPage;
    this.criteria.current = "0";

    const url = this.manager.appConfig.apiurl +'PromoAndDiscount/getPromoAndDiscount';

    this.http.post(url, this.criteria, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.config.totalItems = data.rowCount;
          this.config.currentPage = 1;
          this.disTypeList = [];

          for(var i = 0; i < data.promoanddiscountList.length; i++){
            let tempReturnData = {
              "disTypeSyskey": "",
              "disTypeDate": "",
              "disTypeCode": "",
              "disTypeDesc": "",
              "disTypeStatus": "",
              "disTypePercent": ""
            };
            
            tempReturnData.disTypeDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data.promoanddiscountList[i].date).toString();
            tempReturnData.disTypeSyskey = data.promoanddiscountList[i].syskey;
            tempReturnData.disTypeCode = data.promoanddiscountList[i].t1;
            tempReturnData.disTypeDesc = data.promoanddiscountList[i].t2;
            tempReturnData.disTypeStatus = data.promoanddiscountList[i].n1;
            tempReturnData.disTypePercent = data.promoanddiscountList[i].n2;

            this.disTypeList.push(tempReturnData);
          }
        }
      }
    );
  }

  search(currIndex, criFlag){
    this.searchCriteria.maxRows = this.config.itemsPerPage;
    this.searchCriteria.current = currIndex;

    const url = this.manager.appConfig.apiurl +'PromoAndDiscount/getPromoAndDiscount';

    let send_data1 = this.criteria.fromDate;
    let send_data2 = this.criteria.toDate;
    if(this.criteria.fromDate != ""){
      this.criteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
    }
    if(this.criteria.toDate != ""){
      this.criteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
    }

    if(criFlag == true){
      this.searchCriteria.discountCode = this.criteria.discountCode;
      this.searchCriteria.discountDesc = this.criteria.discountDesc;
      this.searchCriteria.discountPercent = this.criteria.discountPercent;
      this.searchCriteria.shopDesc = this.criteria.shopDesc;
      this.searchCriteria.fromDate = this.criteria.fromDate;
      this.searchCriteria.toDate = this.criteria.toDate;
    }
    
    this.http.post(url, this.searchCriteria, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.criteria.fromDate = send_data1;
          this.criteria.toDate = send_data2;
          this.config.totalItems = data.rowCount;
          this.disTypeList = [];

          if(currIndex == 0){
            this.config.currentPage = 1;
          }

          for(var i = 0; i < data.promoanddiscountList.length; i++){
            let tempReturnData = {
              "disTypeSyskey": "",
              "disTypeDate": "",
              "disTypeCode": "",
              "disTypeDesc": "",
              "disTypeStatus": "",
              "disTypePercent": ""
            };
            
            tempReturnData.disTypeDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data.promoanddiscountList[i].date).toString();
            tempReturnData.disTypeSyskey = data.promoanddiscountList[i].syskey;
            tempReturnData.disTypeCode = data.promoanddiscountList[i].t1;
            tempReturnData.disTypeDesc = data.promoanddiscountList[i].t2;
            tempReturnData.disTypeStatus = data.promoanddiscountList[i].n1;
            tempReturnData.disTypePercent = data.promoanddiscountList[i].n2;

            this.disTypeList.push(tempReturnData);
          }
        }
      }
    );
  }

  validation(){
    if(this.saveData.t1 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Discount Code", 2000);
      return false;
    }

    if(this.saveData.t2 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Discount Description", 2000);
      return false;
    }

    if(this.saveData.n2 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Discount Percent", 2000);
      return false;
    }

    return true;
  }

  save(){
    const url = this.manager.appConfig.apiurl +'PromoAndDiscount/saveDisTypeAndJunc';

    if(this.validation()){
      this.http.post(url, this.saveData, this.manager.getOptions()).subscribe(
        (data:any) =>{
          if(data.message == "SUCCESS"){
            if(data.ShopNames == ""){
              this.manager.showToast(this.tostCtrl, "Message", "Save Successful", 1000);
            } else {
              let temp_str = "Save Successful<br>The following shops already have discount:<br>" + data.ShopNames;
              this.manager.showToast(this.tostCtrl, "Message", temp_str, 5000);
            }
  
            $("#discountTypeNew").hide();
            $("#discountTypeList").show();
            $("#discountTypeList-tab").tab("show");
  
            this.btn = false;
            this.dtlFlag = false;
  
            this.clearProperties();
            this.allList();
            this.getAllDataList();
          } else if(data.message == "CODEEXISTED"){
            this.manager.showToast(this.tostCtrl, "Message", "Discount Code Already Existed", 2000);
            $('#saveDisCode').css('border-color', 'red');
          } else if(data.message == "JUNCSAVEFAIL"){
            this.manager.showToast(this.tostCtrl, "Message", "Discount Junction Save Failed", 2000);
          } else if(data.message == "FAIL"){
            this.manager.showToast(this.tostCtrl, "Message", "Save Failed", 2000);
          }
        }
      );
    }
  }

  detail(event, index){
    $("#discountTypeNew").show();
    $("#discountTypeList").hide();
    $("#discountTypeNew-tab").tab("show");

    this.btn = true;
    this.dtlFlag = true;

    this.saveData.syskey = this.disTypeList[index].disTypeSyskey;
    this.saveData.n1 = this.disTypeList[index].disTypeStatus;
    this.saveData.n2 = this.disTypeList[index].disTypePercent;
    this.saveData.t1 = this.disTypeList[index].disTypeCode;
    this.saveData.t2 = this.disTypeList[index].disTypeDesc;
    this.saveData.promoAndDisJunDataList = [];

    const url = this.manager.appConfig.apiurl + 'PromoAndDiscount/getJUN014DataByUVM041';
    let sendTempData = {
      "DisTypeSyskey": this.disTypeList[index].disTypeSyskey,
      "tsCheck": "a"
    };

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
            returnTempData.t1 = returnTempDataList[i].t1;
            returnTempData.townSyskey = returnTempDataList[i].townSyskey;
            returnTempData.recordStatus = "1";

            this.saveData.promoAndDisJunDataList.push(returnTempData);
          }
          
          this.getAllShopByTown();
        }
      }
    );
  }

  goDelete(){
    this.alertController.create({
      header: 'Confirm delete?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
           
          }
        },
        {
          text: 'Okay',
          handler: () => {
            this.loading.create({
              message: "Processing",
              backdropDismiss: false,
              duration: 5000
            }).then(
              el => {
              el.present();
    const url = this.manager.appConfig.apiurl + 'PromoAndDiscount/deleteUVM041';
    this.http.post(url, this.saveData, this.manager.getOptions()).subscribe(
      (data:any) =>{
        el.dismiss();
        if(data.message == "SUCCESS"){
          this.manager.showToast(this.tostCtrl, "Message", "Delete Successful", 1000);
  
          $("#discountTypeNew").hide();
          $("#discountTypeList").show();
          $("#discountTypeList-tab").tab("show");

          this.btn = false;
          this.dtlFlag = false;

          this.clearProperties();
          this.allList();
          this.getAllDataList();
        } else if(data.message == "FAIL"){
          this.manager.showToast(this.tostCtrl, "Message", "Delete Failed", 1000);
        } else {
          this.manager.showToast(this.tostCtrl,"Message","Deleteing Fail!",1000);
        }
      },
      (error:any)=>{
        this.manager.showToast(this.tostCtrl,"Message","Deleting Fail!",1000);
      });
    }
    )
  }
  }
  ]
  }).then(el => {
  el.present();
  })
  }

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

  pageChanged(e){
    this.config.currentPage = e;

    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.search(currentIndex, false);
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

    let url = "";
    let params = {};

    url = this.manager.appConfig.apiurl + 'PromoAndDiscount/disTypeSearchAutoFill';
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
  }

  clearProperties(){
    this.criteria = this.getCriteriaData();
    this.searchCriteria = this.getCriteriaData();
    this.saveData = this.getSaveData();
    this.tempSaveData = this.getSaveData();
    this.shopDataList = [];
    this.townList = [];

    this.tempSearch = {
      "shopDesc": "",
      "townshipDesc": ""
    };
  }

  getCriteriaData(){
    return {
      "discountCode": "",
      "discountDesc": "",
      "discountPercent": "",
      "shopDesc": "",
      "fromDate": "",
      "toDate": "",
      "current": "",
      "maxRows": ""
    };
  }

  getSaveData(){
    return {
      "syskey": "",
      "n1": "0",
      "n2": "",
      "n3": "0",
      "t1": "",
      "t2": "",
      "t3": "",
      "promoAndDisJunDataList": []
    };
  }

  getPromoAndDisJunDataList(){
    return {
      "syskey": "",
      "n1": "0",
      "n3": "0",
      "t1": "",
      "townSyskey": "",
      "recordStatus": ""
    };
  }
}