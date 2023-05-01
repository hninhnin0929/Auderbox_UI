import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient } from '@angular/common/http';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { Workbook } from 'exceljs';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import * as FileSaver from 'file-saver';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
declare var $: any;

@Component({
  selector: 'app-brand-owner',
  templateUrl: './brand-owner.page.html',
  styleUrls: ['./brand-owner.page.scss'],
})
export class BrandOwnerPage implements OnInit {
  _vendorList:any;
  list: any = [];
  catlist: any = [];
  obj: any = this.getObj();
  catid: any;
  btn:boolean = false;
  searchtab :boolean = false;
  spinner: boolean = false;
  search_param = this.getDefaultSearchObject();
  delete_param = this.getDefaultDeleteObject();

  constructor(
    public manager: ControllerService,
    public http: HttpClient,
    public loading: LoadingController,
    public alertController: AlertController,
    public tost: ToastController
  ) { }

  ngOnInit() {
    this.manager.isLoginUser();

  }

  ionViewWillEnter() {
    this.manager.isLoginUser();
    this.getAll();
    this.btn = false;
    this.getVendorList();
    $('#bolist-tab').tab('show');
  }
  listTab(){
    this.search_param = this.getDefaultSearchObject();
    this.search_param.vendorSyskey = "0";
    this.ionViewWillEnter();
    this.btn = false;
  }
  newTabClick(e){
    this.searchtab = false;
    this.obj = this.getObj();
    this.getVendorList();
    this.getCatelist(false);
  }
  tab(e){

  }
  detailTab(item) {
    this.obj = this.getObj();
    this.getVendorList();
    this.getCatelist(false);
  
    $('#bonew-tab').tab('show');
  }
  getAll() {
    this.btn = false;
    this.spinner = true;
    if (this.manager.user.orgId.length == 0) return;
    let status = "";
    const url = this.manager.appConfig.apiurl + 'brandowner/getlist';
    var param = { "codeType": this.search_param.codeType, "code": this.search_param.code, "descriptionType": this.search_param.descriptionType, "description": this.search_param.description, "currentPage": 1, "pageSize": 0,"vendorSyskey":this.search_param.vendorSyskey };
    var subscribe = this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.list = data;
        this.spinner = false;
      }
    )
  }
  
  
  getCatelist(option: boolean) {
    if (this.manager.user.orgId.length == 0) return;
    let status = "";
    const url = this.manager.appConfig.apiurl + 'stockcategory/searchStockCategoryList';
    var param = {
      code: "",
      description: ""
    }
    var subscribe = this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.catlist = data.catlist;
        if(this.catlist.length){
          for (let i = 0; i < this.catlist.length; i++) {
            if (option) {
              for (let y = 0; y < this.obj.jun.length; y++) {
                if (this.obj.jun[y].catsyskey == this.catlist[i].syskey) {
                  this.catlist[i].selected = true;
                  break;
                } else {
                  this.catlist[i].selected = false;
                }
              }
            } else {
              this.catlist[i].selected = false;
            }
          }
        }
      }
    )     
  }
  getVendorList(){
    if (this.manager.user.orgId.length == 0) return;
    let status = "";
    const url = this.manager.appConfig.apiurl + 'vendor/getvendorlist';
    var param = {
          code: "",
          description: ""
    }
    var subscribe = this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
          this._vendorList = data.dataList;         
          if(this.obj.n1 == "0" || this.obj.n1 == "" ){
            this.obj.n1 = this._vendorList[0].syskey;
          }else{
            for (let i = 0; i < this._vendorList.length; i++) {
              if(this._vendorList[i].syskey==this.obj.n1){
                this.obj.n1 = this._vendorList[i].syskey;
              }
            }
          }
        }
    )
  }

  detail(item) {
    this.btn = true;
    this.obj = item;
    this.getVendorList();
  
    this.catid = item.jun.catsyskey;
     this.getCatelist(true);
    $('#bonew-tab').tab('show');
  }
  getObj() {
    return {
      syskey: "",
      t1: "TBA",
      t2: "",
      n1:"0",
      recordStatus: 1,
      jun: []

    }
  }
  getvendorobj() {
    return {
      syskey: "0",
      createdDate: "",
      modifiedDate: "",
      userId: "",
      userName: "",
      recordStatus: 1,
      syncStatus: 0,
      syncBatch: 0,
      t1: "",
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
  getJunObj() {
    return {
      bosyskey: "",
      catsyskey: "",
      t1: "",
      createdDate: "",
      modifiedDate: "",
      recordStatus: 1,
      n1: "0",
      n2: "0",
      n3: "0"
    }
  }
  save() {
    if (this.manager.user.orgId.length == 0) return;
    if(this.isvalid()){
      var msg = ""

      if (this.obj.syskey.length > 3) msg = "Updating data.."
      else msg = "Saving data.."
      this.loading.create(
        {
          message: msg,
          duration: 20000
        }
      ).then(
        el => {
          el.present();
          var status = "";
  
  
          this.obj.jun = [];
          for (let i = 0; i < this.catlist.length; i++) {
            if (this.catlist[i].selected == true) {
              var jun = this.getJunObj();
              jun.catsyskey = this.catlist[i].syskey;
              jun.bosyskey = "0";
              this.obj.jun.push(jun);
            }
          };
  
          const url = this.manager.appConfig.apiurl + 'brandowner/save';
          var subscribe = this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
            (data: any) => {
              console.log(data);
              if (data.message == "SUCCESS!") {
                status = "SUCCESS!"
                el.dismiss();
              } else {
                status = "FAIL!"
                el.dismiss();
              }
            },
            e => {
              status = "FAIL!"
              el.dismiss();
            }
          )
          el.onDidDismiss().then(
            el => {
              if (status == "SUCCESS!") {
                this.manager.showToast(this.tost, "Message", "Saved Successfully!", 2000).then(
                  e => {
                    this.manager.isLoginUser();
                    this.getAll();
                    $('#bolist-tab').tab('show');
                  }
                );             
              } else if (status == "FAIL!") {
                this.manager.showToast(this.tost, "Message", "Saving Fail!", 2000)
              } else {
                subscribe.unsubscribe();
                this.manager.showToast(this.tost, "Message", "Timeout! try again", 2000);
              }
            }
          )
        }
      )
    }
  }

  isvalid() {
     if (this.obj.t2.trim().length === 0) {
      this.manager.showToast(this.tost,"Message","Invalid Name!",1000);
      return false;
    }
    if (this.obj.n1 == "0") {
      this.manager.showToast(this.tost,"Message","Invalid Vendor!",1000);
      return false;
    }
    else return true;
  }  

  advanceSearch(option) {
    this.searchtab = option;
    if(!this.searchtab){this.refresh();}
  }

  getDefaultSearchObject() {
    return { "codeType": "c", "descriptionType": "c", "code": "", "description": "", "vendorSyskey":"0" };
  }

  refresh(){
    this.search_param = this.getDefaultSearchObject();
    this.getAll();
  }

  getDefaultDeleteObject() {
    return { 
      //in Used // e.g. SELECT COUNT(SYSKEY) AS TOTALCOUNT FROM STK014 WHERE n3= ?
      "inUsed_RecordStatus" : "RecordStatus", 
      "inUsed_Table" : "STK014", 
      "count_Column" : "SYSKEY", 
      "inUsed_Column" : "n3", 
      //delete process  // e.g. UPDATE UVM003 SET RECORDSTATUS = 4 WHERE SYSKEY=?
      "delete_Table" : "UVM003",      
      "delete_Column" : "SYSKEY",
      "delete_Key" : ""  //syskey for inUse and Delete //set this param in gotoDelete();
    };
  }

  gotoDelete() { //DeleteController.java
    if (this.manager.user.orgId.length == 0) return;
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
        const url = this.manager.appConfig.apiurl + 'delete/tempDelete';
        this.delete_param.delete_Key = this.obj.syskey;
        var subscribe = this.http.post(url, this.delete_param, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            if (data.message == "SUCCESS!") {
              status = "SUCCESS!"
              el.dismiss();
            } else if(data.message == "USED!"){
              status = "USED!"
              el.dismiss();
            }else {
              status = "FAIL!"
              el.dismiss();
            }
          },
          e => {
            status = "FAIL!"
            el.dismiss();
          }
        )
        el.onDidDismiss().then(
          el => {
            if (status == "SUCCESS!") {
              this.manager.showToast(this.tost,"Message","Deleted Successfully!",1000).then(
                e => {
                  this.manager.isLoginUser();
                    this.getAll();
                    $('#bolist-tab').tab('show');
                }
              );             
            } else if (status == "USED!") {
              this.manager.showToast(this.tost,"Message","This Brand Owner is in Used!",1000);
            } else {
              this.manager.showToast(this.tost,"Message","Deleteing Fail!",1000);
            }
          },
          (error:any)=>{
            this.manager.showToast(this.tost,"Message","Deleting Fail!",1000);
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
  print() {
    const url = this.manager.appConfig.apiurl + 'brandowner/getlist';
    var param = { "codeType": this.search_param.codeType, "code": this.search_param.code, "descriptionType": this.search_param.descriptionType, "description": this.search_param.description, "currentPage": 1, "pageSize": 0,"vendorSyskey":this.search_param.vendorSyskey };
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        let data1 = data;
        let cri_flag = 0;
        let utypeTemp = "";

        let excelTitle = "BrandOwner List Report";
        let excelHeaderData = [
          " Code", " Name","Vendor Name"
        ];
        let excelDataList: any = [];
        
        for(var exCount = 0; exCount < data1.length; exCount++){
          let excelData: any = [];
          utypeTemp = this.manager.getUserTypeDesc(data1[exCount].userType);

          excelData.push(data1[exCount].t1);
          excelData.push(data1[exCount].t2);
          excelData.push(data1[exCount].vendorName);
          excelDataList.push(excelData);
        }

        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet('BrandOwner List Data');

        let titleRow = worksheet.addRow(["","",excelTitle]);
        titleRow.font = {bold: true};
        worksheet.addRow([]);

        let criteriaRow;
        if(param.code.toString() != ""){
          criteriaRow = worksheet.addRow(["BrandOwner Code : " + param.code.toString()]);
          criteriaRow.font = {bold: true};
          cri_flag++;
        }
        if(param.description.toString() != ""){
          criteriaRow = worksheet.addRow(["BrandOwner Name : " + param.description.toString()]);
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
          FileSaver.saveAs(blob, "BrandOwner_export_" + new  Date().getTime() + EXCEL_EXTENSION);
        });
      }
    );
  }
}
