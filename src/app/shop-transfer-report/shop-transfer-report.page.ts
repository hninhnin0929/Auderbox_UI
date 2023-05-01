import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { IonContent, AlertController, NavController, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { MatDatepicker } from '@angular/material/datepicker';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { AppComponent } from '../app.component';
import { FormControl } from '@angular/forms';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-shop-transfer-report',
  templateUrl: './shop-transfer-report.page.html',
  styleUrls: ['./shop-transfer-report.page.scss'],
})
export class ShopTransferReportPage implements OnInit {
  config =  {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };

  spinner: boolean = false;
  searchtab: boolean = false;

  criMonth: any = "";

  transferShopList: any = this.getDataList();
  shoplist: any = [];
  userlist1: any = [];
  userlist2: any = [];
  criteria: any = this.getCriteriaData();
  searchCriteria = this.getCriteriaData();

  shopNameSearch: FormControl = new FormControl();
  fromUserNameSearch: FormControl = new FormControl();
  toUserNameSearch: FormControl = new FormControl();

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

  ionViewWillEnter() {
    let today = new Date();
    let thisMonth = today.getMonth() + 1;
    this.criMonth = (thisMonth > 9) ? ("____" + thisMonth + "__") : ("____0" + thisMonth + "__");

    this.allList();
    this.runSpinner(true);
    this.getAllList();
    this.runSpinner(false);
  }

  runSpinner(t: boolean) {
    this.spinner = t;
  }

  advanceSearch(option) {
    this.searchtab = option;
  }
  advanceSearchReset() {
    this.criteria = this.getCriteriaData();
    this.getAllList();
  }
  getAllList(){
    const url = this.manager.appConfig.apiurl + 'shopPerson/getAllUj2List';
    this.criteria = this.getCriteriaData();

    let tempDate = this.criteria.criData.date;
    if(this.criteria.criData.date != ""){
      this.criteria.criData.date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.criData.date).toString();
    } else {
      this.criteria.criData.date = this.criMonth;
    }

