import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AlertController, ToastController, Events, IonMenu, PopoverController, NavController, LoadingController } from '@ionic/angular';
import { HttpHeaders, HttpClient, HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';
import { AppComponent } from './app.component';
import { map } from 'rxjs/operators';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { geoContains } from 'd3-geo';
import * as CryptoJS from 'crypto-js';
import moment from 'moment';
import { SpeedTestService } from 'ng-speed-test';
declare var $: any;
declare var google: any;
@Injectable({
  providedIn: 'root'
})
export class ControllerService {
  public appConfig = this.getAppConfig();
  public user = this.getLogiUserData();
  public settingData = this.getSettingData();
  public splitPaneVisible: boolean;
  public ionMenu: IonMenu;
  public shareObj: any;
  public requestObj: any;
  public isLogin: boolean = false;
  public tranType = {
    SaleOrder: {
      code: 211, desc: 'SalesOrder'
    },
    DeliveryOrder: {
      code: 421, desc: 'DeliveryOrder'
    },
    SaleInvoice: {
      code: 231, desc: 'SaleInvoice'
    }

  }
  public backurl: string = '';

  public itemsPerPage = 20;

  public dateFormatter = {
    DTPtoDB: 1,
    UItoDB: 2,
    DBtoDTP: 3,
    DBtoUI: 4,
    DTPtoUI: 5,
    UItoDTP: 6
  };
  region_type = {
    state: 1,
    district: 2,
    township: 3,
    town: 4,
    ward: 5
  }
  region_search_obj = {
    PCODE: '',
    NAME: ''
  }
  amountStatus = [
    { code: 1, desc: "equal" },
    { code: 30, desc: "less than" },
    { code: 20, desc: "greater than" },
    { code: 21, desc: "greater than & equal" },

    // { code: 31, desc: "less than & equal" },
    { code: 32, desc: "between" }
  ]

  private constantKey: string = '!@#$29!@#$Gk**&*';
  constructor(
    public datePie: DatePipe,
    public allertController: AlertController,
    public toast: ToastController,
    public router: Router,
    public event: Events,
    public popover: PopoverController,
    public http: HttpClient,
    private speedTestService:SpeedTestService

  ) { }
  speed(){
    this.speedTestService.isOnline().subscribe(
      (isOnline) => {
        if (isOnline === false) {
          console.log('Network unavailable.');
        }else{
          console.log('Network avariable.');
        }
      }
    );
    
  }

  private getAppConfig() {
    return {
      "app": "",
      "appname": "",
      "ver": "",
      "defaultDomain": "",
      "apiurl": "",
      "languageCode": "E",
      "imgurl": '',
      "debug": false
    }

  }
  public getLogiUserData() {
    return {
      "userId": "",
      "userName": "",
      "orgId": "",
      "userSk": "0",
      "u12Sk": "0",
      "rightMenus": [],
      "usertype": 0
    }
  }
  public getUserTypeDesc(type: number): string {
    switch (type) {
      case 1: return "saleperson";
      case 2: return "delivery";
      case 3: return "surveyor";
      case 4: return "storeowner";
      default: return "N/A";
    }
  }
  public getUserTypeCode(type: string): number {
    switch (type) {
      case "saleperson": return 1;
      case "delivery": return 2;
      case "suveyer": return 3;
      case "storeowner": return 4;
      default: return 0;
    }
  }
  public getSettingData() {
    return {
      "syskey": "",
      "createddate": "",
      "modifieddate": "",
      "userid": "",
      "username": "",
      "recordStatus": 1,
      "syncStatus": 1,
      "syncBatch": 1,
      "t1": "",
      "t2": "",
      "t3": "",
      "t4": "",
      "t5": "",
      "t6": "",
      "t7": "",
      "t8": "",
      "t9": "",
      "t10": "",
      "t11": "",
      "t12": "",
      "t13": "",
      "t14": "",
      "t15": "",
      "t16": "",
      "t17": "",
      "t18": "",
      "t19": "",
      "t20": "",
      "t21": "",
      "t22": "",
      "t23": "",
      "t24": "",
      "t25": "",
      "t26": "",
      "t27": "",
      "t28": "",
      "t29": "",
      "t30": "",
      "image": "",
      "n1": "0",
      "n2": "0",
      "n3": "0",
      "n4": "0",
      "n5": "0",
      "n6": "0",
      "usersyskey": "0",
      "n7": "0",
      "n8": "0",
      "n9": "0",
      "n10": "0",
      "n11": "0",
      "n12": "0",
      "n13": "0",
      "n14": "0",
      "n15": "0",
      "t31": "",
      "n16": 0.0,
      "n17": 0,
      "n18": 0,
      "n19": 0,
      "n20": 0,
    }
  }
  
  encrypt(salt, iv, plainText) {
    var key = this.generateKey(salt, this.constantKey);
    var encrypted = CryptoJS.AES.encrypt(
      plainText,
      key,
      { iv: CryptoJS.enc.Hex.parse(iv) });
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  }

  decrypt(salt, iv, cipherText) {
    var key = this.generateKey(salt, this.constantKey);
    var cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(cipherText)
    });
    var decrypted = CryptoJS.AES.decrypt(
      cipherParams,
      key,
      { iv: CryptoJS.enc.Hex.parse(iv) });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
  getIvs() {
    return CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
  }
  generateKey(salt, passPhrase) {
    var keySize = 128;
    return CryptoJS.PBKDF2(
      passPhrase,
      CryptoJS.enc.Hex.parse(salt),
      {
        keySize: keySize / 32,
        iterations: 1000
      });

  }

  isExpire(): boolean {
    let exp_time = sessionStorage.getItem('exp_time') === null ? '' : sessionStorage.getItem('exp_time');
    if (exp_time !== '') {
      let now: Date = new Date();
      let exp: Date = this.formatDateTimeByDb(exp_time);
      if (exp <= now) {
        return true;
      } else {
        return false;
      }
    }
  }
  passwordChanged(password) {
    let obj = { "flag": false, "ret": "" };
    var strongRegex = new RegExp("^(?=.{6,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
    var mediumRegex = new RegExp("^(?=.{5,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
    var enoughRegex = new RegExp("(?=.{4,}).*", "g");

    if (false == enoughRegex.test(password)) {
      obj.ret = '<span style="font-weight:bold">More Characters</span>';
      obj.flag = true;
    } else if (strongRegex.test(password)) {
      obj.ret = '<span style="font-weight:bold;color:green">Strong!</span>';
    } else if (mediumRegex.test(password)) {
      obj.ret = '<span style="font-weight:bold;color:orange">Medium!</span>';
    } else {
      obj.ret = '<span style="font-weight:bold;color:red">Weak!</span>';
      obj.flag = true;
    }
    return obj;
  }

  formatDate(date: any, format?: string):string{
    if(date == '') return '';
    let f = '';
    if(format) f = format;
    else f = 'yyyyMMdd';
    return this.datePie.transform(date, f);
  }
  formatDate_StringToDate(dateString:string):any{
    try{
      return moment(dateString, "YYYYMMDD").toDate();
    }catch(e){
      return '';
    }
    
  }
  getCurrentDate() {
    var date = new Date();
    return date;
  }
  formatDateByDb(date: string) {
    if (date.length > 0) {
      var yyyy = date.substr(0, 4);
      var mm = date.substr(4, 2);
      if (mm.startsWith("0")) mm = mm.replace("0", "");
      var dd = date.substr(6, 2);
      if (dd.startsWith("0")) dd = dd.replace("0", "");
      return yyyy + "-" + mm + "-" + dd;
    } else {
      return '';
    }
  }
  formatDateTimeByDb(data: string): Date {
    return new Date(data.replace(
      /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
      '$4:$5:$6 $2/$3/$1'
    ));
  }

  TimezoneOffsetToDate(dateString: string) {
    return (dateString.substring(0, 10)).replace(/-/gi, "");
  }
  getSkeletonTextCount(count) {

  }
  showAlert(alc: AlertController, header: string, message: string) {
    return alc.create({
      header: header,
      message: message,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          handler: (al) => {
            return true;
          }
        }
      ]
    }
    ).then(alert => {
      alert.present();
      return alert.onDidDismiss();
    })

  }

  showConfirm(alc: AlertController, header: string, subMsg: string, message: string) {
    return new Promise<boolean>(
      (result, rej) => {
        alc.create({
          header: header,
          subHeader: subMsg,
          message: message,
          buttons: [
            {
              text: 'OK',
              handler: () => {
                result(true);
              }
            },
            {
              text: 'Cancel',
              handler: () => {
                result(false);
              }
            }
          ]
        }).then(res => {
          res.present();
        });
      }
    );
  }

  showToast(tostcontroller: ToastController, header: string, message: string, duration: number, css?) {
    return this.toast.create({
      header: header,
      message: message,
      duration: duration,
      cssClass: 'info',
      mode: "md",
      position: 'top',
      color: css ? css : 'primary'
    }).then(
      e => {
        e.present();
        return e.onDidDismiss();
      }
    )
  }
  showLoading(loadobj: LoadingController, header: string, dur: number) {
    return loadobj.create({
      message: header,
      duration: dur == 0 ? 15000 : dur,
    }).then(
      e => {
        return e;
      }
    )
  }
  roundDecimal(number, place) {
    return parseFloat(number).toFixed(place);
  }
  isLoginUser() {
    if (this.user.orgId == "") {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
  getOptions() {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Content-Over': this.user.orgId == undefined ? '' : this.user.orgId,

      }),
      withCredentials: true
    };
    return options;
  }
  getProgressOptions() {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Content-Over': this.user.orgId == undefined ? '' : this.user.orgId,

      }),
      withCredentials: true,
      observe: 'events',
      reportProgress: true,
      responseType: 'json'
    };
    return options;
  }

  checkSaveRout() {
    if (this.user.orgId == '' || this.user.orgId == "" || this.user.orgId == 'undefinied') {
      return false;
    } else return true;
  }
  async permitPagesToUser(obj) {
    let pages = obj;
    await new Promise<void>(promise => {

      if (this.user.userId != "admin") {
        for (let i = 0; i < pages.length; i++) {
          for (let y = 0; y < pages[i].child.length; y++) {
            pages[i].child[y].status = false;
            this.user.rightMenus.forEach(role => {
              if (pages[i].child[y].code === role.menu) {
                pages[i].child[y].title = role.desc;
                pages[i].child[y].status = true;
                if (pages[i].child[y].btns) {
                  for (let z = 0; z < pages[i].child[y].btns.length; z++) {
                    pages[i].child[y].btns[z].status = false;
                    role.btns.forEach(btn => {
                      if (pages[i].child[y].btns[z].code === btn.menu) {
                        pages[i].child[y].btns[z].status = true;
                      }
                    });
                  }
                }
                return;
              }
            });
          }
          pages[i].child = pages[i].child.filter(e => {
            return e.status == true;
          });
        }
        promise();
      } else {
        promise();
      }
    });
    sessionStorage.setItem('pages', JSON.stringify(pages));
    this.event.publish('pageready', pages);
  }

  controlMenu(app: AppComponent) {
    if (this.splitPaneVisible) {
      if (app.disableMenu) {
        app.disableMenu = false;
      } else {
        app.disableMenu = true;
      }
    } else {
      app.disableMenu = false;
    }
  }
  showPopOver(popover: PopoverController, page, e) {
    return popover.create({
      component: page,
      translucent: true,
      event: e,

    }).then(pop => {
      pop.present();
      return pop.onDidDismiss();
    })

  }
  valide(items: any, ignore: any): boolean {
    var result = true;
    for (let [key, value] of Object.entries(items)) {
      var myValue = (`${value}`);
      var myKey = (`${key}`);

      if (myValue === '' || myValue === undefined && !Array.isArray(myValue)) {
        if (myKey !== ignore) {
          result = false;
        }
      }
    }
    return result;
  }
  requestService() {

  }

  back() {
    if (this.backurl !== '') {
      this.router.navigate([this.backurl]);
    }
  }

  dateFormatCorrector(dateFormatFlag, changedDate):any {
    if (changedDate === "") return "";
    var fdate = new Date();
    var tdate = "";
    let y = "";
    let m = "";
    let d = "";

    if (dateFormatFlag == 1 || dateFormatFlag == 2 || dateFormatFlag == 5 || dateFormatFlag == 6) {
      if (changedDate == "Invalid Date") {
        return "false";
      }

      if (dateFormatFlag == 1 || dateFormatFlag == 5) {
        fdate = new Date(changedDate);
        let plus1 = fdate.getMonth() + 1;

        y = fdate.getFullYear().toString();
        m = (plus1 < 10) ? ("0" + plus1.toString()) : plus1.toString();
        d = (fdate.getDate().toString().length < 2) ? ("0" + fdate.getDate().toString()) : fdate.getDate().toString();
      } else {
        if (changedDate.toString().length == 10) {        //    Year, Month and Day
          y = changedDate.toString().substring(6, 10);
          m = changedDate.toString().substring(3, 5);
          d = changedDate.toString().substring(0, 2);
        } else if (changedDate.toString().length == 8) {  //    Year and Day
          y = changedDate.toString().substring(4, 8);
          m = "%";
          d = changedDate.toString().substring(0, 2);
        } else if (changedDate.toString().length == 7) {  //    Year and Month
          y = changedDate.toString().substring(3, 7);
          m = changedDate.toString().substring(0, 2);
        } else if (changedDate.toString().length == 5) {  //    Month and Day
          m = changedDate.toString().substring(3, 5);
          d = changedDate.toString().substring(0, 2);
        } else if (changedDate.toString().length == 4 || changedDate.toString().length == 2) {  //  only Year or Month or Day
          d = changedDate.toString();
        } else {
          tdate = "false";
          return tdate;
        }
      }

      if (dateFormatFlag == 1 || dateFormatFlag == 2) {
        tdate = y + "" + m + "" + d;
      } else if (dateFormatFlag == 5) {
        tdate = d + "/" + m + "/" + y;
      } else {
        tdate = m + "/" + d + "/" + y;
        fdate = new Date(tdate);
        return fdate;
      }

      if (tdate == "19700101") {
        tdate = "false";
      }

      return tdate;
    } else if (dateFormatFlag == 3) {
      tdate = changedDate;
      fdate = new Date(this.formatDateByDb(tdate));
      // fdate = new Date(tdate);

      return fdate;
    } else {
      y = changedDate.substring(0, 4);
      m = changedDate.substring(4, 6);
      d = changedDate.substring(6, 8);

      tdate = d + "/" + m + "/" + y;

      return tdate;
    }
  }

  shopCodeSearchAutoFill(term,value) {
    let url = this.appConfig.apiurl + 'shop/shoplist';

    let sn_param = { 
      "shopCode": term ,
      "shopCodeFlage": value
  };

    //let sn_param = { "shopCode": term };
    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.length != 0 ? data as any[] : [{ "shopCode": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  shopNameSearchAutoFill(term ,filter?, tsSyskey?) {
    let url = this.appConfig.apiurl + 'shop/shoplistautofill';
    let sn_param;
    if (filter) {
      sn_param = {
        "shopName": term,
        "ignoreSyskey": filter
      }
    } else if(tsSyskey) {
      sn_param = { 
        "shopName": term,
        "n22": tsSyskey,
      };
    } else {
      sn_param = { "shopName": term };
    }

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1500), map(
        (data: any) => {
          return (
            data.length != 0 ? data as any[] : [{ "shopName": "No Record Found" } as any]
          );
        }
      )
    );
    return listOfBooks;
  }
  shopCodeSearchAutoFill2(term ,filter?, tsSyskey?) {
    let url = this.appConfig.apiurl + 'shop/shoplistautofill';
    let sn_param;
    if (filter) {
      sn_param = {
        "shopCode": term,
        "ignoreSyskey": filter
      }
    } else if(tsSyskey) {
      sn_param = { 
        "shopCode": term,
        "n22": tsSyskey,
      };
    } else {
      sn_param = { "shopCode": term };
    }

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1500), map(
        (data: any) => {
          return (
            data.length != 0 ? data as any[] : [{ "shopCode": "No Record Found" } as any]
          );
        }
      )
    );
    return listOfBooks;
  }

  stockCodeSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'StockSetup/StockList';
    let param = {
      "skuCode": term,
    };

    var listOfBooks = this.http.post(url, param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (

            data.length != 0 ? data as any[] : [{ "stkCode": "No Record Found" } as any]

            // data.length != 0 ? data as any[] : [{ "skuCode": "No Record Found" } as any]

          );
        }
      )
    );

    return listOfBooks;
  }

  stockNameSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'StockSetup/StockList';
    let sn_param;

    if (typeof term == "object") {
      sn_param = term;
    } else {
      sn_param = {
        "skuName": term,
      };
    }

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.length != 0 ? data as any[] : [{ "skuName": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  questionNatureDescSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'surveyor/allQuestionNatureList';
    let sn_param = {
      "t2": term
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.length != 0 ? data.dataList as any[] : [{ "t2": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  questionTypeDescSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'surveyor/allQuestionTypeList';
    let sn_param = {
      "t2": term
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.length != 0 ? data.dataList as any[] : [{ "t2": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  questionCodeSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'surveyor/allQuestionList';
    let sn_param = {
      "t1": term,
      "t2": ""
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.length != 0 ? data.dataList as any[] : [{ "t1": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  questionDescSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'surveyor/allQuestionList';
    let sn_param = {
      "t1": "",
      "t2": term
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.length != 0 ? data.dataList as any[] : [{ "t2": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  AnswerDescSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'surveyor/SFormList';
    let sn_param = {
      "t2": term
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.length != 0 ? data.dataList as any[] : [{ "t2": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }
  userNameSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'user/userList';
    let sn_param = {
      "searchVal": term
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.length != 0 ? data.dataList as any[] : [{ "userName": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  svrHdrDescSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'surveyor/svrHdrDescSearchAutoFill';
    let sn_param = {
      "t2": term,
      "flag": "0"
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.length != 0 ? data.dataList as any[] : [{ "t2": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  categorySearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'stockcategory/searchStockCategoryList';
    let sn_param = {
      "code": "",
      "description": term,
      "descriptionType": "c"
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.length != 0 ? data.catlist as any[] : [{ "t2": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  responseBrandOwnerSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'surveyor/getResponseBrandOwner';
    let sn_param = {
      "description": term
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.length != 0 ? data.dataList as any[] : [{ "desc": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  brandOwnerSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'brandowner/brandOwnerSearchAutoFill';

    var listOfBooks = this.http.post(url, term, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          let noRecord = {
            "syskey": "No Record Found",
            "t1": "No Record Found",
            "t2": "No Record Found"
          };

          return (
            data.dataList.length != 0 ? data.dataList as any[] : [noRecord as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  // stateNameSearchAutoFill(term){
  //   let url = this.appConfig.apiurl + 'district/getdistrictautofill';
  //   let sn_param = {
  //     "statename": term
  //   };

  //   var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
  //     debounceTime(1000), map(
  //       (data: any) => {
  //         return (
  //           data.length != 0 ? data as any[] : [{ "statename": "No Record Found" } as any]
  //         );
  //       }
  //     )
  //   );

  //   return listOfBooks;
  // }
  // stateCodeSearchAutoFill(term){
  //   let url = this.appConfig.apiurl + 'district/getdistrictautofill';
  //   let sn_param = {
  //     "statecode": term
  //   };

  //   var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
  //     debounceTime(1000), map(
  //       (data: any) => {
  //         return (
  //           data.length != 0 ? data as any[] : [{ "statecode": "No Record Found" } as any]
  //         );
  //       }
  //     )
  //   );

  //   return listOfBooks;
  // }
  // districtNameSearchAutoFill(term){
  //   let url = this.appConfig.apiurl + 'district/getdistrictautofill';
  //   let sn_param = {
  //     "districtname": term
  //   };

  stateNameSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'placecode/getstate';
    let sn_param = {
      "t2": term
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.stateList.length != 0 ? data.stateList as any[] : [{ "t2": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  stateCodeSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'placecode/getstate';
    let sn_param = {
      "t1": term
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.stateList.length != 0 ? data.stateList as any[] : [{ "t1": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  districtNameSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'placecode/getdistrict';
    let sn_param = {
      "code": "",
      "description": term,
      "stateSyskey": "",
      "districtSyskey": ""
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.districtList.length != 0 ? data.districtList as any[] : [{ "t2": "No Record Found" } as any]
          );
        }
      )
    );
    return listOfBooks;
  }

  districtCodeSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'placecode/getdistrict';
    let sn_param = {
      "code": term,
      "description": "",
      "stateSyskey": "",
      "districtSyskey": ""
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.districtList.length != 0 ? data.districtList as any[] : [{ "t1": "No Record Found" } as any]
          );
        }
      )
    );
    return listOfBooks;
  }

  townshipNameSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'placecode/gettsp';
    let sn_param = {
      "code": "",
      "description": term,
      "districtSyskey": "",
      "townshipSyskey": ""
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.tspList.length != 0 ? data.tspList as any[] : [{ "t2": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  townshipCodeSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'placecode/gettsp';
    let sn_param = {
      "code": term,
      "description": "",
      "districtSyskey": "",
      "townshipSyskey": ""
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.tspList.length != 0 ? data.tspList as any[] : [{ "t1": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  townNameSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'placecode/getvillagetract_town';
    let sn_param = {
      "t2": term,
      "t1": ""
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.vt_TList.length != 0 ? data.vt_TList as any[] : [{ "t2": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  townCodeSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'placecode/getvillagetract_town';
    let sn_param = {
      "t1": term,
      "t2": ""
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.vt_TList.length != 0 ? data.vt_TList as any[] : [{ "t1": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  wardNameSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'placecode/ward';
    let sn_param = {
      "t2": term,
      "n2": ""
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.wardList.length != 0 ? data.wardList as any[] : [{ "t2": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  wardCodeSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'placecode/ward';
    let sn_param = {
      "t1": term,
      "n2": ""
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.wardList.length != 0 ? data.wardList as any[] : [{ "t1": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  villagetractNameSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'placecode/gettown';
    let sn_param = {
      "t2": term,
      "n2": "2"
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.townList.length != 0 ? data.townList as any[] : [{ "t2": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  villagetractCodeSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'placecode/gettown';
    let sn_param = {
      "t1": term,
      "n2": "2"
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.townList.length != 0 ? data.townList as any[] : [{ "t1": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  tspNameSearchAutoFill(statesyskey, term) {
    let url = this.appConfig.apiurl + 'placecode/getTownship';
    let sn_param = { "township": term, "statesyskey": statesyskey };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.tspList.length != 0 ? data.tspList as any[] : [{ "t2": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  characteristicSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'shop/getAutoFilledCharacterDesc';
    let sn_param = {
      "description": term
    };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.dataList.length != 0 ? data.dataList as any[] : [{ "CharacteristicDesc": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  disTypeSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'PromoAndDiscount/disTypeSearchAutoFill';

    var listOfBooks = this.http.post(url, term, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          let noRecord = {
            "syskey": "No Record Found",
            "t1": "No Record Found",
            "t2": "No Record Found"
          };

          return (
            data.length != 0 ? data.dataList as any[] : [noRecord as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  volDisSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'PromoAndDiscount/volDisSearchAutoFill';

    var listOfBooks = this.http.post(url, term, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          let noRecord = {
            "syskey": "No Record Found",
            "t1": "No Record Found",
            "t2": "No Record Found"
          };

          return (
            data.dataList.length != 0 ? data.dataList as any[] : [noRecord as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  disItemGiftSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'Gift/getGift';

    var listOfBooks = this.http.post(url, term, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          let noRecord = {
            "syskey": "No Record Found",
            "t1": "No Record Found",
            "t2": "No Record Found"
          };

          data.giftdata = data.giftdata.filter(gD => {
            return gD.n2.toString() == "0";
          });

          return (
            data.giftdata.length != 0 ? data.giftdata as any[] : [noRecord as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  disItemCouponSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'coupon/getcoupon';

    var listOfBooks = this.http.post(url, term, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          let noRecord = {
            "syskey": "No Record Found",
            "t1": "No Record Found",
            "t2": "No Record Found"
          };

          data.CouponList = data.CouponList.filter(gD => {
            return gD.n2.toString() == "0";
          });

          return (
            data.CouponList.length != 0 ? data.CouponList as any[] : [noRecord as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  routeNameSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'surveyor/getregion';

    var listOfBooks = this.http.post(url, term, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          let noRecord = {
            "syskey": "No Record Found",
            "t4": "No Record Found",
            "t2": "No Record Found"
          };

          return (
            data.RegionList.length != 0 ? data.RegionList as any[] : [noRecord as any]
          );
        }
      )
    );

    return listOfBooks;
  }

  getDiscountByShop() {

  }

  getDateOptions(type): { fromDate: any, toDate: any } {
    let dateOption;
    if (type == "today") {
      dateOption =
      {
        fromDate: new Date(),
        toDate: new Date()
      }
      return dateOption;
    }
    else if (type == "yesterday") {
      dateOption =
      {
        fromDate: moment().subtract(1, 'days').toDate(),
        toDate: moment().subtract(1, 'days').toDate()
      }
      return dateOption;
    }
    else if (type == "this_week") {
      dateOption =
      {
        fromDate: moment().startOf('week').toDate(),
        toDate: moment().endOf('week').toDate()
      }
      return dateOption;
    }
    else if (type == "last_week") {
      dateOption =
      {
        fromDate: moment().subtract(1, 'week').startOf('week').toDate(),
        toDate: moment().subtract(1, 'week').endOf('week').toDate()
      }
      return dateOption;
    }
    else if (type == "this_month") {
      dateOption =
      {
        fromDate: moment().startOf('month').toDate(),
        toDate: moment().endOf('month').toDate()
      }
      return dateOption;
    }
    else if (type == "last_month") {
      dateOption =
      {
        fromDate: moment().subtract(1, 'month').startOf('month').toDate(),
        toDate: moment().subtract(1, 'month').endOf('month').toDate()
      }
      return dateOption;
    } else {
      dateOption =
      {
        fromDate: "",
        toDate: ""
      }
      return dateOption;
    }
  }
  getDateDuration(startDate: Date, dateOption: string, duration: number): { fromDate: any, toDate: any } {
    let stDate = startDate;
    if (dateOption === 'FUTURE') {
      /* future */
      return {
        'fromDate': stDate,
        'toDate': moment(stDate).add(duration, 'days')
      }
    } else {
      /* past */
      return {
        'fromDate': moment(stDate).subtract(duration, 'days'),
        'toDate': stDate
      }
    }

  }

  userSearchAutoFill(term) {
    let url = this.appConfig.apiurl + 'shopPerson/getUser';
    let sn_param = { "userName": term };

    var listOfBooks = this.http.post(url, sn_param, this.getOptions()).pipe(
      debounceTime(1000), map(
        (data: any) => {
          return (
            data.dataList.length != 0 ? data.dataList as any[] : [{ "userName": "No Record Found" } as any]
          );
        }
      )
    );

    return listOfBooks;
  }
  //--GeoCoding area--
  openlocEncode(lat, lng, length?): string {
    let OpenLocationCode = require('open-location-code').OpenLocationCode;
    let openLocationCode = new OpenLocationCode();
    return openLocationCode.encode(lat, lng, length ? length : 11);
  }
  openlocDecode(pluscode: string) {
    let OpenLocationCode = require('open-location-code').OpenLocationCode;
    let openLocationCode = new OpenLocationCode();
    let coord = openLocationCode.decode(pluscode);
    return coord;
  }
  fixLengthPlusCodeByLength(pluscode, length: string) {
    let pluscode_len = pluscode.length;
    if (pluscode_len == parseInt(length) && pluscode_len !== 9) {
      if (pluscode_len == 4) {
        return pluscode.concat('0000+');
      } else if (pluscode_len == 6) {
        return pluscode.concat('00+');
      }
    }
    if (length == '10') {
      return pluscode.substr(0, 11);
    } else if (length == '8') {
      return pluscode.substr(0, 8) + '+';
    } else if (length == '6') {
      return pluscode.substr(0, 6);
    } else if (length == '4') {
      return pluscode.substr(0, 4);
    }
    return pluscode;

  }
  setMaker(location, my_map) {
    return new google.maps.Marker({ position: location, map: my_map });
  }
  setInfoWindow(message) {
    return new google.maps.InfoWindow({
      content: message
    });

  }
  removeMaker(marker) {
    marker.setMap(null);
  }

  createPopup(location, container: HTMLElement) {
    class Popup extends google.maps.OverlayView {

      position: any;
      containerDiv: any;

      constructor(position, content) {
        super();
        this.position = position;

        content.classList.add("popup-bubble");

        // This zero-height div is positioned at the bottom of the bubble.
        const bubbleAnchor = document.createElement("div");
        bubbleAnchor.classList.add("popup-bubble-anchor");
        bubbleAnchor.appendChild(content);

        // This zero-height div is positioned at the bottom of the tip.
        this.containerDiv = document.createElement("div");
        this.containerDiv.classList.add("popup-container");
        this.containerDiv.appendChild(bubbleAnchor);

        // Optionally stop clicks, etc., from bubbling up to the map.
        Popup.preventMapHitsAndGesturesFrom(this.containerDiv);
      }

      /** Called when the popup is added to the map. */
      onAdd() {
        this.getPanes().floatPane.appendChild(this.containerDiv);
      }

      /** Called when the popup is removed from the map. */
      onRemove() {
        if (this.containerDiv.parentElement) {
          this.containerDiv.parentElement.removeChild(this.containerDiv);
        }
      }

      /** Called each frame when the popup needs to draw itself. */
      draw() {
        const divPosition = this.getProjection().fromLatLngToDivPixel(
          this.position
        );

        // Hide the popup when it is far out of view.
        const display =
          Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000
            ? "block"
            : "none";

        if (display === "block") {
          this.containerDiv.style.left = divPosition.x + "px";
          this.containerDiv.style.top = divPosition.y + "px";
        }

        if (this.containerDiv.style.display !== display) {
          this.containerDiv.style.display = display;
        }
      }
    }
    return new Popup(location, container);

  }
  setRentagle(my_map, bound) {
    return new google.maps.Rectangle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: my_map,
      bounds: bound,
      clickable: true,
    });
  }
  remove_Rentagle(rs) {
    for (let i = 0; i < rs.length; i++) {
      google.maps.event.clearListeners(rs[i], 'click');
      rs[i].setMap(null);
    }
  }
  remove_Markers(markerlist) {
    for (let i = 0; i < markerlist.length; i++) {
      markerlist[i].setMap(null);
    }
  }

  setCircle(p_center, rad, m) {
    const cityCircle = new google.maps.Circle({
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
      map: m,
      center: p_center,
      radius: rad
    });
  }
  removeCircle(list) {
    for (let i = 0; i < list.length; i++) {
      list[i].setMap(null);
    }
  }
  haversine_distance(loc1, loc2) {
    var R = 6371.0710; // Radius of the Earth in kilo
    var rlat1 = loc1.lat * (Math.PI / 180); // Convert degrees to radians
    var rlat2 = loc2.lat * (Math.PI / 180); // Convert degrees to radians
    var difflat = rlat2 - rlat1; // Radian difference (latitudes)
    var difflon = (loc2.lng - loc1.lng) * (Math.PI / 180); // Radian difference (longitudes)
    //kilo
    var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)));
    return d;
  }
  rad(x) {
    return x * Math.PI / 180;
  };
  get_region_search_obj(pcode?, name?) {
    return {
      PCODE: pcode ? pcode : '',
      NAME: name ? name : ''
    }
  }

  getDistance(p1, p2) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = this.rad(p2.lat - p1.lat);
    var dLong = this.rad(p2.lng - p1.lng);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.rad(p1.lat)) * Math.cos(this.rad(p2.lat)) *
      Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter
  };
  private get_corrdinate(features, result) {
    for (let y = 0; y < features.geometry.coordinates.length; y++) {
      let sub = [];
      for (let x = 0; x < features.geometry.coordinates[y].length; x++) {
        let a = features.geometry.coordinates[y][x];
        for (let z = 0; z < a.length; z++) {
          let rs = a[z];
          sub.push({ lat: rs[1], lng: rs[0] });
        }
      }
      result.push(sub);
    }
  }
  async get_state_data(PCODE?) {
    let states: any;
    await new Promise<void>(p => {
      this.http.get('assets/resources/state.json').subscribe(
        (data: any) => {
          states = (data);
          p();
        },
        error => {
          p();
        }
      )
    })
    if (PCODE && PCODE !== '') {
      let filter = states.features.filter(f => {
        return f.properties.ST_PCODE === PCODE;
      })
      let geojson: any = {
        crs: '',
        features: [],
        totalFeatures: 0,
        type: ''
      };
      geojson.crs = states.crs;
      geojson.features = filter;
      geojson.totalFeatures = filter.length;
      geojson.type = states.type;
      return geojson;
    } else {
      return states;
    }

  }

  async get_district_data(pcode?) {
    let dist: any;
    await new Promise<void>(p => {
      this.http.get('assets/resources/district.json').subscribe(
        (data: any) => {
          dist = (data);
          p();
        },
        error => {
          p();
        }
      )
    })
    if (pcode) {
      let filter = dist.features.filter(d => {
        return d.properties.DT_PCODE.includes(pcode);
      });
      let geojson: any = {
        crs: '',
        features: [],
        totalFeatures: 0,
        type: ''
      };
      geojson.crs = dist.crs;
      geojson.features = filter;
      geojson.totalFeatures = filter.length;
      geojson.type = dist.type;
      return geojson;
    } else {
      return dist;
    }

  }
  async get_tsp_data(pcode?) {
    let tsp: any;
    await new Promise<void>(p => {
      this.http.get('assets/resources/tsp.json', {
        reportProgress: true,
        responseType: 'json',
        observe: "events"
      }).subscribe(
        (data: any) => {
          let status = this.getStatusMessage(data);
          if (status.response) {
            tsp = status.body.body;
            console.log(status)
            p();
          } else {
            console.log(status)
          }

        },
        error => {
          p();
        }
      )


    })
    if (pcode) {
      let filter = tsp.features.filter(d => {
        return d.properties.TS_PCODE.includes(pcode);
      });
      let geojson: any = {
        crs: '',
        features: [],
        totalFeatures: 0,
        type: ''
      };
      geojson.crs = tsp.crs;
      geojson.features = filter;
      geojson.totalFeatures = filter.length;
      geojson.type = tsp.type;
      return geojson;
    } else {
      return tsp;
    }

  }
  getStatusMessage(event) {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        const status = (Math.round(100 * event.loaded / event.total));
        return {
          progress: status * 0.01,
          progressHund: status,
          progressLoaded: Math.round(event.loaded * 0.000001),
          totalProgress: Math.round(event.total * 0.000001),
          response: false
        }
      case HttpEventType.DownloadProgress: {
        const status = (Math.round(100 * event.loaded / event.total));
        return {
          progress: status * 0.01,
          progressHund: status,
          progressLoaded: Math.round(event.loaded * 0.000001),
          totalProgress: Math.round(event.total * 0.000001),
          response: false
        }
      }
      case HttpEventType.Response:
        return {
          body: event,
          response: true
        }
      default: return {
        progress: 0,
        progressHund: 0,
        progressLoaded: 0,
        totalProgress: 0,
        response: false
      }
    }
  }
  draw_polygon(map, latlngbound, index) {

    let polygon = new google.maps.Polygon({
      paths: latlngbound,
      strokeColor: "#FF0000",
      strokeOpacity: 1,
      strokeWeight: 1,
      fillColor: "#FF0000",
      fillOpacity: 0.0,
      clickable: true,
      setEditable: true,
      indexID: index
    })
    polygon.setMap(map);
    return polygon;
  }
  remove_polygon(pl) {
    pl.foreach(p => {
      p.setMap(null);
    })
  }
  is_point_in_polygon(latlnglateral, poly): boolean {
    let p = new google.maps.geometry.poly;
    return p.containsLocation(latlnglateral, poly);
  }
  add_pluscode_grid(map) {
    // Define an image map overlay in black.
    var roadmapOverlay = new google.maps.ImageMapType({
      getTileUrl: function (coord, zoom) {
        // Using WMS tile numbering.
        return ['https://grid.plus.codes/grid/wms/', zoom, '/', coord.x, '/', coord.y, '.png'].join('');
      },
      tileSize: new google.maps.Size(256, 256)
    });
    // Define an image map overlay in white.
    var satelliteOverlay = new google.maps.ImageMapType({
      getTileUrl: function (coord, zoom) {
        // Using WMS tile numbering.
        return ['https://grid.plus.codes/grid/wms/', zoom, '/', coord.x, '/', coord.y, '.png?col=white'].join('');
      },
      tileSize: new google.maps.Size(256, 256)
    });
    // Add the overlay to the map.
    map.overlayMapTypes.push(roadmapOverlay);

    // Change the overlay when the map type changes.
    map.addListener('maptypeid_changed', () => {
      map.overlayMapTypes.pop();
      if (map.getMapTypeId() == google.maps.MapTypeId.SATELLITE ||
        map.getMapTypeId() == google.maps.MapTypeId.HYBRID) {
        map.overlayMapTypes.push(satelliteOverlay);
      } else {
        map.overlayMapTypes.push(roadmapOverlay);
      }
    });
  }
  getPosition(): Promise<any> {
    return new Promise((resolve, reject) => {

      navigator.geolocation.getCurrentPosition(resp => {

        resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
      },
        err => {
          reject(err);
        });
    });

  }
  latLngService(latlng: { lat, lng }, plulen: number) {
    let plusCode = this.openlocEncode(latlng.lat, latlng.lng, plulen);
    const areaCode = this.openlocDecode(plusCode);
    const sw = { lat: areaCode.latitudeLo, lng: areaCode.longitudeLo };
    const ne = { lat: areaCode.latitudeHi, lng: areaCode.longitudeHi };
    const center = { lat: areaCode.latitudeCenter, lng: areaCode.longitudeCenter }
    return {
      pluscode: plusCode,
      bounds: new google.maps.LatLngBounds(sw, ne),
      sw: sw,
      ne: ne,
      center: center
    }
  }
  latLngServiceByPluscode(param_plusCode: string) {
    let plusCode = '';
    if (param_plusCode.length == 4) {
      plusCode = param_plusCode.concat('0000+');
    } else if (param_plusCode.length == 6) {
      plusCode = param_plusCode.concat('00+');
    } else {
      plusCode = param_plusCode;
    }
    const areaCode = this.openlocDecode(plusCode);
    const sw = { lat: areaCode.latitudeLo, lng: areaCode.longitudeLo };
    const ne = { lat: areaCode.latitudeHi, lng: areaCode.longitudeHi };
    const center = { lat: areaCode.latitudeCenter, lng: areaCode.longitudeCenter }
    return {
      pluscode: plusCode,
      bounds: new google.maps.LatLngBounds(sw, ne),
      sw: sw,
      ne: ne,
      center: center
    }
  }
  isContain(geoJson, latLng) {
    var features = geoJson.features;
    for (let i = 0; i < features.length; i++) {
      if (geoContains(features[i].geometry, latLng)) {
        return {
          geojson: features[i],
          status: true
        };
      }
    }
    return {
      geojson: [],
      status: false

    };
  }

  setSearchKeyAndRoute(searchObj: Object) {
    localStorage.setItem('searchObj', JSON.stringify(searchObj));
  }

  getSearchKeyAndRoute() {
    return JSON.parse(localStorage.getItem('searchObj'));
  }
  getVolDiscount({
    itemTotalAmount,
    itemAmount,
    itemQty,
    itemSyskey,
    shopSyskey,
    date
  }) {
    let param = {
      itemTotalAmount: itemTotalAmount,
      itemAmount: itemAmount,
      itemQty: itemQty,
      itemSyskey: itemSyskey,
      itemDesc: "",
      shopSyskey: shopSyskey,
      date: date
    }
    console.log(param)
    const url = this.appConfig.apiurl + 'PromoAndDiscount/getVolDisCalculation';
    return this.http.post(url, param, this.getOptions());
  }
  getVolDiscount2(param) {
    console.log('single_dis_request', param)
    return new Promise((done, reject) => {
      const url = this.appConfig.apiurl + 'PromoAndDiscount/getVolDisCalculation-multi';
      return this.http.post(url, param, this.getOptions()).subscribe(
        (data) => {
          console.log('single_dis_return', data)
          done(data);
        },
        error => {
          reject(error);
        }
      )
    })

  }

  getInvoiceDiscount(shopid: string, boSyskey: string, total: number) {
    const url = this.appConfig.apiurl + 'PromoAndDiscount/getInvDisCalculation';
    const param = {
      'shopSyskey': shopid,
      'Total': total,
      'boSyskey': boSyskey
    }
    console.log(param)
    return this.http.post(url, param, this.getOptions());
  }

  calculateDiscount(total: number, percent: number, fixedPoint: number): number {
    if (percent == 0) return total;
    let discount = (total * percent) / 100;
    // const finRes = parseFloat(discount.toFixed(fixedPoint));
    const finRes = discount;
    console.log(finRes);
    return finRes;
  }
  calculateNetDiscount(total: number, percent: number, fixedPoint: number) {
    if (percent == 0) return total;
    const finRes = total - this.calculateDiscount(total, percent, fixedPoint);
    console.log(finRes);
    return finRes;
  }
  downloadPriceZone(date, storeSyskey) {
    return new Promise((done, reject) => {
      const url = this.appConfig.apiurl + 'pricezone/getPriceZoneDownload';
      this.http.post(url, {
        "date": date,
        "shopSyskey": storeSyskey
      }, this.getOptions()).subscribe(
        (data: any) => {
          if (data.message == 'SUCCESS') {
            done(data.dataList);
          } else {
            reject();
          }
        }, error => {
          reject();
        })
    })
  }
  getPriceChangeDetailDownload(date, storeId, zoneSyskey) {
    return new Promise((done, reject) => {
      const url = this.appConfig.apiurl + 'pricezone/get-pricezonedetail';
      this.http.post(url, {
        "date": date,
        "storeSyskey": storeId,
        "stockSyskey": "0",
        'stockList': [],
        "zoneSyskey": zoneSyskey

      }, this.getOptions()).subscribe(
        (data: any) => {
          if (data.status == 'SUCCESS') {
            done(data.dataList);
          } else {
            reject();
          }
        }, error => {
          reject();
        })
    })
  }
  getMultiDiscount(obj) {
    return new Promise((ok, reject) => {
      const url = this.appConfig.apiurl + 'PromoAndDiscount/getVolDisMultiRuleCalculation';
      this.http.post(url, obj, this.getOptions()).subscribe(
        (data: any) => {
          ok(data);
        },
        error => {
          reject();
        }
      )

    })

  }
  calculateMultiDiscount3(multiParam, shopSyskey, date) {
    return new Promise((done, reject) => {
      let obj = {
        "itemInfoList": multiParam.map(s => {
          return {
            "itemSyskey": s.n1,
            "itemDesc": s.t3,
            "itemAmount": s.n10.toString(),
            "itemTotalAmount": (s.n10 * s.n6).toString(),
            "itemQty": s.n6.toString()
          }
        }),
        "shopSyskey": shopSyskey,
        "date": date
      }
      console.log("multidis_req:",obj)
      this.getMultiDiscount(obj).then(
        (rtn: any) => {
          console.log("multidis_resp:",rtn)
          if (rtn.message == 'SUCCESS') {
            done(rtn.data);
          } else {
            reject();
          }
        },
        error => {
          reject();
        }
      ).catch(() => {
        reject();
      });

    })

  }
  groupArrayIntoOneArray(_data) {
    var todosByValue = _data.reduce(function (hash, todo) {
      if (!hash.hasOwnProperty(todo.ref3)) hash[todo.ref3] = [];
      hash[todo.ref3].push(todo);
      return hash;
    }, {});

    return Object.keys(todosByValue).map(function (key) {
      return todosByValue[key];
    });
  }
  async getUserListByCri(cri: {
    userType: number,
    otherId: string,
    status: string,
    userId: string,
    userName: string,
    syskey: string,
    gender: string,
    dob: string,
    nrc: string,
    teamtype: string
  }) {
    const url = this.appConfig.apiurl + 'user/userReportList';

    return new Promise( (obs,rej)=>{
      this.http.post(url, cri, this.getOptions()).subscribe(
      (data: any) => {
        let _array = data.dataList.map(u => {
          u.usertype = this.getUserTypeDesc(u.userType);
          return u;
        });
        obs(_array.sort((a, b) => (a.userName > b.userName) ? 1 : -1));
      },
      error => {
        rej();
      }
    );
    })
     
  }
  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

}







