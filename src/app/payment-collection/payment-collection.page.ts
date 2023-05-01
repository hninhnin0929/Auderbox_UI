import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { FormControl } from '@angular/forms';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $: any;
// var todayDate = new Date();

@Component({
  selector: 'app-payment-collection',
  templateUrl: './payment-collection.page.html',
  styleUrls: ['./payment-collection.page.scss'],
})
export class PaymentCollectionPage implements OnInit {

  config =  {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };

  restrictDates: any = {
    "isDisable": true,
    "startDate": "",
    "endDate": ""
  }

  spinner: boolean = false;
  arListSpinner: boolean = false;
  searchtab: boolean = false;
  btn: any = false;
  dtlFlag: any = false;

  state = "";
  district = "";
  township = "";
  stateList2 = []
  districtList2 = [];
  townshipList2 = [];
  shoplist2 = [];
  shopCodeList = [];
  Customer_Name: FormControl = new FormControl();
  Customer_ID: FormControl = new FormControl();
  disableCalendar = false;

  criteria: any = this.getCriteriaData();
  searchCriteria: any = this.getCriteriaData();
  idNames = [
    {
      "state": "#cri-state",
      "district": "#cri-district",
      "township": "#cri-township",
      "customerName": "#cri-Customer_Name",
      "customerCode": "#cri-Customer_Code"
    },
    {
      "state": "#state",
      "district": "#district",
      "township": "#township",
      "customerName": "#Customer_Name",
      "customerCode": "#Customer_ID"
    }
  ];
  idNamesIndex = 0;

  payColList: any = [];
  ArListByCusId: any = [];

  saveData: any = this.getSaveData();
  todayDate = new Date();
  backDate: any = false;

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
    $('#payColNew').hide();
    $('#payColList').show();
    $("#payColList-tab").tab("show");
    // $("#cri-Customer_Name").prop('disabled', true);

