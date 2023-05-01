import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController, AlertController} from '@ionic/angular';
import { ControllerService } from '../controller.service';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';
import { MatOption } from '@angular/material';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $ : any;
var date = new Date();
var todayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

@Component({
  selector: 'app-sap-customer',
  templateUrl: './sap-customer.page.html',
  styleUrls: ['./sap-customer.page.scss'],
})

export class SapCustomerPage implements OnInit,AfterViewInit {
  @ViewChild('triggerAllDisChanSelectOption', { static: false }) triggerAllDisChanSelectOption: MatOption;
  @ViewChild('triggerAllSaleRegSelectOption', { static: false }) triggerAllSaleRegSelectOption: MatOption;
  @ViewChild('triggerAllStoreTypeSelectOption', { static: false }) triggerAllStoreTypeSelectOption: MatOption;

  config = {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0,
    id: 'cuslist'
  };

  filterBoxFormGroup:FormGroup = new FormGroup({
    'fromDate' : new FormControl("", Validators.required),
    'toDate' : new FormControl("", Validators.required),
    'storeType' : new FormControl("", Validators.required),
    'saleRegion' : new FormControl("0", Validators.required),
    'disChannel' : new FormControl("0", Validators.required),
    'checkAll': new FormControl(false)
  });
  tableData = [{}];
  statelist: any = [];
  storeType: any = [];
  discChannelList: any = [];
  criStateList: any = [];
  selectedState: any = "";
  selectedStore: any = "";
  selectedDisChannel: any = "";
  searchObj: any = this.getSearchObj();
  totalCount: any = 0;
  successCount: any = 0;
  failCount: any = 0;
  shoplist: any = [];
  showShopList: any = [];
  shopSyskeys: any = "";

  constructor(
    public manager: ControllerService,
    public http: HttpClient,
    private loadCtrl: LoadingController,
    private tostCtrl: ToastController,
    private alertCtrl: AlertController,
    ) { }

  ngAfterViewInit(): void {
    // this.filterBoxFormGroup.get('log').valueChanges.subscribe(
    //   (e:boolean)=>{
    //     let storeType = document.getElementById('store-type');
    //       let saleRegion = document.getElementById('sale-region');
    //       let disChannel = document.getElementById('dis-channel');
    //     if(e){
    //       storeType.classList.add('d-none');
    //       saleRegion.classList.add('d-none');
    //       disChannel.classList.add('d-none');
    //     }else{
    //       storeType.classList.remove('d-none');
    //       saleRegion.classList.remove('d-none');
    //       disChannel.classList.remove('d-none');
    //     }
    //   }
    // );
    this.shoplist = [];
    this.showShopList = [];
    this.filterBoxFormGroup.get('checkAll').setValue(false);
    $('#cusUploadtoDate').attr('disabled', true);
  }
  
  ngOnInit() {
    this.getState();
    this.getStoreType();
    this.getPartnerData();
    this.shoplist = [];
    this.showShopList = [];
    this.filterBoxFormGroup.get("fromDate").setValue(todayDate);
    this.filterBoxFormGroup.get("toDate").setValue(todayDate);
    this.filterBoxFormGroup.get('checkAll').setValue(false);
  }
  
