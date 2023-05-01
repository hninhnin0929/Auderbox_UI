import { Component, OnInit, ViewChild ,ElementRef} from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, HttpHandler } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, Events, AlertController,LoadingController, ToastController } from '@ionic/angular';
import {MatDatepickerModule}from '@angular/material/datepicker';
import {ImageCroppedEvent,ImageCropperComponent} from 'ngx-image-cropper'
declare var $: any;
@Component({
  selector: 'app-campaignbrand',
  templateUrl: './campaignbrand.page.html',
  styleUrls: ['./campaignbrand.page.scss'],
})
export class CampaignbrandPage implements OnInit {
  @ViewChild('picker',{static : false}) matDatepicker: MatDatepickerModule;
  @ViewChild('picker1',{static : false}) matDatepicker1: MatDatepickerModule;
  @ViewChild('fileput',{static : false}) impFileInput: ElementRef;
  @ViewChild(ImageCropperComponent,{ static: false}) imgCropper !:ImageCropperComponent;
  _brandownerList:any=[];
  _CambrandList:any=[];
  obj = this.getObj();
  btn:boolean = false;
  boCode : any = "";
  searchtab :boolean = false;
  spinner: boolean = false;
  search_param = this.getDefaultSearchObject();
  delete_param = this.getDefaultDeleteObject();

 constructor(
   private http: HttpClient,
   public alertCtrl: AlertController, 
   private ics:ControllerService,
   public activeRoute: ActivatedRoute,
   public loading: LoadingController,
   public tost: ToastController
 ) {
   this.getBrandList();
  }

 ngOnInit() {
  this.getCambrandList();
 }
 
 ionViewWillEnter() {
   this.ics.isLoginUser();
   this.btn = false;
   this.getCambrandList();
   $('#cambrandlist-tab').tab('show');
 }
 listTab(){
  this.ionViewWillEnter();
  this.btn = false;
  }
newTabClick(e){
  this.obj = this.getObj();
}
tab(e){

}
 detailTab() {
  this.obj = this.getObj();
   this.getBrandList();
   $('#cambrandnew-tab').tab('show');
 }
 detail(item) {
  this.btn = true;
  this.obj = item;
  this.getBrandList();
  $('#cambrandnew-tab').tab('show');
  let credDate: any = this.ics.dateFormatCorrector(this.ics.dateFormatter.UItoDTP, this.obj.createddate);
  let modiDate: any = this.ics.dateFormatCorrector(this.ics.dateFormatter.UItoDTP, this.obj.modifieddate);
  this.obj.createddate  = credDate;
  this.obj.modifieddate = modiDate;
}
 getBrandList(){
   if (this.ics.user.orgId.length == 0) return;
   let status = "";
       const url = this.ics.appConfig.apiurl + 'brandowner/getbrandowner';
       var param = {
         code: "",
         description: ""
       }
       var subscribe = this.http.post(url, param, this.ics.getOptions()).subscribe(
         (data: any) => {
           this._brandownerList = data.dataList;           
           if(this.obj.n3 != "0"){
            for (let i = 0; i < this._brandownerList.length; i++) {
              if(this._brandownerList[i].syskey==this.obj.n3){
                this.obj.n3 = this._brandownerList[i].syskey;
              }
            }
           }else{
            this.obj.n3 = this._brandownerList[0].syskey;
            this.boCode = this._brandownerList[0].t1;
           }
         }
       )
 }
 getObj(){
  return {
   syskey : "0",
    createddate : "",
    modifieddate : "",
    userid: "",
    username: "",
    RecordStatus : 0,
    SyncStatus : 0,
    SyncBatch : "",
    t1 : "TBA",
    t2 : "",
    t3 : "",
    n1 : 0,
    n2 : 0,
    n3 :"",
    Usersyskey : ""

  };
 }

