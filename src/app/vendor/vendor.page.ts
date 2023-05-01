import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient } from '@angular/common/http';
import { ThrowStmt } from '@angular/compiler';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { Workbook } from 'exceljs';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import * as FileSaver from 'file-saver';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
declare var $: any;

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.page.html',
  styleUrls: ['./vendor.page.scss'],
})
export class VendorPage implements OnInit {
  _vendorList:any=[];
  obj = this.getObj();
  btn:boolean = false;
  searchtab :boolean = false;
  spinner: boolean = false;
  search_param = this.getDefaultSearchObject();
  delete_param = this.getDefaultDeleteObject();

  constructor(
    private http: HttpClient,
    private ics:ControllerService,
    private tostCtrl: ToastController,
    private alertController: AlertController,
    private load:LoadingController
  
  ) {
    
   }
   ngOnInit() {
    this.ics.isLoginUser();
  }
  async  ionViewWillEnter() {
    this.ics.isLoginUser();
    this.search_param = this.getDefaultSearchObject();
    this.getVendorList();
    $('#vendor-list-tab').tab('show');
    // this.runSpinner(true);
    // await this.getVendorList();
    // this.runSpinner(false);
  }

  getVendorList() {
    this.btn = false;
    this.spinner = true;
    if (this.ics.user.orgId.length == 0) return;
    let url: string = this.ics.appConfig.apiurl + 'vendor/searchVendorList';
    var param = { "codeType": this.search_param.codeType, "code": this.search_param.code, "descriptionType": this.search_param.descriptionType, "description": this.search_param.description, "currentPage": 1, "pageSize": 0, };
    this.http.post(url, param, this.ics.getOptions()).subscribe(
      (data: any) => {
        this._vendorList = data.dataList;
        this.spinner = false;
      },
      error => {
        this.spinner = false;
      }
    )
  }

  detail(obj) {
    this.btn = true;
    this.obj = this.getObj();
    this.obj.syskey=obj.syskey;
    this.obj.t1=obj.t1;
    this.obj.t2=obj.t2;  
  $('#vendor-new-tab').tab('show');
  }
  newTabClick(e){
    this.searchtab = false;
    this.obj = this.getObj(); 
  }
  tab(e){

  } 
  new(){
    this.obj = this.getObj();
    $('#vendor-new-tab').tab('show');
  }
  listTab(){
    this.ionViewWillEnter();
  }
  async search() {
    this.runSpinner(true);
    await this.getVendorList();
    this.runSpinner(false);
  }
  runSpinner(t: boolean) {
    this.spinner = t;
  }
  getObj() {
    return {
      syskey: "0",
      createdDate: "",
      modifiedDate: "",
      userId: "",
      userName: "",
      recordStatus: 1,
      syncStatus: 0,
      syncBatch: 0,
      t1: "TBA",
      t2: "",
      t3: "",
      t4: "",
      t5: "",
      t6: "",
      t7: "",
      t8: "",
      t9: "",
      t10: "",
      t11: "",
      t12: "",
      t13: "",
      t14: "",
      t15: "",
      t16: "",
      n1: "0",
      n2: 0,
      n3: 0,
      n4: "0",
      userSyskey: "0",
      n5: "0",
      n6: "0",
      n7: "0",
      n8: "0"
    };

  }
  getDefaultDeleteObject() {
    return { 
      //in Used // e.g. SELECT COUNT(SYSKEY) AS TOTALCOUNT FROM STK014 WHERE n3= ?
      "inUsed_RecordStatus" : "RecordStatus", 
      "inUsed_Table" : "UVM003", 
      "count_Column" : "SYSKEY", 
      "inUsed_Column" : "n1", 
      //delete process  // e.g. UPDATE UVM003 SET RECORDSTATUS = 4 WHERE SYSKEY=?
      "delete_Table" : "UVM004",      
      "delete_Column" : "SYSKEY",
      "delete_Key" : ""  //syskey for inUse and Delete //set this param in gotoDelete();
    };
  }

