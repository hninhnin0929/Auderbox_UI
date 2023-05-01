import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ControllerService } from '../controller.service';
import { AlertController, LoadingController, ToastController, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { AppComponent } from '../app.component';

declare var $ : any;
var date = new Date();
var todayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

@Component({
  selector: 'app-sap-ar',
  templateUrl: './sap-ar.page.html',
  styleUrls: ['./sap-ar.page.scss'],
})
export class SapArPage implements  OnInit,AfterViewInit {

  config = {
    itemsPerPage: 20,
    currentPage: 1,
    totalItems: 0,
    id: 'ardetail'
  };
  filterBoxFormGroup:FormGroup = new FormGroup({
    'start-date' : new FormControl(todayDate,Validators.required),
    'end-date' : new FormControl(todayDate,Validators.required),
    'log': new FormControl(false)
  });
  criteria: any = this.getCriteriaData();
  flag: any = this.getFlag(); 
  tableData = [{}]
  importload: any;
  each_sheet_data: any = this.forjsondata1();
  all_sheet_data: any = this.forjsondata2();
  uploadedFileName: string = "";
  uploadFile: File;
  selectedFile: File;
  _arlistdata: any = [];
  resultData: any = this.returnData();
  _resultList: any = [];
  arImportBtn_Access: boolean = false;

  constructor(
    private http: HttpClient,
    private manager: ControllerService,
    public alertController: AlertController,
    public loading: LoadingController,
    public tostCtrl: ToastController,
    public app: AppComponent,
    ) { }
    ngAfterViewInit(): void 
    {
      this.flag.isDownload = false;
      $('#progress-bar-ar').hide();
      $('#ar-detail-table').hide();
      $('#ar-result-table').hide();
      this.filterBoxFormGroup.get('log').valueChanges.subscribe(
        (e:boolean)=>{
          // let shop = document.getElementById('shop');        
          // if(e){
          //   shop.classList.add('d-none');
          // }else{
          //   shop.classList.remove('d-none');
          // }
        }
      );
      
    }
    
    ngOnInit()
    {
      this.criteria = this.getCriteriaData();
      this.flag = this.getFlag();
      this.criteria.fromDate = todayDate;
      this.criteria.toDate = todayDate;
      this.getBtnAccess();
    }
    ionViewWillEnter() 
    {
      this.importload = "";
    }

  download()
  {
    $('#ar-result-table').hide();
    this.flag.isDownload = false;
    $('#progress-bar-ar').show();
    
    let date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);

    const param = {
      "path":"D:\\Projects\\SAP\\ImportFiles\\",
      "fileName": "AR.xlsx"
    }
    const url = this.manager.appConfig.apiurl + 'sap/ARDownload';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.resultData = data;
        if (data.message == "SUCCESS") {
          $('#progress-bar-ar').hide();
          $('#ar-detail-table').hide();
          
          this.manager.showToast(this.tostCtrl, "Message", "Download Success!", 1000);
          this.flag.isDownload = true;

        } else if(data.message == "NOFILEPATH"){
          $('#progress-bar-ar').hide();
          this.manager.showToast(this.tostCtrl, "Message", "File Path is not Found to Download!", 1000);
        } else {
          $('#progress-bar-ar').hide();
          this.flag.isDownload = true;
          this.manager.showToast(this.tostCtrl, "Message", "Download Fail!", 1000);
        }
      },
      error=>{
        $('#progress-bar-ar').hide();
        this.flag.isDownload = true;
        this.manager.showToast(this.tostCtrl, "Message", "Download Fail!", 1000);
      }
    );

    // if(this.filterBoxFormGroup.get('log').value)
    // {
    //   $('#material-log-table').show();
    // }else
    // {
    //   $('#material-download-result').show();
    // }
  }
  showDetail()
  {
    $('#ar-detail-table').slideToggle();
  }

  getCriteriaData() 
  {
    return {
      "fromDate": "",
      "toDate": "",
    };
  }
  getFlag() 
  {
    return {
      "isDownload": false,
      "showDetail": false,
      "chkDate": false
    };
  }
  changeAllDate()
  {

  }
  forjsondata1() {
    return {
      "CUSTOMER_ID": "",
      "CUSTOMER_NAME": "",
      "INVOICE_NUMBER": "",
      "INVOICE_DATE": "",
      "DUE_DATE": "",
      "CURRENCY": "",
      "AMOUNT": ""
    };
  }

  forjsondata2() {
    return {
      uploadData: [
        {
          "CUSTOMER_ID": "",
          "CUSTOMER_NAME": "",
          "INVOICE_NUMBER": "",
          "INVOICE_DATE": "",
          "DUE_DATE": "",
          "CURRENCY": "",
          "AMOUNT": ""
        }
      ]
    };
  }
  resetValue() {

  }
  onUpload(event) {
    if(event.target.files.length)
    {
      this._arlistdata = [];
      this.config.totalItems = 0;
      this.config.currentPage = 1;
  
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
            // this.each_sheet_data[i].shop_id = ('' + this.each_sheet_data[i].shop_id).replace(/\s/g, '');
  
            this.all_sheet_data.uploadData.push(this.each_sheet_data[i]);
          }
        }
  
        this.all_sheet_data.uploadData.splice(0, 1);
      };
    }else{
      this.uploadedFileName = "";
    }
  }

  gotoPreview() {
    $('#ar-result-table').hide();
    this.flag.isDownload = false;
    this.getAR()
  }
  getAR()
  {
    return new Promise<void>(
      (res, rej) => {
        if(this.uploadedFileName != "" && this.uploadedFileName != null) {
          this._arlistdata.splice(0,this._arlistdata.length);
          
          for(let i=0; i < this.all_sheet_data.uploadData.length; i++) {
            this._arlistdata.push(this.all_sheet_data.uploadData[i]); //it will be okay in ui if material template column has no space
          }
          this.config.totalItems = this.all_sheet_data.uploadData.length;
          this.config.currentPage = 1;
          this.config.id = "ardetail";
          $('#ar-detail-table').show();
          res();
        } else {
          this.manager.showToast(this.tostCtrl, "Message", "No File Selected!", 1000);
          this._arlistdata = [];
          this.config.totalItems = 0;
          this.config.currentPage = 1;
          this.config.id = "ardetail";
          $('#progress-bar-ar').hide();
          rej();
        }
      }
    );
  }

  pageChanged(e){
    this.config.currentPage = e;
  }
  async gotoImport(){
    $('#ar-result-table').hide();
    this.flag.isDownload = false;
    $('#progress-bar-ar').show();
    this._arlistdata = [];
    await this.getAR();
    if(this._arlistdata.length)
    {
      // let date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);

      const param = {
        "type":"ar",
        "dataList": this._arlistdata
      }
      const url = this.manager.appConfig.apiurl + 'sap/SAPDownload';
      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.resultData = data;
          if (data.message == "SUCCESS") {
            $('#progress-bar-ar').hide();
            $('#ar-detail-table').hide();
            
            this.manager.showToast(this.tostCtrl, "Message", "Import Success!", 1000);
            this.flag.isDownload = true;
  
          } else if(data.message == "NOFILEPATH"){
            $('#progress-bar-ar').hide();
            this.manager.showToast(this.tostCtrl, "Message", "File Path is not Found to Import!", 1000);
          } else {
            $('#progress-bar-ar').hide();
            this.flag.isDownload = true;
            this.manager.showToast(this.tostCtrl, "Message", "Import Fail!", 1000);
          }
        },
        error=>{
          $('#progress-bar-ar').hide();
          this.flag.isDownload = true;
          this.manager.showToast(this.tostCtrl, "Message", "Import Fail!", 1000);
        }
      );
    }else{
      $('#progress-bar-ar').hide();
      $('#ar-detail-table').hide();
      this.flag.isDownload = false;
      this.manager.showToast(this.tostCtrl, "Message", "No Data to Import!", 1000, 'danger');
    }

  }
  returnData() {
    return {        
      "message": "",
      "successList": [
        {
          "customerId": "",
          "customerName": "",
          "invNumber": "",
          "invDate": "",
          "dueDate": "",
          "currency": ""
        }
      ]    ,
      "failList":  [
        {
          "customerId": "",
          "customerName": "",
          "invNumber": "",
          "invDate": "",
          "dueDate": "",
          "currency": ""
        }
      ]       
    };
  }
  showSuccessList()
  {
    $('#ar-detail-table').hide();
    this._resultList = this.resultData.successList;
    this.config.totalItems = this._resultList.length;
    this.config.currentPage = 1;
    this.config.id = "arresult";
    $('#ar-result-table').show();
    
  }
  showFailList()
  {
    $('#ar-detail-table').hide();
    this._resultList = this.resultData.failList;
    this.config.totalItems = this._resultList.length;
    this.config.currentPage = 1;
    this.config.id = "arresult";
    $('#ar-result-table').show();
  }
  getBtnAccess() {
    const pages = this.app.appPages;
    for (let i = 0; i < pages.length; i++) {
      for (let y = 0; y < pages[i].child.length; y++) {
        if (pages[i].child[y].btns) {
          for (let z = 0; z < pages[i].child[y].btns.length; z++) {
            if (pages[i].child[y].btns[z].code === 'allow_arimport' && pages[i].child[y].btns[z].status === true) {
              this.arImportBtn_Access = true;
            }
          }
        }
      }
    }
  }

}