 getCambrandList() { 
    this.btn = false;
    this.spinner = true;
    if (this.ics.user.orgId.length == 0) return;
    let status = "";      
       const url = this.ics.appConfig.apiurl + 'campaignbrand/searchCampaignBrandList';
       var param = { "codeType": this.search_param.codeType, "code": this.search_param.code, "descriptionType": this.search_param.descriptionType, "description": this.search_param.description, "currentPage": 1, "pageSize": 0 };
       var subscribe = this.http.post(url, param, this.ics.getOptions()).subscribe(
         (data: any) => {
           this._CambrandList = data.dataList;
           this.spinner = false;
           for (let i = 0; i < this._CambrandList.length; i++) {
            this._CambrandList[i].createddate = this.ics.dateFormatCorrector(this.ics.dateFormatter.DBtoUI, this._CambrandList[i].createddate);
            this._CambrandList[i].modifieddate = this.ics.dateFormatCorrector(this.ics.dateFormatter.DBtoUI, this._CambrandList[i].modifieddate);
           }
         }
       )
 }
 getDefaultDeleteObject() {
  return { 
    "inUsed_Table" : "UVM010", 
    "count_Column" : "SYSKEY", 
    "inUsed_Column" : "n3", 

    "delete_Table" : "UVM007",      
    "delete_Column" : "SYSKEY",
    "delete_Key" : ""  
  };
}
 gotoDelete(){
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
  const url = this.ics.appConfig.apiurl + 'delete/tempDelete';
    this.delete_param.delete_Key = this.obj.syskey;
    var subscribe = this.http.post(url, this.delete_param, this.ics.getOptions()).subscribe(
      (data: any) => {
        el.dismiss();
        if (data.message == "SUCCESS!") {
          this.ics.showToast(this.tost,"Message","Deleted Successfully!",1000).then(
            e => {
              this.ics.isLoginUser();
              this.getCambrandList();
              $('#cambrandlist-tab').tab('show');
            }
          );            
        } else if (data.message == "USED!") {
          this.ics.showToast(this.tost,"Message","This Campaign Already in Used!",1000);
        } else {
          this.ics.showToast(this.tost,"Message","Deleting Fail!",1000);
        }
      },
      (error: any) => {
        this.ics.showToast(this.tost,"Message","Deleting Fail!",1000);
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
     

       save() {
        if(this.isvalid()){
          if(this.obj.syskey =="0"){
            this.preparedCode();
          }     
          this.obj.createddate = this.ics.dateFormatCorrector(this.ics.dateFormatter.DTPtoDB, this.obj.createddate).toString();
          this.obj.modifieddate = this.ics.dateFormatCorrector(this.ics.dateFormatter.DTPtoDB, this.obj.modifieddate).toString(); 
          let url: string = this.ics.appConfig.apiurl + 'campaignbrand/save/';
          this.http.post(url, this.obj, this.ics.getOptions()).subscribe(
            (data:any)=>{
              if(data.message=="SUCCESS"){               
                this.ics.showToast(this.tost, "Message", "Saved Successfully!", 2000).then(
                  e => {
                    this.ics.isLoginUser();
                    this.getCambrandList();
                    $('#cambrandlist-tab').tab('show');
                  }
                );        
              } else if(data.message=="CODEEXISTS"){
                this.ics.showToast(this.tost, "Message", "Code Already Exists!", 2000);
              }
              else{
                this.ics.showToast(this.tost, "Message", "Saving Fail!", 2000);                
              }
            },
            (error:any)=>{
              this.ics.showToast(this.tost, "Message", "Saving Fail!", 2000); 
            });
        }
        }
     

  isvalid() {    
    if (this.obj.t1.trim().length === 0) {
      this.ics.showToast(this.tost,"Message","Invalid Code!",1000);      
      return false;
    }
    if (this.obj.t2.trim().length === 0) {
      this.ics.showToast(this.tost,"Message","Invalid Name!",1000);
      return false;
    }
    if(this.obj.n3 == "" || this.obj.n3 == "0"){
      this.ics.showToast(this.tost,"Message","Choose Brand Owner!",1000);
      return false;
    }
    if(this.obj.createddate == ""){
      this.ics.showToast(this.tost,"Message","Invalid From Date!",1000);
      return false;
    }
    if(this.obj.modifieddate == ""){
      this.ics.showToast(this.tost,"Message","Invalid To Date!",1000);
      return false;
    }
    else return true;
  }  
  getBrandOwnerCode(boSyskey){    
    for (let i = 0; i < this._brandownerList.length; i++) {
      if(this._brandownerList[i].syskey == boSyskey){
        this.boCode = this._brandownerList[i].t1;
        let date;
        date = this.ics.dateFormatCorrector(this.ics.dateFormatter.DTPtoDB, this.obj.createddate)
        date = date.substring(2, 8);
      }
    }    
  }

  preparedCode(){
    this.obj.t1 = this.boCode + this.ics.dateFormatCorrector(this.ics.dateFormatter.DTPtoDB, this.obj.createddate).toString().substring(2,8);  
  }

  advanceSearch(option) {
    this.searchtab = option;
    if(!this.searchtab){this.refresh();}
  }

  getDefaultSearchObject() {
    return { "codeType": "c", "descriptionType": "c", "code": "", "description": "" };
  }

  refresh(){
    this.search_param = this.getDefaultSearchObject();
    this.getCambrandList();
  }



}