    async gotoDelete(){
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
              this.load.create({
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
          if(data.message =="SUCCESS!"){
            this.ics.showToast(this.tostCtrl,"Message","Deleted Successfully!",1000).then(
              e => {
                this.getVendorList();
                $('#vendor-list-tab').tab('show');
              }
            );                      
          }else if (data.message == "USED!") {
            this.ics.showToast(this.tostCtrl,"Message","This Vendor Already in Used!",1000);
          } else {
            this.ics.showToast(this.tostCtrl,"Message","Deleting Fail!",1000);
          }
      },
      (error:any)=>{
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

  save() {
    if(this.isvalid()){
      let url: string = this.ics.appConfig.apiurl + 'vendor/save/';
      this.http.post(url, this.obj, this.ics.getOptions()).subscribe(
        (data:any)=>{
          if(data.message=="SUCCESS!"){          
            this.ics.showToast(this.tostCtrl,"Message","Saved Successfully!",1000).then(
              e => {
                this.getVendorList();
                $('#vendor-list-tab').tab('show');
              }
            ); 
          }              
          // }else if (data.message == "CODEEXISTS!") {
          //   this.ics.showToast(this.tostCtrl,"Message","Code Already Exists!",1000);
          // } 
          else {
            this.ics.showToast(this.tostCtrl,"Message","Saving Fail!",1000);
          }
        },
        (error: any) => {
          this.ics.showToast(this.tostCtrl,"Message","Saving Fail!",1000);
        }
      );
    }
  }

    isvalid() {
      if (this.obj.t1.trim().length === 0) {
        this.ics.showToast(this.tostCtrl,"Message","Invalid Code!",1000);
        return false;
      }
      else if (this.obj.t2.trim().length === 0) {
        this.ics.showToast(this.tostCtrl,"Message","Invalid Name!",1000);
        return false;
      }
      else return true;
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
      this.getVendorList();
    }
    print() {
      const url = this.ics.appConfig.apiurl + 'vendor/searchVendorList';
      var param = { "codeType": this.search_param.codeType, "code": this.search_param.code, "descriptionType": this.search_param.descriptionType, "description": this.search_param.description };
      this.http.post(url, param, this.ics.getOptions()).subscribe(
        (data: any) => {
          let data1 = data.dataList;
          let cri_flag = 0;
          let utypeTemp = "";
  
          let excelTitle = " Vendor List Report";
          let excelHeaderData = [
            " Code", " Name"
          ];
          let excelDataList: any = [];
          
          for(var exCount = 0; exCount < data1.length; exCount++){
            let excelData: any = [];
            utypeTemp = this.ics.getUserTypeDesc(data1[exCount].userType);
  
            excelData.push(data1[exCount].t1);
            excelData.push(data1[exCount].t2);
            excelDataList.push(excelData);
          }
  
          let workbook = new Workbook();
          let worksheet = workbook.addWorksheet('Vendor List Data');
  
          let titleRow = worksheet.addRow(["","",excelTitle]);
          titleRow.font = {bold: true};
          worksheet.addRow([]);
  
          let criteriaRow;
          if(param.code.toString() != ""){
            criteriaRow = worksheet.addRow(["Vendor Code : " + param.code.toString()]);
            criteriaRow.font = {bold: true};
            cri_flag++;
          }
          if(param.description.toString() != ""){
            criteriaRow = worksheet.addRow(["Vendor Name : " + param.description.toString()]);
            criteriaRow.font = {bold: true};
            cri_flag++;
          }
         
        
          if(cri_flag == 0){
            criteriaRow = worksheet.addRow(["Search With No Criteria"]);
            criteriaRow.font = {bold: true};
          }
          worksheet.addRow([]);
  
          let headerRow = worksheet.addRow(excelHeaderData);
          headerRow.font = {bold: true};
          for(var i_data = 0; i_data < excelDataList.length; i_data++){
            worksheet.addRow(excelDataList[i_data]);
          }
  
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], {type: EXCEL_TYPE});
            FileSaver.saveAs(blob, "Vendor_export_" + new  Date().getTime() + EXCEL_EXTENSION);
          });
        }
      );
    }

}
