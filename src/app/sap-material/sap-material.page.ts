import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ControllerService } from '../controller.service';
import { AlertController, LoadingController, ToastController, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';

declare var $ : any;
var date = new Date();
var todayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
@Component({
  selector: 'app-sap-material',
  templateUrl: './sap-material.page.html',
  styleUrls: ['./sap-material.page.scss'],
})
export class SapMaterialPage implements OnInit,AfterViewInit {
  config = {
    itemsPerPage: 20,
    currentPage: 1,
    totalItems: 0,
    id: 'matldetail'
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
  _matllistdata: any = [];
  resultData: any = this.returnData();
  _resultList: any = [];

  constructor(
    private http: HttpClient,
    private manager: ControllerService,
    public alertController: AlertController,
    public loading: LoadingController,
    public tostCtrl: ToastController,
   
    ) { }
  ngAfterViewInit(): void 
  {
    $('#material-detail-table').hide();
    $('#material-result-table').hide();
    $('#progress-bar-matl').hide();
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
    this.criteria = this.getCriteriaData();
    this.flag = this.getFlag();
    this.criteria.fromDate = todayDate;
    this.criteria.toDate = todayDate;
  }
  ionViewWillEnter() 
  {
    this.importload = "";
  }

  download()
  {
    $('#material-result-table').hide();
    this.flag.isDownload = false;
    $('#progress-bar-matl').show();
    
    let date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);

    const param = {
      "path":"D:\\Projects\\SAP\\ImportFiles\\",
      "fileName": "MATERIAL.xlsx"
    }
    const url = this.manager.appConfig.apiurl + 'sap/MaterialDownload';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
       this.resultData = data;
        if (data.message == "SUCCESS") {
          $('#progress-bar-matl').hide();
          $('#material-detail-table').hide();
          
          this.manager.showToast(this.tostCtrl, "Message", "Download Success!", 1000);
          this.flag.isDownload = true;

        } else if(data.message == "NOFILEPATH"){
          $('#progress-bar-matl').hide();
          this.manager.showToast(this.tostCtrl, "Message", "File Path is not Found to Download!", 1000);
        } else {
          $('#progress-bar-matl').hide();
          this.flag.isDownload = true;
          this.manager.showToast(this.tostCtrl, "Message", "Download Fail!", 1000);
        }
      },
      error=>{
        $('#progress-bar-matl').hide();
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
    $('#material-detail-table').slideToggle();
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
      "MATERIAL_CODE": "",
      "MATERIAL_DESC": "",
      "MATERIAL_TYPE": "",
      "ITEM_CATEGORY": "",
      "BASE_UOM": "",
      "ALT_UOM": "",
      "ALT_UOM_CONVERSION": "",
      "CREATED_ON": "",
      "CREATED_BY": "",
      "LAST_CHANGE_ON": "",
      "LAST_CHANGE_BY": ""
    };
  }

  forjsondata2() {
    return {
      uploadData: [
        {
          "MATERIAL_CODE": "",
          "MATERIAL_DESC": "",
          "MATERIAL_TYPE": "",
          "ITEM_CATEGORY": "",
          "BASE_UOM": "",
          "ALT_UOM": "",
          "ALT_UOM_CONVERSION": "",
          "CREATED_ON": "",
          "CREATED_BY": "",
          "LAST_CHANGE_ON": "",
          "LAST_CHANGE_BY": ""
        }
      ]
    };
  }
  resetValue() {

  }
  onUpload(event) {
    if(event.target.files.length)
    {
      this._matllistdata = [];
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
    }else
    {
      this.uploadedFileName = "";
      // this._matllistdata = [];
      // this.config.totalItems = 0;
      // this.config.currentPage = 1;
    } 

  }

  gotoPreview() {
    $('#material-result-table').hide();
    this.flag.isDownload = false;
    this.getMaterial();
  }

  getMaterial()
  {
    return new Promise<void>(
      (res, rej) => {
        if(this.uploadedFileName != "" && this.uploadedFileName != null) {
          this._matllistdata.splice(0,this._matllistdata.length);
          
          for(let i=0; i < this.all_sheet_data.uploadData.length; i++) {
            this._matllistdata.push(this.all_sheet_data.uploadData[i]); //it will be okay in ui if material template column has no space
          }
          this.config.totalItems = this.all_sheet_data.uploadData.length;
          this.config.currentPage = 1;
          this.config.id = "matldetail";
          $('#material-detail-table').show();
          res();
        } else {
          console.log("no file selected!");
          this.manager.showToast(this.tostCtrl, "Message", "No File Selected!", 1000);
          this._matllistdata = [];
          this.config.totalItems = 0;
          this.config.currentPage = 1;
          this.config.id = "matldetail";
          $('#progress-bar-matl').hide();
          rej();
        }
      }
    );
  }

  pageChanged(e){
    this.config.currentPage = e;
  }

  async gotoImport()
  {  
    this.alertController.create({
      header: 'Confirm Import ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        { 
          text: 'Okay',
          handler: () => {                  
              $('#material-result-table').hide();
              this.flag.isDownload = false;
              $('#progress-bar-matl').show();
              this._matllistdata = [];
              //await this.getMaterial();
              this.getMaterial().then(()=>{
                if(this._matllistdata.length)
                   {
                     // let date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
                    const param = {
                      "type":"material",
                       "dataList": this._matllistdata
                     }
                  
                    const url = this.manager.appConfig.apiurl + 'sap/SAPDownload';
                    this.http.post(url, param, this.manager.getOptions()).subscribe(
                      (data: any) => {
                        this.resultData = data;
                        if (data.message == "SUCCESS") {
                          $('#progress-bar-matl').hide();
                          $('#material-detail-table').hide();
                          
                          this.manager.showToast(this.tostCtrl, "Message", "Import Success!", 1000);
                          this.flag.isDownload = true;
                
                        } else if(data.message == "NOFILEPATH"){
                          $('#progress-bar-matl').hide();
                          $('#material-detail-table').hide();
                          this.manager.showToast(this.tostCtrl, "Message", "File Path is not Found to Import!", 1000, 'danger');
                        } else {
                          $('#progress-bar-matl').hide();
                          $('#material-detail-table').hide();
                          this.flag.isDownload = true;
                          this.manager.showToast(this.tostCtrl, "Message", "Import Fail!", 1000, 'danger');
                        }
                      },
                  )
                }
              })

            }
          }       
      ]    
    }).then(el => {
      el.present();
    })
    
  }
  

 
  returnData() {
    return {        
      "message": "",
      "successList": [
        {
          "matlCode": "",
          "matlDesc": "",
          "matlType": "",
          "itemCAT": "",
          "baseUOM": "",
          "altUOM": "",
          "altUOMRatio": "",
          "createdON": "",
          "createdBY": "",
          "lastchangeON": "",
          "lastchangeBY": ""
        }
      ]    ,
      "failList":  [
        {
          "matlCode": "",
          "matlDesc": "",
          "matlType": "",
          "itemCAT": "",
          "baseUOM": "",
          "altUOM": "",
          "altUOMRatio": "",
          "createdON": "",
          "createdBY": "",
          "lastchangeON": "",
          "lastchangeBY": ""
        }
      ]    
    };
  }
  showSuccessList()
  {
    $('#material-detail-table').hide();
    this._resultList = this.resultData.successList;
    this.config.totalItems = this._resultList.length;
    this.config.currentPage = 1;
    this.config.id = "matlresult"
    $('#material-result-table').show();
    
  }
  showFailList()
  {
    $('#material-detail-table').hide();
    this._resultList = this.resultData.failList;
    this.config.totalItems = this._resultList.length;
    this.config.currentPage = 1;
    this.config.id = "matlresult"
    $('#material-result-table').show();
  }
}