    this.clearProperties();
    this.btn = false;
    this.backDate = false;
    this.getAllPayColList();
    this.getAllState();
    this.getRestrictDate();
  }

  payColListTab(){
    $('#payColNew').hide();
    $('#payColList').show();
    // $("#cri-Customer_Name").prop('disabled', true);

    this.clearProperties();
    this.getAllPayColList();

    this.idNamesIndex = 0;
    this.btn = false;
    this.dtlFlag = false;
  }

  payColNewTab(){
    $("#state").prop('selectedIndex', 0);
    $("#state :selected").val("");
    $("#district").prop('selectedIndex', 0);
    $("#district :selected").val("");
    $("#township").prop('selectedIndex', 0);
    $("#township :selected").val("");
    $("#Customer_Name").prop('disabled', true);
    $("#Customer_ID").prop('disabled', true);
    $('#payColList').hide();
    $('#payColNew').show();
    $("#transDate").prop('disabled', false);
    $("#shoparlist").prop('disabled', false);
    this.disableCalendar = false;
    this.clearProperties();

    this.idNamesIndex = 1;
    this.btn = true;
    this.dtlFlag = false;
    this.saveData.TRANS_DATE = this.todayDate;
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
    this.payColList = [];

    this.getAllPayColList();
  }
  
  /*
  dateChange1(event){
    if(this.saveData.TRANS_DATE != undefined || this.saveData.TRANS_DATE != ""){
      let tempTranDate = new Date(event.target.value);
      let tempCurDate = new Date();

      tempTranDate.setHours(0, 0, 0, 0);
      tempCurDate.setHours(0, 0, 0, 0);

      if (+tempTranDate < +tempCurDate) {
        this.manager.showToast(this.tostCtrl, "Message", "AR Receipt Date must be later than Current Date", 3000);
        this.saveData.TRANS_DATE = "";
        event.target.value = "";
      }
    }
  }
  */

  dblClickFunc1(){
    this.criteria.transFromDate = "";
  }

  dblClickFunc2(){
    this.criteria.transToDate = "";
  }

  dblClickFunc3(){
    this.saveData.TRANS_DATE = this.todayDate;
  }

  getAllState(){
    let param = {
      "t2": ""
    };

    const url = this.manager.appConfig.apiurl +'placecode/getstate';

    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any) =>{
        this.stateList2 = data.stateList;
        this.stateList2.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
      }
    );
  }

  getRestrictDate(){
    const url = this.manager.appConfig.apiurl + 'config/getAllConfig';

    this.http.post(url, {}, this.manager.getOptions()).subscribe(
      (data:any) =>{
        this.restrictDates.isDisable = data.configData.isUseBackDate.toString() == "1" ? false : true;
        this.restrictDates.startDate = data.configData.startBackDate.toString();
        this.restrictDates.endDate = data.configData.endBackDate.toString();

        // this.saveData.TRANS_DATE = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, todayDate);
        this.saveData.TRANS_DATE = this.todayDate;

        /*
        if(this.restrictDates.isDisable){
          this.saveData.TRANS_DATE = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, new Date());
        }
        */
      }
    );
  }

  cboStateChange(e){
    $(this.idNames[this.idNamesIndex].district).prop('selectedIndex', 0);
    $(this.idNames[this.idNamesIndex].district + " :selected").val("");
    $(this.idNames[this.idNamesIndex].township).prop('selectedIndex', 0);
    $(this.idNames[this.idNamesIndex].township + " :selected").val("");

    if(this.idNamesIndex == 1){
      $(this.idNames[this.idNamesIndex].customerName).prop('disabled', true);
      $(this.idNames[this.idNamesIndex].customerCode).prop('disabled', true);
    }

    this.saveData.Customer_ID = "";
    this.saveData.Customer_Name = "";
    this.criteria.Customer_Name = ""

    this.districtList2 = [];
    this.townshipList2 = [];

    if($(this.idNames[this.idNamesIndex].state + " :selected").val().toString() == ""){
      return;
    }

    let param = {
      "code": "",
      "description": "",
      "districtSyskey": "",
      "stateSyskey": $(this.idNames[this.idNamesIndex].state + " :selected").val().toString()
    };

    this.districtService(param);
  }

  districtService(param){
    return new Promise<void>(
      (res, rej) => {
        const url = this.manager.appConfig.apiurl +'placecode/getdistrict';

        this.http.post(url, param, this.manager.getOptions()).subscribe(
          (data:any) =>{
            this.districtList2 = data.districtList;
            this.districtList2.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
            res();
          }
        );
      }
    );
  }

  cboDistrictChange(){
    $(this.idNames[this.idNamesIndex].township).prop('selectedIndex', 0);
    $(this.idNames[this.idNamesIndex].township + " :selected").val("");
    this.saveData.Customer_ID = "";
    this.saveData.Customer_Name = "";
    this.townshipList2 = [];

    if(this.idNamesIndex == 1){
      $(this.idNames[this.idNamesIndex].customerName).prop('disabled', true);
      $(this.idNames[this.idNamesIndex].customerCode).prop('disabled', true);
    }

    if($(this.idNames[this.idNamesIndex].district + " :selected").val().toString() == ""){
      return;
    }
    
    let param = {
      "code": "",
      "description": "",
      "townshipSyskey": "",
      "districtSyskey": $(this.idNames[this.idNamesIndex].district + " :selected").val().toString()
    };

    this.townshipService(param);
  }

  townshipService(param){
    return new Promise<void>(
      (res, rej) => {
        const url = this.manager.appConfig.apiurl +'placecode/gettsp';

        this.http.post(url, param, this.manager.getOptions()).subscribe(
          (data:any) =>{
            this.townshipList2 = data.tspList;
            this.townshipList2.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
            res();
          }
        );
      }
    );
  }

  cboTownshipChange(){
    this.saveData.Customer_ID = "";
    this.saveData.Customer_Name = "";
    this.shoplist2 = [];
    this.shopCodeList = [];

    if(this.idNamesIndex == 1){
      $(this.idNames[this.idNamesIndex].customerName).prop('disabled', false);
      $(this.idNames[this.idNamesIndex].customerCode).prop('disabled', false);

      if($(this.idNames[this.idNamesIndex].township + " :selected").val() == ""){
        $(this.idNames[this.idNamesIndex].customerName).prop('disabled', true);
        $(this.idNames[this.idNamesIndex].customerCode).prop('disabled', true);
        return;
      }
    }
  }

  txtShopNameEnter(){
    this.ArListByCusId = [];
    this.manager.shopNameSearchAutoFill($(this.idNames[this.idNamesIndex].customerName).val().toString(), false, $(this.idNames[this.idNamesIndex].township + " :selected").val().toString()).subscribe(
      (data: any) => {
        this.shoplist2 = data as any[];
        this.shoplist2.sort((a, b) => (a.shopName.toLowerCase() > b.shopName.toLowerCase()) ? 1 : -1);
      }
    );
  }

  txtShopCodeEnter(){
    this.ArListByCusId = [];
    this.manager.shopCodeSearchAutoFill($(this.idNames[this.idNamesIndex].customerCode).val(),1).subscribe(
      (data: any) => {
        this.shopCodeList = data as any[];
        this.shopCodeList.sort((a, b) => (a.shopCode.toLowerCase() > b.shopCode.toLowerCase()) ? 1 : -1);
      }
    );
  }

  getArListByShop(Customer_ID){
    return new Promise<void>(
      (res, rej) => {
        const url = this.manager.appConfig.apiurl + 'sapApi/getArListByShop';
        let sendTempData = {
          "shopCode": Customer_ID.toString(),
        };
        this.ArListByCusId = [];
    
        this.http.post(url, sendTempData, this.manager.getOptions()).subscribe(
          (data:any) =>{
            if(data.message == "SUCCESS"){
              this.ArListByCusId = data.dataList;
              for(var i = 0; i < this.ArListByCusId.length; i++){
                this.ArListByCusId[i].invDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.ArListByCusId[i].invDate);
                this.ArListByCusId[i].dueDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.ArListByCusId[i].dueDate);
              }
            }
    
            res();
          }
        );
      }
    );
  }

  shopChange2(){

    this.arListSpinner = true;

    let shopData: any = this.shoplist2.filter(
      data => {
        return data.shopCode == this.saveData.Customer_Name.shopCode;
      }
    )[0];

    $('#Customer_Name').val(shopData.shopName);
    this.saveData.Customer_ID = shopData.shopCode;

    this.saveData.Customer_Name = shopData.shopName;
    this.criteria.Customer_Name = shopData.shopName;

    this.arListSpinner = false;
    this.ArListByCusId = [];
  }

  shopCodeChange(){

    this.arListSpinner = true;

    let shopCodeData: any = this.shopCodeList.filter(
      data => {
        return data.shopCode == this.saveData.Customer_ID.shopCode;
      }
    )[0];

    $('#Customer_ID').val(shopCodeData.shopCode);
    this.saveData.Customer_ID = shopCodeData.shopCode;
    this.criteria.Customer_Code = shopCodeData.shopCode;

    this.saveData.Customer_Name = shopCodeData.shopName;
    // this.criteria.Customer_Name = shopCodeData.shopName;

    this.arListSpinner = false;
    this.ArListByCusId = [];
  }

  showArList(){
    // $('#ArInfo').show();


    this.loading.create({
      message: "Processing..",
     
      backdropDismiss: false
    }).then(
      async el => {
        el.present();
        
        if(this.saveData.Customer_ID != '' && this.saveData.Customer_ID != undefined)
        {
          await this.getArListByShop(this.saveData.Customer_ID);
        }else
        {
          this.manager.showToast(this.tostCtrl, "Message", "Choose Customer First", 2000);
        }
        $('#ArInfo').appendTo("body").modal('show');
        
        el.dismiss();
      }
    );
  }

  getAllPayColList(){
    this.loading.create({
      message: "Processing..",
     
      backdropDismiss: false
    }).then(
      el => {
        el.present();

        this.searchCriteria = this.getCriteriaData();
        this.searchCriteria.maxRows = this.config.itemsPerPage;
        this.searchCriteria.current = "0";

        if(this.criteria.transFromDate != ""){
          this.searchCriteria.transFromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.transFromDate);
        } else {
          this.searchCriteria.transFromDate = "";
        }

        if(this.criteria.transToDate != ""){
          this.searchCriteria.transToDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.transToDate);
        } else {
          this.searchCriteria.transToDate = "";
        }
        this.searchCriteria.backDate = this.backDate;

        const url = this.manager.appConfig.apiurl +'sapApi/getPayColListWeb';

        this.http.post(url, this.searchCriteria, this.manager.getOptions()).subscribe(
          (data:any) =>{
            el.dismiss();

            if(data.message == "SUCCESS"){
              if(data.dataList.length > 0){
                this.config.totalItems = data.dataList[0].totalCount;
              } else {
                this.config.totalItems = 0;
              }
              
              this.config.currentPage = 1;

              this.payColList = data.dataList;

              for(var i = 0; i < this.payColList.length; i++){
                this.payColList[i].transDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.payColList[i].transDate);
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
        this.searchCriteria.backDate = this.backDate;
        const url = this.manager.appConfig.apiurl +'sapApi/getPayColListWeb';

        if(criFlag == true){
          this.searchCriteria.refDocNo = this.criteria.refDocNo;
          this.searchCriteria.Customer_Code = this.criteria.Customer_Code;
          this.searchCriteria.Customer_Name = this.criteria.Customer_Name;
          this.searchCriteria.stateSyskey = this.criteria.stateSyskey;
          this.searchCriteria.districtSyskey = this.criteria.districtSyskey;
          this.searchCriteria.tshipSyskey = this.criteria.tshipSyskey;
          this.searchCriteria.status = this.criteria.status;

          if(this.criteria.transFromDate != ""){
            this.searchCriteria.transFromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.transFromDate);
          } else {
            this.searchCriteria.transFromDate = "";
          }

          if(this.criteria.transToDate != ""){
            this.searchCriteria.transToDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.transToDate);
          } else {
            this.searchCriteria.transToDate = "";
          }
        }
        
        this.http.post(url, this.searchCriteria, this.manager.getOptions()).subscribe(
          (data:any) =>{
            el.dismiss();

            if(data.message == "SUCCESS"){
              if(data.dataList.length > 0){
                this.config.totalItems = data.dataList[0].totalCount;
              } else {
                this.config.totalItems = 0;
              }

              if(currIndex == 0){
                this.config.currentPage = 1;
              }

              this.payColList = data.dataList;

              for(var i = 0; i < this.payColList.length; i++){
                this.payColList[i].transDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.payColList[i].transDate);
              }
            }
          }
        );
      }
    );
  }

  stopDetail(e){
    e.stopPropagation();
  }

  detail(e, curData){
    $('#payColList').hide();
    $('#payColNew').show();
    $("#payColNew-tab").tab("show");
    $("#Customer_Name").prop('disabled', false);
    $("#Customer_ID").prop('disabled', false);
    $("#transDate").prop('disabled', true);
    $("#shoparlist").prop('disabled', true);
    this.disableCalendar = true;

    this.idNamesIndex = 1;
    this.btn = true;
    this.dtlFlag = true;

    this.saveData = this.getSaveData();
    this.saveData.syskey = curData.syskey;
    this.saveData.REF_DOC_NO = curData.refDocNo;
    this.saveData.Customer_ID = curData.customerId;
    this.saveData.Customer_Name = curData.customerName;
    this.saveData.AMOUNT = curData.amount;
    this.saveData.CURRENCY = curData.currency;
    this.saveData.TRANS_DATE = this.manager.dateFormatCorrector(this.manager.dateFormatter.UItoDTP, curData.transDate);
    this.saveData.Remark = curData.remark;

    this.getByShop(curData.stateSyskey, curData.districtSyskey, curData.tshipSyskey);

    /*
    this.loading.create({
      message: "Processing..",
     
      backdropDismiss: false
    }).then(
      async el => {
        el.present();
        
        await this.getArListByShop(this.saveData.Customer_ID);
        await this.getByShop();
        
        el.dismiss();
      }
    );
    */
  }

  async getByShop(sSk, dSk, tsSk){
    let districtParam = {
      "code": "",
      "description": "",
      "districtSyskey": dSk,
      "stateSyskey": sSk
    };

    let townshipParam = {
      "code": "",
      "description": "",
      "townshipSyskey": tsSk,
      "districtSyskey": dSk
    };

    await this.districtService(districtParam);
    await this.townshipService(townshipParam);

    this.state = sSk;
    this.district = dSk;
    this.township = tsSk;
  }

  /*
  getByShop(){    get state, district and township by shopCode
    return new Promise<void>(
      (res, rej) => {
        const url = this.manager.appConfig.apiurl + 'sapApi/getByShop';
        let sendTempData = {
          "shopCode": this.saveData.Customer_ID.toString(),
        };

        this.http.post(url, sendTempData, this.manager.getOptions()).subscribe(
          async (data:any) =>{
            if(data.message == "SUCCESS"){
              this.state = data.stateSyskey.toString();

              let districtParam = {
                "code": "",
                "description": "",
                "districtSyskey": "",
                "stateSyskey": ""
              };
          
              let townshipParam = {
                "code": "",
                "description": "",
                "townshipSyskey": "",
                "districtSyskey": ""
              };
              
              districtParam.stateSyskey = data.stateSyskey.toString();
              townshipParam.districtSyskey = data.districtSyskey.toString();

              await this.districtService(districtParam);
              await this.townshipService(townshipParam);
          
              this.district = data.districtSyskey.toString();
              this.township = data.townshipSyskey.toString();
            }

            res();
          }
        );
      }
    );
  }
  */

  validationBeforeSave(){
    if(this.saveData.Customer_Name == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Choose Customer Name", 2000);
      return false;
    }

    if(this.saveData.Customer_ID == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Choose Customer ID", 2000);
      return false;
    }
      
    if(this.saveData.AMOUNT == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Amount", 2000);
      return false;
    }
      
    if(this.saveData.CURRENCY == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Currency", 2000);
      return false;
    }
      
    if(this.saveData.TRANS_DATE == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add AR Receipt Date", 2000);
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

        const url = this.manager.appConfig.apiurl +'sapApi/savePaymentRoll';

        if(this.validationBeforeSave()){
          let tempTransDate: any = this.saveData.TRANS_DATE;

          this.saveData.TRANS_DATE = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.saveData.TRANS_DATE);
          
          this.http.post(url, this.saveData, this.manager.getOptions()).subscribe(
            (data:any) =>{
              el.dismiss();

              if(data.message == "SUCCESS"){
                this.manager.showToast(this.tostCtrl, "Message", "Save Successful", 1000);
      
                $("#payColNew").hide();
                $("#payColList").show();
                $("#payColList-tab").tab("show");
      
                this.clearProperties();
                this.getAllPayColList();

                this.idNamesIndex = 0;
                this.btn = false;
                this.dtlFlag = false;
              } else {
                this.saveData.TRANS_DATE = tempTransDate;
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

  goVoid(){
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
        const url = this.manager.appConfig.apiurl + 'sapApi/setVoidStatus';
        this.http.post(url, this.saveData, this.manager.getOptions()).subscribe(
          (data:any) =>{
            el.dismiss();

            if(data.message == "SUCCESS"){
              this.manager.showToast(this.tostCtrl, "Message", "Void Successful", 1000);
      
              $("#payColNew").hide();
              $("#payColList").show();
              $("#payColList-tab").tab("show");
    
              this.clearProperties();
              this.getAllPayColList();
    
              this.idNamesIndex = 0;
              this.btn = false;
              this.dtlFlag = false;
            } else if(data.message == "FAIL"){
              this.manager.showToast(this.tostCtrl, "Message", "Void Failed", 1000);
            }else {
              this.manager.showToast(this.tostCtrl,"Message","Deleted Fail!",1000)
            }
          },
          (error: any) => {
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

  print(){
    this.loading.create({
      message: "Processing..",

      backdropDismiss: false
    }).then(
      el => {
        el.present();

        let cri_fromDate = "";
        let cri_toDate = "";
        
        this.searchCriteria.current = "";
        this.searchCriteria.maxRows = "";
        const url = this.manager.appConfig.apiurl + 'sapApi/getPayColListWeb';

        this.searchCriteria.refDocNo = this.criteria.refDocNo;
        this.searchCriteria.Customer_Code = this.criteria.Customer_Code;
        this.searchCriteria.Customer_Name = this.criteria.Customer_Name;
        this.searchCriteria.stateSyskey = this.criteria.stateSyskey;
        this.searchCriteria.districtSyskey = this.criteria.districtSyskey;
        this.searchCriteria.tshipSyskey = this.criteria.tshipSyskey;
        this.searchCriteria.status = this.criteria.status;

        if(this.criteria.transFromDate != ""){
          this.searchCriteria.transFromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.transFromDate);
          cri_fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI, this.criteria.transFromDate);
        } else {
          this.searchCriteria.transFromDate = "";
        }

        if(this.criteria.transToDate != ""){
          this.searchCriteria.transToDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.transToDate);
          cri_toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI, this.criteria.transToDate);
        } else {
          this.searchCriteria.transToDate = "";
        }

        this.http.post(url, this.searchCriteria, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();

            if (data.message == "SUCCESS") {
              let cri_flag = 0;
              let tempDate = "";
              let tempReturnData = data.dataList;
              let excelDataList: any = [];
              let excelTitle = "Credit Collection List";
              let excelHeaderData = [
                "AR Receipt No", "Shop Code", "Shop Name", "AR Receipt Date", 
                "Amount", "Currency", "Remark", "Status"
              ];

              for (var data_i = 0; data_i < tempReturnData.length; data_i++) {
                let excelData = [];

                tempDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, tempReturnData[data_i].transDate).toString();

                excelData.push(tempReturnData[data_i].refDocNo);
                excelData.push(tempReturnData[data_i].customerId);
                excelData.push(tempReturnData[data_i].customerName);
                excelData.push(tempDate);
                excelData.push(tempReturnData[data_i].amount);
                excelData.push(tempReturnData[data_i].currency);
                excelData.push(tempReturnData[data_i].remark);
                excelData.push(tempReturnData[data_i].voidStatus);

                excelDataList.push(excelData);
              }

              let workbook = new Workbook();
              let worksheet = workbook.addWorksheet('Credit Collection Data');

              let titleRow = worksheet.addRow(["", "", excelTitle]);
              titleRow.font = { bold: true };
              worksheet.addRow([]);

              let criteriaRow;

              if(this.searchCriteria.transFromDate != null && this.searchCriteria.transFromDate != "" 
                && this.searchCriteria.transToDate != null && this.searchCriteria.transToDate != ""){
                  criteriaRow = worksheet.addRow(["FromDate : " + cri_fromDate + " - ToDate : " + cri_toDate]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
              } else if(this.searchCriteria.transFromDate != null && this.searchCriteria.transFromDate != "") {
                criteriaRow = worksheet.addRow(["Date : " + cri_fromDate]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.criteria.refDocNo.toString() != "") {
                criteriaRow = worksheet.addRow(["Ref Doc No : " + this.criteria.refDocNo.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.criteria.stateSyskey.toString() != "") {
                let sSK = this.stateList2.filter(
                  data => {
                    return data.syskey.toString() == this.criteria.stateSyskey.toString();
                  }
                )[0].t2.toString();

                criteriaRow = worksheet.addRow(["State : " + sSK]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.criteria.districtSyskey.toString() != "") {
                let dSK = this.districtList2.filter(
                  data => {
                    return data.syskey.toString() == this.criteria.districtSyskey.toString();
                  }
                )[0].t2.toString();

                criteriaRow = worksheet.addRow(["District : " + dSK]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.criteria.tshipSyskey.toString() != "") {
                let tSK = this.townshipList2.filter(
                  data => {
                    return data.syskey.toString() == this.criteria.tshipSyskey.toString();
                  }
                )[0].t2.toString();

                criteriaRow = worksheet.addRow(["Township : " + tSK]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.criteria.Customer_Code.toString() != "") {
                criteriaRow = worksheet.addRow(["Shop Code : " + this.criteria.Customer_Code.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.criteria.Customer_Name.toString() != "") {
                criteriaRow = worksheet.addRow(["Shop Name : " + this.criteria.Customer_Name.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(this.criteria.status.toString() != "") {
                let tempStatus = "";
                if(this.criteria.status.toString() == "1"){
                  tempStatus = "Collected";
                } else if(this.criteria.status.toString() == "6"){
                  tempStatus = "Void";
                }

                criteriaRow = worksheet.addRow(["Status : " + tempStatus]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if(cri_flag == 0) {
                criteriaRow = worksheet.addRow(["Search With No Criteria"]);
                criteriaRow.font = { bold: true };
              }
              worksheet.addRow([]);

              let headerRow = worksheet.addRow(excelHeaderData);
              headerRow.font = { bold: true };
              for (var i_data = 0; i_data < excelDataList.length; i_data++) {
                worksheet.addRow(excelDataList[i_data]);
              }

              workbook.xlsx.writeBuffer().then((data) => {
                let blob = new Blob([data], { type: EXCEL_TYPE });
                FileSaver.saveAs(blob, "Credit_Collection_export_" + new Date().getTime() + EXCEL_EXTENSION);
              });
            }
          }
        );
      }
    );
  }

  clearProperties(){
    this.districtList2 = [];
    this.townshipList2 = [];
    this.shoplist2 = [];
    this.shopCodeList = [];

    this.state = "";
    this.district = "";
    this.township = "";

    this.saveData = this.getSaveData();
    this.criteria = this.getCriteriaData();
    this.searchCriteria = this.getCriteriaData();
  }

  pageChanged(e){
    this.config.currentPage = e;

    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.search(currentIndex, false);
  }

  getCriteriaData(){
    return {
      "transFromDate": this.todayDate,
      "transToDate": this.todayDate,
      "stateSyskey": "",
      "districtSyskey": "",
      "tshipSyskey": "",
      "Customer_Code": "",
      "Customer_Name": "",
      "refDocNo": "",
      "status": "",
      "maxRows": "",
      "current": "",
      "backDate": false
    };
  }

  getSaveData(){
    return {
      "syskey": "",
      "REF_DOC_NO": "TBA",
      "Customer_ID": "",
      "Customer_Name": "",
      "AMOUNT": "",
      "CURRENCY": "MMK",
      "TRANS_DATE": "",
      "Remark": ""
    };
  }
}