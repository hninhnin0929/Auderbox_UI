import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient } from '@angular/common/http';
import { Events, AlertController, LoadingController } from '@ionic/angular';
import { Router, NavigationExtras } from '@angular/router';
import { AppComponent } from '../app.component';
declare var $: any;
@Component({
  selector: 'app-menu-list',
  templateUrl: './menu-list.page.html',
  styleUrls: ['./menu-list.page.scss'],
})
export class MenuListPage implements OnInit {
  mobile: boolean = true;
  searchVal = "";
  del:boolean;
  pagerData = { currentPage: 1, totalCount: 0, pageSize: 100 };
  search_param_menulist = this.getDefaultSearchObject();
  menulistdata = [];
  define = [{ "description": "Code", "colval": "t1" }, { "description": "Description", "colval": "t2" }, { "description": "Link", "colval": "t3" }, { "description": "Parent Menu", "colval": "parent" }]

  isWebPos = true;
  constructor(
    public manager: ControllerService,
    public http: HttpClient,
    public event: Events,
    public router: Router,
    public app: AppComponent,
    public alertController: AlertController,
    private loadCtrl: LoadingController
  ) {
    this.event.subscribe('splitEvent', (e) => {
      this.mobile = e;
    })
  }

  ngOnInit() {
  }
  ionViewWillEnter() {
    this.manager.isLoginUser();
    this.searchMenuList(false);
    $('#mnlist-tab').tab('show');
  }
  menuButton() {
    this.manager.controlMenu(this.app);
  }
  gonew() {
    this.router.navigate(['/menu-new']);
  }
  searchMenuList(status: boolean) {
    this.loadCtrl.create({
      message:'Processing..',

    }).then(el=>{
      el.present();
      this.menulistdata = [];
      this.search_param_menulist.code = this.searchVal;
      this.search_param_menulist.description = this.searchVal;
      let data: any =
      {
        "code": this.search_param_menulist.code,
        "description": this.search_param_menulist.description,
        "currentPage": this.pagerData.currentPage,
        "isWebPos": "1", "pageSize": this.pagerData.pageSize
      };
      data._isWebPos = "1"
      let url: string = this.manager.appConfig.apiurl + 'menu/menulist/';
      this.http.post(url, data, this.manager.getOptions()).subscribe(
        (data: any) => {
          el.dismiss();
          if (data.menulistdata != null && data.menulistdata != undefined && data.menulistdata.length > 0) {
            this.menulistdata = data.menulistdata;
            this.pagerData.totalCount = data.totalCount;
          } else {
          }
        },
        error => {
          el.dismiss();
        }
      );
    })
    
  }
  getDefaultSearchObject() {
    return { "code": "", "description": "", "currentPage": 1, "pageSize": this.pagerData.pageSize };
  }
  detail(syskey) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "id": syskey
      }
    };
    this.router.navigate(['/menu-new'], navigationExtras);
  }
  delete(id,parent){
    const url = this.manager.appConfig.apiurl + "menu/deletemenu/" + id + "/" + parent;
    this.http.get(url, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.message === "SUCCESS") {
          this.manager.showAlert(this.alertController, "Message", "Success");
          this.searchMenuList(false);
        }
      }
      , error => {
        this.manager.showAlert(this.alertController, "Message", "Fail");
      }
    )
  }

}
