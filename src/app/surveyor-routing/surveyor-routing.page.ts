import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient } from '@angular/common/http';
import { AlertController, ModalController, NavParams, IonBackButton, ToastController, LoadingController, NavController, IonContent } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

declare var $: any;
var date = new Date();
var lastDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

@Component({
  selector: 'app-surveyor-routing',
  templateUrl: './surveyor-routing.page.html',
  styleUrls: ['./surveyor-routing.page.scss'],
})
export class SurveyorRoutingPage implements OnInit {
  
  config =  {
    id: "listPagiantion",
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  userConfig =  {
    id: "userPagiantion",
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };

  region_list: any = [];

  statelist: any = [];
  district_list: any = [];
  town_village_list: any = [];
  tsp_list: any = [];
  wardlist: any = [];

  surveyorheaderlist: any = [];
  allsurveyorheaderlist: any = [];

  _users: any = [];
  _assignedusers: any = [];
  _allassignedusers: any = [];

  saveData: any = this.getSaveData();
  surveyrouting: any = this.getSvrRoutingData();

  btn: any = false;
  detailFlat: any = false;
  state: any = true;
  dis: any = true;
  township: any = true;
  town_village: any = true;
  ward: any = true;
  newmodel: any = false;
  existmodel: any = false;
  flagmodel: any = false;
  isLoading = false;

  townvillage: any = "0";
  searchsurveyor: any = "";
  filterkey: any = 0;
  filterstatuskey: any = 0;

  spinner: boolean = false;
  searchtab: boolean = false;
  disNewUser: boolean = false;

  criteria: any = this.getCriteriaData();
  searchCriteria: any = this.getCriteriaData();

  routeNameList: any = [];
  routeNameSearch: FormControl = new FormControl();
  

  constructor(
    public manager: ControllerService,
    public http: HttpClient,
    public alertCtrl: AlertController,
    public activeRoute: ActivatedRoute,
    private modalCtrl: ModalController,
    private router: Router,
    private navCtrl: NavController,
    private tostCtrl: ToastController,
    private alerttCtrl: AlertController,
    private loadCtrl: LoadingController,
    public dialog: MatDialog
  ) {
    this.loadCtrl.create(
      {
        message: 'Processing...',
        duration: 10000
      }
    );
  }
  

  ngAfterViewInit(): void {
    this.routeNameSearch.valueChanges.subscribe(
      (search:string)=>{
        if(search == ""){
          this.routeNameList = [];
        }
      }
    )
  }

  ngOnInit() {
    
  }
  
  ionViewWillEnter() {
    $("#shop-new-survey").hide();
    $("#shop-list-survey").show();
    $("#shop-list-survey-tab").tab("show");
    this.clearProperties();
    this.runSpinner(true);
    this.getAllDataList();
    this.allList();
    this.runSpinner(false);
  }

  listTab(){
    $("#shop-new-survey").hide();
    $("#shop-list-survey").show();
    $("#shop-list-survey-tab").tab("show");
    this.clearProperties();
    this.getAllDataList();
  }

  newTab(){
    $("#shop-new-survey").show();
    $("#shop-list-survey").hide();
    $("#shop-new-survey-tab").tab("show");

    this.clearProperties();
    this.userConfig =  {
      id: "userPagiantion",
      itemsPerPage: this.manager.itemsPerPage,
      currentPage: 1,
      totalItems: 0
    };

    this.btn = true;

    this.surveyorHeaderList("");
    this.state = true;
    this.getState("");
    this.state = false;
  }

  advanceSearch(option) {
    this.searchtab = option;
  }

  runSpinner(t: boolean) {
    this.spinner = t;
  }

  dateChange1(event){
    let tempFromDate = new Date(event.target.value);
    let tempTodayDate = new Date();

    tempFromDate.setHours(0, 0, 0, 0);
    tempTodayDate.setHours(0, 0, 0, 0);

    if (+tempTodayDate > +tempFromDate) {
      this.manager.showToast(this.tostCtrl, "Message", "From Date must not be sooner than Today Date", 5000);
      this.saveData.t1 = "";
      event.target.value = "";
      // $("#validFD").val("").trigger("change");
    } else if(this.saveData.t2 != "" || this.saveData.t2 != undefined){
      let tempToDate = new Date(this.saveData.t2);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.manager.showToast(this.tostCtrl, "Message", "From Date must be sooner than To Date", 5000);
        this.saveData.t1 = "";
        this.saveData.t2 = "";
      }
    }
  }

  dateChange2(event){
    let tempFromDate = new Date(this.saveData.t1);
    let tempToDate = new Date(event.target.value);
    let tempTodayDate = new Date();

    tempFromDate.setHours(0, 0, 0, 0);
    tempToDate.setHours(0, 0, 0, 0);
    tempTodayDate.setHours(0, 0, 0, 0);

    if(this.saveData.t1 == "" || this.saveData.t1 == undefined){
      this.saveData.t2 = "";
      event.target.value = "";
      // $("#validTD").val("").trigger("change");
      this.manager.showToast(this.tostCtrl, "Message", "Add From Date First", 2000);
      return;
    }

    if (+tempFromDate > +tempToDate) {
      this.saveData.t2 = "";
      event.target.value = "";
      // $("#validTD").val("").trigger("change");
      this.manager.showToast(this.tostCtrl, "Message", "To Date must be later than From Date", 3000);
      return;
    }

    if (+tempTodayDate > +tempToDate) {
      this.manager.showToast(this.tostCtrl, "Message", "To Date must not be sooner than Today Date", 5000);
      
      this.disNewUser = true;
      this.saveData.t2 = "";
      event.target.value = "";
      
      if(this.detailFlat){
        this.saveData.t2 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoDTP, this.saveData.lastToDate);
        event.target.value = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoDTP, this.saveData.lastToDate);
      }

