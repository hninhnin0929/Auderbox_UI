import { Component, OnInit, ViewChild } from '@angular/core';
import { IonTabs, PopoverController, Events, AngularDelegate, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { PopoverPage } from '../popover/popover.page';

import { ControllerService } from '../controller.service';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AppComponent } from '../app.component';
declare var $: any;
@Component({
  selector: 'app-menu-new',
  templateUrl: './menu-new.page.html',
  styleUrls: ['./menu-new.page.scss'],
})
export class MenuNewPage implements OnInit {
  option: boolean = this.manager.splitPaneVisible;
  isParent: boolean = true;
  obj: any = this.getObj();
  buttonArray: any = [];
  buttonShow: boolean = true;
  parentCode = "0";
  parentMenuList: any = [];
  codelist:any=[];
  constructor(
    private http: HttpClient,
    private manager: ControllerService,
    public event: Events,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public popover: PopoverController,
    public alertController: AlertController,
    public tostCtrl: ToastController,
    public loadCtrl: LoadingController,
    public app:AppComponent
  ) {
    this.event.subscribe('splitEvent', (e) => {
      this.option = e;
    });
    this.event.subscribe('operation', (e) => {
      switch (e) {
        case 0: this.save(); break;
        case 1: this.goDelete(); break;
        case 2: this.goList();
      }
    })
  }
  parentChange() {

  }

  ngOnInit() {
    // this.getButtonlist();
    this.getParentMenu();
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
    if (!this.manager.isLoginUser()) this.router.navigate[('/login')];
    this.codelist = [];
   this.app.appPages.forEach(p => {
     p.child.forEach(c=>{
      this.codelist.push(c);
     })
   });
    if (this.buttonArray.length === 0 && this.parentMenuList.length === 0) {
      // this.getButtonlist();
      this.getParentMenu();
    }
    $('#mndnew-tab').tab('show');

  }
  goback() {
    this.router.navigate(['/menu-list']);
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

    if (this.valide() == false) return;
    this.manager.showLoading(this.loadCtrl, "Processing..", 0).then(
      loadobj => {
        loadobj.present();
        let url: string = this.manager.appConfig.apiurl + 'menu/savemenu';
        this.updateObj();
        this.obj.userSyskey = this.manager.user.userSk;
        this.obj.userId = this.manager.user.userId;
        this.obj.userName = this.manager.user.userName;
        //this.obj.t4 = this.getButtonData();
        this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
          (data: any) => {
            loadobj.dismiss();

            if (data.message === "SUCCESS") {

              this.manager.showToast(this.tostCtrl, 'Message', 'Saved Successfully.', 1000).then(
                e => {
                  this.obj = this.getObj();
                  this.router.navigate(['/menu-list']);
                }

              )

            }
            else if (data.message === "CODEEXISTS") {
              // this.manager.showAlert(this.alertController, 'Message', 'Code Already Exist.');
              this.manager.showToast(this.tostCtrl, 'Message', 'Code Already Exist.', 2000).then(
                e => {

                }

              )

            } else if (data.message === "DPARENT") {
              //this.manager.showAlert(this.alertController, 'Message', 'Child Menu Already Exist.');
              this.manager.showToast(this.tostCtrl, 'Message', 'Child Menu Already Exist.', 2000).then(
                e => {

                }

              )

            }
            else {
              // this.manager.showAlert(this.alertController, 'Message', 'Fail.');
              this.manager.showToast(this.tostCtrl, 'Message', 'Fail', 2000).then(
                e => {

                })}
         
          },
          error => {
            loadobj.dismiss();
            this.obj = this.getObj();
            this.manager.showAlert(this.alertController, 'Message', 'Fail.');
          }
        );
        
      }
    )


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
    //this.router.navigate(['/setup/securitysetting/menus-list']);
  }
  goDelete() {
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
    const url = this.manager.appConfig.apiurl + "menu/deletemenu/" + this.obj.syskey + "/" + this.obj.n2;
    this.http.get(url, this.manager.getOptions()).subscribe(
      (data: any) => {
        el.dismiss();
        if (data.message === "SUCCESS") {
          this.manager.showToast(this.tostCtrl, "Message", "Deleted Successfully!", 1000).then(
            e => {
             this.router.navigate(['/menu-list']);          
         } ); 
            }else{
          this.manager.showToast(this.tostCtrl, "Message", "Deleting Fail!", 1000);
        }
      },
      (error: any) => {
        this.manager.showToast(this.tostCtrl,"Message","Deleting Fail!",1000);
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

  goReadBySyskey(p) {
    this.http.get(this.manager.appConfig.apiurl + 'menu/readmenu/' + p, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.obj = data;
        this.setButtonData(this.obj.t4);
        this.obj.menuType = data.menuType;
        if (this.obj.n2 === "0") {
          this.parentCode = this.obj.n3;
          this.isParent = false;
        } else {
          this.obj.parent = this.obj.n2;
          this.isParent = true;
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
    const url = this.manager.appConfig.apiurl + 'menu/getparentmenu/';
    this.http.get(url, this.manager.getOptions()).subscribe(
      data => {
        this.parentMenuList = data;
        this.obj.l1 = this.parentMenuList[0].code;
      }
    );
  }
  presentPopover(ev) {
    this.manager.showPopOver(this.popover, PopoverPage, ev);
  }
  valide() {
    if (this.obj.t1.trim().length === 0) {
      this.manager.showAlert(this.alertController, 'Message', 'Invalid Code.');
      return false;
    }
    else if (this.obj.t2.trim().length === 0) {
      this.manager.showAlert(this.alertController, 'Message', 'Invalid Description.');
      return false;
    }
    else if (this.obj.t3.trim().length === 0 && this.obj.menuType == "3") {
      this.manager.showAlert(this.alertController, 'Message', 'Invalid Link.');
      return false;
    }
    return true;
  }
}
