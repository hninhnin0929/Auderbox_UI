import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Workbook } from 'exceljs';
import { SFormat } from '../com-interface';
import { ControllerService } from '../controller.service';
import { ShopData } from '../delievery-order/interface';
import { myStoreData, ShopPersonData } from '../store-routing/interface';
import { check_store } from '../zone/interface';
import * as FileSaver from 'file-saver';
declare var $: any;
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  selector: 'app-assign-user-store',
  templateUrl: './assign-user-store.page.html',
  styleUrls: ['./assign-user-store.page.scss'],
})
export class AssignUserStorePage implements OnInit {
  LIST_TAB = '#list-rs-tab';
  DETAIL_TAB = '#new-rs-tab';
  config_mystore = {
    id: 'config_mystore',
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  config_avaliable_store = {
    id: 'config_avaliable_store',
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  config_list = {
    id: 'config_list',
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  list_fg: FormGroup;
  detail_header_fg: FormGroup;
  detail_avaliable_store_fg: FormGroup;
  isDisable : boolean = false;

  btn: boolean = false;

  constructor(private manager: ControllerService,
    private http: HttpClient,
    private tostCtrl: ToastController,
    public alertController: AlertController,
    private loading: LoadingController) { }
  ngOnInit(): void {
    this.list_fg = this.getListFormGroup();
    this.detail_header_fg = this.getDetailHeaderFormGroup();
    this.detail_avaliable_store_fg = this.getDetailAvaliableStoreFormGroup();    
  }

  ngAfterViewInit(): void {
    this.isDisable = false;
    $('a[data-toggle="tab"]').on('show.bs.tab', e => {
      if (e.target.id == 'new-rs-tab') {
        // $('.header-btn').show();
        this.btn = true;

      } else {
        // $('.header-btn').hide();
        this.btn = false;
      }
    });
    this.detail_header_fg.get('tran-type').valueChanges.subscribe(
      (changes: any) => {
        this.detail_header_fg.get('user-list').setValue([]);
        this.detail_header_fg.get('user-selected').setValue('');
        this.detail_header_fg.get('avaliable-stores').setValue([]);
        this.detail_header_fg.get('my-stores').setValue([]);
        this.config_mystore.totalItems = 0;
        this.config_avaliable_store.totalItems = 0;

        if (changes !== '0') {
          this.getUserList();
        } 
        // else {
        //   this.detail_header_fg.get('user-list').setValue([]);
        //   this.detail_header_fg.get('avaliable-stores').setValue([]);
        //   this.detail_header_fg.get('my-stores').setValue([]);
        // }
      }
    );
    this.detail_header_fg.get('user-selected').valueChanges.subscribe(
      (changes: any) => {
        if (changes !== '') {
          this.isDisable = true;
          this.getStoresByUser().then(() => {
            this.config_mystore.currentPage = 1;
            // this.getAvaliableStores(0);
            this.getAvaliableStores(0).then(()=>{
              this.isDisable = false;
            });
            this.config_avaliable_store.currentPage = 1;
          });
        } else {
          this.detail_header_fg.get('avaliable-stores').setValue([]);
          this.detail_header_fg.get('my-stores').setValue([]);
          this.config_mystore.totalItems = 0;
          this.config_avaliable_store.totalItems = 0;
        }
      }
    )
  }

  ionViewWillEnter(): void {
    this.listTabClick();
  }
  ionViewDidLeave(): void {

  }
  newTabClick() {
    this.detail_header_fg.get('avaliable-stores').setValue([]);
    this.detail_header_fg.get('my-stores').setValue([]);
    this.detail_header_fg.get('user-selected').setValue('');
    this.detail_header_fg.get('tmp_user').setValue('');
    this.detail_avaliable_store_fg.get('store-search').setValue('');
    this.config_avaliable_store.currentPage=0;
    this.config_avaliable_store.totalItems=0;
    this.config_mystore.currentPage = 0;
    this.config_mystore.totalItems = 0;
    this.getUserList();
    this.isDisable = false;
  }
  listTabClick() {
    this.getAll();
    this.detail_header_fg.get('tmp_user').setValue('');
    this.detail_avaliable_store_fg.get('store-search').setValue('');
    $(this.LIST_TAB).tab('show');
  }
  getListFormGroup() {
    return new FormGroup({
      'name': new FormControl(''),
      'type': new FormControl('0'),
      'list': new FormControl([])
    })
  }
  getDetailHeaderFormGroup() {
    return new FormGroup({
      'tran-type': new FormControl('2'),
      'user-list': new FormControl([]),
      'user-selected': new FormControl('', Validators.required),
      'avaliable-stores': new FormControl([]),
      'my-stores': new FormControl([]),
      'tmp_user': new FormControl('')
    })
  }
  getDetailAvaliableStoreFormGroup() {
    return new FormGroup({
      'store-search': new FormControl(''),
    })
  }

  getUserList() {
    return new Promise<void>((res, rej) => {
      $('.myOuterContainer').addClass('disabled');
      const url = this.manager.appConfig.apiurl + 'shopPerson/getUser';
      this.http.post(url, {
        n1: this.detail_header_fg.get('tran-type').value
      }, this.manager.getOptions()).subscribe(
        (data: { dataList: any }) => {
          this.detail_header_fg.get('user-list').setValue(
            data.dataList.sort((a, b) => (a.userName > b.userName) ? 1 : -1)
          );
          if (this.detail_header_fg.get('tmp_user').value !== '') {
            const user = this.detail_header_fg.get('user-list').value.find((u: ShopPersonData) => {
              return u.userSysKey == this.detail_header_fg.get('tmp_user').value
            })
            if(user !== undefined) {
              user.n1=this.detail_header_fg.get('tran-type').value;
            }
            this.detail_header_fg.get('user-selected').setValue(user == undefined ? '' : user)
          }
          $('.myOuterContainer').removeClass('disabled');
          res();
        },
        error => {
          $('.myOuterContainer').removeClass('disabled');
          rej();
        }
      );
    })

  }
  pageChangedAvaliableStore(e) {
    this.config_avaliable_store.currentPage = e;
    let currentIndex = (this.config_avaliable_store.currentPage - 1) * this.config_avaliable_store.itemsPerPage;
    this.getAvaliableStores(currentIndex);
  }
  async searchAvaliableStore() {
    await this.getAvaliableStores(0);
    this.config_avaliable_store.currentPage = 1;
  }
  clearAvailableStores() {
    this.detail_avaliable_store_fg.get('store-search').setValue('');
    this.config_avaliable_store.currentPage = 1;
    this.getAvaliableStores(0);
  }
  getAvaliableStores(current: number) {
    return new Promise<void>((res, rej) => {
      $('.avaliable-store').addClass('disabled');
      $('#progress-bar-avaliable-store').show();
      const url = this.manager.appConfig.apiurl + 'shopPerson/get-avaliable-shops';
      let param = {
        type: this.detail_header_fg.get('tran-type').value,
        userSysKey: (this.detail_header_fg.get('user-selected').value as ShopPersonData).userSysKey,
        shopName: this.detail_avaliable_store_fg.get('store-search').value,
        currentRow: current,
        maxRow: this.config_avaliable_store.itemsPerPage
      }
      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: SFormat) => {
          this.config_avaliable_store.totalItems = data.totalcount;
          this.detail_header_fg.get('avaliable-stores').setValue(
            data.list.map((s: ShopData) => {
              let index: number = this.detail_header_fg.get('my-stores').value.findIndex((check_store: check_store) => { return check_store.syskey == s.shopSysKey })
              let myshop: check_store = {
                syskey: s.shopSysKey,
                name: s.shopName,
                code: s.shopCode,
                check: index !== -1,
                inactive: false,
                checked_index: -1
              }
              return myshop;
            })
          );
          $('.avaliable-store').removeClass('disabled');
          $('#progress-bar-avaliable-store').hide();
          res();
        },
        error => {
          $('.avaliable-store').removeClass('disabled');
          $('#progress-bar-avaliable-store').hide();
          rej();
        }
      )
    })
  }
  pageChangedMyStore(e) {
    this.config_mystore.currentPage = e;
    let currentIndex = (this.config_mystore.currentPage - 1) * this.config_mystore.itemsPerPage;

  }
  getStoresByUser() {
    return new Promise<void>((res, rej) => {
      $('.mystore').addClass('disabled');
      $('#progress-bar-assign-store').show();
      const url = this.manager.appConfig.apiurl + 'shopPerson/getstores-by-person';
      let param = {
        type: this.detail_header_fg.get('tran-type').value,
        userSysKey: (this.detail_header_fg.get('user-selected').value as ShopPersonData).userSysKey,
      }
      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: SFormat) => {
          this.detail_header_fg.get('my-stores').setValue(
            data.list.map((s: ShopData) => {
              let myshop: check_store = {
                syskey: s.shopSysKey,
                name: s.shopName,
                code: s.shopCode,
                check: false,
                inactive: false,
                checked_index: -1
              }
              return myshop;
            })

          )
          $('.mystore').removeClass('disabled');
          $('#progress-bar-assign-store').hide();
          res();
        },
        error => {
          $('.mystore').removeClass('disabled');
          $('#progress-bar-assign-store').hide();
          rej();
        }
      )
    })

  }

  saveCheckedStore() {
    const checked_stores = this.detail_header_fg.get('avaliable-stores').value.filter((store_zone: check_store) => {
      return store_zone.check
    })
    for (let cs of checked_stores) {
      const foundIt = this.detail_header_fg.get('my-stores').value.findIndex((form_store: check_store) => { return form_store.syskey === (cs as check_store).syskey });
      if (foundIt == -1) {
        this.detail_header_fg.get('my-stores').setValue([...this.detail_header_fg.get('my-stores').value, cs])
      }
    };
    this.config_mystore.totalItems = this.detail_header_fg.get('my-stores').value.length;
    //this.config_mystore.currentPage = 1;
  }
  changeCheckedStore(s: check_store) {
    if (!s.check) {
      const index = this.detail_header_fg.get('my-stores').value.findIndex((csl: check_store) => { return csl.syskey === s.syskey });
      if (index !== -1) this.detail_header_fg.get('my-stores').value.splice(index, 1);
      s.checked_index = -1;
      this.config_mystore.totalItems = this.detail_header_fg.get('my-stores').value.length;
    } else {
      this.detail_header_fg.get('my-stores').setValue([...this.detail_header_fg.get('my-stores').value, s])
      this.config_mystore.totalItems = this.detail_header_fg.get('my-stores').value.length;
    }

  }
  removeAssignedStore(rs: check_store) {
    const syskey = rs.syskey;
    const index = this.detail_header_fg.get('my-stores').value.findIndex((as: check_store) => {
      return as.syskey == rs.syskey;
    });
    if (index !== -1) {
      this.detail_header_fg.get('my-stores').value.splice(index, 1);
      const index2 = this.detail_header_fg.get('avaliable-stores').value.findIndex((as: check_store) => {
        return as.syskey == syskey;
      });
      if (index2 !== -1) (this.detail_header_fg.get('avaliable-stores').value[index2] as check_store).check = false;
    }
    this.config_mystore.totalItems = this.detail_header_fg.get('my-stores').value.length;
    this.config_mystore.currentPage = 1;
  }
  async getAll() {
    const loading = await this.loading.create({ message: "Please wait.." });
    await loading.present();
    const url = this.manager.appConfig.apiurl + 'shopPerson/search';
    let param = {
      userName: this.list_fg.get('name').value,
      type: this.list_fg.get('type').value
    }
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        let idex = 1;
        this.list_fg.get('list').setValue(data.map(d => {
          d.i = idex++;
          return d;
        }));
        this.config_list.totalItems = data.length;
        this.config_list.currentPage = 1;
        loading.dismiss();
      },
      error => {
        loading.dismiss();
      }

    )
  }
  pageChangedList(e) {
    this.config_list.currentPage = e;
    //let currentIndex = (this.config_list.currentPage - 1) * this.config_list.itemsPerPage;
  }
  detail(s: ShopPersonData) {
    this.isDisable = true;
    this.detail_header_fg.get('tran-type').setValue(s.type);
    this.detail_header_fg.get('tmp_user').setValue(s.userSysKey);
    this.detail_header_fg.get('avaliable-stores').setValue([]);
    this.detail_header_fg.get('my-stores').setValue([]);
    $(this.DETAIL_TAB).tab('show');
  }
  descending() {
    this.detail_header_fg.get('my-stores').value.sort((a: check_store, b: check_store) => {
      const first = $.trim(a.name.toLocaleUpperCase());
      const sec = $.trim(b.name.toLocaleUpperCase());
      if (first > sec) {
        return -1;
      }
    });
  }

  ascending() {
    this.detail_header_fg.get('my-stores').value.sort((a: check_store, b: check_store) => {
      const first = $.trim(a.name.toLocaleUpperCase());
      const sec = $.trim(b.name.toLocaleUpperCase());
      if (first < sec) {
        return -1;
      }
    });
  }

  validationBeforeSave(p, l){
    if(p.n1.toString() == "" || p.n1.toString() == "0"){
      l.dismiss();
      this.manager.showToast(this.tostCtrl, "Message", "Add Type", 2000);
      return false;
    }

    if(p.userSysKey == undefined || p.userSysKey.toString() == "" || p.userSysKey.toString() == "0"){
      l.dismiss();
      this.manager.showToast(this.tostCtrl, "Message", "Add User Name", 2000);
      return false;
    }

    if(p.shopList.length == 0){
      l.dismiss();
      this.manager.showToast(this.tostCtrl, "Message", "Add Shops", 2000);
      return false;
    }

    return true;
  }

  async save() {
    const url = this.manager.appConfig.apiurl + 'shopPerson/saveshopPerson';
    const loading = await this.loading.create({ message: "Please wait.." });
    let param = {
      userSysKey: (this.detail_header_fg.get('user-selected').value as ShopPersonData).userSysKey,
      userId : this.manager.user.userId,
      userName : this.manager.user.userName,
      syskey: "",
      shopList: this.detail_header_fg.get('my-stores').value.map((s: check_store) => {
        return s.syskey
      }),
      n1: this.detail_header_fg.get('tran-type').value,
    };

    if(this.validationBeforeSave(param, loading)){
      await loading.present();
    
      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: SFormat) => {
          loading.dismiss();
          if (data.status == 'SUCCESS') {
            this.manager.showToast(this.tostCtrl, "Message", "Saved Successfully!", 1000).then(
              e => {
                this.listTabClick();
              })
          } else {
            this.manager.showToast(this.tostCtrl, "Message", "Try again!", 1000).then(
              e => {
  
              })
          }
        },
        error=>{
          loading.dismiss();
        }
      );
    }
  }

  delete() {
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
              const url = this.manager.appConfig.apiurl + 'shopPerson/deleteshopPerson/'+(this.detail_header_fg.get('user-selected').value as ShopPersonData).userSysKey ;
              this.http.post(url,this.detail_header_fg.get('user-selected').value as ShopPersonData, this.manager.getOptions()).subscribe(
                (data: any) => {
                  el.dismiss();
                  if (data.message == 'SUCCESS') {
                    this.manager.showToast(this.tostCtrl, "Message", "Deleted Successfully!", 1000).then(
                      e => {
                        this.listTabClick();
                      })
                  } else {
                    this.manager.showToast(this.tostCtrl, "Message", "Try again!", 1000).then(
                      e => {
          
                      })
                  }
                },
                (error: any) => {
                  this.manager.showToast(this.tostCtrl,"Message","Try again!",1000);
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
  refresh() {
    this.list_fg = this.getListFormGroup();
  }
  print() {
    const url = this.manager.appConfig.apiurl + 'shopPerson/exportpersonshopList';

    this.http.post(url, {
      userName: this.list_fg.get('name').value,
      type: this.list_fg.get('type').value
    }, this.manager.getOptions()).subscribe(
      (data: any) => {
        let cri_date1 = "";

        let data1 = data;
        let cri_flag = 0;
        let utypeTemp = "";

        let excelTitle = " Person Shop List Report";
        let excelHeaderData = [
          " Date ", " User Name", "Shop Code", "Shop Name", "Type"
        ];
        let excelDataList: any = [];

        for (var exCount = 0; exCount < data1.length; exCount++) {
          let excelData: any = [];
          utypeTemp = this.manager.getUserTypeDesc(data1[exCount].userType);

          excelData.push(data1[exCount].createdDate);
          excelData.push(data1[exCount].userName);
          excelData.push(data1[exCount].t2);
          excelData.push(data1[exCount].shopName);
          excelData.push(data1[exCount].type)
          excelDataList.push(excelData);
        }

        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet('Person Shop List Data');

        let titleRow = worksheet.addRow(["", "", excelTitle]);
        titleRow.font = { bold: true };
        worksheet.addRow([]);

        let criteriaRow;

        criteriaRow = worksheet.addRow([" Date : " + cri_date1]);
        criteriaRow.font = { bold: true };
        cri_flag++;


        criteriaRow = worksheet.addRow([" User Name : " + this.list_fg.get('name').value.toString()]);
        criteriaRow.font = { bold: true };
        cri_flag++;


        criteriaRow = worksheet.addRow(["Type : " + this.list_fg.get('type').value.toString()]);
        criteriaRow.font = { bold: true };
        cri_flag++;



        if (cri_flag == 0) {
          criteriaRow = worksheet.addRow(["Search With No Criteria"]);
          criteriaRow.font = { bold: true };
        }
        worksheet.addRow([]);

        let headerRow = worksheet.addRow(excelHeaderData);
        headerRow.font = { bold: true };
        for (var i_data = 0; i_data < excelDataList.length; i_data++) {
          worksheet.addRow(excelDataList[i_data]);
        }

        workbook.xlsx.writeBuffer().then((data) => {
          let blob = new Blob([data], { type: EXCEL_TYPE });
          FileSaver.saveAs(blob, "PersonShop_" + new Date().getTime() + EXCEL_EXTENSION);
        });
      }
    );
  }
}
