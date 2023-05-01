import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { SFormat } from '../com-interface';
import { ControllerService } from '../controller.service';
import { ShopData } from '../delievery-order/interface';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import { getSaleOrderTran, myStoreData, RoutingScheduleData, ShopPersonData } from './interface';
import { MatOption } from '@angular/material';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $: any;
@Component({
  selector: 'app-store-routing',
  templateUrl: './store-routing.page.html',
  styleUrls: ['./store-routing.page.scss'],
})
export class StoreRoutingPage implements OnInit, AfterViewInit {
  @ViewChild('excel_upload2', { static: false }) excel2 !: HTMLInputElement;
  @ViewChild('excel_upload', { static: false }) excel !: HTMLInputElement;
  @ViewChild('triggerAllSOUserSelectOption', { static: false }) triggerAllSOUserSelectOption: MatOption;

  button = {
    save: {
      access: true,
      show: true,
      get: (): boolean => {
        if (this.button.save.access && this.button.save.show) {
          return true;
        } else {
          return false;
        }
      }
    },
    delete: true,
  }
  LIST_TAB = '#list-rus-tab';
  DETAIL_TAB = '#new-rus-tab';
  MIN_DATE: Date = new Date();
  DTPICKER_DEL = 'DTPICKER_DEL';
  DTPICKER_SO = 'DTPICKER_SO';
  excel2_name = '';

  list_header_fg: FormGroup;
  paginatin_list_config = {
    id: "list-pagination",
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  }

  detail_header_fg: FormGroup;
  delivery_store_to_visit_fg: FormGroup;
  delivery_stores_fg: FormGroup;
  delivery_undelivered_order_fg: FormGroup;
  subscri_get_undelivered_so: Subscription;
  subscri_get_so_tran: Subscription;
  subscri_get_allstore: Subscription;
  pagination_delivery_so_config = {
    id: "delivery-routing-pagination-sotran",
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  }

  pagination_delivery_undel_stores_config = {
    id: "delivery-routing-pagination-undelstores",
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  }
  pagination_delivery_allstores_config = {
    id: "delivery-routing-pagination-allstores",
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  }

  so_store_to_visit_fg: FormGroup;
  so_store_by_user_fg: FormGroup;
  subscri_so_usergroup: Subscription;
  subscri_so_allstores: Subscription;
  pagination_so_store_to_visit_config = {
    id: "so_routing_pagination_store_to_visit",
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  }
  pagination_so_store_by_user_config = {
    id: "so-routing-pagination-store-by-user",
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  }

  stateList: any = [];
  districtList: any = [];
  townshipList: any = [];
  expLoadFlag: boolean = false;
  criteria: any = this.getCriteriaData();

  constructor(private manager: ControllerService,
    private http: HttpClient, private tostCtrl: ToastController,
    private loadCtrl: LoadingController) { }


  ngOnInit(): void {
    this.list_header_fg = this.getListHeaderFormGroup();
    this.detail_header_fg = this.getDetailHeaderFormGroup();

    this.delivery_store_to_visit_fg = this.getDeliveryStoresToVisitFormGroup();
    this.delivery_stores_fg = this.getDeliveryStoresFormGroup();
    this.delivery_undelivered_order_fg = this.getDeliveryUndeliveredOrderFormGroup();
    this.so_store_to_visit_fg = this.getOrderStoresToVisitFormGroup();
    this.so_store_by_user_fg = this.getOrderStoresByUserFormGroup();
  }

  ngAfterViewInit(): void {
    $('a[data-toggle="tab"]').on('show.bs.tab', e => {
      if (e.target.id == 'new-rus-tab') {
        this.button.save.show = true;
      } else {
        this.button.save.show = false;
      }
    });

    this.detail_header_fg.get('is-use-ordertran').valueChanges.subscribe(
      (changes: any) => {
        this.clearDeliveryUseOrderTran();
        this.clearDeliveryUnuseOrderTran();
        if (!changes) { //unused so transaction
          this.unSubscribeDeliveryNoUseOrderTran();
          this.getUsergroupAllStores().then((user: any) => {
            this.delivery_stores_fg.get('active-user-unused-so-tran').setValue(user);
          })
        } else { //used so transaction
          this.unSubscribeDeliveryUseOrderTran();
          // this.getSaleOrderTran(0);
          $('#spinner-storetovisit').attr("style", "display: inline-block !important;");
          this.getUsergroupUndeliveredSo().then((user: ShopPersonData) => {
            this.delivery_undelivered_order_fg.get('active-user').setValue(user);            
            this.getSaleOrderUsers().then((user: ShopPersonData)=>{
              this.getSaleOrderTran(0);
            })
          })
        }
      }
    )
    this.detail_header_fg.get('tran-type').valueChanges.subscribe(
      (changes: any) => {
        this.clearExcelFile();
        if (changes == 1) {
          this.clearDeliveryUseOrderTran();
          this.clearDeliveryUnuseOrderTran();
          this.unSubscribeDeliveryUseOrderTran();
          this.clearOrder();
          this.getSoUsergroup().then((user: any) => {
            if (user !== '') {
              this.so_store_by_user_fg.get('user-selected').setValue(user);

            }
          })
        } else {
          this.unSubscribeOrder();
          this.clearOrder();
          this.detail_header_fg.get('is-use-ordertran').setValue(true)
        }
      }
    );
    this.delivery_undelivered_order_fg.get('active-user').valueChanges.subscribe(
      (changes: ShopPersonData) => {
        this.getUndeliveredSo(0);
        this.pagination_delivery_undel_stores_config.currentPage = 1;
      }
    )
    this.delivery_stores_fg.get('active-user-unused-so-tran').valueChanges.subscribe(
      (changes: any) => {
        if (changes !== '') {
          this.getStoresByUser(0);
          this.pagination_delivery_allstores_config.currentPage = 1;
        }


      }
    );
    this.so_store_by_user_fg.get('user-selected').valueChanges.subscribe(
      changes => {
        if (changes !== '') {
          this.getSoStoresByUser(0);
          this.pagination_so_store_by_user_config.currentPage = 1;

        }
      }
    )
    this.delivery_undelivered_order_fg.get('store-search').valueChanges.subscribe(
      changes => {
        if (changes == '') {
          $('#del-active-user-input').slideDown("slow");
        } else {
          $('#del-active-user-input').slideUp("slow");
        }
      }
    )
    this.delivery_stores_fg.get('store-search').valueChanges.subscribe(
      changes => {
        if (changes == '') {
          $('#active-user-unused-so-tran-input').slideDown("slow");
        } else {
          $('#active-user-unused-so-tran-input').slideUp("slow");
        }
      }
    );
    this.so_store_by_user_fg.get('store-search').valueChanges.subscribe(
      changes => {
        if (changes == '') {
          $('#user-selected-input').slideDown("slow");
        } else {
          $('#user-selected-input').slideUp("slow");
        }
      }
    )
  
  }