  async search(isExportSearch){
    this.shoplist = [];
    this.showShopList = [];
    var fromDate = "";
    var toDate = "";
    let valueDC: any = "";
    let valueSR: any = "";
    let valueST: any = "'";

    if(this.filterBoxFormGroup.get('checkAll').value == false){
      fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.filterBoxFormGroup.get("fromDate").value);
      toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.filterBoxFormGroup.get("toDate").value);
    }

    const loading = await this.loadCtrl.create({
      cssClass: 'custom-class custom-loading', //my-custom-class
      message: 'Please wait...'
    });

    for(var i = 0; i < this.filterBoxFormGroup.get("disChannel").value.length; i++){
      valueDC += this.filterBoxFormGroup.get("disChannel").value[i] + ","; 
    }
    valueDC = valueDC.slice(0,-1);

    for(var i = 0; i < this.filterBoxFormGroup.get("saleRegion").value.length; i++){
      valueSR += this.filterBoxFormGroup.get("saleRegion").value[i] + ","; 
    }
    valueSR = valueSR.slice(0,-1);

    for(var i = 0; i < this.filterBoxFormGroup.get("storeType").value.length; i++){
      valueST += this.filterBoxFormGroup.get("storeType").value[i] + "','";
    }
    valueST = valueST.slice(0,-2);

    await loading.present();

    var param = {
      fromDate: fromDate,
      toDate: toDate,
      storeType: valueST,     //  this.filterBoxFormGroup.get("storeType").value,
      saleRegion: valueSR,    //  this.filterBoxFormGroup.get("saleRegion").value,
      disChannel: valueDC,
      uploadStatus: isExportSearch,
    };

    console.log(param);

    const url = this.manager.appConfig.apiurl+ 'sap/searchCustomer';

    return new Promise<void>(
      (res, rej) => {
        this.http.post(url,param, this.manager.getOptions()).subscribe(
          (data: any) => {
            loading.dismiss();
            console.log(data);
    
            /*
            this.config.totalItems = data.totalCount;
            this.totalCount = data.totalCount;
            */
    
            this.config.totalItems = data.collectedData.length;
            this.config.id = "cuslist";
            this.totalCount = data.collectedData.length;
            this.shoplist = data.collectedData;
            this.shopSyskeys = data.shopSyskeys;
            this.shoplist.map((shop) => {
              // if(shop.CreditLimitAmount.toString().indexOf(".") == -1)
              // {
              //   shop.CreditLimitAmount = parseFloat(shop.CreditLimitAmount).toFixed(1);
              // }
              shop.CreditLimitAmount = shop.CreditLimitAmount.toString();
            })

            $('#detail-table').show();

            // if(!isExportSearch){
              if(this.shoplist != undefined && this.shoplist != null && this.shoplist.length > 0){
                this.showShopList = this.shoplist.slice(0, 20);
              } else{
                $('#detail-table').hide();
              }

              $('#search-result').show();
            // }

            res();
          }, error => {
            loading.dismiss();
            rej();
          }
        );
      }
    );
  
  }

  pageChanged(e) {
    this.config.currentPage = e;
    this.config.id = 'cuslist';
    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    let endIndex = this.config.currentPage * this.config.itemsPerPage;
    this.showShopList = [];
    console.log(this.shoplist.slice(currentIndex, 20));
    this.showShopList = this.shoplist.slice(currentIndex, endIndex);
    // this.getShopList(currentIndex).then( ()=>{
    //   this.runSpinner(false);
    // }).catch(()=>{ this.runSpinner(false);})
  }

  showDetail(){
    $('#detail-table').slideToggle();
  }
  
  async uploadCustomers(){
    $('#detail-table').hide();

    let fromDate = "";
    let toDate = "";

    const loading = await this.loadCtrl.create({
      cssClass: 'custom-class custom-loading', //my-custom-class
      message: 'Please wait...'
    });

    if(this.filterBoxFormGroup.get('checkAll').value == false){
      fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.filterBoxFormGroup.get("fromDate").value);
      toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.filterBoxFormGroup.get("toDate").value);
    }

    await loading.present();

    var param = {
      fromDate: fromDate,
      toDate: toDate,
      storeType: this.filterBoxFormGroup.get("storeType").value,
      saleRegion: this.filterBoxFormGroup.get("saleRegion").value,
      disChannel: this.filterBoxFormGroup.get("disChannel").value
    };

    console.log(param);

    const url = this.manager.appConfig.apiurl+ 'sap/customerUpload';

    this.http.post(url,param, this.manager.getOptions()).subscribe(
      (data: any) => {
        if(data.message == "SUCCESS") {
          // this.successCount = data.successCount;
          // this.failCount = data.failCount;
          // console.log("Success Count => " + data.successCount + '\t Fail Count => ' + data.failCount);

          this.manager.showToast(this.tostCtrl, "Message", "Upload Successful!", 1000);
          $('#upload-result').show();
        } else if(data.message == "NODATA"){
          this.manager.showToast(this.tostCtrl, "Message", "No Data to Upload!", 1000);
        } else if(data.message == "NOFILEPATH"){
          this.manager.showToast(this.tostCtrl, "Message", "File Path is not Found to Upload!", 1000);
        } else {
          this.manager.showToast(this.tostCtrl, "Message", "Upload Failed", 1000);
        }
        
        loading.dismiss();
      }, error=> {
        loading.dismiss();
      }    
    );
    // $('#detail-table').hide();
    // $('#search-result').hide();
    // $('#upload-result').show();
    // setTimeout(() => {
    //   $('#upload-result').hide();
    // }, 3000);
  }

  async print(){
    await this.search(true);

    let fromDate = "";
    let toDate = "";

    if(this.filterBoxFormGroup.get('checkAll').value == false){
      fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.filterBoxFormGroup.get("fromDate").value);
      toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.filterBoxFormGroup.get("toDate").value);
    }

    let param = {
      fromDate: fromDate,
      toDate: toDate,
      storeType: this.filterBoxFormGroup.get("storeType").value,
      saleRegion: this.filterBoxFormGroup.get("saleRegion").value,
      disChannel: this.filterBoxFormGroup.get("disChannel").value
    };

    if (this.shoplist != undefined && this.shoplist != null && this.shoplist.length > 0) {
      let data1 = this.shoplist;
      let cri_flag = 0;

      let excelTitle = "Customer Upload";
      let excelHeaderData = [
        "CustomerId", "CustomerName", "AccountGroup", "STR_SUPPL1", 
        "CITY2", "HOME_CITY", "STR_SUPPL2", "STR_SUPPL3", 
        "HOUSE_NO", "Street", "TELEPHONE", "SALE_ORG", 
        "DIS_CHANNEL", "DIVISION", "SAL_DISTRICT", "PAYMENT_TERM", 
        "UPDATE_FLAG", "DELETE_FLAG", "TRANSPZONE", "PARTNER_ROLE", 
        "PARTNER_ID", "SALES_OFFICE", "SALE_GROUP", "CUSTOMER_GROUP", 
        "PriceListType", "CreditLimitAmount", "Status"
      ];
      let excelDataList: any = [];

      let workbook = new Workbook();
      let worksheet = workbook.addWorksheet('Customer Upload Data');

      for (var exCount = 0; exCount < data1.length; exCount++) {
        let excelData: any = [];

        excelData.push(data1[exCount].CustomerId);
        excelData.push(data1[exCount].CustomerName);
        excelData.push(data1[exCount].AccountGroup);
        excelData.push(data1[exCount].STR_SUPPL1);

        excelData.push(data1[exCount].CITY2);
        excelData.push(data1[exCount].HOME_CITY);
        excelData.push(data1[exCount].STR_SUPPL2);
        excelData.push(data1[exCount].STR_SUPPL3);

        excelData.push(data1[exCount].HOUSE_NO);
        excelData.push(data1[exCount].Street);
        excelData.push(data1[exCount].TELEPHONE);
        excelData.push(data1[exCount].SALE_ORG);

        excelData.push(data1[exCount].DIS_CHANNEL);
        excelData.push(data1[exCount].DIVISION);
        excelData.push(data1[exCount].SAL_DISTRICT);
        excelData.push(data1[exCount].PAYMENT_TERM);

        excelData.push(data1[exCount].UPDATE_FLAG);
        excelData.push(data1[exCount].DELETE_FLAG);
        excelData.push(data1[exCount].TRANSPZONE);
        excelData.push(data1[exCount].PARTNER_ROLE);

        excelData.push(data1[exCount].PARTNER_ID);
        excelData.push(data1[exCount].SALES_OFFICE);
        excelData.push(data1[exCount].SALE_GROUP);
        excelData.push(data1[exCount].CUSTOMER_GROUP);

        excelData.push(data1[exCount].PriceListType);
        excelData.push(data1[exCount].CreditLimitAmount);
        excelData.push(data1[exCount].Status);

        excelDataList.push(excelData);
      }

      let titleRow = worksheet.addRow(["", "", excelTitle]);
      titleRow.font = { bold: true };
      worksheet.addRow([]);

      let criteriaRow;

      if(param.fromDate != undefined && param.fromDate != null && param.fromDate.toString() != ""){
        criteriaRow = worksheet.addRow(["From Date : " + param.fromDate.toString()]);
        criteriaRow.font = { bold: true };
        cri_flag++;
      }

      if(param.toDate != undefined && param.toDate != null && param.toDate.toString() != ""){
        criteriaRow = worksheet.addRow(["To Date : " + param.toDate.toString()]);
        criteriaRow.font = { bold: true };
        cri_flag++;
      }

      if(param.storeType != undefined && param.storeType != null && param.storeType.toString() != ""){
        criteriaRow = worksheet.addRow(["Store Type : " + param.storeType.toString()]);
        criteriaRow.font = { bold: true };
        cri_flag++;
      }

      if(param.saleRegion != undefined && param.saleRegion != null && param.saleRegion.toString() != ""){
        criteriaRow = worksheet.addRow(["Sale Region : " + param.saleRegion.toString()]);
        criteriaRow.font = { bold: true };
        cri_flag++;
      }

      if(param.disChannel != undefined && param.disChannel != null && param.disChannel.toString() != ""){
        criteriaRow = worksheet.addRow(["Distribution Channal : " + param.disChannel.toString()]);
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
        FileSaver.saveAs(blob, "Customer_export_" + new Date().getTime() + EXCEL_EXTENSION);
      });
    }
  }

  updateShopExportStatus(){
    if(this.shopSyskeys == undefined || this.shopSyskeys == null || this.shopSyskeys.toString() == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Check first", 1000);
      return;
    }

    const url = this.manager.appConfig.apiurl+ 'sap/updateShopExportStatus';
    let param = {
      "shopSyskeys": this.shopSyskeys
    };

    this.http.post(url,param, this.manager.getOptions()).subscribe(
      (data: any) => {
        if(data.message == "SUCCESS"){
          this.manager.showToast(this.tostCtrl, "Message", "Status Change Success", 1000);
        }
      }
    );
  }

  getState() {
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'placecode/state';
      this.http.post(url, { code: "", description: "" }, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.statelist = [];
          // this.criStateList = [];

          data.dataList.forEach(e => {
            this.statelist.push({ syskey: e.syskey, t2: e.t2 });
            // this.criStateList.push({ syskey: e.syskey, t2: e.t2 });
          });

          this.statelist.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
          // this.criStateList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
        },
        error => {
          done();
        }
      )
    })
  }

  getStoreType() {
    return new Promise<void>(done => {
      const url = this.manager.appConfig.apiurl + 'shop/getStoreType';
      this.http.post(url, { code: "", description: "" }, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.storeType = data.dataList;
        },
        error => {
          done();
        }
      )
    })
  }


  getPartnerData() {
    const url = this.manager.appConfig.apiurl+ 'shop/getPartnerData';
    this.http.get(url, this.manager.getOptions()).subscribe((data: any) => {
      if(data.message == 'SUCCESS') {
        // this.divList = data.dataList.divisionList;
        // this.salesOfficeList = data.dataList.saleOfficeList;
        this.discChannelList = data.dataList.disChannelList;
        // this.bpGroupList = data.dataList.partGpList;
        // this.saleDistrictList = data.dataList.saleDistrictList;
        // this.paymentTermList = data.dataList.paymentTermList;
        // this.creditControlList = data.dataList.creditControlList;
      }
    });
  }

  changeState(event) {
    this.selectedState = event.target.value;
  }

  changeStore(event) {
    this.selectedStore = event.target.value;
  }

  changeDisChannel(event) {
    this.selectedDisChannel = event.target.value;
  }

  getSearchObj() {
    return {
      shopSysKey: "",
      fromdate: "",
      todate: "",
      dateOptions: "",
      t14: "",
      n20: "",
      n21: "",
      n22: "",
      n23: "",
      n24: ""
    }
  }

  printFileOriginal(filename){

    if (this.shoplist != undefined && this.shoplist != null && this.shoplist.length > 0) {
      let data1 = this.shoplist;
      let excelHeaderData = [
        "CUSTOMER_ID", "CUSTOMER_NAME", "ACCOUNT_GROUP", "STR_SUPPL1", 
        "CITY2", "HOME_CITY", "STR_SUPPL2", "STR_SUPPL3", 
        "HOUSE_NO", "STREET", "TELEPHONE", "SALE_ORG", 
        "DIS_CHANNEL", "DIVISION", "SAL_DISTRICT", "PAYMENT_TERM", 
        "UPDATE_FLAG", "DELETE_FLAG", "BLOCK_STATUS", "TRANSPZONE", 
        "PARTNER_ROLE", "PARTNER_ID", "SALES_OFFICE", "SALE_GROUP", 
        "CUSTOMER_GROUP", "PRICE_LIST_TYPE", "CREDIT_LIMIT_AMOUNT"
      ];
      let excelDataList: any = [];

      let workbook = new Workbook();
      let worksheet = workbook.addWorksheet('Customer Upload Data');
      let headerRow = worksheet.addRow(excelHeaderData);
      headerRow.font = { bold: true };

      for (var exCount = 0; exCount < data1.length; exCount++) {
        let excelData: any = [];

        excelData.push(data1[exCount].CustomerId);
        excelData.push(data1[exCount].CustomerName);
        excelData.push(data1[exCount].AccountGroup);
        excelData.push(data1[exCount].STR_SUPPL1);

        excelData.push(data1[exCount].CITY2);
        excelData.push(data1[exCount].HOME_CITY);
        excelData.push(data1[exCount].STR_SUPPL2);
        excelData.push(data1[exCount].STR_SUPPL3);

        excelData.push(data1[exCount].HOUSE_NO);
        excelData.push(data1[exCount].Street);
        excelData.push(data1[exCount].TELEPHONE);
        excelData.push(data1[exCount].SALE_ORG);

        excelData.push(data1[exCount].DIS_CHANNEL);
        excelData.push(data1[exCount].DIVISION);
        excelData.push(data1[exCount].SAL_DISTRICT);
        excelData.push(data1[exCount].PAYMENT_TERM);

        excelData.push(data1[exCount].UPDATE_FLAG);
        excelData.push(data1[exCount].DELETE_FLAG);
        excelData.push(data1[exCount].Status);
        excelData.push(data1[exCount].TRANSPZONE);

        excelData.push(data1[exCount].PARTNER_ROLE);
        excelData.push(data1[exCount].PARTNER_ID);
        excelData.push(data1[exCount].SALES_OFFICE);
        excelData.push(data1[exCount].SALE_GROUP);

        excelData.push(data1[exCount].CUSTOMER_GROUP);
        excelData.push(data1[exCount].PriceListType);
        excelData.push(data1[exCount].CreditLimitAmount);

        // excelDataList.push(excelData);
        worksheet.addRow(excelData);
       
      }

      // let headerRow = worksheet.addRow(excelHeaderData);
      // headerRow.font = { bold: true };
      // for (var i_data = 0; i_data < excelDataList.length; i_data++) {
      //   worksheet.addRow(excelDataList[i_data]);
      // }

      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: EXCEL_TYPE });
        FileSaver.saveAs(blob, filename + EXCEL_EXTENSION);
      });
    }else{
      $('#detail-table').hide();
      this.manager.showToast(this.tostCtrl, "Message", "No Data to Upload!", 1000);
    }
  }
  printFile(filename){

    if (this.shoplist != undefined && this.shoplist != null && this.shoplist.length > 0) {

      let workbook = new Workbook();
      let worksheet = workbook.addWorksheet('Customer Upload Data');
 
      worksheet.columns = [
        { header: 'CUSTOMER_ID', key: 'CustomerId', width: 10 },
        { header: 'CUSTOMER_NAME', key: 'CustomerName',  width: 10 },
        { header: 'ACCOUNT_GROUP', key: 'AccountGroup', width: 10 },
        { header: 'STR_SUPPL1', key: 'STR_SUPPL1', width: 10 },

        { header: 'CITY2', key: 'CITY2', width: 10 },
        { header: 'HOME_CITY', key: 'HOME_CITY', width: 10 },
        { header: 'STR_SUPPL2', key: 'STR_SUPPL2', width: 10 },
        { header: 'STR_SUPPL3', key: 'STR_SUPPL3', width: 10 },

        { header: 'HOUSE_NO', key: 'HOUSE_NO', width: 10 },
        { header: 'STREET', key: 'Street', width: 10 },
        { header: 'TELEPHONE', key: 'TELEPHONE', width: 10 },
        { header: 'SALE_ORG', key: 'SALE_ORG', width: 10 },

        { header: 'DIS_CHANNEL', key: 'DIS_CHANNEL', width: 10 },
        { header: 'DIVISION', key: 'DIVISION', width: 10 },
        { header: 'SAL_DISTRICT', key: 'SAL_DISTRICT', width: 10 },
        { header: 'PAYMENT_TERM', key: 'PAYMENT_TERM', width: 10 },

        { header: 'UPDATE_FLAG', key: 'UPDATE_FLAG', width: 10 },
        { header: 'DELETE_FLAG', key: 'DELETE_FLAG', width: 10 },
        { header: 'BLOCK_STATUS', key: 'Status', width: 10 },
        { header: 'TRANSPZONE', key: 'TRANSPZONE', width: 10 },

        { header: 'PARTNER_ROLE', key: 'PARTNER_ROLE', width: 10 },
        { header: 'PARTNER_ID', key: 'PARTNER_ID', width: 10 },
        { header: 'SALES_OFFICE', key: 'SALES_OFFICE', width: 10 },
        { header: 'SALE_GROUP', key: 'SALE_GROUP', width: 10 },

        { header: 'CUSTOMER_GROUP', key: 'CUSTOMER_GROUP', width: 10 },
        { header: 'PRICE_LIST_TYPE', key: 'PriceListType', width: 10 },
        { header: 'CREDIT_LIMIT_AMOUNT', key: 'CreditLimitAmount', width: 10 },
        
      ];
      worksheet.getRow(1).font = {bold: true};
      worksheet.addRows(this.shoplist);

      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: EXCEL_TYPE });
        FileSaver.saveAs(blob, filename + EXCEL_EXTENSION);
      });
    }else{
      $('#detail-table').hide();
      this.manager.showToast(this.tostCtrl, "Message", "No Data to Upload!", 1000);
    }
  }
  async printToPreview()
  {   
    const loading = await this.loadCtrl.create({
      cssClass: 'custom-class custom-loading', //my-custom-class
      message: 'Please wait...',
      backdropDismiss: false
    })
    await loading.present();
    return new Promise<void>(
      (resolve) => {
        this.printFile("CUSTOMER_PREVIEW")
        loading.dismiss();
        resolve();
    })
  }
  async printToExport()
  {
    await this.search(true);
    this.loadCtrl.create({
      message: 'Please wait...'
    }).then(loadEl => {
      loadEl.present();
      this.printFile("CUSTOMER");
      loadEl.dismiss();
    })
    //  this.shoplist = [];
  }

  toggleDisChanAllSelect() {
    let disChanSyskey = [];
    if (this.triggerAllDisChanSelectOption.selected) {      
      disChanSyskey.push(-1);
      for (let dischan of this.discChannelList) {
        disChanSyskey.push(dischan.syskey)
      }
    } else {
      disChanSyskey = [];
    }
    this.filterBoxFormGroup.get('disChannel').setValue(disChanSyskey);
  }

  toggleSaleRegAllSelect() {
    let saleRegSyskey = [];

    if (this.triggerAllSaleRegSelectOption.selected) {
      saleRegSyskey.push(-1);

      for (let saleReg of this.statelist) {
        saleRegSyskey.push(saleReg.syskey)
      }
    } else {
      saleRegSyskey = [];
    }

    this.filterBoxFormGroup.get('saleRegion').setValue(saleRegSyskey);
  }

  toggleStoreTypeAllSelect() {
    let storeTypeSyskey = [];

    if (this.triggerAllStoreTypeSelectOption.selected) {
      storeTypeSyskey.push(-1);

      for (let storeType of this.storeType) {
        storeTypeSyskey.push(storeType.t1)
      }
    } else {
      storeTypeSyskey = [];
    }

    this.filterBoxFormGroup.get('storeType').setValue(storeTypeSyskey);
  }

  async resetToExport()
  {
    this.alertCtrl.create({
      header: 'Confirm to Reset?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            //console.log('Confirm Cancel: blah');
          }
        },
        {
          text: 'Okay',
          handler: () => {
            this.loadCtrl.create({
              message: "Please wait...",
              backdropDismiss: false,
              duration: 5000
            }).then(
              el => {
                el.present();
                var fromDate = "";
                var toDate = "";
                let valueDC: any = "";
                let valueSR: any = "";
                let valueST: any = "'";
            
                if(this.filterBoxFormGroup.get('checkAll').value == false){
                  fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.filterBoxFormGroup.get("fromDate").value);
                  toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.filterBoxFormGroup.get("toDate").value);
                }

                for(var i = 0; i < this.filterBoxFormGroup.get("disChannel").value.length; i++){
                  valueDC += this.filterBoxFormGroup.get("disChannel").value[i] + ","; 
                }
                valueDC = valueDC.slice(0,-1);

                for(var i = 0; i < this.filterBoxFormGroup.get("saleRegion").value.length; i++){
                  valueSR += this.filterBoxFormGroup.get("saleRegion").value[i] + ",";
                }
                valueSR = valueSR.slice(0,-1);

                for(var i = 0; i < this.filterBoxFormGroup.get("storeType").value.length; i++){
                  valueST += this.filterBoxFormGroup.get("storeType").value[i] + "','";
                }
                valueST = valueST.slice(0,-2);
                console.log("valueST : " + valueST);
            
                var param = {
                  fromDate: fromDate,
                  toDate: toDate,
                  storeType: valueST,     //  this.filterBoxFormGroup.get("storeType").value,
                  saleRegion: valueSR,    //  this.filterBoxFormGroup.get("saleRegion").value,
                  disChannel: valueDC
                };

                const url = this.manager.appConfig.apiurl + 'sap/resetStatusCustomerUpload';

                this.http.post(url, param, this.manager.getOptions()).subscribe(
                  (data: any) => {
                    el.dismiss();
                    if (data.message == "SUCCESS") {
                      this.manager.showToast(this.tostCtrl, "Message", "Reset Successful!", 1000);
                    } else if (data.message == "NODATA") {
                      this.manager.showToast(this.tostCtrl, "Message", "No Data to Reset!", 1000);
                    }else{
                      this.manager.showToast(this.tostCtrl, "Message", "Reset Fail!", 1000);
                    }
                  },
                  (error: any) => {
                    el.dismiss();
                    this.manager.showToast(this.tostCtrl, "Message", "Reset Fail!", 1000);
                  }
                )

              }
            )
          }
        }

      ]
    }).then(el => {
      el.present();
    })    
  }
}