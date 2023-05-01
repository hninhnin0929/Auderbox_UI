import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatOption } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonBackButton, LoadingController, ModalController, NavController, NavParams, ToastController } from '@ionic/angular';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import * as XLSX from 'xlsx';
import { AppComponent } from '../app.component';
import { ControllerService } from '../controller.service';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
const defStockImg = 'assets/img/not-found.png';
declare var $: any;
@Component({
  selector: 'app-shop',
  templateUrl: './shop.page.html',
  styleUrls: ['./shop.page.scss'],
})
export class ShopPage implements OnInit {
  @ViewChild(ImageCropperComponent, { static: false }) imgCropper !: ImageCropperComponent;
  @ViewChild('shopimageinput', { static: false }) imgFileInput: ElementRef;
  @ViewChild('triggerAllDisChanSelectOption', { static: false }) triggerAllDisChanSelectOption: MatOption;
  @ViewChild('triggerAllPTermSelectOption', { static: false }) triggerAllPTermSelectOption: MatOption;
  @ViewChild('triggerAllSOrgSelectOption', { static: false }) triggerAllSOrgSelectOption: MatOption;
  @ViewChild('triggerAllDivisionSelectOption', { static: false }) triggerAllDivisionSelectOption: MatOption;
  @ViewChild('triggerAllSOfficeSelectOption', { static: false }) triggerAllSOfficeSelectOption: MatOption;

  config = {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };

  shoplist: any = [];
  spinner: boolean = false;
  searchtab: boolean = false;
  checkSurveyor: boolean = false;
  delete_param = this.getDefaultDeleteObject();

  address: any = this.getAddressObj();
  shopObj: any = this.getShopObj();
  searchObj: any = this.getSearchObj();
  btn: boolean = false;
  //address
  statelist: any = [];
  state: boolean = false;
  storeType: any = [];
  dislist: any = [];
  dis: boolean = false;

  townshiplist: any = [];
  township: boolean = false;
  fileselector: any;

  townvillage: string = "0";
  village_wards: string = "0";
  town_village_list: any = [];

  wardlist: any = [];

  shoplist1: any = [];
  shopNameSearch: FormControl = new FormControl();

  //image//
  imageChangedEvent: any = '';
  croppedImage: any = '';
  // defStockImg = 'assets/img/not-found.png';
  croperReady: boolean;
  //hml
  start_flag: boolean = false;
  saveBtn_Access: boolean = false;
  deleteBtn_Access: boolean = false;
  exportBtn_Access: boolean = false;
  activate_Access: boolean = false;
  gpsControl_Access: boolean = false;
  shopPhControl_Access: boolean = false;

  image: any;

  isLoading = false;

  criStateList: any = [];
  criDistrictList: any = [];
  criTownshipList: any = [];
  criTownList: any = [];
  criWardList: any = [];
  // isAdminRole = false;
  value: any;
  criteria: any = this.getCriteriaData();

  saleOrgList: any = [];
  divisionList: any = [];
  disChannelList: any = [];
  saleOfficeList: any = [];
  saleGrpList: any = [];
  payTermList: any = [];
  cusGrpList: any = [];
  plantList: any = [];
  stolocList: any = [];
  shippingList: any = [];
  routeList: any = [];
  ptnrRoleList: any = [];
  isUseSAP: boolean = false;
  settingData: any;
  shopPhStatus: boolean = false;
  gpsStatus: boolean = false;
 

  constructor(
    public manager: ControllerService,
    public http: HttpClient,
    public alertCtrl: AlertController,
    public activeRoute: ActivatedRoute,
    private modalCtrl: ModalController,
    private router: Router,
    private navCtrl: NavController,
    private tostCtrl: ToastController,
    public app: AppComponent,
    private loadCtrl: LoadingController
  ) {

  }

  ngOnInit() {
    this.getBtnAccess();
     this.settingData = JSON.parse(sessionStorage.getItem('settingData'));
    this.isUseSAP = this.settingData.n8 == '1' ? true : false;
  }
 

  async ionViewWillEnter() {
    // if(sessionStorage.getItem('role') === 'Admin') {
    //   this.isAdminRole = true;
    // } else {
    //   this.isAdminRole = false;
    // }
    this.getBtnAccess();
    $('#shop-list-tab').tab('show');
    // this.getShopListForAutoComplete();
    this.getCriteriaData();
    this.manager.isLoginUser();
    this.btn = false;
    this.checkSurveyor = false;
    this.searchObj.dateOptions = "";
    this.dateOptionsChange();
    this.address = this.getAddressObj();
    this.shopObj = this.getShopObj();
    this.getStoreType();
    $('#shop-list-tab').tab('show');
    this.getState();
    this.image = defStockImg;
     this.settingData = JSON.parse(sessionStorage.getItem('settingData'));
    this.isUseSAP = this.settingData.n8 == '1' ? true : false;
    this.runSpinner(true);
    await this.getShopList(0);
    if(this.isUseSAP){
      this.getPartnerData();
    }
    this.runSpinner(false);
    this.fileselector = document.querySelector('[type="file"]');

  }
  ionViewDidEnter() {

  }

  ngOnDestroy() {
  }
  async loadingPresent() {
    this.isLoading = true;
    return await this.loadCtrl.create({
      message: 'Processing...'
      //   duration: 10000
    }).then(a => {
      a.present().then(() => {
        console.log('presented');
        if (!this.isLoading) {
          a.dismiss().then(() => console.log('abort presenting'));
        }
      });
    });
  }

  async loadingDismiss() {
    this.isLoading = false;
    return await this.loadCtrl.dismiss().then(() => console.log('dismissed'));
  }

  //image dialog
  cropImage() {
    let croppedImage = this.imgCropper.crop();
    this.image = croppedImage.base64;
    $('#imgcrp-shop').appendTo("body").modal('hide');
    this.croperReady = false;
  }

  cropImageCencel() {
    this.croperReady = false;
  }

  imageCropped(event: ImageCroppedEvent) {
    console.log('image cropped event');
  }

  imageLoaded() {
    this.croperReady = true;
    console.log('image loaded ')
  }

  cropperReady() {
    this.croperReady = true;
    console.log('cropperReady')
  }

  loadImageFailed() {
    // show message
  }

  clearImage() {
    this.image = defStockImg;
    // $('#imginput').val('');
    this.imgFileInput.nativeElement.value = "";
    let label = document.getElementById("imginputLabel-shop");
    label.textContent = "Choose file";
    console.log(this.imgFileInput.nativeElement.files);

  }