  ionViewWillEnter(): void {
    $(this.LIST_TAB).tab('show');
    $("#dSyskey").prop("disabled", true);
    $("#tsSyskey").prop("disabled", true);

    this.list_header_fg.get('date-option').setValue("today");
    this.dateOptionsChange();

    this.getAll(0);
    this.getStateList();
  }
  ionViewDidLeave(): void {

  }
  getListHeaderFormGroup(): FormGroup {
    return new FormGroup({
      'from-date': new FormControl(''),
      'to-date': new FormControl(''),
      'date-option': new FormControl('0'),
      'shop-code': new FormControl(''),
      'shop-name': new FormControl(''),
      'type': new FormControl(''),
      'list': new FormControl([]),
      'sSyskey': new FormControl(''),
      'dSyskey': new FormControl(''),
      'tsSyskey': new FormControl(''),
    });
  }
  getDetailHeaderFormGroup(): FormGroup {
    return new FormGroup({
      'tran-type': new FormControl('2'),
      'so-routing-date': new FormControl(''),
      'is-use-ordertran': new FormControl(undefined)
    });
  }

  getDeliveryStoresToVisitFormGroup(): FormGroup {
    return new FormGroup({
      'so-trans': new FormControl([]),
      'excel': new FormControl({
        'name': '',
        'sheets': ''
      }),
      'shop-name': new FormControl(''),
      'chk-all': new FormControl(false),
      'set-all-date-deli': new FormControl(''),
      'so-users': new FormControl([])
    })
  }
  getDeliveryStoresFormGroup(): FormGroup {
    return new FormGroup({
      'users-unused-so-tran': new FormControl([]),
      'stores': new FormControl([]),
      'active-user-unused-so-tran': new FormControl(''),
      'store-search': new FormControl(''),
    })
  }
  getDeliveryUndeliveredOrderFormGroup(): FormGroup {
    return new FormGroup({
      'users': new FormControl([]),
      'active-user': new FormControl({ userSysKey: '0' }),
      'stores-byuser': new FormControl([]),
      'store-search': new FormControl('')
    })
  }
  getOrderStoresToVisitFormGroup(): FormGroup {
    return new FormGroup({
      'stores-to-visit': new FormControl([]),
      'set-all-date': new FormControl('')
    })
  }
  getOrderStoresByUserFormGroup(): FormGroup {
    return new FormGroup({
      'stores-by-user': new FormControl([]),
      'user-list': new FormControl([]),
      'user-selected': new FormControl(''),
      'store-search': new FormControl('')
    })
  }
  newTabClick() {
    this.detail_header_fg.get('tran-type').setValue('2');
    this.delivery_store_to_visit_fg.get('shop-name').setValue('');
    this.delivery_store_to_visit_fg.get('chk-all').setValue(false);
    this.delivery_store_to_visit_fg.get('set-all-date-deli').setValue('');
    this.criteria = this.getCriteriaData();
  }
  listTabClick() {
    $(this.LIST_TAB).tab('show');
    this.getAll(0)
  }
  pageChangedList(e) {
    this.paginatin_list_config.currentPage = e;
    let currentIndex = (this.paginatin_list_config.currentPage - 1) * this.paginatin_list_config.itemsPerPage;
    this.getAll(currentIndex)
  }

