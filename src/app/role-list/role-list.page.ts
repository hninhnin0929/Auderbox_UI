import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { LoadingController, NavController } from '@ionic/angular';
declare var $: any;
@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.page.html',
  styleUrls: ['./role-list.page.scss'],
})
export class RoleListPage implements OnInit {
  _pagerData = { currentPage: 1, totalCount: 0 };
  _searchVal: any;
  _search_param_rolelist = this.getDefaultSearchObject();
  _rolelistdata: any;
  data: any = [{"id":"1453","name":"Product"},{"id":"1355","name":"Weight"},{"id":"0393","name":"Height"},{"id":"3932","name":"Width"},{"id":"2939","name":"Depth"},{"id":"1234","name":"Color"}]
  item: any = [{"1234":"Green","1355":"15 oz.","1453":"Crayons","2939":"1.5 in.","3932":"3 in.","0393":"5 in."},{"1234":"Brown","1355":"12 oz.","1453":"Cookies","2939":"2.5 in.","3932":"8 in.","0393":"7 in."},{"1234":"Green","1355":"15 oz.","1453":"Crayons","2939":"1.5 in.","3932":"3 in.","0393":"5 in."},{"1234":"Green","1355":"15 oz.","2939":"1.5 in.","3932":"3 in.","14531":"Crayons","0393":"5 in."}]

  constructor(
    private _router: Router,
    private http: HttpClient,
    private ics: ControllerService,
    private nav: NavController,
    private loadCtrl: LoadingController
  ) { 
    this.ics.isLoginUser();
    this.searchRoleList();
  }
  back(){
    this.nav.navigateBack('/role-home');
  }
  ngOnInit() {
  }
  ionViewWillEnter() {
    this.searchRoleList();
    $('#rolelist-tab').tab('show');
  }
  detailTab(){
    this.goNew();
  }
  searchRole() {

  }

  getDefaultRoleList() {
    return [{ "syskey": "0", "t1": "", "t2": "" }];
  }

  goNew() {
    this._router.navigate(['/role']);
  }

  readData(syskey) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
      "syskey": syskey
      }
    };
    this._router.navigate(['/role'],navigationExtras);
  }

  changePage(e) {
    this._pagerData.currentPage = e.currentPage;
    this.searchRoleList();
  }
  showAll() {
    this._search_param_rolelist = this.getDefaultSearchObject();
    this.searchRoleList();
  }

  searchRoleList() {
    this.loadCtrl.create({
      message: 'Please wait...'
    }).then(loadEl => {
      loadEl.present();

      const postparams = { 
        "codeType": this._search_param_rolelist.codeType, 
        "code": this._search_param_rolelist.code, 
        "descriptionType": this._search_param_rolelist.descriptionType, 
        "description": this._search_param_rolelist.description, 
        "currentPage": 1,
        "pageSize":10
       };
       const url = this.ics.appConfig.apiurl + 'role/searchRoleList/';
       if(!this.ics.checkSaveRout()) return;
       this.http.post(url, postparams,this.ics.getOptions()).subscribe(
        (data:any) => {
          this._rolelistdata = data.rolelistdata;
          this._pagerData.totalCount = data.totalCount;
          loadEl.dismiss();
        },
        error => {
          this._pagerData.totalCount = 0;
          this._pagerData.currentPage = 0;
          this._rolelistdata = this.getDefaultRoleList();
          loadEl.dismiss();
        },
        () => { }
      );
    });

  }

  closePage(){
    this._router.navigate(['/home']);
  }

  getDefaultSearchObject() {
    return { "codeType": "bw", "descriptionType": "bw", "code": "", "description": "" };
  }


}
