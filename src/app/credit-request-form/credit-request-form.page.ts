import { HttpClient, HttpErrorResponse, HttpHandler, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, Events, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

import { ControllerService } from '../controller.service';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
declare var $: any;
var date = new Date();
var todayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

@Component({
  selector: 'app-credit-request-form',
  templateUrl: './credit-request-form.page.html',
  styleUrls: ['./credit-request-form.page.scss'],
})
export class CreditRequestFormPage implements OnInit {
  @ViewChild('picker', { static: false }) matDatepicker: MatDatepicker<Date>;
  btn: boolean = false;
  statesyskey: any;
  _stateList: any = [];
  _districtList: any = [];
  _tspList: any = [];
  _shopList: any = [];
  _shopListCode: any = [];
  requestType: string ='1';
  
  crdReqobj : any= this.getCreditRequestData();
  shopSearch : any = this.globalSearchObj();
  search_param : any = this.getDefaultSearchObject();
  creditUpdateData: any = this.getCreditUpdateData();
  _creditReqList: any = [];
  dtlFlag: any = false;

  idNames = [
    {
      "state": "#crdsta",
      "district": "#crddis",
      "township": "#crdtspid",
      "customerName": "#crdshopCode",
      "customerCode": "#crdshop" // shopName
    },
    {
      "state": "#sta-cri1",
      "district": "#dis-cri",
      "township": "#tsp-cri", 
      "customerName": "#cri-shop",
      "customerCode": "#cri-shopcode"
    }
  ];
  idNamesIndex = 0;

  checked:boolean;
  flag1:boolean;
  spinner: boolean = false;
  searchtab: boolean = false;
  minDate: any;
  maxDate: any = new Date();
  
  constructor(
    private http: HttpClient,
    private modalController: ModalController,
    private event: Events,
    private ics: ControllerService,
    private router: Router,
    public activeRoute: ActivatedRoute,
    public loading: LoadingController,
    public alertCtrl: AlertController,
    private tostCtrl: ToastController

  ) {
  }

  ngOnInit() {
    this.getStateList();
  }

  ionViewWillEnter() {
    this.btn = false;
    this.searchtab = false;
    this.spinner = false;
    this.requestType = "1";
    this.ics.isLoginUser();
    this.search_param = this.getDefaultSearchObject();
    this.search_param.fromDate = todayDate;
    this.search_param.toDate = todayDate;
    this.getCreditReqList(0);
    $('#crdlist-tab').tab('show');
    $('#spinner-shop').hide();
    $('#spinner-shopCode').hide();

    this.idNamesIndex = 0;
    this.dtlFlag = false;

  }
  listTab(event: any) {
    this.ionViewWillEnter(); 
  }
  newTabClick(e) {
    $("#crdshopCode").prop('disabled', true);
    $("#crdshop").prop('disabled', true);

    this.getNew();
  }
  getNew(){
    this.btn = false;
    this.requestType = "1";
    this.crdReqobj = this.getCreditRequestData();
    this.shopSearch = this.globalSearchObj();
    this._stateList = [];
    this._districtList = [];
    this._tspList = [];
    this._shopList = [];
    this._shopListCode = [];
    this.getStateList();
    this.idNamesIndex = 1;
    this.dtlFlag = false;

    $("#township").prop('selectedIndex', 0);
    $("#township :selected").val("");
  }
  tab(e) {

  }

  detail(syskey) {
    $("#crdshopCode").prop('disabled', true);
    $("#crdshop").prop('disabled', true);
    this.btn = true;
    this.idNamesIndex = 1;
    this.dtlFlag = true;
    this.getCrdRequestBySyskey(syskey)
    $('#crdnew-tab').tab('show');
  }
  runSpinner(t: boolean) {
    this.spinner = t;
  }

  advanceSearch(option) {
    this.searchtab = option;
  }
  config =  {
    itemsPerPage: this.ics.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  stateChange(data) {
    var selectElement = data.target;
    var stateSyskey = selectElement.value;

    $(this.idNames[this.idNamesIndex].district).prop('selectedIndex', 0);
    $(this.idNames[this.idNamesIndex].district + " :selected").val("");
    $(this.idNames[this.idNamesIndex].township).prop('selectedIndex', 0);
    $(this.idNames[this.idNamesIndex].township + " :selected").val("");

    if(this.idNamesIndex == 1){
      $(this.idNames[this.idNamesIndex].customerName).prop('disabled', true);
      $(this.idNames[this.idNamesIndex].customerCode).prop('disabled', true);
      $("#crdshopCode").prop('disabled', true);
      $("#crdshop").prop('disabled', true);

    }
    // if($(this.idNames[this.idNamesIndex].state + " :selected").val() == ""){
    //   return;
    // }

    this._districtList = [];
    this._tspList = [];
    // this.shopSearch.shopSyskey = '';
    this._shopList = [];
    this._shopListCode = [];
    this.crdReqobj.districtSyskey = '';
    this.crdReqobj.townshipSyskey = '';
    this.crdReqobj.shopSyskey = '';
    this.crdReqobj.shopCode = '';
    // this.getDistrictList(this.crdReqobj.stateSyskey);

    if(stateSyskey == ""){
      return;
    }

    if(stateSyskey != ""){
    this.getDistrictList(stateSyskey);
    }
    
  }
  stateCriChange() {
    this._districtList = [];
    this._tspList = [];
    this.search_param.districtCriSkey = "";
    this.search_param.tspCriSkey = "";
    this.getDistrictList(this.search_param.stateCriSkey);
  }
  districtChange(disSk) {
    var  selectElement = disSk.target;
    var disSyskey = selectElement.value;
    this._tspList = [];
    this._shopList = [];
    this._shopListCode = [];
    this.crdReqobj.townshipSyskey = '';
    this.crdReqobj.shopSyskey = '';
    this.crdReqobj.shopCode = '';

    $(this.idNames[this.idNamesIndex].township).prop('selectedIndex', 0);
    $(this.idNames[this.idNamesIndex].township + " :selected").val("");

    if(this.idNamesIndex == 1){
      $(this.idNames[this.idNamesIndex].customerName).prop('disabled', true);
      $(this.idNames[this.idNamesIndex].customerCode).prop('disabled', true);
      $("#crdshopCode").prop('disabled', true);
      $("#crdshop").prop('disabled', true);
    }

    // if($(this.idNames[this.idNamesIndex].district + " :selected").val() == ""){
    //   return;
    // }
    if(disSyskey == ""){
      return;
    }
    
    if(disSyskey != ""){
      this.getTownShipList(disSyskey);
    }
    // this.getTownShipList(this.crdReqobj.districtSyskey);

  }
  districtCriChange() {
    this._tspList = [];
    this.search_param.tspCriSkey = "";
    this.getTownShipList(this.search_param.districtCriSkey);
  }

  townshipChange(selected){
    var selectElement = selected.target;
    var value = selectElement.value;
    console.log("Selected => " + value);

    this.crdReqobj.shopSyskey = '';
    this.crdReqobj.shopCode = '';
    this._shopList = [];
    this._shopListCode = [];

   
    if(this.idNamesIndex == 1){
      $("#crdshopCode").prop('disabled', false);
      $("#crdshop").prop('disabled', false);


      if(value == "" ){
        $("#crdshopCode").prop('disabled', true);
        $("#crdshop").prop('disabled', true);
        return;
      }
    }

  }
 
  getStateList() {
    if (this.ics.user.orgId.length == 0) return;
    let status = "";
    const url = this.ics.appConfig.apiurl + 'placecode/state';
    var param = {
      code: "",
      description: ""
    }
    var subscribe = this.http.post(url, param, this.ics.getOptions()).subscribe(
      (data: any) => {
        this._stateList = data.dataList;
        this._stateList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
      }
    )
  }

  getDistrictList(n3) {
        const url = this.ics.appConfig.apiurl + 'placecode/getdistrict';
        var param = { code: "", description: "", districtSyskey: "0", stateSyskey: n3 }
        var subscribe = this.http.post(url, param, this.ics.getOptions()).subscribe(
          (data: any) => {
            this._districtList = data.districtList;
            this._districtList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
          }
        ) 
    
  }

  getTownShipList(n3) {
        let status = "";
        const url = this.ics.appConfig.apiurl + 'placecode/gettsp';
        var param = { code: "", description: "", districtSyskey: n3, townshipSyskey:"" }//addtownshipSyskey:""byhml
        var subscribe = this.http.post(url, param, this.ics.getOptions()).subscribe(
          (data: any) => {
            this._tspList = data.tspList;
            this._tspList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
          }
        )    
  }

  getCreditUpdateData() {
    return {
      syskey: 0,
      creditStatus: 0,
      shopCode: "",
    }
  }
  
  getCreditRequestData() {
    return {
      syskey : "0",
      shopName : "",  
      shopCode : "", 
      shopAddress : "", 
      shopSyskey : "", 
      townshipSyskey : "", 
      stateSyskey : "", 
      requestDate : "", 
      submittedBy : "", 
      newCrdReq : 0, 
      crdIncUpdate : 0,
      crdStatusChange : 0,
      crdReqTxt : "",
      noteTxt : "",
      userId : "",
      userName : "",
      userSyskey : "0",
      districtSyskey : ""
    };
  }
  globalSearchObj() {
    return {
      shopSyskey : "", // shopName
      shopCode : ""
    }
  }
 
advanceSearchReset() {
   this.search_param = this.getDefaultSearchObject();
   this.search_param.fromDate = todayDate;
   this.search_param.toDate = todayDate;
   this.getCreditReqList(0);
  }
pageChanged(e){
  this.config.currentPage = e;
  let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
  this.getCreditReqList(currentIndex);  
}

getShopList(){
  if(this.crdReqobj.stateSyskey == "" || this.crdReqobj.districtSyskey == "" || this.crdReqobj.townshipSyskey == "")
  {
    this.ics.showToast(this.tostCtrl, 'Alert','Choose State, District, Township First!',1500);
    return;
  }
  $('#spinner-shop').show();
  this.ics.shopNameSearchAutoFill($('#crdshop').val(), '',this.crdReqobj.townshipSyskey).subscribe(
    data => {     
      this._shopList = data as any[];
      $('#spinner-shop').hide();
    }
    ,error=>{
      $('#spinner-shop').hide();
    }
  );
}
getShopListCode(){
  if(this.crdReqobj.stateSyskey == "" || this.crdReqobj.districtSyskey == "" || this.crdReqobj.townshipSyskey == "")
  {
    this.ics.showToast(this.tostCtrl, 'Alert','Choose State, District, Township First!',1500);
    return;
  }
  $('#spinner-shopCode').show();
  this.ics.shopCodeSearchAutoFill($('#crdshopCode').val(),1).subscribe(
    data => {     
      this._shopListCode = data as any[];
      this._shopListCode.sort((a, b) => (a.shopCode.toLowerCase() > b.shopCode.toLowerCase()) ? 1 : -1);
      $('#spinner-shopCode').hide();
    }
    ,error=>{
      $('#spinner-shopCode').hide();
    }
  );
}

save() {
  if(this.isvalid()){
    if (this.ics.user.orgId.length == 0) return;
    var msg = ""
    if (this.crdReqobj.syskey.length > 3) msg = "Updating data.."
    else msg = "Saving data..";
    this.loading.create(
      {
        message: msg,
        duration: 20000
      }
    ).then(
      el => {
        el.present();
        var status = "";  
        if(this.requestType === "1")
        {
          this.crdReqobj.newCrdReq = 1;
          this.crdReqobj.crdIncUpdate = 0;
          this.crdReqobj.crdStatusChange = 0;
        }else if(this.requestType === "2"){
          this.crdReqobj.crdIncUpdate = 1;
          this.crdReqobj.newCrdReq = 0;
          this.crdReqobj.crdStatusChange = 0;
        }else{
          this.crdReqobj.crdStatusChange = 1;
          this.crdReqobj.newCrdReq = 0;
          this.crdReqobj.crdIncUpdate = 0;
        }
        this.crdReqobj.submittedBy = this.ics.user.userSk;
        this.crdReqobj.userSyskey = this.ics.user.userSk;
        this.crdReqobj.requestDate = this.ics.dateFormatCorrector(this.ics.dateFormatter.DTPtoDB, todayDate);
        const url = this.ics.appConfig.apiurl + 'account/savecreditreq';
        var subscribe = this.http.post(url, this.crdReqobj, this.ics.getOptions()).subscribe(
          (data: any) => {
            if (data.status == "SUCCESS") {
              status = "SUCCESS!"
              this.idNamesIndex = 0;
              this.dtlFlag = false;
              el.dismiss();
            } else if (data.status == "CODEEXITS") {
              status = "CODEEXITS!"
              el.dismiss();
            } 
            else {
              status = "FAIL!"
              el.dismiss();
            }
          },
          e => {
            status = "FAIL!"
            el.dismiss();
          })
        el.onDidDismiss().then(
          el => {
            if (status == "SUCCESS!") {
              this.ics.showToast(this.tostCtrl,"Message","Saved Successfully!",1000).then(
                e => {
                  this.getNew();
                  this.getCreditReqList(0);
                  $('#crdlist-tab').tab('show');
                }
              );             
            } else if (status == "CODEEXITS!") {
              this.ics.showToast(this.tostCtrl,"Message","Code Already Exists!",1000);
            } else {
              this.ics.showToast(this.tostCtrl,"Message","Saving Fail!",1000);
            }
          });
      }  
    )
  }
}

onSelectionChange(){
  this.crdReqobj.shopSyskey = this.shopSearch.shopSyskey;
  let tempShopList = this._shopList.filter(
    data => {
      return data.shopSysKey == this.crdReqobj.shopSyskey;
    }
    )[0];
  $('#crdshop').val(tempShopList.shopName);
  this.crdReqobj.shopCode = tempShopList.shopCode;
  this.crdReqobj.shopName = tempShopList.shopName;
  this.crdReqobj.shopAddress = tempShopList.address;
  this.shopSearch.shopSyskey = tempShopList.shopName;
  this.shopSearch.shopCode = tempShopList.shopCode;
}

onSelectionChangeShopCode(){
  this.crdReqobj.shopCode = this.shopSearch.shopCode;
  let tempShopList = this._shopListCode.filter(
    data => {
      return data == this.crdReqobj.shopCode;
    }
    )[0];
  $('#crdshopCode').val(tempShopList.shopCode);
  this.crdReqobj.shopCode = tempShopList.shopCode;
  this.crdReqobj.shopName = tempShopList.shopName;
  this.crdReqobj.shopAddress = tempShopList.address;
  this.crdReqobj.shopSyskey = tempShopList.shopSysKey;

  this.shopSearch.shopSyskey = tempShopList.shopName; // tempShopList.shopName;
  this.shopSearch.shopCode = tempShopList.shopCode;
}

getDefaultSearchObject() {
  return {  
    "fromDate": "",
    "toDate": "", 
    "shopCode": "", 
    "shopName": "" , 
    "submittedBy": "", 
    "current": "",
    "maxRow": "", 
    "stateCriSkey":"", 
    "districtCriSkey":"", 
    "tspCriSkey":"", 
    "requestType" :"0",
    // "crdRequestType": "0",
  };
}

// updateCreditStatus(creditStatus, creditData) {
//   this.spinner = true;
//   const url = this.ics.appConfig.apiurl + 'account/updateCreditStatus';
//   this.creditUpdateData.syskey = creditData.syskey;
//   this.creditUpdateData.creditStatus = creditStatus;
//   this.creditUpdateData.shopCode = creditData.shopCode;
//   this.http.post(url,this.creditUpdateData, this.ics.getOptions()).subscribe(
//     (data: any) => {
//       if(data.status === 'SUCCESS') {
//         this.spinner = false;
//         this.ics.showToast(this.tostCtrl,"Message","Updated Successfully!",1000);
//         this.getCreditReqList(0);
//       } else {
//         this.spinner = false;
//         this.ics.showToast(this.tostCtrl,"Message","Updated Fail!",1000);
//         this.getCreditReqList(0);
//       }
//     }, error => {
//       this.spinner = false;
//   });
// }
getCreditReqList(currIndex) {
  this.btn = false;
  this.spinner = true;
  let status = "";
  const url = this.ics.appConfig.apiurl + 'account/getcreditreqlist';
  this.search_param.maxRow = this.config.itemsPerPage +"";
  this.search_param.current = currIndex;
  let fromDate = this.search_param.fromDate;
  let toDate = this.search_param.toDate;
  if (this.search_param.fromDate.toString() != "") {
    this.search_param.fromDate = this.ics.dateFormatCorrector(this.ics.dateFormatter.DTPtoDB, this.search_param.fromDate);
  } else {
    this.search_param.fromDate = "";
  }    
  if (this.search_param.toDate.toString() != "") {
    this.search_param.toDate = this.ics.dateFormatCorrector(this.ics.dateFormatter.DTPtoDB, this.search_param.toDate);
  } else {
    this.search_param.toDate = "";
  }
  var subscribe = this.http.post(url, this.search_param, this.ics.getOptions()).subscribe(
    (data: any) => {
      this._creditReqList = data.creditReqList;
      this.config.totalItems = data.rowCount;
      for (var i = 0; i < this._creditReqList.length; i++) {
        if (this._creditReqList[i].requestDate.toString() != "") {
          this._creditReqList[i].requestDate = this.ics.dateFormatCorrector(this.ics.dateFormatter.DBtoUI, this._creditReqList[i].requestDate);
        }
        this._creditReqList[i].newCrdReq = this._creditReqList[i].newCrdReq == 1 ? 'YES': 'NO';
        this._creditReqList[i].crdIncUpdate = this._creditReqList[i].crdIncUpdate == 1 ? 'YES': 'NO';
        this._creditReqList[i].crdStatusChange = this._creditReqList[i].crdStatusChange == 1 ? 'YES': 'NO';
      }
    },
    error => {
      this.spinner = false;
    },
    () => { this.spinner = false;}
  );
  this.search_param.fromDate = fromDate;
  this.search_param.toDate = toDate;
}
getCrdRequestBySyskey(syskey)
{
  const url = this.ics.appConfig.apiurl + 'account/getCrdRequestBySyskey/' + syskey;
  this.http.get(url, this.ics.getOptions()).subscribe(
    (data:any) => 
    {
      this.crdReqobj = data; 
      this.shopSearch.shopSyskey = this.crdReqobj.shopName;
      this.shopSearch.shopCode = this.crdReqobj.shopCode;
      this.getDistrictList(this.crdReqobj.stateSyskey);
      this.getTownShipList(this.crdReqobj.districtSyskey);
      if(this.crdReqobj.newCrdReq == 1)
      {
        this.requestType = "1";
      }else if(this.crdReqobj.crdIncUpdate ==1 ){
        this.requestType = "2";
      }else if(this.crdReqobj.crdStatusChange ==1 ){
        this.requestType = "3";
      }
    }
  )
}
isvalid()
{
  if (this.crdReqobj.stateSyskey == "") {
    this.ics.showToast(this.tostCtrl,"Message","Choose State!",1000);
    return false;
  }
  if (this.crdReqobj.districtSyskey == "") {
    this.ics.showToast(this.tostCtrl,"Message","Choose District!",1000);
    return false;
  }
  if (this.crdReqobj.townshipSyskey == "") {
    this.ics.showToast(this.tostCtrl,"Message","Choose Township!",1000);
    return false;
  }
  if (this.crdReqobj.shopName == "") {
    this.ics.showToast(this.tostCtrl,"Message","Choose Shop!",1000);
    return false;
  }
  if (this.crdReqobj.shopCode == "") {
    this.ics.showToast(this.tostCtrl,"Message","Choose Shop Code!",1000);
    return false;
  }

  if (this.crdReqobj.shopSyskey == "") {
    this.ics.showToast(this.tostCtrl,"Message","Choose Shop Again!",1000);
    this.shopSearch.shopSyskey = '';
    return false;
  }
  if (this.requestType == "") {
    this.ics.showToast(this.tostCtrl,"Message","Choose Request Type!",1000);
    return false;
  }
  return true;
}
gotoDelete() 
{
  this.alertCtrl.create({
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
  this.http.get(this.ics.appConfig.apiurl + 'account/deleteCreditRequest/' + this.crdReqobj.syskey, this.ics.getOptions()).subscribe(
    (data: any) => {
      el.dismiss();
      if (data.message == "SUCCESS") {
        this.ics.showToast(this.tostCtrl,"Message","Deleted Successfully!",1000).then(
          e => {
            this.getNew();
            this.getCreditReqList(0);
            $('#crdlist-tab').tab('show');
          }
        );     
      } 
      else {
        this.ics.showToast(this.tostCtrl,"Message","Deleted Fail!",1000)
      }
    },
    (error: any) => {
      this.ics.showToast(this.tostCtrl,"Message","Deleting Fail!",1000);
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
print()
{
  this.loading.create({
    message: "Processing..",
    backdropDismiss: false
  }).then(
    el => {
      el.present();
      let fromDate = this.search_param.fromDate;
      let toDate = this.search_param.toDate;
      if (this.search_param.fromDate.toString() != "") {
        this.search_param.fromDate = this.ics.dateFormatCorrector(this.ics.dateFormatter.DTPtoDB, this.search_param.fromDate);
      } else {
        this.search_param.fromDate = "";
      }    
      if (this.search_param.toDate.toString() != "") {
        this.search_param.toDate = this.ics.dateFormatCorrector(this.ics.dateFormatter.DTPtoDB, this.search_param.toDate);
      } else {
        this.search_param.toDate = "";
      }
      const url = this.ics.appConfig.apiurl + 'account/getcreditreqlist';
     
      this.http.post(url, this.search_param, this.ics.getOptions()).subscribe(
        (data: any) => {
          el.dismiss();
          let cri_date1 = "";
          let cri_date2 = "";
          if (this.search_param.fromDate.toString() != "") {
            cri_date1 = this.ics.dateFormatCorrector(this.ics.dateFormatter.DBtoUI, this.search_param.fromDate).toString();
          }
          if (this.search_param.toDate.toString() != "") {
            cri_date2 = this.ics.dateFormatCorrector(this.ics.dateFormatter.DBtoUI, this.search_param.toDate).toString();
          }

            let crddata = data.creditReqList;
            let cri_flag = 0;

            let excel_date = "";
            let type_flag = "";

            let excelTitle = "Credit Request Form Report"; 
            let excelHeaderData = [
              "Shop Code", "Shop Name", "Shop Address", "Township", "District", "State", "Requested Date", "Submitted By", 
              "New Credit", "Credit Increase/Update", "Credit Status Update", "Credit Request(Text)", "Note"
            ];
            let excelDataList: any = [];

            let workbook = new Workbook();
            let worksheet = workbook.addWorksheet('Credit Request Form Data');

            for (var exCount = 0; exCount < crddata.length; exCount++) {
              let excelData: any = [];
              excel_date = this.ics.dateFormatCorrector(this.ics.dateFormatter.DBtoUI, crddata[exCount].requestDate).toString();
              
              excelData.push(crddata[exCount].shopCode);
              excelData.push(crddata[exCount].shopName);              
              excelData.push(crddata[exCount].shopAddress);
              excelData.push(crddata[exCount].townshipDesc);
              excelData.push(crddata[exCount].districtDesc);
              excelData.push(crddata[exCount].stateDesc);
              excelData.push(excel_date);
              excelData.push(crddata[exCount].submittedUser);
              if(crddata[exCount].newCrdReq == 1)
              {
                excelData.push('YES');
              }else{
                excelData.push('NO');
              }
              if(crddata[exCount].crdIncUpdate == 1){
                excelData.push('YES');
              }else{
                excelData.push('NO');
              }
              if(crddata[exCount].crdStatusChange == 1){
                excelData.push('YES');
              }else{
                excelData.push('NO');
              }
              excelData.push(crddata[exCount].crdReqTxt);
              excelData.push(crddata[exCount].noteTxt);
              excelDataList.push(excelData);
            }

            let titleRow = worksheet.addRow(["", "", excelTitle]);
            titleRow.font = { bold: true };
            worksheet.addRow([]);

            let criteriaRow;
            if (cri_date1.toString() != "") {
              criteriaRow = worksheet.addRow(["From Date : " + cri_date1.toString()]);
              criteriaRow.font = { bold: true };
              cri_flag++;
            }
            if (cri_date2.toString() != "") {
              criteriaRow = worksheet.addRow(["To Date : " + cri_date2.toString()]);
              criteriaRow.font = { bold: true };
              cri_flag++;
            }
            if (this.search_param.shopName.toString() != "") {
              criteriaRow = worksheet.addRow(["Shop Name : " + this.search_param.shopName.toString()]);
              criteriaRow.font = { bold: true };
              cri_flag++;
            }
            if (this.search_param.tspCriSkey.toString() != "") {             
              if(data.creditReqList.length){
                criteriaRow = worksheet.addRow(["Township : " + crddata[0].townshipDesc.toString()]);
              }else{
                criteriaRow = worksheet.addRow(["Township : " + '']);
              }
              criteriaRow.font = { bold: true };
              cri_flag++;
            }
            if (this.search_param.districtCriSkey.toString() != "") {              
              if(data.creditReqList.length){
                criteriaRow = worksheet.addRow(["District : " + crddata[0].districtDesc.toString()]);
              }else{
                criteriaRow = worksheet.addRow(["District : " + '']);
              }
              criteriaRow.font = { bold: true };
              cri_flag++;
            }
            if (this.search_param.stateCriSkey.toString() != "") {              
              if(data.creditReqList.length){
                criteriaRow = worksheet.addRow(["State : " + crddata[0].stateDesc.toString()]);
              }else{
                criteriaRow = worksheet.addRow(["State : " + '']);
              }
              criteriaRow.font = { bold: true };
              cri_flag++;
            }

            if (this.search_param.requestType.toString() != "0") {
              if (this.search_param.requestType.toString() == "1") {
                type_flag = "New Credit";
              } else if (this.search_param.requestType.toString() == "2") {
                type_flag = "Credit Increase/Update";
              }else{
                type_flag = "Credit Status Update";
              }
              criteriaRow = worksheet.addRow(["Request Type : " + type_flag]);
              criteriaRow.font = { bold: true };
              cri_flag++;
            }

            if (cri_flag == 0) {
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
              FileSaver.saveAs(blob, "CrdRequest_export_" + new Date().getTime() + EXCEL_EXTENSION); 
            });
            this.search_param.fromDate = fromDate;
            this.search_param.toDate = toDate;
        }
        
      );


    }
  )
}



}