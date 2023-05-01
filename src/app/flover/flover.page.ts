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
  selector: 'app-flover',
  templateUrl: './flover.page.html',
  styleUrls: ['./flover.page.scss'],
})
export class FloverPage implements OnInit {

  btn:boolean = false;
  list: any = [];
  searchtab: boolean = false;
  spinner: boolean = false;
  obj: any = this.getObj();
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

  async ionViewWillEnter() {
    this.manager.isLoginUser();
    this.search_param = this.getDefaultSearchObject();
    this.getAll();
    this.btn = false;
    $('#flover-list-tab').tab('show');
    // this.runSpinner(true);
    await this.getAll();
    // this.runSpinner(false);
  }
 
  getAll() {
    this.btn = false;
    this.spinner = true;
    if (this.manager.user.orgId.length == 0) return;
    const url = this.manager.appConfig.apiurl + 'StockSetup/searchProductCharacterList';
    var param = { "codeType": this.search_param.codeType, "code": this.search_param.code, "descriptionType": this.search_param.descriptionType, "description": this.search_param.description, "currentPage": 1, "pageSize": 0, };
    var subscribe = this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.list = data.dataList;
        this.spinner = false;
        },
        error => {
          this.spinner = false;
        },
        () => { this.spinner = false;}
    )
  }

  detailTab(){

  }
  detail(obj) {
    this.btn = true;
    this.obj = this.getObj();
    this.obj.syskey=obj.syskey;
    this.obj.code=obj.code;
    this.obj.description=obj.description;
    
  $('#flover-new-tab').tab('show');
  }
  newTabClick(e){
    this.obj = this.getObj();
    this.searchtab = false;
   
  $('#flover-new-tab').tab('show');
  }
  listTab(){
    this.ionViewWillEnter();
  }
  
  tab(e){

  }

  getObj() {
    return {
      syskey: "0",
      code: "",
      description: "",
      t3: "",
      recordStatus:1

    }
  }
  save() {
    if (this.manager.user.orgId.length == 0) return;
    if(this.isvalid()){
      var msg = ""
   
      if(this.obj.syskey.length>3) msg = "Updating data.."
      else msg = "Saving data.."
      this.loading.create(
        {
          message: msg,
          duration: 20000
        }
      ).then(
        el => {
          var status="";
          el.present();
          const url = this.manager.appConfig.apiurl + 'StockSetup/saveflover';
          var subscribe = this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
            (data: any) => {
              console.log(data);
              if (data.message == "SUCCESS!") {
                status = "SUCCESS!"
                el.dismiss();
              } else if (data.message == "CODEEXISTS!"){
                status = "CODEEXISTS!"
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
                this.manager.showToast(this.tost,"Message","Saved Successfully!",1000).then(
                  e => {
                    this.getAll();
                    $('#flover-list-tab').tab('show');
                  }
                );             
              } else if (status == "CODEEXISTS!") {
                this.manager.showToast(this.tost,"Message","Code Already Exists!",1000);
              } else {
                this.manager.showToast(this.tost,"Message","Saving Fail!",1000);
              }
            }
          )
        }
      )
    }
  }
  getDefaultDeleteObject() {
    return { 
      //in Used // e.g. SELECT COUNT(SYSKEY) AS TOTALCOUNT FROM STK014 WHERE n3= ?
      "inUsed_RecordStatus" : "RecordStatus", 
      "inUsed_Table" : "STK001", 
      "count_Column" : "SYSKEY", 
      "inUsed_Column" : "n11", 
      //delete process  // e.g. UPDATE UVM003 SET RECORDSTATUS = 4 WHERE SYSKEY=?
      "delete_Table" : "STK013",      
      "delete_Column" : "SYSKEY",
      "delete_Key" : ""  //syskey for inUse and Delete //set this param in gotoDelete();
    };
  }
  gotoDelete() {
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
                  this.getAll();
                  $('#flover-list-tab').tab('show');
                }
              );             
            } else if (status == "USED!") {
              this.manager.showToast(this.tost,"Message","This Product Char is in Used!",1000);
            } else {
              this.manager.showToast(this.tost,"Message","Deleteing Fail!",1000);
            }
          },
          (error: any) => {
            el.dismiss();
            this.manager.showToast(this.tost,"Message","Deleteing Fail!",1000);
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

  isvalid() {
    if (this.obj.code.trim().length === 0) {
      this.manager.showToast(this.tost,"Message","Invalid Code!",1000);
      return false;
    }
    else if (this.obj.description.trim().length === 0) {
      this.manager.showToast(this.tost,"Message","Invalid Description!",1000);
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
    this.getAll();
  }
  print() {
    const url = this.manager.appConfig.apiurl + 'StockSetup/searchProductCharacterList';
    var param = { "codeType": this.search_param.codeType, "code": this.search_param.code, "descriptionType": this.search_param.descriptionType, "description": this.search_param.description };
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        let data1 = data.dataList;
        let cri_flag = 0;
        let utypeTemp = "";

        let excelTitle = "Product Characteristics List Report";
        let excelHeaderData = [
          " Code", " Name"
        ];
        let excelDataList: any = [];
        
        for(var exCount = 0; exCount < data1.length; exCount++){
          let excelData: any = [];
          utypeTemp = this.manager.getUserTypeDesc(data1[exCount].userType);

          excelData.push(data1[exCount].code);
          excelData.push(data1[exCount].description);
          excelDataList.push(excelData);
        }

        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet('Product Characteristics List Data');

        let titleRow = worksheet.addRow(["","",excelTitle]);
        titleRow.font = {bold: true};
        worksheet.addRow([]);

        let criteriaRow;
        if(param.code.toString() != ""){
          criteriaRow = worksheet.addRow(["Characteristics Code : " + param.code.toString()]);
          criteriaRow.font = {bold: true};
          cri_flag++;
        }
        if(param.description.toString() != ""){
          criteriaRow = worksheet.addRow(["Characteristics Name : " + param.description.toString()]);
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
          FileSaver.saveAs(blob, "Characteristics_export_" + new  Date().getTime() + EXCEL_EXTENSION);
        });
      }
    );
  }

}
