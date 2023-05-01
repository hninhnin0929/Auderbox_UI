import { Component, OnInit, ViewChild } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, HttpHandler } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, Events, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
declare var $: any;
@Component({
  selector: 'app-campaigntask',
  templateUrl: './campaigntask.page.html',
  styleUrls: ['./campaigntask.page.scss'],
})
export class CampaigntaskPage implements OnInit {
  _campaigntaskList: any = [];
  _campaignbrandList: any = [];
  TypeList: any = [];
  obj = this.getObj();
  btn: boolean = false;
  searchtab :boolean = false;
  spinner: boolean = false;
 

  userType = [{ code: 0, desc: 'Both' }, { code: 1, desc: 'Sale Person' }, { code: 2, desc: 'Delivery Person' }]
  //delete_param = this.getDefaultDeleteObject();

  constructor(
    private http: HttpClient,
    public alertCtrl: AlertController,
    private ics: ControllerService,
    public activeRoute: ActivatedRoute,
    public loading: LoadingController,
    public alertController: AlertController,
    public tostCtrl: ToastController
  ) {

  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.ics.isLoginUser();
    this.btn = false;
    this._campaigntaskList = [];
    this.obj = this.getObj();
    this.getCampaignList();
    this.getCamTaskList();

    $('#camtasklist-tab').tab('show');
  }
  listTab() {
    this.ionViewWillEnter();
    this.btn = false;
  }
  newTabClick(e) {
    this.obj = this.getObj();
    if(this._campaignbrandList.length > 0)
    {
      if(this.obj.n3 == "" || this.obj.n3 =="0")
      {
        this.obj.n3 = this._campaignbrandList[0].syskey;
      }
    }
  }
  tab(e) {

  }
  detailTab() {
    this.obj = this.getObj();
    $('#camtasknew-tab').tab('show');
  }
  advanceSearch(option) {
    this.searchtab = option;
    if(!this.searchtab){this.refresh();}
  }


  refresh(){
    this.obj = this.getObj();
    this.getCamTaskList();
  }

  getCampaignList() {
    if (this.ics.user.orgId.length == 0) return;
    this.loading.create(
      {
        message: "Getting data..",
        duration: 20000
      }
    ).then(
      el => {
        el.present();

        let status = "";
        const url = this.ics.appConfig.apiurl + 'campaignbrand/getcampaignbrandlist';
        var param = {
          code: "",
          description: ""
        }
        var subscribe = this.http.post(url, param, this.ics.getOptions()).subscribe(
          (data: any) => {
            this._campaignbrandList = data.dataList;
            // if(this._campaignbrandList.length > 0)
            // {
            //   if(this.obj.n3 == "" || this.obj.n3 =="0")
            //   {
            //     this.obj.n3 = this._campaignbrandList[0].syskey;
            //   }
            // }
            el.dismiss();
          }
        );
        el.onDidDismiss().then(
          el => {

          }
        )
      }
    )
  }
  getObj() {
    return {
      syskey: "0",
      createddate: "",
      modifieddate: "",
      userid: "",
      username: "",
      RecordStatus: 0,
      SyncStatus: 0,
      SyncBatch: "",
      t1: "",
      t2: "",
      t3: "",
      n1: 0,
      n2: 0,
      n3: "",
      n4:0,
      Usersyskey: "",
      campaign:""

    };

  }


  detail(item) {
    this.btn = true;
    this.obj = item;
    // this.getCampaignList();
    $('#camtasknew-tab').tab('show');
  }

  getCamTaskList() {
    this.spinner = true;
    let url: string = this.ics.appConfig.apiurl + 'campaigntask/getcampaigntask';
    this.http.post(url, this.obj, this.ics.getOptions()).subscribe(
      (data: any) => {
        this.spinner = false;
        console.log(data);
        if (data.campaigntaskList != null && data.campaigntaskList != undefined && data.campaigntaskList.length > 0) {
          this._campaigntaskList = data.campaigntaskList;

        } else {
          this.ics.showToast(this.tostCtrl, "Message", "No Task", 1000)
          this._campaigntaskList = [];
        }
      },
      error => {
      }
    );
  }

  /*getDefaultDeleteObject() {
   return {     
     "inUsed_Table" : "MC003", 
     "count_Column" : "SYSKEY", 
     "inUsed_Column" : "n2", 
 
     "delete_Table" : "UVM010",      
     "delete_Column" : "SYSKEY",
     "delete_Key" : "" 
   };
 }*/

