import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material';
import { AlertController, AngularDelegate, LoadingController, ToastController } from '@ionic/angular';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';

import { ControllerService } from '../controller.service';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $: any;
var date = new Date();
var firstDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 6);
var lastDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

@Component({
  selector: 'app-merchandise',
  templateUrl: './merchandise.page.html',
  styleUrls: ['./merchandise.page.scss'],
})
export class MerchandisePage implements OnInit {
  config = {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  // @ViewChild('myDatepicker4', { static: false }) matDatepicker: MatDatepicker<Date>;

  btn: boolean = false;
  searchtab: boolean = false;
  detailsPhoto: boolean = false;
  spinner: boolean = false;

  rightSideImg: any = this.getPicObj()
  url = "";
  comment: string = "";
  ratenum;
  headerDate: Date = new Date();

  headerObj: any = this.getHeaderObj();
  taskObjList: any = [];
  obj: any = this.getObj();

  picdate: Date = new Date();
  advSearchObjTmp: any = this.searchObjTmp();

  searchObj: any = this.getSearchObj();
  cri_searchObj = this.getSearchObj();
  tasklist: any = [];
  bolist: any = [];
  bostatus: boolean = false;
  campaignlist: any = [];
  campaignstatus: boolean = false;
  userlist: any = [];
  userstatus: boolean = false;
  shoplist: any = [];
  shopstatus: boolean = false;

  minDate: any;
  maxDate: any = new Date();
  userName: any;
  userId: any;
  value:any=[]
  bindname: any = "";
 
  // shopNameSearch: FormControl = new FormControl();
  toppings = new FormControl();
  constructor(private manager: ControllerService,
    private loadCtrl: LoadingController,
    private alertCtrl: AlertController,
    private tostCtrl: ToastController,
    private http: HttpClient) {
    this.ratenum = Array.from(Array(11), (_, i) => i)
  }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.manager.isLoginUser();
    this.init();
    this.advSearchObjTmp = this.searchObjTmp();
    this.searchObj.dateOptions = "today";
    this.dateOptionsChange();
    $('#merchandise-list-tab').tab('show');
    this.getTaskList(true, "0", true);
  }

  init() {
    this.searchObj = this.getSearchObj();
    this.tasklist = [];
    // this.bolist = [];
    // this.campaignlist = [];
    // this.userlist = [];
    this.btn = false;
    this.rightSideImg = this.getPicObj();
    this.url = this.manager.appConfig.imgurl;
    this.headerObj = this.getHeaderObj();
    this.detailsPhoto = false;
  }
  advanceSearchReset() {
    this.ionViewWillEnter();
    //this.searchObj = this.getSearchObj();

  
  }
  //image
  previewImage() {

    $('#previewMerchandiseImgModel').appendTo("body").modal('show');
  }
  previewModelClose() {
    $('#previewMerchandiseImgModel').appendTo("body").modal('hide');
  }
  //----
  listTabClick(e) {
    // this.searchObj = this.getSearchObj();
    // this.getTaskList(true, "0", true);
  }

