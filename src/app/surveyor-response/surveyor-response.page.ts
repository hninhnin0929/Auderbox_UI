import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController, ModalController, NavParams, IonBackButton, ToastController, LoadingController, NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import { FormControl } from '@angular/forms';
import { resolve } from 'url';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
const defStockImg = 'assets/img/not-found.png';
declare var $: any;
@Component({
  selector: 'app-surveyor-response',
  templateUrl: './surveyor-response.page.html',
  styleUrls: ['./surveyor-response.page.scss'],
})
export class SurveyorResponsePage implements OnInit {
  @ViewChild(ImageCropperComponent, { static: false }) imgCropper !: ImageCropperComponent;
  @ViewChild('shopimageinput', { static: false }) imgFileInput: ElementRef;

  config = {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };

  currentPage: any = 1;
  spinner: boolean = false;
  searchtab: boolean = false;
  checkSurveyor: boolean = false;

  btn: boolean = false;
  croperReady: boolean;

  searchObj: any = this.getSearchObj();
  searchObjTemp: any = this.getSearchObj();
  criteria: any = this.getSearchObj();
  value: any;
  premiseValue: any;
  //image//

  ratenum: any;

  image: any;
  shopimage: any;
  imageChangedEvent: any = '';

  segment: any = 0;
  segmenttab: any = 1;

  brandownerlist: any = [];


  surveyorheaderlist: any = [];

  pendingsurvey: any = [];
  approvedsurvey: any = [];
  completesurvey: any = [];
  sections: any = [];
  qary: any = [];


  shopObj: any = this.getShopObj();
  ABShopCode: any = "0";


  isLoading = true;
  detailLoading = true;

  completedisabled = true;
  approvedisabled = true;

  shopNameList: any = [];
  surveyformList: any = [];
  brandownerList1: any = [];
  townshipList: any = [];
  surveyorList: any = [];
  categoryList: any = [];
  characteristicList: any = [];

  _storecharacterlist: any = [];

  //address
  statelist: any = [];
  state: boolean = false;

  dislist: any = [];
  dis: boolean = false;

  townshiplist: any = [];
  township: boolean = false;

  townorvillage: boolean = false;
  fileselector: any;

  townvillage: string = "0";
  village_wards: string = "0";
  town_village_list: any = [];

  wardlist: any = [];


  address: any = this.getAddressObj();

  statusInProgress: any = false;
  statusPending: any = false;
  statusApproved: any = false;
  statusCompleted: any = false;

  shopNameSearch: FormControl = new FormControl();
  surveyformSearch: FormControl = new FormControl();
  brandownerSearch: FormControl = new FormControl();
  townshipSearch: FormControl = new FormControl();
  surveyorSearch: FormControl = new FormControl();
  categorySearch: FormControl = new FormControl();
  characteristicSearch: FormControl = new FormControl();

  constructor(
    public manager: ControllerService,
    public http: HttpClient,
    public alertCtrl: AlertController,
    public activeRoute: ActivatedRoute,
    private modalCtrl: ModalController,
    private router: Router,
    private navCtrl: NavController,
    private tostCtrl: ToastController,
    private loadCtrl: LoadingController,

  ) {
    this.ratenum = Array.from(Array(11), (_, i) => i)
  }
  ngOnInit() {
    $('#shop-list-survey-response-tab').tab('show');
  }

  async ionViewWillEnter() {
    this.btn = false;
    this.searchObj = this.getSearchObj();
    this.shopObj = this.getShopObj();
    $('#shop-list-survey-response-tab').tab('show');
    this.getBrandOwnerList();
    this.manager.isLoginUser();
    this.checkSurveyor = false;
    this.runSpinner(false);
    this.surveyorHeaderList();
    this.allList();
    this.getState();
    this.townvillage = "0";
    this.village_wards = "0";
    this.image = '';
    this.shopimage= defStockImg;
    this.address = this.getAddressObj();
    this.dislist = [];
    this.townshiplist = [];
    this.town_village_list = [];
    this.wardlist = [];
  }

  ionViewDidEnter() {

  }

  ngOnDestroy() {
  }



  newTabClick(e) {
    
  }

  tab(e) {
  }

  listTab() {
    this.ionViewWillEnter();
  }
  surveyNewResponseTab() {
    $('#shop-survey-response-new-tab').tab('show');
  }
  shopDetailTab() {
    $('#shop-list-response-tab').tab('show');
  }
  async runSpinner(t: boolean) {
    this.spinner = t;
  }

  advanceSearch(option) {
    this.searchtab = option;
  }
  getAddressObj() {
    return {
      n20: '',
      n21: '',
      n22: '',
      n23: '',
      n24: '',
      n25: '',
      n26: '',
      n27: '',
      t11: ''
    }
  }
  getSearchObj() {
    return {
      date: "",
      shopname: "",
      shopaddress: "",
      survey: "",  //header description
      surveyor: "", //username
      trade: "",
      premise: "",
      brandowner: "",
      category: "",
      township: "",
      todate: "",
      n20: "",
      n21: "",
      n22: "",
      characteristic: "",
      respStatus: "",
      maxRow: this.config.itemsPerPage,
      current: "1"
    }
  }

  getShopObj() {
    return {
      shopSysKey: "0",
      createdDate: "",
      shopName: "",
      shopCode: "TBA",
      latitide: "",
      longitude: "",
      pluscode: "",
      address: "",
      phno: "",
      ownerphno: "",
      //  email: "",
      personName: "",
      status: "",
      // comment: "",
     modifiedDate: "",
      userId: "",
      userName: "",
      recordStatus: 1,
      syncStatus: 1,
      syncBatch: "",
      parentId: "0",
      t3: defStockImg,
      t4: "",
      n1: "0",
      n2: "0",
      n3: "0",
      n4: "0",
      n5: "0",
      n6: "0",
      n7: 0,
      n8: 0,
      n9: "0",
      n10: "0",
      n11: "0",
      n12: "0",
      n13: "0",
      userSyskey: "",
      t5: "",
      // n14: "0",
      n15: "0",
      // n16: "0",
      // n17: "0",
      // n18: "0",
      t10: "",
      balance: "",
      priceBandSyskey: "0",
      t11: "",
      t12: "",
      saveCondition: "",
      t13: "",
      t14: "",
      t15: "",
      t16: "",
      t17: "",
      n20: "",
      n21: "",
      n22: "",
      n23: "",
      n24: "0",
      n25: "",
      n26: "0",
      n27: "0",
      n28: "0",
      n29: "0",
      n30: "0",
      n31: "0",
      n32: "0",
      n33: "0",
      n34: "0",
      n35: "0",
      n36: "0",
      n37: "0",
      t18: "",
      t19: "",
      t20: "",
      t21: "",
      t22: "",
      // t23: "",
      t24: "",
      t25: "",
      t26: "",
      t27: "",
      t28: "",
      t29: "",
      t30: "",
      saleRoute: "",
      svrHdrData: {
            syskey: "",
            n1: "",
            n2: "",
            n3: "",
            n4: "",
            t1: ""
          },
      locationData: {
        "code": "",
        "createdDate": "",
        "lat": "0.0",
        "loc": "",
        "lon": "0.0",
        "modifiedDate": "",
        "n1": "0",
        "name": "",
        "pband": "",
        "recordStatus": 1,
        "syskey": "0",
        "t1": "",
        "t2": "",
        "t3": "",
        "t4": ""
      }, 
      questions: []
    }
  }

  selectedTabChange(ev) {
  }
  previewImg(img) {
    this.image = "";
    this.image = img;
    if (this.image !== '') {
      setTimeout(() => {
        $('#previewSurveImgModel').appendTo("body").modal('show');
      }, 200);
    }
  }

