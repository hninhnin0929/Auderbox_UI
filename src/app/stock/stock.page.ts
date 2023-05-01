import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { AlertController, LoadingController, ToastController, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { MatSort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { MatDatepicker, MatDatepickerContent } from '@angular/material/datepicker';
import { NgxImageCompressService } from 'ngx-image-compress';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import { ThrowStmt } from '@angular/compiler';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $: any;

@Component({
  selector: 'app-stock',
  templateUrl: './stock.page.html',
  styleUrls: ['./stock.page.scss'],
})
export class StockPage implements OnInit, AfterViewInit {
  @ViewChild(ImageCropperComponent, { static: false }) imgCropper !: ImageCropperComponent;
  @ViewChild('stockfileinput', { static: false }) imgFileInput: ElementRef;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('infinitescroll', { static: false }) scroll: IonInfiniteScroll;
  @ViewChild('infiniteScrollContent', { static: false }) scrollContent: IonInfiniteScrollContent;
  @ViewChild('pickers', { static: false }) matDatepicker: MatDatepicker<Date>;
  stockCodeSearch: FormControl = new FormControl();
  stockNameSearch: FormControl = new FormControl();
  config = {
    id: "pg-stocklist",
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };

  displayedColumns: string[] = ['No', 'Code', 'Name', 'PackType', 'PackSize'];
  dataSource: any;
  btn: boolean = false;
  defSelect = '-'
  currentPage: number = 1;
  maxLine: number = 10;
  obj: any = this.getStockModel();
  vendorList: any = [];
  uomList: any = [];
  stockList: any = [];
  brandOwnerList: any = [];
  brandList: any = [];
  wareHouseList: any = [];
  categoryList: any = [];
  subCategoryList: any = [];
  floverList: any = [];
  packTypeList: any = [];
  packSizeList: any = [];
  barcode: string = "";
  model: any = this.getObj();
  searchInput: string = "";
  searchStockList: any = [];
  sku = this.getSKU();
  skucode: string = this.matchSku();
  update: boolean = false;

  //uom
  unit: any = "";
  unitCode: any = "";
  uomjun: any = this.getStkUomJun();
  pricebasicSpec: boolean = false;

  baseStockUom: any = this.getDefUom();

  loaded = this.getLoad(true);
  progressbar: boolean = false;
  stockImg: any;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  defStockImg = 'assets/img/not-found.png';

  dtlStockImg = "";
  croperReady: boolean;

  spinner: boolean = false;
  searchtab: boolean = false;
  criteria: any = this.getCriteriaData();
  brandList1: any = [];
  ownerList1: any = [];
  categoryList1: any = [];
  subCategoryList1: any = [];
  stockList1: any = [];
  stockList2: any = [];
  criteria1: any = this.getCriteriaData();
  // save_flag: boolean = false;
  start_flag: boolean = false;
  // bindingDate: any;

  //uicontrol
  cat: boolean = false;
  subcat: boolean = false;
  bo: boolean = false;
  b: boolean = false;
  delete_param = this.getDefaultDeleteObject();
  value: any;
  searchCriteria: any = this.getSearchCriteriaData();
  isUseSAP: boolean = false;
  SAPSKUList: any = [];
  sapskuname: FormControl = new FormControl('');
  sapskuModel = this.getSAPSKUModel();
  UOMRatioList: any = [];


  constructor(
    private http: HttpClient,
    private manager: ControllerService,
    public alertController: AlertController,
    public loading: LoadingController,
    public tostCtrl: ToastController,
    private imageCompress: NgxImageCompressService
  ) {
    this.manager.isLoginUser();
  }

  inputFileChange(e) {
    let input = e.srcElement;
    let fileName = input.files[0].name;
    const reader = new FileReader();

    reader.onloadend = ()=>{
      this.compressFile(reader.result, "");
    }

    if (input.files[0]) {
      reader.readAsDataURL(input.files[0]);
    }
    this.compressFile(input.files[0], fileName)
   
  }
  compressFile(image, fileName) {
    var orientation = -1, sizeOfOriginalImage, ratio, quality, checkcompress = true;
    sizeOfOriginalImage = this.imageCompress.byteCount(image) / (1024 * 1024);
    if (sizeOfOriginalImage >= 5) {
      ratio = 10;
      quality = 10;
    }
    else if (sizeOfOriginalImage < 5 && sizeOfOriginalImage >= 0.9) {
      ratio = 25;
      quality = 40;
    }
    else if (sizeOfOriginalImage < 0.9 && sizeOfOriginalImage >= 0.5) {
      ratio = 30;
      quality = 50;
    }
    else if (sizeOfOriginalImage < 0.5) {
      ratio = 45;
      quality = 50;
      checkcompress = false;
    }

    if (checkcompress) {
      this.imageCompress.compressFile(image, orientation, ratio, quality).then(
        result => {
          var sizeOFCompressedImage = this.imageCompress.byteCount(result) / (1024 * 1024)
          this.stockImg = result;
        });
    } else {
      this.stockImg = image;
    }
  }
  // cropImage() {
  //   let croppedImage = this.imgCropper.crop();
  //   this.stockImg = croppedImage.base64;
  //   this.compressFile(this.stockImg, "");
  //   $('#imgcrp').appendTo("body").modal('hide');
  //   console.log("Stock img == " + this.stockImg);

  //   this.croperReady = false;
  // }
  cropImageCencel() {
    this.croperReady = false;
  }
  imageCropped(event: ImageCroppedEvent) {
    console.log('image cropped event')
  }
  imageLoaded() {
    this.croperReady = true;
    console.log('image loaded ')
  }
  cropperReady() {
    this.croperReady = true;
    console.log('cropperReady')
  }
  loadImageFailed() {
   
  }
  previewStockImage() {
    if (this.stockImg == this.defStockImg) return;
    $('#previewStockImgModel').appendTo("body").modal('show');
  }
  previewModelClose() {
    $('#previewStockImgModel').appendTo("body").modal('hide');
  }
  clearStockImage() {
    this.stockImg = this.defStockImg;
    this.imgFileInput.nativeElement.value = "";
    let label = document.getElementById("imginputLabel");
  }
  ngAfterViewInit() {

  }
  getDefUom() {
    return [{
      syskey: "0",
      n1: "",
      n2: "",
      n3: 1,
      t1: "",
      n4: 1,
      n5: 1,
      n6: 1,
      t2: "",
      n7: 0,
      t3: "",
      n8: 0.0,
      n9: 0.0,
      t4: "",
      t5: "Base",
      n10: 0.0,
      n11: 0.0,
      n12: 0.0,
      lvlDesc: "",
      recordStatus: 1
    }, {
      syskey: "0",
      n1: "",
      n2: "",
      n3: 1,
      t1: "",
      n4: 2,
      n5: 1,
      n6: 1,
      t2: "",
      n7: 0,
      t3: "",
      n8: 1,
      n9: 1,
      t4: "",
      t5: "Stock",
      n10: 0.0,
      n11: 0.0,
      n12: 0.0,
      lvlDesc: "",
      recordStatus: 1
    }]
  }

  getLoad(obj: boolean) {
    return { p1: obj, p2: obj, p3: obj, p4: obj, p5: obj, p6: obj, p7: obj, p11: obj, p12: obj, p13: obj, p14: obj, p15: obj }
  }
  ngOnInit() {
    this.manager.isLoginUser();


    //this.dataSource.sort = this.sort;
  }

  async ionViewWillEnter() {
    this.manager.isLoginUser();
    this.isUseSAP = this.manager.settingData.n8 == '1' ? true : false;
    if (this.manager.user.orgId.length == 0) return;
    $('#spSKUCode1').css('border-color', '');
    this.start_flag = true;
    this.btn = false;
     $("#cri-ordering").val("desc").change();
    // this.criteria.ordering = "asc";
    this.progressbar = true;
    this.stockImg = this.defStockImg;    
    $('#stockList-tab').tab('show');
    $('#searchVar').show();
    this.runSpinner(true);
    this.getStockList(0,this.config.itemsPerPage).then( er=>{
      this.runSpinner(false);
    }).catch( error=>{
      this.runSpinner(false);
    })
   
    this.allList();
    $('#spinner-shop').hide();
  }

  runSpinner(t: boolean) {
    this.spinner = t;
  }

  ionViewDidEnter() {
    // this.loading.dismiss();
  }

  ionViewDidLeave() {
    this.vendorList = [];
    this.uomList = [];
    this.stockList = [];
    this.brandOwnerList = [];
    this.brandList = [];
    this.wareHouseList = [];
    this.categoryList = [];
    this.subCategoryList = [];
    this.floverList = [];
    this.packTypeList = [];
    this.packSizeList = [];
    this.model = this.getObj();
    this.obj = this.getStockModel();
    this.sku = this.getSKU();

    $('#stockList-tab').tab('show');
  }

  sortCol(index) {
    switch (index) {
      case 1: this.stockList.sort((a, b) => (a.Code > b.Code) ? 1 : -1); break;
      case 2: this.stockList.sort((a, b) => (a.Name > b.Name) ? 1 : -1); break;
      case 3: this.stockList.sort((a, b) => (a.PackType > b.PackType) ? 1 : -1); break;
      case 4: this.stockList.sort((a, b) => (a.PackSize > b.PackSize) ? 1 : -1); break;
      case 5: this.stockList.sort((a, b) => (a.CategoryName > b.CategoryName) ? 1 : -1); break;
      case 6: this.stockList.sort((a, b) => (a.SubCategoryName > b.SubCategoryName) ? 1 : -1); break;
      case 7: this.stockList.sort((a, b) => (a.BrandName > b.CategoryName) ? 1 : -1); break;
      case 8: this.stockList.sort((a, b) => (a.BrandOwnerName > b.BrandOwnerName) ? 1 : -1); break;
      case 9: this.stockList.sort((a, b) => (a.Price > b.Price) ? 1 : -1); break;
      case 10: this.stockList.sort((a, b) => (a.spSKUCode > b.spSKUCode) ? 1 : -1); break;
      // case 11: this.stockList.sort((a, b) => (a.Status > b.Status) ? 1 : -1); break;
      case 11: this.stockList.sort((a, b) => (a.CreatedDate > b.CreatedDate) ? 1 : -1); break;
    }
  }

  searchFilter() {
    let searchb = $("#searchVar").val()
    this.stockList = this.searchStockList.filter(e => {
      if (e.Code.toLowerCase().includes(searchb.toLowerCase())) {
        return e;
      } else {
        this.stockList = this.searchStockList;
      }
    })
  }
  clearsearch() {
    this.searchInput = '';
  }
  newstockTab() {
    // this.save_flag = false;
    this.criteria = this.getCriteriaData();
    this.clearData();
    this.clearStockImage();
    this.obj = this.getStockModel();
    this.sapskuModel = this.getSAPSKUModel();
    this.sapskuname.setValue('');
    this.SAPSKUList = [];
    this.getUOMConversion(false);
    this.updateEnable();
  }
  updateEnable(){
    $("#spSKUCode1").prop('disabled', false);
    $("#stkstockunit").prop('disabled', false);
    $("#uomratio").prop('disabled', false);
  }
  updateDisable(){
    $("#spSKUCode1").prop('disabled', true);
    $("#stkstockunit").prop('disabled', true);
    $("#uomratio").prop('disabled', true);
  }
  clearData() {
    $('#spSKUCode1').css('border-color', '');
    this.start_flag = false;
    this.model = this.getObj();
    this.obj = this.getStockModel();
    this.baseStockUom = this.getDefUom();
    this.getUomList();
    this.getVendorList();
    this.getCategoryList();
    this.getWareHouseList();
    this.getRequiremant();
    this.getCriteriaData();
    this.getSearchCriteriaData();
    this.update = false;
    this.sku = this.getSKU();
    this.stockImg = this.defStockImg;

    this.imgFileInput.nativeElement.value = "";
    $('#searchVar').hide();
    $("select").val([]);
    this.btn = true;
  }
  async stockListTab() {
    $('#stockList-tab').tab('show');
    // this.runSpinner(true);
    // await this.getStockList();
    // this.runSpinner(false);
    // this.start_flag = true;

    // this.reset(true);
  }
  async reset(b) {

    this.vendorList = [];
    this.uomList = [];
    this.stockList = [];
    this.brandOwnerList = [];
    this.brandList = [];
    this.wareHouseList = [];
    this.categoryList = [];
    this.subCategoryList = [];
    this.floverList = [];
    this.packTypeList = [];
    this.packSizeList = [];
    // this.criteria = this.getCriteriaData();

    this.model = this.getObj();
    this.obj = this.getStockModel();
    this.sku = this.getSKU();
    this.update = false;
    if (b) {
      this.btn = false;
      await this.searchWithCriteria(true);
      $("#cri-ordering").val("asc").change();
      // this.criteria.ordering = "asc";
      $('#stockList-tab').tab('show');
      $('#searchVar').show();
      $('#moretag').text('More');
    }

  }
  showBarcodeList() {
    $('#barcodeModal').appendTo("body").modal('show');
  }
  addBarcode() {
    if (this.barcode.length == 0) return;
    var bc = this.getBarcodeObj();
    bc.t1 = this.barcode;
    bc.n2 = 3;
    bc.uomsyskey = this.model.stockuom.syskey;
    bc.uomType = 1;
    this.obj.stockbarcode.push(bc);
    this.barcode = "";
    this.manager.showToast(this.tostCtrl, "Message", "Success", 2000);
  }
  deleteBarcode(index) {
    if (this.obj.stockbarcode[index].syskey.length > 0) {
      this.obj.stockbarcode[index].recordStatus = 4;
    }
    else
      this.obj.stockbarcode.splice(index, 1);
  }

  additionalUom() {
    this.pricebasicSpec = false;
    this.uomjun = this.getStkUomJun();
    $('#uomModel').appendTo("body").modal('show');
  }

  unitChange() {

    this.uomList.forEach(element => {
      if (element.syskey == this.uomjun.n2) {
        this.unitCode = element.t1;
      }
    });
  }
  addAddUom() {
    $('#uomModelList').appendTo("body").modal('show');
  }
  saveUomModel() {
    this.uomjun.n5 = this.pricebasicSpec == true ? 2 : 1;
    this.uomjun.n4 = 3;
    this.uomjun.t5 = this.unitCode;
    this.uomjun.t4 = this.baseStockUom[0].t4;
    if (this.uomjun.n2 == "") return;
    else if (this.uomjun.n3 == 0) return;
    else if (this.uomjun.n6 == 0.0) return;
    this.obj.stockuomjun.push(this.uomjun);

    this.uomList.forEach(element => {
      if (element.syskey == this.uomjun.n2) {
        element.disable = true;
      }
    });
    this.uomjun = this.getStkUomJun();
    this.pricebasicSpec = false;
    this.unitCode = "";
    this.unit = "";
    $('#uomModel').appendTo("body").modal('hide');
  }
  stockUomChange() {
    this.uomList.forEach(el => {
      if (el.syskey == this.model.stockuom.syskey) {
        this.baseStockUom.forEach(element => {
          if (element.n4 == 1) {
            element.n2 = el.syskey;
            element.t4 = el.t1;//code
            // element.n3 = el.n3;//ratio
            element.t5 = "Base";
          }
          if (element.n4 == 2) {
            element.n2 = el.syskey;
            element.t4 = el.t1;//code
            // element.n3 = el.n3;//ratio
            element.t5 = "Stock";
          }
        });
        this.obj.stockuomjun.forEach(element => {
          element.t4 = el.t1;//code          
        });
        this.obj.stockbarcode.forEach(element => {
          if (element.n2 == 3) {
            element.uomsyskey = el.syskey;
          }
        });
      }
    });

  }
  delUomTable(i) {
    this.obj.stockuomjun.splice(i, 1);
  }
  detailUomTable(item) {
    $('#uomModelList').appendTo("body").modal('hide');

    this.uomjun = this.getStkUomJun();
    this.uomjun.syskey = item.syskey;
    this.uomjun.n2 = item.n2;
    this.uomjun.n3 = item.n3;
    this.uomjun.n6 = item.n6;

    this.pricebasicSpec = item.n5 == 2 ? true : false;
    this.uomjun = item;
    $('#uomModel').appendTo("body").modal('show');
  }
  getRequiremant() {
    const url = this.manager.appConfig.apiurl + 'StockSetup/getrequirements';
    this.http.get(url, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.loaded.p6 = true;
        this.floverList = data.floverlist;
        this.packSizeList = data.packsizelist;
        this.packTypeList = data.packtypelist;
      }
    )
  }
  getVendorList() {
    this.vendorList = [];
    var param = {
      syskey: '0',
      code: '',
      name: '',
      currentPage: 1,
      totalPage: 1,
      where: ''
    }
    const url = this.manager.appConfig.apiurl + 'vendor/getlist';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.loaded.p3 = true;
        this.vendorList = [];
        this.vendorList = data;

      },
      (error) => {
        console.log(error);
      }
    )
  }
  getUomList() {
    this.uomList = [];
    const url = this.manager.appConfig.apiurl + 'uom/uom-list';
    this.http.get(url, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.loaded.p2 = true;
        this.uomList = data;
        if (this.uomList.length > 0) {
          this.uomList.forEach(element => {
            element.disable = false;
          });
          if (this.obj.syskey == '0') {
            this.baseStockUom.forEach(element => {
              if (element.n4 == 1) {
                element.n2 = this.uomList[0].syskey;
                element.t4 = this.uomList[0].t1;//code
              }
              if (element.n4 == 2) {
                element.n2 = this.uomList[0].syskey;
                element.t4 = this.uomList[0].t1;//code
              }
            });
            this.model.stockuom.syskey = this.uomList[0].syskey;
          }
        }
      },
      (error) => {
        console.log(error);
      }
    )
  }
  getBrandList(boid) {
    return new Promise<void>(promise => {
      this.brandList = [];
      const url = this.manager.appConfig.apiurl + 'brand/searchBrandList';
      var param = {
        code: '',
        description: '',
        bosyskey: boid
      }
      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          promise();
          this.brandList = [];
          this.brandList = data.brandlistdata;
        },
        error => {
          promise();
        }
      )
    })

  }
  getCategoryList() {
    this.categoryList = [];
    const url = this.manager.appConfig.apiurl + 'stockcategory/searchStockCatList';
    var param = {
      code: '',
      description: '',
      currentPage: 1,
      pageSize: 1,
    }
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.loaded.p4 = true;
        this.categoryList = [];
        this.categoryList = data.catlist;
      }
    )
  }
  getBrandOwnerList(catid) {
    if (catid == undefined || catid == "") return;
    const url = this.manager.appConfig.apiurl + 'brandowner/getlistbycatid/' + catid;

    return new Promise<void>(promise => {
      this.http.get(url, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.brandOwnerList = [];
          this.brandOwnerList = data;
          this.loaded.p1 = true;
          promise();
        },
        error => {
          promise();
        }
      )
    })
  }
  getWareHouseList() {
    const url = this.manager.appConfig.apiurl + 'warehouse/getList';
    var param = { code: "", description: "" };
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.loaded.p5 = true;
        this.wareHouseList = [];
        this.wareHouseList = data.dataList;
      }
    )
  }
  getSubCategoryList(catSyskey) {
    if (catSyskey == undefined) return;
    const url = this.manager.appConfig.apiurl + 'subcategory/searchSubCatList';
    var param = { code: "", description: "", categorySyskey: catSyskey }
    return new Promise<void>(promise => {
      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.subCategoryList = [];
          this.subCategoryList = data;
          promise();
        },
        error => {
          promise();
        }
      )
    });
  }

  // advanceSearch(option) {
  //   this.searchtab = option;

  //   if (this.searchtab == false) {
  //     let cri_ordering = this.criteria.ordering;
  //     this.criteria = this.getCriteriaData();
  //     //this.criteria.ordering = cri_ordering;
  //   }
  // }

  async search() {
    this.start_flag = false;
    // this.save_flag = false;
    this.runSpinner(true);
    //await this.searchWithCriteria(true);
    this.getStockList(0,this.config.itemsPerPage).then( ()=>{
      this.runSpinner(false);
    }).catch( ()=>{
      this.runSpinner(false);
    })
  }

  getSearchCriteriaData() {
    return {
      "categoryName":"",
      // "syskey": ""
      // "skuCode": "",
      // "skuName": "",
      // "shopCode": "",
      // "shopName": "",
      // "brandOwner": "",
      // "fromDate": "",
      // "toDate": "",
      // "location": "",
      // "spSKUCode": "",
      // "type": "",
      // "current": "",
      // "maxRow": "",
      // "userName": "",
      // "saveStatus": "",
      // "township": "",
      // "state":""

    };
  }

  getStockList(cur,max) {
    const url = this.manager.appConfig.apiurl + 'StockSetup/getstocklist/' + cur + '/' + max;
    this.value = "";
    for (var i = 0; i < this.searchCriteria.categoryName.length; i++) {
      this.value += this.searchCriteria.categoryName[i] + ",";
    }
    this.value = this.value.slice(0, -1);
    this.criteria.categoryName = this.value;
    return new Promise<void>((promiseStock,reject) => {
      this.http.post(url, this.criteria ,this.manager.getOptions()).subscribe(
        (data: any) => {
          if (data.status == "SUCCESS") {
            this.config.totalItems = data.totalCount;
            if(cur == 0){
              this.config.currentPage = 1;
            }
            this.stockList = data.dataList.map( stocks=>{
              let mod = {
                No: 0,
                Code: "",
                Name: "",
                PackType: "",
                PackSize: "",
                Syskey: "",
                CategoryName: "",
                SubCategoryName: "",
                BrandName: "",
                BrandOwnerName: "",
                spSKUCode: "",
                SAPSKUDesc: "",
                Price: 0,
                Status: true,
                CreatedDate: "",
                StkInfoStat: "",
                ISSAP: ""
              };
              mod.Syskey = stocks.syskey;
              //mod.No = i;
              mod.Code = stocks.t2;
              mod.Name = stocks.t3;
              mod.PackType = stocks.packType.description;
              mod.PackSize = stocks.packSize.description;
              mod.CategoryName = stocks.category.t2;
              mod.SubCategoryName = stocks.subCategory.t2;
              mod.BrandName = stocks.brand.t2;
              mod.BrandOwnerName = stocks.brandOwner.t2;
              mod.Price = stocks.stockuomjun[0].n6;
              mod.spSKUCode = stocks.t4;
              mod.SAPSKUDesc = stocks.t14;
              mod.Status = stocks.n1 == 0 ? true:false;
              mod.CreatedDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, stocks.createddate);
              mod.ISSAP = stocks.n40 == 1 ? "YES" : "NO";
              mod.StkInfoStat = stocks.n41 == 1 ? "Partial" : "Complete";
              return mod;
            })
          
          } else {
            reject();
          }
          promiseStock();
        },
        error=>{
          reject();
        });
      });
  }
  getStockCritia() {
    return {
      syskey: "",
      t2: "",//Code
      t3: "",//Desc
      n6: "",//VendorSyskey
      n9: "",//PackTypeSyskey
      n10: "",//PackSizeSyskey
      n11: "",//FlavorSyskey
      n16: "",//BrandSyskey
      n33: "" //CategorySyskey
    }
  }
  detail(item) {
    if (!item.Status) {
      this.manager.showToast(this.tostCtrl, "Message", "Inactive stock", 1000);
      return;
    }
    this.btn = true;
    this.sapskuname.setValue('');
    this.SAPSKUList = [];
    this.loading.create({
      animated: true,
      message: "Processing..",
      backdropDismiss: false

    }).then(e => {
      e.present()
      this.loaded = this.getLoad(false);
      this.clearData();
      this.obj.syskey = item.Syskey;
      const syskey = item.Syskey;

      var param = {
        syskey: syskey
      }
      this.loaded = this.getLoad(false);
      const url = this.manager.appConfig.apiurl + 'StockSetup/getStockBySyskeyWeb';
      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          e.dismiss();
          this.loaded = this.getLoad(true);
          let label = document.getElementById("imginputLabel");
          // label.textContent = "Update file";
          $('stockfileinputlabel').attr("placeholder", "Update file");
          this.imgFileInput.nativeElement.value = "";
          var uomid = "";
          //
          this.model = this.getObj();
          const d = data[0];
          this.model.code = d.t2;
          this.model.desc = d.t3;
          this.model.spSKUCode = d.t4;
          this.model.n40 = d.n40;
          this.obj.n31 = ""+d.n31;
          const mg = d.t1.length == 0 ? this.defStockImg : this.manager.appConfig.imgurl.concat(d.t1);
          this.stockImg = mg;

          this.dtlStockImg = mg;
          this.model.whid = d.wh.syskey;
          this.model.syskey = d.syskey;
          this.model.brandownerid = d.brandOwner.syskey;
          this.model.brandid = d.brand.syskey;
          this.model.catid = d.category.syskey;
          this.model.subcatid = d.subCategory.syskey;
          this.model.ptid = d.packType.syskey;
          this.model.psid = d.packSize.syskey;
          this.model.flid = d.flover.syskey;
          this.baseStockUom = [];
          this.model.stockuom.syskey = d.n36;
          d.stkDetail.forEach(detail => {
            if (detail.uomType == 'Confirm') {
              this.obj.n22 = detail.price;
            }
          });
          for (let i = 0; i < d.stockuomjun.length; i++) {
            if (d.stockuomjun[i].n4 == 2)
            {
              // this.getUOMConversion(true,d.stockuomjun[i].n3).then(()=>{
              //   // this.obj.ratio = d.stockuomjun[i].n3;
              //   }
                
              // )
              this.getUOMConversion(true,d.stockuomjun[i].n3);
            }
            if (d.stockuomjun[i].n4 == 3) {
              this.uomjun = d.stockuomjun[i];
              this.pricebasicSpec = d.stockuomjun[i].n5 == 2 ? true : false;
              this.uomList.forEach(e => {
                if (e.syskey == this.uomjun.n2) {
                  e.disable = true;
                  this.uomjun.t4 = e.t1;
                  this.uomjun.t5 = e.t2;
                }

              });
              this.obj.stockuomjun.push(this.uomjun);
              this.uomjun = this.getStkUomJun();
              this.pricebasicSpec = false;
              this.unitCode = "";
              this.unit = "";
            } else {
              this.baseStockUom.push(d.stockuomjun[i]);
            }
          }
          d.stkDetail.forEach(e => {
            if (e.uomType == "Base") {
              this.obj.n22 = e.price;
            }
          });
          this.obj.stockbarcode = d.stockbarcode;
          if(this.isUseSAP){
            this.update = false;
            if(this.model.n40 == 1)
            {
              this.updateDisable();
            }else
            {
              this.updateEnable();
            }
          }else{
            this.update = true;
          }

          // this.stockUomChange();
          this.unitChange();
          // 
          this.catChage(false);
          this.brandChange();

          this.brandOwnerChange();
          this.model.n13 = d.n13;
          this.model.t21 = d.t21;
          this.model.t13 = d.t13;
          if(this.model.n13 != '' && this.model.n13 != '0')
          {
            // this.model.t21 = "POSM";
            this.getSAPSKU();
          }
        },
        e => {

        }
      )
      $('#stockNew-tab').tab('show');
    })
  }

  getDefaultDeleteObject() {
    return {
      "inUsed_RecordStatus": "RecordStatus",
      "inUsed_Table": "SOP002",
      "count_Column": "SYSKEY",
      "inUsed_Column": "n1",
      "delete_Table": "STK001",
      "delete_Column": "SYSKEY",
      "delete_Key": ""
    };
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
            this.loading.create({
              message: "Processing",
              backdropDismiss: false,
              duration: 5000
            }).then(
              el => {
              el.present();
            // this.obj.recordStatus = 4;
            // this.save()
            const url = this.manager.appConfig.apiurl + 'delete/tempDelete';
            let deleteObj = this.getDefaultDeleteObject();
            deleteObj.delete_Key = this.obj.syskey;
            // deleteObj.count_Column = "n8";
            // deleteObj.inUsed_Table = "PMO006";
            // deleteObj.inUsed_Column = "n8";           
            var subscribe = this.http.post(url, deleteObj, this.manager.getOptions()).subscribe(                (data: any) => {
                  el.dismiss();
                  if (data.message == "SUCCESS!") {
                    this.manager.showToast(this.tostCtrl, "Message", "Deleted Successfully!", 1000).then(
                      e => {
                        this.reset(true);
                        this.newstockTab();
                        this.btn = false;
                        this.runSpinner(true);
                        this.getStockList(0,this.config.itemsPerPage).then( er=>{
                          this.runSpinner(false);
                        }).catch( error=>{
                          this.runSpinner(false);
                        })
                        $('#stockList-tab').tab('show');
                        $("#cri-ordering").val("desc").change();
                        this.criteria.ordering = "desc";
                      }
                    );
                  } else if (data.message == "USED!") {
                    this.manager.showToast(this.tostCtrl, "Message", "This Product Already in Used!", 1000);
                  } else {
                    this.manager.showToast(this.tostCtrl, "Message", "Deleting Fail!", 1000);
                  }
                },
                (error: any) => {
                  el.dismiss();
                  this.manager.showToast(this.tostCtrl, "Message", "Deleting Fail!", 1000);
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
  async catChage(type) {
    if (this.model.catid === undefined || this.model.catid === "") return;
    this.categoryList.forEach(element => {
      if (element.syskey === this.model.catid) {
        this.sku.cat = element.t1;
      }
    });
    if (type) {
      this.model.subcatid = "";
      this.model.brandownerid = "";
      this.model.brandid = "";
    }

    this.subcat = true;
    await this.getSubCategoryList(this.model.catid);
    this.subcat = false;
    this.bo = true;
    await this.getBrandOwnerList(this.model.catid);
    this.bo = false;
  }
  subCatChange() {
    if (this.model.subcatid == undefined || this.model.subcatid === "") return;
    this.subCategoryList.forEach(element => {
      if (element.syskey == this.model.subcatid) {
        this.sku.subcat = element.t1;
      }
    });
  }

  async brandOwnerChange() {
    if (this.model.brandownerid === undefined || this.model.brandownerid === "") return;
    this.brandOwnerList.forEach(element => {
      if (element.syskey == this.model.brandownerid) {
        this.sku.brandowner = element.t1;
      }
    });
    this.b = true;
    await this.getBrandList(this.model.brandownerid);
    this.b = false;
  }
  brandChange() {
    if (this.model.brandid === undefined || this.model.brandid === "") return;
    this.brandList.forEach(element => {
      if (element.syskey == this.model.brandid) {
        this.sku.brand = element.t1;
      }
    });
  }
  psChange() {
    if (this.model.psid == undefined || this.model.psid === "") return;
    this.packSizeList.forEach(element => {
      if (element.syskey == this.model.psid) {
        this.sku.ps = element.code;
      }
    });
  }
  ptChange() {
    if (this.model.ptid == undefined || this.model.ptid === "") return;
    this.packTypeList.forEach(element => {
      if (element.syskey == this.model.ptid) {
        this.sku.pt = element.code;
      }
    });
  }
  flChange() {
    if (this.model.flid == undefined || this.model.flid === "") return;
    this.floverList.forEach(element => {
      if (element.syskey == this.model.flid) {
        this.sku.pc = element.code;
      }
    });
  }
  save() {
    //  if (this.model.desc == "") return;
    if (this.model.desc == "" ||
      this.model.catid == "" || this.model.catid == '0' || this.model.subcatid == "" || this.model.subcatid == '0' ||
      this.model.brandownerid == "" || this.model.brandownerid == '0' || this.model.brandid == "" || this.model.brandid == '0' || this.model.ptid == "" || this.model.ptid == '0' ||
      this.model.psid == "" || this.model.psid == '0' || this.model.flid == "" ||  this.model.flid == '0' || this.model.whid == "" || this.model.whid == '0') {
      this.manager.showToast(this.tostCtrl, "Message", "Please fill all fields", 1000);
    }
    else {
      this.loading.create(
        {
          message: "Processing..",
        }
      ).then(
        el => {
          el.present();
          let status = "";
          // this.model.code = this.update ? this.model.code : this.matchSku();
          this.model.code = this.model.code =='' ? this.matchSku() : this.model.code;
          this.obj.syskey = this.model.syskey;
          if (this.stockImg === this.defStockImg || this.stockImg === this.dtlStockImg) {
            this.obj.t1 = '';
          }
          else {
            this.obj.t1 = this.stockImg;
          }
          this.obj.t2 = this.model.code;
          this.obj.t3 = this.model.desc;
          this.obj.t4 = this.model.spSKUCode
          this.obj.n4 = this.model.catid;
          this.obj.n5 = this.model.subcatid;
          this.obj.n6 = this.model.vendorid;
          this.obj.n7 = this.model.brandownerid;
          this.obj.n8 = this.model.brandid;
          this.obj.n9 = this.model.ptid;
          this.obj.n10 = this.model.psid;
          this.obj.n11 = this.model.flid;
          this.obj.n12 = this.model.whid;
          this.obj.n41 = 0; //stock info status
          this.obj.n13 = this.model.n13;
          this.obj.t19 = this.model.t19;
          this.obj.t20 = this.model.t20;
          this.obj.t21 = this.model.t21;
          // this.obj.t12 = this.model.t12;
          this.obj.t13 = this.model.t13;
          this.baseStockUom.forEach(element => {
            if (this.obj.stockuomjun.indexOf(element) == -1) {
              this.obj.stockuomjun.push(element);
            }
          });
          var hold = {
            syskey: "",
            n1: this.obj.n12
          }
          this.obj.stockholding.push(hold);
          var wh = {
            n1: this.obj.n12
          }
          this.obj.stockWH.push(wh);
          const url = this.manager.appConfig.apiurl + 'StockSetup/save';
          var subscribe = this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
            (data: any) => {
              status = data.message;
              el.dismiss();
            },
            error => {
              console.log(error);
              status = "FAIL!";
              el.dismiss();
            }
          )
          el.onDidDismiss().then(
            el => {
              if (status !== "") {
                this.manager.showToast(this.tostCtrl, "Message", status, 1000).then(
                  e => {
                    if (status.toString() == "Code Already Existed") {
                      $('#spSKUCode1').css('border-color', 'red');
                    } else {
                      // this.reset(true);
                      // this.newstockTab();
                      // // this.save_flag = true;
                      // this.btn = false;
                      // $('#stockList-tab').tab('show');
                      // // this.getStockList();
                      // $("#cri-ordering").val("desc").change();
                      // this.criteria.ordering = "desc";
                      // // this.criteria.ordering = "desc";
                      // // this.searchWithCriteria(true);
                      $('#spSKUCode1').css('border-color', '');
                      this.start_flag = true;
                      this.btn = false;
                      $("#cri-ordering").val("asc").change();
                      // this.criteria.ordering = "asc";
                      this.progressbar = true;
                      this.stockImg = this.defStockImg;
                      //this.loaded = this.getLoad(true);
                      this.getStockList(0,this.config.itemsPerPage);
                      $('#stockList-tab').tab('show');
                      $('#searchVar').show();
                    }
                  })
              } else {
                subscribe.unsubscribe();
                this.manager.showToast(this.tostCtrl, "Message", "Timeout! try again", 1000);
              }
            }
          )
        }
      )
    }

  }
  getSKU() {
    return {
      cat: "",
      subcat: "",
      brandowner: "",
      brand: "",
      ps: "",
      pt: "",
      pc: "",
      sku: ""
    }
  }
  getObj() {
    return {
      syskey: "0",
      code: "",
      desc: "",
      serial: "",
      vendorid: "",
      brandownerid: "",
      brandid: "",
      catid: "",
      subcatid: "",
      ptid: "",
      psid: "",
      flid: "",
      whid: "",
      stockuom: {
        syskey: "",
        code: ""
      },
      spSKUCode: "",
      n13: "",
      n40: 0,
      t19: "",
      t20: "",
      t21: "",
      t12: ""
    }
  }
  getStockModel() {
    return {
      syskey: "0",
      recordStatus: 1,
      t1: "",
      t2: "",//code
      t3: "",//desc
      n4: "",//category syskey
      n5: "",//subCategory sysksy
      n6: "", //vendorsk
      n7: "",//brandowner syskey
      n8: "",//brand syskey
      n9: "",//packtype
      n10: "",//packsize
      n11: "",//flavour syskey
      n12: "",//warehouse syskey
      n22: 0,
      stockholding: [],
      stockWH: [],
      stockuomjun: [],
      stockbarcode: [],
      image: "",
      n31: "0",
      n41: 0,
      n13: "0",
      t19: "",
      t20: "",
      t21: "",
      ratio: 1
    }
  }
  getStkUomJun() {
    return {
      syskey: "0",
      n1: "",
      n2: "",
      n3: 1,
      t1: "",
      n4: 0,
      n5: 0,
      n6: 1,
      t2: "",
      n7: 0,
      t3: "",
      n8: 0.0,
      n9: 0.0,
      t4: "",
      t5: "",
      n10: 0.0,
      n11: 0.0,
      n12: 0.0,
      lvlDesc: "",
      recordStatus: 1
    }
  }
  getBarcodeObj() {
    return {
      syskey: "0",
      createddate: "",
      modifieddate: "",
      userid: "",
      username: "",
      parentid: "",
      recordStatus: 1,
      syncStatus: 0,
      syncBatch: "",
      t1: "",
      t2: "",
      t3: "",
      n1: 0,
      n2: 0,
      n3: 0,
      n4: "",
      userSyskey: "",
      uomsyskey: "",
      uomType: 0


    }
  }

  matchSku(): string {
    return this.sku.cat + this.sku.subcat + this.sku.brandowner +
      this.sku.brand + this.sku.ps + this.sku.pt + this.sku.pc;
  }

  // async loadData() {
  //   $('#moretag').hide();
  //   this.progressbar = true;
  //   // $('#processbar').show();
  //   await this.wait(500);

  //   // let oldstockcount:number = this.stockList.length;        KN
  //   // console.log('old : '+ oldstockcount);
  //   // e.target.complete();

  //   // if (this.searchtab || this.save_flag) {
  //   //   await this.searchWithCriteria(false);
  //   // } else {
  //   //   await this.getStockList();
  //   // }

  //   if (this.start_flag == true) {
  //     await this.getStockList(1,this.config.itemsPerPage);
  //   } else {
  //     await this.searchWithCriteria(false);
  //   }

  //   this.progressbar = false;
  //   $('#moretag').show();

  // }
  wait(time) {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }
  toggleInfiniteScroll() {
  }
  searchWithCriteria(booflag) {
    let send_criteria = this.getCriteriaData();

    let send_date = this.criteria.date;
    if (this.criteria.date.toString() != "") {
      this.criteria.date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.date);
    }

    if (booflag) {
      this.stockList.splice(0, this.stockList.length);
      $('#moretag').text('More');

      this.value = "";
      for (var i = 0; i < this.searchCriteria.categoryName.length; i++) {
        this.value += this.searchCriteria.categoryName[i] + ",";
      }
      this.value = this.value.slice(0, -1);
      this.criteria.categoryName = this.value;

      send_criteria = this.criteria;
      this.criteria1 = this.getCriteriaData();
    } else {
      send_criteria = this.criteria1;
    }

    send_criteria.current = "" + this.stockList.length;
    send_criteria.maxRow = "10";

    const url = this.manager.appConfig.apiurl + 'StockSetup/getStockListforExcel';

    this.http.post(url, send_criteria, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (booflag) {
          this.criteria1.stockCode = this.criteria.stockCode;
          this.criteria1.stockName = this.criteria.stockName;
          this.criteria1.date = this.criteria.date;
          this.criteria1.brandName = this.criteria.brandName;
          this.criteria1.vendorName = this.criteria.vendorName;
          this.criteria1.ownerName = this.criteria.ownerName;
          this.criteria1.categoryName = this.criteria.categoryName;
          this.criteria1.subCategoryName = this.criteria.subCategoryName;
          this.criteria1.spSKUCode = this.criteria.spSKUCode;
          this.criteria1.price = this.criteria.price;
          this.criteria1.ordering = this.criteria.ordering;
          this.criteria1.current = this.criteria.current;
          this.criteria1.maxRow = this.criteria.maxRow;
        }

        this.criteria.date = send_date;
        if (data.message == "SUCCESS") {
          let data1 = data.dataList;
          let oldstockcount: number = this.stockList.length;
          for (let i = 0; i < data1.length; i++) {
            let mod = {
              No: 0,
              Code: "",
              Name: "",
              PackType: "",
              PackSize: "",
              Syskey: "",
              CategoryName: "",
              SubCategoryName: "",
              BrandName: "",
              BrandOwnerName: "",
              spSKUCode: "",
              Price: 0,
              Status: ""
            };
            mod.Syskey = data1[i].stockSyskey;
            mod.No = i;
            mod.Code = data1[i].stockCode;
            mod.Name = data1[i].stockDesc;
            mod.PackType = data1[i].packTypeDesc;
            mod.PackSize = data1[i].packSizeDesc;
            mod.CategoryName = data1[i].categoryDesc;
            mod.SubCategoryName = data1[i].subCategoryDesc;
            mod.BrandName = data1[i].brandDesc;
            mod.BrandOwnerName = data1[i].brandOwnerDesc;
            mod.spSKUCode = data1[i].spSKUCode;
            mod.Price = data1[i].price;
            mod.Status = data1[i].n1;
            this.stockList.push(mod);

            this.config.currentPage = 1;
          };
          let newstockcount: number = this.stockList.length;
          if (!booflag) {
            if (oldstockcount == newstockcount) {
              $('#moretag').text('No more stock');
            }
          }
        }
      }
    );
  }

  print() {
    this.criteria.current = "";
    this.criteria.maxRow = "";
    const url = this.manager.appConfig.apiurl + 'StockSetup/getStockListforExcel';

    let send_data = this.criteria.date;
    if (this.criteria.date.toString() != "") {
      this.criteria.date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.date);
    }

    this.value = "";
    for (var i = 0; i < this.searchCriteria.categoryName.length; i++) {
      this.value += this.searchCriteria.categoryName[i] + ",";
    }
    this.value = this.value.slice(0, -1);
    this.criteria.categoryName = this.value;

    this.http.post(url, this.criteria, this.manager.getOptions()).subscribe(
      (data: any) => {
        let cri_str_date = this.criteria.date;
        this.criteria.date = send_data;
        if (data.message == "SUCCESS") {
          //   let exampleDataList: any = [];

          //   for(var data_i = 0; data_i < data.dataList.length; data_i++){
          //     let exampleData = {
          //       "SPSKUCode": "",
          //       "StockCode": "",
          //       "StockName": "",
          //       "Unit": "",
          //       "Price": "",
          //       "PackType": "",
          //       "PackSize": "",
          //       "Category": "",
          //       "SubCategory": "",
          //       "Brand": "",
          //       "BrandOwner": ""
          //     };

          //     exampleData.SPSKUCode = data.dataList[data_i].spSKUCode;
          //     exampleData.StockCode = data.dataList[data_i].stockCode;
          //     exampleData.StockName = data.dataList[data_i].stockDesc;
          //     exampleData.Unit = data.dataList[data_i].uomDesc;
          //     exampleData.Price = data.dataList[data_i].price;
          //     exampleData.PackType = data.dataList[data_i].packTypeDesc;
          //     exampleData.PackSize = data.dataList[data_i].packSizeDesc;
          //     exampleData.Category = data.dataList[data_i].categoryDesc;
          //     exampleData.SubCategory = data.dataList[data_i].subCategoryDesc;
          //     exampleData.Brand = data.dataList[data_i].brandDesc;
          //     exampleData.BrandOwner = data.dataList[data_i].brandOwnerDesc;

          //     exampleDataList.push(exampleData);
          //   }

          //   const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exampleDataList);
          //   const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
          //   const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          //   this.saveAsExcelFile(excelBuffer, "STK");

          let cri_flag = 0;
          let excelDataList: any = [];
          let excelTitle = "Stock List";
          let excelHeaderData: any;
          if(this.isUseSAP)// if Use SAP Integration
          {
            excelHeaderData = [
              "BrandSKUCode", "StockCode", "StockName", "Brand Stock Name",  "Unit", "Price",
              "PackType", "PackSize", "Category", "SubCategory", "Brand", "BrandOwner", "Created Date", "Status",
              "SAP Stock", "Stock Info Status", "Material Type", "Item Category"
            ];
          }else{
            excelHeaderData = [
              "BrandSKUCode", "StockCode", "StockName", "Unit", "Price",
              "PackType", "PackSize", "Category", "SubCategory", "Brand", "BrandOwner", "Created Date", "Status"
            ];
          }


          for (var data_i = 0; data_i < data.dataList.length; data_i++) {
            let excelData = [];

            excelData.push(data.dataList[data_i].spSKUCode);
            excelData.push(data.dataList[data_i].stockCode);
            excelData.push(data.dataList[data_i].stockDesc);
            if(this.isUseSAP){
              excelData.push(data.dataList[data_i].t14);
            }
            excelData.push(data.dataList[data_i].uomDesc);
            excelData.push(data.dataList[data_i].price);
            excelData.push(data.dataList[data_i].packTypeDesc);
            excelData.push(data.dataList[data_i].packSizeDesc);
            excelData.push(data.dataList[data_i].categoryDesc);
            excelData.push(data.dataList[data_i].subCategoryDesc);
            excelData.push(data.dataList[data_i].brandDesc);
            excelData.push(data.dataList[data_i].brandOwnerDesc);
            excelData.push(this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data.dataList[data_i].createddate));
            if(data.dataList[data_i].n1 == 0){
              excelData.push("Active");
            }else{
              excelData.push("Inactive");
            }
            if(this.isUseSAP)// if Use SAP Integration
            {
              excelData.push(data.dataList[data_i].n40 == 1 ? "YES" : "NO");
              excelData.push(data.dataList[data_i].n41 == 1 ? "Partial" : "Complete");
              excelData.push(data.dataList[data_i].t12);
              excelData.push(data.dataList[data_i].t13);
            }
            excelDataList.push(excelData);
          }

          let workbook = new Workbook();
          let worksheet = workbook.addWorksheet('Stock List Data');

          let titleRow = worksheet.addRow(["", "", excelTitle]);
          titleRow.font = { bold: true };
          worksheet.addRow([]);

          let criteriaRow;
          if (this.criteria.ordering.toString() != "") {
            let cri_order = "";
            if (this.criteria.ordering.toString() == "asc") {
              cri_order = "Ascending";
            } else if (this.criteria.ordering.toString() == "desc") {
              cri_order = "Descending";
            }
            criteriaRow = worksheet.addRow(["Sorting : " + cri_order]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          if (cri_str_date != "") {
            criteriaRow = worksheet.addRow(["Date : " + cri_str_date]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }

          if (this.criteria.spSKUCode.toString() != "") {
            criteriaRow = worksheet.addRow(["Brand SKU Code : " + this.criteria.spSKUCode.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          if (this.criteria.skuCode.toString() != "") {
            criteriaRow = worksheet.addRow(["Stock Code : " + this.criteria.skuCode.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          if (this.criteria.skuName.toString() != "") {
            criteriaRow = worksheet.addRow(["Stock Name : " + this.criteria.skuName.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          /*   if (this.criteria.stockCode.toString() != "") {
               criteriaRow = worksheet.addRow(["Stock Code : " + data.dataList[0].stockCode.toString()]);
               criteriaRow.font = { bold: true };
               cri_flag++;
             }
             if (this.criteria.skuName.toString() != "") {
               criteriaRow = worksheet.addRow(["Stock Name : " + data.dataList[0].stockDesc.toString()]);
               criteriaRow.font = { bold: true };
               cri_flag++;
             }*/
          if (this.criteria.categoryName.toString() != "") {
            criteriaRow = worksheet.addRow(["Category : " + data.dataList[0].categoryDesc.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          if (this.criteria.subCategoryName.toString() != "") {
            criteriaRow = worksheet.addRow(["SubCategory : " + data.dataList[0].subCategoryDesc.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          if (this.criteria.brandName.toString() != "") {
            criteriaRow = worksheet.addRow(["Brand Name : " + data.dataList[0].brandDesc.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          if (this.criteria.ownerName.toString() != "") {
            criteriaRow = worksheet.addRow(["Brand Owner : " + data.dataList[0].brandOwnerDesc.toString()]);
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
            FileSaver.saveAs(blob, "STK_export_" + new Date().getTime() + EXCEL_EXTENSION);
          });
        }
      }
    );
  }

  // private saveAsExcelFile(buffer: any, fileName: string): void {
  //   const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
  //   FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  // }

  getCriteriaData() {
    return {
      "skuCode": "",
      "skuName": "",
      "date": "",
      "brandName": "",
      "vendorName": "",
      "ownerName": "",
      "categoryName": "",
      "subCategoryName": "",
      "spSKUCode": "",
      "price": 0,
      "ordering": "desc",
      "current": "",
      "status": "",
      "maxRow": "",
      "stkinfoStat": "",
      "isSAPStk": ""
    };
  }

  advanceSearchReset() {
    this.criteria = this.getCriteriaData();
    this.getStockList(0,this.config.itemsPerPage);
  }

  dblClickFunc() {
    this.criteria.date = "";
  }

  focusFunction() {
    $('#spSKUCode1').css('border-color', '');
  }

  changeOrdering() {
    // still not necessary but just in case
  }

  allList() {
    var url = "";
    var param = {};

    param = {
      "code": "",
      "description": "",
      "bosyskey": ""
    }
    url = this.manager.appConfig.apiurl + 'brand/searchBrandList';
    $("#cri-brand").prop('disabled', true);
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.brandList1 = data.brandlistdata;
        this.brandList1.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
        $("#cri-brand").prop('disabled', false);
      },
      error=>{
        $("#cri-brand").prop('disabled', false);
      }
    );

    param = {
      "code": "",
      "description": ""
    };
    url = this.manager.appConfig.apiurl + 'brandowner/getbrandowner';
    $("#cri-owner").prop('disabled', true);
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.ownerList1 = data.dataList;
        this.ownerList1.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
        $("#cri-owner").prop('disabled', false);
      },
      error=>{
        $("#cri-owner").prop('disabled', false);
      }
    );

    param = {
      "code": "",
      "description": ""
    };
    url = this.manager.appConfig.apiurl + 'stockcategory/searchStockCategoryList';
    $("#cri-cat").prop('disabled', true);
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.categoryList1 = data.catlist;
        this.categoryList1.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
        $("#cri-cat").prop('disabled', false);
      },
      error=>{
        $("#cri-cat").prop('disabled', false);
      }
    );

    param = {
      "code": "",
      "description": "",
      "categorySyskey": ""
    };
    url = this.manager.appConfig.apiurl + 'subcategory/searchSubCategoryList';
    $("#cri-subCat").prop('disabled', true);
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.subCategoryList1 = data;
        this.subCategoryList1.sort((a, b) => (a.t2.toLowerCase() > b.t2.toLowerCase()) ? 1 : -1);
        $("#cri-subCat").prop('disabled', false);
      },
      error=>{
        $("#cri-subCat").prop('disabled', false);
      }
    );

  
    this.stockCodeSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.stockCodeSearchAutoFill(term).subscribe(
            data => {
              this.stockList2 = data as any[];

              //  this.stockList2 = data as any[];
            });
        }
      }
    );

    this.stockNameSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.stockNameSearchAutoFill(term).subscribe(
            data => {
              this.stockList1 = data as any[];

              //  this.stockList2 = data as any[];
            });
        }
      }
    );
  }

  pageChanged(e) {
    this.config.currentPage = e;
    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.runSpinner(true);
    this.getStockList(currentIndex,this.config.itemsPerPage).then( ()=>{
      this.runSpinner(false);
    }).catch( ()=>{
      this.runSpinner(false);
    })
  }

  stockStatusChange(stock) {
    const param = {
      "Status":stock.Status? "1":"0",
      "Syskey":stock.Syskey
    }
 
    this.stockStatusChangeService(param).then(
      ()=>{
        this.manager.showToast(this.tostCtrl, "Message", "Status changed! :)", 1000);
      }
    ).catch( ()=>{
      this.manager.showToast(this.tostCtrl, "Message", "Try again! :(", 1000);
      stock.Status = stock.Status? false:true;
    })
   
  }
  stockStatusChangeService(param){
    return new Promise<void>( (promise,reject)=>{
      const url = this.manager.appConfig.apiurl + 'StockSetup/stockStatusChange';
      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          if (data.message == "SUCCESS") {
            promise();
          } else {
            reject();
          }
        },
        error=>{
          reject();
        }
      );
    })
  }
  getSAPSKUModel() {
    return {
      syskey: "",
      ABcode: "",
      ABdesc: "",
      SAPcode: "",
      SAPdesc: "",
      matlType: "",
      itemCat: ""
    }
  }
  getSAPSKU()
  {

    const param = {
      "SAPdesc":$("#sapsku").val().toString(),
      "syskey":this.model.n13
    }
    $('#spinner-shop').show();
    const url = this.manager.appConfig.apiurl + 'StockSetup/getSAPSKU';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.message == "SUCCESS") {
          this.SAPSKUList = data.dataList;
          if(this.SAPSKUList.length == 0){          
            this.SAPSKUList = [{ "SAPdesc": "No Record Found" } as any];
          }
          if(param.syskey != '' && param.syskey != '0')
          {
            $("#sapsku").value = this.SAPSKUList[0].SAPdesc;
            this.sapskuModel = this.SAPSKUList[0];
            // this.model.t12 = this.sapskuModel.matlType;
            // this.model.t13 = this.sapskuModel.itemCat;
            this.model.t19 = this.sapskuModel.SAPcode;
            this.model.t20 = this.sapskuModel.SAPdesc;
          }
          $('#spinner-shop').hide();
        } else {
          
        }
      },
      error=>{
        $('#spinner-shop').hide();
      }
    );
  }
  getSapSkuAutoComplete(option) {
    return option == null ? '' : option.SAPdesc;
  }
  onSkuSelectionChange()
  {
    this.model.n13 = this.sapskuModel.syskey;
    this.model.t19 = this.sapskuModel.SAPcode;
    this.model.t20 = this.sapskuModel.SAPdesc;
    // this.model.t12 = this.sapskuModel.matlType;
    this.model.t13 = "TANN";
    // this.model.t21 = this.sapskuModel.itemCat;
    this.model.t21 = "POSM";
  }
  getUOMConversion(update, bindRatio?) {
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'StockSetup/getUOMConversion';
      this.http.get(url, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.UOMRatioList = data.dataList;
          if(!update){
            this.obj.ratio = this.UOMRatioList[0].ratio;
          }else{
            this.obj.ratio = this.UOMRatioList.filter(u=> u.ratio == bindRatio)[0].ratio;   
            // this.obj.ratio = bindRatio;
          }
        },
        error => {
          done();
        }
      )
    })
  }
  selectUOMChange(){
    this.baseStockUom.forEach(element => {
      if (element.n4 == 2) {
        element.n3 = this.obj.ratio;//ratio
      }
    });
  }

}
