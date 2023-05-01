import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Platform, Events, MenuController, AlertController, IonSplitPane, IonMenu, IonItem, PopoverController, ToastController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ControllerService } from './controller.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PopoverPage } from './popover/popover.page';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { Network } from '@ionic-native/network/ngx';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { TspPage } from './tsp/tsp.page';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

declare var $: any;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],

  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ opacity: 0 }),
            animate('0.5s ease-out',
              style({ opacity: 1 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ height: 300, opacity: 1 }),
            animate('0.2s ease-in',
              style({ height: 0, opacity: 0 }))
          ]
        )
      ],

    ),
    trigger('openClose', [
      // ...
      state('open', style({
        height: '200px',
        opacity: 1,

      })),
      state('closed', style({
        height: '100px',
        opacity: 0.5,

      })),
      transition('open => closed', [
        animate('1s')
      ]),
      transition('closed => open', [
        animate('0.5s')
      ]),
    ]),
  ]
})
export class AppComponent implements OnInit {
  @ViewChild(IonMenu, { static: false }) ionmenu !: IonMenu;
  @ViewChild(IonItem, { static: false }) ionitem !: IonItem;
  date = new FormControl(moment());

  public userName = "";
  public ph = "";
  public selectedIndex = 0;
  public showmenu = false;
  public disableMenu = false;
  public ver: any = '';
  public previousChildMenu;
  public version = "";
  public title: '';
  prev: any = '';
  parent: any = '';
  avatar = "assets/img/avatar.png";
  userImage = "";
  public showToolbar:boolean =  false;
  public appPages = [];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public http: HttpClient,
    public manager: ControllerService,
    public events: Events,
    public router: Router,
    public menu: MenuController,
    public alertController: AlertController,
    public menuCtrl: MenuController,
    public popOverCtrl: PopoverController,
    private network: Network

  ) {
    if(sessionStorage.getItem('usk') != null && sessionStorage.getItem('usk') != undefined){
      this.addtoManager();
    }

    this.events.subscribe('username', (user) => {
      this.userName = user.userName;
      this.ph = user.userId;
      this.ver = this.manager.appConfig.ver;
    });
    this.events.subscribe('version', (v) => {
      this.version = v;
    });
    this.events.subscribe('pageready', (pages) => {
      this.appPages = pages;
      this.router.navigate(['/home']);
    });
    this.events.subscribe('logout', (ev) => {
      this.Logout();
    });
    this.events.subscribe('image', (ev) => {
      if (ev !== '') {
        this.userImage = this.manager.appConfig.imgurl + ev;
      } else {
        this.userImage = "";
      }
    });
    this.events.subscribe('loginViewDidEnter', (ev) => {
     this.showToolbar = true;
     this.menuCtrl.enable(true);
    });

    this.subscribeNetWorkStatus();

  }

  addtoManager(){
    this.manager.isLogin = true;
    this.manager.user.userSk = sessionStorage.getItem('usk');
    this.manager.user.orgId = sessionStorage.getItem('token');
    this.manager.user.userId = sessionStorage.getItem('uid');
    this.manager.user.userName = sessionStorage.getItem('uname');
    this.manager.user.rightMenus = JSON.parse(sessionStorage.getItem('user-right'));
    this.manager.user.usertype = parseInt(sessionStorage.getItem('utype'));
    this.manager.settingData = JSON.parse(sessionStorage.getItem('settingData'));
  }

  async checkSession() {
    let p = sessionStorage.getItem('pages') === null ? '' : sessionStorage.getItem('pages');
    if (p !== '') {
      this.appPages = JSON.parse(p);
      if (!this.menuCtrl.isEnabled) this.menuCtrl.enable(true);

      this.manager.user.userSk = sessionStorage.getItem('usk');
      this.manager.user.orgId = sessionStorage.getItem('token') === null ? '' : sessionStorage.getItem('token');
      this.manager.user.userId = sessionStorage.getItem('uid');
      this.manager.user.userName = sessionStorage.getItem('uname');
      this.manager.user.rightMenus = JSON.parse(sessionStorage.getItem('user-right'));
      this.version = sessionStorage.getItem('version');
      this.manager.user.usertype = parseInt(sessionStorage.getItem('utype'));
      this.userName = this.manager.user.userName;
      this.ph = this.manager.user.userId;

      const url = sessionStorage.getItem("image");
      if (url == "") {
        this.userImage = "";
      } else {
        this.userImage = (url == undefined || url == null) ? '' : this.manager.appConfig.imgurl + url;
      }

      let pa = sessionStorage.getItem('parent');
      let c = sessionStorage.getItem('child');

      this.menuCtrl.enable(true);
      this.showToolbar = true;
      this.appPages.forEach(page => {
        if (page.title === pa) {
          page.flag = true;
          page.child.forEach(chi => {
            if (chi.code === c) {
              this.prev = chi;
              chi.style = true;
              this.router.navigate(['/' + chi.url]);
            }
          });
        }
      })
    }
  }

  onSplitPaneChange(e) {
    if (e.detail.visible) {
      this.manager.splitPaneVisible = true;
    } else {
      this.manager.splitPaneVisible = false;
    }
    this.events.publish("splitEvent", this.manager.splitPaneVisible);
  }
  menuButton() {
    this.manager.controlMenu(this);
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  ionDidClose() {
    this.showmenu = false;
  }

  async ngOnInit() {
    this.initializeApp();
    await this.readConfig();
    this.menuCtrl.enable(false);
    this.checkSession();

    this.network.onDisconnect().subscribe(() => {
      console.log('network was disconnected :-(');
    });
    this.network.onConnect().subscribe(() => {
      console.log('network connected!');
      // We just got a connection but we need to wait briefly
      // before we determine the connection type. Might need to wait.
      // prior to doing any api requests as well.
      setTimeout(() => {
        if (this.network.type === 'wifi') {
          console.log('we got a wifi connection, woohoo!');
        }
      }, 3000);
    },
      error => {
        console.log(error)
      }
    );
  }
  ngAfterViewInit() {
    this.manager.ionMenu = this.ionmenu;
  }
  readConfig() {
    return new Promise<void>(done => {
      this.http.get('assets/config/config.json').subscribe(
        (data: any) => {
          this.manager.appConfig.app = data.app;
          this.manager.appConfig.appname = data.appname;
          this.manager.appConfig.defaultDomain = data.defaultDomain;
          this.manager.appConfig.apiurl = data.apiurl ;
          this.manager.appConfig.imgurl = data.imgurl;
          this.manager.appConfig.debug = data.debug;
          
          done();
        }, (error) => {
          done();
          console.log(error);
        }
      );
    })


  }
  public readMenus() {
    return new Promise<void>(done => {
      this.http.get('assets/config/menu.json').subscribe(
        (data: any) => {
          var keepGoing = true;
          this.appPages = data.appPages;
          this.appPages.forEach(page => {
            if(this.manager.settingData.n9 !== '1') {
              if(keepGoing) {
                if (page.title === 'Reports') {
                  const indiceABorrar = page.child.findIndex((i) => {
                    return (i.title === 'Returnable Packaging report');
                  });
                  page.child.splice(indiceABorrar,1);
                  keepGoing = false;
                  // page.child.forEach(child => {
                  //   if(keepGoing) {
                  //   }
                  // });  
                }
              }
            }
          })
          done();
        }, (error) => {
          done();
          console.log(error);
        }
      );
    })


  }
  go(url, childmenu) {
    var itemsProcessed = 0;
    if (this.previousChildMenu != undefined)
      this.previousChildMenu.style = false;
    childmenu.style = true;
    this.previousChildMenu = childmenu;
    this.appPages.forEach(page => {
      itemsProcessed++;
      if (itemsProcessed === this.appPages.length) {
        this.menu.close('first');
        this.router.navigate([url]);
      }
    })
  }
  gohome() {
    this.router.navigate(['/home']);
  }
  showChild(title: any) {
    if (title === 'Logout') {
      this.Logout();
      return;
    }
    this.appPages.forEach(page => {
      this.showmenu = false;
      if (page.title === title) {
        if (page.flag === false) page.flag = true;
        else page.flag = false;
      }
    });

  }
  Logout() {
    this.alertController.create({
      message: 'logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Ok',
          handler: () => {
            sessionStorage.clear();
            this.manager.user.orgId = '';
            this.manager.user.userName = "";
            this.userName = '';
            window.location.reload();
          }
        }
      ]
    }).then(alert => alert.present());
  }
  back() {
    this.manager.back();
  }
  removesession() {
    sessionStorage.clear();
    this.manager.user = this.manager.getLogiUserData();

    this.userName = '';
  }
  toggleUser(e) {
    this.manager.showPopOver(this.popOverCtrl, PopoverPage, e).then(
      e => {

      }
    )
  }
  childClick(child, pt) {
    this.disableMenu = true;

    if (this.prev !== '') {
      this.prev.style = false;
      if (this.parent != '') {
        if (this.parent.title != pt.title) {
          this.parent.flag = false;
        }
      }
    }
    child.style = true;
    sessionStorage.setItem('child', child.code);
    sessionStorage.setItem('url', child.url);
    this.parent = pt;
    this.prev = child;
    // this.title = child.title;
    this.router.navigate([child.url]);


  }
  parentClick(p) {

    this.appPages.forEach(ps => { if (ps.title !== p.title) ps.flag = false });
    p.flag ? p.flag = false : p.flag = true;
    if (p.flag) sessionStorage.setItem('parent', p.title);

    // this.parent = p;
  }

  // getVersion() {
  //   const url = this.manager.appConfig.apiurl + 'main/version';
  //   try{
  //     this.events.publish('version', sessionStorage.getItem('version').toString());
  //   }catch(e){
  //     this.http.get(url, this.manager.getOptions()).subscribe(
  //       (v: any) => {
  //         this.events.publish('version', v);
  //       }
  //     )
  //   }

  // }

  subscribeNetWorkStatus() {
    this.manager.speed()
  }

}
