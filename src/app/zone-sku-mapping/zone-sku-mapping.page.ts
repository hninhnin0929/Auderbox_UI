import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { Workbook } from 'exceljs';
import { ControllerService } from '../controller.service';
import { zone, sku} from '../zone/interface';
import { FormControl, FormGroup } from '@angular/forms';
import { SFormat } from '../com-interface';
import * as FileSaver from 'file-saver';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $: any;
@Component({
  selector: 'app-zone-sku-mapping',
  templateUrl: './zone-sku-mapping.page.html',
  styleUrls: ['./zone-sku-mapping.page.scss'],
})
export class ZoneSkuMappingPage implements OnInit,AfterViewInit {

  btn: boolean = false;
  loaded: boolean = false;
  shopList: any = [];
  shopListSearch: any = [];
  shopList0: any = [];
  zoneList: any = [];
  assignshop: any = [];
  zoneObj: zone = this.getZoneObj();
  skuObj: sku = this.getSKUObj();
  isCheckedAll: boolean = false;
  searchtab: boolean = false;
  spinner: boolean = false;
  searchVal = "";
  searchshop1 = "";
  //hml
  start_flag: boolean = false;
  /*kmz*/
  config = {
    id: "config_storeall",
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  config_zone_sku = {
    id: 'config_zone_sku',
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  config_list = {
    id: 'config_zskumap_list',
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };


  available_store_search = "";
  available_zone_list = [];
  checked_store_list = [];
  list_searchbox_zmapsku: FormGroup;

  _users: any = [];
  _availableSKU : any = [];
  _mappedSKU : any = [];
  _allMappedSKU : any = [];
  _assignedusers: any = [];
  _allassignedusers: any = [];
  isLoading = false;

  constructor(
    public http: HttpClient,
    public router: Router,
    public manager: ControllerService,
    public loading: LoadingController,
    private tostCtrl: ToastController
  ) { this.manager.isLoginUser(); }
  ngAfterViewInit(): void {

  }

  ngOnInit() {
    this.manager.isLoginUser();
    this.list_searchbox_zmapsku = this.fromGroupListSearchBox_zmapsku();
  }
  ionViewDidEnter() {

    // this.loaded = true;
  }
  async ionViewWillEnter() {
    this.clear();
    this.btn = false;
    const loading = await this.loading.create({ message: "Please wait!", backdropDismiss: false });
    await loading.present();
    this.getList(0).then(e => {
      loading.dismiss();
    }).catch(() => { loading.dismiss() })
    $('#zmap-list-tab').tab('show');
    $('#zmap-new-tab').hide();
  }
  fromGroupListSearchBox_zmapsku() {
    return new FormGroup({
      'code': new FormControl(''),
      'name': new FormControl('')
    });
  }
  async search() {
    let loading = await this.loading.create({message:"Please wait.."});
    await loading.present();
    this.getList(0).then( ()=>{
      loading.dismiss();
    }).catch( ()=>{
      loading.dismiss();
    })
  }
  refresh () {
    this.list_searchbox_zmapsku = this.fromGroupListSearchBox_zmapsku();
  }
  clear() {
    this.checked_store_list = [];
    this.available_zone_list = [];
    this.available_store_search = "";
    this.zoneObj = this.getZoneObj();
    this.config.currentPage = 1;
    this.config.totalItems = 0;
    this.config_zone_sku.currentPage = 1;
    this.config_zone_sku.totalItems = 0;
    this.list_searchbox_zmapsku = this.fromGroupListSearchBox_zmapsku();
    this._allMappedSKU = [];
    this._mappedSKU = [];
  }
  
  getList(current:number) {
    return new Promise<void>((res, rej) => {
      // this.btn = false;
      this.spinner = true;
      if (this.manager.user.orgId.length == 0) return;
      const url = this.manager.appConfig.apiurl + 'zone/searchZoneList';
      let param = this.getZoneObj();
      param.code =  this.list_searchbox_zmapsku.get('code').value;
      param.description =  this.list_searchbox_zmapsku.get('name').value;
      param.currentRow = current;
      param.maxRow = this.config_list.itemsPerPage;

      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: SFormat) => {
          if (data.status === "SUCCESS!") {
            this.zoneList = [];
            this.zoneList = data.list;
            this.config_list.totalItems = data.totalcount;
            if(current == 0){
              this.config_list.currentPage = 1;
            }
            this.spinner = false;
            res();
          }
        },
        (error) => {
          this.spinner = false;
          console.log(error);
          rej();
        }
      )
    })


  }
  getZoneObj(): zone {
    return {
      syskey: "0",
      code: "",
      description: "",
      createDate: "",
      modifiedDate: "",
      recordStatus: 1,
      n1: "",
      n2: "",
      n3: "",
      n4: "",
      n5: "",
      t1: "",
      t2: "",
      t3: "",
      t4: "",
      t5: "",
      shopList: [],
      skuList: [],
      totalCount: -1,
      maxRow: -1,
      currentRow: -1
    }
  }

