import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ViewChildren, OnChanges, SimpleChanges } from '@angular/core';
import { IonContent, AlertController, NavController, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { AppComponent } from '../app.component';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { MatDatepicker, MatDatepickerContent } from '@angular/material/datepicker';
import { DomSanitizer } from '@angular/platform-browser';
import { UserAndUTypeJunctionData, UserData } from './interface';
import { geoNaturalEarth1 } from 'd3-geo';
declare var $: any;

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit, AfterViewInit, OnChanges {
  @ViewChild(IonContent, { static: false }) theContent: IonContent;
  @ViewChild('myDatepicker', { static: false }) matDatepicker: MatDatepicker<Date>;
  @ViewChild('userfileinput', { static: false }) imgFileInput: ElementRef;
  @ViewChild(ImageCropperComponent, { static: false }) imgCropper: ImageCropperComponent;
  subscription: Subscription;
  _objRoleArray = [];
  hide = true;
  _obj = this.getDefaultObj();
  roleDList: any = [{ n1: 0, n2: 0, t1: 'Master', t2: 'Master' }, { n1: 0, n2: 0, t1: 'Casher', t2: 'Casher' }, { n1: 0, n2: 0, t1: 'Sale', t2: 'Sale' }, { n1: 0, n2: 0, t1: 'Supervisor', t2: 'Supervisor' }];
  _pagerData = { currentPage: 1, totalCount: 0 };
  sub: any;
  isShowMerchandizer = true;
  _userList: any = [];
  myDatepicker: any;
  _objArray = [];
  temp: any = { confirmPassword: '', confirmPasscode: '' };
  _check = { pwdStatus: false, psdStatus: false };
  _roleMenus = [{ id: 'role', description: 'Role' }, { id: 'rptrole', description: 'Location Role' }, { id: 'kitchenrole', description: 'Kitchen' }];
  userType = this._getUserTypeSetUpData();
  teamType = [
    { code: 0, val: "-" },
    { code: 1, val: "Modern Trade" },
    { code: 2, val: "Traditional Trade" },

  ]
  _locsyskey = { individual: '0', locgroup: '0' };
  _locationRoleDatas = [];
  _flag = 1;
  _checkStatus = false;
  flagsave = false;
  _btnRight = [];
  _status = true;
  storeOwner = true;
  roleFlag = true;
  directRoleAdd: boolean;
  loaded = false;
  nrc: any = this.getNrc();
  image: any;
  merchandizer: any;
  teamlist: any = [];
  cropper: any;
  shopList: any = [];
  user_roles = []
  update = false;
  updatePass: any;
  //
  userImg: any = "";
  userImgDef: any = ""
  imageChangedEvent: any = '';
  croppedImage: any = '';
  defImg: string = 'assets/img/not-found.png';
  croperReady: boolean;


  stateList = [];
  districtList = [];
  nList = [];
  saveBtn_Access: boolean = false;
  deleteBtn_Access = false;
  resetPwd_Access = false;
  activate_Access = false;
  districtListTemp = [];

  def_roles: any = [];
  isMaster: any = false;

  constructor(
    private route: ActivatedRoute,
    private _router: Router,
    private http: HttpClient,
    private ics: ControllerService,
    public alertController: AlertController,
    public nav: NavController,
    public manager: ControllerService,
    public element: ElementRef,
    public modalCtrl: ModalController,
    public tostCtrl: ToastController,
    public loading: LoadingController,
    public altCtrl: AlertController,
    public app: AppComponent,
    public _DomSanitizationService: DomSanitizer


  ) {
    this.ics.isLoginUser();
    route.data.subscribe((d: any) => {
    });

    this._obj.roleData = this.roleDList;
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log("changes")
  }
  ngAfterViewInit() {
    let user_type_list: any = document.querySelectorAll('input[name="usertype-detail"]');
    for (let ut of user_type_list) {
      ut.addEventListener('change', () => {
        if (ut.value == '4') {
          if (ut.checked) {
            user_type_list.forEach(ch => {
              if (ch.value !== '4') {
                ch.disabled = true;
                ch.checked = false;
              }
            });
          } else {
            user_type_list.forEach(ch => {
              ch.disabled = false;
            });
          }
          //store owner

        } else {
          if (ut.checked) {
            user_type_list.forEach(ch => {
              if (ch.value == '4') {
                ch.disabled = true;
                ch.checked = false;
              }
            });

          } else {
            let other_checked: boolean = false;
            for (let utl of user_type_list) {
              if (utl.checked) {
                other_checked = true;
              }
            }
            if (!other_checked) {
              user_type_list.forEach(ch => {
                if (ch.value == '4') {
                  ch.disabled = false;
                }
              });
            }

          }
        }
      })
    }

  }
  back() {
    this.nav.navigateBack('/user-list');
  }
  listTab() {
    this.back();
  }
  ngOnInit() {
    this.ics.isLoginUser();
    this.getBtnAccess();
  }

  inputFileChange(e) {
    console.log('input file change');
    this.imageChangedEvent = event;
    const input = e.srcElement;
    const fileName = input.files[0].name;
    const label = document.getElementById('imginputLabel-user');
    label.textContent = fileName;
    $('#passportcropmodel').appendTo('body').modal('show');
  }
  cropImage() {
    console.log('crop image');
    let croppedImage = this.imgCropper.crop();
    this.userImg = croppedImage.base64;
    $('#passportcropmodel').appendTo('body').modal('hide');
    this.croperReady = false;
  }
  cropImageCencel() {
    console.log('cropimagecencel')
    this.croperReady = false;
    $('#passportcropmodel').appendTo('body').modal('hide');
  }
  imageCropped(event: ImageCroppedEvent) {
    console.log('imageCropped ')
    $('#passportcropmodel').appendTo('body').modal('hide');
  }
  imageLoaded() {
    this.croperReady = true;
    console.log('image loaded ');
  }
  cropperReady() {
    this.croperReady = true;
    console.log('cropperReady');
  }
  loadImageFailed() {
    console.log('loadImageFailed'); // show message
  }
  previewStockImage() {

  }
  previewModelClose() {

  }
  clearImage() {

    this.imgFileInput.nativeElement.value = '';
    const label = document.getElementById('imginputLabel-user');
    label.textContent = '*';
    this.userImg = this.defImg;
  }


  ionViewDidLeave() {
    this.nrc = this.getNrc();
  }
  userIdOnBlur() {
    let id = '' + this._obj.userId;
    let id2 = '';
    if (id.startsWith('+95')) {
      id2 = id.substring(3, id.length);
    } else if (id.startsWith('95')) {
      id2 = id.substring(2, id.length);
    } else { id2 = id; }
    if (id2.startsWith('09')) {
      this._obj.userId = id2.substr(1, id2.length);
    } else if (id2.startsWith('9')) {
      this._obj.userId = id2;
    } else {
      if (typeof id2 == 'number') {
        this._obj.userId = '9' + id2;
      } else { this._obj.userId = id2; }

    }
  }
  getNrc() {
    return { 'n1': '', 'n2': '', 'n3': '', 'n4': '' };
  }
  getDefaultObj(): UserData {
    return { syskey: '0', loginUserId: '', loginUserName: '', userId: '', userName: '', password: '', orgId: '', status: '', phone: '', otp: '', location: '', deviceId: '', email: '', teamSyskey: '0', usertype: 0, merchandizer: 0, requestType: 0, address: '', dob: '', webSite: '', sex: '', mmName: '', nrc: '', imageUrl: '', otherID: '', roleData: [], teamtype: 0, loginUserRoles: [], multiUserType: [] };
  }
  _getUserTypeSetUpData() {
    return [
      // { code: 0, val: "NA", check: false },
      { code: 1, val: "Sales rep", check: false },
      { code: 2, val: "Deliverer", check: false },
      { code: 3, val: "Surveyor", check: false },
      { code: 4, val: "Store Owner", check: false },
    ]
  }
  getShopPersonObj() {
    return {
      userSysKey: '',
      shopSysKey: '',
      teamSysKey: '',
      t1: '',
      recordStatus: 1
    };
  }
  _getUserTypeData() {
    return {
      syskey: '0',
      autokey: 0,
      createddate: '',
      modifieddate: '',
      userid: '0',
      username: '',
      RecordStatus: 0,
      SyncStatus: 0,
      SyncBatch: 0,
      t1: '',
      t2: '',
      t3: '',
      t4: '',
      t5: '',
      t6: '',
      t7: '',
      t8: '',
      t9: '',
      t10: '',
      t11: '',
      t12: '',
      t13: '',
      t14: '',
      t15: '',
      t16: '',
      t17: '',
      t18: '',
      t19: '',
      t20: '',
      n1: '0',
      n2: '0',
      n3: '0',
      n4: '0',
      n5: '0',
      n6: '0',
      n7: '0',
      n8: '0',
      n9: '0',
      n10: '0',
      n11: 0,
      n12: 0,
      n13: 0,
      n14: 0,
      n15: 0,
      UserSysKey: '0',
      n16: 0,
      n17: 0,
      n18: 0,
      n19: 0,
      n20: 0,
      n21: 0,
      n22: 0,
      n23: 0,
      n24: 0,
      n25: 0,
      n26: 0,
      n27: 0,
      n28: 0,
      n29: 0,
      n30: 0

    }

  }
  async ionViewWillEnter() {
    this.manager.isLoginUser();
    const loading = await this.loading.create({ message: 'Loading .. ' });
    $('.myOuterContainer').addClass('disabled');
    await loading.present();
    loading.message = 'Retrieving user roles .. '
    await this.getDefaultRoleData().then((e: any) => { this.def_roles = e }).catch(e => { loading.dismiss() });
    this.getTeam();
    this._obj = this.getDefaultObj();
    this.userImg = this.defImg;
    this.loaded = true;
    $('#usersnew-tab').tab('show');
    this.getNRC();

    let myid = "";
    await new Promise<void>((resolve, reject) => {
      this.sub = this.route.queryParams.subscribe(params => {
        const id = params.s;
        if (id != null && id !== '') {
          myid = id;
          resolve();
        } else {
          myid = "";
          resolve();
        }
      });
    });
    if (myid == "") {
      this.goNew();
    } else {
      loading.message = 'Reading user .. '
      await this.goReadBySyskey(myid);
      this.directRoleAdd = true;
      this.roleFlag = true;
    }
    if(sessionStorage.getItem('isMasterRole') === 'true') {
      this.isMaster = true;
    }
    loading.dismiss();
    $('.myOuterContainer').removeClass('disabled');


  }
  goNew() {
    this._flag = 1;
    this.update = false;
    this._locsyskey.individual = '0';
    this._obj = this.getDefaultObj();
    this.temp.confirmPassword = '';
    this.temp.confirmPasscode = '';
    this._obj.roleData = this._objArray;
    this._obj.roleData.forEach(e => { e.n2 = 0; });
    this._status = true;
    this.userImg = this.defImg;
    this.nrc = this.getNrc();
    this.merchandizer = false;
    this.clearImage();
    this.userType.forEach(u => u.check = false);
    this.def_roles.forEach(df => df.n2 = false)
  }
  gotoSave() {
    const url: string = this.ics.appConfig.apiurl + 'user/save';
    let param = Object.assign({}, this._obj);

    this.updateRoleData(param);
    param.status = (this._status) + '';

    if (this.isValid()) {
      param.userId = param.userId.replace(/\s/g, '');
      param.userId = '95' + param.userId;
      param.loginUserId = this.ics.user.userId;
      param.loginUserName = this.ics.user.userName;
      param.status = this._status === true ? '0' : '1';
      param.dob = param.dob === '' || param.dob === undefined ? '' : this.manager.formatDate(new Date(param.dob), 'yyyyMMdd');
      param.nrc = this.nrc.n1 + ',' + this.nrc.n2 + ',' + this.nrc.n3 + ',' + this.nrc.n4;
      param.merchandizer = this.merchandizer === true ? 0 : 1;
      if (this.userImg !== this.defImg && this.userImg !== this.userImgDef) {
        param.imageUrl = this.userImg;
      } else {
        param.imageUrl = "";
      }
      param.multiUserType = (() => {
        let multi = [];
        const user_types: any = document.querySelectorAll('input[name="usertype-detail"]');
        for (let ut of user_types) {
          if (ut.checked && ut.value !== '0') {
            let type = this._getUserTypeData();
            type.n11 = parseInt(ut.value);
            if (ut.value == '1') {
              type.n2 = param.teamSyskey;
            } else {
              type.n2 = '0';
            }
            multi.push(type)
          }
        }
        return multi;
      })();
      if (param.multiUserType.length == 0) {
        let type = this._getUserTypeData();
        type.n11 = 0;
        param.multiUserType.push(type)
      }

      this.loading.create({
        message: 'Processing..',
        duration: 20000
      })
        .then(
          el => {
            el.present();
            let status = '';
            this.http.post(url, param, this.ics.getOptions()).subscribe(
              (data: any) => {
                status = data.message;
                el.dismiss();
              },
              e => {
                el.dismiss();
                this._router.navigate(['/user-list']);
                this.goNew();
              }

            );
            el.onDidDismiss().then(
              on => {
                if (status == '') {
                  this.tostCtrl.create(
                    {
                      message: "Time out!",
                      duration: 2000
                    }
                  )
                }
                else {

                  this.manager.showToast(this.tostCtrl, 'Message', status, 2000).then(
                    e => {
                      if (param.requestType == 2 && this.manager.user.userSk == param.syskey) {
                        this.app.removesession();
                        this._router.navigate(['/user-list']);
                      } else {
                        if (status == 'SUCCESS') {
                          this.goNew();
                          this._router.navigate(['/user-list']);
                        } else {
                          this._obj.userId = ''
                        }

                      }
                    }
                  );
                }
              }
            );
          }
        );
    }
  }
  isValid() {
    if (this._obj.userId.trim().length === 0 && this._obj.userId.trim().length < 12) {
      this.alert('', 'Invalid User ID.');
      return false;
    } else if (this._obj.userName.trim().length === 0) {
      this.alert('', 'Invalid UserName.');
      return false;
    } else if (this._obj.sex.trim().length === 0) {
      this.alert('', 'Invalid gender.');
      return false;
    } else if (this._obj.dob.toString().trim().length === 0) {
      this.alert('', 'Invalid date of birth.');
      return false;
    } else if (this.nrc === '') {
      this.alert('', 'Invalid NRC.');
      return false;
    } else if (this._obj.password.length === 0) {
      this.alert('', 'Invalid password');
      return false;
    }

    if (!this.update) {
      if (this._obj.password.length > 0) {
        if (this._obj.password.trim().length === 0) {
          this._obj.password = '';
        } else if (this.temp.confirmPassword !== this._obj.password) {
          this.alert('', 'These Passwords Don\'t Match.');
          return false;
        }
      }
    }

    return true;
  }

  updateRoleData(updatedObj) {
    updatedObj.roleData = [];
    for (let myrole of this.def_roles) {
      if (myrole.n2) {
        myrole.n2 = 1;
        updatedObj.roleData.push(myrole);
      }
    }
  }

  getDefaultData() {
    const url: string = this.ics.appConfig.apiurl + 'user/getRoleData';
    this.http.get(url, this.ics.getOptions()).subscribe(
      (data: any) => {
        if (data.length > 0) {
          this._obj.roleData = data;
          this._objArray = data;
          this.user_roles = data;
        } else {
        }
      }
    );
  }

  showRoles() {
    if (this.roleFlag == false) {
      this.roleFlag = true;
      if (!this.directRoleAdd) {
        this.theContent.scrollToPoint(0, 400).then(() => { })
      }
    } else {
      this.roleFlag = false;
    }
  }
  getTeam() {
    const url = this.manager.appConfig.apiurl + 'team/getteamlist';
    this.http.get(url, this.manager.getOptions()).subscribe(
      (data: any) => {

        if (data.status === 'SUCCESS!') {
          this.teamlist = data.list;
        }
      },
      error => {

      }
    );
  }

  userTypeChange(e) {
    if (e.code == 1 && e.check) {
      $('#team-input').show();
    } else if (e == 1 && !e.check) {
      $('#team-input').hide();
    }

  }
  shopModel(d) {
    $('#shopModal').appendTo('body').modal('show');
  }
  getShops(d) {
  }
  getDefaultRoleData() {
    return new Promise((resolve, reject) => {
      const url: string = this.ics.appConfig.apiurl + 'user/getRoleData';
      this.http.get(url, this.ics.getOptions()).subscribe(
        (data: any) => {
          resolve(data);
        },
        e => {
          reject();
        }
      );

    })


  }
  async goReadBySyskey(p) {
    return new Promise<void>((resolve, reject) => {
      this.http.get(this.ics.appConfig.apiurl + 'user/read/' + p, this.ics.getOptions()).subscribe(
        (data: any) => {
          this.update = true;
          this._obj = data;
          this._obj.requestType = 0;

          let label = document.getElementById("imginputLabel-user");
          label.textContent = this._obj.userName;
          this.imgFileInput.nativeElement.value = "";

          const im = data.imageUrl == '' ? this.defImg : this.manager.appConfig.imgurl.concat(data.imageUrl);
          this.userImg = '';
          this.userImgDef = '';
          this.userImg = im;
          this.userImgDef = im;

          let id = data.userId;
          let id2 = '';
          if (id.startsWith('+95')) {
            id2 = id.substring(3, id.length);
          } else if (id.startsWith('95')) {
            id2 = id.substring(2, id.length);
          } else { id2 = id; }
          if (id2.startsWith('09')) {
            this._obj.userId = id2.substr(1, id2.length);
          } else if (id2.startsWith('9')) {
            this._obj.userId = id2;
          }
          this.updateData();
          this.temp.confirmPassword = this._obj.password;
          try {
            let n = this._obj.nrc.split(',');
            this.nrc.n1 = n[0] === undefined ? '' : n[0];
            this.nrc.n2 = n[1] === undefined ? '' : n[1];
            this.nrc.n3 = n[2] === undefined ? '' : n[2];
            this.nrc.n4 = n[3] === undefined ? '' : n[3];
          } catch (e) {

          }
          this._status = data.status === 'Active' ? true : false;
          this.merchandizer = data.merchandizer === 0 ? true : false;

          if (this._obj.dob.length !== 0) {
            const date = new Date(this.manager.formatDateByDb(this._obj.dob));
            this.matDatepicker.select(date);
          }
          let is_store_checked = false;
          for (let type of this.userType) {
            const typeIndex: number = this._obj.multiUserType.findIndex((multi: UserAndUTypeJunctionData) => { return multi.n11 == type.code });
            type.check = typeIndex == -1 ? false : true;
            if (type.check) {
              if (type.code == 1) {
                this._obj.teamSyskey = (this._obj.multiUserType[typeIndex] as UserAndUTypeJunctionData).n2;
              }
            }
            if (type.code == 4 && type.check) {
              is_store_checked = true;
            }
          }
          let user_type_list: any = document.querySelectorAll('input[name="usertype-detail"]');

          if (is_store_checked) {
            for (let ut of user_type_list) {
              if (ut.value !== '4') {
                ut.disabled = true;
              }
            }
          } else {
            let user_type_store: any = document.querySelector('input[name="usertype-detail"][value="4"]');
            user_type_store.disabled = true;
          }
          resolve();

        },
        e => {
          console.log(e);
          reject();
        }
      );
    })


  }

  updateData() {
    for (let rl of this.def_roles) {
      const role = this._obj.roleData.find(e => { return e.syskey == rl.syskey });
      if (role !== undefined) rl.n2 = 1;
    }
    this._status = this._obj.status == '0' ? true : false;
  }
  // goDelete() {
  //   let alert = this.alertController.create({
  //     message: 'Do you really want to delete?',
  //     header: 'Message',
  //     buttons: [
  //       {
  //         text: 'Cancel',
  //         role: 'cancel',
  //         handler: () => { }
  //       },
  //       {
  //         text: 'Ok',
  //         handler: () => {
  //           if (this._obj.syskey !== '0') {
  //             let _self = this;
  //             if (!this.ics.checkSaveRout()) { return; }
  //             if (this.manager.user.userSk == this._obj.syskey) {
  //               this.manager.showToast(this.tostCtrl, 'Message', 'You cant deactive yourself', 2000);
  //               return;
  //             }
  //             const url: string = this.ics.appConfig.apiurl + 'user/delete/' + _self._obj.syskey;
  //             _self.http.get(url, this.ics.getOptions()).subscribe(
  //               (data: any) => {
  //                 if (data.message === 'SUCCESS') {
  //                   this.manager.showToast(this.tostCtrl, "Message", "Deleted Successfully!", 1000).then(
  //                     e => {
  //                       this._router.navigate(['/user-list']);
  //                     }
  //                   );
  //                 } else if (data.message === 'FAIL') {
  //                   this.alert('', 'Deleting Fail.');
  //                 }
  //                 else {
  //                   this.alert('', 'Deleting Fail.');
  //                 }
  //               },
  //               error => { this.alert('', 'Deleting Fail.'); }
  //             );
  //           } else {
  //             this.alert('', 'No record to delete!');
  //           }
  //         }
  //       }
  //     ]
  //   }).then(
  //     el => {
  //       el.present();
  //     }
  //   );
  // }

  goDelete() {
    //this.delete_param.delete_Key = id;
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
            this.loading.create({
              message: "Processing",
              backdropDismiss: false,
              duration: 5000
            }).then(
              el => {
              el.present();
              if (this._obj.syskey !== '0') {
                let _self = this;
                if (!this.ics.checkSaveRout()) { return; }
                if (this.manager.user.userSk == this._obj.syskey) {
                  this.manager.showToast(this.tostCtrl, 'Message', 'You cant deactive yourself', 2000);
                  return;
                }
                const url: string = this.ics.appConfig.apiurl + 'user/delete/' + _self._obj.syskey;
                _self.http.get(url, this.ics.getOptions()).subscribe(
                  (data: any) => {
                    el.dismiss();
                    if (data.message === 'SUCCESS') {
                      this.manager.showToast(this.tostCtrl, "Message", "Deleted Successfully!", 1000).then(
                        e => {
                          this._router.navigate(['/user-list']);
                        }
                      );
                    } else if(data.message == "FAIL"){
                      this.manager.showToast(this.tostCtrl, "Message", "Deleted Failed", 1000);
                    }else {
                      this.manager.showToast(this.tostCtrl,"Message","Deleted Fail!",1000)
                    }
                  },
                  (error: any) => {
                    this.manager.showToast(this.tostCtrl,"Message","Deleting Fail!",1000);
                  });
                }
              })
              }
              }
              ]
              }).then(el => {
              el.present();
              })
              }

  shopMatchCencel() {
    this.shopList.forEach(element => {
      element.selected = false;
    });
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
  prompt() {
    const al = this.altCtrl.create({
      header: 'Update Password',
      message: '',
      inputs: [{
        name: 'npass',
        placeholder: 'New Password',
        type: 'password',
        value: ''
      }, {
        name: 'cpass',
        placeholder: 'Confirm Password',
        type: 'password',
        value: ''
      }],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this._obj.requestType = 0;
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',

          handler: (e) => {
            let pass = {
              npass: e.npass,
              cpass: e.cpass
            };


            if (pass.npass === pass.cpass) {
              this._obj.password = pass.npass;
              this._obj.requestType = 2;
              return true;
            } else {
              this._obj.requestType = 0;
              this.manager.showToast(this.tostCtrl, 'Message', 'Not Match', 2000);
              return false;
            }
          }
        }
      ]
    }).then(e => {
      e.present();

      e.onDidDismiss().then(
        el => {


        }
      );
    });
  }
  getStateList() {
    return new Promise<void>(promise => {
      const url = this.manager.appConfig.apiurl + 'nrc/getstateno';
      this.http.post(url, { 'syskey': '0' }, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.stateList = data.datalist;
          promise();
        },
        error => {
          console.log(error);
          promise();
        }
      );
    });
  }
  getDistrictList() {
    return new Promise<void>(promise => {
      const url = this.manager.appConfig.apiurl + 'nrc/getdistrict';
      this.http.post(url, { 'syskey': '0' }, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.districtListTemp = data.datalist;
          this.districtList = this.districtListTemp;
          // this.districtListTemp.sort((a, b) => (a.Code > b.Code) ? 1 : -1);
          promise();
        },
        error => {
          console.log(error);
          promise();
        }
      );
    });
  }
  getNList() {
    return new Promise<void>(promise => {
      const url = this.manager.appConfig.apiurl + 'nrc/getN';
      this.http.post(url, { 'syskey': '0' }, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.nList = data.datalist;
          promise();
        },
        error => {
          console.log(error);
          promise();
        }
      );
    });
  }
  async getNRC() {
    await this.getStateList();
    await this.getDistrictList();
    await this.getNList();
  }
  changeState() {
    const index = $('#dropDownMenuKategorie').prop('selectedIndex');
    this.districtList = [];
    for (let i = 0; i < this.districtListTemp.length; i++) {
      if (this.districtListTemp[i].parentid === this.stateList[index].syskey) {
        this.districtList.push(this.districtListTemp[i]);
      }
    }
  }

  getBtnAccess() {
    console.log('this.saveBtn_Access= ' + this.saveBtn_Access);
    const pages = this.app.appPages;
    for (let i = 0; i < pages.length; i++) {
      for (let y = 0; y < pages[i].child.length; y++) {
        if (pages[i].child[y].btns) {
          for (let z = 0; z < pages[i].child[y].btns.length; z++) {
            if (pages[i].child[y].btns[z].code === 'save' && pages[i].child[y].btns[z].status === true) {
              this.saveBtn_Access = true;
            } if (pages[i].child[y].btns[z].code === 'delete' && pages[i].child[y].btns[z].status === true) {
              this.deleteBtn_Access = true;
            } if (pages[i].child[y].btns[z].code === 'activate' && pages[i].child[y].btns[z].status === true) {
              this.activate_Access = true;
            } if (pages[i].child[y].btns[z].code === 'reset_password' && pages[i].child[y].btns[z].status === true) {
              this.resetPwd_Access = true;
            }
          }
        }
      }
    }

  }

  numberOnlyValidation(event: any) {

  }
  characterOnlyValidation(event: any) {
  
  }

  addEvent(event: any) {
    const dobTemp = new Date(event.target.value);
    const date = new Date();
    if (dobTemp > date) {
      this._obj.dob = '';
      this.matDatepicker.select(null);
      this.alert('', 'Invalid date!');
    }
  }

}