  handleImgError(ev: any) {
    let source = ev.srcElement;
    let imgSrc = defStockImg;
    source.src = imgSrc;
  }

  // loadImageFailed() {
  //   // show message
  // }

  // inputFileChange(e) {
  //   this.imageChangedEvent = event;
  //   let input = e.srcElement;
  //   let fileName = input.files[0].name;
  //   let label = document.getElementById("imginputLabel-shop");
  //   label.textContent = fileName;
  //   $('#imgcrp-shop').appendTo("body").modal('show');
  // }

  // //image dialog
  // cropImage() {
  //   let croppedImage = this.imgCropper.crop();
  //   this.shopimage = croppedImage.base64;
  //   $('#imgcrp-shop').appendTo("body").modal('hide');
  //   this.croperReady = false;
  // }

  // cropImageCencel() {
  //   this.croperReady = false;
  // }

  // imageLoaded() {
  //   this.croperReady = true;
  // }

  // cropperReady() {
  //   this.croperReady = true;
  // }

  // clearImage() {
  //   this.shopimage = defStockImg;
  //   this.imgFileInput.nativeElement.value = "";
  //   let label = document.getElementById("imginputLabel-shop");
  //   label.textContent = "Choose file";
  // }


  // previewModelClose() {
  //   $('#previewSurveImgModel').appendTo("body").modal('hide');
  // }

