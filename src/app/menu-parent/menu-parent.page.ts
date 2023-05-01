import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { Events } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-menu-parent',
  templateUrl: './menu-parent.page.html',
  styleUrls: ['./menu-parent.page.scss'],
})
export class MenuParentPage implements OnInit {
  isParent: boolean = true;
  obj: any = this.getObj();
  buttonArray: any;
  buttonShow: boolean = true;
  parentCode = "0";
  parentMenuList:any = [];
  constructor(
    private http: HttpClient,
    private manager: ControllerService,
    public event: Events,
    public router: Router,
    public activatedRoute: ActivatedRoute
  ) {
    this.event.subscribe("operation", (op: number) => {
      switch (op) {
        case 0: this.save(); break;
        case 1: this.goDelete(); break;
        case 2: this.goList(); break;
      }
    });
  }
  parentChange() {

  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      let id = params['id'];
      if (id != null && id != "") {
        this.goReadBySyskey(id);

      } else {
        this.obj = this.getObj();

      }
    });
  }
  ionViewWillEnter() {
    
    // this.getButtonlist();
    this.getParentMenu();
  }
  getObj() {
    return {
      "syskey": "0",
      "t1": "",
      "t2": "",
      "t3": "",
      "t4": "",
      "parent": "",
      "n1": "0",
      "n2": "1",
      "n3": "0",
      "userId": "",
      "userName": "",
      "userSyskey": "",
      "l1": 0,
      "l2": 1,
      "l3": "m",
      "menuType": "1",
      "l5": 0,
      "insertquery": "",
      "updatequery": ""
    };
  }
  getButtonlist() {
    this.buttonArray = [];
    const url = this.manager.appConfig.apiurl + 'menu/getbuttonlist';
    this.http.get(url, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.buttonArray = data.buttonlistdata;
      },
      error => {
        console.log(error);
      }
    );
  }
  showBtnList() {
    this.buttonShow = this.buttonShow == true ? false : true;
  }
  save() {
    let url: string = this.manager.appConfig.apiurl + 'menu/savemenu';
    this.updateObj();
    this.obj.userSyskey = this.manager.user.userSk;
    this.obj.userId = this.manager.user.userId;
    this.obj.userName = this.manager.user.userName;
    this.obj.t4 = this.getButtonData();
    this.http.post(url, this.obj,this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.message === "SUCCESS") {
          // this.showMessage(this._util.MSG_TYPE.INFO, 'Saved Successfully.');
          this.obj.syskey = data.syskey;
          // this.goNew();

          // this.getParentMenu();
        }
        else if (data.message === "CODEEXISTS") {
          // this.showMessage(this._util.MSG_TYPE.WARN, 'Code Already Exist.');
        } else if (data.message === "DPARENT") {
          //this.showMessage(this._util.MSG_TYPE.WARN, 'Child Menu Already Exist.');
        }
        else {
          // this.showMessage(this._util.MSG_TYPE.WARN, 'Saving Fail.');
        }
        //this._btn_flag._save = false;
      },
      error => {
        //this.showMessage(this._util.MSG_TYPE.WARN, 'Saving Fail.');
        //this._btn_flag._save = false;
      }
    );

  }

  updateObj() {
   // this.obj.t3 = this.obj.t3.trim();
    if (this.isParent) {//parent
    this.obj.n3 = "0";
    } else {//child
       this.obj.n3 = this.parentCode;
    }
  }
  goList() {
    this.router.navigate(['/setup/securitysetting/menus-list']);
  }
  goDelete() {

  }
  goReadBySyskey(p) {
    this.http.get(this.manager.appConfig.apiurl + 'menu/readMenu/' + p).subscribe(
      data => {
        this.obj = data;
        this.setButtonData(this.obj.t4);
        if (this.obj.n2 === "0") {
          this.parentCode = this.obj.n3;
          this.obj = 0;
          this.obj.n1 = "0";
          this.obj.parent = "0";
        } else {
          this.obj.parent = this.obj.n2;
          this.obj.n1 = "1";
          this.obj.n2 = "1";
        }
      },
      error => {
      }
    );
  }
  getButtonData() {
    let k = "";
    for (let i = 0; i < this.buttonArray.length; i++) {
      if (this.buttonArray[i].flag) {
        if (k != "") { k += ","; }
        k += this.buttonArray[i].t1;
      }
    }
    return k;
  }
  setButtonData(t4) {
    let _self = this;
    let btns = t4.split(',');
    for (let i = 0; i < this.buttonArray.length; i++) {
      for (let j = 0; j < btns.length; j++) {
        if (_self.buttonArray[i].t1 == btns[j]) {
          _self.buttonArray[i].flag = true;
        }
      }
    }
  }
  getParentMenu() {
    this.parentMenuList = [];
    const url = this.manager.appConfig.apiurl + 'menu/getwebposparentMenu/';
    this.http.get(url,this.manager.getOptions()).subscribe(
        data => {
            this.parentMenuList = data;
            this.obj.l1 = this.parentMenuList[0].code;
        }
    );
}
}
