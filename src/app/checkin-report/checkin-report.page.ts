import { Router, ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { MatDatepicker } from '@angular/material/datepicker';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, AlertController,ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { AppComponent } from '../app.component';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import { FormControl } from '@angular/forms';
import { MatOption, MatSelect } from '@angular/material';
import moment from 'moment';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
var date = new Date();
// var firstDay = moment().startOf('week').toDate();
// var lastDay = moment().endOf('week').toDate()
var expanded = false;
declare var $: any;

@Component({
  selector: 'app-checkin-report',
  templateUrl: './checkin-report.page.html',
  styleUrls: ['./checkin-report.page.scss'],
})
export class CheckinReportPage implements OnInit {
  @ViewChild('picker', { static: false }) matDatepicker: MatDatepicker<Date>;
  @ViewChild('triggerAllUserSelectOption', { static: false }) triggerAllUserSelectOption: MatOption;
  // shopCodeSearch: FormControl = new FormControl();
  // shopNameSearch: FormControl = new FormControl();
  config =  {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  //obj: any = this.getPersonShopObj();
  obj: any = this.getCriteriaData();
  TypeList: any = [];
  checkInList: any = [];
  load: boolean = false;
  minDate: any;
  maxDate: any = new Date();
  spinner: boolean = false;
  searchtab: boolean = false;
  shopList1: any = [];
  shopList2: any = [];
  ownerList1: any = [];
  criteria: any = this.getCriteriaData();
  total: any;
  pagination_flag: any = 0;
  userlist: any = [];
  username:any=[];
  value:any=[]
  statelist:any = [];
  criStateList:any = [];
  state1 : any;
  dislist:any = [];
  criDistrictList:any = [];
  district1 : any;
  townshiplist:any = [];
  criTownshipList: any = [];
  township1 : any;
  flag: boolean = false;
  flag1: boolean = false;
  toppings = new FormControl();

  constructor(
    public manager: ControllerService,
    public http: HttpClient,
    public router: Router,
    public alertController: AlertController,
    public event: Events,
    public app: AppComponent,
    public tostCtrl: ToastController,
    public activatedRoute: ActivatedRoute, 
    public tost: ToastController,
    public loading: LoadingController
  ) {
    this.manager.isLoginUser();
  }

  ngOnInit() {
    this.manager.isLoginUser();
  }

  async ionViewWillEnter() {
    this.manager.isLoginUser();
    this.criteria.userType = "1";
    this.criteria.dateOptions = "today";
    this.dateOptionsChange();
    this.getState();
    this.search(0);
    this.allList();
  }

  ionViewDidEnter() {
    this.load = true;
  }

  runSpinner(t: boolean) {
    this.spinner = t;
  }
  dateOptionsChange() {
    let dateOption = this.manager.getDateOptions(this.criteria.dateOptions);
    this.criteria.fromDate = dateOption.fromDate;
    this.criteria.toDate = dateOption.toDate;
  }

  advanceSearch(option) {
    this.getUsers();
    this.searchtab = option;
    this.flag1 = true;
    this.flag = true;
  }

  advanceSearchReset() {
    this.criteria = this.getCriteriaData();
    this.criteria.userType = "1";
    this.criteria.dateOptions = "today";
    this.dateOptionsChange();
    this.criChange();
    this.search(0);
  }
  criChange()
  {
    this.userlist = "";
    this.getUsers ();
    this.checkInList = "";
    this.search(0);
  }
  getUsers() {
    return new Promise<void>(promise => {
      let param = { userType: 1 };
      const url = this.manager.appConfig.apiurl + 'user/userReportList';
      this.criteria.userType == "1" ?  param = { userType: 1 } :  param = { userType: 2 };
      let caller = this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.userlist = data.dataList;
          this.userlist.sort((a, b) => (a.userName.toLowerCase() > b.userName.toLowerCase()) ? 1 : -1);
          promise();
        },
        error => {
          console.log(error);
          promise();
        }
      )
    })
  }

  search(currIndex) {
    this.spinner = true;
    
    const url = this.manager.appConfig.apiurl + 'reports/checkInList';
    // this.obj.maxRow =this.config.itemsPerPage;
    // this.obj.current = currIndex;
    this.value="";

    this.obj.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
    this.obj.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
    this.obj.shopcode = this.criteria.shopcode;
    this.obj.shopName = this.criteria.shopName;
    this.obj.address = this.criteria.address;
    this.obj.route = this.criteria.route;
    //this.obj.userName = this.criteria.userName;
    this.obj.userType = this.criteria.userType;
    this.obj.state = this.criteria.state;
    this.obj.district = this.criteria.district;
    this.obj.township = this.criteria.township;
     for(var i=0;i<this.criteria.syskey.length;i++){
      this.value+=this.criteria.syskey[i]+","; 
       }
      console.log(this.value);
      this.value=this.value.slice(0,-1);
      this.obj.syskey=this.value;

    if (this.obj.fromDate.toString() == "false") {
      this.alert("Message", "Add Correct Date Format");
      this.obj.fromDate = "";
    }
    if (this.obj.toDate.toString() == "false") {
      this.alert("Message", "Add Correct Date Format");
      this.obj.toDate = "";
    }
    else {
      this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
        (data: any) => {
         
          this.spinner = false;
          this.config.totalItems = data.rowCount ;
          //this.config.itemsPerPage= data.dataList.length;
          this.config.currentPage = 1;

          this.checkInList = [];
          this.checkInList = data.dataList;

          for (var i = 0; i < this.checkInList.length; i++) {
            this.checkInList[i].createddate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.checkInList[i].createddate);
            if(this.checkInList[i].createdtime.length >= 11) {
              this.checkInList[i].createdtime = this.checkInList[i].createdtime.toString().slice(11);
              if(this.checkInList[i].createdtime.indexOf(".") != -1)
              {
                this.checkInList[i].createdtime = this.checkInList[i].createdtime.substring(0,this.checkInList[i].createdtime.indexOf("."));
              }
            }
          }

        },
        error => {
          this.spinner = false;
        }
      );
    }
  }

  pageChanged(e){
    this.config.currentPage = e;
    // let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    // this.search(currentIndex);
  }
 

  print() {
    this.loading.create({
      message: "Processing..",

      backdropDismiss: false
    }).then(
      el => {
        el.present();
        const url = this.manager.appConfig.apiurl + 'reports/checkInList';
        this.value="";
        let send_data1 = this.criteria.fromDate;
        let send_data2 = this.criteria.toDate;
        for(var i=0;i<this.criteria.syskey.length;i++){
          this.value+=this.criteria.syskey[i]+",";
        
      }
        this.obj.shopcode = this.criteria.shopcode;
        this.obj.shopName = this.criteria.shopName;
        this.obj.address = this.criteria.address;
        this.obj.state = this.criteria.state;
        this.obj.district = this.criteria.district;
        this.obj.township = this.criteria.township;
        this.obj.userType = this.criteria.userType;
        this.obj.route = this.criteria.route;
        this.obj.maxRow = "";
        this.obj.current = "";
        this.value=this.value.slice(0,-1);
        this.obj.syskey=this.value;
        if (this.criteria.fromDate.toString() != "") {
          this.obj.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
        }
        // if (this.criteria.toDate.toString() != "") {
        //   this.obj.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
        // }
        if (this.obj.fromDate.toString() == "false") {
          this.alert("Message", "Add Correct Date Format");
          this.obj.fromDate = "";
        }
        if (this.obj.toDate.toString() == "false") {
          this.alert("Message", "Add Correct Date Format");
          this.obj.toDate = "";
        } else {
          this.http.post(url, this.obj, this.manager.getOptions()).subscribe(

            (data: any) => {
              let cri_date1 = "";
              let cri_date2 = "";
              if (this.obj.fromDate.toString() != "") {
                cri_date1 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.obj.fromDate).toString();
              }
              if (this.obj.toDate.toString() != "") {
                cri_date2 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.obj.toDate).toString();
              }
              this.criteria.fromDate = send_data1;
              this.criteria.toDate = send_data2;
              if (data.message == "SUCCESS") {
                // let data1 = data.dataList;   
                el.dismiss();
                let cri_flag = 0;
                let excel_date = "";

                let type_flag = "";
                let status_flag = "";

                let excelTitle = "Check In Report";
                let excelHeaderData : any = [];
                if (this.criteria.userType == '1')
                {
                  excelHeaderData = [ 
                    "Date", "Time", "User Name", "User Type", "Shop Code", "Shop Name", "State", "Township", "Check In",
                    "Inventory Check", "Merchadising", "Order Placement"];
                } else 
                {
                  excelHeaderData = [ 
                    "Date", "Time","User Name", "User Type", "Shop Code", "Shop Name", "State", "Township", "Check In",
                    "Merchadising", "Order Detail", "Invoice"];
                }

                let excelDataList: any = [];
                let workbook = new Workbook();
                let worksheet = workbook.addWorksheet('Check In Data');

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

                if (this.criteria.shopcode.toString() != "") {
                  criteriaRow = worksheet.addRow(["Shop Code : " + this.criteria.shopcode.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                if (this.criteria.shopName.toString() != "") {
                  criteriaRow = worksheet.addRow(["Shop Name : " + this.criteria.shopName.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                if (this.criteria.address.toString() != "") {
                  criteriaRow = worksheet.addRow(["Address : " + this.criteria.address.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                if (this.criteria.state.toString() != "") {
                  this.state1 = "";
                  this.statelist.forEach(element => {                    
                    if (element.syskey === this.criteria.state) {
                      this.state1 = element.t2;
                    }
                  });
                  criteriaRow = worksheet.addRow(["State : " + this.state1.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }

                if (this.criteria.district.toString() != "") {
                  this.district1 = "";
                  this.dislist.forEach(element => {                    
                    if (element.syskey === this.criteria.district) {
                      this.district1 = element.t2;
                    }
                  });
                  criteriaRow = worksheet.addRow(["District : " + this.district1.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }

                if (this.criteria.township.toString() != "") {
                  this.township1 = "";
                  this.townshiplist.forEach(element => {                    
                    if (element.syskey === this.criteria.township) {
                      this.township1 = element.t2;
                    }
                  });
                  criteriaRow = worksheet.addRow(["TownShip : " + this.township1.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }

                if (this.criteria.syskey.toString() != "") {
                  criteriaRow = worksheet.addRow([" Search by userName " ]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                if (this.criteria.userType.toString() != "") {
                  if (this.criteria.userType.toString() == "1") {
                    type_flag = "Retailer";
                  } else if (this.criteria.userType.toString() == "2") {
                    type_flag = "Delivery";
                  }
                  criteriaRow = worksheet.addRow(["Type : " + type_flag]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                
                if (this.criteria.route.toString() != "") {
                  if (this.criteria.route.toString() == "CHECKIN") {
                    status_flag = "CHECKIN";
                  } else if (this.criteria.route.toString() == "TEMPCHECKOUT") {
                    status_flag = "TEMPCHECKOUT";
                  } else if (this.criteria.route.toString() == "STORECLOSED")
                  {
                    status_flag = "STORECLOSED";
                  }
                  criteriaRow = worksheet.addRow([" Route : " + status_flag]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }

                if (cri_flag == 0) {
                  criteriaRow = worksheet.addRow(["Search With No Criteria"]);
                  criteriaRow.font = { bold: true };
                }
                let headerRow = worksheet.addRow(excelHeaderData);
                headerRow.font = { bold: true };

                for (var exCount = 0; exCount < data.dataList.length; exCount++) {
                  
                    let excelData: any = [];
                    excel_date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data.dataList[exCount].createddate).toString();

                    excelData.push(excel_date);
                    
                    if(data.dataList[exCount].createdtime.length >= 11) {
                      data.dataList[exCount].createdtime = data.dataList[exCount].createdtime.slice(11);
                      if(data.dataList[exCount].createdtime.indexOf(".") != -1)
                      {
                        data.dataList[exCount].createdtime = data.dataList[exCount].createdtime.substring(0,data.dataList[exCount].createdtime.indexOf("."));
                      }
                    }
                    excelData.push(data.dataList[exCount].createdtime);
                    excelData.push(data.dataList[exCount].userName);
                    excelData.push(data.dataList[exCount].userType);
                    excelData.push(data.dataList[exCount].shopcode);
                    excelData.push(data.dataList[exCount].shopName);
                    excelData.push(data.dataList[exCount].state);
                    excelData.push(data.dataList[exCount].township);
                    excelData.push(data.dataList[exCount].checkIn);
                    if (this.criteria.userType == "1")
                    {
                      excelData.push(data.dataList[exCount].inventoryCheck);
                      excelData.push(data.dataList[exCount].merchadising);
                      excelData.push(data.dataList[exCount].orderPlacement);
                    } else
                    {
                      excelData.push(data.dataList[exCount].merchadising);
                      excelData.push(data.dataList[exCount].orderDetail);
                      excelData.push(data.dataList[exCount].invoice);
                    }

                    excelDataList.push(excelData);
                  }
                  for (var i_data = 0; i_data < excelDataList.length; i_data++) {
                    worksheet.addRow(excelDataList[i_data]);
                  }

                workbook.xlsx.writeBuffer().then((data) => {
                  let blob = new Blob([data], { type: EXCEL_TYPE });
                  FileSaver.saveAs(blob, "checkIn_export_" + new Date().getTime() + EXCEL_EXTENSION);
                });
              } else {
                el.dismiss();
              }
            }
          );

        }

      }
    )

  }

  save() {
    this.loading.create({
      message: "Processing..",

      backdropDismiss: false
    }).then(
      el => {
        el.present();
        const url = this.manager.appConfig.apiurl + 'reports/checkInListSave';
          this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
            (data: any) => { 
              el.dismiss();
              this.manager.showToast(this.tost,"Message","Saved Successfully!",1000).then(
              e => {
                // this.getAll();
                
              }
            );
            },
            (error: any) => {
              el.dismiss();
            }
          );
      }
    )

  }

  dblClickFunc() {
    this.criteria.createdDate = "";
  }

  alert(title, messages) {
    this.alertController.create({
      translucent: true,
      header: title,
      message: messages,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          handler: (ok) => {
          }
        }
      ]
    }).then(alert => alert.present());
  }

  getCriteriaData() {
    return {
      "userType" : "",
      "shopcode": "",
      "shopName": "",
      "fromDate": "",
      "toDate": "",
      "address": "",
      "userName" : "",
      "syskey" : "",
      "current": "",
      "maxRow": "",
      "type" : "",
      "route" : "",
      "dateOptions": "0",
      "state" : "",
      "district" : "",
      "township" : "",
    };
  }

  allList(){
    var url = "";
    var param = {};
    
   param = {
      "code" : "",
      "description" : ""
    };
    url = this.manager.appConfig.apiurl + 'brandowner/getbrandowner';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any)  => {
        this.ownerList1 = data.dataList;
        this.ownerList1.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
      }
    );

    // this.shopCodeSearch.valueChanges.subscribe(
    //   term => {
    //     if (term != '') {
    //       this.manager.shopCodeSearchAutoFill(term).subscribe(
    //         data => {
    //           this.shopList2 = data as any[];
             
    //           console.log("code"+this.shopList2[0].shopCode);
    //         //  this.stockList2 = data as any[];
    //       });
    //     }
    //   }
    // );

    // this.shopNameSearch.valueChanges.subscribe(
    //   term => {
    //     if (term != '') {
    //       this.manager.shopNameSearchAutoFill(term).subscribe(
    //         data => {
    //           this.shopList1 = data as any[];
             
    //         //  this.stockList2 = data as any[];
    //       });
    //     }
    //   }
    // );
  }

  criStateChange() {
    this.criteria.district = "";
    this.criteria.township = "";
    this.getDistrict(this.criteria.state);
  }

  criDistrictChange() {
    this.criteria.township = "";
    this.getTsp(this.criteria.district);
  }

  getState() {
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'placecode/state';
      this.http.post(url, { code: "", description: "" }, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.statelist = [];
          this.criStateList = [];

          data.dataList.forEach(e => {
            this.statelist.push({ syskey: e.syskey, t2: e.t2 });
            this.criStateList.push({ syskey: e.syskey, t2: e.t2 });
          });

          this.statelist.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
          this.criStateList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
        },
        error => {
          done();
        }
      )
    })
  }

  getDistrict(state: string) {
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'placecode/getdistrict';
      this.http.post(url, {
        code: "",
        description: "",
        stateSyskey: state,
        districtSyskey: ""
      }, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.dislist = [];
          this.criDistrictList = [];

          data.districtList.forEach(e => {
            this.dislist.push({ syskey: e.syskey, t2: e.t2 });
            this.criDistrictList.push({ syskey: e.syskey, t2: e.t2 });
          });

          this.dislist.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
          this.criDistrictList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
        },
        error => {
          done();
        }
      )
    })
  }

  getTsp(dis: string) {
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'placecode/gettsp';
      this.http.post(url, {
        code: "",
        description: "",
        stateSyskey: "",
        districtSyskey: dis,
        townshipSyskey: '0'
      }, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.townshiplist = [];
          this.criTownshipList = [];

          data.tspList.forEach(e => {
            this.townshiplist.push({ syskey: e.syskey, t2: e.t2 });
            this.criTownshipList.push({ syskey: e.syskey, t2: e.t2 });
          });

          this.townshiplist.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
          this.criTownshipList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
        },
        error => {
          done();
        }
      )
    })
  }

  toggleUserAllSelect() {
   if (this.triggerAllUserSelectOption.selected) {
      this.criteria.syskey = [];
      this.criteria.syskey.push(-1)
      for (let u of this.userlist) {
        this.criteria.syskey.push(u.syskey)
      }
    } else {
      this.criteria.syskey = [];
    }
  }
}