  getSKUObj(): sku {
    return {
      stockSyskey: "",
      stockCode: "",
      stockDesc: "",
      boSyskey: "",
      boDesc: "",
      brandSyskey: "",
      brandDesc: "",
      selected: false

    }
  }

  listTabClick(e) {
    $('#zmap-list').tab('show');
  }
  async newTabClick(e) {
    this.clear();
    this.searchtab = false;
    $('#zmap-new').tab('show');
    this.zoneObj = this.getZoneObj();
    let loading = await this.loading.create({message:"Please wait.."});
    await loading.present();
    this.getList(-1).then( ()=>{
      loading.dismiss();
    }).catch( ()=>{
      loading.dismiss();
    })

  }
  async detail(zone: zone) {
    this.clear();
    this.searchtab = false;
    let loading = await this.loading.create({message:"Please wait.."});
    await loading.present();
    this.getList(-1).then( ()=>{
      this.zoneObj.syskey = zone.syskey;
      this.zoneObj.code = zone.code;
      this.zoneObj.description = zone.description;
      this.btn = true;
      this.getZoneSKUMapping(0, this.zoneObj.syskey);
      $('#zmap-new-tab').tab('show');
      loading.dismiss();
      }).catch( ()=>{
        loading.dismiss();
    })
  }



  async save() {
    const loading = await this.loading.create({ message: "Please wait!", backdropDismiss: false });
    await loading.present();
    if (this.isvalid()) {
      this.zoneObj.skuList = this._mappedSKU.map((stock: sku) => {
        return {
          stockSyskey: stock.stockSyskey,
          stockCode: stock.stockCode,
          stockDesc: stock.stockDesc,
          boSyskey: stock.boSyskey,
          boDesc: stock.boDesc,
          brandSyskey: stock.brandSyskey,
          brandDesc: stock.brandDesc,
          selected: false
        }
      })
      if(this.zoneObj.skuList.length)
      {
        const url = this.manager.appConfig.apiurl + 'StockSetup/saveZoneSKUMapping';
        this.http.post(url, this.zoneObj, this.manager.getOptions()).subscribe(
          (data: any) => {
            loading.dismiss();
            if (data.status == "SUCCESS") {
              this.manager.showToast(this.tostCtrl, "Message", "Saved Successfully!", 1000).then(
                e => {
  
                  $('#zmap-list-tab').tab('show');
                  this.getList(0);
                  this.btn = false;
  
                }
              );
            } else {
              this.manager.showToast(this.tostCtrl, "Message", "Saving Fail!", 1000);
            }
          },
          (error: any) => {
            loading.dismiss();
            this.manager.showToast(this.tostCtrl, "Message", "Saving Fail!", 1000);
          }
        );
      }else{
        loading.dismiss();
        this.manager.showToast(this.tostCtrl, "Message", "Please choose SKU!", 1000);
      }
    }else
    {
      loading.dismiss();
      // this.manager.showToast(this.tostCtrl, "Message", "Saving Fail!", 1000);
    }
  }

  async gotoDelete() {
    const loading = await this.loading.create({ message: "Please wait!", backdropDismiss: false });
    await loading.present();
    const url = this.manager.appConfig.apiurl + 'zone/delete/' + this.zoneObj.syskey;
    this.http.get(url, this.manager.getOptions()).subscribe(
      (data: any) => {
        loading.dismiss();
        if (data.status == "SUCCESS!") {
          this.manager.showToast(this.tostCtrl, "Message", "Deleted Successfully!", 1000).then(
            e => {
              this.getList(0);
              $('#zmap-list-tab').tab('show');
            }
          );
        } else if (data.status == "USED!") {
          this.manager.showToast(this.tostCtrl, "Message", "This Zone Already in Used!", 1000);
        } else {
          this.manager.showToast(this.tostCtrl, "Message", "Deleting Fail!", 1000);
        }
      },
      (error: any) => {
        loading.dismiss();
        this.manager.showToast(this.tostCtrl, "Message", "Deleting Fail!", 1000);
      }
    );
  }

  isvalid() {
    if (this.zoneObj.syskey == "0" || this.zoneObj.syskey == "") {
      this.manager.showToast(this.tostCtrl, "Message", "Invalid Zone!", 1000);
      return false;
    }
    else return true;
  }



  pageChanged(e) {
    this.config.currentPage = e;
    // let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    //this.saveCheckedStore();
    // this.getAvailableStores(currentIndex);
  }
  
  async pageChangedList(e){
    this.config_list.currentPage = e;
    const currentIndex = (this.config_list.currentPage - 1) * this.config_list.itemsPerPage;
    let loading = await this.loading.create({message:"Please wait.."});
    await loading.present();
    this.getList(currentIndex).then( ()=>{
      loading.dismiss();
    }).catch( ()=>{
      loading.dismiss();
    })
  }

