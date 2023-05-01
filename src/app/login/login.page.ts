import { Component, OnInit } from '@angular/core';
import { AlertController, PopoverController, LoadingController, MenuController, Events, ModalController, ToastController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppComponent } from '../app.component';
import { UrlPage } from '../url/url.page';
import { ControllerService } from '../controller.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  color = "{'background-color':'red'}";
  urlshow: boolean = false;
  url: any = "";
  inputName: any = '';
  password: any = '';
  result: any = this.getResultObj();
  msg: any = '';
  domain: any;
  apiurl: any = '';
  returnUrl: any;
  conStatus: any;
  passcodeLogin = false;
  inputPasscode: any = '';
  title: any;
  language: any;
  label: any = [];
  spinner: boolean = false;
  config: any = {
    debug: false
  }
  remember: boolean = false;

  //test
  fileupload: any;
  constructor(
    public alertController: AlertController,
    private popoverController: PopoverController,
    public menuCtrl: MenuController,
    public router: Router,
    private http: HttpClient,
    public events: Events,
    public app: AppComponent,
    public modalController: ModalController,
    public route: ActivatedRoute,
    public manager: ControllerService,
    public tostCtrl: ToastController
  ) {
  }
  getResultObj() {
    return {
      orgId: ""
    }
  }

  ngOnInit() {
    this.inputName = '';
    this.password = '';
    this.inputPasscode = '';
    this.passcodeLogin = false;
    this.http.get('assets/lang/login.json').subscribe(
      (data: any) => {
        if (this.manager.appConfig.languageCode === 'E') this.label = data.e;
        else this.label = data.m;
        this.title = this.label[5];
      }
    );
  

  }
  ionViewWillEnter() {
    sessionStorage.clear();
    this.manager.user.orgId = '';
    this.manager.user.userName = "";
    this.app.userName = '';
    this.menuCtrl.enable(false);
    this.passcodeLogin = false;
    this.url = this.manager.appConfig.apiurl;
    this.result.orgId = this.manager.user.orgId;
    this.config = this.manager.appConfig;
    try {
      let sess = localStorage.getItem("session");
      let sessObj = JSON.parse(sess) as any;
      let id = this.manager.decrypt(sessObj.ss2, sessObj.ss1, sessObj.ss3);
      let pass = this.manager.decrypt(sessObj.ss2, sessObj.ss1, sessObj.ss4);

      this.remember = sessObj.rm;
      this.inputName = id;
      this.password = pass;

    } catch (err) {
      //console.error(err);
    }
    
   
  }
  passcode() {
    this.inputName = '';
    this.password = '';
    this.inputPasscode = '';
    if (this.passcodeLogin === false) {
      this.passcodeLogin = true;
      this.title = this.label[4];
    } else {
      this.passcodeLogin = false;
      this.title = this.label[5];
    }
  }
  userIdOnBlur() {
    var id = this.inputName;
    var id2 = '';
    if (id.startsWith('+95')) {
      id2 = id.substring(3, id.length);
    } else if (id.startsWith('95')) {
      id2 = id.substring(2, id.length);
    } else id2 = id;
    if (id2.startsWith('09')) {
      this.inputName = '95' + id2.substr(1, id2.length);
    } else if (id2.startsWith('9')) {
      this.inputName = '95' + id2;
    }

  }
  async goto() {
    this.spinner = true;
    this.manager.appConfig.apiurl = this.url;
    const postparams = {
      userId: this.inputName,
      password: this.password,
      passcode: this.inputPasscode

    };
    const url = this.manager.appConfig.apiurl + 'main/logindebug/' + this.manager.appConfig.defaultDomain; 
    let caller;
    let timmer = setTimeout(() => {
      this.spinner = false;
      this.manager.showToast(this.tostCtrl, 'Message', "Can't connect to server", 1000);
      caller.unsubscribe();
    }, 10000);

    caller = this.http.post(url, postparams, this.manager.getOptions())
      .subscribe(
        async data => {
          this.result = data;
          if (this.result.orgId.length != 0) {
            this.manager.isLogin = true;
            this.events.publish('username', this.result);
            this.events.publish('version', this.result.version);
            this.events.publish('image', this.result.imageUrl);
            
            this.manager.user.userSk = this.result.syskey;
            this.manager.user.orgId = this.result.orgId;
            this.manager.user.userId = this.result.userId;
            this.manager.user.userName = this.result.userName;
            this.manager.user.rightMenus = this.result.loginUserRoles;
            this.manager.user.usertype = this.result.usertype;
            this.manager.settingData = this.result.settingData;
            sessionStorage.setItem('settingData', JSON.stringify(this.result.settingData));
            await this.app.readMenus();
            // let role;
            // role = this.result.roleData.filter(role => {
            //  return role.t2==='Admin'
            // });
            
            // if(role.length > 0) {
            //   sessionStorage.setItem('role', role[0].t2);
            // } else if(this.manager.user.userId === 'admin'){
            //   sessionStorage.setItem('role','Admin');
            // }

            
            if(this.result.userId === 'admin') {
              sessionStorage.setItem('isMasterRole', 'true');
            } else {
              sessionStorage.setItem('isMasterRole', 'false');
              if(this.result.roleData.length > 0) {
                for(var i=0; i<this.result.roleData.length; i++) {
                  if(this.result.roleData[i].t1 === 'Master') {
                    sessionStorage.setItem('isMasterRole', 'true');
                    break;
                  }
                }
              }
            }
            sessionStorage.setItem('version', this.result.version);
            sessionStorage.setItem('usk', this.result.syskey);
            sessionStorage.setItem('token', this.result.orgId);
            sessionStorage.setItem('uid', this.result.userId);
            sessionStorage.setItem('uname', this.result.userName);
            sessionStorage.setItem('utype', this.result.usertype);
            sessionStorage.setItem('image', this.result.imageUrl);
            sessionStorage.setItem('user-right', JSON.stringify(this.result.loginUserRoles));

            if (this.remember) {
              let ivs = this.manager.getIvs();
              let salt = this.manager.getIvs();
              let encpass = this.manager.encrypt(salt, ivs, postparams.password);
              let encid = this.manager.encrypt(salt, ivs, postparams.userId);
              // let dec = this.manager.decrypt(salt,ivs,enc);

              let session = {
                ss1: ivs,
                ss2: salt,
                ss3: encid,
                ss4: encpass,
                rm: true
              }
              localStorage.setItem("session", JSON.stringify(session));
            } else {
              localStorage.removeItem("session");
            }



            sessionStorage.setItem('curpage', '');
            this.inputName = '';
            this.password = '';
            await this.manager.permitPagesToUser(this.app.appPages);
            this.spinner = false;
            clearTimeout(timmer);
          } else {
            this.spinner = false;
            clearTimeout(timmer);
            this.manager.showToast(this.tostCtrl, 'Message', "Invalid User ID or Password", 2000);
          }
        },
        error => {
          this.router.navigate(['/']);
        }
      );
  }
  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: UrlPage,
      event: ev,
      cssClass: 'pop-over-style'
    });
    popover.present();
  }
  alert(title, messages) {
    this.alertController.create({
      translucent: true,
      header: title,
      message: messages,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          handler: (ok) => {
          }
        }
      ]
    }).then(alert => alert.present());
  }
  passcodeInput(numbers: any) {
    this.inputPasscode += numbers;

  }
  backspace() {
    this.inputPasscode = this.inputPasscode.substring(0, this.inputPasscode.length - 1);
  }
  ionViewDidLeave(){
    console.log("login view did leave");
    this.events.publish("loginViewDidEnter","");
  }

}
