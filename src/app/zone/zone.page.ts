import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { Workbook } from 'exceljs';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import * as FileSaver from 'file-saver';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
import { ControllerService } from '../controller.service';
import { check_store, check_store_list, getAvariableShopAll, store_from_server, zone } from './interface';
import { FormControl, FormGroup } from '@angular/forms';
import { SFormat } from '../com-interface';

declare var $: any;
@Component({
  selector: 'app-zone',
  templateUrl: './zone.page.html',
  styleUrls: ['./zone.page.scss'],
})
export class ZonePage implements OnInit,AfterViewInit {
  btn: boolean = false;
  loaded: boolean = false;
  shopList: any = [];
  shopListSearch: any = [];
  shopList0: any = [];
  zoneList: any = [];
  assignshop: any = [];
  zoneObj: zone = this.getZoneObj();
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
  config_assign = {
    id: 'config_assign',
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  config_list = {
    id: 'config_zone_list',
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };


  available_store_search = "";
  available_zone_list = [];
  checked_store_list = [];
  list_searchbox: FormGroup;
  constructor(
    public http: HttpClient,
    public router: Router,
    public manager: ControllerService,
    public loading: LoadingController,
    public alertCtrl: AlertController,
    private tostCtrl: ToastController
  ) { this.manager.isLoginUser(); }
  ngAfterViewInit(): void {
    $(".store-search-box").focusin(()=>{
      $('.pagination-block-stores').addClass('disabled')
    });
    $(".store-search-box").focusout(()=>{
      $('.pagination-block-stores').removeClass('disabled')
    });
  }

  ngOnInit() {
    this.manager.isLoginUser();
    this.list_searchbox = this.fromGroupListSearchBox();
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
    $('#list-tab').tab('show');

  }
  fromGroupListSearchBox() {
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
    this.list_searchbox = this.fromGroupListSearchBox();
    this.getList(0);
  }
  clear() {
    this.checked_store_list = [];
    this.available_zone_list = [];
    this.available_store_search = "";
    this.zoneObj = this.getZoneObj();
    this.config.currentPage = 1;
    this.config.totalItems = 0;
    this.config_assign.currentPage = 1;
    this.config_assign.totalItems = 0;
    this.list_searchbox = this.fromGroupListSearchBox();
  }
  
  getList(current:number) {
    return new Promise<void>((res, rej) => {
      this.btn = false;
      this.spinner = true;
      if (this.manager.user.orgId.length == 0) return;
      const url = this.manager.appConfig.apiurl + 'zone/searchZoneList';
      let param = this.getZoneObj();
      param.code =  this.list_searchbox.get('code').value;
      param.description =  this.list_searchbox.get('name').value;
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
      currentRow: -1,
    }
  }
  listTabClick(e) {
    $('#list-tab').tab('show');
  }
  newTabClick(e) {
    this.clear();
    this.searchtab = false;
    $('#new').tab('show');
    this.getAvailableStores(0);

  }
  async detail(zone: zone) {
    this.clear();
    this.zoneObj = zone;
    this.btn = true;
    await this.getAvailableStores(0);
    this.getZoneStoresById(zone);
    $('#new-tab').tab('show');
  }



  async save() {
    const loading = await this.loading.create({ message: "Please wait!", backdropDismiss: false });
    await loading.present();
    if (this.isvalid()) {
      this.zoneObj.shopList = this.checked_store_list.map((s: check_store) => {
        return {
          syskey: '0',
          zoneSyskey: '0',
          shopSyskey: s.syskey,
          createDate: "",
          modifiedDate: "",
          recordStatu: 1,
          n1: ""
        }
      })
      const url = this.manager.appConfig.apiurl + 'zone/saveZone';
      this.http.post(url, this.zoneObj, this.manager.getOptions()).subscribe(
        (data: any) => {
          loading.dismiss();
          if (data.status == "SUCCESS!") {
            this.manager.showToast(this.tostCtrl, "Message", "Saved Successfully!", 1000).then(
              e => {

                $('#list-tab').tab('show');
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
    }
  }

  async gotoDelete() {
    this.alertCtrl.create({
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
              const url = this.manager.appConfig.apiurl + 'zone/delete/' + this.zoneObj.syskey;
              this.http.get(url, this.manager.getOptions()).subscribe(
                (data: any) => {
                  el.dismiss();
                  if (data.status == "SUCCESS!") {
                    this.manager.showToast(this.tostCtrl, "Message", "Deleted Successfully!", 1000).then(
                      e => {
                        this.getList(0);
                        $('#list-tab').tab('show');
                      }
                    );
                  } else if (data.status == "USED!") {
                    this.manager.showToast(this.tostCtrl, "Message", "This Zone Already in Used!", 1000);
                  } else {
                    this.manager.showToast(this.tostCtrl, "Message", "Deleting Fail!", 1000);
                  }
                },
                (error: any) => {
                  this.manager.showToast(this.tostCtrl, "Message", "Deleting Fail!", 1000);
                }
              );
              }
              )
          }
        }
      ]
    }).then(el => {
      el.present();
    })
  }
  
  isvalid() {
    if (this.zoneObj.description.trim().length === 0) {
      this.manager.showToast(this.tostCtrl, "Message", "Invalid Description!", 1000);
      return false;
    }
    else return true;
  }




  print() {
    const url = this.manager.appConfig.apiurl + 'zone/exportzoneList';
    let param: zone = {
      syskey: "",
      code: this.list_searchbox.get('code').value,
      description: this.list_searchbox.get('name').value,
      createDate: '',
      modifiedDate: '',
      recordStatus: 1,
      n1: '',
      n2: '',
      n3: '',
      n4: '',
      n5: '',
      t1: '',
      t2: '',
      t3: '',
      t4: '',
      t5: '',
      shopList: [],
      skuList: [],
      totalCount: -1,
      maxRow: -1,
      currentRow: -1
    }
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        let data1 = data.dataList;
        let cri_flag = 0;
        let utypeTemp = "";

        let excelTitle = " Zone List Report";
        let excelHeaderData = [
          " Zone Code", " Zone Name", "Shop Code", "Shop Name"
        ];
        let excelDataList: any = [];

        for (var exCount = 0; exCount < data1.length; exCount++) {
          let excelData: any = [];
          utypeTemp = this.manager.getUserTypeDesc(data1[exCount].userType);

          excelData.push(data1[exCount].code);
          excelData.push(data1[exCount].description);
          excelData.push(data1[exCount].t1);
          excelData.push(data1[exCount].t2);
          excelDataList.push(excelData);
        }

        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet('Zone List Data');

        let titleRow = worksheet.addRow(["", "", excelTitle]);
        titleRow.font = { bold: true };
        worksheet.addRow([]);

        let criteriaRow;
        if (param.code.toString() != "") {
          criteriaRow = worksheet.addRow(["Zone Code : " + param.code.toString()]);
          criteriaRow.font = { bold: true };
          cri_flag++;
        }
        if (param.description.toString() != "") {
          criteriaRow = worksheet.addRow(["Zone Name : " + param.description.toString()]);
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

        workbook.xlsx.writeBuffer().then((data) => {
          let blob = new Blob([data], { type: EXCEL_TYPE });
          FileSaver.saveAs(blob, "Zone_export_" + new Date().getTime() + EXCEL_EXTENSION);
        });
      }
    );
  }

  pageChanged(e) {
    this.config.currentPage = e;
    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    //this.saveCheckedStore();
    this.getAvailableStores(currentIndex);
  }
  pageChangedAssign(e) {
    this.config_assign.currentPage = e;
    let currentIndex = (this.config_assign.currentPage - 1) * this.config_assign.itemsPerPage;
  }
  pageBoundsCorrectionAssign(e){
    this.config_assign.currentPage = e;
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

  removeAssignedStore(rs: check_store) {
    const syskey = rs.syskey;
    const index = this.checked_store_list.findIndex((as: check_store) => {
      return as.syskey == rs.syskey;
    });
    if (index !== -1) {
      this.checked_store_list.splice(index, 1);
      const index2 = this.available_zone_list.findIndex((as: check_store) => {
        return as.syskey == syskey;
      });
      if (index2 !== -1) (this.available_zone_list[index2] as check_store).check = false;
    }
    this.config_assign.totalItems = this.checked_store_list.length;
    //this.config_assign.currentPage = 1;
  }
  saveCheckedStore() {
    const checked_stores = this.available_zone_list.filter((store_zone: check_store) => {
      return store_zone.check
    })
    for (let cs of checked_stores) {
      const foundIt = this.checked_store_list.findIndex((form_store: check_store) => { return form_store.syskey === (cs as check_store).syskey });
      if (foundIt == -1) {
        this.checked_store_list.push(cs)
      }
    };
    this.config_assign.totalItems = this.checked_store_list.length;
    this.config_assign.currentPage = 1;
  }
  changeCheckedStore(s: check_store) {
    if (!s.check) {
      const index = this.checked_store_list.findIndex((csl: check_store) => { return csl.syskey === s.syskey });
      if (index !== -1) this.checked_store_list.splice(index, 1);
      s.checked_index = -1;
      this.config_assign.totalItems = this.checked_store_list.length;
      //this.config_assign.currentPage = 1;
    } else {
      this.checked_store_list.push(s);
      this.config_assign.totalItems = this.checked_store_list.length;
      //this.config_assign.currentPage = 1;
    }

  }
  async searchAvailableStores() {
    await this.getAvailableStores(0);
    this.config.currentPage = 1;
  }
  clearAvailableStores() {
    this.available_store_search = "";
    this.getAvailableStores(0);
    this.config.currentPage = 1;
  }
  async getAvailableStores(current: number) {
    $('#progress-bar-avaliable-zonestore').show();
    const url = this.manager.appConfig.apiurl + 'shop/avariableShops';
    let param: getAvariableShopAll = {
      current: current,
      maxrow: 20,
      name: this.available_store_search,
      zonesyskey: this.zoneObj.syskey
    }
    console.log(param)
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.status == "SUCCESS!") {

          if (data.list.length > 0) {
            this.config.totalItems = data.list[0].totalcount;
          }
          this.available_zone_list =
            data.list.map((store: store_from_server) => {
              let index: number = this.checked_store_list.findIndex((check_store: check_store) => { return check_store.syskey == store.cussyskey })
              return {
                syskey: store.cussyskey,
                name: store.name,
                code: store.code,
                check: index !== -1,
                inactive: false,
                checked_index: index
              }
            })
        }
        $('#progress-bar-avaliable-zonestore').hide();
      },
      error => {
        $('#progress-bar-avaliable-zonestore').hide();
      }
    );
  }
  async getZoneStoresById(d) {
    const loading = await this.loading.create({ message: "Please wait!", backdropDismiss: false });
    await loading.present();
    const url = this.manager.appConfig.apiurl + 'zone/getzone/' + d.syskey;
    this.http.get(url, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.status === "SUCCESS!") {
          console.log(data);

          this.checked_store_list = data.list.map((as: store_from_server) => {
            return {
              syskey: as.cussyskey,
              name: as.name,
              code: as.code,
              check: false,
              inactive: false,
              checked_index: -1
            }
          })

          this.available_zone_list.map((store: check_store) => {
            store.check = this.checked_store_list.findIndex((check_store: check_store) => { return check_store.syskey == store.syskey }) == -1 ? false : true;
          })
          // this.assignshop.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
          loading.dismiss();
          $('#new-tab').tab('show');
          //this.getList();
        }
      },
      error => {
        loading.dismiss();
      }
    );
  }
  descending() {
    this.checked_store_list.sort((a: check_store, b: check_store) => {
      const first = $.trim(a.name.toLocaleUpperCase());
      const sec = $.trim(b.name.toLocaleUpperCase());
      if (first > sec) {
        return -1;
      }
    });
  }
  ascending() {
    this.checked_store_list.sort((a: check_store, b: check_store) => {
      const first = $.trim(a.name.toLocaleUpperCase());
      const sec = $.trim(b.name.toLocaleUpperCase());
      if (first < sec) {
        return -1;
      }
    });
  }
}