  async pageZoneSKUChanged(e){
    this.config_zone_sku.currentPage = e;
    // const currentIndex = (this.config_zone_sku.currentPage - 1) * this.config_zone_sku.itemsPerPage;
  }

  goSKUListPopup()
  {
    $('#zmapSKUModalList').appendTo("body").modal('show');
    this.skuObj = this.getSKUObj();
    this.isCheckedAll = false;
    this._availableSKU = [];
    this.getAvailableSKUList();

  }

  getAvailableSKUList()
  {
    let param: any = {
      t2: this.skuObj.stockCode,
      t3: this.skuObj.stockDesc
    };
    this.isLoading = true;
    const url = this.manager.appConfig.apiurl + 'StockSetup/getstockbysyskey';

    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        // this._availableSKU = data;

        // let user = data.dataList.filter(el => el.usertype == "3");
        let tempSKU = {
          "stockSyskey": "",
          "stockCode": "",
          "stockDesc": "",
          "boSyskey": "",
          "boDesc": "",
          "brandSyskey": "",
          "brandDesc": "",
          "selected": false
        };

        this._availableSKU = [];

        data.forEach(el => {
          tempSKU = {
            "stockSyskey": el.syskey,
            "stockCode": el.t2,
            "stockDesc": el.t3,
            "boSyskey": el.brandOwner.syskey,
            "boDesc": el.brandOwner.t2,
            "brandSyskey": el.brandOwner.syskey,
            "brandDesc": el.brand.t2,
            "selected": el.selected
          };

          this._availableSKU.push(tempSKU);
        });

        for (var i = 0; i < this._mappedSKU.length; i++) {
          for (var ii = 0; ii < this._availableSKU.length; ii++) {
            if (this._mappedSKU[i].stockSyskey == this._availableSKU[ii].stockSyskey) {
              this._availableSKU.splice(ii, 1);
            }
          }
        }

        this._availableSKU.sort((a, b) => (a.stockDesc > b.stockDesc) ? 1 : -1);

        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
      }, err => {
        this.isLoading = false;
      }
    );
  }

  addSKU()
  {
    this.loading.create({
      message: "Processing..",
      duration: 20000
    }).then(async el => {
      el.present();
      
      let tempSKU = {
        "stockSyskey": "",
        "stockCode": "",
        "stockDesc": "",
        "boSyskey": "",
        "boDesc": "",
        "brandSyskey": "",
        "brandDesc": "",
        "selected": true
      };

      this._availableSKU.filter(el => el.selected === true).map(val => { 
        tempSKU = {
          "stockSyskey": val.stockSyskey,
          "stockCode": val.stockCode,
          "stockDesc": val.stockDesc,
          "boSyskey": val.boSyskey,
          "boDesc": val.boDesc,
          "brandSyskey": val.brandSyskey,
          "brandDesc": val.brandDesc,
          "selected": true
        };

        this._mappedSKU.push(tempSKU);
      });
      el.dismiss();
      $('#zmapSKUModalList').appendTo("body").modal('hide');
    });
  }

  async getZoneSKUMapping(current:number, zoneSyskey: any) {
    return new Promise<void>((res, rej) => {
      // this.btn = false;
      this.spinner = true;
      if (this.manager.user.orgId.length == 0) return;
      const url = this.manager.appConfig.apiurl + 'StockSetup/getZoneSkuMapping';
      let criData: any = {
        "zoneSyskey": ""
      };
      criData.zoneSyskey = zoneSyskey;
      let param: any = {
        "data": criData,
        totalCount: -1,
        maxRow: -1,
        currentRow: -1
      };

      // param.currentRow = current;
      // param.maxRow = this.config_zone_sku.itemsPerPage;

      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this._mappedSKU = [];
          this._mappedSKU = data.dataList;
          // this._allMappedSKU = [];
          // this._allMappedSKU = data.dataList;
          this.config_zone_sku.totalItems = data.totalcount;
          this.config_zone_sku.currentPage = 1;
          this.spinner = false;
          res();
        },
        (error) => {
          this.spinner = false;
          console.log(error);
          res();
        }
      )
    })
  }

  zoneChange()
  {
    // this.clear();
    this._mappedSKU = [];
    this.btn = true;
    let changeZone = this.zoneList.filter(data => {
      return data.syskey == this.zoneObj.syskey;
    }
    )[0];
    this.zoneObj.code = changeZone.code;
    this.zoneObj.description = changeZone.description;
    this.getZoneSKUMapping(0, this.zoneObj.syskey);
    $('#zmap-new-tab').tab('show');
  }
  
  deleteAllItems()
  {
    this._mappedSKU = [];
  }
  deleteItem(stockSyskey)
  {
    // this._mappedSKU.splice(index, 1); 
    this._mappedSKU = this._mappedSKU.filter(data => {
      return data.stockSyskey != stockSyskey;
    });
  }
  allSKUSelect(event)
  {
    const checked = event.target.checked;
    this.isCheckedAll = checked;
    this._availableSKU.forEach(item => item.selected = !checked);
  }
  print()
  {

  }

}
