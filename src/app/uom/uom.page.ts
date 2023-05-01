import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient } from '@angular/common/http';
import { ThrowStmt } from '@angular/compiler';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
declare var $: any;

@Component({
  selector: 'app-uom',
  templateUrl: './uom.page.html',
  styleUrls: ['./uom.page.scss'],
})
export class UOMPage implements OnInit {
  list: any = [];
  obj: any = this.getObj();
  btn:boolean = false;
  searchtab :boolean = false;
  spinner: boolean = false;
  search_param = this.getDefaultSearchObject();
  delete_param = this.getDefaultDeleteObject();
  config = {
    id: "pg-uomlist",
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
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
    this.search_param = this.getDefaultSearchObject();
    this.getAll(0, this.config.itemsPerPage);
    this.btn = false;
    $('#uomlist-tab').tab('show');
    // this.spinner = false;
  }
  listTab() {
    this.ionViewWillEnter();
  }
  newTabClick(e){
    this.searchtab =  false;
    this.obj = this.getObj();
  }
  tab(e){

  }
  getAll(cur,max) {
    this.btn = false;
    if (this.manager.user.orgId.length == 0) return;
    this.spinner = true;
    const url = this.manager.appConfig.apiurl + 'uom/searchuomlist/' + cur + '/' + max;;
    var param = { "codeType": this.search_param.codeType, "code": this.search_param.code, "descriptionType": this.search_param.descriptionType, "description": this.search_param.description, "currentPage": 1, "pageSize": 0, };
    return new Promise<void>((promiseStock,reject) => {
      var subscribe = this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.config.totalItems = data.totalCount;
            if(cur == 0){
              this.config.currentPage = 1;
            }
          this.list = data.uomListData;
          this.spinner = false;
        },
        error => {
          this.spinner = false;
        },
        () => { this.spinner = false;}
      );
    });
  }
  detail(item) {
    this.btn = true;
    this.obj = item;
    $('#uomnew-tab').tab('show');
  }
  getObj() {
    return {
      syskey: "",
      code: "",
      description: "",
      ratio: ''
    }
  }
  save() {
    if(this.isvalid()){
      if (this.manager.user.orgId.length == 0) return;
   
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
          const url = this.manager.appConfig.apiurl + 'uom/saveuom';
          var subscribe = this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
            (data: any) => {
              if (data.message == "SUCCESS") {
                status = "SUCCESS!"
                el.dismiss();
              } else if(data.message == "CODEEXIST"){
                status = "CODEEXISTS!"
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
                this.manager.showToast(this.tost,"Message","Saved Successfully!",1000).then(
                  e => {
                    this.getAll(0, this.config.itemsPerPage);
                    this.btn = false;
                    $('#uomlist-tab').tab('show');
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
      "inUsed_Table" : "STK031", 
      "count_Column" : "SYSKEY", 
      "inUsed_Column" : "N2", 
      //delete process  // e.g. UPDATE UVM003 SET RECORDSTATUS = 4 WHERE SYSKEY=?
      "delete_Table" : "STK027",      
      "delete_Column" : "SYSKEY",
      "delete_Key" : ""  //syskey for inUse and Delete //set this param in gotoDelete();
    };
  }

  gotoDelete() {
    if (this.manager.user.orgId.length == 0) return;
    var msg = "Deleting Data..."
    this.loading.create(
      {
        message: msg,
        duration: 20000
      }
    ).then(
      el => {
        el.present();
        const url = this.manager.appConfig.apiurl + 'delete/tempDelete';
        this.delete_param.delete_Key = this.obj.syskey;
        var subscribe = this.http.post(url, this.delete_param, this.manager.getOptions()).subscribe(
          (data: any) => {
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
                  this.getAll(0, this.config.itemsPerPage);
                  this.btn = false;
                  $('#uomlist-tab').tab('show');
                }
              );             
            } else if (status == "USED!") {
              this.manager.showToast(this.tost,"Message","This UOM is in Used!",1000);
            } else {
              this.manager.showToast(this.tost,"Message","Deleteing Fail!",1000);
            }

          }
        )
      }
    )
  }

  isvalid() {
    if (this.obj.code.trim().length === 0) {
      this.manager.showToast(this.tost,"Message","Warnning fill all blanks!",1000);
      return false;
    }
    else if (this.obj.description.trim().length === 0) {
      this.manager.showToast(this.tost,"Message","Warnning fill all blanks!",1000);
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
    this.getAll(0, this.config.itemsPerPage);
  }


  // print() {
  //   const url = this.manager.appConfig.apiurl + 'materailtype/searchmaterailtypeList';
  //   var param = { "codeType": this.search_param.codeType, "code": this.search_param.code, "descriptionType": this.search_param.descriptionType, "description": this.search_param.description };
  //   this.http.post(url, param, this.manager.getOptions()).subscribe(
  //     (data: any) => {
  //       let data1 = data.catlist;
  //       let cri_flag = 0;
  //       let utypeTemp = "";

  //       let excelTitle = "Category List Report";
  //       let excelHeaderData = [
  //         "Category Code", "Category Name", "Status"
  //       ];
  //       let excelDataList: any = [];
        
  //       for(var exCount = 0; exCount < data1.length; exCount++){
  //         let excelData: any = [];
  //         utypeTemp = this.manager.getUserTypeDesc(data1[exCount].userType);

  //         excelData.push(data1[exCount].t1);
  //         excelData.push(data1[exCount].t2);
  //         excelData.push(data1[exCount].n2==0?'Active':'Inactive');
  //         excelDataList.push(excelData);
  //       }

  //       let workbook = new Workbook();
  //       let worksheet = workbook.addWorksheet('Category List Data');

  //       let titleRow = worksheet.addRow(["","",excelTitle]);
  //       titleRow.font = {bold: true};
  //       worksheet.addRow([]);

  //       let criteriaRow;
  //       if(param.code.toString() != ""){
  //         criteriaRow = worksheet.addRow(["Category Code : " + param.code.toString()]);
  //         criteriaRow.font = {bold: true};
  //         cri_flag++;
  //       }
  //       if(param.description.toString() != ""){
  //         criteriaRow = worksheet.addRow(["Category Name : " + param.description.toString()]);
  //         criteriaRow.font = {bold: true};
  //         cri_flag++;
  //       }
       
      
  //       if(cri_flag == 0){
  //         criteriaRow = worksheet.addRow(["Search With No Criteria"]);
  //         criteriaRow.font = {bold: true};
  //       }
  //       worksheet.addRow([]);

  //       let headerRow = worksheet.addRow(excelHeaderData);
  //       headerRow.font = {bold: true};
  //       for(var i_data = 0; i_data < excelDataList.length; i_data++){
  //         worksheet.addRow(excelDataList[i_data]);
  //       }

  //       workbook.xlsx.writeBuffer().then((data) => {
  //         let blob = new Blob([data], {type: EXCEL_TYPE});
  //         FileSaver.saveAs(blob, "Category_export_" + new  Date().getTime() + EXCEL_EXTENSION);
  //       });
  //     }
  //   );
  // }
  pageChanged(e) {
    this.config.currentPage = e;
    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.spinner = true;
    this.getAll(currentIndex,this.config.itemsPerPage).then( ()=>{
    this.spinner = false;
    }).catch( ()=>{
      this.spinner = false;
    })
  }
  async search() {
    this.spinner = true;
    this.getAll(0,this.config.itemsPerPage).then( ()=>{
      this.spinner = false;
    }).catch( ()=>{
      this.spinner = false;
    })
  }
  
}