    this.http.post(url, this.criteria, this.manager.getOptions()).subscribe(
      (data: any) => {
        if(data.message == "SUCCESS"){
          this.criteria.criData.date = tempDate;
          this.transferShopList = data.dataList;

          this.config.totalItems = data.totalCount;
          this.config.currentPage = 1;

          for(var i = 0; i < this.transferShopList.length; i++){
            if(this.transferShopList[i].n3.toString() == "1"){
              this.transferShopList[i].n3 = "Active";
            } else if(this.transferShopList[i].n3.toString() == "0"){
              this.transferShopList[i].n3 = "Inactive";
            }
            this.transferShopList[i].date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.transferShopList[i].date);
          }
        }
      }
    );
  }

  search(index, criFlag){
    const url = this.manager.appConfig.apiurl + 'shopPerson/getAllUj2List';

    if(criFlag == true){
      let temp_date = "";
      if(this.criteria.criData.date != ""){
        temp_date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.criData.date).toString();
      }
      
      this.searchCriteria.criData.date = temp_date;
      this.searchCriteria.criData.fromUserName = this.criteria.criData.fromUserName;
      this.searchCriteria.criData.n3 = this.criteria.criData.n3;
      this.searchCriteria.criData.t1 = this.criteria.criData.t1;
      this.searchCriteria.criData.toUserName = this.criteria.criData.toUserName;
    }
    this.searchCriteria.paginate.current = index;
    this.searchCriteria.paginate.maxRows = this.config.itemsPerPage.toString();

    this.http.post(url, this.searchCriteria, this.manager.getOptions()).subscribe(
      (data: any) => {
        if(data.message == "SUCCESS"){
          this.transferShopList = data.dataList;

          this.config.totalItems = data.totalCount;
          if(criFlag == true){
            this.config.currentPage = 1;
          }

          for(var i = 0; i < this.transferShopList.length; i++){
            if(this.transferShopList[i].n3.toString() == "1"){
              this.transferShopList[i].n3 = "Active";
            } else if(this.transferShopList[i].n3.toString() == "0"){
              this.transferShopList[i].n3 = "Inactive";
            }
            this.transferShopList[i].date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.transferShopList[i].date);
          }
        }
      }
    );
  }

  print(){
    const url = this.manager.appConfig.apiurl + 'shopPerson/getAllUj2List';
    
    this.criteria.paginate.maxRows = "";
    this.criteria.paginate.current = "";
    let send_data1 = this.criteria.criData.date;
    if (this.criteria.criData.date != "") {
      this.criteria.criData.date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.criData.date);
    }

    this.http.post(url, this.criteria, this.manager.getOptions()).subscribe(
      (data: any) => {
        if(data.message == "SUCCESS"){
          let data1 = data.dataList;

          let cri_date1 = "";
          if (this.criteria.criData.date.toString() != "") {
            cri_date1 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.criteria.criData.date).toString();
          }
          this.criteria.criData.date = send_data1;

          let excelTitle = "Shop Transfer Report";
          let excelHeaderData = [
            "Date", "From User Name", "To User Name", "Shop Name", "Active/Inactive"
          ];
          let excelDataList: any = [];

          let workbook = new Workbook();
          let worksheet = workbook.addWorksheet('Transferred Shop Data');

          let excel_date = "";
          let status_flag1 = "";
          for (var exCount = 0; exCount < data1.length; exCount++) {
            let excelData: any = [];

            excel_date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].date).toString();

            if (data1[exCount].n3.toString() == "0") {
              status_flag1 = "Inactive";
            } else if (data1[exCount].n3.toString() == "1") {
              status_flag1 = "Active";
            }

            excelData.push(excel_date);
            excelData.push(data1[exCount].fromUserName);
            excelData.push(data1[exCount].toUserName);
            excelData.push(data1[exCount].t1);
            excelData.push(status_flag1);

            excelDataList.push(excelData);
          }

          let titleRow = worksheet.addRow(["", "", excelTitle]);
          titleRow.font = { bold: true };
          worksheet.addRow([]);

          let criteriaRow;
          let cri_flag = 0;
          if(cri_date1.toString() != "") {
            criteriaRow = worksheet.addRow(["Date : " + cri_date1.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          if(this.criteria.criData.fromUserName.toString() != "") {
            criteriaRow = worksheet.addRow(["From User Name : " + data1[0].fromUserName.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          if(this.criteria.criData.toUserName.toString() != "") {
            criteriaRow = worksheet.addRow(["To User Name : " + this.criteria.criData.toUserName.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          if(this.criteria.criData.t1.toString() != "") {
            criteriaRow = worksheet.addRow(["Shop Name : " + this.criteria.criData.t1.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          if(this.criteria.criData.n3.toString() != "-1") {
            let status_flag2 = "";
            if (this.criteria.criData.n3.toString() == "0") {
              status_flag2 = "Inactive";
            } else if (this.criteria.criData.n3.toString() == "1") {
              status_flag2 = "Active";
            }
            criteriaRow = worksheet.addRow(["Active/Inactive : " + status_flag2]);
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
            FileSaver.saveAs(blob, "Shop_Transfer_export_" + new Date().getTime() + EXCEL_EXTENSION);
          });
        }
      }
    );
  }

  getDataList(){
    return [
      {
        "userSyskey": "",
        "shopSyskey": "",
        "n1": "",
        "n2": "",
        "n3": "",
        "fromUserName": "",
        "toUserName": "",
        "date": "",
        "t1": ""
      }
    ]
  }

  getCriteriaData(){
    return {
      criData : {
        "n3": -1,
        "fromUserName": "",
        "toUserName": "",
        "date": "",
        "t1": ""
      },
      paginate : {
        "maxRows": "",
        "current": ""
      }
    }
  }

  pageChanged(event){
    this.config.currentPage = event;

    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.search(currentIndex, false);
  }

  allList(){
    this.shopNameSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.shopNameSearchAutoFill(term).subscribe(
            data => {
              this.shoplist = data as any[];
            }
          );
        }
      }
    );

    this.fromUserNameSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.userNameSearchAutoFill(term).subscribe(
            data => {
              this.userlist1 = data as any[];
            }
          );
        }
      }
    );

    this.toUserNameSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.userNameSearchAutoFill(term).subscribe(
            data => {
              this.userlist2 = data as any[];
            }
          );
        }
      }
    );

    // let url = "";
    // let param = {};

    // url = this.manager.appConfig.apiurl + 'user/userList';
    // param = {
    //   searchVal: ""
    // };
    // this.http.post(url, param, this.manager.getOptions()).subscribe(
    //   (data: any) => {
    //     this.userlist1 = data.dataList;
    //     this.userlist2 = data.dataList;
    //     this.userlist1.sort((a, b) => (a.userName.toLowerCase() > b.userName.toLowerCase()) ? 1 : -1);
    //     this.userlist2.sort((a, b) => (a.userName.toLowerCase() > b.userName.toLowerCase()) ? 1 : -1);
    //   },
    //   error => {
    //     console.log(error);
    //   }
    // );
  }
}
