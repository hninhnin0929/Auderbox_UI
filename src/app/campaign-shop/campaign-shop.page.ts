import { Router, ActivatedRoute } from "@angular/router";
import { Events } from "@ionic/angular";
import { MatDatepicker } from "@angular/material/datepicker";
import { Component, OnInit, ViewChild } from "@angular/core";
import {
  AlertController,
  ToastController,
  LoadingController,
} from "@ionic/angular";

import { HttpClient } from "@angular/common/http";
import { ControllerService } from "../controller.service";
import { AppComponent } from "../app.component";
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import * as XLSX from 'xlsx';
import { Subscription } from "rxjs";
const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const EXCEL_EXTENSION = ".xlsx";
declare var $: any;
@Component({
  selector: "app-campaign-shop",
  templateUrl: "./campaign-shop.page.html",
  styleUrls: ["./campaign-shop.page.scss"],
})
export class CampaignShopPage implements OnInit {
  @ViewChild("picker", { static: false }) matDatepicker: MatDatepicker<Date>;
  obj: any = this.getPersonShopObj();

  shopSysKeyList: any = [];
  shopCampaignList: any = [];
  personList: any = [];
  btn: boolean = false;
  campaignKeyList: any = [];
  load: boolean = false;
  searchshopsyskey: any = [];
  searchassignshop: any = [];
  advSearchObjTmp: any = this.searchObjTmp();
  searchshop = "";
  odd = "";
  searchtab :boolean = false;
  spinner: boolean = false;
  delete_param = this.getDefaultDeleteObject();

  shopList_ipp = 20;
  shopListConfig = {
    itemsPerPage: this.shopList_ipp,
    currentPage: 1,
    totalItems: 0,
    id: "shopListConfigId",
  };
  assignShopListConfig = {
    itemsPerPage: this.shopList_ipp,
    currentPage: 1,
    totalItems: 0,
    id: "assignShopListConfigId",
  };
  detailFlag: any = "0";
  shopLoadingFlag: any = false;
  excel = {
    name: "",
    file: [],
  };
  session = this.getSessionObj();
  invalidCampaign = [];
  constructor(
    public manager: ControllerService,
    public http: HttpClient,
    public router: Router,
    public alertController: AlertController,
    public event: Events,
    public app: AppComponent,
    public tostCtrl: ToastController,
    public loading: LoadingController,
    public activatedRoute: ActivatedRoute
  ) {
    this.manager.isLoginUser();
  }
  define = [{}];
  ngOnInit() {
    this.manager.isLoginUser();
  }
  searchObjTmp() {
    return {
      adv_fromDate: "",
      adv_toDate: "",
      dateOptions: "0",
      code:"",
      name:""
    };
  }
  dateOptionsChange() {
    let dateOption = this.manager.getDateOptions(this.advSearchObjTmp.dateOptions);
    this.advSearchObjTmp.adv_fromDate = dateOption.fromDate;
    this.advSearchObjTmp.adv_toDate = dateOption.toDate;
  }
  dblClickFunc1(){
    this.advSearchObjTmp.adv_fromDate = "";
  }
  dateChange1(event){
    if(this.advSearchObjTmp.adv_fromDate != ""){
      let tempFromDate = new Date(event.target.value);
      tempFromDate.setHours(0, 0, 0, 0);
    }
  }

  getPersonShopObj() {
    return {
      userSysKey: "",
      shopSysKey: "",
      campaignSysKey: "0",
      createdDate: "",
      modifiedDate: "",
      n1: "",
      t1: "",
      t2: "",
      userName: "",
      shopName: "",
      type: "",
      olddate: "",
      shopSysKeyList: [],
      campaignKeyList: [],
    };
  }
  getSessionObj() {
    return {
      userid: "",
      headerid: "",
      startedTime: "",
      allowed: true,
      username: "",
      message: "",
      show: false,
    };
  }

  ionViewWillEnter() {
    this.manager.isLoginUser();
    this.getAll();
    this.btn = false;
    // this.advSearchObjTmp.dateOptions = "today";
    this.dateOptionsChange();
    this.detailFlag = "0";
    $("#campaignshoplist-tab").tab("show");

    //clear
    this.excel.file = [];
    this.excel.name = "";
  }

  ionViewDidEnter() {
    this.load = true;
  }
  ionViewWillLeave() {
    this.resetSession();
  }

