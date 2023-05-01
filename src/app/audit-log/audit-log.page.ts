import { Component, OnInit, ViewChild } from '@angular/core';
import { Events } from '@ionic/angular';
import { MatDatepicker } from '@angular/material/datepicker';
import { FormControl } from '@angular/forms';
import moment from 'moment';
import { IonContent, AlertController, NavController, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { AppComponent } from '../app.component';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';
import { MatOption } from '@angular/material';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
var date = new Date();
var firstDay = moment().startOf('week').toDate();
var lastDay = moment().endOf('week').toDate()
var expanded = false;
declare var $: any;

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.page.html',
  styleUrls: ['./audit-log.page.scss'],
})
export class AuditLogPage implements OnInit {

  @ViewChild('picker', { static: false }) matDatepicker: MatDatepicker<Date>;
  @ViewChild('triggerAllUserSelectOption', { static: false }) triggerAllUserSelectOption: MatOption;

  config = {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };

  criteria: any = this.getCriteriaData();
  userlist: any = [];
  searchtab: boolean = false;
  toppings = new FormControl();
  _module: any = [];
  _crdApprovalLog: any = [];
  spinner: boolean = false;
  maxDate: any = new Date();

  constructor(
    public manager: ControllerService,
    public http: HttpClient,
    public router: Router,
    public alertController: AlertController,
    public event: Events,
    public app: AppComponent,
    public tostCtrl: ToastController,
    public activatedRoute: ActivatedRoute,
    public loading: LoadingController
  ) {
    this.manager.isLoginUser();
   }

  ngOnInit() {
    this.manager.isLoginUser();
  }

  async ionViewWillEnter() {
    this.manager.isLoginUser();
    this.criteria.dateOptions = "today";
    this.dateOptionsChange();
    this.runSpinner(true);
    await this.getLogModule();
    this.runSpinner(false);
  }

  getCriteriaData() {
    return {     
      "shopCode": "",
      "shopName": "",
      "moduleCode": "",
      "moduleName": "",
      "fromDate": "",
      "toDate": "",
      "criFromDate": "",
      "criToDate": "",
      "type": "",
      "current": "",
      "maxRow": "",
      "dateOptions": "0",
      "userType": 0,
      "userName": "",
      "userSyskey":"",
    };
  }

  dateOptionsChange() {
    let dateOption = this.manager.getDateOptions(this.criteria.dateOptions);
    this.criteria.fromDate = dateOption.fromDate;
    this.criteria.toDate = dateOption.toDate;
  }

  advanceSearch(option) {
    // this.getUsers();
    if(this.criteria.moduleCode === "001")
    {
      this.getCreditApprovalUsers();
    }else{
      this.getUsers();
    }
    this.searchtab = option;
  }

  async advanceSearchReset() {
    this.criteria = this.getCriteriaData();
    this.criteria.dateOptions = "today";
    this.dateOptionsChange();  
    this.runSpinner(true);
    await this.getLogModule();
    this.runSpinner(false);  
  }