  focusFunction() {

  }
  numberOnlyValidationshop() {

  }
  numberOnlyValidation() {

  }
  getBrandOwnerList() {
    var url = "", param = {};
    param = {
      "code": "",
      "description": ""
    };
    url = this.manager.appConfig.apiurl + 'brandowner/getbrandowner';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.brandownerlist = data.dataList;
        this.brandownerlist.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
      }
    );
  }
  /***Region */
  getState() {
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'placecode/state';
      this.http.post(url, { code: "", description: "" }, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.statelist = [];
          if (data.dataList) {
            data.dataList.forEach(e => {
              this.statelist.push({ syskey: e.syskey, t2: e.t2 });
            });
            this.statelist.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
          }
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
          if (data.districtList) {
            data.districtList.forEach(e => {
              this.dislist.push({ syskey: e.syskey, t2: e.t2 });
            });
            this.dislist.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
          }
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
        townshipSyskey: '',
        districtSyskey: dis
      }, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.townshiplist = [];
          if (data.tspList) {
            data.tspList.forEach(e => {
              this.townshiplist.push({ syskey: e.syskey, t2: e.t2 });
            });
            this.townshiplist.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
          }
        },
        error => {
          done();
        }
      )
    })
  }

  getTownOrVillage(param) {
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'placecode/gettown';
      this.http.post(url,
        param,
        this.manager.getOptions()).subscribe(
          (data: any) => {
            done();
            this.town_village_list = [];
            data.townList.forEach(e => {
              this.town_village_list.push({ syskey: e.syskey, t2: e.t2, n2: e.n2 });
            });
            this.town_village_list.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
          },
          error => {
            done();
          }
        )
    })
  }


  async townOrVillageChange() {
    this.townorvillage = true;
    await this.getTownOrVillage({ n2: parseInt(this.townvillage), n3: this.shopObj.n22 });
    if (this.townvillage !== '0') {
      if (this.townvillage === '1') {
        this.village_wards = '1';
      } else if (this.townvillage === '2') {
        this.village_wards = '2';
      }
      await this.villageWardChange();
      this.townorvillage = false;
    }
  }

  async cristateChange() {
    this.address = this.getAddressObj();

    this.searchObj.n21 = "";
    this.searchObj.n22 = "";

    this.dislist = [];
    this.dis = true;
    await this.getDistrict(this.searchObj.n20);
    this.dis = false;
    this.address.n20 = this.statelist.filter(dis => {
      return dis.syskey == this.searchObj.n20;
    })[0].t2;
    this.searchObj.address = this.getAddress();
  }

  async cridisChange() {
    this.township = true;
    this.searchObj.n22 = "";
    this.searchObj.n23 = "";

    this.townshiplist = [];
    await this.getTsp(this.searchObj.n21);
    this.township = false;
    this.address.n21 = this.dislist.filter(dis => {
      return dis.syskey == this.searchObj.n21;
    })[0].t2;
    this.searchObj.address = this.getAddress();
  }

  async stateChange() {
    this.address = this.getAddressObj();

    this.shopObj.n21 = "";
    this.shopObj.n22 = "";
    this.shopObj.n23 = "";
    this.shopObj.n24 = "";
    this.shopObj.n25 = "";

    this.dislist = [];
    this.dis = true;
    await this.getDistrict(this.shopObj.n20);
    this.dis = false;
    this.address.n20 = this.statelist.filter(dis => {
      return dis.syskey == this.shopObj.n20;
    })[0].t2;
    this.shopObj.address = this.getAddress();
  }


  async disChange() {
    this.township = true;
    this.shopObj.n22 = "";
    this.shopObj.n23 = "";
    this.shopObj.n24 = "";
    this.shopObj.n25 = "";

    this.townshiplist = [];
    await this.getTsp(this.shopObj.n21);
    this.township = false;
    this.address.n21 = this.dislist.filter(dis => {
      return dis.syskey == this.shopObj.n21;
    })[0].t2;
    this.shopObj.address = this.getAddress();
  }
  async tspChange() {
    this.shopObj.n23 = 0;
    this.shopObj.n24 = "";
    this.shopObj.n25 = "";
    this.address.n23 = "";
    this.address.n24 = "";
    this.address.n25 = "";
    this.townvillage = "0";
    this.village_wards = "0";
    this.shopObj.t11 = "";
    this.address.n22 = this.townshiplist.filter(dis => {
      return dis.syskey == this.shopObj.n22;
    })[0].t2;
    this.shopObj.address = this.getAddress();
  }
  async townChange() {
    this.shopObj.n24 = "";
    this.shopObj.n25 = "";
    this.address.n25 = "";
    this.address.n24 = "";
    this.address.n25 = "";
    this.village_wards = "0";
    this.shopObj.t11 = "";
    this.address.n23 = this.town_village_list.filter(dis => {
      return dis.syskey == this.shopObj.n23;
    })[0].t2;
    this.shopObj.address = this.getAddress();
  }
  async wardChange() {
    this.address.n24 = this.wardlist.filter(dis => {
      return dis.syskey == this.shopObj.n24;
    })[0].t2;
    this.shopObj.address = this.getAddress();
  }
  async villageWardChange() {
    await this.getWards({ n3: this.shopObj.n23, n2: parseInt(this.village_wards) });
  }


  getWards(param) {
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'placecode/ward';
      this.http.post(url,
        param
        , this.manager.getOptions()).subscribe(
          (data: any) => {
            done();
            this.wardlist = [];
            data.wardList.forEach(e => {
              this.wardlist.push({ syskey: e.syskey, t2: e.t2, n2: e.n2 });

            });
            this.wardlist.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
          },
          error => {
            done();
          }
        )
    })
  }
  /***Survey Header by Shop*/
  surveyorHeaderList() {
    /*
    var param = this.getSearchObj();
    param.date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, new Date());
    param.todate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, new Date());

    this.http.post(this.manager.appConfig.apiurl + "shop/getAllSvrHdrShopDataList", param, this.manager.getOptions()).subscribe(
      (data: any) => {
        console.log(data);
        if (data.dataList) {
          /******  Group By Survey ******
          this.surveyorheaderlist = [
            {
              "id": "subfirst",
              "surveyheader": "InProgress Surveys",
              "survey": data.dataList.filter(el => el.Status == "0"),
              "currentPage": 1,
            },
            {
              "id": "first",
              "surveyheader": "Pending Surveys",
              "survey": data.dataList.filter(el => el.Status == "1"),
              "currentPage": 1,
            },
            {
              "id": "second",
              "surveyheader": "Approved Surveys",
              "survey": data.dataList.filter(el => el.Status == "2"),
              "currentPage": 1,
            },
            {
              "id": "third",
              "surveyheader": "Completed Surveys",
              "survey": data.dataList.filter(el => el.Status == "3"),
              "currentPage": 1,
            }
          ];
        }
        setTimeout(() => {
          this.runSpinner(false);
        }, 100);
      }, err => {
        setTimeout(() => {
          this.runSpinner(false);
        }, 100);
      }
    );
    */

    this.statusInProgress = true;
    this.statusPending = true;
    this.statusApproved = true;
    this.statusCompleted = true;

    this.searchObj.date = new Date();
    this.searchObj.todate = new Date();

    this.criteria.date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.date);
    this.criteria.todate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.todate);

    this.surveyorheaderlist = [
      {
        "surveyheader": "InProgress Surveys",
        "survey": [],
        "surConfig": {
          "id": "subfirst",
          "itemsPerPage": this.manager.itemsPerPage,
          "currentPage": 1,
          "totalItems": 0
        },
        "panelExpanded": false
      },
      {
        "surveyheader": "Pending Surveys",
        "survey": [],
        "surConfig": {
          "id": "first",
          "itemsPerPage": this.manager.itemsPerPage,
          "currentPage": 1,
          "totalItems": 0
        },
        "panelExpanded": false
      },
      {
        "surveyheader": "Approved Surveys",
        "survey": [],
        "surConfig": {
          "id": "second",
          "itemsPerPage": this.manager.itemsPerPage,
          "currentPage": 1,
          "totalItems": 0
        },
        "panelExpanded": false
      },
      {
        "surveyheader": "Completed Surveys",
        "survey": [],
        "surConfig": {
          "id": "third",
          "itemsPerPage": this.manager.itemsPerPage,
          "currentPage": 1,
          "totalItems": 0
        },
        "panelExpanded": false
      }
    ];
  }

  setCriteria(){
    this.statusInProgress = true;
    this.statusPending = true;
    this.statusApproved = true;
    this.statusCompleted = true;
    
    this.criteria.shopname = this.searchObj.shopname;
    this.criteria.survey = this.searchObj.survey;
    this.criteria.brandowner = this.searchObj.brandowner;
    this.criteria.characteristic = this.searchObj.characteristic;
    this.criteria.userName = this.searchObj.userName;
    
    this.premiseValue = "";
    for (var j = 0; j < this.searchObjTemp.premise.length; j++) {
      if(this.searchObjTemp.premise[j] == 1) {
        this.premiseValue += "'On Premise',";
      } else if(this.searchObjTemp.premise[j] == 2) {
        this.premiseValue += "'Off Premise',";
      }
    }
    console.log(this.premiseValue);
    this.premiseValue = this.premiseValue.slice(0, -1);
    this.criteria.premise = this.premiseValue;
    // this.criteria.premise = this.searchObj.premise;
    this.value = "";
    for (var i = 0; i < this.searchObjTemp.trade.length; i++) {
      if(this.searchObjTemp.trade[i] == 1) {
        this.value += "'Traditional Trade',";
      } else if(this.searchObjTemp.trade[i] == 2) {
        this.value += "'Modern Trade',";
      }
    }
    console.log(this.value);
    this.value = this.value.slice(0, -1);
    this.criteria.trade = this.value;
    // this.criteria.trade = this.searchObj.trade;
    this.criteria.category = this.searchObj.category;
    this.criteria.n20 = this.searchObj.n20;
    this.criteria.n21 = this.searchObj.n21;
    this.criteria.n22 = this.searchObj.n22;
    this.criteria.shopaddress = this.searchObj.shopaddress;

    if(this.searchObj.date != ""){
      this.criteria.date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.date);
    } else {
      this.criteria.date = "";
    }

    if(this.searchObj.todate != ""){
      this.criteria.todate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.todate);
    } else {
      this.criteria.todate = "";
    }

    this.surveyorheaderlist.map(
      idata => {
        idata.surConfig.currentPage = 1;
        idata.survey = [];
        idata.panelExpanded = false;
        idata.surConfig.totalItems = 0;
      }
    );

    // for(let i = 0; i < this.surveyorheaderlist.length; i++){
    //   this.surveyorheaderlist[i].surConfig.currentPage = 1;
    //   this.surveyorheaderlist[i].survey = [];
    //   this.surveyorheaderlist[i].panelExpanded = false;
    // }
  }

  openPanel(passData, cur, isPageChange){
    passData.panelExpanded = true;
    let tempResStatus = passData.surveyheader;

    this.criteria.current = cur;
    this.criteria.respStatus = tempResStatus;

    if((tempResStatus == "InProgress Surveys" && this.statusInProgress)
        || (tempResStatus == "Pending Surveys" && this.statusPending) 
        || (tempResStatus == "Approved Surveys" && this.statusApproved) 
        || (tempResStatus == "Completed Surveys" && this.statusCompleted)
        || isPageChange){
          
      this.search(passData);
    }
  }

  search(passData) {
    // if (typeof this.searchObj.date != "string") {
    //   this.searchObj.date = this.searchObj.date == '' ? '' : this.manager.formatDate(new Date(this.searchObj.date), 'yyyyMMdd');
    // }

    // if (typeof this.searchObj.todate != "string") {
    //   this.searchObj.todate = this.searchObj.todate == '' ? '' : this.manager.formatDate(new Date(this.searchObj.todate), 'yyyyMMdd');
    // }
    
    let respStatus = passData.surveyheader;

    this.runSpinner(true);
    this.http.post(this.manager.appConfig.apiurl + "shop/getAllSvrHdrShopDataList", this.criteria, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.message == "SUCCESS") {

          /******  Group By Survey ******/
          // this.surveyorheaderlist = [
          //   {
          //     "id": "subfirst",
          //     "surveyheader": "InProgress Surveys",
          //     "survey": data.dataList.filter(el => el.Status == "0"),
          //     "currentPage": 1,
          //   }, {
          //     "id": "first",
          //     "surveyheader": "Pending Surveys",
          //     "survey": data.dataList.filter(el => el.Status == "1"),
          //     "currentPage": 1,
          //   },
          //   {
          //     "id": "second",
          //     "surveyheader": "Approved Surveys",
          //     "survey": data.dataList.filter(el => el.Status == "2"),
          //     "currentPage": 1,

          //   },
          //   {
          //     "id": "third",
          //     "surveyheader": "Completed Surveys",
          //     "survey": data.dataList.filter(el => el.Status == "3"),
          //     "currentPage": 1,
          //   }
          // ];
          /******  Group By Survey ******/

          if(respStatus == "InProgress Surveys"){
            this.statusInProgress = false;
          } else if(respStatus == "Pending Surveys"){
            this.statusPending = false;
          } else if(respStatus == "Approved Surveys"){
            this.statusApproved = false;
          } else if(respStatus == "Completed Surveys"){
            this.statusCompleted = false;
          }

          for(let i = 0; i < this.surveyorheaderlist.length; i++){
            if(this.surveyorheaderlist[i].surveyheader == respStatus){
              this.surveyorheaderlist[i].survey = data.dataList;
              this.surveyorheaderlist[i].surConfig.totalItems = data.count;
            }
          }
        }
        // setTimeout(() => {
        //   this.runSpinner(false);
        // }, 100);

        this.runSpinner(false);
      }, err => {
        setTimeout(() => {
          this.runSpinner(false);
        }, 100);
      });
  }
  
  async surveyorDetail(h, hshopsyskey) {
    //---------------
    this.segmenttab = 3;
    this.approvedisabled = true;
    this.completedisabled = true;
    this.detailLoading = true;
    //---------------

    $('#shop-new-survey-response-tab').tab('show');
    $('#nav-home-tab').tab('show');

    const loading = await this.loadCtrl.create(
      {
        message: 'Loading...',
      }
    );
    await loading.present();
    this.sections = [];
    var param = {
      "HeaderShopSyskey": "",
      "ShopTransSyskey": "",
      "SectionSyskey": "",
      "HeaderSyskey": h.HeaderSyskey,
      "ShopSyskey": h.ShopSyskey
    }
    loading.message = "Requesting detail..";
    this.http.post(this.manager.appConfig.apiurl + "shop/getSvrHdrShopDataListByHdrSKCatSK", param, this.manager.getOptions()).subscribe(
      async (data: any) => {
        loading.message = "Preparing detail..";
        console.log("detail-header", h);
        console.log("detail-session", data);
        var section = [];
        if (data.message == "SUCCESS") {
          section = data.section;
          for (var i = 0; i < section.length; i++) {
            section[i].quesandans = [];
            data.dataList.filter(el => el.SectionSK === section[i].sectionSK).map((val, index) => {


              /****
               * Questions And Answers  Section
               * Matching Data by each category
               * 
               *  Category Lists
               *  1. Time Range
               *  2. Fill in the blank
               *  3. Date
               *  4. Checkbox
               *  5. Number Range
               *  6. Attach Photograph
               *  7. Multiple Choice
               *  8. Rating
               */


              //-------- create model ----------

              /*
               * answermodel1 used in => Time Range, Number Range 
               */
              val.answermodel = "";
              val.answermodel1 = "";


              //-------- actions -----------
              if (!val.Flag) {
                val.Flag = "0";
              }
              if (!val.Comment) {
                val.Comment = "";
              }
              if (!val.ApprovedFlag) {
                val.ApprovedFlag = "0";
              }
              //-------- actions -----------



              //1 :  attach photograph &&  2 : checkbox
              if (val.TypeDesc == "Checkbox") {
                if (val.TypeDesc == "Checkbox") {
                  if (val.AnswerShopPhoto) {
                    if (val.AnswerShopPhoto.length > 0) {
                      for (var c = 0; c < val.AnswerShopPhoto.length; c++) {
                        for (var a = 0; a < val.answers.length; a++) {
                          if (val.answers[a].answerSK == val.AnswerShopPhoto[c].AnswerSyskey) {
                            val.answers[a].answered = true;
                          }
                        }
                      }
                    }
                  }
                  else {
                    val.AnswerShopPhoto = [];
                  }

                  val.answers.filter(el => !el.answered).map(notanswered => {
                    notanswered.answered = false;
                  });
                }

              }
              else if (val.TypeDesc == "Attach Photograph") {
                if (!val.AnswerShopPhoto) {
                  val.AnswerShopPhoto = [];
                }
              }

              // 3 :radio button
              else if (val.TypeDesc == "Multiple Choice") {

                if (val.AnswerShopPhoto) {
                  if (val.AnswerShopPhoto.length > 0) {
                    val.answers.filter(el => el.answerSK === val.AnswerShopPhoto[0].AnswerSyskey).map(matched => {
                      matched.answered = true;
                    });
                    val.answers.filter(el => el.answerSK !== val.AnswerShopPhoto[0].AnswerSyskey).map(matched => {
                      matched.answered = false;
                    });
                  }
                }
                else {
                  val.AnswerShopPhoto = [];
                }


              }

              //4 : fill in the balck
              if (val.TypeDesc == "Fill in the Blank") {

                if (val.AnswerShopPhoto) {
                  if (val.AnswerShopPhoto.length > 0) {
                    if (val.AnswerShopPhoto[0].AnswerDesc1) {
                      val.answermodel = val.AnswerShopPhoto[0].AnswerDesc1;
                    }
                  }
                }
                else {
                  val.AnswerShopPhoto = [];
                }
              }

              // 5 : rating
              else if (val.TypeDesc == "Rating 0-10") {
                if (val.AnswerShopPhoto) {
                  if (val.AnswerShopPhoto.length > 0) {
                    val.answermodel = val.AnswerShopPhoto[0].AnswerDesc1;
                  }
                }
                else {
                  val.AnswerShopPhoto = [];
                }
              }

              // 6 : date
              else if (val.TypeDesc == "Date") {
                if (val.AnswerShopPhoto) {
                  if (val.AnswerShopPhoto.length > 0) {
                    val.answermodel = val.AnswerShopPhoto[0].AnswerDesc1;
                  }
                } else {
                  val.AnswerShopPhoto = [];
                }
              }


              // 7 : time range && number range
              else if (val.TypeDesc == "Time Range" || val.TypeDesc == "Number Range") {
                if (val.AnswerShopPhoto) {
                  if (val.AnswerShopPhoto.length > 0) {
                    val.answermodel = val.AnswerShopPhoto[0].AnswerDesc1;
                    val.answermodel1 = val.AnswerShopPhoto[0].AnswerDesc2;
                  }
                }
                else {
                  val.AnswerShopPhoto = [];
                }
              }


              section[i].quesandans.push(val);

              /**** Questions And Answers  Section **/
            });
          }
          this.sections = { "header": h.HeaderDescription, "shopname": h.ShopDescription, "headershopsyskey": h.HeaderShopSyskey, "shopsyskey": "", "section": section };



          /****Get Shop Info from headerlist  [start]*/
          this.shopObj.shopSysKey = h.ShopSyskey;
          this.shopObj.shopName = h.ShopDescription;
          this.shopObj.t5 = h.ShopDescMyan;
          this.shopObj.personName = h.Surveyor;
          this.shopObj.t10 = h.PersonPhNo;
          this.shopObj.phno = h.ShopPhNo;
          this.shopObj.n20 = h.StateSK;
          this.shopObj.n21 = h.DistrictSK;
          this.shopObj.n22 = h.TownshipSK;
          this.shopObj.n23 = h.TownSK;
          this.shopObj.n24 = h.WardSK;
          this.shopObj.t11 = h.Street;
          this.shopObj.t12 = h.SpShopCode;
          this.ABShopCode = h.ABShopCode;
          this.shopObj.address = h.ShopAddress;
          this.shopObj.userSyskey = data.UserSyskey;
          this.shopObj.svrHdrData.syskey = h.HeaderShopSyskey;
          this.shopObj.svrHdrData.n1 = h.Status;
          this.shopObj.svrHdrData.n2 = h.ShopSyskey;
          this.shopObj.svrHdrData.n3 = h.HeaderSyskey;
          this.shopObj.svrHdrData.n4 = sessionStorage.getItem('usk');
          this.shopObj.svrHdrData.t1 = sessionStorage.getItem('uname');
          this.shopObj.locationData.lat = Number(h.Latitude);
          this.shopObj.locationData.lon = Number(h.Longitude);
          if (h.pluscode ==='null'|| h.plusCode === 'undefined'){
            this.shopObj.locationData.t1 = '';
          }else{
            this.shopObj.locationData.t1 = h.pluscode;
          }
          this.shopObj.locationData.t2 = h.MimuCode;
         
          this.shopObj.n26 = h.SalesOrg;
          this.shopObj.n27 = h.DisChanl;
          this.shopObj.n28 = h.Division;
          this.shopObj.n29 = h.SalesOff;
          this.shopObj.n30 = h.SaleGroup;
          this.shopObj.n31 = h.PaymentTerm;
          this.shopObj.n32 = h.AccGroup;
          this.shopObj.n33 = h.Plant;
          this.shopObj.n35 = h.Shipping;
          this.shopObj.n36 = h.Route;
          this.shopObj.n37 = h.PartnerRole;
          this.shopObj.t13 = h.HouseNo;
          this.shopObj.t14 = h.StoreType;
          this.shopObj.t30 = h.PartnerID;
          
          if (h.PhotoPath) {
            this.shopObj.t3 = this.manager.appConfig.imgurl + h.PhotoPath;
            this.shopimage = this.shopObj.t3;
            console.log ("Shopimage => "+ this.shopimage);
          }
          else {
            this.shopimage = defStockImg;
          }
          this.shopObj.t3 = this.shopimage;

          //this.clearImage();

          /**** Get Shop Info from headerlist  [end] *****/

          /**** Region ****/

          setTimeout(() => {
            loading.dismiss();
            this.detailLoading = false;
            this.checkAllApprove();
          }, 1000);
        }
        else {

          loading.dismiss();
          this.manager.showToast(this.tostCtrl, "Message", data.message, 1000).then(e => {
            this.ionViewWillEnter();
          });
          this.detailLoading = false;
        }
      }, err => {
        setTimeout(() => {
          loading.dismiss();
          this.detailLoading = false;
          this.manager.showToast(this.tostCtrl, "Message", "Something went wrong!", 1000);
          this.ionViewWillEnter();
        }, 1000);
      });
  }
  async shopDetailClick() {
    
    this.statelist.forEach((d, index, array) => {
      if (d.syskey == this.shopObj.n20) {
        this.address.n20 = d.t2;
      }
    })

    // District
    await this.getDistrict(this.shopObj.n20);
    this.dislist.forEach((d, index, array) => {
      if (d.syskey == this.shopObj.n21) {
        this.address.n21 = d.t2;
      }
    });

    await this.getTsp(this.shopObj.n21);
    this.townshiplist.forEach((e, index, array) => {
      if (e.syskey == this.shopObj.n22) {
        this.address.n22 = e.t2;
      }
    });

    //Town Or Village
    this.townvillage = "0"
    await this.getTownOrVillage({ n2: 0, n3: this.shopObj.n22 });
    this.town_village_list.forEach((e, index, array) => {
      if (e.syskey == this.shopObj.n23) {
        this.address.n23 = e.t2;
        this.townvillage = '' + e.n2;
      }
    });

    //Village Wards
    this.village_wards = "0";
    await this.getWards({ n3: this.shopObj.n23, n2: 0 });
    this.wardlist.forEach((e, index, array) => {
      if (e.syskey == this.shopObj.n24) {
        this.address.n24 = e.t2;
        this.village_wards = '' + e.n2;
      }
    });
    this.shopObj.address = this.getAddress();
    this.shopimage = this.shopObj.t3 === defStockImg ? '' : this.shopObj.t3;
    // el.dismiss();    
    // });
  }

  StreetChange(){
    this.shopObj.address = this.getAddress();
  }
  
  storeCharacter() {
    this.isLoading = true;
    this._storecharacterlist = [];
    $('#storecharactermodal').appendTo("body").modal('show');
    this.http.post(this.manager.appConfig.apiurl + "shop/getShopInfo", { "ShopSyskey": this.shopObj.shopSysKey }, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.message == "SUCCESS") {
          this._storecharacterlist = data.dataList[0].Characteristic;
          this.isLoading = false;
        }
        else {
          this.manager.showToast(this.tostCtrl, "Message", data.message, 1000).then(e => {
            $('#storecharactermodal').appendTo("body").modal('hide');
          });
        }
      });
  }

  approvecompleteSurvey(status) {
    this.loadCtrl.create({
      message: "Processing...",
      duration: 20000
    }).then(async el => {
      el.present();

      const url = this.manager.appConfig.apiurl + 'shop/updateStatusRespHdr';
      var reques_param = { "Status": status, "RespHdrSyskey": this.sections.headershopsyskey }, condition = false;


      this.http.post(url, reques_param, this.manager.getOptions()).subscribe(
        (data: any) => {
          el.dismiss();
          if (data.message == "SUCCESS") {
            if (status == 2) {
              this.manager.showToast(this.tostCtrl, "Message", "" + "Approved", 1000).then(el => {
              });
            }
            else {
              this.manager.showToast(this.tostCtrl, "Message", "" + "Completed", 1000).then(el => {
                this.completedisabled = false;
              });
            }
            setTimeout(() => {
              this.ionViewWillEnter();
            }, 1000);
          }
          else {
            this.manager.showToast(this.tostCtrl, "Message", "" + data.message, 1000).then(el => {
            });
          }
        }, err => {
          el.dismiss();
          this.manager.showToast(this.tostCtrl, "Message", "" + "Something went wrong!", 1000).then(el => {
          });
        });
    });
  }
  test() {
    for (var i = 0; i < this.sections.section.length; i++) {
      for (var s = 0; s < this.sections.section[i].quesandans.length; s++) {
        this.sections.section[i].quesandans[s].ApprovedFlag = "1";
      }
    }
    this.approvedisabled = false;
  }
  checkAllApprove() {
    return new Promise<void>(done => {
      var approvedFlag = [], approvelength = 0;
      for (var i = 0; i < this.sections.section.length; i++) {
        for (var s = 0; s < this.sections.section[i].quesandans.length; s++) {
          approvedFlag.push(this.sections.section[i].quesandans[s].ApprovedFlag);
        }
      }

      approvelength = approvedFlag.filter(el => el == 1).length;
      if (approvedFlag.length == approvelength) {
        this.approvedisabled = false;
        this.completedisabled = false;
      }
      else {

        this.approvedisabled = true;
        this.completedisabled = true;

        if (this.shopObj.svrHdrData.n1 == "2") {
          this.completedisabled = false;
        }
      }
      this.isLoading = false;
      done();
    });
  }
  approvedFlagRadioChange() {
    this.isLoading = true;
    setTimeout(() => {
      this.checkAllApprove();
    }, 200);

  }
  async approveSurvey() {
    this.loadCtrl.create({
      message: "Processing...",
      duration: 20000
    }).then(async el => {
      el.present();
      setTimeout(() => {
        el.dismiss();
        this.completedisabled = false;
        this.manager.showToast(this.tostCtrl, "Message", "" + "Approved", 1000).then(el => {
        });
      }, 2000);
    });
  }
  convertFileToDataURLviaFileReader(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType('text/plain; charset=x-user-defined');  // seems to make no difference
    xhr.responseType = 'arraybuffer';  // no joy with arraybuffer or blob


    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = function () {
      console.log('There was an error!');
    };

    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.send();
  }
  async getBase64ImageFromUrl(imageUrl) {

    var res = await fetch(imageUrl, { redirect: 'follow' });
    console.log(res);

    var blob = await res.blob();
    console.log(blob);

    return new Promise(async (resolve, reject) => {
      var reader = new FileReader();
      await reader.addEventListener("load", function () {
        console.log(reader.result);
        resolve(reader.result);
      }, false);

      reader.onerror = () => {
        console.log("Image Reject ");

        return reject(this);
      };
      reader.readAsDataURL(blob);
    })
  }

  async TestImg() {
    // var base64 = await this.ImageToBase64('');
    // console.log(base64);

  }

  async ImageToBase64(imgurl) {
    const data = await this.getBase64ImageFromUrl('https://cors-anywhere.herokuapp.com/' + this.manager.appConfig.imgurl + imgurl)
      .then(result => {
        return result;
      })
      .catch(err => {
        return null;
      });

    return data;
  }


  // {
  //     "app": "Auderbox",
  //     "appname": "Auderbox",
  //     "ver": "8.4.6",
  //     "defaultDomain": "mit",
  //     "apiurl": "http://52.253.88.71:8084/auderbox/",
  //     "imgurl": "http://52.253.88.71:8084/",
  //     "dmo": "http://192.168.43.105:8086/auderbox/"
  // }


  getSessionForUpdate() {
    return new Promise(async (resolve) => {
      console.log('before root')
      let spromise = Promise.resolve();
      this.sections.section.map(async (section, index) => {
        spromise = spromise.then(async () => {
          const qaData = new Promise(async (resolve2, reject) => {
            let qapromise = Promise.resolve();
            section.quesandans.map(async (qa) => {
              qapromise = qapromise.then(async () => {
                let ipromise = Promise.resolve();
                if (qa.TypeDesc == "Checkbox") {
                  var svr9DataList = [];
                  qa.answers.filter(el => el.answered === true).map(aobj => {
                    svr9DataList.push({
                      recordStatus: 1,
                      t1: "",
                      t2: "",
                      t3: aobj.answerDesc,
                      t4: "",
                      n2: aobj.answerSK
                    });
                  });
                  this.qary.push({
                    syskey: qa.QuestionShopSyskey,
                    n3: qa.TypeSK,
                    n4: qa.SectionSK,
                    n5: qa.QuestionSyskey,
                    n6: "0",
                    t1: "",
                    t2: qa.QuestionDescription,
                    t3: qa.Instruction,//Instruction
                    t4: qa.Comment,
                    t5: "",
                    n8: "0",
                    n9: qa.Flag,
                    n10: qa.ApprovedFlag,
                    svr9DataList: svr9DataList
                  });
                }
                else if (qa.TypeDesc == "Fill in the Blank" || qa.TypeDesc == "Date" || qa.TypeDesc == "Rating 0-10") {
                  if (qa.TypeDesc == "Date") {
                    if (typeof qa.answermodel != "string") {
                      qa.answermodel = qa.answermodel == '' ? '' : this.manager.formatDate(new Date(qa.answermodel), 'yyyyMMdd');
                    }
                  }
                  this.qary.push({
                    syskey: qa.QuestionShopSyskey,
                    n3: qa.TypeSK,
                    n4: qa.SectionSK,
                    n5: qa.QuestionSyskey,
                    n6: "0",
                    t1: qa.answermodel,
                    t2: qa.QuestionDescription,
                    t3: qa.Instruction,//Instruction
                    t4: qa.Comment,
                    t5: "",
                    n8: "0",
                    n9: qa.Flag,
                    n10: qa.ApprovedFlag,
                    svr9DataList: [
                      {
                        recordStatus: 1,
                        t1: "",
                        t2: "",
                        t3: qa.answermodel,
                        t4: "",
                        n2: qa.answerSK
                      }
                    ]
                  });
                }
                else if (qa.TypeDesc == "Multiple Choice") {
                  var answerSk = "0", answerDesc = '';
                  qa.answers.filter(el => el.answered === true).map(aobj => {
                    answerSk = aobj.answerSK;
                    answerDesc = aobj.answerDesc;
                  });
                  this.qary.push({
                    syskey: qa.QuestionShopSyskey,
                    n3: qa.TypeSK,
                    n4: qa.SectionSK,
                    n5: qa.QuestionSyskey,
                    n6: answerSk,
                    t1: "",
                    t2: qa.QuestionDescription,
                    t3: qa.Instruction,//Instruction
                    t4: qa.Comment,
                    t5: "",
                    n8: "0",
                    n9: qa.Flag,
                    n10: qa.ApprovedFlag,
                    svr9DataList: [
                      {
                        recordStatus: 1,
                        t1: "",
                        t2: "",
                        t3: answerDesc,
                        t4: "",
                        n2: answerSk
                      }
                    ]
                  });
                }
                else if (qa.TypeDesc == "Number Range" || qa.TypeDesc == "Time Range") {
                  var answerSk = '0';
                  if (qa.AnswerShopPhoto.length > 0) {
                    answerSk = qa.AnswerShopPhoto[0].AnswerSyskey
                  }
                  this.qary.push({
                    syskey: qa.QuestionShopSyskey,
                    n3: qa.TypeSK,
                    n4: qa.SectionSK,
                    n5: qa.QuestionSyskey,
                    n6: "0",
                    t1: qa.answermodel,
                    t2: qa.QuestionDescription,
                    t3: qa.Instruction,//Instruction
                    t4: qa.Comment,
                    t5: qa.answermodel1,
                    n8: "0",
                    n9: qa.Flag,
                    n10: qa.ApprovedFlag,
                    svr9DataList: [
                      {
                        recordStatus: 1,
                        t1: "",
                        t2: "",
                        t3: qa.answermodel,
                        t4: qa.answermodel1,
                        n2: answerSk
                      }
                    ]
                  });
                }
                else if (qa.TypeDesc == "Attach Photograph") {
                  var svr9DataList = [];

                  const iData = new Promise(async (resolve3, reject) => {
                    qa.AnswerShopPhoto.map(async (p, index) => {
                      ipromise = ipromise.then(async () => {

                        if (p.PhotoPath.length > 5) {
                          var base64data: any = await this.ImageToBase64(p.PhotoPath);

                          console.log("Base" + base64data);

                          if (base64data && base64data.length > 15) {
                            svr9DataList.push({
                              recordStatus: 1,
                              t1: base64data.replace("data:image/png;base64,", "data:image/jpeg;base64,"), //base64
                              t2: p.PhotoName + '.' + p.PhotoPath.split('.').pop(), //photoname
                              t3: qa.answermodel,
                              t4: qa.answermodel1,
                              n2: p.AnswerSyskey
                            })
                          }
                          else {
                            svr9DataList.push({
                              recordStatus: 1,
                              t1: '', //base64
                              t2: p.PhotoName, //photoname
                              t3: qa.answermodel,
                              t4: qa.answermodel1,
                              n2: p.AnswerSyskey
                            })
                          }
                        }
                        else {

                          svr9DataList.push({
                            recordStatus: 1,
                            t1: '', //base64
                            t2: p.PhotoName, //photoname
                            t3: qa.answermodel,
                            t4: qa.answermodel1,
                            n2: p.AnswerSyskey
                          })
                        }
                      })



                      // if (qa.AnswerShopPhoto.length == index + 1) {
                      //   resolve("Success")
                      // }
                    });
                    ipromise.then(() => {
                      resolve3("Success3")
                    })
                  })


                  const h = await iData;
                  //console.log("Svr" + JSON.stringify(svr9DataList));

                  this.qary.push({
                    syskey: qa.QuestionShopSyskey,
                    n3: qa.TypeSK,
                    n4: qa.SectionSK,
                    n5: qa.QuestionSyskey,
                    n6: "0",
                    t1: qa.answermodel,
                    t2: qa.QuestionDescription,
                    t3: qa.Instruction,//Instruction
                    t4: qa.Comment,
                    t5: qa.answermodel1,
                    n8: "0",
                    n9: qa.Flag,
                    n10: qa.ApprovedFlag,
                    svr9DataList: svr9DataList
                  });
                }

                //console.log(this.qary);
                // successData.then(() => {
              });
            });
            qapromise.then(() => {
              resolve2("Success2")
            })
          })

          const qaHand = await qaData;

          if (this.sections.section.length == index + 1) {
            spromise.then(() => {
              resolve("Success")
            })
          }

        });

      });




    })
  }
  async update(status) {
    this.qary = [];
    const loading = await this.loadCtrl.create({
      message: "Processing...",
    });
    await loading.present();
    if (this.shopObj.svrHdrData.n1 != "2") {
      this.shopObj.svrHdrData.n1 = status;
    }
    loading.message = "Preparing .. ";
    const dt_start = (new Date()).getMilliseconds();
    const sessionData = await this.getSessionForUpdate();
    const dt_end = (new Date()).getMilliseconds();
    console.log("duration ", dt_end - dt_start)
    this.shopObj.questions = this.qary;
    if (this.shopObj.t3 === this.shopimage) {
      this.shopObj.t3 = '';
    } else {
      this.shopObj.t3 = this.shopimage === defStockImg ? '' : this.shopimage;
    }
     this.shopObj.t14 = this.shopObj.t14 == null ? "" : this.shopObj.t14;

    const url = this.manager.appConfig.apiurl + 'shop/save';
    loading.message = "Updating .. ";
    this.http.post(url, this.shopObj, this.manager.getOptions()).subscribe(
      (data: any) => {
      console.log(data);
        this.manager.showToast(this.tostCtrl, "Message", "" + data.message, 1000).then(
          e => {
            if (data.message == "Success") {
              this.ionViewWillEnter();
            } else if (data.message == "Code Already Existed") {
            }
          }
        );
        loading.dismiss();
      },
      error => {
        loading.dismiss();
        this.manager.showToast(this.tostCtrl, "Message", "Something went wrong!", 1000);

      }
    );
  }
    

  pageChanged(e, sur) {
    sur.surConfig.currentPage = e;
    let currentIndex = (sur.surConfig.currentPage - 1) * this.config.itemsPerPage;
    this.openPanel(sur, currentIndex, true);
  }

  advanceSearchReset() {
    this.ionViewWillEnter();
  }


  flagQues(data) {
    if (data.Flag == 0) {
      data.Flag = 1;
    }
    else {
      data.Flag = 0;
    }
  }

  logScrolling(evt) {

  }

  multipleradioChange(al, ary) {
    al.answered = !al.answered;

    ary.filter(el => el.answerSK != al.answerSK).map(val => {
      val.answered = false;
    });
  }
  checkboxChange(al) {
    al.answered = !al.answered;
  }
  timeCompare(status, time, data) {
    var start_time: any;
    var end_time: any;
    if (status == "st") {
      start_time = time;
      end_time = data.answermodel1;
    }
    else {
      start_time = data.answermodel;
      end_time = time;
    }

    start_time = start_time.split(" ");
    var time = start_time[0].split(":");

    var stime = time[0];
    if (start_time[1] == "PM" && stime < 12) stime = parseInt(stime) + 12;
    if (stime.length == 1) {
      start_time = "0" + stime + ":" + time[1] + ":00";
    }
    else {
      start_time = stime + ":" + time[1] + ":00";
    }

    end_time = end_time.split(" ");
    var time1 = end_time[0].split(":");
    var etime = time1[0];
    if (end_time[1] == "PM" && etime < 12) etime = parseInt(etime) + 12;
    if (etime.length == 1) {
      end_time = "0" + etime + ":" + time1[1] + ":00";
    }
    else {
      end_time = etime + ":" + time1[1] + ":00";
    }

    console.log(start_time + "==" + end_time);
    if (start_time != '' && end_time != '') {
      if (end_time <= start_time) {
        if (status == "st") {
          this.manager.showToast(this.tostCtrl, "Message", "Start time must be sooner than End time", 2000);
          data.answermodel1 = "";
          data.answermodel = "";
        }
        else {
          this.manager.showToast(this.tostCtrl, "Message", "End time must be later than From Start time", 2000)
          data.answermodel = "";
          data.answermodel1 = "";
        }
      }
    }
  }
  Test(data) {
    console.log("");
  }

  startTimeChange(event, data) {
    this.timeCompare("st", event, data);
  }
  endTimeChange(event, data) {
    if (data.answermodel == "") {
      this.manager.showToast(this.tostCtrl, "Message", "Add Start time First", 2000);
    }
    else {
      this.timeCompare("et", event, data);
    }
  }
  getCriteriaData() {
    return {
      "date": "",
      "surveyForm": "",
      "questionCode": "",
      "questionDesc": "",
      "section": "",
      "shop": "",
      "surveyor": "",
      "answer": "",
      "type": "",
      "storeType": "",
      "address": ""
    };
  }

  dateChange2(event) {
    if (this.searchObj.date == "" || this.searchObj.date == undefined) {
      this.searchObj.todate = "";
      $("#td").val("").trigger("change");
      this.manager.showToast(this.tostCtrl, "Message", "Add From Date First", 2000);
    } else {
      let tempFromDate = new Date(this.searchObj.date);
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
    this.searchObj.date = "";
    this.searchObj.todate = "";
  }

  dblClickFunc2() {
    this.searchObj.todate = "";
  }

  print() {
    this.loadCtrl.create({
      message: "Processing..",
      duration: 20000,
      backdropDismiss: false
    }).then(
      el => {
        el.present();
        const url = this.manager.appConfig.apiurl + 'reports/excelExports_SurveyResponse';

        if (typeof this.searchObj.date != "string") {
          this.searchObj.date = this.searchObj.date == '' ? '' : this.manager.formatDate(new Date(this.searchObj.date), 'yyyyMMdd');
        }

        if (typeof this.searchObj.todate != "string") {
          this.searchObj.todate = this.searchObj.todate == '' ? '' : this.manager.formatDate(new Date(this.searchObj.todate), 'yyyyMMdd');
        }
        // if (this.searchObj.date != "") {
        //   this.searchObj.date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.date);
        // }

        // if (this.searchObj.todate != "") {
        //   this.searchObj.todate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.todate);
        // }

        this.premiseValue = "";
        for (var j = 0; j < this.searchObjTemp.premise.length; j++) {
          if(this.searchObjTemp.premise[j] == 1) {
            this.premiseValue += "'On Premise',";
          } else if(this.searchObjTemp.premise[j] == 2) {
            this.premiseValue += "'Off Premise',";
          }
        }
        console.log(this.premiseValue);
        this.premiseValue = this.premiseValue.slice(0, -1);
        this.searchObj.premise = this.premiseValue;
        // this.criteria.premise = this.searchObj.premise;
        this.value = "";
        for (var i = 0; i < this.searchObjTemp.trade.length; i++) {
          if(this.searchObjTemp.trade[i] == 1) {
            this.value += "'Traditional Trade',";
          } else if(this.searchObjTemp.trade[i] == 2) {
            this.value += "'Modern Trade',";
          }
        }
        console.log(this.value);
        this.value = this.value.slice(0, -1);
        this.searchObj.trade = this.value;


        if (this.searchObj.date.toString() == "false") {
          this.manager.showToast(this.tostCtrl, "Message", "" + "Add Correct Date Format", 1000)
          this.searchObj.date = "";
        } else {
          this.http.post(url, this.searchObj, this.manager.getOptions()).subscribe(
            (data: any) => {
              var date = "";
              var todate = "";
              var township="";
              if(!(this.searchObj.n22=="0") && !(this.searchObj.n22=="")){
                 township = this.townshiplist.filter(t => {
                  return t.syskey == this.searchObj.n22;
                })[0].t2;
              } 
              
              var district="";
             
              if(!(this.searchObj.n21=="0") && !(this.searchObj.n21=="")){
                district = this.dislist.filter(t => {
                  return t.syskey == this.searchObj.n21;
                   })[0].t2;
              }
              var state="";
              if(!(this.searchObj.n20=="0") && ! (this.searchObj.n20=="")){
                state = this.statelist.filter(t => {
                  return t.syskey == this.searchObj.n20;
                })[0].t2;
              }
             
              


              if (this.searchObj.date != "") {
                this.searchObj.date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoDTP, this.searchObj.date);
                date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI, this.searchObj.date).toString();
              }

              if (this.searchObj.todate != "") {
                this.searchObj.todate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoDTP, this.searchObj.todate);
                todate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI, this.searchObj.todate).toString();
              }

              if (data.message == "SUCCESS") {
                this.loadCtrl.dismiss();
                let data1 = data.dataList;
                let cri_flag = 0;
                let excel_date = "";

                let excelTitle = "Survey Response Report";

                let excelHeaderData = [
                  "Response Header Date", "Status", "Shop Name", "Shop Name Myanmar", "State", 
                  "Township Description", "Township MimuCode", "Characteristic Description", "Header Description", "Question Code",
                  "Question Description", "Section Description", "Question Type Description", "Comment", "Type",
                  "Answer Description 1", "Answer Description 2", "Surveyor", "Category Code", "Category Description",
                  "Shop Phone Number", "Email", "Shop Comment", "Shop Owner", "Shop Owner Phone Number",
                  "Latitude", "Longitude", "PlusCode"
                ];
                let excelDataList: any = [];

                let workbook = new Workbook();
                let worksheet = workbook.addWorksheet('Survey Response Data');
                for (var exCount = 0; exCount < data1.length; exCount++) {
                  let excelData: any = [];
                  excel_date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].CreatedDate).toString();

                  excelData.push(excel_date);
                  excelData.push(data1[exCount].responseHdrStatus);
                  excelData.push(data1[exCount].ShopName);
                  excelData.push(data1[exCount].ShopNameMM);
                  excelData.push(data1[exCount].State);
                  excelData.push(data1[exCount].TownshipDesc);
                  excelData.push(data1[exCount].TownshipMimuCode);
                  excelData.push(data1[exCount].characteristicDesc);
                  excelData.push(data1[exCount].HeaderDesc);
                  excelData.push(data1[exCount].QuestionCode);
                  excelData.push(data1[exCount].QuestionDesc);
                  excelData.push(data1[exCount].SectionDesc);
                  excelData.push(data1[exCount].TypeDesc);
                  excelData.push(data1[exCount].Comment);
                  excelData.push(data1[exCount].Type);
                  excelData.push(data1[exCount].Entry1);
                  excelData.push(data1[exCount].Entry2);
                  excelData.push(data1[exCount].Surveyor);
                  excelData.push(data1[exCount].CategoryCode);
                  excelData.push(data1[exCount].CategoryDesc);
                  excelData.push(data1[exCount].ShopPhNo);
                  excelData.push(data1[exCount].Email);
                  excelData.push(data1[exCount].ShopComment);
                  excelData.push(data1[exCount].ShopOwner);
                  excelData.push(data1[exCount].ShopOwnerPhNo);
                  excelData.push(data1[exCount].Latitude);
                  excelData.push(data1[exCount].Longitude);
                  excelData.push(data1[exCount].PlusCode);

                  excelDataList.push(excelData);
                }

                let titleRow = worksheet.addRow(["", "", excelTitle]);
                titleRow.font = { bold: true };
                worksheet.addRow([]);

                worksheet.getColumn(1).width = 20;
                worksheet.getColumn(2).width = 30;
                worksheet.getColumn(3).width = 30;
                worksheet.getColumn(4).width = 30;
                worksheet.getColumn(5).width = 30;
                worksheet.getColumn(6).width = 30;
                worksheet.getColumn(8).width = 30;
                worksheet.getColumn(10).width = 30;

                let criteriaRow;
                if (date.toString() != "") {
                  criteriaRow = worksheet.addRow(["From Date : " + date.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                if (todate.toString() != "") {
                  criteriaRow = worksheet.addRow(["To Date : " + todate.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                if (this.searchObj.shopname.toString() != "") {
                  criteriaRow = worksheet.addRow(["Shop Name : " + this.searchObj.shopname.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }

                if (this.searchObj.shopaddress.toString() != "") {
                  criteriaRow = worksheet.addRow(["Shop Address : " + this.searchObj.shopaddress.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                if (this.searchObj.survey.toString() != "") {
                  criteriaRow = worksheet.addRow(["Survey Form : " + this.searchObj.survey.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                if (this.searchObj.surveyor.toString() != "") {
                  criteriaRow = worksheet.addRow(["Surveyor : " + this.searchObj.surveyor.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                if (this.searchObj.premise.toString() != "") {
                  criteriaRow = worksheet.addRow(["Premise Type : " + this.searchObj.premise.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                if (this.searchObj.trade.toString() != "") {
                  criteriaRow = worksheet.addRow(["Trade Type : " + this.searchObj.trade.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                if (this.searchObj.brandowner.toString() != "") {
                  criteriaRow = worksheet.addRow(["Brand Owner : " + this.searchObj.brandowner.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                if (this.searchObj.category.toString() != "") {
                  criteriaRow = worksheet.addRow(["Category : " + this.searchObj.category.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                if (this.searchObj.n20.toString() != "") {
                  criteriaRow = worksheet.addRow(["State : " + state.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                if (this.searchObj.n21.toString() != "") {
                  criteriaRow = worksheet.addRow(["District : " + district.toString()]);
                  criteriaRow.font = { bold: true };
                  cri_flag++;
                }
                if (this.searchObj.n22.toString() != "") {
                  criteriaRow = worksheet.addRow(["Township : " + township.toString()]);
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
                headerRow.fill = {
                  type: 'pattern',
                  pattern: 'darkTrellis',
                  fgColor: { argb: 'FFFFFF00' },
                  bgColor: { argb: 'FF0000FF' }
                }
                for (var i_data = 0; i_data < excelDataList.length; i_data++) {
                  worksheet.addRow(excelDataList[i_data]);
                }

                workbook.xlsx.writeBuffer().then((data) => {
                  let blob = new Blob([data], { type: EXCEL_TYPE });
                  FileSaver.saveAs(blob, "Survey_Response_export_" + new Date().getTime() + EXCEL_EXTENSION);
                });
              }
              else {
                this.loadCtrl.dismiss();
                this.manager.showToast(this.tostCtrl, "Message", "" + data.message, 1000);
              }
            }, err => {
              el.dismiss();
              this.manager.showToast(this.tostCtrl, "Message", "Something went wrong!", 1000);
            }
          );
        }
      }
    )
  }

  allList() {
    this.shopNameSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.shopNameSearchAutoFill(term).subscribe(
            data => {
              this.shopNameList = data as any[];
            }
          );
        }
      }
    );

    this.surveyformSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.svrHdrDescSearchAutoFill(term).subscribe(
            data => {
              this.surveyformList = data as any[];
            }
          );
        }
      }
    );

    this.brandownerSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.responseBrandOwnerSearchAutoFill(term).subscribe(
            data => {
              this.brandownerList1 = data as any[];
            }
          );
        }
      }
    );

    this.townshipSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.tspNameSearchAutoFill("", term).subscribe(
            data => {
              this.townshipList = data as any[];
            }
          );
        }
      }
    );

    this.surveyorSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.userNameSearchAutoFill(term).subscribe(
            data => {
              this.surveyorList = data as any[];
            }
          );
        }
      }
    );

    this.categorySearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.categorySearchAutoFill(term).subscribe(
            data => {
              this.categoryList = data as any[];
            }
          );
        }
      }
    );

    this.characteristicSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.characteristicSearchAutoFill(term).subscribe(
            data => {
              this.characteristicList = data as any[];
            }
          );
        }
      }
    );
  }


  getAddress(): string {
    let add = "";
    if (this.shopObj.t11 !== "") add += this.shopObj.t11 + ', ';
    if (this.address.n27 !== "") add += this.address.n27 + ', ';
    if (this.address.n26 !== "") add += this.address.n26 + ', ';
    if (this.address.n25 !== "") add += this.address.n25 + ', ';
    if (this.address.n24 !== "") add += this.address.n24 + ', ';
    if (this.address.n23 !== "") add += this.address.n23 + ', ';
    if (this.address.n22 !== "") add += this.address.n22 + ', ';
    if (this.address.n21 !== "") add += this.address.n21 + ', ';
    if (this.address.n20 !== "") add += this.address.n20;
    return add;
  }

}