  new() {
    this.router.navigate(["/personshop-new"]);
  }

  getAll() {
    this.spinner = true;
    this.btn = false;
    let send_data1 = this.advSearchObjTmp.adv_fromDate;
    if(this.advSearchObjTmp.adv_fromDate != ""){
      this.advSearchObjTmp.adv_fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB,  this.advSearchObjTmp.adv_fromDate );
    }
    var param = { syskey: "0", "t1": this.advSearchObjTmp.code,"t2" :this.advSearchObjTmp.name, "createddate":this.advSearchObjTmp.adv_fromDate,"currentPage": 1, "pageSize": 0, };
    this.loading.create({
      message: "Processing..",
      backdropDismiss: false
    }).then(
      el => {
        el.present();
        const url =
      this.manager.appConfig.apiurl + "campaign/getStoreCampaignHeaderList";
    this.http
      .post(url, param, this.manager.getOptions())
      .subscribe((data: any) => {
        this.spinner = false;
        el.dismiss();
        this.advSearchObjTmp.adv_fromDate=send_data1 ;
        this.shopCampaignList = data.list.map((e) => {
          let sc = {
            cam_name: e.campaign.t2,
            cam_syskey: e.campaign.syskey,
            cam_code: e.campaign.t1,
            header_syskey: e.syskey,
            cdate: new Date(this.manager.formatDateByDb(e.createddate)),
            mdate: new Date(this.manager.formatDateByDb(e.modifieddate)),
            session_usersyskey: e.sessionUser.syskey,
            session_username: e.sessionUser.userName,
          };
          return sc;
        });
      });
      }
    );
  }

  detail(id) {
    this.loading
      .create({
        message: "Loading",
        backdropDismiss:true
      })
      .then(async (el) => {
        el.present();
        this.excel.file = [];
        this.excel.name = "";
        this.searchshop = "";
        this.detailFlag = id.cam_syskey.toString();
        this.obj.campaignSysKey = id.cam_syskey; //for getDetailShopCampaign() param
        this.obj.createdDate = "";
        this.obj.olddate = this.obj.mdate;
        //await this.getDetailShopCampaign(el);
        let subscriber:Subscription;
        let counter =1;
        let interval = setInterval(()=>{ 
          el.message = "Please wait " + counter++;
         }, 1000);

        el.onDidDismiss().then( ()=>{
          subscriber.unsubscribe();
          clearInterval(interval);
        });
        console.log("hello");
        
        await (()=>{
          return new Promise<void>((res, rej) => {
            const url =
              this.manager.appConfig.apiurl + "campaign/getShopCampaignDetail";
      
            this.obj.shopSysKeyList = [];
            this.searchassignshop = [];
            this.assignShopListConfig.totalItems = 0;
      
            subscriber = this.http
              .post(url, this.obj, this.manager.getProgressOptions() as any)
              .subscribe(
                (data: any) => {
                  let status = this.manager.getStatusMessage(data);
                  if (status.response) {              
                    this.assignShopListConfig.currentPage = 1;
                    status.body.body.shopSysKeyList.map((shopData) => {
                      this.obj.shopSysKeyList.push(shopData);
                      this.searchassignshop.push(shopData);
                    });
      
                    this.obj.campaignKeyList = status.body.body.campaignKeyList;
                    let credDate: any = this.manager.dateFormatCorrector(
                      this.manager.dateFormatter.DBtoDTP,
                      this.obj.createdDate
                    );
                    this.obj.createdDate = credDate;
                    res();
                    this.filterSearch(true, '#searchshop');
                    this.filterSearch(true, '#searchshop1');
                  } else {
                  }
                },
                (error) => {
                  rej();
                }
              );
          });
        })();

        this.getShopList(id.cam_syskey, "", -1);
        this.getCampaignList(id.cam_syskey);

        $("#campaignshopnew-tab").tab("show");
        this.btn = true;
        el.dismiss();

        
      });

    this.getSession(this.manager.user.userSk, id.header_syskey);
  }

  listTab() {
    this.resetSession();
    this.advSearchObjTmp = this.searchObjTmp();
    this.ionViewWillEnter();
  }

  newTabCampaignShopClick(e) {
    this.searchshop = "";
    // this.searchshop1="";

    this.obj = this.getPersonShopObj();
    this.getShopList(0, "", -1);
    this.getCampaignList(0);

    $("#campaignshopnew-tab").tab("show");

    this.btn = true;
    this.detailFlag = "0";
    // this.getDetailShopCampaign();
    this.obj.shopSysKeyList = [];
    this.searchassignshop = [];
    this.searchshopsyskey = [];
    this.session = this.getSessionObj();
  }

  getShopList(id, searchValue, currIndex) {
    const url = this.manager.appConfig.apiurl + "campaign/getShopList";
    if (currIndex.toString() == "-1") {
      this.shopSysKeyList = [];
      this.searchshopsyskey = [];
      this.shopListConfig.totalItems = 0;
      currIndex = 0;
    }

    let param = {
      shopSysKeys: id,
      maxRows: this.shopListConfig.itemsPerPage,
      current: currIndex,
      shopDesc: searchValue,
    };
    this.shopLoadingFlag = true;

    this.http.post(url, param, this.manager.getOptions()).subscribe(
      //  this.obj
      (data: any) => {
        this.shopSysKeyList = data.dataList;
        this.searchshopsyskey = data.dataList;
        this.shopListConfig.totalItems = data.count;
        if (currIndex.toString() == "0") {
          this.shopListConfig.currentPage = 1;
        }

        if (this.obj.shopSysKeyList.length > 0) {
          for (let i = 0; i < this.searchshopsyskey.length; i++) {
            this.obj.shopSysKeyList.map((data) => {
              if (data.shopSysKey == this.searchshopsyskey[i].shopSysKey) {
                this.searchshopsyskey[i].checkFlag = true;
              }
            });
          }
        }

        this.shopLoadingFlag = false;
      }
    );
  }

  getCampaignList(id) {
    const url =
      this.manager.appConfig.apiurl + "campaign/getCampaignList/" + id;
    this.http
      .post(url, {}, this.manager.getOptions())
      .subscribe((data: any) => {
        this.campaignKeyList = data.dataList;
      });
  }

  changeCheckedStore(e, storeData, storeIndex) {
    if (e.checked) {
      this.addShop(storeData, storeIndex);
    } else {
      this.removeShop(storeData, -1);
    }
  }

  addShop(shop, index) {
    let assignshopsyskey = shop.shopSysKey;

    for (var i = 0; i < this.shopSysKeyList.length; i++) {
      if (this.shopSysKeyList[i].shopSysKey == assignshopsyskey) {
        this.obj.shopSysKeyList.push(this.shopSysKeyList[i]);
        this.searchassignshop.push(this.shopSysKeyList[i]);
        this.obj.shopSysKeyList.sort((a, b) =>
          a.shopName > b.shopName ? 1 : -1
        );
        this.searchassignshop.sort((a, b) =>
          a.shopName > b.shopName ? 1 : -1
        );
      }
    }

    // this.searchshopsyskey.splice(index, 1);
  }

  removeShop(storeData, indexFlag) {
    for (let i = 0; i < this.obj.shopSysKeyList.length; i++) {
      if (this.obj.shopSysKeyList[i].shopSysKey == storeData.shopSysKey) {
        this.obj.shopSysKeyList.splice(i, 1);

        break;
      }
    }

    if (indexFlag == -1) {
      //    if indexFlag = -1, it's come from "Shop list"
      for (let j = 0; j < this.searchassignshop.length; j++) {
        if (this.searchassignshop[j].shopSysKey == storeData.shopSysKey) {
          this.searchassignshop.splice(j, 1);

          break;
        }
      }
    } else {
      for (let j = 0; j < this.searchshopsyskey.length; j++) {
        if (this.searchshopsyskey[j].shopSysKey == storeData.shopSysKey) {
          this.searchshopsyskey[j].checkFlag = false;

          break;
        }
      }
      this.searchassignshop.splice(indexFlag, 1);
    }
  }

  addCampaign(shop, index) {
    this.obj.campaignKeyList.push(this.campaignKeyList[index]);
    this.campaignKeyList.splice(index, 1);
  }

  removeCampaign(index) {
    this.campaignKeyList.push(this.obj.campaignKeyList[index]);
    this.obj.campaignKeyList.splice(index, 1);
  }

  async save() {
    $(".myOuterContainer").addClass("disabled");
    let loading = await this.loading.create({
      message: "Processing..\n Do not close the window!",
      backdropDismiss: false,
    });
    await loading.present();
    $(".myOuterContainer").addClass("disabled");
    this.obj.shopSysKeyList = this.prepareShopSave();
    this.obj.campaignKeyList = this.prepareCampaignSave();
    let url: string =
      this.manager.appConfig.apiurl + "campaign/saveShopCampaign";
    loading.dismiss();
    let ok = false;
    let status = 0;
    await this.checkHeader(this.obj)
      .then((e: any) => {
        this.invalidCampaign = e
          .map((header) => {
            let p = this.obj.campaignKeyList.find((camp) => {
              return camp.campaignSysKey == header.n1;
            });
            return {
              name: p.t2,
              campsyskey: p.campaignSysKey,
            };
          })
          .filter((mye) => {
            return mye.campsyskey !== this.obj.campaignSysKey;
          });
        ok = true;
      })
      .catch(() => {
        ok = false;
      });
    if (ok && this.invalidCampaign.length !== 0) {
      await new Promise<void>((dialog) => {
        $("#model-padding").appendTo("body").modal("show");
        $("#model-padding .btn-overwrite").click(() => {
          status = 1;
          dialog();
        });
        $("#model-padding .btn-overwrite-no").click(() => {
          $(".myOuterContainer").removeClass("disabled");
          dialog();
        });
      });
    } else {
      status = 1;
    }
    $("#model-padding").appendTo("body").modal("hide");
    if (status == 1) {
      loading = await this.loading.create({
        message: "Processing..\n Do not close the window!",
        backdropDismiss: false,
      });
      await loading.present();
      this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
        (data: any) => {
          loading.dismiss();
          if (data.message === "SUCCESS") {
            this.detailFlag = "0";
            this.manager
              .showToast(this.tostCtrl, "Message", "Saved Successfully!", 2000)
              .then((e) => {
                this.manager.isLoginUser();
                this.advSearchObjTmp = this.searchObjTmp();
                this.getAll();
                this.resetSession();

                $(".myOuterContainer").removeClass("disabled");
                $("#campaignshoplist-tab").tab("show");
              });
          } else {
            $(".myOuterContainer").removeClass("disabled");
            this.manager.showToast(this.tostCtrl, "Message", data.log, 2000);
          }
        },
        (error) => {
          this.obj = this.getPersonShopObj();
          this.manager.showAlert(this.alertController, "Message", "Fail.");
          loading.dismiss();
          $(".myOuterContainer").removeClass("disabled");
        }
      );
    }
  }

  advanceSearch(option) {
    this.searchtab = option;
    if(!this.searchtab){this.refresh();}
  }

  refresh(){
    this.advSearchObjTmp = this.searchObjTmp();
    this.getAll();
  }

  prepareShopSave() {
    var shopList = [];
    for (let i = 0; i < this.obj.shopSysKeyList.length; i++) {
      shopList.push({
        shopSysKey: this.obj.shopSysKeyList[i].shopSysKey,
        shopCode: this.obj.shopSysKeyList[i].shopCode,
      });
    }

    return shopList;
  }

  prepareCampaignSave() {
    var campaignList = [];
    for (let i = 0; i < this.obj.campaignKeyList.length; i++) {
      campaignList.push({
        campaignSysKey: this.obj.campaignKeyList[i].campaignSysKey,
        t1: this.obj.campaignKeyList[i].t1,
        t2: this.obj.campaignKeyList[i].t2,
      });
    }
    return campaignList;
  }

  goReadBySyskey(id) {
    this.http
      .get(
        this.manager.appConfig.apiurl + "campaign/readShopCampaign/" + id,
        this.manager.getOptions()
      )
      .subscribe(
        (data: any) => {
          this.obj = data;
          let modifiedDate = new Date(
            this.manager.formatDateByDb(this.obj.modifiedDate)
          );
          //this.matDatepicker.select(modifiedDate);
          this.obj.modifiedDate = modifiedDate;
          let createdDate = new Date(
            this.manager.formatDateByDb(this.obj.createdDate)
          );
          // this.matDatepicker.select(createdDate);
          this.obj.createdDate = createdDate;
        },
        (error) => {}
      );
  }

  tab(e) {
    this.getAll();
  }

  getDefaultDeleteObject() {
    return {
      //in Used // e.g. SELECT COUNT(SYSKEY) AS TOTALCOUNT FROM STK014 WHERE n3= ?
      inUsed_Table: "",
      count_Column: "",
      inUsed_Column: "",
      //delete process  // e.g. UPDATE UVM003 SET RECORDSTATUS = 4 WHERE SYSKEY=?
      delete_Table: "UJUN003",
      delete_Column: "CAMPAIGNSYSKEY",
      delete_Key: "", //syskey for inUse and Delete //set this param in gotoDelete();
    };
  }

  goDelete() {
    //this.delete_param.delete_Key = id;
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
    const url = this.manager.appConfig.apiurl + "campaign/deletecampaign";
    this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
      (data: any) => {
        el.dismiss();
        if (data.message === "SUCCESS") {
          this.detailFlag = "0";
          this.manager
            .showToast(this.tostCtrl, "Message", "Deleted Successfully!", 2000)
            .then((e) => {
              this.manager.isLoginUser();
              this.advSearchObjTmp = this.searchObjTmp();
              this.getAll();
              $("#campaignshoplist-tab").tab("show");
            });
        } else {
          this.manager.showToast(this.tostCtrl,"Message","Deleting Fail!",2000);
        }
      },
      (error) => {
        this.manager.showToast(this.tostCtrl,"Message","Deleting Fail!", 2000);
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
    let send_data1 = this.advSearchObjTmp.adv_fromDate;
    if(this.advSearchObjTmp.adv_fromDate != ""){
      this.advSearchObjTmp.adv_fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB,  this.advSearchObjTmp.adv_fromDate );
    }
    var param = {  "code": this.advSearchObjTmp.code,"name" :this.advSearchObjTmp.name, "date":this.advSearchObjTmp.adv_fromDate,"currentPage": 1, "pageSize": 0, };
    this.loading.create({
      message: "Processing..",
      backdropDismiss: false
    }).then(
      el => {
        el.present();
        const url = this.manager.appConfig.apiurl +'campaign/getCampaignShopExportData';
        this.http.post(url, param, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            this.advSearchObjTmp.adv_fromDate=send_data1;

            if(data.message == "SUCCESS"){
              let data1 = data.dataList;

              let excelTitle = "Campaign Assignment List";
              let excelHdrHeaderData = [
                "Date", "Campaign Code", "Campaign Description"
              ];

              let excelShopHeaderData = [
                 "Shop Code", "Shop Description"
              ];

              let excelDataList: any = [];
              let excelData: any = [];
              let excelDataList1: any = [];
              let excelData1: any = [];
              let data2 = [];
              var exCount1;
              for(var exCount = 0; exCount < data1.length; exCount++){
                excelData = [];
                data1[exCount].mdate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].mdate);
                excelData.push(data1[exCount].mdate);
                excelData.push(data1[exCount].camp_code);
                excelData.push(data1[exCount].camp_name);
                excelDataList.push(excelData);

                excelDataList1 = [];
                data2 = data1[exCount].shopList;
                data2.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
                for(exCount1 = 0; exCount1 < data2.length; exCount1++){
                  excelData1 = [];
                  excelData1.push(data2[exCount1].shop_code);
                  excelData1.push(data2[exCount1].shop_name);

                  excelDataList1.push(excelData1);
                }
                excelDataList.push(excelDataList1);
              }

              let workbook = new Workbook();
              let worksheet = workbook.addWorksheet('Campaign Assignment Data');

              let titleRow = worksheet.addRow(["", "", excelTitle]);
              titleRow.font = { bold: true };
              worksheet.addRow([]);

              let hdrHeaderRow;
              let shopHeaderRow;
              let tempList;
              for (var i_data = 0; i_data < excelDataList.length; i_data+=2) {
                hdrHeaderRow = worksheet.addRow(excelHdrHeaderData);
                hdrHeaderRow.font = { bold: true };
                worksheet.addRow(excelDataList[i_data]);
                worksheet.addRow([]);

                var i_data1;
                tempList = excelDataList[i_data+1];

                shopHeaderRow = worksheet.addRow(excelShopHeaderData);
                shopHeaderRow.font = { bold: true };
                for(i_data1 = 0; i_data1 < tempList.length; i_data1++){
                  worksheet.addRow(tempList[i_data1]);
                }
                worksheet.addRow([]);
                worksheet.addRow([]);
                worksheet.addRow([]);
              }

              workbook.xlsx.writeBuffer().then((data) => {
                let blob = new Blob([data], { type: EXCEL_TYPE });
                FileSaver.saveAs(blob, "Campaign_Assignment_export_" + new Date().getTime() + EXCEL_EXTENSION);
              });
            }
          }
        );
      }
    );
  }

  getDetailShopCampaign(el) {
    return new Promise<void>((res, rej) => {
      const url =
        this.manager.appConfig.apiurl + "campaign/getShopCampaignDetail";

      this.obj.shopSysKeyList = [];
      this.searchassignshop = [];
      this.assignShopListConfig.totalItems = 0;

      this.http
        .post(url, this.obj, this.manager.getProgressOptions() as any)
        .subscribe(
          (data: any) => {
            let status = this.manager.getStatusMessage(data);
            el.message = status.progressLoaded + "0%";
            if (status.response) {              
              this.assignShopListConfig.currentPage = 1;
              status.body.body.shopSysKeyList.map((shopData) => {
                this.obj.shopSysKeyList.push(shopData);
                this.searchassignshop.push(shopData);
              });

              this.obj.campaignKeyList = status.body.body.campaignKeyList;
              let credDate: any = this.manager.dateFormatCorrector(
                this.manager.dateFormatter.DBtoDTP,
                this.obj.createdDate
              );
              this.obj.createdDate = credDate;
              res();
            } else {
            }
          },
          (error) => {
            rej();
          }
        );
    });
  }

  filter(e) {
    if (e.code == "Enter") {
      this.searchshop = e.target.value;
      this.getShopList(this.detailFlag, this.searchshop, -1);
    }
  }

  filter1(e) {
    if (e.code == "Enter") {
      let value = e.target.value.toLowerCase();
      this.searchassignshop = this.obj.shopSysKeyList.filter((f1) => {
        //return f.shopName.toLowerCase().includes(this.searchshop);
        return f1.shopName.toLowerCase().includes(value); //  this.searchshop1
      });
      this.assignShopListConfig.currentPage = 1;
    }
  }

  filterSearch(clearFlag, inputID) {
    let param = {
      code: "Enter",
      target: {
        value: $(inputID).val(),
      },
    };

    if (clearFlag) {
      $(inputID).val("");
      param.target.value = "";
    }

    if (inputID == "#searchshop") {
      this.filter(param);
    } else {
      //  #searchshop1
      this.filter1(param);
    }

    /*
    if(clearFlag){
      $(inputID).val("");
    } else {
      param.target.value = $(inputID).val();

      if(inputID == "#searchshop"){
        this.filter(param);
      } else {  //  #searchshop1
        this.filter1(param);
      }
    }
    */
  }

  shopList_PageChanged(e) {
    this.shopListConfig.currentPage = e;

    let currentIndex =
      (this.shopListConfig.currentPage - 1) * this.shopListConfig.itemsPerPage;
    this.getShopList(this.detailFlag, this.searchshop, currentIndex);
  }

  assignShopList_PageChanged(e) {
    this.assignShopListConfig.currentPage = e;
  }
  async excelImportChange(e: any) {
    this.clearExcel();
    let loading = await this.loading.create({
      message: "Preparing..",
      backdropDismiss: false,
    });
    await loading.present();
    const fullPath = e.target.files[0].name;
    const extension = fullPath.lastIndexOf(".");
    const name = fullPath.substring(0, extension);
    const file = e.target.files[0];
    let reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (event: any) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook: XLSX.WorkBook = XLSX.read(data, { type: "array" });
        const sheet: XLSX.WorkSheet = workbook.Sheets["data"];
        if (sheet !== undefined) {
          const result = XLSX.utils
            .sheet_to_json(sheet, {
              raw: true,
            })
            .filter((e: { ShopCode: any; ShopName: any }) => {
              e.ShopCode.toString();
              return e.ShopCode !== "";
            });

          this.excel.name = name;
          this.excel.file = result;
          (document.getElementById("excel_import") as HTMLInputElement).value =
            null;
          loading.dismiss();
        }
      } catch (e) {
        this.clearExcel();
        (document.getElementById("excel_import") as HTMLInputElement).value =
          null;
        loading.dismiss();
        this.manager.showToast(this.tostCtrl, "Message", "Invalid File", 2000);
      }
    };
  }
  async confirmExcelImport() {
    let loading = await this.loading.create({
      message: "Checking File..",
    });
    await loading.present();
    this.checkExcelImport({
      list: this.excel.file.map((e: any) => {
        return e.ShopCode;
      }),
    })
      .then((e) => {
        const excel_invalid = e.data.invalid_stores.map((invs) => {
          const myinvalidStores = this.excel.file.find((excel) => {
            return excel.ShopCode == invs;
          });
          return {
            ShopCode: myinvalidStores.ShopCode,
            ShopName: myinvalidStores.ShopName,
          };
        });
        this.invalidExcelDownload(excel_invalid);
        loading.dismiss();
      })
      .catch((e) => {
        loading.dismiss();
        this.manager.showToast(
          this.tostCtrl,
          "Message",
          "Can not connect to server!",
          1000
        );
      });
  }
  checkExcelImport(val: any) {
    return new Promise<any>((res, rej) => {
      const url = this.manager.appConfig.apiurl + "campaign/excel-import";
      this.http.post(url, val, this.manager.getOptions()).subscribe(
        (data: any) => {
          if (data.status == "SUCCESS") {
            data.list.map((shopData) => {
              this.obj.shopSysKeyList.push(shopData);
              this.searchassignshop.push(shopData);
            });
            if (this.obj.shopSysKeyList.length > 0) {
              for (let i = 0; i < this.searchshopsyskey.length; i++) {
                this.obj.shopSysKeyList.map((data) => {
                  if (data.shopSysKey == this.searchshopsyskey[i].shopSysKey) {
                    this.searchshopsyskey[i].checkFlag = true;
                  }
                });
              }
            }
            res(data);
          } else {
            rej();
          }
        },
        (error) => {
          rej();
        }
      );
    });
  }
  invalidExcelDownload(invalid) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(invalid);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    this.saveAsExcelFile(excelBuffer, "InvalidStores");
    return;
  }
  exampleExcelDownload() {
    const exampleData = [
      {
        ShopCode: "733474930733",
        ShopName: "Thara Phu (Chanayethazan)(TT)",
      },
    ];
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exampleData);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    this.saveAsExcelFile(excelBuffer, "CampaignWithStoresExample");
    return;
  }
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(
      data,
      fileName + "_" + new Date().getTime() + EXCEL_EXTENSION
    );
  }
  clearExcel() {
    this.excel.file = [];
    this.excel.name = "";
    this.searchassignshop = [];
    this.searchshopsyskey.forEach((e) => {
      e.checkFlag = false;
    });
  }
  getSession(userid, headerid) {
    const url =
      this.manager.appConfig.apiurl +
      "campaign/session/get/" +
      userid +
      "/" +
      headerid;
    this.http.get(url, this.manager.getOptions()).subscribe(
      (rtn: any) => {
        this.session.headerid = headerid;
        this.session.userid = rtn.data.userSyskey;
        this.session.username = rtn.data.userName;
        this.session.startedTime = rtn.data.startedDateTime;
        this.session.allowed = rtn.data.allowed;
        this.session.show = true;
        this.session.message = this.session.username + " is using";
      },
      (error) => {
        console.log(error);
      }
    );
  }
  resetSession() {
    if (this.session.userid == "") return;
    const url =
      this.manager.appConfig.apiurl +
      "campaign/session/reset/" +
      this.manager.user.userSk +
      "/" +
      this.session.headerid;
    this.http.get(url, this.manager.getOptions()).subscribe((rtn: any) => {});
  }
  removeSession() {
    const url =
      this.manager.appConfig.apiurl +
      "campaign/session/remove/" +
      this.session.headerid;
    this.http.get(url, this.manager.getOptions()).subscribe((rtn: any) => {
      if (rtn.status == "SUCCESS") {
        this.getSession(this.manager.user.userSk, this.session.headerid);
      }
    });
  }
  checkHeader(obj) {
    return new Promise<void>((res, rej) => {
      const url = this.manager.appConfig.apiurl + "campaign/check-header";
      this.http
        .post(
          url,
          {
            campaignKeyList: obj.campaignKeyList,
          },
          this.manager.getOptions()
        )
        .subscribe(
          (data: any) => {
            console.log(data);
            if (data.status == "SUCCESS") {
              res(data.list);
            } else {
              rej();
            }
          },
          (error) => {
            rej();
          }
        );
    });
  }
}
