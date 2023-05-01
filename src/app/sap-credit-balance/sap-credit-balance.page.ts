import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ControllerService } from '../controller.service';
import { AlertController, LoadingController, ToastController, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { toJSDate } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-calendar';
import { AppComponent } from '../app.component';

declare var $ : any;
var date = new Date();
var todayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
@Component({
  selector: 'app-sap-credit-balance',
  templateUrl: './sap-credit-balance.page.html',
  styleUrls: ['./sap-credit-balance.page.scss'],
})
export class SapCreditBalancePage implements OnInit,AfterViewInit {
  config = {
    itemsPerPage: 20,
    currentPage: 1,
    totalItems: 0,
    id: 'crdbaldetail'
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
  _crdlistdata: any = [];
  resultData: any = this.returnData();
  _resultList: any = [];
  crdImportBtn_Access: boolean = false;

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
    $('#progress-bar-crd').hide();
    $('#crdbal-detail-table').hide();
    this.flag.isDownload = false;
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
    $('#crdbal-result-table').hide();
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
    $('#crdbal-result-table').hide();
    this.flag.isDownload = false;
    $('#progress-bar-crd').show();
    // this.flag.isDownload = true;
    let date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);

    const param = {
      "path":"D:\\Projects\\SAP\\ImportFiles\\",
      "fileName": "CREDIT_BALANCE.xlsx"
    }
    console.log(JSON.stringify(param));
    
    const url = this.manager.appConfig.apiurl + 'sap/creditBalanceDownload';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.resultData = data;
        if (data.message == "SUCCESS") {

          $('#progress-bar-crd').hide();

          this.manager.showToast(this.tostCtrl, "Message", "Download Success!", 1000);
          this.flag.isDownload = true;
          $('#crdbal-detail-table').hide();
        } else if(data.message == "NOFILEPATH"){
          $('#progress-bar-crd').hide();
          this.manager.showToast(this.tostCtrl, "Message", "File Path is not Found to Download!", 1000);
        } else {
          $('#progress-bar-crd').hide();
          this.flag.isDownload = true;
          this.manager.showToast(this.tostCtrl, "Message", "Download Fail!", 1000);
        }
      },
      error=>{
        $('#progress-bar-crd').hide();
        this.flag.isDownload = true;
        this.manager.showToast(this.tostCtrl, "Message", "Download Fail!", 1000);
      }
    );

    // if(this.filterBoxFormGroup.get('log').value)
    // {
    //   $('#crdbal-log-table').show();
    // }else
    // {
    //   $('#crdbal-download-result').show();
    // }
  }
  showDetail()
  {
    $('#crdbal-detail-table').slideToggle();
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
      "LAST_UPDATED_DATE": "",
      "BLOCK_STATUS": "",
      "CREDIT_AVAILABLE_BALANCE": ""
    };
  }

  forjsondata2() {
    return {
      uploadData: [
        {
          "CUSTOMER_ID": "",
          "CUSTOMER_NAME": "",
          "LAST_UPDATED_DATE": "",
          "BLOCK_STATUS": "",
          "CREDIT_AVAILABLE_BALANCE": ""
        }
      ]
    };
  }
  resetValue() {

  }
  onUpload(event) {
    if(event.target.files.length)
    {
      this._crdlistdata = [];
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
    $('#crdbal-result-table').hide();
    this.flag.isDownload = false;
    this.getCreditBalance();
  }
  getCreditBalance()
  {
    return new Promise<void>(
      (res, rej) => {
        if(this.uploadedFileName != "" && this.uploadedFileName != null) {
          this._crdlistdata.splice(0,this._crdlistdata.length);
          
          for(let i=0; i < this.all_sheet_data.uploadData.length; i++) {
            this._crdlistdata.push(this.all_sheet_data.uploadData[i]); //it will be okay in ui if material template column has no space
          }
          this.config.totalItems = this.all_sheet_data.uploadData.length;
          this.config.currentPage = 1;
          this.config.id = "crdbaldetail";
          $('#crdbal-detail-table').show();
          res();
        } else {
          this.manager.showToast(this.tostCtrl, "Message", "No File Selected!", 1000);
          this._crdlistdata = [];
          this.config.totalItems = 0;
          this.config.currentPage = 1;
          this.config.id = "crdbaldetail";
          $('#progress-bar-crd').hide();
          rej();
        }
      }
    );
  }

  pageChanged(e){
    this.config.currentPage = e;
  }
  async gotoImport(){
    $('#crdbal-result-table').hide();
    this.flag.isDownload = false;
    $('#progress-bar-crd').show();
    this._crdlistdata = [];
    await this.getCreditBalance();
    if(this._crdlistdata.length)
    {
      // let date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);

      const param = {
        "type":"creditbalance",
        "dataList": this._crdlistdata
      }
      const url = this.manager.appConfig.apiurl + 'sap/SAPDownload';
      this.http.post(url, param, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.resultData = data;
          if (data.message == "SUCCESS") {
            $('#progress-bar-crd').hide();
            $('#crdbal-detail-table').hide();
            
            this.manager.showToast(this.tostCtrl, "Message", "Import Success!", 1000);
            this.flag.isDownload = true;
  
          } else if(data.message == "NOFILEPATH"){
            $('#progress-bar-crd').hide();
            $('#crdbal-detail-table').hide();
            this.manager.showToast(this.tostCtrl, "Message", "File Path is not Found to Import!", 1000, 'danger');
          } else {
            $('#progress-bar-crd').hide();
            $('#crdbal-detail-table').hide();
            this.flag.isDownload = true;
            this.manager.showToast(this.tostCtrl, "Message", "Import Fail!", 1000, 'danger');
          }
        },
        error=>{
          $('#progress-bar-crd').hide();
          this.flag.isDownload = true;
          this.manager.showToast(this.tostCtrl, "Message", "Import Fail!", 1000, 'danger');
        }
      );
    }else{
      $('#progress-bar-crd').hide();
      $('#crdbal-detail-table').hide();
      this.flag.isDownload = true;
      this.manager.showToast(this.tostCtrl, "Message", "No Data to Import!", 1000, 'danger');
    }

  }
  returnData() {
    return {        
      "message": "",
      "successList": [
        {
          "customerID": "",
          "customerName": "",
          "lastUpdateDate": "",
          "blockStatus": "",
          "creditBalance": ""
        }
      ]    ,
      "failList":  [
        {
          "customerID": "",
          "customerName": "",
          "lastUpdateDate": "",
          "blockStatus": "",
          "creditBalance": ""
        }
      ]       
    };
  }
  showSuccessList()
  {
    $('#crdbal-detail-table').hide();
    this._resultList = this.resultData.successList;
    this.config.totalItems = this._resultList.length;
    this.config.currentPage = 1;
    this.config.id = "crdbalresult";
    $('#crdbal-result-table').show();
    
  }
  showFailList()
  {
    $('#crdbal-detail-table').hide();
    this._resultList = this.resultData.failList;
    this.config.totalItems = this._resultList.length;
    this.config.currentPage = 1;
    this.config.id = "crdbalresult";
    $('#crdbal-result-table').show();
  }
  getBtnAccess() {
    const pages = this.app.appPages;
    for (let i = 0; i < pages.length; i++) {
      for (let y = 0; y < pages[i].child.length; y++) {
        if (pages[i].child[y].btns) {
          for (let z = 0; z < pages[i].child[y].btns.length; z++) {
            if (pages[i].child[y].btns[z].code === 'allow_creditbalimport' && pages[i].child[y].btns[z].status === true) {
              this.crdImportBtn_Access = true;
            }
          }
        }
      }
    }
  }
}