      return;
    }

    this.disNewUser = false;
  }

  dateChange3(event){
    if(this.criteria.toDate != "" || this.criteria.toDate != undefined){
      let tempFromDate = new Date(event.target.value);
      let tempToDate = new Date(this.criteria.toDate);

      tempFromDate.setHours(0, 0, 0, 0);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.manager.showToast(this.tostCtrl, "Message", "From Date must be sooner than To Date", 5000);
        this.criteria.fromDate = "";
        this.criteria.toDate = "";
      }
    }
  }

  dateChange4(event){
    if(this.criteria.fromDate == "" || this.criteria.fromDate == undefined){
      this.criteria.toDate = "";
      $("#tDate").val("").trigger("change");
      this.manager.showToast(this.tostCtrl, "Message", "Add From Date First", 2000);
    } else {
      let tempFromDate = new Date(this.criteria.fromDate);
      let tempToDate = new Date(event.target.value);

      tempFromDate.setHours(0, 0, 0, 0);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.criteria.toDate = "";
        $("#tDate").val("").trigger("change");
        this.manager.showToast(this.tostCtrl, "Message", "To Date must be later than From Date", 3000);
      }
    }
  }

  dblClickFunc1(){
    this.saveData.t1 = "";
    this.saveData.t2 = "";
  }

  dblClickFunc2(){
    this.saveData.t2 = "";

    if(this.detailFlat){
      this.saveData.t2 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoDTP, this.saveData.lastToDate);
    }
  }

  dblClickFunc3(){
    this.criteria.fromDate = "";
    this.criteria.toDate = "";
  }

  dblClickFunc4(){
    this.criteria.toDate = "";
  }

  getState(districtN3) {
    const url = this.manager.appConfig.apiurl + 'placecode/getstate';
    let param = {
      code: "",
      description: "",
      syskey: districtN3,    //  State Syskey
      districtSyskey: ""
    };

    // return new Promise(done => {
      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.statelist = [];

          data.stateList.forEach(e => {
            this.statelist.push({ syskey: e.syskey, t1: e.t1, t2: e.t2 });
          });
          this.statelist.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);

          if (districtN3 != "") {
            this.surveyrouting.state = this.statelist[0].syskey;
          }

          // done();
        },
        error => {
          // done();
        }
      );
    // });
  }

  getDistrict(state, tsN3) { //n3 => getdistrict by township
    const url = this.manager.appConfig.apiurl + 'placecode/getdistrict';
    let param = {
      code: "",
      description: "",
      stateSyskey: state,
      districtSyskey: tsN3
    };

    // return new Promise(done => {
      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.district_list = [];

          data.districtList.forEach(e => {
            this.district_list.push({ syskey: e.syskey, t1: e.t1, t2: e.t2, n3: e.n3 });
          });
          this.district_list.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);

          if (tsN3 != "") {
            this.surveyrouting.district = this.district_list[0].syskey;
          }

          if(this.detailFlat){
            this.state = true;
            this.getState(this.district_list[0].n3);
            this.state = false;
          }

          // done();
        },
        error => {
          this.district_list.push({ syskey: "", t1: "", t2: "", n3: "" });
          // done();
        }
      );
    // });
  }

  getTsp(dis, township) {
    const url = this.manager.appConfig.apiurl + 'placecode/gettsp';
    let param = {
      code: "",
      description: "",
      townshipSyskey: township,
      districtSyskey: dis
    };

    // return new Promise(done => {
      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.tsp_list = [];
          data.tspList.forEach(e => {
            this.tsp_list.push({ syskey: e.syskey, t1: e.t1, t2: e.t2, n3: e.n3 });
          });
          this.tsp_list.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);

          if (township != "") {
            this.surveyrouting.township = this.tsp_list[0].syskey;
          }

          if(this.detailFlat){
            this.dis = true;
            this.getDistrict("", this.tsp_list[0].n3);
            this.dis = false;
          }
          
          this.township = false;

          // done();
        },
        error => {
          this.township = false;
          this.tsp_list.push({ syskey: "", t1: "e.t1", t2: "", n3: "" });
          // done();
        }
      );
    // });
  }

  getTownOrVillage(param) {
    const url = this.manager.appConfig.apiurl + 'placecode/gettown';

    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.town_village_list = [];

        data.townList.forEach(e => {
          this.town_village_list.push({ syskey: e.syskey, t2: e.t2, n2: e.n2 });
        });
        this.town_village_list.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
      },
      error => {
        
      }
    );
  }

  getWards(param) {
    const url = this.manager.appConfig.apiurl + 'placecode/ward';

    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.wardlist = [];
        data.wardList.forEach(e => {
          this.wardlist.push({ syskey: e.syskey, t2: e.t2, n2: e.n2 });
        });
        this.wardlist.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
      },
      error => {

      }
    );
  }

  stateChange() {
    this.district_list = [];
    this.tsp_list = [];
    this.town_village_list = [];
    this.wardlist = [];
    this.saveData.n1 = "";
     this.routeNameSearch.setValue("")

    this.surveyrouting.district = "";
    this.surveyrouting.township = "";
    this.surveyrouting.townorvillagetract = "";
    this.surveyrouting.ward = "";
    this.townvillage = "0";

    this.dis = true;
    this.getDistrict(this.surveyrouting.state, "");
    this.dis = false;
  }

  disChange() {
    this.tsp_list = [];
    this.town_village_list = [];
    this.wardlist = [];
    this.saveData.n1 = "";

    this.surveyrouting.township = "";
    this.surveyrouting.townorvillagetract = "";
    this.surveyrouting.ward = "";
    this.townvillage = "0";

    this.township = true;
    this.getTsp(this.surveyrouting.district, "");
    this.township = false;
  }

  tspChange() {
    this.town_village_list = [];
    this.wardlist = [];

    this.surveyrouting.townorvillagetract = "";
    this.surveyrouting.ward = "";
    this.townvillage = "0";

    this.saveData.n1 = this.surveyrouting.township;
  }

  selectTownOrVillagetract() {
    this.wardlist = [];

    this.surveyrouting.ward = "";

    this.town_village = true;

    let param = {
      n2: this.townvillage,
      n3: this.surveyrouting.township
    };

    this.getTownOrVillage(param);

    this.town_village = false;
  }

  townVillagetractChange() {
    let param = {
      n2: this.townvillage,
      n3: this.surveyrouting.townorvillagetract
    };

    this.ward = true;
    this.getWards(param);
    this.ward = false;
  }

  showaddUserModalForm(){
    if(this.detailFlat && this.disNewUser){
      this.manager.showToast(this.tostCtrl, "Message", "Choose valid ToDate to add new users", 2000);
    } else {
      this.isLoading = true;

      $('#userModalList').appendTo("body").modal('show');
  
      let param: any = {
        searchVal: ""
      };
  
      const url = this.manager.appConfig.apiurl + 'user/getUserListForSvrRouting';
  
      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          let user = data.dataList.filter(el => el.usertype == "3");
          let tempUsers = {
            "syskey": "",
            "userName": "",
            "userId": "",
          };
  
          this._users = [];
  
          user.forEach(el => {
            tempUsers = {
              "syskey": el.syskey,
              "userName": el.userName,
              "userId": el.userId,
            };
  
            this._users.push(tempUsers);
          });
  
          for (var i = 0; i < this._allassignedusers.length; i++) {
            for (var ii = 0; ii < this._users.length; ii++) {
              if (this._allassignedusers[i].usersyskey == this._users[ii].syskey) {
                this._users.splice(ii, 1);
              }
            }
          }
  
          this._users.sort((a, b) => (a.userName > b.userName) ? 1 : -1);
  
          setTimeout(() => {
            this.isLoading = false;
          }, 1000);
        }, err => {
          this.isLoading = false;
        }
      );
    }
  }

  addUser() {
    this.loadCtrl.create({
      message: "Processing..",
      duration: 20000
    }).then(async el => {
      el.present();

      let tempAssignedUsers = {
        "syskey": "",
        "username": "",
        "userid": "",
        "usersyskey": "",
        "date": "",
        "selected": true,
        "status": "0",
        "recordStatus": "1",
        "activeStatus": ""
      };

      this._users.filter(el => el.selected === true).map(val => { //userDetails
        tempAssignedUsers = {
          "syskey": "",
          "username": val.userName,
          "userid": val.userId,
          "usersyskey": val.syskey,
          "date": "",
          "selected": true,
          "status": "0",
          "recordStatus": "1",
          "activeStatus": ""
        };

        this._assignedusers.push(tempAssignedUsers);
        this._allassignedusers.push(tempAssignedUsers);
      });

      el.dismiss();
      $('#userModalList').appendTo("body").modal('hide');
    });
  }

  async removeUser(index, user) {
    if(index < 20){
      index = ( ( (this.userConfig.currentPage - 1) * 20 ) + index );
    }

    let deleteConfirm: any = true;

    if(this._assignedusers[index].status == "2"){
      this.manager.showToast(this.tostCtrl, "Message", "Can't delete Complete Status", 2000);
      return;
    } else if(this._assignedusers[index].status == "1"){
      deleteConfirm = await this.manager.showConfirm(this.alerttCtrl, "Confirm Delete", "", "Delete In Progress User?");
    }

    if(deleteConfirm){
      let removeUserList : any = [];

      //assigned users [display]
      for (var i = this._assignedusers.length - 1; i >= 0; i--) {
        if (this._assignedusers[i].usersyskey == user.usersyskey) {
          if(this._assignedusers[i].status != "2"){
            this._assignedusers.splice(i, 1);
          } else {
            break;
          }
        }
      }
  
      //all assigned users [Background data]
      for (var i = this._allassignedusers.length - 1; i >= 0; i--) {
        if (this._allassignedusers[i].usersyskey == user.usersyskey) {
          if(this._allassignedusers[i].status != "2"){
            /*
            if(this._allassignedusers[i].syskey == ""){
              this._allassignedusers.splice(i, 1);
            } else {
              this._allassignedusers[i].recordStatus = 4;
            }
            */
  
            if(this._allassignedusers[i].syskey != ""){
              removeUserList.push(this._allassignedusers[i].syskey);
            }
  
            this._allassignedusers.splice(i, 1);
          } else {
            break;
          }
        }
      }
  
      //go to server and delete immediately
      if(removeUserList.length > 0) {
        this.userConfig.currentPage = 1;
        this.deleteUser(removeUserList);
      } 
      // else {
      //   this.manager.showToast(this.tostCtrl, "Message", "Can only delete to Not Started Status", 2000);
      // }
    }
  }

  deleteUser(removeUserList) 
  {
    this.http.get(this.manager.appConfig.apiurl + 'surveyor/deleteUserDetial/' + removeUserList, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.message == "SUCCESS") {
          this.manager.showToast(this.tostCtrl,"Message","User Deleted Successfully!",1000);
        } else {
          this.manager.showToast(this.tostCtrl,"Message","Deleted Fail!",1000)
        }
     },
      error => { },
      () => { }
    );
  }

  userActiveStatusChange(user){
    if(user.status != "2"){
      const url = this.manager.appConfig.apiurl +'surveyor/userActiveStatusChange';
      let param = {
        "syskey": user.syskey,
        "n4": user.activeStatus
      };
  
      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data:any) =>{
          if(data.message == "SUCCESS"){
            if(user.activeStatus == "0"){
              user.activeStatus = "1";
            } else if(user.activeStatus == "1"){
              user.activeStatus = "0";
            }
  
            this.manager.showToast(this.tostCtrl, "Message", "Status changed", 1000);
          } else {
            this.manager.showToast(this.tostCtrl, "Message", "Status didn't change", 1000);
          }
        }
      );
    } else {
      this.manager.showToast(this.tostCtrl, "Message", "Can only change to Not Started Status", 2000);
    }
  }

  searchSurveyor() {
    if (this.filterkey == 0) {
      this._assignedusers = this._allassignedusers.filter((item) => {
        return (item.username.toLowerCase().indexOf(this.searchsurveyor.toLowerCase()) > -1);
      });

      this.userConfig.currentPage = 1;
    } else if (this.filterkey == 1) {
      this._assignedusers = this._allassignedusers.filter((item) => {
        return (item.userid.toLowerCase().indexOf(this.searchsurveyor.toLowerCase()) > -1);
      });
    } else if (this.filterkey == 2) {
      if (this.searchsurveyor !== '') {
        this.searchsurveyor = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoUI, this.searchsurveyor);
      }

      this._assignedusers = this._allassignedusers.filter((item) => {
        return (item.date.toLowerCase().indexOf(this.searchsurveyor.toLowerCase()) > -1);
      });
    } else {
      if (this.filterstatuskey == 1) {
        this.searchsurveyor = "2";
      } else if (this.filterstatuskey == 2) {
        this.searchsurveyor = "1";
      } else if (this.filterstatuskey == 3) {
        this.searchsurveyor = "0";
      } else {
        this.searchsurveyor = "";
      }

      this._assignedusers = this._allassignedusers.filter((item) => {
        return (item.status.toString().toLowerCase().indexOf(this.searchsurveyor) > -1);
      });
    }
  }

  surveyorHeaderList(region_data) {
    var param = {
      "headerDesc": "",
      "questionDesc": "",
      "sectionDesc": "",
      "validDate": "",
      "fromDate": "",
      "toDate": "",
      "current": "",
      "maxRows": ""
    };
    
    // return new Promise(done => {
      this.http.post(this.manager.appConfig.apiurl + "surveyor/allSurveyorHeaderListWeb", param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.surveyorheaderlist = data.dataList.filter(el => el.status == "1");
          this.surveyorheaderlist.filter(el => el.types = []);
          this.allsurveyorheaderlist = this.surveyorheaderlist;

          if(this.detailFlat){
            this.getSvrHdrDtl(region_data);
          }

          // done();
        }, err => {
          // done();
        }
      );
    // });
  }

  searchSurvey(e) {
    let value = e.target.value;

    this.surveyorheaderlist = this.allsurveyorheaderlist.filter((item) => {
      return (item.headerDescription.toLowerCase().includes(value.toLowerCase()));
    });
  }

  typeAssignCheckboxChange1() {
    this.saveData.svrChangeFlag = true;

    if (this.newmodel) {
      this.surveyorheaderlist.filter(el => el.types.push({ name: "New", selected: true })).map(val => {
        val.selected = true;
      });
    } else {
      this.surveyorheaderlist.filter(el => {
        el.types.filter(tl => tl.name == "New").map(val => {
          if (val) {
            el.types.splice(el.types.findIndex(x => x.name == 'New'), 1);
          }
        });
      });
    }

    // if (!this.newmodel && !this.existmodel && !this.flagmodel) {
    //   this.surveyorheaderlist.filter(el => el.selected = false);
    // }

    this.surveyorheaderlist.forEach(el => {
      // if(el.types.length == 0){
      //   el.selected = false;
      // }

      let check = el.types.some(
        elTypes => elTypes.selected == true
      );

      if(!check){
        el.selected = false;
      }
    });
  }

  typeAssignCheckboxChange2() {
    this.saveData.svrChangeFlag = true;
    
    if (this.existmodel) {
      this.surveyorheaderlist.filter(el => el.types.push({ name: "Existing", selected: true })).map(val => {
        val.selected = true;
      });
    } else {
      this.surveyorheaderlist.filter(el => {
        el.types.filter(tl => tl.name == "Existing").map(val => {
          if (val) {
            el.types.splice(el.types.findIndex(x => x.name == 'Existing'), 1);
          }
        });
      });
    }

    // if (!this.newmodel && !this.existmodel && !this.flagmodel) {
    //   this.surveyorheaderlist.filter(el => el.selected = false);
    // }

    this.surveyorheaderlist.forEach(el => {
      // if(el.types.length == 0){
      //   el.selected = false;
      // }

      let check = el.types.some(
        elTypes => elTypes.selected == true
      );

      if(!check){
        el.selected = false;
      }
    });
  }

  typeAssignCheckboxChange3() {
    this.saveData.svrChangeFlag = true;
    
    if (this.flagmodel) {
      this.surveyorheaderlist.filter(el => el.types.push({ name: "Flag", selected: true })).map(val => {
        val.selected = true;
      });
    } else {
      this.surveyorheaderlist.filter(el => {
        el.types.filter(tl => tl.name == "Flag").map(val => {
          if (val) {
            el.types.splice(el.types.findIndex(x => x.name == 'Flag'), 1);
          }
        });
      });
    }

    // if (!this.newmodel && !this.existmodel && !this.flagmodel) {
    //   this.surveyorheaderlist.filter(el => el.selected = false);
    // }

    this.surveyorheaderlist.forEach(el => {
      // if(el.types.length == 0){
      //   el.selected = false;
      // }

      let check = el.types.some(
        elTypes => elTypes.selected == true
      );

      if(!check){
        el.selected = false;
      }
    });
  }

  surveyCheckboxChange(obj){
    this.saveData.svrChangeFlag = true;
    
    if (!obj.selected) {
      obj.types.filter(el => el.selected = false)
    } else {
      obj.types.filter(el => el.selected = true)
    }
  }

  surveyTypeCheckboxChange(obj){
    this.saveData.svrChangeFlag = true;
    
    let length = obj.types.filter(el => el.selected == false).length;
    let truelength = obj.types.filter(el => el.selected == true).length;

    if (length == obj.types.length){
      obj.selected = false;
    }

    if (truelength > 0){
      obj.selected = true;
    }
  }

  getAllDataList(){
    this.loadCtrl.create({
      message: "Processing..",
     
      backdropDismiss: false
    }).then(
      el => {
        el.present();
        this.searchCriteria.maxRows = this.config.itemsPerPage;
        this.searchCriteria.current = 0;
        let criFlag= true;
    
        // const url = this.manager.appConfig.apiurl + 'surveyor/getregion';
    
        if(criFlag == true){
          if(this.criteria.fromDate != ""){
            this.searchCriteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
          }
    
          if(this.criteria.toDate != ""){
            this.searchCriteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
          }
    
          // this.searchCriteria.fromDate = this.criteria.fromDate;
          // this.searchCriteria.toDate = this.criteria.toDate;
          this.searchCriteria.routeName = this.criteria.routeName;
        }

        const url = this.manager.appConfig.apiurl +'surveyor/getregion';

        this.http.post(url, this.searchCriteria, this.manager.getOptions()).subscribe(
          (data:any) =>{
            el.dismiss();
            if(data.RegionList.length > 0) {
              this.config.totalItems = data.RegionList[0].rowCount;
              this.config.currentPage = 1;
              this.region_list = data.RegionList;
              // this.routeNameList = data.RegionList;
  
              for(var i = 0; i < this.region_list.length; i++){
                this.region_list[i].fromdate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.region_list[i].fromdate);
                this.region_list[i].todate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.region_list[i].todate);
              }
            } else {
              this.region_list = [];
              this.config.totalItems = 0;
            }
          }, error => {
            el.dismiss();
          }
        );
      }
    );
  }

  search(currIndex, criFlag){
    this.loadCtrl.create({
      message: 'Please wait...',
      backdropDismiss: false
    }).then(loadEl => {
      loadEl.present();
      this.searchCriteria.maxRows = this.config.itemsPerPage;
      this.searchCriteria.current = currIndex;
  
      const url = this.manager.appConfig.apiurl + 'surveyor/getregion';
  
      if(criFlag == true){
        if(this.criteria.fromDate != ""){
          this.searchCriteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
        }
  
        if(this.criteria.toDate != ""){
          this.searchCriteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
        }
  
        // this.searchCriteria.fromDate = this.criteria.fromDate;
        // this.searchCriteria.toDate = this.criteria.toDate;
        this.searchCriteria.routeName = this.criteria.routeName;
      }
      this.http.post(url, this.searchCriteria, this.manager.getOptions()).subscribe(
        (data:any) =>{
          loadEl.dismiss();
          if (data.RegionList.length>0) {
            this.config.totalItems = data.RegionList[0].rowCount;
            if (currIndex == 0) {
              this.config.currentPage = 1;
            }
            // this.routeNameList = data.RegionList;
            this.region_list = data.RegionList;
            this.region_list.map(
              data => {
                data.fromdate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data.fromdate);
                data.todate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data.todate);
              }
            );
  
          } else {          
            this.region_list = [];
            this.config.totalItems = 0;
          }
        }, error => {
          loadEl.dismiss();
        }
      );
    })
  }

  getUserDtl(region_data, loadDismiss){
    let param = { "routingsyskey": region_data.regionsyskey };
    
    const url = this.manager.appConfig.apiurl + 'surveyor/getregionuser';

    // return new Promise(done => {
      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          let user = data.RegionUserList;
          
          // this gives an object with dates as keys
          const groups = user.reduce((groups, val) => {
            const date = val.date;
            if (!groups[date]) {
              groups[date] = [];
            }
            groups[date].push(val);
            return groups;
          }, {});

          // Edit: to add it in the array format instead
          const groupArrays = Object.keys(groups).map((date) => {
            return {
              date,
              userList: groups[date]
            };
          });

          region_data.assignedsurveyor = groupArrays;

          this._assignedusers = [];
          this._allassignedusers = [];

          region_data.assignedsurveyor.forEach(e => {
            e.userList.filter(val => {
              val.selected = true;
              let currentDate = Number(this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.manager.getCurrentDate()));

              // By Date
              if (e.date < currentDate) {
                e.status = 2;
              } else if(e.date == currentDate) {
                e.status = 1;
              } else {
                e.status = 0;
              }

              // By User
              if (val.date < currentDate) {
                val.status = 2;
              } else if(val.date == currentDate) {
                val.status = 1;
              } else {
                val.status = 0;
              }

              val.activeStatus = val.activeStatus.toString();
              val.date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, val.date);

              this._assignedusers.push(val);
              this._allassignedusers.push(val);
            });
          });

          this.userConfig.currentPage = 0;
          if(data.RegionUserList.length > 0){
            this.userConfig.currentPage = 1;
            // this.userConfig.totalItems = this._assignedusers.length;
          }

          loadDismiss.dismiss();

          // done();
        },
        error => {
          loadDismiss.dismiss();
          // done();
        }
      );
    // });
  }

  getSvrHdrDtl(region_data){
    let param = { "routingsyskey": region_data.regionsyskey };
    
    const url = this.manager.appConfig.apiurl + 'surveyor/getregionsvr';
    
    // return new Promise(done => {
      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          region_data.assignedsurvey = data.RegionSvrList;

          /*
          region_data.assignedsurvey.forEach(e => {
            this.surveyorheaderlist.filter(el => el.headerSyskey == e.svrsyskey).map(matched => {
              if (this.newmodel || this.existmodel || this.flagmodel) {
                matched.selected = true;
              }
      
              // New Store [start] 
              if (e.newstore == "1") {
                matched.types.push({ name: "New", selected: true });
              } else {
                if (this.newmodel) {
                  matched.types.push({ name: "New", selected: false });
                }
              }
              // New Store [end] 
      
              // Existing Store [start] 
              if (e.exitstore == "1") {
                matched.types.push({ name: "Existing", selected: true });
              } else {
                if (this.existmodel) {
                  matched.types.push({ name: "Existing", selected: false });
                }
              }
              // Existing [end] 
      
              // Flag Store [start] 
              if (e.flagstore == "1") {
                matched.types.push({ name: "Flag", selected: true });
              } else {
                if (this.flagmodel) {
                  matched.types.push({ name: "Flag", selected: false });
                }
              }
              // Flag [end] 

              // done();
            });
          });
          */
          
          this.surveyorheaderlist.forEach(matched => {
            if(this.newmodel){
              matched.types.push({ name: "New", selected: false });
            }

            if(this.flagmodel){
              matched.types.push({ name: "Flag", selected: false });
            }

            if(this.existmodel){
              matched.types.push({ name: "Existing", selected: false });
            }

            region_data.assignedsurvey.forEach(e => {
              if(matched.headerSyskey == e.svrsyskey){
                if (this.newmodel || this.existmodel || this.flagmodel) {
                  matched.selected = true;
                }

                if (e.newstore == "1") {
                  matched.types.filter(el => el.name == "New").map(newshop => {
                    newshop.selected = true;
                  });
                }

                if (e.exitstore == "1") {
                  matched.types.filter(el => el.name == "Existing").map(flagshop => {
                    flagshop.selected = true;
                  });
                }

                if (e.flagstore == "1") {
                  matched.types.filter(el => el.name == "Flag").map(existshop => {
                    existshop.selected = true;
                  });
                }
              }
            });
          });
        },
        error => {
          // done();
        }
      );
    // });
  }

  // async tempDetail(region_data) {
  //   return new Promise(async (resolve) => {
  //     await this.getSvrHdrDtl(region_data);
  //     resolve();
  //   });
  // }

  validToAddUser(toDate){
    let tempToDate = toDate;
    let tempTodayDate = new Date();

    tempToDate.setHours(0, 0, 0, 0);
    tempTodayDate.setHours(0, 0, 0, 0);

    if (+tempTodayDate > +tempToDate) {
      this.disNewUser = true;
    } else {
      this.disNewUser = false;
    }
  }

  detail(region_data){
    $("#shop-new-survey").show();
    $("#shop-list-survey").hide();
    $("#shop-new-survey-tab").tab("show");

    this.detailFlat = true;
    this.btn = true;

    this.tsp_list = [];
    this.district_list = [];
    this.statelist = [];

    this.township = true;
    this.getTsp("", region_data.menusyskey);

    /***   District  ****/
    // this.dis = true;
    // this.getDistrict("", this.tsp_list[0].n3);
    // this.dis = false;
    /***   District  ****/

    /***   State      ***/
    // this.state = true;
    // this.getState(this.district_list[0].n3);
    // this.state = false;
    /***   State  ***/

    this.loadCtrl.create({
      animated: true,
      message: "Processing..",
      backdropDismiss: false
    }).then(
      e => {
        e.present();

        this.saveData.lastToDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.UItoDB, region_data.todate);
        this.saveData.syskey = region_data.regionsyskey;
        this.saveData.t1 = this.manager.dateFormatCorrector(this.manager.dateFormatter.UItoDTP, region_data.fromdate);
        this.saveData.t2 = this.manager.dateFormatCorrector(this.manager.dateFormatter.UItoDTP, region_data.todate);
        this.saveData.t3 = region_data.t3;
        this.saveData.t4 = region_data.t4;
        this.saveData.n1 = region_data.menusyskey;
        this.saveData.n6 = region_data.n6;
        this.saveData.n7 = region_data.n7;
        this.saveData.n8 = region_data.n8;
    
        this.validToAddUser(this.saveData.t2);
    
        this.newmodel = false;
        this.flagmodel = false;
        this.existmodel = false;
        
        if (region_data.n6 == "1") {
          this.existmodel = true;
        }
    
        if (region_data.n7 == "1") {
          this.flagmodel = true;
        }
    
        if (region_data.n8 == "1") {
          this.newmodel = true;
        }
    
        this.surveyorHeaderList(region_data);
        this.getUserDtl(region_data, e);
      }
    );
  }

  prepareSave(){
    let tempUserDtl = this.getUserDtlData();

    this.saveData.userDetail = [];
    this.saveData.surDetail = [];

    if (this.existmodel) {
      this.saveData.n6 = "1";
    }
    if (this.flagmodel) {
      this.saveData.n7 = "1";
    }
    if (this.newmodel) {
      this.saveData.n8 = "1";
    }

    //  User Detail [FROM HERE]
    
    /*
    const groups = this._assignedusers.reduce((groups, val) => {
      const usersyskey = val.usersyskey;
      if (!groups[usersyskey]) {
        groups[usersyskey] = [];
      }
      groups[usersyskey].push(val);
      return groups;
    }, {});

    // Edit: to add it in the array format instead
    const groupArrays = Object.keys(groups).map((usersyskey) => {
      return {
        usersyskey,
      };
    });

    groupArrays.filter(val => { //userDetails
      tempUserDtl = this.getUserDtlData();
      tempUserDtl.n2 = val.usersyskey;

      this.saveData.userDetail.push(tempUserDtl);
    });
    */

    /*
    for(let loop = 0; loop < this._allassignedusers.length; loop++){
      tempUserDtl = this.getUserDtlData();
      tempUserDtl.syskey = this._allassignedusers[loop].syskey;
      tempUserDtl.recordStatus = this._allassignedusers[loop].recordStatus;
      tempUserDtl.n2 = this._allassignedusers[loop].usersyskey;

      this.saveData.userDetail.push(tempUserDtl);
    }
    */

    this.saveData.userDetail = this._allassignedusers.filter(
      data => {
        return (data.syskey == "" || data.syskey == "0");
      }
    );

    this.saveData.userDetail = this.saveData.userDetail.map(
      data => {
        tempUserDtl = this.getUserDtlData();
        tempUserDtl.syskey = "0";
        tempUserDtl.n2 = data.usersyskey;

        return tempUserDtl;
      }
    );

    if(this.saveData.userDetail.length > 0){
      this.saveData.userAddFlag = true;
    }

    //  User Detail [TO HERE]

    //  Survey Header Detail [FROM HERE]
    this.saveData.surDetail = this.prepareSvrHdr();
    //  Survey Header Detail [TO HERE]
  }

  prepareSvrHdr(){
    let tempSvrDtl = this.getSvrDtlData();
    let tempSvrDtlList = [];

    this.surveyorheaderlist.filter(el => el.selected === true).map(val => {
      let newstore = "0";
      let existstore = "0";
      let flagstore = "0";

      if (val.types.findIndex(x => x.name == 'New') > -1) {
        if (val.types[val.types.findIndex(x => x.name == 'New')].selected == true) {
          newstore = "1";
        }
      }

      if (val.types.findIndex(x => x.name == 'Existing') > -1) {
        if (val.types[val.types.findIndex(x => x.name == 'Existing')].selected == true) {
          existstore = "1";
        }
      }

      if (val.types.findIndex(x => x.name == 'Flag') > -1) {
        if (val.types[val.types.findIndex(x => x.name == 'Flag')].selected == true) {
          flagstore = "1";
        }
      }

      tempSvrDtl = this.getSvrDtlData();
      tempSvrDtl.n2 = val.headerSyskey;
      tempSvrDtl.n6 = existstore;
      tempSvrDtl.n7 = flagstore;
      tempSvrDtl.n8 = newstore;

      // this.saveData.surDetail.push(tempSvrDtl);
      tempSvrDtlList.push(tempSvrDtl);
    });

    return tempSvrDtlList;
  }

  validationBeforeSave(){
    if(this.saveData.t1 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add From Date", 2000);
      return false;
    }

    if(this.saveData.t2 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add To Date", 2000);
      return false;
    }

    if(this.saveData.t4 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Route Name", 2000);
      return false;
    }

    if(this.saveData.n1 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Township", 2000);
      return false;
    }

    /*
    if(this.saveData.n6 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Service Failed", 2000);
      return false;
    }

    if(this.saveData.n7 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Service Failed", 2000);
      return false;
    }

    if(this.saveData.n8 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Service Failed", 2000);
      return false;
    }
    */
    
    if(this.saveData.userDetail.length < 1 && this._allassignedusers.length < 1){
      this.manager.showToast(this.tostCtrl, "Message", "Add User", 2000);
      return false;
    }

    if(!this.shopUpdateValidation(this.saveData.surDetail)){
      return false;
    }

    return true;
  }

  shopUpdateValidation(surDetailList){
    if(surDetailList.length < 1){
      this.manager.showToast(this.tostCtrl, "Message", "Add Survey Header", 2000);
      return false;
    }

    return true;
  }

  /*                      old save function
  this.loadCtrl.create({
    message: "Processing..",
    
    backdropDismiss: false
  }).then(
    el => {
      el.present();

      const url = this.manager.appConfig.apiurl +'surveyor/save-route';

      this.prepareSave();

      if(this.validationBeforeSave()){
        let tempFromDate = this.saveData.t1;
        let tempToDate = this.saveData.t2;

        this.saveData.t1 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.saveData.t1);
        this.saveData.t2 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.saveData.t2);
        
        this.http.post(url, this.saveData, this.manager.getOptions()).subscribe(
          (data:any) =>{
            el.dismiss();

            if(data.message == "SUCCESS"){
              this.manager.showToast(this.tostCtrl, "Message", "Save Successful", 1000);
    
              this.clearProperties();
              this.getAllDataList();

              $("#shop-new-survey").hide();
              $("#shop-list-survey").show();
              $("#shop-list-survey-tab").tab("show");
            } else {
              this.saveData.t1 = tempFromDate;
              this.saveData.t2 = tempToDate;
              this.manager.showToast(this.tostCtrl, "Message", "Save Failed", 2000);
            }
          }
        );
      } else {
        el.dismiss();
      }
    }
  );
  */

  saveSurveyorRoute(){
    const url = this.manager.appConfig.apiurl +'surveyor/save-route';

    this.prepareSave();

    if(this.validationBeforeSave()){
      let tempFromDate = this.saveData.t1;
      let tempToDate = this.saveData.t2;

      this.saveData.t1 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.saveData.t1);
      this.saveData.t2 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.saveData.t2);

      this.loadCtrl.create({
        message: "Processing..",
        
        backdropDismiss: false
      }).then(
        el => {
          el.present();

          this.http.post(url, this.saveData, this.manager.getOptions()).subscribe(
            (data:any) =>{
              el.dismiss();

              if(data.message == "SUCCESS"){
                this.manager.showToast(this.tostCtrl, "Message", "Save Successful", 1000);
      
                this.clearProperties();
                this.getAllDataList();

                $("#shop-new-survey").hide();
                $("#shop-list-survey").show();
                $("#shop-list-survey-tab").tab("show");
              } else {
                this.saveData.t1 = tempFromDate;
                this.saveData.t2 = tempToDate;
                this.manager.showToast(this.tostCtrl, "Message", "Save Failed", 2000);
              }
            }
          );
        }
      );
    }
  }

  updateRegionShop(){
    const url = this.manager.appConfig.apiurl +'surveyor/update-region-shop';
    let tempRegionShop = this.getSaveData();

    tempRegionShop.syskey = this.saveData.syskey;
    tempRegionShop.n1 = this.saveData.n1;
    tempRegionShop.surDetail = this.prepareSvrHdr();

    if(this.shopUpdateValidation(tempRegionShop.surDetail)){
      this.loadCtrl.create({
        message: "Processing..",
        
        backdropDismiss: false
      }).then(
        el => {
          el.present();

          this.http.post(url, tempRegionShop, this.manager.getOptions()).subscribe(
            (data:any) =>{
              el.dismiss();

              if(data.message == "SUCCESS"){
                this.manager.showToast(this.tostCtrl, "Message", "Updated Shops Successful", 1000);
      
                this.clearProperties();
                this.getAllDataList();

                $("#shop-new-survey").hide();
                $("#shop-list-survey").show();
                $("#shop-list-survey-tab").tab("show");
              } else {
                this.manager.showToast(this.tostCtrl, "Message", "Updated Shops Failed", 2000);
              }
            }
          );
        }
      );
    }
  }

  gotoDelete(){
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
              const url = this.manager.appConfig.apiurl + 'surveyor/deletesurveyroute';
              this.http.post(url, this.saveData, this.manager.getOptions()).subscribe(
                (data:any) =>{
                  el.dismiss();
                  if(data.message == "SUCCESS"){
                    this.manager.showToast(this.tostCtrl, "Message", "Delete Successful", 1000);
                    this.clearProperties();
                    this.getAllDataList();

                    $("#shop-new-survey").hide();
                    $("#shop-list-survey").show();
                    $("#shop-list-survey-tab").tab("show");
                  } else if(data.message == "FAIL"){
                    this.manager.showToast(this.tostCtrl, "Message", "Delete Failed", 1000);
                  }
                },
                (error: any) => {
                  el.dismiss();
                  this.manager.showToast(this.tostCtrl,"Message","Deleteing Fail!",1000);
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

  pageChanged(e){
    this.config.currentPage = e;
    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.search(currentIndex, false);
  }

  userPageChanged(e){
    this.userConfig.currentPage = e;
  }

  getCriteriaData(){
    return {
      "fromDate": "",
      "toDate": "",
      "township": "",
      "routeName": ""
    };
  }

  getSaveData(){
    return {
      "syskey": "",
      "userSyskey": sessionStorage.getItem("usk"),
      "userId": sessionStorage.getItem("uid"),
      "userName": sessionStorage.getItem("uname"),
      "t1": "",
      "t2": "",
      "t3": "TBA",
      "t4": "",
      "n1": "",
      "n6": "0",
      "n7": "0",
      "n8": "0",
      "lastToDate": "",
      "userDetail": [],
      "surDetail": [],
      "userAddFlag": false,
      "svrChangeFlag": false
    };
  }

  getSvrRoutingData(){
    return {
      "state": "",
      "district": "",
      "township": "",   //  saveData.n1
      "townorvillagetract": "",
      "ward": ""
    };
  }

  getUserDtlData(){
    return {
      "syskey": "",
      "recordStatus": "1",
      "saveStatus": "",
      "t1": "",
      "t2": "",
      "n1": "",
      "n2": "",
      "n3": "0",
      "n4": "0",
      "n5": "0",
      "n6": "0",
      "n7": "0",
      "userSyskey": sessionStorage.getItem("usk"),
      "userId": sessionStorage.getItem("uid"),
      "userName": sessionStorage.getItem("uname")
    }
  }

  getSvrDtlData(){
    return {
      "recordStatus": "1",
      "saveStatus": "",
      "t1": "",
      "t2": "",
      "n1": "",
      "n2": "",
      "n3": "0",
      "n4": "0",
      "n5": "0",
      "n6": "",
      "n7": "",
      "n8": "",
      "userSyskey": sessionStorage.getItem("usk"),
      "userId": sessionStorage.getItem("uid"),
      "userName": sessionStorage.getItem("uname")
    };
  }

  clearProperties(){
    this.statelist = [];
    this.district_list = [];
    this.town_village_list = [];
    this.tsp_list = [];
    this.wardlist = [];

    this.surveyorheaderlist = [];
    this.allsurveyorheaderlist = [];

    this._users = [];
    this._assignedusers = [];
    this._allassignedusers = [];

    this.saveData = this.getSaveData();
    this.surveyrouting = this.getSvrRoutingData();

    this.btn = false;
    this.detailFlat = false;
    this.state = true;
    this.dis = true;
    this.township = true;
    this.town_village = true;
    this.ward = true;
    this.newmodel = false;
    this.existmodel = false;
    this.flagmodel = false;
    this.isLoading = false;

    this.townvillage = "0";
    this.searchsurveyor = "";
    this.filterkey = 0;
    this.filterstatuskey = 0;
  }

  advanceSearchReset() {
    $('#routeName1').val('');
    this.criteria = this.getCriteriaData();
    this.criteria.fromDate = lastDay;
    this.criteria.toDate = lastDay;
    this.getAllDataList();
  }
  

  allList(){
    let tempTerm = {
      "routeName": this.routeNameSearch.value
    };
    this.manager.routeNameSearchAutoFill(tempTerm).subscribe(
      data => {
        this.routeNameList = data as any[];
      }
    );
  }
}