  previewStockImage() {

  }


  newTabClick(e) {
    this.checkSurveyor = false;
    this.townvillage = "0";
    this.village_wards = "0";
    this.image = '';
    this.shopObj = this.getShopObj();
    this.address = this.getAddressObj();
    this.clearImage();
    this.searchObj = this.getSearchObj();
    this.dislist = [];
    this.townshiplist = [];
    this.town_village_list = [];
    this.wardlist = [];
    this.shopPhStatus=false;
    this.gpsStatus=false;
        
    // if(this.isUseSAP){
    //   this.getPartnerData();
    // }
    if(this.isUseSAP)
    {
      if(this.divisionList.length)
      {
        this.shopObj.n28  = this.divisionList[0].syskey;
        this.shopObj.t20 = this.divisionList[0].code;
      }
      if(this.shippingList.length)
      {
        this.shopObj.n35 = this.shippingList[0].syskey;
        this.shopObj.t27 = this.shippingList[0].code;
      }
      if(this.routeList.length)
      {
        this.shopObj.n36 = this.routeList[0].syskey;
        this.shopObj.t28 = this.routeList[0].code;   
      } 
    }   

  }

  tab(e) {

    alert("a");
    this.checkSurveyor = false;
  }
  numberOnlyValidation(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }



  async listTab() {
    this.address.n21 = "";
    this.address.n22 = "";
    this.address.n23 = "";
    this.address.n24 = "";
    this.address.n25 = "";
    this.townvillage = "0";
    this.village_wards = "0";
    this.start_flag = true;
    this.searchObj.dateOptions = "";
    this.dateOptionsChange();
    $('#shop-list-tab').tab('show');
    this.runSpinner(true);
    await this.getShopList(0);
    this.runSpinner(false);
  }