  new() {
    this.init();
    $('#merchandise-new-tab').tab('show');
  }
  search(ind, fl) {

    this.getTaskList(false, ind, fl);

  }
  advanceSearch(b) {
    this.searchtab = b;
    this.getBrandOwner();
    // this.getShopList();
    this.getUser();
    this.getCampaign();
  }
  getTaskList(firstTimeFlag, currIndex, criFlag) {
    this.loadCtrl.create({
      message: "Processing..",

      backdropDismiss: false
    }).then(
      el => {
        el.present();
        let caller;
        this.cri_searchObj.maxRows = this.config.itemsPerPage + "";
        this.cri_searchObj.current = currIndex;
        this.value="";
        if (criFlag == true) {
      
          this.cri_searchObj.shopsyskey = this.advSearchObjTmp.adv_shopsyskey;
          this.cri_searchObj.shopcode = this.searchObj.shopcode;
          this.cri_searchObj.bosyskey = this.searchObj.bosyskey;
          this.cri_searchObj.status = this.searchObj.status;
          this.cri_searchObj.activeStatus = this.searchObj.activeStatus;
          this.cri_searchObj.campaignsyskey = this.searchObj.campaignsyskey;
          //this.cri_searchObj.usersyskey = this.searchObj.usersyskey;
          this.cri_searchObj.fromdate = this.searchObj.fromdate;
          this.cri_searchObj.todate = this.searchObj.todate;
          this.cri_searchObj.ratingScale = this.searchObj.ratingScale;
          for(var i=0;i<this.searchObj.usersyskey.length;i++){
        
            this.value+=this.searchObj.usersyskey[i]+","; 
          
             }
            console.log(this.value);
            this.value=this.value.slice(0,-1);
            this.cri_searchObj.usersyskey=this.value;
    
          // if (firstTimeFlag == true) {
          //   this.cri_searchObj.fromdate = firstDay.toString();
          //   this.cri_searchObj.todate = lastDay.toString();
          // }
    
          this.cri_searchObj.fromdate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.cri_searchObj.fromdate).toString();
          this.cri_searchObj.todate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.cri_searchObj.todate).toString();
        }
    
        const url = this.manager.appConfig.apiurl + 'campaign/getmerchandisetask';
    
        caller = this.http.post(url, this.cri_searchObj, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            if (data.length > 0) {
              this.config.totalItems = data[0].rowCount;
              if (currIndex == 0) {
                this.config.currentPage = 1;
              }
            }
            this.tasklist = data.map(m => {
              m.d = new Date(this.manager.formatDateByDb(m.date));
              if (m.status.toString() == "0") {
                m.status = "Unchecked";
              } else if (m.status.toString() == "1") {
                m.status = "Approved";
              } else if (m.status.toString() == "2") {
                m.status = "Rejected";
              }
              return m;
            })
          },
          error => {
            el.dismiss();
          }
        )
      }
    );
   
  }
  getBrandOwner() {
    if (this.bolist.length > 0) return;
    this.bostatus = true;
    const url = this.manager.appConfig.apiurl + 'brandowner/getbrandowner'
    this.http.post(url, { syskey: "0" }, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.bostatus = false;
        this.bolist = data.dataList;
        this.bolist.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
      },
      error => {
        this.bostatus = false;
      }
    )
  }
  getCampaign() {
    if (this.campaignlist.length > 0) return;
    this.campaignstatus = true;
    const url = this.manager.appConfig.apiurl + 'campaignbrand/getcampaignbrand'
    this.http.post(url, { syskey: "0" }, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.campaignstatus = false;
        this.campaignlist = data.campaignbrandList;
        this.campaignlist.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
      },
      error => {
        this.campaignstatus = false;
      }
    )
  }
  getUser() {
    let param = {};
    let url = "";

    param = {
      "code" : "",
      "description" : ""
    };
    param = {
    "searchVal" : ""
     };
    url = this.manager.appConfig.apiurl + 'user/userList';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
    (data:any)  => {
      this.userlist = data.dataList;
      this.userlist.sort((a, b) => (a.userName.toLowerCase() > b.userName.toLowerCase()) ? 1 : -1);
    }
    )
  }
  /*getUser() {
    if (this.userlist.length > 0) return;
    this.userstatus = true;
    const url = this.manager.appConfig.apiurl + 'user/userList'
    this.http.post(url, { searchVal: "" }, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.userstatus = false;
        this.userlist = data.dataList;
        this.userlist.sort((a, b) => (a.userName.toLowerCase() > b.userName.toLowerCase()) ? 1 : -1);
      },
      error => {
        this.userstatus = false;
      }
    )
  }*/
  /*getShopList() {
    if (this.shoplist.length > 0) return;
    this.shopstatus = true;
    const url = this.manager.appConfig.apiurl + 'shop/shoplist';
    const param = {
      shopSysKey: "",
      shopName: "",
      shopCode: ""
    };
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.shoplist = data;
        this.shopstatus = false;

      },
      error => {
        console.log(error);
        this.shopstatus = false;
      }
    )
  }*/

  // getShopList() {
  //   this.shopNameSearch.valueChanges.subscribe(
  //     term => {
  //       if (term != '') {
  //         this.manager.shopNameSearchAutoFill(term).subscribe(
  //           data => {
  //             this.shoplist = data as any[];
  //           });
  //       }
  //     }
  //   );
  // }

  getSearchObj() {
    return {
      usersyskey: "",
      campaignsyskey: "",
      bosyskey: "",
      fromdate: "",
      todate: "",
      shopsyskey: "",
      shopcode: "",
      shopName: "",
      tasksyskey: "",
      ratingScale: "",
      status: "",
      approveUser: "",
      maxRows: "",
      current: "",
      activeStatus: "",
      dateOptions : "0"
    }
  }
  getHeaderObj() {
    return {
      bocode: "",
      boname: "",
      bosyskey: "",
      camcode: "",
      camname: "",
      camsyskey: "",
      code: "",
      date: "",
      name: "",
      pics: [],
      shopcode: "",
      shopname: "",
      shopsyskey: "",
      status: 0,
      syskey: "",
      userid: "",
      username: ""
    }
  }
  getPicObj() {
    return {
      createDate: "",
      modifiedDate: "",
      n1: "0",
      n2: 0,
      n3: 0,
      syskey: "",
      t1: "",
      t2: "",
      t3: "",
      t4: "",
      t5: "",
      t6: "",
      t7: ""
    }
  }
  getObj() {
    return {
      syskey: "",
      syncStatus: "0",
      date: new Date(),
      n3: "0",
      t3:"",
      pictureData: []

    }
  }


  searchObjTmp() {
    return {
      adv_status: 0,
      adv_shopsyskey: "",
      adv_fromDate: "",
      adv_toDate: "",
      adv_brandOwnerSyskey: "",
      adv_usersyskey: "",
      adv_totalAmount: 0.0,
      adv_amountStatus: 0,
      current: 0,
      adv_syskey: ""
    }
  }

  detail(d) {
    this.headerObj = d;
    console.log("this.headerObj = ", JSON.stringify(this.headerObj));
    let date = new Date(this.manager.formatDateByDb(d.date));
    this.headerDate = date;
    this.taskObjList = [];
    let hlist = this.tasklist.filter(f => {
      return d.headersyskey == f.headersyskey;
    });
    hlist.map(m => {
      let objs = this.getObj();
      if (m.status.toString() == "Unchecked") {
        objs.syncStatus = "0";
      } else if (m.status.toString() == "Approved") {
        objs.syncStatus = "1";
      } else if (m.status.toString() == "Rejected") {
        objs.syncStatus = "2";
      }
      // objs.syncStatus = ''+m.status ;
      objs.n3 = m.rate;
      let d = new Date(this.manager.formatDateByDb(m.date));
      objs.date = d;
      return m.obj = objs;
    })
    this.taskObjList = hlist;
    this.taskObjList.sort((a, b) => (a.code > b.code) ? 1 : -1);
    $('#merchandise-new-tab').tab('show');
  }
  detailPhoto(pic, name, t1Comment) {
    $('#pic-model').appendTo("body").modal('show');
    this.detailsPhoto = true;
    this.rightSideImg = pic;
    let date = new Date(this.manager.formatDateByDb(pic.modifiedDate));
    pic.modifiedDate = date;
    this.comment = this.rightSideImg.t5;
    //this.comment = t1Comment;
    this.bindname = name;
  }
  savePic() {

    this.rightSideImg.t5 = this.comment;

    $('#pic-model').appendTo("body").modal('hide');
  }
  async save() {
    let mc003list = [];
    this.taskObjList.map(e => {
      let param = {
        syskey: e.syskey,
        syncStatus: parseInt(e.obj.syncStatus),
        n3: e.obj.n3,
        t1: e.comment,
        date: this.manager.formatDate(e.obj.date, 'yyyyMMdd'),
        pictureData: [],
        usersyskey: this.manager.user.userSk,
        headersyskey: this.headerObj.headersyskey
      }
      param.pictureData = e.pics.map(m => {
        // m.t5=this.rightSideImg.t5;
        m.modifiedDate = this.manager.formatDate(m.modifiedDate, 'yyyyMMdd');
        return m;
      });
      mc003list.push(param);
    });
    console.log(mc003list);
    this.loadCtrl.create({
      message: "Processing..",
      duration: 20000
    }).then(el => {
      el.present();
      const url = this.manager.appConfig.apiurl + 'campaign/savetaskcomplete';
      this.http.post(url, mc003list, this.manager.getOptions()).subscribe(
        (data: any) => {
          el.dismiss();
          console.log(data);
          if(data.message == "SUCCESS!"){
          this.manager.showToast(this.tostCtrl, "Message", "Success", 1000);
          // this.init();
          this.getTaskList(true, "0", true);
          this.btn = false;
          $('#merchandise-list-tab').tab('show');
        }else{
          this.manager.showToast(this.tostCtrl, "Message", "Fail", 1000);
        }
      }
      )
    })

  }

  print() {
    this.loadCtrl.create({
      message: "Processing..",
      backdropDismiss: false
    }).then(
      el => {
        el.present();
        let caller;
        let templist=[]; 
        let username=""; 
        const url = this.manager.appConfig.apiurl + 'campaign/getmerchandisetask';
        this.value="";
    
        let temp_fdate = this.searchObj.fromdate;
        let temp_tdate = this.searchObj.todate;
        if (this.searchObj.fromdate != "") {
          this.searchObj.fromdate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.fromdate);
        }
        if (this.searchObj.todate != "") {
          this.searchObj.todate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.todate);
        }
        for(var i=0;i<this.searchObj.usersyskey.length;i++){
          this.value+=this.searchObj.usersyskey[i]+","; 
          templist=this.userlist.filter(u=> {
            return u.syskey==this.searchObj.usersyskey[i];
          });
    
          username += templist[0].userName +",";
        }
          username=username.slice(0,-1);
           
        console.log(this.value);
        this.value=this.value.slice(0,-1);
        this.searchObj.usersyskey=this.value;
        this.searchObj.shopsyskey = this.advSearchObjTmp.adv_shopsyskey;
        caller = this.http.post(url, this.searchObj, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            this.searchObj.fromdate = temp_fdate;
            this.searchObj.todate = temp_tdate;
            let temp_date1 = "";
            let temp_date2 = "";
            if (this.searchObj.fromdate != "") {
              temp_date1 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI, this.searchObj.fromdate).toString();
            }
            if (this.searchObj.todate != "") {
              temp_date2 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI, this.searchObj.todate).toString();
            }
            let temp_status1 = ""; 
            let photo_status1 = "";
    
            let cri_flag = 0;
            let excelDataList: any = [];
            let date_str: any;
            let excelTitle = "Merchandise List";
            // let excelHeaderData = [
            //   "Date", "Brand Owner", "Campaign", "Task Code", "Task Name", 
            //   "Store ID", "Store", "Township", "Sale Person", "Comment", 
            //   "Rating Scale", "Status", "Approved By","Photo Status"
            // ];
            let excelHeaderData = [
              "Date", "Brand Owner", "Campaign", "Task Code", "Task Name", 
              "Store ID", "Store", "Township", "Sale Person", "Comment", 
              "Rating Scale", "Status", "Approved By"
            ];
    
    
            for (var data_i = 0; data_i < data.length; data_i++) {
              let excelData = [];
    
              date_str = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data[data_i].date);
              if (data[data_i].status.toString() == "0") {
                temp_status1 = "Unchecked";
              } else if (data[data_i].status.toString() == "1") {
                temp_status1 = "Approved";
              } else if (data[data_i].status.toString() == "2") {
                temp_status1 = "Rejected";
              }
              // photo_status1=data[data_i].photoDesc == "NotAvailable"? "Not Applicable" : data[data_i].photoDesc;
    
              excelData.push(date_str);
              excelData.push(data[data_i].boname);
              excelData.push(data[data_i].camname);
              excelData.push(data[data_i].code);
              excelData.push(data[data_i].name);
              excelData.push(data[data_i].shopcode);
              excelData.push(data[data_i].shopname);
              excelData.push(data[data_i].townshipDesc);
              excelData.push(data[data_i].username);
              excelData.push(data[data_i].comment);
              excelData.push(data[data_i].rate);
              excelData.push(temp_status1);
              excelData.push(data[data_i].approveUser);
              // excelData.push(photo_status1);
    
              excelDataList.push(excelData);
            }
    
            let workbook = new Workbook();
            let worksheet = workbook.addWorksheet('Merchandise List Data');
    
            let titleRow = worksheet.addRow(["", "", excelTitle]);
            titleRow.font = { bold: true };
            worksheet.addRow([]);
    
            let criteriaRow;
            if (this.searchObj.fromdate != "") {
              if (this.searchObj.todate != "") {
                criteriaRow = worksheet.addRow(["From Date : " + temp_date1.toString()]);
              } else {
                criteriaRow = worksheet.addRow(["Date : " + temp_date1.toString()]);
              }
              criteriaRow.font = { bold: true };
              cri_flag++;
            }
            if (this.searchObj.todate != "") {
              criteriaRow = worksheet.addRow(["To Date : " + temp_date2.toString()]);
              criteriaRow.font = { bold: true };
              cri_flag++;
            }
            if (this.searchObj.bosyskey.toString() != "") {
              criteriaRow = worksheet.addRow(["Brand Owner : " + data[0].boname.toString()]);
              criteriaRow.font = { bold: true };
              cri_flag++;
            }
            if (this.searchObj.campaignsyskey.toString() != "") {
              criteriaRow = worksheet.addRow(["Campaign : " + data[0].camname.toString()]);
              criteriaRow.font = { bold: true };
              cri_flag++;
            }
            if (this.advSearchObjTmp.adv_shopsyskey.toString() != "") {
              criteriaRow = worksheet.addRow(["Store : " + data[0].shopname.toString()]);
              criteriaRow.font = { bold: true };
              cri_flag++;
            }
            if (this.searchObj.shopcode.toString() != "") {
              criteriaRow = worksheet.addRow(["Store ID : " + data[0].shopcode.toString()]);
              criteriaRow.font = { bold: true };
              cri_flag++;
            }
            if (username != "") {
              criteriaRow = worksheet.addRow(["Sale Person : " + username]);
              criteriaRow.font = { bold: true };
              cri_flag++;
            }
            if (this.searchObj.ratingScale.toString() != "") {
              criteriaRow = worksheet.addRow(["Rating Scale : " + this.searchObj.ratingScale.toString()]);
              criteriaRow.font = { bold: true };
              cri_flag++;
            }
            if (this.searchObj.status.toString() != "") {
              let temp_status2 = "";
              if (this.searchObj.status.toString() == "0") {
                temp_status2 = "Unchecked";
              } else if (this.searchObj.status.toString() == "1") {
                temp_status2 = "Approved By " + this.searchObj.approveUser;
              } else if (this.searchObj.status.toString() == "2") {
                temp_status2 = "Rejected By " + this.searchObj.approveUser;
              }
              criteriaRow = worksheet.addRow(["Status : " + temp_status2]);
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
              FileSaver.saveAs(blob, "Merchandise_List_export_" + new Date().getTime() + EXCEL_EXTENSION);
            });
          },
          error => {
            this.spinner = false;
          }
        )
      }
    );   
  }

  dateChange1(event) {
    if (this.searchObj.todate != "" || this.searchObj.todate != undefined) {
      let tempFromDate = new Date(event.target.value);
      let tempToDate = new Date(this.searchObj.todate);

      tempFromDate.setHours(0, 0, 0, 0);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.manager.showToast(this.tostCtrl, "Message", "From Date must be sooner than To Date", 5000);
        this.searchObj.fromdate = "";
        this.searchObj.todate = "";
      }
    }
  }

  dateChange2(event) {
    if (this.searchObj.fromdate == "" || this.searchObj.fromdate == undefined) {
      this.searchObj.todate = "";
      $("#td").val("").trigger("change");
      this.manager.showToast(this.tostCtrl, "Message", "Add From Date First", 2000);
    } else {
      let tempFromDate = new Date(this.searchObj.fromdate);
      let tempToDate = new Date(event.target.value);

      tempFromDate.setHours(0, 0, 0, 0);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.searchObj.todate = "";
        $("#td").val("").trigger("change");
        this.manager.showToast(this.tostCtrl, "Message", "To Date must be later than From Date", 3000);
      }
    }
  }

  dblClickFunc1() {
    this.searchObj.fromdate = "";
    this.searchObj.todate = "";
  }

  dblClickFunc2() {
    this.searchObj.todate = "";
  }

  async goDelete() {
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
            this.loadCtrl.create({
              message: "Processing",
              backdropDismiss: false,
              duration: 5000
            }).then(
              el => {
              el.present();
    const url = this.manager.appConfig.apiurl + 'campaign/deleteMerchandizingTask/' + this.headerObj.syskey +"/"+this.headerObj.headersyskey;
    this.http.get(url, this.manager.getOptions()).subscribe(
      (data: any) => {
        el.dismiss();
        if (data.status == "SUCCESS!") {
          this.manager.showToast(this.tostCtrl, "Message", "Deleted Successfully!", 1000).then(
            e => {
              this.getTaskList(true, "0", true);
              this.btn = false;              
              $('#merchandise-list-tab').tab('show');
            }
          );
        } else {
          this.manager.showToast(this.tostCtrl, "Message", "Deleting Fail!", 1000);
        }
      },
      (error: any) => {
        this.manager.showToast(this.tostCtrl,"Message","Deleting Fail!",1000);
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

  pageChanged(e) {
    this.config.currentPage = e;

    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.search(currentIndex, false);
  }

  getShopsForNew() {
    return new Promise<void>(promise => {
      const url = this.manager.appConfig.apiurl + 'shop/shoplist';
      const param = {
        shopSysKey: "",
        shopName: "",
        shopCode: ""
      };
      let caller = this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.shoplist = data;
          this.shoplist.sort((a, b) => (a.shopName.toLowerCase() > b.shopName.toLowerCase()) ? 1 : -1);
          promise();
        },
        error => {
          console.log(error);
          promise();
        }
      )
    })
  }
  dateOptionsChange() {
    let dateOption = this.manager.getDateOptions(this.searchObj.dateOptions);
    this.searchObj.fromdate = dateOption.fromDate;
    this.searchObj.todate = dateOption.toDate;
  }

}
