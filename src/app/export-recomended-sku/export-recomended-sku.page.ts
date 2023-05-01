
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { Events } from '@ionic/angular';
import { MatDatepicker } from '@angular/material/datepicker';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, PLATFORM_INITIALIZER } from '@angular/core';
import { IonContent, AlertController, NavController, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { AppComponent } from '../app.component';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import { FormControl } from '@angular/forms';
import moment from 'moment';


const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

//const EXCEL_TYPE = 'text/csv;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
var date = new Date();

 //var firstDay=new Date(date.getFullYear(),date.getMonth(),1);
//var lastDay=new Date(date.getFullYear(),date.getMonth()+1,0);
//var firstDay = moment().startOf('week').toDate();
//var lastDay = moment().endOf('week').toDate()
//var lastDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
//var firstDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 6);

declare var $: any;


@Component({
  selector: 'app-export-recomended-sku',
  templateUrl: './export-recomended-sku.page.html',
  styleUrls: ['./export-recomended-sku.page.scss'],
})

export class ExportRecomendedSKUPage implements OnInit {

  stockNameSearch: FormControl = new FormControl();
  shopNameSearch: FormControl = new FormControl();
  @ViewChild('picker', { static: false }) matDatepicker: MatDatepicker<Date>;

  config = {
    id: "some_id",
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  config1 = {
    id: "some_id1",
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  currentPage: number = 1;
  each_sheet_data: any = this.forjsondata1();
  all_sheet_data: any = this.forjsondata2();
  obj: any = this.getObj();
  impcriteria: any = this.getObj();
  import_criteria: any = this.getObj();
  shopList: any = [];
  shopPersonList: any = [];
  load: boolean = false;
  flag: boolean = false;
  flag1: boolean = false;
  importload: any;
  fdate: any;
  ldate: any;
  minDate: any;
  maxDate: any = new Date();
  spinner: boolean = false;
  searchtab: boolean = false;
  criteria: any = this.getCriteriaData();
  searchcriteria: any = this.getCriteriaData();
  searchobj: any = this.getCriteriaData();
  total: any;
  pagination_flag: any = 0;
  btn: boolean = false;
  uploadedFileName: string = "";
  uploadFile: File;
  selectedFile: File;
  _recommendedlist: any;
  _stockList: any;
  _shopList: any;
  skureList: any = this.recommendlist();
  curdate: Date = new Date();
  searchCriteria: any;

  constructor(
    public manager: ControllerService,
    public http: HttpClient,
    public router: Router,
    public alertController: AlertController,
    public event: Events,
    public app: AppComponent,
    public tostCtrl: ToastController,
    public activatedRoute: ActivatedRoute,
    public loading: LoadingController

  ) {
    this.manager.isLoginUser();
  }

  ngOnInit() {
    this.manager.isLoginUser();
    this.btn = true;
  }

   ionViewWillEnter() {
    this.manager.isLoginUser();
    this.btn = true;
    this.importload = "";
  
    this.flag = false;
    this.flag1 = false;
    $('#exportnew').hide();
    $('#exportlist-tab').tab('show');
    $('#exportlist').show();
    this.searchtab = false;
    this.impcriteria = this.getObj();
    this.import_criteria = this.getObj();
    $('#customFile').val('');
    this.search1(0,false);
 
    // this.getrecommendedsku();
    this.allList();
   
   
  }

  listTab() {
    // this.getall();
    this.ionViewWillEnter();
    
    
  }

  newTabClick(e) {
    this.spinner = true;
    $('#exportlist').hide();
    $('#exportnew-tab').tab('show');
    $('#exportnew').show();
    $('#customFile').val('');
    this.criteria.dateOptions = "this_week";
    this.dateOptionsChange();
    this.search(0, false);
    
   
  }

  tab(e) {
  }
  ionViewDidEnter() {
    // $('#exportnew').hide();

    $('#exportnew').hide();
    $('#exportlist-tab').tab('show');
    $('#exportlist').show();

    this.load = true;
    this.btn = false;
  }

  runSpinner(t: boolean) {
    this.spinner = t;
  }

  advanceSearch(option) {
    this.searchtab = option;
  }
  advanceSearchReset() {
    this.criteria = this.getCriteriaData();
    this.search(0, false);

  }
  Reset() {
    $('#customFile').val('');
    this.flag1 = false;
    this.impcriteria = this.getObj();
    this.import_criteria = this.getObj();
    this.search1(0,false);

  }
  pageChanged(e) {
    this.config.currentPage = e;
    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.search(currentIndex, false);

  }

  pageChanged1(e) {
    this.config1.currentPage = e;
    let currentIndex = (this.config1.currentPage - 1) * this.config1.itemsPerPage;
    this.search1(currentIndex, false);


  }

  //   getall() {
  //     this.loading.create({
  //       message: "Processing..",

  //       backdropDismiss: false
  //     }).then(
  //       el => {
  //         el.present();
  //         this.searchobj.current=0;
  //         this.searchobj.maxRows=20;
  //         const url = this.manager.appConfig.apiurl + 'reports/export_Recomended_SKU';

  //         this.searchobj.fromDate=firstDay;
  //         this.searchobj.toDate=lastDay;
  //         console.log(this.searchobj.fromDate);
  //         console.log(this.searchobj.toDate);

  //         this.searchobj.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchobj.fromDate);
  //         this.searchobj.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.searchobj.toDate);
  //        // this.searchobj.fromDate = "20200919";
  //        // this.searchobj.toDate = "20200919";
  //         this.searchcriteria.fromDate = this.searchobj.fromDate;
  //         this.searchcriteria.toDate = this.searchobj.toDate;
  //         this.http.post(url, this.searchcriteria, this.manager.getOptions()).subscribe(
  //         (data: any) => { 
  //           el.dismiss();
  //           if(data.message == "SUCCESS"){
  //             this.config.currentPage = 1;
  //             //this.config.totalItems = data.recomendedSkuList.length;

  //             this.shopList = [];
  //             this.shopList = data.recomendedSkuList;
  //             this.config.totalItems = data.rowCount;
  //             for (var i = 0; i < this.shopList.length; i++) {
  //               this.shopList[i].trans_datetime = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.shopList[i].trans_datetime);
  //             }
  //               this.searchobj.fromDate = "";    
  //           }
  //         }
  //       ); 
  //   })
  // }


  search(currIndex, criFlag) {

    // this.criteria.maxRows = this.config.itemsPerPage;
    // if (currIndex == undefined) {
    //   this.criteria.current = 0;
    // }
    // else {
    //   this.criteria.current = currIndex;
    // }

    const url = this.manager.appConfig.apiurl + 'reports/export_Recomended_SKU';
    // let send_data1 = this.criteria.fromDate;
    // let send_data2 = this.criteria.toDate;
    // if (this.criteria.fromDate.toString() != "") {
    //   this.criteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
    // }
    // else {

    //   this.criteria.fromDate = firstDay;
    //   this.criteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
    // }
    // if (this.criteria.toDate.toString() != "") {
    //   this.criteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
    // }
    // else {
    //   this.criteria.toDate = lastDay;
    //   this.criteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
    // }

    // if (this.criteria.fromDate.toString() == "false") {
    //   this.alert("message", "Add Correct Date Format");
    //   this.criteria.fromDate = "";
    // }
    // if (this.criteria.toDate.toString() == "false") {
    //   this.alert("message", "Add Correct Date Format");
    //   this.criteria.toDate = "";
    // }
    // if (criFlag == true) {
    //   this.searchcriteria.fromDate = this.criteria.fromDate;
    //   this.searchcriteria.toDate = this.criteria.toDate;
    //   this.searchcriteria.maxRows = this.criteria.maxRows;
    //   this.searchcriteria.current = this.criteria.current
    // }

    let cri = {
      "fromDate": this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate),
      "toDate": this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate),
      "maxRows": 20,
      "current": currIndex,
    }
    this.spinner = true;
    this.http.post(url, cri, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.spinner = false;
        //this.config.totalItems = data.rowCount;
        if (data.message == "SUCCESS") {
          this.config.totalItems = data.rowCount;
          if (currIndex == 0) {
            this.config.currentPage = 1;
          }

          // this.criteria.fromDate = send_data1;
          // this.criteria.toDate = send_data2;
          this.shopList = [];
          this.shopList = data.recomendedSkuList;
          for (var i = 0; i < this.shopList.length; i++) {
            this.shopList[i].trans_datetime = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.shopList[i].trans_datetime);
          }
        }
      },
      error => {
        this.spinner = false;
      }
    );

  }

  print() {
    this.loading.create({
      message: "Processing..",
      backdropDismiss: false
    }).then(
      el => {
        el.present();
        const url = this.manager.appConfig.apiurl + 'reports/export_Recomended_SKU';
        if (this.criteria.fromDate.toString() != "") {
          this.criteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
          console.log(this.criteria.fromDate + "dateeeee");
        }
        if (this.criteria.toDate.toString() != "") {
          this.criteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
          console.log(this.criteria.toDate + "dateeeee");
        }

        this.http.post(url, this.criteria, this.manager.getOptions()).subscribe(
          (data: any) => {
            let cri_date1 = "";
            let cri_date2 = "";
            if (this.criteria.fromDate.toString() != "") {
              cri_date1 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.criteria.fromDate).toString();
            }
            if (this.criteria.toDate.toString() != "") {
              cri_date2 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.criteria.toDate).toString();
            }

            if (data.message == "SUCCESS") {
              this.loading.dismiss();
              let data1 = data.recomendedSkuList;
              let cri_flag = 0;
              let excel_date = "";

              let excelTitle = "Export Recommended SKU";
              let excelHeaderData = [
                " vendor_id ", " vendor_name ", " brand_owner_code ", " brand_owner_name ", "sp_shop_id", " shop_id ", " shop_name ", " shop_geoloc ", " shop_pluscode ", " shop_sr ", " shop_district ",
                " shop_town ", " shop_ward ", " shop_village ", " shop_village_tract ", "sp_sku_id", " sku_id ", " sku_desc ", " sku_uom ", "sku_listprice",
                " sku_discount ", " sku_price ", " sku_qty ", " sales_id  ", " sales_name  ", " trans_datetime "

              ];
              let excelDataList: any = [];

              let workbook = new Workbook();
              let worksheet = workbook.addWorksheet('Export Recomended SKU Data');
              for (var exCount = 0; exCount < data1.length; exCount++) {
                let excelData: any = [];
                excel_date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].trans_datetime).toString();

                excelData.push(data1[exCount].vendor_id);
                excelData.push(data1[exCount].vendor_name);
                excelData.push(data1[exCount].brandownercode);
                excelData.push(data1[exCount].brandownername);
                excelData.push(data1[exCount].sp_shop_id);
                excelData.push(data1[exCount].shop_id);
                excelData.push(data1[exCount].shop_name);
                excelData.push(data1[exCount].shop_geoloc);
                excelData.push(data1[exCount].shop_pluscode);
                excelData.push(data1[exCount].shop_sr);
                excelData.push(data1[exCount].shop_district);
                excelData.push(data1[exCount].shop_town);
                excelData.push(data1[exCount].shop_ward);
                excelData.push(data1[exCount].village);
                excelData.push(data1[exCount].village_tract);
                excelData.push(data1[exCount].sp_skucode);
                excelData.push(data1[exCount].sku_id);
                excelData.push(data1[exCount].sku_desc);
                excelData.push(data1[exCount].sku_uom);
                excelData.push(data1[exCount].sku_price);
                excelData.push(data1[exCount].sku_discount);
                excelData.push(data1[exCount].sku_price);
                excelData.push(data1[exCount].sku_qty);
                excelData.push(data1[exCount].sales_id);
                excelData.push(data1[exCount].sales_name);
                excelData.push(excel_date);


                excelDataList.push(excelData);
              }

              let titleRow = worksheet.addRow(["", "", excelTitle]);
              titleRow.font = { bold: true };
              worksheet.addRow([]);

              let criteriaRow;
              if (cri_date1.toString() != "") {
                criteriaRow = worksheet.addRow(["From Date : " + cri_date1.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (cri_date2.toString() != "") {
                criteriaRow = worksheet.addRow(["To Date : " + cri_date2.toString()]);
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
                FileSaver.saveAs(blob, "recomendedSKU_export_" + new Date().getTime() + EXCEL_EXTENSION);
              });
            }
          }
        );

      })
  }

  dblClickFunc() {
    this.criteria.createdDate = "";
  }

  getCriteriaData() {
    return {
      "fromDate": "",
      "toDate": "",
      "current": "",
      "maxRows": "",
      "dateOptions":"0"
    };
  }

  resetValue() {

  }
  onUpload(event) {
    this.flag1 = true;

    this.each_sheet_data = this.forjsondata1();
    this.all_sheet_data = this.forjsondata2();

    let excelFileName = event.target.files[0].name;
    let pos = excelFileName.indexOf(".");
    this.uploadedFileName = excelFileName.substring(0, pos);
    this.uploadFile = event.target.files[0];

    let reader = new FileReader();
    reader.readAsArrayBuffer(this.uploadFile);
    reader.onload = (event: any) => {
      let data = new Uint8Array(event.target.result);
      let workbook = XLSX.read(data, { type: "array" });

      for (let k = 0; k < workbook.SheetNames.length; k++) {
        let first_sheet_name = workbook.SheetNames[k];
        let worksheet = workbook.Sheets[first_sheet_name];
        this.each_sheet_data = XLSX.utils.sheet_to_json(worksheet, {
          raw: true
        });

        for (let i = 0; i < this.each_sheet_data.length; i++) {
          // this.each_sheet_data[i].shop_id="+this.each_sheet_data[i].shop_id;
          this.each_sheet_data[i].shop_id = ('' + this.each_sheet_data[i].shop_id).replace(/\s/g, '');

          this.all_sheet_data.uploadData.push(this.each_sheet_data[i]);
          console.log(this.each_sheet_data[i]);
        }
      }

      this.all_sheet_data.uploadData.splice(0, 1);
    };

  }
  forjsondata1() {
    return {
      "shop_id": "",
      "shop_name": "",
      "sku_id": "",
      "sku_desc": "",
      "sku_qty": ""
    };
  }

  forjsondata2() {
    return {
      uploadData: [
        {
          "shop_id": "",
          "shop_name": "",
          "sku_id": "",
          "sku_desc": "",
          "sku_qty": ""

        }
      ]
    };
  }
  process() {
    if (this.manager.user.orgId.length == 0) return;
    this.loading.create(
      {
        message: "processing",
        backdropDismiss: false
      }
    ).then(
      el => {
        el.present();
        let url: string = this.manager.appConfig.apiurl + 'reports/importrecommendedsku';
        this.http.post(url, this.all_sheet_data, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            this._recommendedlist = data.skuList
            let temp="";  
            if(data.noskucode.length==0 && data.noshopcode.length==0){
              this.alert("message","Successful!");
            }else{

             if(data.noskucode.length>0){
              for (let i = 0; i < data.noskucode.length; i++) {
                temp += "skuid " + data.noskucode + " not exist in auderbox!"+"\n";
              }

            }
            if(data.noshopcode.length>0){
            //  for (let i = 0; i < data.noshopcode.length; i++) {
                temp += "shopid " + data.noshopcode + " not exist in auderbox!"+"\n";
              //}

            }
            this.alert("message",temp);
          }
            for (var i = 0; i < this._recommendedlist.length; i++) {
              this._recommendedlist[i].date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this._recommendedlist[i].date);
            }
          },
          (error: any) => {
            this.alert("message", "fail!");
          }
        )
      }
    )
  }

  recommendlist() {
    return {
      skurecommendedlist: []
    };
  }

  // QTYChange(item){
  //   console.log("Event............");
  //  this.skureList.skurecommendedlist= item;
  //  console.log(this.skureList.skurecommendedlist);
  //  let sku={"syskey":"","shopid":"","skuid":"","skuqty":""};
  //   if(this.skureList.length>0){
  //     let b=false;
  //     for( var j=0;j<this.skureList.length;j++)
  //     {
  //        if(this.skureList.skurecommendedlist[j].syskey=item.syskey){
  //         this.skureList[j].skuqty=item.stockqty;
  //         this.skureList.push(this.skureList[j]);
  //         b=true;
  //         break;
  //        } 

  //     }
  //     if(b ==false){

  //         sku.syskey=item.syskey;
  //         sku.shopid=item.shopcode;
  //         sku.skuid=item.stockcode;
  //         sku.skuqty=item.stockqty;

  //         this.skureList.push(sku);

  //     }
  //   }
  //   else{
  //     sku.syskey=item.syskey;
  //      sku.shopid=item.shopcode;
  //     sku.skuid=item.stockcode;
  //     sku.skuqty=item.stockqty;
  //     this.skureList.push(sku);
  //     console.log(sku.syskey+"%%"+sku.skuqty);
  //   }

  // }

  QTYChange(item) {
    this.skureList.skurecommendedlist.push(item);
    this.flag = true;
    console.log(item.stockqty + "=QTY" + item.shopcode + " =COde");
    $('#dnewt-tab1').tab('show');
  }


  // getrecommendedsku(){
  //   let url: string = this.manager.appConfig.apiurl + 'reports/getrecommendedsku';
  //   this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
  //     (data: any) => {

  //       console.log(data);
  //       if (data.skuList!= null && data.skuList != undefined && data.skuList.length > 0) {
  //         this._recommendedlist = data.skuList;

  //       } else {
  //         this.manager.showToast(this.tostCtrl,"Message","No User!",1000)
  //         this._recommendedlist = [];
  //       }
  //     },
  //     error => {
  //     }
  //   );
  // }
  /*getrecommendedsku() {
    this.loading.create({
      message: "Processing..",
      backdropDismiss: false
    }).then(
      el => {
        el.present();
        this.obj.current = 0;
        this.obj.maxRows = 20;
        const url = this.manager.appConfig.apiurl + 'reports/getrecommendedsku';

       // this.obj.fromDate = firstDay;
       // this.obj.toDate = lastDay;
        console.log(this.obj.fromDate);
        console.log(this.obj.toDate);

        this.obj.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.obj.fromDate);
        this.obj.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.obj.toDate);
        this.impcriteria.fromDate = this.obj.fromDate;
        this.impcriteria.toDate = this.obj.toDate;

        this.http.post(url, this.impcriteria, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            console.log(data);
            this.config1.currentPage = 1;
            this.config1.totalItems = data.rowCount;
            if (data.skuList != null && data.skuList != undefined && data.skuList.length > 0) {
              this._recommendedlist = data.skuList;


            } else {
              this.manager.showToast(this.tostCtrl, "Message", "No Data!", 1000)
              this._recommendedlist = [];
            }
            for (var i = 0; i < this._recommendedlist.length; i++) {
              this._recommendedlist[i].date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this._recommendedlist[i].date);
            }
          }
        );

      })
  }*/

  save() {
    this.flag = false;
    if (this.manager.user.orgId.length == 0) return;
    this.loading.create(
      {
        message: "processing",

      }
    ).then(
      el => {
        el.present();
        let url: string = this.manager.appConfig.apiurl + 'reports/updaterecommendedsku';
        this.http.post(url, this.skureList, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            if (data.message == "SUCCESS") {
              this.manager.showToast(this.tostCtrl, "Message", "Success", 1000);


            }
          },
          (error: any) => {

            this.manager.showToast(this.tostCtrl, "Message", "Fail", 1000);
          }
        )
        el.onDidDismiss().then(
          el => {

          }
        )
        this.skureList = this.recommendlist();
      }
    )
  }
  sampleExcelDownload() {
    let exampleData: any = [];
    exampleData = this.sampleExcelData();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exampleData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, "Sample_Recomended_SKU_export");
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_1600160416819_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  sampleExcelData() {
    return [
      {
        "shop_id": "'463905717706",
        "shop_name": "Queen Mart",
        "sku_id": "C120011SMP2G",
        "sku_name": "SP_Blueberry Cream Roll",
        "sku_qty": "500",
      }
    ];
  }

  getObj() {
    return {
      "shopcode": "",
      "shopname": "",
      "stockcode": "",
      "stockname": "",
      "stockqty": "",
      "date": "",
      "fromDate": "",
      "toDate": "",
      "maxRows": "",
      "current": ""
    };
  }
  allList() {

    this.stockNameSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.stockNameSearchAutoFill(term).subscribe(
            data => {
              this._stockList = data as any[];


            });
        }
      }
    );
    this.shopNameSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.shopNameSearchAutoFill(term).subscribe(
            data => {
              this._shopList = data as any[];
            });
        }
      }
    );

  }
  dateOptionsChange() {
    let dateOption = this.manager.getDateOptions(this.criteria.dateOptions);
    this.criteria.fromDate = dateOption.fromDate;
    this.criteria.toDate = dateOption.toDate;
  }

  search1(curindex1, criFlag1) {
    this.loading.create({
      message: "Processing..",
      backdropDismiss: false
    }).then(
      el => {
        el.present();
        this.impcriteria.maxRows = this.config.itemsPerPage;
        this.impcriteria.current = curindex1;
        let send_data1 = this.import_criteria.fromDate;
        let send_data2 = this.import_criteria.toDate;

        if (this.import_criteria.fromDate.toString() == "false") {
          this.alert("message", "Add Correct Date Format");
          this.import_criteria.fromDate = "";
        }
        if (this.import_criteria.toDate.toString() == "false") {
          this.alert("message", "Add Correct Date Format");
          this.import_criteria.toDate = "";
        }
        if (criFlag1 == true) {
          if (this.import_criteria.fromDate.toString() != "") {
            this.import_criteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.import_criteria.fromDate);
          }

          if (this.import_criteria.toDate.toString() != "") {
            this.import_criteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.import_criteria.toDate);
          }

          this.impcriteria.shopname = this.import_criteria.shopname;
          this.impcriteria.stockname = this.import_criteria.stockname;
          this.impcriteria.fromDate = this.import_criteria.fromDate;
          this.impcriteria.toDate = this.import_criteria.toDate;
          this.impcriteria.maxRows = this.config.itemsPerPage;
          this.impcriteria.current = curindex1;

        }

        const url = this.manager.appConfig.apiurl + 'reports/getrecommendedsku';
        this.http.post(url, this.impcriteria, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            this.import_criteria.fromDate = send_data1;
            this.import_criteria.toDate = send_data2;
            this.config1.totalItems = data.rowCount;
            if (curindex1 == 0) {
              this.config1.currentPage = 1;
            }
            this._recommendedlist = data.skuList;
            for (var i = 0; i < this._recommendedlist.length; i++) {
              this._recommendedlist[i].date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this._recommendedlist[i].date);
            }
          }
        );
      })
  }

  printrecom() {
    this.loading.create({
      message: "Processing..",
      backdropDismiss: false
    }).then(
      el => {
        el.present();
        this.import_criteria.current="";
        let send_data1 = this.import_criteria.fromDate;
        let send_data2 = this.import_criteria.toDate;
        if (this.import_criteria.fromDate.toString() != "") {
          this.import_criteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.import_criteria.fromDate);
        }
        if (this.import_criteria.toDate.toString() != "") {
          this.import_criteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.import_criteria.toDate);
        }
        const url = this.manager.appConfig.apiurl + 'reports/getrecommendedsku';
        this.http.post(url, this.import_criteria, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            let date1 = "";
            let date2 = "";
            if (this.import_criteria.fromDate.toString() != "") {
              date1 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.import_criteria.fromDate).toString();
            }
            if (this.import_criteria.toDate.toString() != "") {
              date2 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.import_criteria.toDate).toString();
            }
            this.import_criteria.fromDate = send_data1;
            this.import_criteria.toDate = send_data2;

            if (data.message == "SUCCESS") {


              let data1 = data.skuList;
              let cri_flag = 0;
              let excel_date = "";

              let excelTitle = "Import Recommended SKU Data";
              let excelHeaderData = [
                "date", " shop_id", "shop_name", "sku_id", "sku_name", "sp_shop_id", "sp_sku_id", " sku_old_qty ", " sku_new_qty "
              ];
              let excelDataList: any = [];

              let workbook = new Workbook();
              let worksheet = workbook.addWorksheet('Export Recomended SKU Data');
              for (var exCount = 0; exCount < data1.length; exCount++) {
                let excelData: any = [];
                excel_date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].date).toString();
                excelData.push(excel_date);
                excelData.push(data1[exCount].shopcode);
                excelData.push(data1[exCount].shopname);
                excelData.push(data1[exCount].stockcode);
                excelData.push(data1[exCount].stockname);
                excelData.push(data1[exCount].spshopcode);
                excelData.push(data1[exCount].spstockcode);
                excelData.push(data1[exCount].oldqty);
                excelData.push(data1[exCount].newqty);
                excelDataList.push(excelData);
              }

              let titleRow = worksheet.addRow(["", "", excelTitle]);
              titleRow.font = { bold: true };
              worksheet.addRow([]);

              let criteriaRow;
              if (date1.toString() != "") {
                criteriaRow = worksheet.addRow(["From Date : " + date1.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (date2.toString() != "") {
                criteriaRow = worksheet.addRow(["To Date : " + date2.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.import_criteria.shopname.toString() != "") {
                criteriaRow = worksheet.addRow(["Shop Name : " + this.import_criteria.shopname.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.import_criteria.stockname.toString() != "") {
                criteriaRow = worksheet.addRow(["Stock Name : " + this.import_criteria.stockname.toString()]);
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
                FileSaver.saveAs(blob, "import_recomendedSKU_export_" + new Date().getTime() + EXCEL_EXTENSION);
              });
            }
          }
        );

      })
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
}