  gotoDelete() {
    if (this.ics.user.orgId.length == 0) return;
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
        const url = this.ics.appConfig.apiurl + 'campaigntask/deletecamtask/' + this.obj.syskey;
        this.http.post(url, this.obj, this.ics.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            if (data.message == "success") {
              status = "SUCCESS!"
              el.dismiss();
            } else if(data.message == "use"){
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
              this.ics.showToast(this.tostCtrl,"Message","Deleted Successfully!",1000).then(
                e => {
                  this.btn = false;
                  this._campaigntaskList = [];
                  this.obj = this.getObj();
                  this.getCamTaskList();
                  $('#camtasklist-tab').tab('show');
                }
              );             
            } else if (status == "USED!") {
              this.ics.showToast(this.tostCtrl,"Message","This Task is in Used!",1000);
            } else {
              this.ics.showToast(this.tostCtrl,"Message","Deleteing Fail!",1000);
            }
          },
          (error) => {
            this.ics.showToast(this.tostCtrl,"Message","Deleting Fail!", 2000);
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
      if (this.ics.user.orgId.length == 0) return;
      var msg = ""
      if (this.obj.syskey.length > 3) msg = "Updating data.."
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
          const url = this.ics.appConfig.apiurl + 'campaigntask/save/';
          var subscribe = this.http.post(url, this.obj, this.ics.getOptions()).subscribe(
            (data: any) => {
              console.log(data);
              if (data.message == "success") {
                status = "SUCCESS!"
                el.dismiss();
              } else if (data.message == "exit") {
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
                    this.btn = false;
                    this._campaigntaskList = [];
                    this.obj = this.getObj();
                    this.getCamTaskList();
                    $('#camtasklist-tab').tab('show')
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
  isvalid() {
    if (this.obj.t1.trim().length === 0) {
      this.ics.showToast(this.tostCtrl, "Message", "Invalid Code!", 1000);
      return false;
    }
    if (this.obj.t2.trim().length === 0) {
      this.ics.showToast(this.tostCtrl, "Message", "Invalid Name!", 1000);
      return false;
    }
    if (this.obj.n3 == "" || this.obj.n3 == "0") {
      this.ics.showToast(this.tostCtrl, "Message", "Choose Campaign!", 1000);
      return false;
    }
    else return true;
  }


  getTypeList() {
    this.TypeList = [];
    const url = this.ics.appConfig.apiurl + 'campaigntask/getType';
    this.http.post(url, this.obj, this.ics.getOptions()).subscribe(
      (data: any) => {
        this.TypeList = data.typeDataList;
      }
    );
  }
  taskStatusChange(e, passData) {
    e.stopPropagation();
    const url = this.ics.appConfig.apiurl + 'campaigntask/taskStatusChange';

    this.http.post(url, passData, this.ics.getOptions()).subscribe(
      (data: any) => {
        if (data.message == "SUCCESS") {
          if (passData.n2 == 0) {
            passData.n2 = 1;
          } else if (passData.n2 == 1) {
            passData.n2 = 0;
          }

          this.ics.showToast(this.tostCtrl, "Message", "Status changed", 1000);
        } else {
          this.ics.showToast(this.tostCtrl, "Message", "Status didn't changed", 1000);
        }
      }
    );
  }
  print() {
    const url = this.ics.appConfig.apiurl + 'campaigntask/getcampaigntask';
    this.http.post(url,  this.obj, this.ics.getOptions()).subscribe(
      (data: any) => {
        let data1 = data.campaigntaskList;
        let cri_flag = 0;

        let excelTitle = "Campaign Task List Report";
        let excelHeaderData = [
          " Code", " Task Name","Campaign Name"
        ];
        let excelDataList: any = [];
        
        for(var exCount = 0; exCount < data1.length; exCount++){
          let excelData: any = [];
          excelData.push(data1[exCount].t1);
          excelData.push(data1[exCount].t2);
          excelData.push(data1[exCount].campaign);
          excelDataList.push(excelData);
        }

        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet('CampaignTask List Data');

        let titleRow = worksheet.addRow(["","",excelTitle]);
        titleRow.font = {bold: true};
        worksheet.addRow([]);

        let criteriaRow;
        if( this.obj.t1.toString() != ""){
          criteriaRow = worksheet.addRow(["Task Code : " + this.obj.t1.toString()]);
          criteriaRow.font = {bold: true};
          cri_flag++;
        }
        if(this.obj.t2.toString() != ""){
          criteriaRow = worksheet.addRow(["Task Name : " + this.obj.t2.toString()]);
          criteriaRow.font = {bold: true};
          cri_flag++;
        }
        if(this.obj.campaign.toString() != ""){
          criteriaRow = worksheet.addRow(["Campaign Name : " + this.obj.campaign.toString()]);
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
          FileSaver.saveAs(blob, "Campaign_Task_export_" + new  Date().getTime() + EXCEL_EXTENSION);
        });
      }
    );
  }

}
