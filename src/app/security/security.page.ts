import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

declare var $: any;
@Component({
  selector: 'app-security',
  templateUrl: './security.page.html',
  styleUrls: ['./security.page.scss'],
})
export class SecurityPage implements OnInit {

  _menuTitleList:any = [];
  _headerMenus:any = [];
  _rolelistdata: any = [];
  _selectedRole: any = '';
  obj = this._roleData();
  child_menu: any = [];
  activeParMenu: any = "";
  constructor(
    private ics: ControllerService,
    private http: HttpClient,
    public tostCtrl: ToastController,
    public loading: LoadingController
  ) {

  }
  ionViewWillEnter() {
    this._selectedRole = '';
    this.getMenusList();
    this.searchRoleList();
    $('#content').addClass('disabled')
  }
  ngOnInit() {

  }
  
  private _roleData(): roleData {
    return {
      syskey: "0",
      autokey: "",
      createdDate: "",
      modifiedDate: "",
      userId: this.ics.user.userId,
      userName: this.ics.user.userName,
      recordStatus: 0,
      syncStatus: 0,
      syncBatch: 0,
      usersyskey: this.ics.user.userSk,
      t1: "", t2: "", t3: "", n1: 0, n2: 0, n3: 0,
      btnarr: [],
      menu: []
    };
  }
  private _roleMenuData(key,desc): roleMenuData {
    return {
      'childmenus': [],
      'code': key,
      'description': desc,
      'n2': '',
      'result': false,
      'show': false,
      'syskey': '0',
      't2': '',
      't3': ''
    }
  }
  getMenusList() {
    this._menuTitleList = [];
    let url: string = this.ics.appConfig.apiurl + 'role/menus/';
    this.http.get(url, this.ics.getOptions()).subscribe(
      data => {
        this._headerMenus = data;
        this._menuTitleList = this._headerMenus.filter(hm => {
          return hm.des3 == "0"
        });
        this._menuTitleList = this._menuTitleList.map(mtl => {
          mtl.child = this._headerMenus.filter(hm => { return hm.des3 === mtl.des2 });
          return mtl;
        });
        this.activeParMenu = this._menuTitleList[0].code;
        this.showChild(0)
      },
      error => {
      }
    );

  }
  readMenuByRole() {
    this.activeParMenu = this._menuTitleList[0].code;
    $('#pgbar-readmenus-role').show();
    $('#content').addClass('disabled')
    this.http.get(this.ics.appConfig.apiurl + 'role/readRoleBySyskey/' + this._selectedRole, this.ics.getOptions()).subscribe(
      (data: { roleData: any }) => {
        this.obj = data.roleData;
        const rd_syskey = this.obj.menu.map((m: roleMenuData) => { return m.syskey });
        for (let p of this._menuTitleList) {
          for (let c of p.child) {
            c.n2 = rd_syskey.indexOf(c.code) == -1 ? false : true;
            c.menuDetailList = this._headerMenus.filter(header => {
              return header.des4 === c.code;
            });
            for(let b of c.menuDetailList){
              b.n2 = rd_syskey.indexOf(b.code) == -1 ? false : true;
            }
          }
        }
        //this.showChild(0)
        $('#pgbar-readmenus-role').hide();
        $('#content').removeClass('disabled')
      },
      error => {
        $('#pgbar-readmenus-role').hide();
        $('#content').removeClass('disabled')
      }
    )
  } 
  searchRoleList() {
    var obj = { "codeType": "bw", "descriptionType": "bw", "code": "", "description": "" };
    const postparams = {
      "codeType": obj.codeType,
      "code": obj.code,
      "descriptionType": obj.descriptionType,
      "description": obj.description,
      "currentPage": 1,
      "pageSize": 1
    };
    const url = this.ics.appConfig.apiurl + 'role/searchRoleList/';

    this.http.post(url, postparams, this.ics.getOptions()).subscribe(
      (data: any) => {
        this._rolelistdata = data.rolelistdata;
      },
      error => {

      },
      () => { }
    );

  }
  showChild(index) {
    this.child_menu = this._menuTitleList[index].child;
  }
  checkChild(child) {
    if (!child.n2) {
      for (let btn of child.menuDetailList) {
        btn.n2 = false;
      }
    }
  }
  async save() {
    let loading = await this.loading.create({
      animated:true,
      message:"Please wait.."
    });
    await loading.present();
    let menus = [];
    for (let t of this._menuTitleList) {
      if(t.n2) menus.push(this._roleMenuData(t.code,t.description));
      for(let c of t.child){
        if(c.n2) menus.push(this._roleMenuData(c.code,c.description));
        for(let b of c.menuDetailList){
          if(b.n2)  menus.push(this._roleMenuData(b.code,b.description));
        }
      }
    }
    this.obj.menu = menus;
    console.log(this.obj);
    const url: string = this.ics.appConfig.apiurl + 'role/save';
    this.http.post(url,this.obj,this.ics.getOptions()).subscribe(
      (d:any)=>{
        loading.dismiss();
        this.ics.showToast(this.tostCtrl,"Message",d.message,2000);
      },
      error=>{
        loading.dismiss();
        this.ics.showToast(this.tostCtrl,"Message","Something went wrong",2000);
      }
    )
  }
}