  async getShopList(current:number) {

    return new Promise<void>((resolve) => {
      let send_data1 = this.searchObj.fromdate;
      let send_data2 = this.searchObj.todate;
      this.value = "";
      if (this.searchObj.fromdate != null && this.searchObj.todate != null &&
        this.searchObj.fromdate.toString() != "" && this.searchObj.todate.toString() != "") {
        this.searchObj.fromdate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.fromdate);
        this.searchObj.todate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.todate);
      }
      else if (this.searchObj.fromdate != null && this.searchObj.fromdate.toString() != "") {
        this.searchObj.fromdate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.fromdate);
      }
      let send_data3 = this.searchObj.modifiedfrom;
      let send_data4 = this.searchObj.modifiedto;
      if (this.searchObj.modifiedfrom != null && this.searchObj.modifiedto != null &&
        this.searchObj.modifiedfrom.toString() != "" && this.searchObj.modifiedto.toString() != "") {
        this.searchObj.modifiedfrom = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.modifiedfrom);
        this.searchObj.modifiedto = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.modifiedto);
      }
      else if (this.searchObj.modifiedfrom != null && this.searchObj.modifiedfrom.toString() != "") {
        this.searchObj.modifiedfrom = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.modifiedfrom);
      }
      
      for (var i = 0; i < this.criteria.t14.length; i++) {
        this.value += "'" + this.criteria.t14[i] + "',";
      }
      this.value = this.value.slice(0, -1);
      this.searchObj.t14 = this.value;

      let url;
      if(this.isUseSAP)
      {
        let disvalue = "";
        for(var i=0;i<this.criteria.disChanSyskey.length;i++){
          disvalue+=this.criteria.disChanSyskey[i]+","; 
        }
        disvalue = disvalue.slice(0,-1);
        this.searchObj.n27 = disvalue;

        let pterm = "";
        for(var i=0;i<this.criteria.ptermSyskey.length;i++){
          pterm+=this.criteria.ptermSyskey[i]+","; 
        }
        pterm = pterm.slice(0,-1);
        this.searchObj.n31 = pterm;
  
        let sorg = "";
        for(var i=0;i<this.criteria.sorgSyskey.length;i++){
          sorg+=this.criteria.sorgSyskey[i]+","; 
        }
        sorg = sorg.slice(0,-1);
        this.searchObj.n26 = sorg;
  
        let soff = "";
        for(var i=0;i<this.criteria.sofficeSyskey.length;i++){
          soff+=this.criteria.sofficeSyskey[i]+","; 
        }
        soff = soff.slice(0,-1);
        this.searchObj.n29 = soff;

        url = this.manager.appConfig.apiurl + 'shop/getShopAllList';

      }else
      {
         url = this.manager.appConfig.apiurl + 'shop/shoplist-cri';//Original
      }
      // url = this.manager.appConfig.apiurl + 'shop/getShopAllList';
      this.searchObj.activeStatus = parseInt(this.searchObj.activeStatus);
      const cri = {
        "data": this.searchObj,
        "current" : current,
        "maxrow": this.manager.itemsPerPage
      }
      this.http.post(url, cri, this.manager.getOptions()).subscribe(
        (data: any) => {
          if(current == 0){
            this.config.currentPage = 1;
          }
          
          this.config.totalItems = data.totalCount;
          this.shoplist = data.dataList;
          this.searchObj.fromdate = send_data1;
          this.searchObj.todate = send_data2;
          this.searchObj.modifiedfrom = send_data3;
          this.searchObj.modifiedto = send_data4;
          for (var i = 0; i < this.shoplist.length; i++) {
            this.shoplist[i].createdDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.shoplist[i].createdDate);
            this.shoplist[i].modifiedDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.shoplist[i].modifiedDate);
          }
          // this.config.currentPage = 1;
          resolve();
        },
        error => {
          resolve();
        }
      )
    });



  }

  getCriteriaData() {
    return {
      "t14": "",
      "disChanSyskey": "",
      // "skuCode": "",
      // "skuName": "",
      "shopCode": "",
      // "shopName": "",
      // "brandOwner": "",
      // "fromDate": "",
      // "toDate": "",
      // "location": "",
      // "spSKUCode": "",
      // "type": "",
      // "current": "",
      // "maxRow": "",
      // "userName": "",
      // "saveStatus": "",
      // "township": "",
      // "state":""
      "ptermSyskey": "",
      "sorgSyskey": "",
      "sofficeSyskey": ""

    };
  }

  runSpinner(t: boolean) {
    this.spinner = t;
  }

  advanceSearch(option) {
    this.searchtab = option;
  }

  async advanceSearchReset() {
    this.searchObj = this.getSearchObj();
    this.searchObj.dateOptions = "";
    this.dateOptionsChange();
    this.runSpinner(true);
    await this.getShopList(0);
    this.runSpinner(false);
  }

  getSearchObj() {
    return {
      shopSysKey: "",
      fromdate: "",
      todate: "",
      modifiedfrom: "",
      modifiedto: "",
      shopName: "",
      shopCode: "",
      address: "",
      phno: "",
      ownerphno: "",
      latitide: "",
      longitude: "",
      pluscode: "",
      dateOptions: "",
      //  email: "",
      personName: "",
      activeStatus: -1,
      t14: "",
      n20: "",
      n21: "",
      n22: "",
      n23: "",
      n24: "",
      n27: "",
      n31: "",
      n26: "",
      n29: ""
    }
  }

  getShopObj() {
    return {
      shopSysKey: "",
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
      userSyskey: "0",
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

  getAddress(): string {
    let add = "";

    if (this.shopObj.t13 !== "")
      add += this.shopObj.t13 + ', ';
    if (this.shopObj.t11 !== "")
      add += this.shopObj.t11 + ', ';
    if (this.address.n27 !== "")
      add += this.address.n27 + ', ';
    if (this.address.n26 !== "")
      add += this.address.n26 + ', ';
    if (this.address.n25 !== "")
      add += this.address.n25 + ', ';
    if (this.address.n24 !== "")
      add += this.address.n24 + ', ';
    if (this.address.n23 !== "")
      add += this.address.n23 + ', ';
    if (this.address.n22 !== "")
      add += this.address.n22 + ', ';
    if (this.address.n21 !== "")
      add += this.address.n21 + ', ';
    if (this.address.n20 !== "")
      add += this.address.n20;

    return add;
  }

  async search() {
    //hml
    this.start_flag = false;
    this.runSpinner(true);
    await this.getShopList(0);
    this.runSpinner(false);
  }

  async detail(obj) {
    const loading = await this.loadCtrl.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
    });
    await loading.present();

    this.shopObj = this.getShopObj();
    let label = document.getElementById("imginputLabel-shop");
    label.textContent = "Update file";
    this.imgFileInput.nativeElement.value = "";
    this.shopObj.shopSysKey = obj.shopSysKey;
    this.shopObj.modifiedDate = obj.modifiedDate;
    this.shopObj.createdDate = obj.createdDate;
    this.shopObj.shopCode = obj.shopCode;
    this.shopObj.shopName = obj.shopName;
    this.shopObj.personName = obj.personName;
    this.shopObj.phno = obj.phno;
    this.shopObj.ownerphno = obj.ownerphno;
    this.shopObj.address = obj.address;
    this.shopObj.latitide = obj.latitide;
    this.shopObj.longitude = obj.longitude;
    if (obj.pluscode ==='null'|| obj.plusCode === 'undefined'){
      this.shopObj.pluscode = '';
    }else{
      this.shopObj.pluscode = obj.pluscode;
    }
    this.shopObj.t3 = obj.t3 === "" ? defStockImg : this.manager.appConfig.imgurl + obj.t3;
    this.image = this.shopObj.t3;
    this.shopObj.t5 = obj.t5;
    this.shopObj.t10 = obj.t10;

    this.shopObj.n7 = obj.n7;
    if(this.shopObj.n7== 1){
      this.gpsStatus=true;
    }else{
      this.gpsStatus=false;
    }

    this.shopObj.n8 = obj.n8;
    if(this.shopObj.n8 == 1){
      this.shopPhStatus = true;
    }else{
      this.shopPhStatus = false;
    }             
    
    // this.shopObj.n14 = obj.n14;
    this.shopObj.n15 = obj.n15;
    // this.shopObj.n16 = obj.n16;
    // this.shopObj.n17 = obj.n17;
    // this.shopObj.n18 = obj.n18;

    this.shopObj.n20 = obj.n20;
    this.shopObj.n21 = obj.n21;
    this.shopObj.n22 = obj.n22;
    this.shopObj.n23 = obj.n23;
    this.shopObj.n24 = obj.n24;

    this.shopObj.n25 = obj.n25;
    this.shopObj.t11 = obj.t11;
    this.shopObj.t12 = obj.t12;
    this.shopObj.t14 = obj.t14;
    this.shopObj.t13 = obj.t13;
    this.shopObj.t16 = obj.t16;
    this.shopObj.t17 = obj.t17;

    if(this.isUseSAP){
      // this.getPartnerData();
      this.shopObj.t30 = obj.t30;
    }
    this.shopObj.n26 = obj.n26;
    this.shopObj.n27 = obj.n27;
    this.shopObj.n28 = obj.n28;
    this.shopObj.n29 = obj.n29;
    this.shopObj.n30 = obj.n30;
    this.shopObj.n31 = obj.n31;
    this.shopObj.n32 = obj.n32;
    this.shopObj.n33 = obj.n33;
    this.shopObj.n34 = obj.n34;
    this.shopObj.n35 = obj.n35;
    this.shopObj.n36 = obj.n36;
    this.shopObj.n37 = obj.n37;
    this.shopObj.t18 = obj.t18;
    this.shopObj.t19 = obj.t19;
    this.shopObj.t20 = obj.t20;
    this.shopObj.t21 = obj.t21;
    this.shopObj.t22 = obj.t22;
    this.shopObj.t23 = obj.t23;
    this.shopObj.t24 = obj.t24;
    this.shopObj.t25 = obj.t25;
    this.shopObj.t26 = obj.t26;
    this.shopObj.t27 = obj.t27;
    this.shopObj.t28 = obj.t28;
    this.shopObj.t29 = obj.t29;
    this.shopObj.n40 = obj.n40;
    this.shopObj.saleRoute = obj.saleRoute;
    this.shopObj.pTerm = obj.pTerm;

    this.shopObj.locationData = obj.locationData;
    const d = this.statelist.find(d => { return d.syskey == this.shopObj.n20 });
    if (d !== undefined) this.address.n20 = d.t2;
    await this.getDistrict(this.shopObj.n20);
    loading.message = 1 + " of " + 4;
    const d1 = this.dislist.find(d => { return d.syskey == this.shopObj.n21 });
    if (d1 !== undefined) this.address.n21 = d1.t2;
    await this.getTsp(this.shopObj.n21);
    loading.message = 2 + " of " + 4;
    const d2 = this.townshiplist.find(d => { return d.syskey == this.shopObj.n22 });
    if (d2 !== undefined) this.address.n22 = d2.t2;
    this.townvillage = "0"
    await this.getTownOrVillage({ n2: 0, n3: this.shopObj.n22 });
    loading.message = 3 + " of " + 4;
    const d3 = this.town_village_list.find(d => { return d.syskey == this.shopObj.n23 });
    if (d3 !== undefined) {
      this.address.n23 = d3.t2;
      this.townvillage = '' + d3.n2;
    }
    this.village_wards = "0";
    await this.getWards({ n3: this.shopObj.n23, n2: 0 });
    loading.message = 4 + " of " + 4;
    const d4 = this.wardlist.find(d => { return d.syskey == this.shopObj.n24 });
    if (d4 !== undefined) {
      this.address.n24 = d4.t2;
      this.village_wards = '' + d4.n2;
    }
    this.shopObj.address = this.getAddress();
    $('#shop-new-tab').tab('show');
    this.btn = true;
    loading.dismiss();
  }

  inputFileChange(e) {
    this.imageChangedEvent = event;
    let input = e.srcElement;
    let fileName = input.files[0].name;
    let label = document.getElementById("imginputLabel-shop");
    label.textContent = fileName;
    $('#imgcrp-shop').appendTo("body").modal('show');
  }

  prepare() {
    this.save();
  }

  async save() {
    if (!this.valide()) {
      this.manager.showToast(this.tostCtrl, "Warnning", "fill all blanks", 1000);
      return;
    }
    const loading = await this.loadCtrl.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
    });
    await loading.present();
    this.shopObj.n2 = '0';
    if (this.shopObj.t3 === this.image) {
      this.shopObj.t3 = '';
    } else {
      this.shopObj.t3 = this.image === defStockImg ? '' : this.image;
    }
    this.shopObj.t14 = this.shopObj.t14 == null ? "" : this.shopObj.t14;

    this.shopObj.isUseSap = this.isUseSAP.toString();
    this.shopObj.locationData.lat = this.shopObj.latitide;
    this.shopObj.locationData.lon = this.shopObj.longitude;
    if (this.searchObj.pluscode ==='null'|| this.searchObj.pluscode === 'undefined'){
      this.searchObj.pluscode = '';
    }else{
      this.searchObj.pluscode = this.searchObj.pluscode;
    }
    const url = this.manager.appConfig.apiurl + 'shop/save';
    console.log("shop name =", this.shopObj.shopName);
    console.log("this.shopObj= ", JSON.stringify(this.shopObj));
    this.http.post(url, this.shopObj, this.manager.getOptions()).subscribe(
      (data: any) => {
        loading.dismiss();
        this.manager.showToast(this.tostCtrl, "Message", "" + data.message, 1000).then(
          e => {
            if (data.message == "Success") {
              this.village_wards = '0';
              this.townvillage = '0';
              this.address = this.getAddressObj();
              this.shopObj = this.getShopObj();
              this.address = this.getAddressObj();
              this.getState();
              this.image = defStockImg;
              if (data.skCode != null && data.skCode != undefined) {
                this.shopObj.shopSysKey = data.skCode.shopSyskey;
                this.shopObj.shopCode = data.skCode.shopCode;
              }
              $('#shop-list-tab').tab('show');
              this.btn = false;
              this.runSpinner(true);
              this.getShopList(0).then(() => {
                this.runSpinner(false)
              })


            } else if (data.message == "Code Already Existed") {
              $('#spShopCode').css('border-color', 'red');
              this.shopObj.t3 = this.image;
            }
          }
        )
      },
      error => {
        loading.dismiss();
        this.manager.showToast(this.tostCtrl, "Message", "Something went wrong!", 1000);
      }
    );

  }

  valide(): boolean {
    if (this.shopObj.shopName === '') { return false; }
    if (this.shopObj.personName === '') { return false; }
    if (this.shopObj.phno === '') { return false; }
    if (this.shopObj.n22 === '') { return false; }
    if (this.shopObj.n23 === '') { return false; }
    //if (this.shopObj.n24 === '') { return false; }
    if (this.shopObj.address === '') { return false; }
    if (this.shopObj.t5 === '') { return false; }
    if (this.shopObj.t11 === '') { return false; }  
    if (this.shopObj.saleRoute === '0') { return false; }
    if(this.isUseSAP){
      // if (this.shopObj.t13 === '') { return false; }
      
      if (this.shopObj.n26 == '0') { return false; }
      if (this.shopObj.n27 == '0') { return false; }
      if (this.shopObj.n28 == '0') { return false; }
      if (this.shopObj.n29 == '0') { return false; }
      if (this.shopObj.n30 == '0') { return false; }
      if (this.shopObj.n32 == '0') { return false; }
      if (this.shopObj.n33 == '0') { return false; }
      // if (this.shopObj.n34 == '0') { return false; }//storage location
      if (this.shopObj.n35 == '0') { return false; }
      if (this.shopObj.n36 == '0') { return false; }
      // if (this.shopObj.n37 == '0') { return false; }
    }
    return true;
  }

  getDefaultDeleteObject() {
    return {
      "inUsed_Table": "UJUN003",
      "count_Column": "shopsyskey",
      "inUsed_Column": "shopsyskey",

      "delete_Table": "UVM002",
      "delete_Column": "SYSKEY",
      "delete_Key": "",
      "updateFlagCol": "N38",
      "deleteFlagCol": "N39",
      "exportFlagCol": "N40"
    };
  }

  goDelete() {
    this.alertCtrl.create({
      header: 'Confirm delete?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            //console.log('Confirm Cancel: blah');
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
              // const url = this.manager.appConfig.apiurl + 'delete/tempDelete';
               const url = this.manager.appConfig.apiurl + 'shop/deleteShop';
              // this.delete_param.delete_Key = this.shopObj.shopSysKey;
              let param = {
                "syskey": this.shopObj.shopSysKey
              }
              var subscribe = this.http.post(url, param, this.manager.getOptions()).subscribe(
                (data: any) => {
                  el.dismiss();
                  if (data.message == "SUCCESS!") {
                    this.manager.showToast(this.tostCtrl, "Message", "Deleted Successfully!", 1000).then(
                      e => {
                        this.btn = false;
                        this.getShopList(0);
                        $('#shop-list-tab').tab('show');
                      }
                    );
                  } else if (data.message == "USED!") {
                    this.manager.showToast(this.tostCtrl, "Message", "This Shop Already in Used!", 1000);
                  } else {
                    this.manager.showToast(this.tostCtrl, "Message", "Deleting Fail!", 1000);
                  }
                },
                (error: any) => {
                  el.dismiss();
                  this.manager.showToast(this.tostCtrl, "Message", "Deleting Fail!", 1000);
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
    this.loadCtrl.create({
      message: "Processing..",

      backdropDismiss: false
    }).then(
      el => {
        el.present();
        let send_data1 = this.searchObj.fromdate;
        let send_data2 = this.searchObj.todate;
        if (this.searchObj.fromdate != null && this.searchObj.fromdate != "" && this.searchObj.todate != null
          && this.searchObj.todate != "") {
          this.searchObj.fromdate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.fromdate);
          this.searchObj.todate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.todate);
        }
        else if (this.searchObj.fromdate != null && this.searchObj.fromdate != "") {
          this.searchObj.fromdate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.fromdate);
        }
        let send_data3 = this.searchObj.modifiedfrom;
        let send_data4 = this.searchObj.modifiedto;
        if (this.searchObj.modifiedfrom != null && this.searchObj.modifiedto != null &&
          this.searchObj.modifiedfrom.toString() != "" && this.searchObj.modifiedto.toString() != "") {
          this.searchObj.modifiedfrom = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.modifiedfrom);
          this.searchObj.modifiedto = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.modifiedto);
        }
        else if (this.searchObj.modifiedfrom != null && this.searchObj.modifiedfrom.toString() != "") {
          this.searchObj.modifiedfrom = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchObj.modifiedfrom);
        }

        this.value = "";
        for (var i = 0; i < this.criteria.t14.length; i++) {
          this.value += "'" + this.criteria.t14[i] + "',";
        }
        this.value = this.value.slice(0, -1);
        this.searchObj.t14 = this.value;

        const url = this.manager.appConfig.apiurl + 'shop/getShopAllforExcel';

        this.http.post(url, this.searchObj, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            if (data.message == "SUCCESS") {

              this.searchObj.fromdate = send_data1;
              this.searchObj.todate = send_data2;
              this.searchObj.modifiedfrom = send_data3;
              this.searchObj.modifiedto = send_data4;
              let data1 = data.dataList;
              let cri_flag = 0;
              let type_flag = "";
              let excelHeaderData: any;

              let excelTitle = "Store Report";
              if(this.isUseSAP) {
                // excelHeaderData = [
                //   "Brand Shop Code", "Shop Code", "Shop Name", "ဆိုင်နာမည်", "Shop Owner",
                //   "Owner Phone Number", "Phone Number", "Shop Created Date","Shop Modified Date", "Store Type", 
                //   "Address", "State", "District", "Township", "Town", 
                //   "Ward/Village", "PlusCode", "Latitude", "Longitude", "Comment", 
                //   "Image Path", "Minu", "Created By", "Status", //"Sale Route", 
                //   "Credit Limit Amount", "Credit Limit Balance", "Sales Org", "Distribution Channel", "Division", 
                //   "Sales Office", "Sales Group", "Account Group", "Plant", "Storage Location", 
                //   "Shipping", "Route", "Partner Role", "Partner ID", "Payment Term"
                // ];
                excelHeaderData = [
                  "Brand Shop Code", "Shop Code", "Shop Name", "ဆိုင်နာမည်", "Shop Owner",
                  "Owner Phone Number", "Phone Number", "Shop Created Date","Shop Modified Date", "Store Type", 
                  "Address", "State", "District", "Township", "Town", 
                  "Ward/Village", "PlusCode", "Latitude", "Longitude", "Payment Term",
                  "Credit Limit", "Credit Balance","Comment", 
                  "Image Path", "Minu", "Created By", "Modified By", "Status","GPS Verified","Shop Phone Verified", //"Sale Route", 
                  "Sales Org", "Distribution Channel", "Division", 
                  "Sales Office", "Sales Group", "Account Group", "Plant", 
                  "Shipping", "Route", "Partner Role", "Partner ID", 
                ];
              } else {
                excelHeaderData = [
                  "Brand Shop Code", "Shop Code", "Shop Name", "ဆိုင်နာမည်", "Shop Owner",
                  "Owner Phone Number", "Phone Number", "Shop Created Date","Shop Modified Date", "Store Type", 
                  "Address", "State", "District", "Township", "Town", 
                  "Ward/Village", "PlusCode", "Latitude", "Longitude", "Comment", 
                  "Image Path", "Minu", "Created By", "Modified By", "Status", "GPS Verified","Shop Phone Verified" //, "Sale Route"
                ];
              }

              let excelDataList: any = [];
              for (var exCount = 0; exCount < data1.length; exCount++) {
                let excelData: any = [];
                data1[exCount].createdDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].createdDate);
                data1[exCount].modifiedDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].modifiedDate);

                excelData.push(data1[exCount].spShopCode);
                excelData.push(data1[exCount].shopCode);
                excelData.push(data1[exCount].shopName);
                excelData.push(data1[exCount].shopnameB);
               
                excelData.push(data1[exCount].personName);
                excelData.push(data1[exCount].ownerphno);
                excelData.push(data1[exCount].phno);
                excelData.push(data1[exCount].createdDate);
                excelData.push(data1[exCount].modifiedDate);
                excelData.push(data1[exCount].storeTypeDesc);
                excelData.push(data1[exCount].address);
                excelData.push(data1[exCount].state);
                excelData.push(data1[exCount].district);
                excelData.push(data1[exCount].township);
                excelData.push(data1[exCount].town);
                excelData.push(data1[exCount].ward);
                excelData.push(data1[exCount].plusCode);
                excelData.push(data1[exCount].latitide);
                excelData.push(data1[exCount].longitude);
                if(this.isUseSAP) {
                  excelData.push(data1[exCount].pTerm);                  
                  excelData.push(data1[exCount].crdLimit);
                  excelData.push(data1[exCount].crdBalance);
                }
                excelData.push(data1[exCount].comment);
                excelData.push(data1[exCount].imagePath);
                excelData.push(data1[exCount].minu);
                excelData.push(data1[exCount].username);
                excelData.push(data1[exCount].mUserName);
                excelData.push(data1[exCount].status);
                excelData.push(data1[exCount].gpsControl);
                excelData.push(data1[exCount].shopPhControl);
               
                // excelData.push(data1[exCount].saleRoute);

                if(this.isUseSAP) {
                  // excelData.push(data1[exCount].crdLimit);
                  // excelData.push(data1[exCount].crdBalance);
                  excelData.push(data1[exCount].sOrg);
                  excelData.push(data1[exCount].disChanl);
                  excelData.push(data1[exCount].sDivision);
                  excelData.push(data1[exCount].sOffice);
                  excelData.push(data1[exCount].sGroup);
                  excelData.push(data1[exCount].cusGroup);
                  excelData.push(data1[exCount].plant);
                  // excelData.push(data1[exCount].stoloc);
                  excelData.push(data1[exCount].shipping);
                  excelData.push(data1[exCount].route);
                  excelData.push(data1[exCount].partnerRole);
                  excelData.push(data1[exCount].partnerId);
                  // excelData.push(data1[exCount].pTerm);
                }

                excelDataList.push(excelData);
              }

              let workbook = new Workbook();
              let worksheet = workbook.addWorksheet('Store Data');

              let titleRow = worksheet.addRow(["", "", excelTitle]);
              titleRow.font = { bold: true };
              worksheet.addRow([]);

              let criteriaRow;
              if (this.searchObj.shopName.toString() != "") {
                criteriaRow = worksheet.addRow(["Shop Name : " + this.searchObj.shopName.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.searchObj.personName.toString() != "") {
                criteriaRow = worksheet.addRow(["Shop Owner : " + this.searchObj.personName.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.searchObj.address.toString() != "") {
                criteriaRow = worksheet.addRow(["Address : " + this.searchObj.address.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.searchObj.phno.toString() != "") {
                criteriaRow = worksheet.addRow(["Phone Number : " + this.searchObj.phno.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              
              if (this.searchObj.fromdate != null && this.searchObj.fromdate != "" && this.searchObj.todate != null
                && this.searchObj.todate != "") {
                criteriaRow = worksheet.addRow(["FromDate : " + this.searchObj.fromdate.toString() + " ToDate : " + this.searchObj.todate.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              else if (this.searchObj.fromdate != null && this.searchObj.fromdate != "") {
                criteriaRow = worksheet.addRow([" Date : " + this.searchObj.fromdate.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.searchObj.modifiedfrom != null && this.searchObj.modifiedfrom != "" && this.searchObj.modifiedto != null
                && this.searchObj.modifiedto != "") {
                criteriaRow = worksheet.addRow(["ModifiedFrom : " + this.searchObj.modifiedfrom.toString() + " ModifiedTo : " + this.searchObj.modifiedto.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              else if (this.searchObj.modifiedfrom != null && this.searchObj.modifiedfrom != "") {
                criteriaRow = worksheet.addRow([" ModifiedDate : " + this.searchObj.modifiedfrom.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if (this.searchObj.t14 != null && this.searchObj.t14 != "") {
                criteriaRow = worksheet.addRow([" Search by Store Type "]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if (this.searchObj.pluscode != null && this.searchObj.pluscode != "") {
                criteriaRow = worksheet.addRow([" Search by PlusCode "]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.searchObj.shopCode != null && this.searchObj.shopCode != "") {
                criteriaRow = worksheet.addRow([" Search by ShopCode "]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.searchObj.latitide != null && this.searchObj.latitide != "") {
                criteriaRow = worksheet.addRow([" Search by Latitude "]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.searchObj.longitude != null && this.searchObj.longitude != "") {
                criteriaRow = worksheet.addRow([" Search by Longitude "]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.searchObj.activeStatus != "-1") {
                criteriaRow = worksheet.addRow([" Search by Status "]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.searchObj.n20 != "") {
                criteriaRow = worksheet.addRow([" Search by State "]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              
              if ((this.searchObj.n26 != null && this.searchObj.n26 != "")|| 
              (this.searchObj.n27 != null && this.searchObj.n27 != "")||
              (this.searchObj.n29 != null && this.searchObj.n29 != "")||
              (this.searchObj.n31 != null && this.searchObj.n31 != "")) {
              criteriaRow = worksheet.addRow([" Search With Criteria "]);
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
                FileSaver.saveAs(blob, "Store_export_" + new Date().getTime() + EXCEL_EXTENSION);
              });
            }
          }
        );
      })
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
  getState() {
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'placecode/state';
      this.http.post(url, { code: "", description: "" }, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.statelist = [];
          this.criStateList = [];

          data.dataList.forEach(e => {
            this.statelist.push({ syskey: e.syskey, t2: e.t2, t3: e.t3 });
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

  async townOrVillageChange() {
    await this.getTownOrVillage({ n2: parseInt(this.townvillage), n3: this.shopObj.n22 });
    if (this.townvillage !== '0') {
      if (this.townvillage === '1') {
        this.village_wards = '1';
      } else if (this.townvillage === '2') {
        this.village_wards = '2';
      }
      this.villageWardChange();
    }
  }

  private getTownOrVillage(param) {
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'placecode/gettown';
      this.http.post(url,
        //   {n2: parseInt(this.townvillage),n3: this.shopObj.n22}, 
        param,
        this.manager.getOptions()).subscribe(
          (data: any) => {
            done();
            this.town_village_list = [];
            this.criTownList = [];

            data.townList.forEach(e => {
              this.town_village_list.push({ syskey: e.syskey, t2: e.t2, n2: e.n2 });
              this.criTownList.push({ syskey: e.syskey, t2: e.t2 });
            });

            this.town_village_list.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
            this.criTownList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
          },
          error => {
            done();
          }
        )
    })
  }
  async stateChange() {
    // this.shopObj.t11 = "";
    this.shopObj.n21 = "";
    this.shopObj.n22 = "";
    this.shopObj.n23 = "";
    this.shopObj.n24 = "";
    this.shopObj.n25 = "";
    this.dislist = [];
    this.dis = true;
    await this.getDistrict(this.shopObj.n20);
    this.dis = false;
    this.address.n21 = "";
    this.address.n22 = "";
    this.address.n23 = "";
    this.address.n24 = "";
    this.address.n25 = "";
    this.townvillage = "0";
    this.village_wards = "0";
    // this.shopObj.t11 = "";
    let chosenState = this.statelist.filter(state => {
      return state.syskey == this.shopObj.n20;
    })[0];
    this.address.n20 = chosenState != undefined ? chosenState.t2 : '';
    this.shopObj.address = this.getAddress();

    let salesOrgCode = chosenState != undefined ? chosenState.t3 : '';

    let chosenSalesOrg = this.saleOrgList.filter(sOrg => {
      return sOrg.code == salesOrgCode;
    })[0];
    this.shopObj.n26 = chosenSalesOrg != undefined ? chosenSalesOrg.syskey : '0';
    this.shopObj.t18 = chosenSalesOrg != undefined ? chosenSalesOrg.code : '';
  }

  async disChange() {
    this.township = true;
    this.shopObj.n22 = "";
    this.shopObj.n23 = 0;
    this.shopObj.n24 = "";
    this.shopObj.n25 = "";
    this.address.n22 = "";
    this.address.n23 = "";
    this.address.n24 = "";
    this.address.n25 = "";
    this.townvillage = "0";
    this.village_wards = "0";
    // this.shopObj.t11 = "";
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
    // this.shopObj.t11 = "";
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
    // this.shopObj.t11 = "";
    this.address.n23 = this.town_village_list.filter(dis => {
      return dis.syskey == this.shopObj.n23;
    })[0].t2;
    this.shopObj.address = this.getAddress();
  }

  async villageWardChange() {
    await this.getWards({ n3: this.shopObj.n23, n2: parseInt(this.village_wards) });
    this.shopObj.address = this.getAddress();
  }

  async wardChange() {
    // this.village_wards = "0";
    // this.shopObj.t11 = "";
    this.address.n24 = this.wardlist.filter(dis => {
      return dis.syskey == this.shopObj.n24;
    })[0].t2;
    this.shopObj.address = this.getAddress();
  }

  streetChange() {
    this.shopObj.address = this.getAddress();
  }

  getWards(param) {
    if (param.n3 == "0") return;
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'placecode/ward';
      this.http.post(url,
        param
        , this.manager.getOptions()).subscribe(
          (data: any) => {
            done();
            this.wardlist = [];
            this.criWardList = [];

            data.wardList.forEach(e => {
              this.wardlist.push({ syskey: e.syskey, t2: e.t2, n2: e.n2 });
              this.criWardList.push({ syskey: e.syskey, t2: e.t2, n2: e.n2 });
            });

            this.wardlist.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
            this.criWardList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
          },
          error => {
            done();
          }
        )
    })
  }

  criStateChange() {
    this.searchObj.n21 = "";
    this.searchObj.n22 = "";
    this.searchObj.n23 = "";
    this.searchObj.n24 = "";
    this.getDistrict(this.searchObj.n20);
  }

  criDistrictChange() {
    this.searchObj.n22 = "";
    this.searchObj.n23 = "";
    this.searchObj.n24 = "";
    this.getTsp(this.searchObj.n21);
  }

  criTownshipChange() {
    this.searchObj.n23 = "";
    this.searchObj.n24 = "";
    this.getTownOrVillage({ n2: "0", n3: this.searchObj.n22 });
  }

  criTownChange() {
    this.searchObj.n24 = "";
    this.getWards({ n2: "0", n3: this.searchObj.n23 });
  }

  focusFunction() {
    $('#spShopCode').css('border-color', '');
  }

  pageChanged(e) {
    this.config.currentPage = e;
    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.runSpinner(true);
    this.getShopList(currentIndex).then( ()=>{
      this.runSpinner(false);
    }).catch(()=>{ this.runSpinner(false);})
  }

  getShopListForAutoComplete() {
    this.shopNameSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.shopNameSearchAutoFill(term).subscribe(
            data => {
              this.shoplist1 = data as any[];
            });
        }
      }
    );
  }

  shopStatusChange(e, passData) {
    e.stopPropagation();
    const url = this.manager.appConfig.apiurl + 'shop/shopStatusChange';
    console.log("shop name =", this.shopObj.activate_Access);
    console.log("this.shopObj= ", JSON.stringify(this.shopObj));

    this.http.post(url, passData, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.message == "SUCCESS") {
          if (passData.n5 == "0") {
            passData.n5 = "1";
          } else if (passData.n5 == "1") {
            passData.n5 = "0";
          }

          this.manager.showToast(this.tostCtrl, "Message", "Status changed", 1000);
        } else {
          this.manager.showToast(this.tostCtrl, "Message", "Status didn't changed", 1000);
        }
      }
    );
  }

  shopPhonoControl(shopPhStatus){
    if(shopPhStatus == true){
      this.shopObj.n8 = 1;
    } else{
      this.shopObj.n8 = 0;
    }

  }

  gpsControl(gpsStatus){
   if(gpsStatus==true){
    this.shopObj.n7=1;
    }else{
  this.shopObj.n7 =0;
  }
  }

  characterOnlyValidation(event: any) {
    const pattern = /^[a-zA-Z\s-, ]+$/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  getBtnAccess() {
    const pages = this.app.appPages;
    for (let i = 0; i < pages.length; i++) {
      for (let y = 0; y < pages[i].child.length; y++) {
        if (pages[i].child[y].btns) {
          for (let z = 0; z < pages[i].child[y].btns.length; z++) {
            if (pages[i].child[y].btns[z].code === 'active' && pages[i].child[y].btns[z].status === true) {
              this.saveBtn_Access = true;
            }
            if (pages[i].child[y].btns[z].code === 'deleteShop' && pages[i].child[y].btns[z].status === true) {
              this.deleteBtn_Access = true;
            }
            if (pages[i].child[y].btns[z].code === 'exportShop' && pages[i].child[y].btns[z].status === true) {
              this.exportBtn_Access = true;
            }
            if (pages[i].child[y].btns[z].code === 'allowButton' && pages[i].child[y].btns[z].status === true) {
              this.activate_Access = true;
            }
            if (pages[i].child[y].btns[z].code === 'gps' && pages[i].child[y].btns[z].status === true) {
              this.gpsControl_Access = true;
            }
            if (pages[i].child[y].btns[z].code === 'storephone' && pages[i].child[y].btns[z].status === true) {
              this.shopPhControl_Access = true;
            }
          }
        }
      }
    }
  }

  getStoreType() {
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'shop/getStoreType';
      this.http.post(url, { code: "", description: "" }, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.storeType = data.dataList;
        },
        error => {
          done();
        }
      )
    })
  }

  dateOptionsChange() {
    let dateOption = this.manager.getDateOptions(this.searchObj.dateOptions);
    this.searchObj.fromdate = dateOption.fromDate;
    this.searchObj.todate = dateOption.toDate;
  }

  async getPartnerData() {
    const url = this.manager.appConfig.apiurl+ 'shop/getPartnerData';
    this.http.get(url, this.manager.getOptions()).subscribe((data: any) => {
      if(data.message == 'SUCCESS') {
        this.saleOrgList = data.dataList.saleOrgList;

        this.divisionList = data.dataList.divisionList;
        this.shopObj.n28  = this.divisionList[0].syskey;
        this.shopObj.t20 = this.divisionList[0].code;

        this.disChannelList = data.dataList.disChannelList;
        this.saleOfficeList = data.dataList.saleOfficeList;
        this.saleGrpList = data.dataList.saleGrpList;
        this.payTermList = data.dataList.payTermList;
        this.cusGrpList = data.dataList.cusGrpList;
        this.plantList = data.dataList.plantList;
        this.stolocList = data.dataList.stolocList;

        this.shippingList = data.dataList.shippingList;
        this.shopObj.n35 = this.shippingList[0].syskey;
        this.shopObj.t27 = this.shippingList[0].code;

        this.routeList = data.dataList.routeList;        
        this.shopObj.n36 = this.routeList[0].syskey;
        this.shopObj.t28 = this.routeList[0].code;     

        this.ptnrRoleList = data.dataList.ptnrRoleList;
      }
    });
  }

  changeOption(event, choosen) {
    if(choosen == 'sorg') {
      this.shopObj.n26 = this.saleOrgList[event.target.options.selectedIndex-1].syskey;
      this.shopObj.t18 = this.saleOrgList[event.target.options.selectedIndex-1].code;      
    } else if(choosen == 'dischanl') {
      this.shopObj.n27 = this.disChannelList[event.target.options.selectedIndex-1].syskey;
      this.shopObj.t19 = this.disChannelList[event.target.options.selectedIndex-1].code;
    } else if(choosen == 'division') {
      this.shopObj.n28 = this.divisionList[event.target.options.selectedIndex-1].syskey;
      this.shopObj.t20 = this.divisionList[event.target.options.selectedIndex-1].code;
    }else if(choosen == 'soffice') {
      this.shopObj.n29 = this.saleOfficeList[event.target.options.selectedIndex-1].syskey;
      this.shopObj.t21 = this.saleOfficeList[event.target.options.selectedIndex-1].code;
    }else if(choosen == 'sgroup') {
      this.shopObj.n30 = this.saleGrpList[event.target.options.selectedIndex-1].syskey;
      this.shopObj.t22 = this.saleGrpList[event.target.options.selectedIndex-1].code;
    }
    // else if(choosen == 'payterm') {
    //   this.shopObj.n31 = this.payTermList[event.target.options.selectedIndex-1].syskey;
    //   this.shopObj.t23 = this.payTermList[event.target.options.selectedIndex-1].code;
    // }
    else if(choosen == 'cusgrp') {
      this.shopObj.n32 = this.cusGrpList[event.target.options.selectedIndex-1].syskey;
      this.shopObj.t24 = this.cusGrpList[event.target.options.selectedIndex-1].code;
    }else if(choosen == 'plant') {
      this.shopObj.n33 = this.plantList[event.target.options.selectedIndex-1].syskey;
      this.shopObj.t25 = this.plantList[event.target.options.selectedIndex-1].code;
    }
    // else if(choosen == 'stoloc') {
    //   this.shopObj.n34 = this.stolocList[event.target.options.selectedIndex-1].syskey;
    //   this.shopObj.t26 = this.stolocList[event.target.options.selectedIndex-1].code;
    // }
    else if(choosen == 'shipping') {
      this.shopObj.n35 = this.shippingList[event.target.options.selectedIndex-1].syskey;
      this.shopObj.t27 = this.shippingList[event.target.options.selectedIndex-1].code;
    }else if(choosen == 'route') {
      this.shopObj.n36 = this.routeList[event.target.options.selectedIndex-1].syskey;
      this.shopObj.t28 = this.routeList[event.target.options.selectedIndex-1].code;
    }else if(choosen == 'ptnrRole') {
      this.shopObj.n37 = this.ptnrRoleList[event.target.options.selectedIndex-1].syskey;
      this.shopObj.t29 = this.ptnrRoleList[event.target.options.selectedIndex-1].code;
    }
  }

  houseNoChange(){
    this.shopObj.address = this.getAddress();
  }

  toggleDisChanAllSelect() {
    if (this.triggerAllDisChanSelectOption.selected) {
      this.criteria.disChanSyskey = [];
      this.criteria.disChanSyskey.push(-1);
      for (let dischan of this.disChannelList) {
        this.criteria.disChanSyskey.push(dischan.syskey)
      }
    } else {
      this.criteria.disChanSyskey = [];
    }
  }

  togglePTermAllSelect() {
    if (this.triggerAllPTermSelectOption.selected) {
      this.criteria.ptermSyskey = [];
      this.criteria.ptermSyskey.push(-1);
      for (let pterm of this.payTermList) {
        this.criteria.ptermSyskey.push(pterm.syskey)
      }
    } else {
      this.criteria.ptermSyskey = [];
    }
  }
  
  toggleSOrgAllSelect() {
    if (this.triggerAllSOrgSelectOption.selected) {
      this.criteria.sorgSyskey = [];
      this.criteria.sorgSyskey.push(-1);
      for (let sorg of this.saleOrgList) {
        this.criteria.sorgSyskey.push(sorg.syskey)
      }
    } else {
      this.criteria.sorgSyskey = [];
    }
  }
  toggleDivisionAllSelect() {
    if (this.triggerAllDivisionSelectOption.selected) {
      this.criteria.divisionSyskey = [];
      this.criteria.divisionSyskey.push(-1);
      for (let divi of this.divisionList) {
        this.criteria.divisionSyskey.push(divi.syskey)
      }
    } else {
      this.criteria.divisionSyskey = [];
    }
  }
  toggleSOfficeAllSelect() {
    if (this.triggerAllSOfficeSelectOption.selected) {
      this.criteria.sofficeSyskey = [];
      this.criteria.sofficeSyskey.push(-1);
      for (let soff of this.saleOfficeList) {
        this.criteria.sofficeSyskey.push(soff.syskey)
      }
    } else {
      this.criteria.sofficeSyskey = [];
    }
  }
}