  pageChangedDelRouteSoTran(e) {
    this.pagination_delivery_so_config.currentPage = e;
    let currentIndex = (this.pagination_delivery_so_config.currentPage - 1) * this.pagination_delivery_so_config.itemsPerPage;
  }
  pageChangedDelUndelStores(e) {
    this.pagination_delivery_undel_stores_config.currentPage = e;
    let currentIndex = (this.pagination_delivery_undel_stores_config.currentPage - 1) * this.pagination_delivery_undel_stores_config.itemsPerPage;
    this.getUndeliveredSo(currentIndex)
  }
  pageChangedDelAllStores(e) {
    this.pagination_delivery_allstores_config.currentPage = e;
    let currentIndex = (this.pagination_delivery_allstores_config.currentPage - 1) * this.pagination_delivery_allstores_config.itemsPerPage;
    this.getStoresByUser(currentIndex);
  }
  pageChangedSoStoreToVisit(e) {
    this.pagination_so_store_to_visit_config.currentPage = e;
    let currentIndex = (this.pagination_so_store_to_visit_config.currentPage - 1) * this.pagination_so_store_to_visit_config.itemsPerPage;

  }
  pageChangedSoStoreByUser(e) {
    this.pagination_so_store_by_user_config.currentPage = e;
    let currentIndex = (this.pagination_so_store_by_user_config.currentPage - 1) * this.pagination_so_store_by_user_config.itemsPerPage;
    this.getSoStoresByUser(currentIndex)
  }
  pageBoundsCorrectionDel(e) {
    this.pagination_delivery_so_config.currentPage = e;
  }
  pageBoundsCorrectionSo(e) {
    this.pagination_so_store_to_visit_config.currentPage = e;
  }
  dateOptionsChange() {
    let dateOption = this.manager.getDateOptions(this.list_header_fg.get('date-option').value);
    this.list_header_fg.get('from-date').setValue(dateOption.fromDate);
    this.list_header_fg.get('to-date').setValue(dateOption.toDate);
  }
  selectedChanged(){
    console.log("changed")
  }
  async searchByTranDate() {
    await this.getSaleOrderTran(0);
    this.getUndeliveredSo(0);
    this.pagination_delivery_undel_stores_config.currentPage = 1;
  }
  async getAll(current: number) {
    const loading = await this.loadCtrl.create({ message: 'Retrieving data..', backdropDismiss: false });
    await loading.present();
    const url = this.manager.appConfig.apiurl + 'shopPerson/getUJUN004List';
    let param = {
      shopCode: this.list_header_fg.get('shop-code').value,
      shopName: this.list_header_fg.get('shop-name').value,
      sSyskey: this.list_header_fg.get('sSyskey').value,
      dSyskey: this.list_header_fg.get('dSyskey').value,
      tsSyskey: this.list_header_fg.get('tsSyskey').value,
      type: this.list_header_fg.get('type').value,
      date: this.manager.formatDate(this.list_header_fg.get('from-date').value),
      toDate: this.manager.formatDate(this.list_header_fg.get('to-date').value),
      currentPage: '' + current,
      itemsPerPage: this.paginatin_list_config.itemsPerPage
    }
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        loading.dismiss();
        this.paginatin_list_config.totalItems = data.rowCount;
        this.list_header_fg.get('list').setValue(
          data.dataList.map((s) => {
            s.no = current++;
            s.date = this.manager.formatDate_StringToDate(s.date);
            return s;
          })
        );
        if (current == 0) this.paginatin_list_config.currentPage = 1;
      },
      error => {
        loading.dismiss();
      }
    );

  }
  getSaleOrderTran(curr: number) {
    return new Promise<void>((res, rej) => {
      $('.store-tovisit-col').addClass('disabled');
      $('.undel-so-col').addClass('disabled');
      $('#spinner-storetovisit').attr("style", "display: inline-block !important;");
      const url = this.manager.appConfig.apiurl + 'shopPerson/get-so-stores';      

      let soUsers = "";
      for(var i=0; i<this.criteria.soUsers.length; i++){
        soUsers += this.criteria.soUsers[i]+","; 
      }
      soUsers = soUsers.slice(0,-1);

      const pram: getSaleOrderTran = {
        "date": this.manager.formatDate(this.detail_header_fg.get('so-routing-date').value),
        "currentRow": -1,
        "maxRow": -1,
        "estiDeliDate" : this.manager.settingData.n12 == '' ? '0' : this.manager.settingData.n12,
        "shopNameCri": this.delivery_store_to_visit_fg.get('shop-name').value,
        "soUsers": soUsers
      };

      this.subscri_get_so_tran = this.http.post(url, pram, this.manager.getOptions()).subscribe(
        (data: SFormat) => {
          this.delivery_store_to_visit_fg.get('so-trans').setValue(data.list.map((store: ShopData) => {
            let my_store: myStoreData = {
              no: curr++,
              shop_syskey: store.shopSysKey,
              shop_code: store.shopCode,
              shop_name: store.shopName,
              shop_address: store.address,
              order_syskey: store.sopSyskey,
              order_date: this.manager.formatDate_StringToDate(store.createdDate),
              delivery_date: this.manager.settingData.n11 == '1' ? this.manager.formatDate_StringToDate(store.estiDeliDate) : '',
              order_no: store.t1,
              check: false
            }
            return my_store;
          }));
          this.pagination_delivery_so_config.totalItems = data.totalcount;
          $('.store-tovisit-col').removeClass('disabled');
          $('.undel-so-col').removeClass('disabled');
          $('#spinner-storetovisit').attr("style", "display: none;");
          res();
        },
        error => {
          $('.store-tovisit-col').removeClass('disabled');
          $('.undel-so-col').removeClass('disabled');
          $('#spinner-storetovisit').attr("style", "display: none;");
          rej();
        }
      );
    })

  }
  
  async getSaleOrderUsers() {
    return new Promise<ShopPersonData>((res, rej) => {
      const url = this.manager.appConfig.apiurl + 'shopPerson/getSaleOrderUsers';
      this.http.post(url, {}, this.manager.getOptions()).subscribe(
        (data: SFormat) => {
          if (data.status == "SUCCESS") {
            this.delivery_store_to_visit_fg.get('so-users').setValue(data.list.map((user: ShopPersonData) => {
              user.createdDate = ''
              return user;
            }).sort((a: ShopPersonData, b: ShopPersonData) => {
              const first = $.trim(a.userName.toLocaleUpperCase());
              const sec = $.trim(b.userName.toLocaleUpperCase());
              if (first < sec) {
                return -1;
              }
            }));
          }
          res(data.list[0] as ShopPersonData);
        },
        error => {
          rej();
        }
      )
    })
  }

  getUsergroupUndeliveredSo() {
    return new Promise<ShopPersonData>((res, rej) => {
      const url = this.manager.appConfig.apiurl + 'shopPerson/get-usergroup-undelivered-so';
      this.http.post(url, {}, this.manager.getOptions()).subscribe(
        (data: SFormat) => {
          if (data.status == "SUCCESS") {
            this.delivery_undelivered_order_fg.get('users').setValue(data.list.map((user: ShopPersonData) => {
              user.createdDate = ''
              return user;
            }).sort((a: ShopPersonData, b: ShopPersonData) => {
              const first = $.trim(a.userName.toLocaleUpperCase());
              const sec = $.trim(b.userName.toLocaleUpperCase());
              if (first < sec) {
                return -1;
              }
            }));
          }
          res(data.list[0] as ShopPersonData);
        },
        error => {
          rej();
        }
      )
    })

  }
  getUndeliveredSo(current: number) {
    return new Promise<void>((res, rej) => {
      $('.undel-so-col').addClass('disabled');
      $('#spinner-undeliveredso').attr("style", "display: inline-block !important;");
      this.focusOut(2);
      const url = this.manager.appConfig.apiurl + 'shopPerson/get-undelivered-so';
      const storeName = this.delivery_undelivered_order_fg.get('store-search').value;
      let param = {
        createdDate: this.manager.formatDate(this.detail_header_fg.get('so-routing-date').value as Date),
        userSysKey: storeName == '' ? (this.delivery_undelivered_order_fg.get('active-user').value as ShopPersonData).userSysKey : '',
        shopName: storeName,
        currentRow: current,
        maxRow: this.pagination_delivery_undel_stores_config.itemsPerPage
      }
      this.subscri_get_undelivered_so = this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: SFormat) => {
          if (data.status == "SUCCESS") {
            this.delivery_undelivered_order_fg.get('stores-byuser').setValue(data.list.map((e: ShopData) => {
              let index: number = this.delivery_store_to_visit_fg.get('so-trans').value.findIndex((check_store: myStoreData) => {
                return check_store.shop_syskey == e.shopSysKey && check_store.order_syskey === e.sopSyskey
              })
              return {
                no: current++,
                shop_syskey: e.shopSysKey,
                shop_code: e.shopCode,
                shop_name: e.shopName,
                shop_address: e.address,
                order_syskey: e.sopSyskey,
                order_date: this.manager.formatDate_StringToDate(e.createdDate),
                delivery_date: this.manager.formatDate_StringToDate(e.t5),
                order_no: e.t1,
                check: index !== -1 ? true : false
              }
            }));
            this.pagination_delivery_undel_stores_config.totalItems = data.totalcount;
          }
          $('.undel-so-col').removeClass('disabled');
          $('#spinner-undeliveredso').attr("style", "display: none !important;");
          res();
        },
        error => {
          $('.undel-so-col').removeClass('disabled');
          $('#spinner-undeliveredso').attr("style", "display: none !important;");
          rej();
        }
      )
    })
  }
  getUsergroupAllStores() {
    return new Promise<any>((res, rej) => {
      const url = this.manager.appConfig.apiurl + 'shopPerson/getUser';
      this.http.post(url, {
        n1: this.detail_header_fg.get('tran-type').value
      }, this.manager.getOptions()).subscribe(
        (data: { dataList: any }) => {
          this.delivery_stores_fg.get('users-unused-so-tran').setValue(data.dataList.map((user: ShopPersonData) => {
            return user;
          }).sort((a: ShopPersonData, b: ShopPersonData) => {
            const first = $.trim(a.userName.toLocaleUpperCase());
            const sec = $.trim(b.userName.toLocaleUpperCase());
            if (first < sec) {
              return -1;
            }
          }));

          let firstUser = '';
          if (this.delivery_stores_fg.get('users-unused-so-tran').value.length > 0) {
            firstUser = (this.delivery_stores_fg.get('users-unused-so-tran').value)[0];
          }
          res(firstUser);
        },
        error => {
          rej();
        }
      );
    })

  }
  getStoresByUser(current: number) {
    return new Promise<void>((res, rej) => {
      $('.allstore-col').addClass('disabled');
      $('#spinner-allstore-del').attr("style", "display: inline-block !important;");
      this.focusOut(2)
      const url = this.manager.appConfig.apiurl + 'shopPerson/getstores-by-person';
      const storeName = this.delivery_stores_fg.get('store-search').value;
      let param = {
        type: this.detail_header_fg.get('tran-type').value,
        userSysKey: storeName == '' ? (this.delivery_stores_fg.get('active-user-unused-so-tran').value as ShopPersonData).userSysKey : '',
        shopName: storeName,
        maxRow: this.pagination_delivery_allstores_config.itemsPerPage,
        currentRow: current
      }
      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: SFormat) => {
          this.pagination_delivery_allstores_config.totalItems = data.totalcount;
          this.delivery_stores_fg.get('stores').setValue(
            data.list.map((e: ShopData) => {
              let index: number = this.delivery_store_to_visit_fg.get('so-trans').value.findIndex((check_store: myStoreData) => {
                return check_store.shop_syskey == e.shopSysKey
              })
              let myshop: myStoreData = {
                no: current++,
                shop_syskey: e.shopSysKey,
                shop_code: e.shopCode,
                shop_name: e.shopName,
                shop_address: e.address,
                order_syskey: '0',
                order_date: '',
                delivery_date: '',
                order_no: '',
                check: index == -1 ? false : true
              }
              return myshop;
            })
          )
          $('.allstore-col').removeClass('disabled');
          $('#spinner-allstore-del').attr("style", "display: none !important;");
          res();
        },
        error => {
          $('.allstore-col').removeClass('disabled');
          $('#spinner-allstore-del').attr("style", "display: none !important;");
          this.manager.showToast(this.tostCtrl, "Message", "Oops!<br>Please refresh!", 1000)
          rej();
        }
      )
    })
  }
  getSoUsergroup() {
    return new Promise<any>((res, rej) => {
      const url = this.manager.appConfig.apiurl + 'shopPerson/getUser';
      this.subscri_so_usergroup = this.http.post(url, {
        n1: this.detail_header_fg.get('tran-type').value
      }, this.manager.getOptions()).subscribe(
        (data: { dataList: any }) => {
          this.so_store_by_user_fg.get('user-list').setValue(data.dataList.map((user: ShopPersonData) => {
            return user;
          }).sort((a: ShopPersonData, b: ShopPersonData) => {
            const first = $.trim(a.userName.toLocaleUpperCase());
            const sec = $.trim(b.userName.toLocaleUpperCase());
            if (first < sec) {
              return -1;
            }
          }));

          let firstUser = '';
          if (this.so_store_by_user_fg.get('user-list').value.length > 0) {
            firstUser = (this.so_store_by_user_fg.get('user-list').value)[0];
          }
          res(firstUser);
        },
        error => {
          rej();
        }
      );
    })

  }
  getSoStoresByUser(current: number) {
    return new Promise<void>((res, rej) => {
      $('.so-store-by-user-col').addClass('disabled');
      $('#spinner-ordertype-store').attr("style", "display: inline-block !important;");
      this.focusOut(1)
      const url = this.manager.appConfig.apiurl + 'shopPerson/getstores-by-person';
      const storeName = this.so_store_by_user_fg.get('store-search').value;
      let param = {
        shopName: storeName,
        type: this.detail_header_fg.get('tran-type').value,
        userSysKey: storeName == '' ? (this.so_store_by_user_fg.get('user-selected').value as ShopPersonData).userSysKey : '',
        maxRow: this.pagination_so_store_by_user_config.itemsPerPage,
        currentRow: current
      }
      this.subscri_so_allstores = this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: SFormat) => {
          this.pagination_delivery_allstores_config.totalItems = data.totalcount;
          this.so_store_by_user_fg.get('stores-by-user').setValue(
            data.list.map((e: ShopData) => {
              let index: number = this.so_store_to_visit_fg.get('stores-to-visit').value.findIndex((check_store: myStoreData) => {
                return check_store.shop_syskey == e.shopSysKey
              })
              let myshop: myStoreData = {
                no: current++,
                shop_syskey: e.shopSysKey,
                shop_code: e.shopCode,
                shop_name: e.shopName,
                shop_address: e.address,
                order_syskey: '0',
                order_date: '',
                delivery_date: '',
                order_no: '',
                check: index == -1 ? false : true
              }
              return myshop;
            })

          )
          this.pagination_so_store_by_user_config.totalItems = data.totalcount;
          $('.so-store-by-user-col').removeClass('disabled');
          $('#spinner-ordertype-store').attr("style", "display: none !important;");
          res();
        },
        error => {
          $('.so-store-by-user-col').removeClass('disabled');
          $('#spinner-ordertype-store').attr("style", "display: none !important;");
          this.manager.showToast(this.tostCtrl, "Message", "Oops!<br>Please refresh!", 1000)
          rej();
        }
      )
    })
  }
  updateStatusList(index, detail) {
    this.loadCtrl.create({
      message: "Processing..",
      backdropDismiss: false
    }).then(
      el => {
        el.present();
        const url = this.manager.appConfig.apiurl + 'shopPerson/updateUJ4n2';
        let temp = {
          "n2": 0,
          "date": "",
          "shopSyskey": "",
          "syskey": detail.syskey,
          "type": detail.type == 'Order' ? 1: 2
        };
        temp.n2 = detail.n2 == 1 ? 0 : 1;
        const active = temp.n2;
        temp.date = this.manager.formatDate(detail.date);
        temp.shopSyskey = detail.shopSysKey;
        temp.syskey = detail.syskey;

        this.http.post(url, temp, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            if (data.message == "SUCCESS") {
              this.list_header_fg.get('list').value[index].n2 = active;
              this.manager.showToast(this.tostCtrl, "Message", "Success", 1000);
            } else if (data.message == "FAIL") {
              this.manager.showToast(this.tostCtrl, "Message", "Update Not Successful", 1000);
            }
          },
          error => {
            el.dismiss();
          }
        );
      }
    )

  }
  updateSetDateToAllTran() {
    this.so_store_to_visit_fg.get('stores-to-visit').setValue(
      this.so_store_to_visit_fg.get('stores-to-visit').value.map(
        (s: myStoreData) => {
          s.delivery_date = this.so_store_to_visit_fg.get('set-all-date').value;
          return s;
        }
      )
    )

  }
  refreshSearchBox1() {
    this.delivery_undelivered_order_fg.get('store-search').setValue('');
    this.getUndeliveredSo(0);
    this.pagination_delivery_undel_stores_config.currentPage = 1;
  }
  refreshSearchBox2() {
    this.delivery_stores_fg.get('store-search').setValue('');
    this.getStoresByUser(0);
    this.pagination_delivery_allstores_config.currentPage = 1;
  }
  refreshSearchBox3() {
    this.so_store_by_user_fg.get('store-search').setValue('');
    this.getSoStoresByUser(0);
    this.pagination_so_store_by_user_config.currentPage = 1;
  }
  refreshSearchBox4() {
    this.list_header_fg.get('shop-code').setValue('');
    this.list_header_fg.get('shop-name').setValue('');
    this.list_header_fg.get('type').setValue('');
    this.list_header_fg.get('from-date').setValue('');
    this.list_header_fg.get('to-date').setValue('');
    this.list_header_fg.get('date-option').setValue('0');
    this.list_header_fg.get('sSyskey').setValue('');
    this.list_header_fg.get('dSyskey').setValue('');
    this.list_header_fg.get('tsSyskey').setValue('');
    this.dateOptionsChange();

    $("#tsSyskey").prop("selectedIndex", 0).val();
  }
  unSubscribeDeliveryNoUseOrderTran() {
    try {
      if (this.subscri_get_so_tran !== undefined) this.subscri_get_so_tran.unsubscribe();
      if (this.subscri_get_undelivered_so !== undefined) this.subscri_get_undelivered_so.unsubscribe();
      $('.store-tovisit-col').removeClass('disabled');
      $('.undel-so-col').removeClass('disabled');
    } catch (e) {
      console.log(e);
    }

  }
  unSubscribeDeliveryUseOrderTran() {
    try {
      if (this.subscri_get_allstore !== undefined) this.subscri_get_allstore.unsubscribe();
      $('#spinner-storetovisit').attr("style", "display: none !important;");
      $('#spinner-undeliveredso').attr("style", "display: none !important;");
    } catch (e) {
      console.log(e);
    }

  }
  unSubscribeOrder() {
    try {
      if (this.subscri_so_allstores !== undefined) this.subscri_so_allstores.unsubscribe();
      if (this.subscri_so_usergroup !== undefined) this.subscri_so_usergroup.unsubscribe();
      $('.so-store-by-user-col').removeClass('disabled');
    } catch (e) {
      console.log(e);
    }

  }
  clearDeliveryUseOrderTran() {
    this.delivery_undelivered_order_fg.get('stores-byuser').setValue([]);
    this.delivery_store_to_visit_fg.get('so-trans').setValue([]);
    this.pagination_delivery_so_config.totalItems = 0;
    this.pagination_delivery_so_config.currentPage = 0;
    this.delivery_undelivered_order_fg.get('store-search').setValue('');
    this.delivery_store_to_visit_fg.get('shop-name').setValue('');
    this.delivery_store_to_visit_fg.get('chk-all').setValue(false);
    this.delivery_store_to_visit_fg.get('set-all-date-deli').setValue('');
    $('.delivery-routing').removeClass('disabled');
  }
  clearDeliveryUnuseOrderTran() {
    this.delivery_stores_fg.get('users-unused-so-tran').setValue([]);
    this.delivery_stores_fg.get('stores').setValue([]);
    this.delivery_stores_fg.get('store-search').setValue('')
    $('.delivery-routing').removeClass('disabled');
  }
  clearOrder() {
    this.so_store_to_visit_fg.get('stores-to-visit').setValue([]);
    this.so_store_by_user_fg.get('stores-by-user').setValue([]);
    this.so_store_by_user_fg.get('user-list').setValue([]);
    this.so_store_by_user_fg.get('store-search').setValue('');
    $('.so-store-by-user-col').removeClass('disabled');
  }
  changeCheckedStore(e: boolean, s: myStoreData) {
    if (!e) {
      const index = this.delivery_store_to_visit_fg.get('so-trans').value.findIndex((csl: myStoreData) => {
        return csl.shop_syskey === s.shop_syskey && csl.order_syskey === s.order_syskey
      });
      if (index !== -1) this.delivery_store_to_visit_fg.get('so-trans').value.splice(index, 1);
      this.pagination_delivery_so_config.totalItems = this.delivery_store_to_visit_fg.get('so-trans').value.length;
    } else {
      const mystore: myStoreData = {
        no: 0,
        shop_syskey: s.shop_syskey,
        shop_code: s.shop_code,
        shop_name: s.shop_name,
        shop_address: s.shop_address,
        order_syskey: s.order_syskey,
        order_date: s.order_date,
        delivery_date: new Date(),
        order_no: s.order_no,
        check: false
      }
      this.delivery_store_to_visit_fg.get('so-trans').value.push(mystore);
      this.pagination_delivery_so_config.totalItems = this.delivery_store_to_visit_fg.get('so-trans').value.length;
    }
  }
  changeCheckedStore_orderTran(e: boolean, s: myStoreData) {
    if (!e) {
      const index = this.so_store_to_visit_fg.get('stores-to-visit').value.findIndex((csl: myStoreData) => {
        return csl.shop_syskey === s.shop_syskey && csl.order_syskey === s.order_syskey
      });
      if (index !== -1) this.so_store_to_visit_fg.get('stores-to-visit').value.splice(index, 1);
      this.pagination_so_store_to_visit_config.totalItems = this.so_store_to_visit_fg.get('stores-to-visit').value.length;
    } else {
      const mystore: myStoreData = {
        no: 0,
        shop_syskey: s.shop_syskey,
        shop_code: s.shop_code,
        shop_name: s.shop_name,
        shop_address: s.shop_address,
        order_syskey: s.order_syskey,
        order_date: s.order_date,
        delivery_date: '',
        order_no: s.order_no,
        check: false
      }
      this.so_store_to_visit_fg.get('stores-to-visit').value.push(mystore);
      this.pagination_so_store_to_visit_config.totalItems = this.so_store_to_visit_fg.get('stores-to-visit').value.length;
    }
  }
  removeAssignStoreSo(index: number) {
    const removedStore = (this.so_store_to_visit_fg.get('stores-to-visit').value)[index] as myStoreData;
    const sindex: number = this.so_store_by_user_fg.get('stores-by-user').value.findIndex((s: myStoreData) => {
      return s.shop_syskey == removedStore.shop_syskey;
    });
    if (sindex !== -1) {
      ((this.so_store_by_user_fg.get('stores-by-user').value)[sindex] as myStoreData).check = false;
    }
    this.so_store_to_visit_fg.get('stores-to-visit').value.splice(index, 1);
    this.pagination_so_store_to_visit_config.totalItems = this.so_store_to_visit_fg.get('stores-to-visit').value.length;
  }
  removeAssignStoreDel(removedStore: any) {
    // index += (this.pagination_delivery_so_config.currentPage - 1) * this.pagination_delivery_so_config.itemsPerPage + 1;
    // const removedStore = (this.delivery_store_to_visit_fg.get('so-trans').value)[index] as myStoreData;
    if (this.detail_header_fg.get('is-use-ordertran').value) {
      const sindex: number = this.delivery_undelivered_order_fg.get('stores-byuser').value.findIndex((s: myStoreData) => {
        return s.shop_syskey == removedStore.shop_syskey && removedStore.order_syskey === s.order_syskey;
      });
      if (sindex !== -1) {
        ((this.delivery_undelivered_order_fg.get('stores-byuser').value)[sindex] as myStoreData).check = false;
      }

    } else {
      const sindex: number = this.delivery_stores_fg.get('stores').value.findIndex((s: myStoreData) => {
        return s.shop_syskey == removedStore.shop_syskey;
      });
      if (sindex !== -1) {
        ((this.delivery_stores_fg.get('stores').value)[sindex] as myStoreData).check = false;
      }
    }
    const dindex: number = this.delivery_store_to_visit_fg.get('so-trans').value.findIndex((d: myStoreData) => {
      return d.shop_syskey == removedStore.shop_syskey &&  d.order_syskey == removedStore.order_syskey;
    });
    this.delivery_store_to_visit_fg.get('so-trans').value.splice(dindex, 1);
    this.pagination_delivery_so_config.totalItems = this.delivery_store_to_visit_fg.get('so-trans').value.length;
  }
  sampleExcelDownload() {
    let exampleData: any = [];
    exampleData = this.sampleExcelData();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exampleData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, "Shop_Asign");
  }
  sampleExcelData() {
    return [
      {
        "ShopCode": "7MHRX48F+RR2",
        "ShopName": "Queen Mart",
        "Address": "Ye Mun (South) Ward,Mahaaungmyay Township, Mandalay",
        "Date": "20130311"
      },
      {
        "ShopCode": "7MHRX437+QX1",
        "ShopName": "Golden Sea",
        "Address": "Ma Har Myaing (2) Ward,Mahaaungmyay Township, Mandalay",
        "Date": "20170212"
      }
    ];
  }
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }
  uploadExcelClick(e) {
    e.click();
    this.delivery_store_to_visit_fg.get('excel').setValue({
      'name': '',
      'sheets': ''
    })
  }
  uploadExcel(e: any) {
    let each_sheet_data: any = {
      "ShopCode": "",
      "ShopName": "",
      "Address": "",
      "Date": ""
    };;
    let all_sheet_data: any = {
      uploadData: [
        {
          "ShopCode": "", "ShopName": "", "Address": "", "Date": ""
        }
      ]
    };
    let excelFileName = e.target.files[0].name;
    let pos = excelFileName.indexOf(".");
    let uploadedFileName = excelFileName.substring(0, pos);
    this.excel2_name = uploadedFileName;
    let uploadFile = e.target.files[0];

    let reader = new FileReader();
    reader.readAsArrayBuffer(uploadFile);
    reader.onload = (event: any) => {
      let data = new Uint8Array(event.target.result);
      let workbook = XLSX.read(data, { type: "array" });

      for (let k = 0; k < workbook.SheetNames.length; k++) {
        let first_sheet_name = workbook.SheetNames[k];
        let worksheet = workbook.Sheets[first_sheet_name];
        each_sheet_data = XLSX.utils.sheet_to_json(worksheet, {
          raw: true
        });

        for (let i = 0; i < each_sheet_data.length; i++) {
          all_sheet_data.uploadData.push(each_sheet_data[i]);
        }
      }

      all_sheet_data.uploadData.splice(0, 1);
      this.delivery_store_to_visit_fg.get('excel').setValue(
        {
          'name': uploadedFileName,
          'sheets': all_sheet_data
        }
      );
      if(this.detail_header_fg.get('tran-type').value == '2')
        (document.getElementById('file-del') as HTMLInputElement).value = null;
      else
        (document.getElementById('file-so') as HTMLInputElement).value = null;
    };
  }
  async checkExcel() {
    const loading = await this.loadCtrl.create({ message: "Checking file..", backdropDismiss: false });
    await loading.present();
    this.excelBind(this.delivery_store_to_visit_fg.get('excel').value.sheets).then(data => {
      loading.dismiss();
      if (data.dataList.length !== 0 && data.message == 'SUCCESS') {
        this.delivery_undelivered_order_fg.get('stores-byuser').value.forEach((s: myStoreData) => {
          s.check = false;
        });
        this.delivery_stores_fg.get('stores').value.forEach((s: myStoreData) => {
          s.check = false;
        });
        this.so_store_by_user_fg.get('stores-by-user').value.forEach((s: myStoreData) => {
          s.check = false;
        });
        if (this.detail_header_fg.get('tran-type').value == '1') {
          this.so_store_to_visit_fg.get('stores-to-visit').setValue(
            data.dataList.map((e: ShopData) => {
              let index: number = this.so_store_by_user_fg.get('stores-by-user').value.findIndex((check_store: myStoreData) => {
                return check_store.shop_syskey == e.shopSysKey
              })
              let myshop: myStoreData = {
                no: 0,
                shop_syskey: e.shopSysKey,
                shop_code: e.shopCode,
                shop_name: e.shopName,
                shop_address: e.address,
                order_syskey: '0',
                order_date: '',
                delivery_date: this.manager.formatDate_StringToDate(e.createdDate),
                order_no: '',
                check: index == -1 ? false : true
              }
              return myshop;
            })

          )
          this.pagination_so_store_to_visit_config.totalItems = data.totalcount;
          $('.so-store-by-user-col').removeClass('disabled');

        } else {
          this.delivery_store_to_visit_fg.get('so-trans').setValue(
            data.dataList.map((e: ShopData) => {
              let index: number = this.delivery_stores_fg.get('stores').value.findIndex((check_store: myStoreData) => {
                return check_store.shop_syskey == e.shopSysKey
              })
              let myshop: myStoreData = {
                no: 0,
                shop_syskey: e.shopSysKey,
                shop_code: e.shopCode,
                shop_name: e.shopName,
                shop_address: e.address,
                order_syskey: '0',
                order_date: '',
                delivery_date: this.manager.formatDate_StringToDate(e.createdDate),
                order_no: '',
                check: index == -1 ? false : true
              }
              return myshop;
            })

          )
          this.pagination_so_store_to_visit_config.totalItems = data.totalcount;
          $('.so-store-by-user-col').removeClass('disabled');

        }
      } else {
        this.manager.showToast(this.tostCtrl, "Message", data.regShop, 1000);
      }
    }).catch(
      e => {
        loading.dismiss();
        this.manager.showToast(this.tostCtrl, 'Message', 'Please upload valid format!', 1000);
        this.delivery_store_to_visit_fg.get('excel').setValue({
          'name': '',
          'sheets': ''
        })

      })
  }
  excelBind(all_sheet_data) {
    return new Promise<any>((res, rej) => {
      // $('#spinner-excelbtn-del').attr("style", "display: inline-block !important;");
      // $('#excelbtn-del').prop("disabled", true);
      const url = this.manager.appConfig.apiurl + 'shopPerson/getData';
      this.http.post(url, all_sheet_data, this.manager.getOptions()).subscribe(
        (data: any) => {
          // $('#spinner-excelbtn-del').attr("style", "display: none !important;");
          // $('#excelbtn-del').prop("disabled", false);
          if (data.message == "SUCCESS") {
            res(data);
          } else {
            rej();
          }

        },
        error => {
          rej();
        }
      );
    })


  }
  clearExcelFile() {
    this.delivery_store_to_visit_fg.get('excel').setValue({
      'name': '',
      'sheets': ''
    });
    try {
      (document.getElementById('file-del') as HTMLInputElement).value = null;
      (document.getElementById('file-so') as HTMLInputElement).value = null;
    }catch(e){

    }
    
  }
  print() {
    this.expLoadFlag = true;

    const url = this.manager.appConfig.apiurl + 'shopPerson/getUJUN004List';
    let param = {
      shopCode: this.list_header_fg.get('shop-code').value,
      shopName: this.list_header_fg.get('shop-name').value,
      sSyskey: this.list_header_fg.get('sSyskey').value,
      dSyskey: this.list_header_fg.get('dSyskey').value,
      tsSyskey: this.list_header_fg.get('tsSyskey').value,
      type: this.list_header_fg.get('type').value,
      date: this.manager.formatDate(this.list_header_fg.get('from-date').value),
      toDate: this.manager.formatDate(this.list_header_fg.get('to-date').value),
      currentPage: '',
      itemsPerPage: ''
    }
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {

        if (data.message == "SUCCESS") {
          let data1 = data.dataList;
          let cri_flag = 0;
          let excel_date = "";
          let type_flag = "";

          let excelTitle = "Visited Shop";
          let excelHeaderData = [
            "Date", "Shop Code", "Shop Name", "State", 
            "Township", "Type", "Status"
          ];
          let excelDataList: any = [];

          let workbook = new Workbook();
          let worksheet = workbook.addWorksheet('Visited Shop Data');

          for (var exCount = 0; exCount < data1.length; exCount++) {
            let excelData: any = [];
            excel_date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].date).toString();

            excelData.push(excel_date);
            excelData.push(data1[exCount].shopCode);
            excelData.push(data1[exCount].shopName);
            excelData.push(data1[exCount].state);
            excelData.push(data1[exCount].township);
            excelData.push(data1[exCount].type);
            excelData.push(data1[exCount].n2.toString() == "0" ? "Active" : "Inactive");

            excelDataList.push(excelData);
          }

          let titleRow = worksheet.addRow(["", "", excelTitle]);
          titleRow.font = { bold: true };
          worksheet.addRow([]);

          let criteriaRow;

          if(param.date != undefined && param.date != null && param.date.toString() != ""){
            criteriaRow = worksheet.addRow(["From Date : " + param.date.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }

          if(param.toDate != undefined && param.toDate != null && param.toDate.toString() != ""){
            criteriaRow = worksheet.addRow(["To Date : " + param.toDate.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }

          /*
          if(data1[0].shopCode != undefined && data1[0].shopCode != null && data1[0].shopCode.toString() != ""){
            criteriaRow = worksheet.addRow(["Shop Code : " + data1[0].shopCode.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }

          if(data1[0].shopName != undefined && data1[0].shopName != null && data1[0].shopName.toString() != ""){
            criteriaRow = worksheet.addRow(["Shop Name : " + data1[0].shopName.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }

          if(param.date != undefined && param.date != null && param.date.toString() != ""){
            criteriaRow = worksheet.addRow(["Address : " + '']);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          */
          
          if(param.shopCode != undefined && param.shopCode != null && param.shopCode.toString() != ""){
            criteriaRow = worksheet.addRow(["Shop Code : " + param.shopCode.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }

          if(param.shopName != undefined && param.shopName != null && param.shopName.toString() != ""){
            criteriaRow = worksheet.addRow(["Shop Name : " + param.shopName.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }

          if(param.sSyskey != undefined && param.sSyskey != null && param.sSyskey.toString() != ""){
            let sDesc = this.stateList.filter(
              s => {
                return s.syskey.toString() == param.sSyskey.toString();
              }
            )[0].t2.toString();

            criteriaRow = worksheet.addRow(["State : " + sDesc]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }

          if(param.dSyskey != undefined && param.dSyskey != null && param.dSyskey.toString() != ""){
            let dDesc = this.districtList.filter(
              d => {
                return d.syskey.toString() == param.dSyskey.toString();
              }
            )[0].t2.toString();

            criteriaRow = worksheet.addRow(["District : " + dDesc]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }

          if(param.tsSyskey != undefined && param.tsSyskey != null && param.tsSyskey.toString() != ""){
            let tsDesc = this.townshipList.filter(
              ts => {
                return ts.syskey.toString() == param.tsSyskey.toString();
              }
            )[0].t2.toString();

            criteriaRow = worksheet.addRow(["Township : " + tsDesc]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          
          if (param.type != undefined && param.type != null && param.type.toString() != "") {
            if (param.type.toString() == "1") {
              type_flag = "Order";
            } else if (param.type.toString() == "2") {
              type_flag = "Delivery";
            }
            criteriaRow = worksheet.addRow(["Type : " + type_flag]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }

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

          this.expLoadFlag = false;

          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, "Vis_export_" + new Date().getTime() + EXCEL_EXTENSION);
          });
        }
      }
    );

  }
  filterDate() {
    this.delivery_store_to_visit_fg.get('so-trans').setValue(
      this.delivery_store_to_visit_fg.get('so-trans').value.filter((s: myStoreData) => {
        return s.delivery_date !== '' && s.check == true
      })
    );
    this.pagination_delivery_so_config.totalItems = this.delivery_store_to_visit_fg.get('so-trans').value.length;
    this.pagination_delivery_so_config.currentPage = 1;
    if(this.delivery_store_to_visit_fg.get('so-trans').value.length == 0)
    {
      this.delivery_store_to_visit_fg.get('chk-all').setValue(false);
    }
  }
  deleteAllStoreToVisit() {
    if (this.detail_header_fg.get('tran-type').value == '2') {
      this.delivery_store_to_visit_fg.get('so-trans').setValue([]);
      this.delivery_undelivered_order_fg.get('stores-byuser').value.forEach((s: myStoreData) => {
        s.check = false;
      });
      this.delivery_stores_fg.get('stores').value.forEach((s: myStoreData) => {
        s.check = false;
      });
      this.pagination_delivery_so_config.currentPage = 0;
      this.pagination_delivery_so_config.totalItems = 0
    } else {
      this.so_store_to_visit_fg.get('stores-to-visit').setValue([]);
      this.so_store_by_user_fg.get('stores-by-user').value.forEach((s: myStoreData) => {
        s.check = false;
      });
    }
  }
  async save() {
    let objList = [];
    if (this.detail_header_fg.get('tran-type').value == '2') {
      if(this.detail_header_fg.get('is-use-ordertran').value){
        if (this.delivery_store_to_visit_fg.get('so-trans').value.filter((s: myStoreData) => { return s.delivery_date == '' || s.check == false }).length > 0) {
          this.manager.showToast(this.tostCtrl, "Message", 'Please set date and select all shops!', 1000)
          return;
        }
      }else{
        if (this.delivery_store_to_visit_fg.get('so-trans').value.filter((s: myStoreData) => { return s.delivery_date == '' }).length > 0) {
          this.manager.showToast(this.tostCtrl, "Message", 'Please set date!', 1000)
          return;
        }
      }
      objList = this.delivery_store_to_visit_fg.get('so-trans').value.map(
        (s: myStoreData) => {
          let param: RoutingScheduleData = {
            shopCode: s.shop_code,
            shopName: s.shop_name,
            address: s.shop_address,
            date: this.manager.formatDate(s.delivery_date),
            type: "2",
            n1: this.detail_header_fg.get('is-use-ordertran').value ? s.order_syskey : '0',
            n2: '0',
            n3: '',
            t1: s.order_no,
            t2: this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, s.order_date).toString(),
            t3: '',
            recordStatus: 1,
            shopSyskey: s.shop_syskey,
            savestatus: 1,
            userSyskeyrSk : this.manager.user.userSk,
            userId : this.manager.user.userId,
            userName : this.manager.user.userName,
            syskey: ""
          }
          return param;
        }
      );
    } else {
      if (this.so_store_to_visit_fg.get('stores-to-visit').value.filter((s: myStoreData) => { return s.delivery_date == '' }).length > 0) {
        this.manager.showToast(this.tostCtrl, "Message", 'Please set date!', 1000)
        return;
      }
      objList = this.so_store_to_visit_fg.get('stores-to-visit').value.map(
        (s: myStoreData) => {
          let param: RoutingScheduleData = {
            shopCode: s.shop_code,
            shopName: s.shop_name,
            address: s.shop_address,
            date: this.manager.formatDate(s.delivery_date),
            type: "1",
            n1: '0',
            n2: '0',
            n3: '',
            t1: '',
            t2: '',
            t3: '',
            recordStatus: 1,
            shopSyskey: s.shop_syskey,
            savestatus: 1,
            userSyskeyrSk : this.manager.user.userSk,
            userId : this.manager.user.userId,
            userName : this.manager.user.userName,
            syskey: ""
          }
          return param;
        }
      );
    }
    let loading = await this.loadCtrl.create({ message: "Processing..", backdropDismiss: false });
    await loading.present();
    const url: string = this.manager.appConfig.apiurl + 'shopPerson/userVisitedShop';
    this.http.post(url, objList, this.manager.getOptions()).subscribe(
      (data: any) => {
        loading.dismiss();
        if (data.message == 'SUCCESS') {
          this.manager.showToast(this.tostCtrl, "Message", "Success!", 1000).then(
            e => {
              this.listTabClick();
            }
          )
        } else {
          this.manager.showToast(this.tostCtrl, "Message", "Fail!", 1000).then(
            e => {

            }
          )
        }
      },
      error => {
        loading.dismiss();

      }
    )

  }
  focus(type){
    if(type==2)
    $('.pg-store-undelivered').addClass('disabled')
    else
    $('.pg-so-all').addClass('disabled');
  }
  focusOut(type){
    if(type==2)
    $('.pg-store-undelivered').removeClass('disabled')
    else
    $('.pg-so-all').removeClass('disabled');
  }
  delete() {

  }
  getSaleOrderTranByShopNameCri() {
    return new Promise<void>((res, rej) => {
    $('.store-tovisit-col').addClass('disabled');
    $('.undel-so-col').addClass('disabled');
    $('#spinner-storetovisit').attr("style", "display: inline-block !important;");
    let shopNameCri : any = this.delivery_store_to_visit_fg.get('shop-name').value;  
    this.delivery_store_to_visit_fg.get('so-trans').setValue(
      this.delivery_store_to_visit_fg.get('so-trans').value.filter((s: myStoreData) => {
        if( s.shop_name.toLocaleLowerCase().includes(shopNameCri.toLowerCase()))
        {
          return s;
        }
      })
    );
    this.pagination_delivery_so_config.totalItems = this.delivery_store_to_visit_fg.get('so-trans').value.length;
    this.pagination_delivery_so_config.currentPage = 1;    
    $('.store-tovisit-col').removeClass('disabled');
    $('.undel-so-col').removeClass('disabled');
    $('#spinner-storetovisit').attr("style", "display: none;");
    res();
    })
  }

  refreshSearchBox5() {
    this.delivery_store_to_visit_fg.get('shop-name').setValue('');
    this.getSaleOrderTran(0);
    this.pagination_delivery_so_config.currentPage = 1;
  }

  changeCheckedStore_UseOdrTran(e) 
  {
    if (e.checked) { 
      if (this.delivery_store_to_visit_fg.get('so-trans').value.filter((s: myStoreData) => { return s.check == false }).length == 0) {
        this.delivery_store_to_visit_fg.get('chk-all').setValue(true);
      }
    }else{
      this.delivery_store_to_visit_fg.get('chk-all').setValue(false);
    }
  }
  checkAllSaleOrderTran(e)
  {
    if (e.checked) {      
      this.delivery_store_to_visit_fg.get('so-trans').setValue(
        this.delivery_store_to_visit_fg.get('so-trans').value.map((s: myStoreData) => {        
            s.check = true;
          return s;
        })
      );
    } else {
      this.delivery_store_to_visit_fg.get('so-trans').setValue(
        this.delivery_store_to_visit_fg.get('so-trans').value.map((s: myStoreData) => {        
            s.check = false;
          return s;
        })
      );
    }

  }
  updateSetDateToAllDeliTran() {
    this.delivery_store_to_visit_fg.get('so-trans').setValue(
      this.delivery_store_to_visit_fg.get('so-trans').value.map(
        (s: myStoreData) => {
          if(s.check == true)
          {
            s.delivery_date = this.delivery_store_to_visit_fg.get('set-all-date-deli').value;
          }          
          return s;
        }
      )
    )
  }
  
  getStateList(){
    const url = this.manager.appConfig.apiurl + 'placecode/getstate';

    this.http.post(url, {}, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.stateList = data.stateList;
        this.stateList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
      }
    );
  }

  getDistrictList(){
    $("#tsSyskey").prop("disabled", true);
    this.list_header_fg.get('tsSyskey').setValue("");
    $("#tsSyskey").prop('selectedIndex', 0);

    if(this.list_header_fg.get('sSyskey').value.toString() == ""
      || this.list_header_fg.get('sSyskey').value.toString() == "0"){

        this.districtList = [];
        this.townshipList = [];

        $("#dSyskey").prop("disabled", true);
        this.list_header_fg.get('dSyskey').setValue("");
        $("#dSyskey").prop('selectedIndex', 0);
    } else {
      const url = this.manager.appConfig.apiurl + 'placecode/getdistrict';
      let param = {
        "stateSyskey": this.list_header_fg.get('sSyskey').value.toString()
      };

      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.districtList = data.districtList;
          this.districtList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
          $("#dSyskey").prop("disabled", false);
          $("#dSyskey").prop('selectedIndex', 0);
        }
      );
    }
  }

  getTownshipList(){
    if(this.list_header_fg.get('dSyskey').value.toString() == ""
      || this.list_header_fg.get('dSyskey').value.toString() == "0"){
        
        this.townshipList = [];

        $("#tsSyskey").prop("disabled", true);
        this.list_header_fg.get('tsSyskey').setValue("");
        $("#tsSyskey").prop('selectedIndex', 0);
    } else {
      const url = this.manager.appConfig.apiurl + 'placecode/gettsp';
      let param = {
        "districtSyskey": this.list_header_fg.get('dSyskey').value.toString()
      };

      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.townshipList = data.tspList;
          this.townshipList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
          $("#tsSyskey").prop("disabled", false);
          $("#tsSyskey").prop('selectedIndex', 0);
        }
      );
    }
  }
  getCriteriaData() {
    return {
      "soUsers": ""
    };
  }
  toggleSOUserAllSelect() {
    if (this.triggerAllSOUserSelectOption.selected) {
      this.criteria.soUsers = [];
      this.criteria.soUsers.push(-1);
      for (let souser of this.delivery_store_to_visit_fg.get('so-users').value) {
        this.criteria.soUsers.push(souser.userSysKey);
      }
    } else {
      this.criteria.soUsers = [];
    }
  }
}
