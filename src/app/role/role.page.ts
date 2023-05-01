import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../controller.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
declare var $: any;
@Component({
  selector: 'app-role',
  templateUrl: './role.page.html',
  styleUrls: ['./role.page.scss'],
})
export class RolePage implements OnInit {

  _userList: any;
  _obj: any = this.getDefaultObj();
  isMasterRole: any = false;
  isMaster: any = false;
  
update:boolean = false;
  constructor(
    public ics: ControllerService,
    private activateRoute: ActivatedRoute,
    private _router: Router,
    public alertController: AlertController,
    public nav: NavController,
    private http: HttpClient,
    public tostCtrl: ToastController,
    public manager: ControllerService,
    private loadCtrl: LoadingController ) {
    this.ics.isLoginUser();
  }
  back() {
    this.nav.navigateBack('/role-list');
  }
  ngOnInit() {
    this.ics.isLoginUser();
  }
  listTab(){
    this.back();
  }
  async ionViewWillEnter() {
    if(sessionStorage.getItem('isMasterRole') === 'true') {
      this.isMaster = true;
    }
    this.ics.isLoginUser();
    const loading = await this.loadCtrl.create({ message: 'Please wait...' });
    await loading.present();
    await this.getUserList(false);
    await this.activateRoute.queryParams.subscribe(params => {
      let syskey = params['syskey'];
      if (syskey != "" && syskey != null) {
         this.readRoleBySyskey(syskey);
      }
    }, error => {
      loading.dismiss();
      console.log(error);
    });
    $('#rolesnew-tab').tab('show');
    loading.dismiss();
  }
  async getNew() {
    await this.getUserList(false);
    this._obj = this.getDefaultObj();
  }
  getUserList(status: boolean) {

    let data: any =
    {
      "userId": '',
      "userName": '',
      "currentPage": 1,
      "pageSize": 10,
      "totalCount": 10
    };
    let url: string = this.ics.appConfig.apiurl + 'user/userList/';
    return new Promise(promise=>{
      this.http.post(url, data, this.ics.getOptions()).subscribe(
        (data: any) => {
        
          if (data.dataList != null && data.dataList != undefined && data.dataList.length > 0) {
            this._userList = data.dataList;
            this._userList = this._userList.map(e => {
               e.n2 = false;
               return e;
            });
            this._userList.sort((a,b) => (a.userName > b.userName) ? 1 : ((b.userName > a.userName) ? -1 : 0));
          } else {
            this.alert('', 'No User');
            this._userList = [];
          }
          promise();
        },
        error => {
          promise();
        }
      );
    })
    
  }
  readRoleBySyskey(syskey) {
    this.update = true;
    this.http.get(this.ics.appConfig.apiurl + 'role/readRoleBySyskey/' + syskey, this.ics.getOptions()).subscribe(
      (data: any) => {
        this._obj = data.roleData;
        if(this._obj.t1 === 'Master') {
          this.isMasterRole = true;
        } else {
          this.isMasterRole = false;
        }
        this._obj.status = 'ROLEUSER';
        this.prepareUserList();
      },
      error => { },
      () => { }
    );
  }
  prepareUserList() {
    for (let y = 0; y < this._userList.length; y++) {
      for (let i = 0; i < this._obj.userList.length; i++) {
        if (this._userList[y].syskey == this._obj.userList[i].syskey) {
          this._userList[y].n2 = true;
        }
      }
    }
  }
  gotoSave() {
    this.prepare();
    let url: string = this.ics.appConfig.apiurl + 'role/save';
    let btns = [];
    if (this.isvalie()) {
      this._obj.btnarr = btns;
      let json: any = this._obj;
      this.http.post(url, json, this.ics.getOptions()).subscribe(
        (data: any) => {
          if (data.message == "SUCCESS") {
            this.alert("", 'Saved Successfully');
            this.getNew();
            this._router.navigate(['/role-list']);
          } else if (data.message == "CODEEXISTS") {
            this.alert("", 'Code Already Exists');
          } else {
            this.alert("", 'Saving Fail');
          }
        },
        error => { },
        () => { }
      );
    }
  }
  // gotoDelete() {
  //   this.http.get(this.ics.appConfig.apiurl + 'role/deleteRole/' + this._obj.syskey, this.ics.getOptions()).subscribe(
  //     (data: any) => {
  //       if (data.message == "SUCCESS") {
  //         this.alert("", "Deleted Successfully");
  //         this._router.navigate(['/role-list']);
  //       } else if (data.message == "CANNOTDELETE") {
  //         this.alert('', 'Role Already in Used');
  //       }
  //       else {
  //         this.alert('', 'Deleting Fail');
  //       }
  //     },
  //     error => { },
  //     () => { }
  //   );
  // }
  gotoDelete() {
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
            this.loadCtrl.create({
              message: "Processing",
              backdropDismiss: false,
              duration: 5000
            }).then(
              el => {
              el.present();
              this.http.get(this.ics.appConfig.apiurl + 'role/deleteRole/' + this._obj.syskey, this.ics.getOptions()).subscribe(
        (data: any) => {
        el.dismiss();
        if (data.message === "SUCCESS") {
         this.manager.showToast(this.tostCtrl, "Message", "Deleted Successfully!", 2000)
            .then((e) => {
              this._router.navigate(['/role-list']);
            });
        } else if (data.message === "CANNOTDELETE"){
          this.manager.showToast(this.tostCtrl,"Message","Role Already in Used!",2000);
        }
        else {
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

  prepare() {
    this._obj.userList = [];
    for (let i = 0; i < this._userList.length; i++) {
      if (this._userList[i].n2 == true) {
        var user = this.getUserData();
        user.syskey = this._userList[i].syskey;
        this._obj.userList.push(user);
      }
    }
  }
  isvalie() {
    if (this._obj.t1 == "" || this._obj.t2 === null || this._obj.t2 === undefined) {
      this.alert("", 'Invalid Code');
      return false;
    } else if(this._obj.t2 === "" || this._obj.t2 === null || this._obj.t2 === undefined) {
      this.alert("", 'Invalid Description');
      return false;
    }

    return true;
  }
   getDefaultObj() {
     return {
       "syskey": 0,
       "autokey": 0,
       "createdDate": "",
       "modifiedDate": "",
       "userId": this.ics.user.userId,
       "userName": this.ics.user.userName,
       "recordStatus": 0,
       "syncStatus": 0,
       "syncBatch": 0,
       "usersyskey": this.ics.user.userSk,
       "t1": "", "t2": "", "t3": "", "n1": 0, "n2": 0, "n3": 0,
       "btnarr": [],
       "menu": [],
       "userList": [],
       "status": ''
     };
   }
   getUserData() {
     return {
       "syskey": "0",
       "u12Syskey": "0",
       "loginUserId": "",
       "loginUserName": "",
       "userId": "",
       "userName": "",
       "password": "",
       "orgId": "",
       "passcode": "",
       "locrolestatus": "1",
       "locroleSyskey": "0",
       "roleData": [],
       "status": "0",
       "kitchenSyskey": "0",
     };
   }
  alert(title, message) {
    this.alertController.create({
      translucent: true,
      header: title,
      message: message,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          handler: (ok) => {
          }
        }
      ]
    }).then(alert => alert.present())
  }

}