  getUsers() {
    return new Promise<void>(promise => {
      const url = this.manager.appConfig.apiurl + 'user/userReportList';
      const param = {
        userType: 2
      };
      let caller = this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.userlist = data.dataList;
          promise();
        },
        error => {
          console.log(error);
          promise();
        }
      )
    })
  }

  getCreditApprovalUsers() {
    return new Promise<void>(promise => {
      const url = this.manager.appConfig.apiurl + 'sapApi/getCreditApprovalUsers';
      const param = {
        syskey: ""
      };
      let caller = this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.userlist = data.dataList;
          promise();
        },
        error => {
          console.log(error);
          promise();
        }
      )
    })
  }

  toggleUserAllSelect() {
    if (this.triggerAllUserSelectOption.selected) {
      this.criteria.userSyskey = [];
      this.criteria.userSyskey.push(-1);
      for (let u of this.userlist) {
        this.criteria.userSyskey.push(u.syskey)
      }
    } else {
      this.criteria.userSyskey = [];
    }
  }

  async getLogModule(){

    return new Promise<void>((resolve) => {
      var url = "";
      var param = {};
      
     param = {
        "code" : "",
        "description" : ""
      };
      url = this.manager.appConfig.apiurl + 'sapApi/getLogModule';
      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data:any)  => {
          this._module = data.dataList;
          this.criteria.moduleCode = data.dataList[0].code;
          this.criteria.moduleName = data.dataList[0].desc;
          if(this.criteria.moduleCode === "001")
          {
            this.runSpinner(true);
            this.getCrdApprovalLog(0).then( ()=>{
            this.runSpinner(false);
              resolve();
            }).catch(()=>{ this.runSpinner(false);})
          }
          
        },
        error => {
          resolve();
        }
      );
    })
  }
  
  async getCrdApprovalLog(current:number){

    var url = "";
    return new Promise<void>((resolve) => {
      let param = this.getCriteriaData()
      let value="";
      for(var i=0;i<this.criteria.userSyskey.length;i++){
        value+= this.criteria.userSyskey[i]+","; 
      }
      value = value.slice(0,-1);
      param.userSyskey = value;

      param.criFromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
      param.criToDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
      param.shopCode = this.criteria.shopCode;
      param.shopName = this.criteria.shopName;

      const cri = {
        "data": param,
        "current" : current,
        "maxrow": this.manager.itemsPerPage
      }
      url = this.manager.appConfig.apiurl + 'sapApi/getCrdApprovalLog';
      this.http.post(url, cri, this.manager.getOptions()).subscribe(
        (data:any)  => {
          if(current == 0){
            this.config.currentPage = 1;
          }        
          this.config.totalItems = data.totalCount;
          this._crdApprovalLog = data.dataList;
          for (var i = 0; i < this._crdApprovalLog.length; i++) {
            this._crdApprovalLog[i].date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this._crdApprovalLog[i].date);
          }
          resolve();
        },
        error => {
          resolve();
        }
      );
    })
  }

  runSpinner(t: boolean) {
    this.spinner = t;
  }

  pageChanged(e) {
    this.config.currentPage = e;
    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.runSpinner(true);
    this.getCrdApprovalLog(currentIndex).then( ()=>{
      this.runSpinner(false);
    }).catch(()=>{ this.runSpinner(false);})
  }

  search(currentIndex) 
  {
    this.runSpinner(true);
    if(this.criteria.moduleCode === "001")
    {      
      this.getCrdApprovalLog(0).then( ()=>{
      this.runSpinner(false);
      }).catch(()=>{ this.runSpinner(false);})
    }else{
      this.runSpinner(false);
    }

  }

  print()
  {
    this.loading.create({
      message: "Processing..",

      backdropDismiss: false
    }).then(
      el => {
        el.present();
        const url = this.manager.appConfig.apiurl + 'sapApi/getCrdApprovalLog';

        let value = "";
        for(var i=0; i<this.criteria.userSyskey.length; i++){
          value += this.criteria.userSyskey[i] + ","; 
        }
        value = value.slice(0,-1);
        this.criteria.userSyskey = value;
  
        this.criteria.criFromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
        this.criteria.criToDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);

        const cri = {
          "data": this.criteria
        }
          this.http.post(url, cri, this.manager.getOptions()).subscribe(
            (data: any) => {
            el.dismiss();
            let data1 = data.dataList;
            let excelHeaderData: any;

            let excelTitle = "Credit Approval Log";

              excelHeaderData = [
                "Module", "User", "Date", "Action", "Customer ID",
                "Customer Name", "From Credit Limit", "To Credit Limit","From Payment Term","To Payment Term"
              ];

            let excelDataList: any = [];
            for (var exCount = 0; exCount < data1.length; exCount++) {
              let excelData: any = [];
              data1[exCount].date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].date);
              
              excelData.push(this.criteria.moduleName);
              excelData.push(data1[exCount].userName);
              excelData.push(data1[exCount].createdTime);
              excelData.push(data1[exCount].action);             
              excelData.push(data1[exCount].shopCode);
              excelData.push(data1[exCount].shopName);
              excelData.push(data1[exCount].oldcreditlimit);
              excelData.push(data1[exCount].newcreditlimit);
              excelData.push(data1[exCount].oldptermDesc);
              excelData.push(data1[exCount].ptermDesc);

              excelDataList.push(excelData);
            }

            let workbook = new Workbook();
            let worksheet = workbook.addWorksheet('Log Data');
            let cri_flag = 0;

            let titleRow = worksheet.addRow(["", "", excelTitle]);
            titleRow.font = { bold: true };
            worksheet.addRow([]);

            let criteriaRow;

            if (this.criteria.criFromDate.toString() != "") {
              criteriaRow = worksheet.addRow(["From Date : " + this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.criteria.criFromDate.toString())]);
              criteriaRow.font = { bold: true };
              cri_flag++;
            }
            if (this.criteria.criToDate.toString() != "") {
              criteriaRow = worksheet.addRow(["To Date : " + this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.criteria.criToDate.toString())]);
              criteriaRow.font = { bold: true };
              cri_flag++;
            }
            if (this.criteria.shopCode.toString() != "") {
              criteriaRow = worksheet.addRow(["Shop Code : " + this.criteria.shopCode.toString()]);
              criteriaRow.font = { bold: true };
              cri_flag++;
            }

            if (this.criteria.shopName.toString() != "") {
              criteriaRow = worksheet.addRow(["Shop Name : " + this.criteria.shopName.toString()]);
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
              FileSaver.saveAs(blob, "credit_approval_export_" + new Date().getTime() + EXCEL_EXTENSION);
            });
          }
        );
      })
  }

}
