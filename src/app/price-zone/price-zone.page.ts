import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { FormControl } from '@angular/forms';

declare var $: any;

@Component({
  selector: 'app-price-zone',
  templateUrl: './price-zone.page.html',
  styleUrls: ['./price-zone.page.scss'],
})
export class PriceZonePage implements OnInit {

  config =  {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0,
    id: "configId"
  };

  spinner: boolean = false;
  searchtab: boolean = false;
  btn: any = false;
  dtlFlag: any = false;

  criteria: any = this.getCriteriaData();
  searchCriteria: any = this.getCriteriaData();

  headerList: any = [];
  saveData: any = this.getSaveData();
  tempSaveData: any = this.getSaveData();

  // tempSearch: any = {
  //   "shopDesc": "",
  //   "townshipDesc": ""
  // };
  tempSearch: any = this.getShopListPageChangeData();
  tempSearchCri: any = this.getShopListPageChangeData();
  tempSearch1: any = {
    "category": "",
    "subCategory": "",
    "item": ""
  };
  townList: any = [];
  itemList: any = [];
  dropdown:boolean = false;
  dropdown1:boolean = false;

  itemSearch: FormControl = new FormControl();
  shopSearch: FormControl = new FormControl();
  stockList: any = [];
  shopList: any = [];

  tempShopList: any = [];

  tempSaveShopList: any = [];

  tempE: any = {
    "currentTarget": {
      "checked": false
    }
  };
  tsLoadingFlag: any = false;
  shopListItemPerPage = 20;

  constructor(
    private http: HttpClient,
    private manager: ControllerService,
    public alertController: AlertController,
    public tostCtrl: ToastController,
    public loading: LoadingController
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    $("#priceZoneNew").hide();
    $("#priceZoneList").show();
    $("#priceZoneList-tab").tab("show");
    $('#savePriceZoneCode').css('border-color', '');

    this.btn = false;
    this.dtlFlag = false;

    this.manager.isLoginUser();

    this.clearProperties();
    // this.headerList = [];
    this.runSpinner(true);
    await this.getAllDataList();
    this.runSpinner(false);
    this.allList();

  }

  async priceZoneListTab(){
    $('#priceZoneNew').hide();
    $('#priceZoneList').show();

    this.clearProperties();
    this.runSpinner(true);
    await this.getAllDataList();
    this.runSpinner(false);
  }

  priceZoneNewTab(){
    $('#priceZoneList').hide();
    $('#priceZoneNew').show();
    $('#savePriceZoneCode').css('border-color', '');

    $('#priceZoneHdr-tab').tab('show');
    $('#priceZoneHdr').show();
    $('#priceZoneShopList').hide();

    this.btn = true;
    this.dtlFlag = false;
    this.clearProperties();
    this.allList();

    // this.searchShop();
    this.searchItem();
    this.searchTownship();
  }

  hdrListTab(){
    $('#priceZoneHdr').show();
    $('#priceZoneShopList').hide();
  }

  priceZoneShopTab(){
    $('#priceZoneHdr').hide();
    $('#priceZoneShopList').show();
  }

  advanceSearch(option) {
    this.searchtab = option;
  }

  runSpinner(t: boolean) {
    this.spinner = t;
  }

  focusFunction() {
    $('#savePriceZoneCode').css('border-color', '');
  }

  dateChange1(event){
    if(this.criteria.toDate != "" || this.criteria.toDate != undefined){
      let tempFromDate = new Date(event.target.value);
      let tempToDate = new Date(this.criteria.toDate);

      tempFromDate.setHours(0, 0, 0, 0);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.manager.showToast(this.tostCtrl, "Message", "From Date must be sooner than To Date", 5000);
        this.criteria.fromDate = "";
        this.criteria.toDate = "";
      }
    }
  }

  dateChange2(event){
    if(this.criteria.fromDate == "" || this.criteria.fromDate == undefined){
      this.criteria.toDate = "";
      $("#tDate").val("").trigger("change");
      this.manager.showToast(this.tostCtrl, "Message", "Add From Date First", 2000);
    } else {
      let tempFromDate = new Date(this.criteria.fromDate);
      let tempToDate = new Date(event.target.value);

      tempFromDate.setHours(0, 0, 0, 0);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.criteria.toDate = "";
        $("#tDate").val("").trigger("change");
        this.manager.showToast(this.tostCtrl, "Message", "To Date must be later than From Date", 3000);
      }
    }
  }

  dateChange3(event){
    let tempFromDate = new Date(event.target.value);
    let tempTodayDate = new Date();

    tempFromDate.setHours(0, 0, 0, 0);
    tempTodayDate.setHours(0, 0, 0, 0);

    if (+tempTodayDate > +tempFromDate) {
      this.manager.showToast(this.tostCtrl, "Message", "From Date must not be sooner than Today Date", 5000);
      this.saveData.t3 = "";
      event.target.value = "";
    } else if(this.saveData.t4 != "" || this.saveData.t4 != undefined){
      let tempToDate = new Date(this.saveData.t4);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.manager.showToast(this.tostCtrl, "Message", "From Date must be sooner than To Date", 5000);
        this.saveData.t3 = "";
        this.saveData.t4 = "";
      }
    }
  }

  dateChange4(event){
    if(this.saveData.t3 == "" || this.saveData.t3 == undefined){
      this.saveData.t4 = "";
      event.target.value = "";
      this.manager.showToast(this.tostCtrl, "Message", "Add From Date First", 2000);
    } else {
      let tempFromDate = new Date(this.saveData.t3);
      let tempToDate = new Date(event.target.value);

      tempFromDate.setHours(0, 0, 0, 0);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.saveData.t4 = "";
        event.target.value = "";
        this.manager.showToast(this.tostCtrl, "Message", "To Date must be later than From Date", 3000);
      }
    }
  }

  dblClickFunc1(){
    this.criteria.fromDate = "";
    this.criteria.toDate = "";
  }

  dblClickFunc2(){
    this.criteria.toDate = "";
  }

  dblClickFunc3(){
    this.saveData.t3 = "";
    this.saveData.t4 = "";
  }

  dblClickFunc4(){
    this.saveData.t4 = "";
  }

  dblClickFunc5(){
    this.criteria.validDate = "";
  }

  /*
  getAllShopByTown(){
    const url = this.manager.appConfig.apiurl +'shop/getAllShopByTown';

    this.http.post(url, this.saveData, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.townList = data.dataList;
          this.townList.sort((a, b) => (a.TownDesc > b.TownDesc) ? 1 : -1);

          for(let i = 0; i < this.townList.length; i++){
            this.townList[i].ShopDataList.sort((a, b) => (a.shopName > b.shopName) ? 1 : -1);
          }
        }
      }
    );
  }
  */

 searchTownship(){
    this.tsLoadingFlag = true;
    const url = this.manager.appConfig.apiurl +'township/getAllTownshipForDis';

    this.tempSearchCri.shopDesc = this.tempSearch.shopDesc;
    this.tempSearchCri.townDesc = this.tempSearch.townDesc;

    this.http.post(url, this.tempSearchCri, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.townList = data.dataList;
          this.townList.sort((a, b) => (a.TownDesc > b.TownDesc) ? 1 : -1);

          this.townList.map(
            data => {
              data.shopSearchFlag = false;
              data.shopListConfig = {
                itemsPerPage: this.shopListItemPerPage,
                currentPage: 1,
                totalItems: 0,
                id: data.TownSyskey.toString(),
                panelExpanded: false
              };
            }
          );
        }
        this.tsLoadingFlag = false;
      }
    );
  }

  openPanel(tsList){
    if(!tsList.shopSearchFlag){
      this.searchShop("0", 1, tsList.TownSyskey);
      tsList.shopSearchFlag = true;
    }
  }

  /*            Version 2
  searchShop(){
    const url = this.manager.appConfig.apiurl +'shop/getAllShopByTown';

    this.http.post(url, this.tempSearch, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.townList = data.dataList;
          this.townList.sort((a, b) => (a.TownDesc > b.TownDesc) ? 1 : -1);

          for(let i = 0; i < this.townList.length; i++){
            this.townList[i].ShopDataList.sort((a, b) => (a.shopName > b.shopName) ? 1 : -1);
          }
        }
      }
    );
  }
  */

  searchShop(curIndex, curPage, tsSyskey){    //    if curPage > 0, it's called from shopListPageChange
    this.tempSearchCri.current = curIndex;

    if(curPage > 0){
      const url = this.manager.appConfig.apiurl +'shop/getAllShopByTownSK';
      this.tempSearchCri.townshipSyskey = tsSyskey;

      this.http.post(url, this.tempSearchCri, this.manager.getOptions()).subscribe(
        (data:any) =>{
          if(data.message == "SUCCESS"){
            // let configId = "";

            for(let i = 0; i < this.townList.length; i++){
              if(this.townList[i].TownSyskey == tsSyskey){
                this.townList[i].ShopDataList = data.dataList;
                this.townList[i].ShopDataList.sort((a, b) => (a.shopName > b.shopName) ? 1 : -1);
                this.townList[i].ShopDataList.map(
                  data => {
                    data.checkFlag = false;
                  }
                );

                // configId = "shopConfig" + i;
                this.townList[i].shopListConfig = {
                  itemsPerPage: this.shopListItemPerPage,
                  currentPage: curPage,
                  totalItems: data.Count,
                  id: this.townList[i].TownSyskey.toString(), //  configId
                  panelExpanded: false
                };

                this.checkedSelectedShop(true, this.townList[i].ShopDataList);
              }
            }
          }
        }
      );
    } else {
      const url = this.manager.appConfig.apiurl +'shop/getAllShopByTown';
      this.tempSearchCri.shopDesc = this.tempSearch.shopDesc;
      this.tempSearchCri.townDesc = this.tempSearch.townDesc;
      this.tempSearchCri.townshipSyskey = "";

      this.http.post(url, this.tempSearchCri, this.manager.getOptions()).subscribe(
        (data:any) =>{
          if(data.message == "SUCCESS"){
            // let configId = "";
            this.townList = data.dataList;
            this.townList.sort((a, b) => (a.TownDesc > b.TownDesc) ? 1 : -1);

            for(let i = 0; i < this.townList.length; i++){
              this.townList[i].ShopDataList.sort((a, b) => (a.shopName > b.shopName) ? 1 : -1);
              this.townList[i].ShopDataList.map(
                data => {
                  data.checkFlag = false;
                }
              );

              // configId = "shopConfig" + i;
              this.townList[i].shopListConfig = {
                itemsPerPage: this.shopListItemPerPage,
                currentPage: 1,
                totalItems: this.townList[i].Count,
                id: this.townList[i].TownSyskey.toString(), //  configId
                panelExpanded: false
              };

              this.checkedSelectedShop(false, this.townList[i].ShopDataList);
            }
          }
        }
      );
    }
  }

  checkedSelectedShop(pageChangeFlag, passShopList){
    for(let i = 0; i < passShopList.length; i++){
      this.tempSaveData.shopList.map(
        data => {
          if(data.n1 == passShopList[i].shopSysKey){
            passShopList[i].checkFlag = true;
          }
        }
      );
    }
  }

  searchAppliedShop(e){
    let searchValue = e.target.value.toString().toLowerCase();

    this.searchAppliedShop1(searchValue);
  }

  searchAppliedShop1(searchValue){
    this.tempShopList = this.saveData.shopList.filter(
      shopList => {
        return shopList.t1.toLowerCase().includes(searchValue);
      }
    );
  }

  selectTown(e, tsSyskey){  //  tsSyskey = tsIndex
    const url = this.manager.appConfig.apiurl +'shop/getAllShopByTownSK';
    let param = {
      "townshipSyskey": tsSyskey.toString(),
      "TownSyskey": tsSyskey.toString(),
      "shopDesc": this.tempSearch.shopDesc.toString()
    };
    let tempFlag = e.currentTarget.checked;

    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          let shopList = data.dataList;
          let sameShopCheck = false;
          this.tempE.currentTarget.checked = tempFlag;

          if(this.tempE.currentTarget.checked){
            for(let i = 0; i < shopList.length; i++){
              sameShopCheck = this.tempSaveData.shopList.some(
                tempShopData => tempShopData.n1 == shopList[i].shopSysKey
              );

              if(sameShopCheck == false){
                this.selectShop(this.tempE, param, shopList[i], true);
              }
            }
          } else {
            for(let i = 0; i < shopList.length; i++){
              this.selectShop(this.tempE, param, shopList[i], true);
            }
          }
        }
      }
    );
  }

  /*        Version 2
  selectShop(e, tsIndex, shopIndex){
    let returnTempData = this.getShopData();
    let found = false;
    let cbid = "";

    if(e.currentTarget.checked){
      for(let i = 0; i < this.saveData.shopList.length; i++){
        if(this.saveData.shopList[i].n1 == this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey){
          found = true;
          break;
        }
      }
  
      if(found == false){
        returnTempData.syskey = "";
        returnTempData.n1 = this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey;
        returnTempData.n2 = this.saveData.syskey;
        returnTempData.n3 = "1";
        returnTempData.t1 = this.townList[tsIndex].ShopDataList[shopIndex].shopName;
        returnTempData.t2 = "";
        returnTempData.t3 = "";
        returnTempData.recordstatus = "1";
        returnTempData.townSyskey = this.townList[tsIndex].TownSyskey;
        returnTempData.shopCode = this.townList[tsIndex].ShopDataList[shopIndex].shopCode;
        returnTempData.address = this.townList[tsIndex].ShopDataList[shopIndex].address;
  
        this.tempSaveData.shopList.push(returnTempData);

        cbid = "#townCb" + tsIndex + "and" + shopIndex;
        $(cbid).prop('checked', true);
      } else {
        cbid = "#townCb" + tsIndex + "and" + shopIndex;
        $(cbid).prop('checked', false);

        this.manager.showToast(this.tostCtrl, "Message", "Already Added", 2000);
      }
    } else {
      for(let i = 0; i < this.tempSaveData.shopList.length; i++){
        if(this.tempSaveData.shopList[i].n1 == this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey){
          cbid = "#townCb" + tsIndex + "and" + shopIndex;
          $(cbid).prop('checked', false);

          this.tempSaveData.shopList.splice(i, 1);
          break;
        }
      }
    }
  }
  */

  selectShop(e, townshipData, storeData, allFlag){  //  townshipData = tsIndex, storeData = shopIndex
    let returnTempData = this.getShopData();
    let found = false;
    // let cbid = "";

    if(e.currentTarget.checked){
      for(let i = 0; i < this.saveData.shopList.length; i++){
        if(this.saveData.shopList[i].n1 == storeData.shopSysKey){
          found = true;
          break;
        }
      }

      if(found == false){
        returnTempData.syskey = "";
        returnTempData.n1 = storeData.shopSysKey;  //  this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey;
        returnTempData.n2 = this.saveData.syskey;
        returnTempData.n3 = "1";
        returnTempData.t1 = storeData.shopName;  //  this.townList[tsIndex].ShopDataList[shopIndex].shopName;
        returnTempData.t2 = "";
        returnTempData.t3 = "";
        returnTempData.recordstatus = "1";
        returnTempData.townSyskey = townshipData.TownSyskey;  //  this.townList[tsIndex].TownSyskey;
        returnTempData.shopCode = storeData.shopCode;  //  this.townList[tsIndex].ShopDataList[shopIndex].shopCode;
        returnTempData.address = storeData.address;  // this.townList[tsIndex].ShopDataList[shopIndex].address;

        this.tempSaveData.shopList.push(returnTempData);

        if(allFlag){
          this.townList.map(
            data => {
              if(data.TownSyskey == townshipData.TownSyskey){
                data.ShopDataList.map(
                  shopdata => {
                    if(shopdata.shopSysKey == storeData.shopSysKey){
                      shopdata.checkFlag = true;
                    }
                  }
                );
              }
            }
          );
        }
      } else {
        if(!allFlag){
          let cbid = "#" + storeData.shopSysKey + "";
          $(cbid).prop('checked', false);

          this.manager.showToast(this.tostCtrl, "Message", "Already Added", 2000);
        }
      }
    } else {
      for(let i = 0; i < this.tempSaveData.shopList.length; i++){
        if(this.tempSaveData.shopList[i].n1 == storeData.shopSysKey){
          if(allFlag){
            this.townList.map(
              data => {
                if(data.TownSyskey == townshipData.TownSyskey){
                  data.ShopDataList.map(
                    shopdata => {
                      shopdata.checkFlag = false;
                    }
                  );
                }
              }
            );
          }

          this.tempSaveData.shopList.splice(i, 1);
          break;
        }
      }
    }
  }

  addShop(){
    let cbid = "";

    if(this.tempSaveData.shopList.length > 0){
      for(let i = 0; i < this.tempSaveData.shopList.length; i++){
        for(let j = 0; j < this.townList.length; j++){
          if(this.tempSaveData.shopList[i].townSyskey == this.townList[j].TownSyskey){
            cbid = "#" + this.townList[j].TownSyskey + "";
            $(cbid).prop('checked', false);

            this.townList[j].ShopDataList.map(
              data => {
                if(data.shopSysKey == this.tempSaveData.shopList[i].n1){
                  data.checkFlag = false;
                }
              }
            );
          }
        }

        let returnTempData = this.getShopData();
        returnTempData.syskey = "";
        returnTempData.n1 = this.tempSaveData.shopList[i].n1;
        returnTempData.n2 = this.tempSaveData.shopList[i].n2;
        returnTempData.n3 = this.tempSaveData.shopList[i].n3;
        returnTempData.t1 = this.tempSaveData.shopList[i].t1;
        returnTempData.t2 = this.tempSaveData.shopList[i].t2;
        returnTempData.t3 = "";
        returnTempData.recordstatus = this.tempSaveData.shopList[i].recordstatus;
        returnTempData.townSyskey = this.tempSaveData.shopList[i].townSyskey;
        returnTempData.shopCode = this.tempSaveData.shopList[i].shopCode;
        returnTempData.address = this.tempSaveData.shopList[i].address;
        
        this.saveData.shopList.push(returnTempData);
        this.tempShopList.push(returnTempData);
        this.tempSaveShopList.push(returnTempData);
      }

      this.saveData.shopList.sort((a, b) => (a.t1 > b.t1) ? 1 : -1);
      this.tempShopList.sort((a, b) => (a.t1 > b.t1) ? 1 : -1);
      this.searchAppliedShop1("");
  
      this.tempSaveData.shopList.splice(0, this.tempSaveData.shopList.length);

      $("#searchBoxAS").val("");
    } else {
      this.manager.showToast(this.tostCtrl, "Message", "Choose some shops", 2000);
    }
  }

  removeShop(e, index){
    for(let j = 0; j < this.saveData.shopList.length; j++){
      if(this.saveData.shopList[j].n1 == this.tempShopList[index].n1){
        this.saveData.shopList.splice(j, 1);
        break;
      }
    }

    this.tempShopList.splice(index, 1);
  }

  // jun7RecordStatusChange(e, passData){
  //   if(passData.recordstatus == "1"){
  //     passData.recordstatus = "4";
  //   } else if(passData.recordstatus == "4"){
  //     passData.recordstatus = "1";
  //   }
  // }

  async jun7RecordStatusChange(e, passData){
    const loading = await this.loading.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
    });
    await loading.present();
    passData.userSyskey = this.manager.user.userSk;
    passData.userid = this.manager.user.userId;
    passData.username = this.manager.user.userName;
    const url = this.manager.appConfig.apiurl +'pricezone/jun7RecordStatusChange';

    this.http.post(url, passData, this.manager.getOptions()).subscribe(
      (data:any) =>{
        loading.dismiss();
        if(data.message == "SUCCESS"){
             if(passData.recordstatus == "1"){
                passData.recordstatus = "4";
              } else if(passData.recordstatus == "4"){
                passData.recordstatus = "1";
              }

          this.manager.showToast(this.tostCtrl, "Message", "Delete Successful!", 1000);
        } else {
          this.manager.showToast(this.tostCtrl, "Message", "Delete UnSuccessful!", 1000);
        }
      },
      error => {
        loading.dismiss();
        this.manager.showToast(this.tostCtrl, "Message", "Server Fail!", 1000);
      }
    );
  }

  async jun7StatusChange(e, passData){
    const loading = await this.loading.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
    });
    await loading.present();
    const url = this.manager.appConfig.apiurl +'pricezone/jun7StatusChange';

    this.http.post(url, passData, this.manager.getOptions()).subscribe(
      (data:any) =>{
        loading.dismiss();
        if(data.message == "SUCCESS"){
          if(passData.n3 == "0"){
            passData.n3 = "1";
          } else if(passData.n3 == "1"){
            passData.n3 = "0";
          }

          this.manager.showToast(this.tostCtrl, "Message", "Status changed", 1000);
        } else {
          this.manager.showToast(this.tostCtrl, "Message", "Status didn't change", 1000);
        }
      },
      error => {
        loading.dismiss();
        this.manager.showToast(this.tostCtrl, "Message", "Server Fail!", 1000);
      }
    );
  }  

  /*            Version 1
  searchShop(){
    this.townList = [];
    const url = this.manager.appConfig.apiurl +'shop/getAllShopByTown';

    this.http.post(url, this.tempSearch, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.townList = data.dataList;
          this.townList.sort((a, b) => (a.TownDesc > b.TownDesc) ? 1 : -1);

          for(let i = 0; i < this.townList.length; i++){
            this.townList[i].ShopDataList.sort((a, b) => (a.shopName > b.shopName) ? 1 : -1);
          }

          if(this.dtlFlag == true){
            this.getDetailShopData();
          }
        }
      }
    );
  }

  selectTown(e, tsIndex){
    let sameShopCheck = false;

    if(e.currentTarget.checked){
      for(let i = 0; i < this.townList[tsIndex].ShopDataList.length; i++){
        sameShopCheck = this.saveData.shopList.some(
          tempShopData => tempShopData.n1 == this.townList[tsIndex].ShopDataList[i].shopSysKey
        );

        if(sameShopCheck == false){
          this.selectShop(e, tsIndex, i);
        }
      }
    } else {
      for(let i = 0; i < this.townList[tsIndex].ShopDataList.length; i++){
        this.selectShop(e, tsIndex, i);
      }
    }
  }

  selectShop(e, tsIndex, shopIndex){
    let returnTempData = this.getShopData();
    let found = false;
    let tempIndex = 0;
    let cbid = "";

    for(let i = 0; i < this.saveData.shopList.length; i++){
      if(this.saveData.shopList[i].n1 == this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey){
        found = true;
        tempIndex = i;
        break;
      }
    }

    if(e.currentTarget.checked){
      if(found == false){
        returnTempData.syskey = "";
        returnTempData.n1 = this.townList[tsIndex].ShopDataList[shopIndex].shopSysKey;
        returnTempData.n2 = "0";
        returnTempData.n3 = "0";
        returnTempData.t1 = this.townList[tsIndex].ShopDataList[shopIndex].shopName;
        returnTempData.t2 = "";
        returnTempData.t3 = "";
        returnTempData.recordstatus = "1";
  
        this.saveData.shopList.push(returnTempData);
      } else {
        this.saveData.shopList[tempIndex].recordstatus = "1";
      }

      cbid = "#cb" + tsIndex + "and" + shopIndex;
      $(cbid).prop('checked', true);
    } else {
      if(found == true){
        if(this.saveData.shopList[tempIndex].syskey != "" && this.saveData.shopList[tempIndex].syskey != "0"){
          this.saveData.shopList[tempIndex].recordstatus = "4";
        } else {
          this.saveData.shopList.splice(tempIndex, 1);
        }
      
        cbid = "#cb" + tsIndex + "and" + shopIndex;
        $(cbid).prop('checked', false);
      }
    }
  }
  */
  
  async searchItem(){
    return new Promise<void>((resolve) => {
      this.itemList = [];
      const url = this.manager.appConfig.apiurl +'pricezone/getAllItemByCategory';
  
      this.http.post(url, this.tempSearch1, this.manager.getOptions()).subscribe(
        (data:any) =>{
          if(data.message == "SUCCESS"){
            console.log("item success");
            this.itemList = data.dataList;
            this.itemList.sort((a, b) => (a.CategoryDesc > b.CategoryDesc) ? 1 : -1);
  
            for(let i = 0; i < this.itemList.length; i++){
              this.itemList[i].subCatList.sort((a, b) => 
                (a.SubCategoryDesc > b.SubCategoryDesc) ? 1 : -1
              );
  
              for(let j = 0; j < this.itemList[i].subCatList.length; j++){
                this.itemList[i].subCatList[j].itemList.sort((a, b) => 
                  (a.ItemDesc > b.ItemDesc) ? 1 : -1
                );
              }
            }
  
            if(this.dtlFlag == true){
              this.getDetailItemData();
            }
  
            /*
            let tempItemList = [];
            let cbid = "";
            let checkFound = false;
            tempItemList = this.saveData.itemList.filter(
              d => {
                return (d.syskey == '' && d.n3 != '');
              }
            );
  
            for(let k = 0; k < tempItemList.length; k++){
              for(let l = 0; l < this.itemList.length; l++){
                for(let m = 0; m < this.itemList[l].subCatList.length; m++){
                  for(let n = 0; n < this.itemList[l].subCatList[m].itemList.length; n++){
                    if(this.itemList[l].subCatList[m].itemList[n].ItemSyskey == tempItemList[k].n1){
                      cbid = "#cb" + l + "and" + m + "and" + n;
                      $(cbid).val(tempItemList[k].n3);
  
                      checkFound = true;
                      break;
                    }
                  }
  
                  if(checkFound == true){
                    break;
                  }
                }
  
                if(checkFound == true){
                  break;
                }
              }
            }
            */
          }
          resolve();
        },
        error => {
          resolve();
        }
        
      );
    });

  }
  
  selectItem(e, catIndex, subCatIndex, itemIndex){
    let returnTempData = this.getItemData();
    let found = false;
    let tempIndex = 0;
    let changedPrice = e.target.value;

    for(let i = 0; i < this.saveData.itemList.length; i++){
      if(this.saveData.itemList[i].n1 == this.itemList[catIndex].subCatList[subCatIndex].itemList[itemIndex].ItemSyskey){
        found = true;
        tempIndex = i;
        break;
      }
    }

    if(changedPrice != "" && changedPrice != "0"){
      if(this.itemList[catIndex].subCatList[subCatIndex].itemList[itemIndex].Price == changedPrice){
        e.target.value = "";
        this.manager.showToast(this.tostCtrl, "Message", "Same Price Changed, Add again", 2000);
      } else {
        if(found == false){
          returnTempData.syskey = "";
          returnTempData.n1 = this.itemList[catIndex].subCatList[subCatIndex].itemList[itemIndex].ItemSyskey;
          returnTempData.n2 = this.itemList[catIndex].subCatList[subCatIndex].itemList[itemIndex].Price;
          returnTempData.n3 = changedPrice;
          returnTempData.n4 = "0";
          returnTempData.t1 = this.itemList[catIndex].subCatList[subCatIndex].itemList[itemIndex].ItemDesc;
          returnTempData.t2 = "";
          returnTempData.t3 = "";
          returnTempData.recordstatus = "1";
    
          this.saveData.itemList.push(returnTempData);
        } else {
          this.saveData.itemList[tempIndex].n3 = changedPrice;
          this.saveData.itemList[tempIndex].recordstatus = "1";
        }
      }
    } else {
      if(found == true){
        if(this.saveData.itemList[tempIndex].syskey != "" && this.saveData.itemList[tempIndex].syskey != "0"){
          this.saveData.itemList[tempIndex].recordstatus = "4";
          this.saveData.itemList[tempIndex].n3 = "0";
        } else {
          this.saveData.itemList.splice(tempIndex, 1);
        }
      }
    }
  }

  async getAllDataList(){
    return new Promise<void>((resolve) => {
      this.criteria = this.getCriteriaData();
      this.criteria.maxRows = this.config.itemsPerPage;
      this.criteria.current = "0";
  
      const url = this.manager.appConfig.apiurl + 'pricezone/getAllPriceZoneList';
  
      this.http.post(url, this.criteria, this.manager.getOptions()).subscribe(
        (data:any) =>{
          if(data.message == "SUCCESS"){
            this.config.totalItems = data.rowCount;
            this.config.currentPage = 1;
  
            this.headerList = data.dataList;
  
            for(var i = 0; i < this.headerList.length; i++){
              this.headerList[i].t3 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.headerList[i].t3);
              this.headerList[i].t4 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.headerList[i].t4);
            }
          }
          resolve();
        },
        error => {
          resolve();
        }
      );
    });
  }

  async search(currIndex, criFlag){
    const loading = await this.loading.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
    });
    await loading.present();
    this.searchCriteria.maxRows = this.config.itemsPerPage;
    this.searchCriteria.current = currIndex;

    const url = this.manager.appConfig.apiurl + 'pricezone/getAllPriceZoneList';
    // if(this.criteria.fromDate != ""){
    //   this.criteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
    // }
    // if(this.criteria.toDate != ""){
    //   this.criteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
    // }

    if(criFlag == true){
      this.searchCriteria.desc = this.criteria.desc;
      this.searchCriteria.itemName = this.criteria.itemName;
      this.searchCriteria.shopName = this.criteria.shopName;

      if(this.criteria.fromDate != ""){
        this.searchCriteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
      } else {
        this.searchCriteria.fromDate = "";
      }
      
      if(this.criteria.toDate != ""){
        this.searchCriteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
      } else {
        this.searchCriteria.toDate = "";
      }

      if(this.criteria.validDate != ""){
        this.searchCriteria.validDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.validDate);
      } else {
        this.searchCriteria.validDate = "";
      }
    }
    
    this.http.post(url, this.searchCriteria, this.manager.getOptions()).subscribe(
      (data:any) =>{
        loading.dismiss();
        if(data.message == "SUCCESS"){
          this.config.totalItems = data.rowCount;

          if(currIndex == 0){
            this.config.currentPage = 1;
          }

          this.headerList = data.dataList;

          for(var i = 0; i < this.headerList.length; i++){
            this.headerList[i].t3 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.headerList[i].t3);
            this.headerList[i].t4 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.headerList[i].t4);
          }
        }
      },
      error => {
        loading.dismiss();
        this.manager.showToast(this.tostCtrl, "Message", "Server Fail!", 1000);
      }
    );
  }

  validation(){
    if(this.saveData.t1 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Code", 2000);
      return false;
    }

    if(this.saveData.t2 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Description", 2000);
      return false;
    }

    if(this.saveData.t3 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Start Date", 2000);
      return false;
    }

    if(this.saveData.t4 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add End Date", 2000);
      return false;
    }

    if(this.saveData.itemList.length < 1){
      this.manager.showToast(this.tostCtrl, "Message", "Add Stock", 2000);
      return false;
    }

    if(this.saveData.shopList.length < 1){
      this.manager.showToast(this.tostCtrl, "Message", "Add Shop", 2000);
      return false;
    }

    return true;
  }

  async save(){
    const loading = await this.loading.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
    });
    
    const url = this.manager.appConfig.apiurl +'pricezone/save';

    if(this.validation()){
      await loading.present();
      let tempFD: any;
      let tempTD: any;
      tempFD = this.saveData.t3;
      tempTD = this.saveData.t4;

      this.saveData.t3 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.saveData.t3);
      this.saveData.t4 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.saveData.t4);
      this.saveData.shopList = this.tempSaveShopList;
      
      this.http.post(url, this.saveData, this.manager.getOptions()).subscribe(
        (data:any) =>{
          loading.dismiss();
          if(data.message == "SUCCESS"){
            this.manager.showToast(this.tostCtrl, "Message", "Save Successful", 1000);
            if(data.existedItemList == ""){
              this.manager.showToast(this.tostCtrl, "Message", "Save Successful", 1000);
            } else {
              let temp_str = "Save Successful<br>The following items are already in Price Zone:<br>" + data.existedItemList;
              this.manager.showToast(this.tostCtrl, "Message", temp_str, 5000);
            }
  
            $("#priceZoneNew").hide();
            $("#priceZoneList").show();
            $("#priceZoneList-tab").tab("show");
  
            this.btn = false;
            this.dtlFlag = false;
  
            this.clearProperties();
            this.allList();
            this.runSpinner(true);
            this.getAllDataList().then(()=>{
              this.runSpinner(false);
            })

          } else if(data.message == "CODEEXISTED"){
            this.manager.showToast(this.tostCtrl, "Message", "Price Zone Code Already Existed", 2000);
            $('#savePriceZoneCode').css('border-color', 'red');
            this.saveData.t3 = tempFD;
            this.saveData.t4 = tempTD;
          } else if(data.message == "FAIL"){
            if(data.existedItemList == ""){
              this.manager.showToast(this.tostCtrl, "Message", "Save Failed", 2000);
            } else {
              let temp_str = "Save Failed<br>The following items are already in Price Zone:<br>" + data.existedItemList;
              this.manager.showToast(this.tostCtrl, "Message", temp_str, 5000);
            } 
            this.saveData.t3 = tempFD;
            this.saveData.t4 = tempTD;           
          }
        },
        error => {
          loading.dismiss();
          this.manager.showToast(this.tostCtrl, "Message", "Server Fail!", 1000);
        }
      );
    }
  }

  detail(event, index){
    $("#priceZoneNew").show();
    $("#priceZoneList").hide();
    $("#priceZoneNew-tab").tab("show");
    
    $('#priceZoneHdr-tab').tab('show');
    $('#priceZoneHdr').show();
    $('#priceZoneShopList').hide();

    // this.searchShop();

    this.btn = true;
    this.dtlFlag = true;

    this.saveData.syskey = this.headerList[index].syskey;
    this.saveData.t1 = this.headerList[index].t1;
    this.saveData.t2 = this.headerList[index].t2;
    this.saveData.t3 = this.manager.dateFormatCorrector(this.manager.dateFormatter.UItoDTP, this.headerList[index].t3);
    this.saveData.t4 = this.manager.dateFormatCorrector(this.manager.dateFormatter.UItoDTP, this.headerList[index].t4);
    
    this.saveData.itemList = [];
    this.saveData.shopList = [];

    const url = this.manager.appConfig.apiurl + 'pricezone/getDetailShopData';
    let sendTempData = {
      "HeaderSyskey": this.headerList[index].syskey,
      "townCheck": "a"
    };

    this.loading.create({
      message: "Processing..",
     
      backdropDismiss: false
    }).then(
      el => {
        el.present();
        this.http.post(url, sendTempData, this.manager.getOptions()).subscribe(
          (data:any) =>{
            if(data.message == "SUCCESS"){
              let returnTempJuncDataList = [];
              returnTempJuncDataList = data.dataList;

              let returnTempJuncData = this.getShopData();
              for(let i = 0; i < returnTempJuncDataList.length; i++){
                returnTempJuncData = this.getShopData();
          
                returnTempJuncData.syskey = returnTempJuncDataList[i].syskey;
                returnTempJuncData.recordstatus = "1";
                returnTempJuncData.n1 = returnTempJuncDataList[i].n1;
                returnTempJuncData.n2 = returnTempJuncDataList[i].n2;
                returnTempJuncData.n3 = returnTempJuncDataList[i].n3;
                returnTempJuncData.t1 = returnTempJuncDataList[i].t1;
                returnTempJuncData.t2 = returnTempJuncDataList[i].t2;
                returnTempJuncData.t3 = "";
                returnTempJuncData.townSyskey = returnTempJuncDataList[i].townSyskey;
                returnTempJuncData.shopCode = returnTempJuncDataList[i].shopCode;
                returnTempJuncData.address = returnTempJuncDataList[i].address;
          
                this.saveData.shopList.push(returnTempJuncData);
                this.tempShopList.push(returnTempJuncData);
              }
              this.saveData.shopList.sort((a, b) => (a.t1 > b.t1) ? 1 : -1);
              this.tempShopList.sort((a, b) => (a.t1 > b.t1) ? 1 : -1);
    
              this.searchTownship();
              this.searchItem().then(()=>{
                el.dismiss();
              })
  


              // this.tempShopList = this.saveData.shopList;
            }
          }
        );
      }
    );

    // this.searchShop();

    // this.searchItem();
    
  }
  
  getDetailItemData(){
    const url = this.manager.appConfig.apiurl + 'pricezone/getDetailItemData';
    let sendTempData = {
      "HeaderSyskey": this.saveData.syskey
    };

    this.http.post(url, sendTempData, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          let samePriceCheck = false;
          let samePriceIndex = 0;

          let returnTempDataList = [];
          let returnTempData = this.getItemData();

          returnTempDataList = data.dataList;

          for(let i = 0; i < returnTempDataList.length; i++){
            returnTempData = this.getItemData();

            returnTempData.syskey = returnTempDataList[i].syskey;
            returnTempData.t1 = returnTempDataList[i].t1;
            returnTempData.t2 = returnTempDataList[i].t2;
            returnTempData.n1 = returnTempDataList[i].n1;
            returnTempData.n2 = returnTempDataList[i].n2;
            returnTempData.n3 = returnTempDataList[i].n3;
            returnTempData.n4 = returnTempDataList[i].n4;
            returnTempData.recordstatus = "1";

            for(let j = 0; j < this.saveData.itemList.length; j++){
              if(this.saveData.itemList[j].syskey == returnTempData.syskey){
                samePriceCheck = true;
                samePriceIndex = j;
                break;
              }
            }

            if(samePriceCheck == false){
              this.saveData.itemList.push(returnTempData);
            } else {
              returnTempData.n3 = this.saveData.itemList[samePriceIndex].n3;
            }

            let checkFound: boolean = false;
            let cbid = "";
            for(let l = 0; l < this.itemList.length; l++){
              for(let m = 0; m < this.itemList[l].subCatList.length; m++){
                for(let n = 0; n < this.itemList[l].subCatList[m].itemList.length; n++){
                  if(this.itemList[l].subCatList[m].itemList[n].ItemSyskey == returnTempData.n1){
                    cbid = "#cb" + l + "and" + m + "and" + n;
                    $(cbid).val(returnTempData.n3);

                    checkFound = true;
                    break;
                  }
                }

                if(checkFound == true){
                  break;
                }
              }

              if(checkFound == true){
                break;
              }
            }
          }
        }
      }
    );
  }

  /*
  getDetailShopData(){
    const url = this.manager.appConfig.apiurl + 'pricezone/getDetailShopData';
    let sendTempData = {
      "HeaderSyskey": this.saveData.syskey
    };

    this.http.post(url, sendTempData, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          let returnTempDataList = [];
          let returnTempData = this.getShopData();

          returnTempDataList = data.dataList;

          for(let i = 0; i < returnTempDataList.length; i++){
            returnTempData = this.getShopData();

            returnTempData.syskey = returnTempDataList[i].syskey;
            returnTempData.t1 = returnTempDataList[i].t1;
            returnTempData.t2 = returnTempDataList[i].t2;
            returnTempData.n1 = returnTempDataList[i].n1;
            returnTempData.n2 = returnTempDataList[i].n2;
            returnTempData.recordstatus = "1";

            this.saveData.shopList.push(returnTempData);

            let checkFound: boolean = false;
            let cbid = "";
            for(let j = 0; j < this.townList.length; j++){
              for(let k = 0; k < this.townList[j].ShopDataList.length; k++){
                if(this.townList[j].ShopDataList[k].shopSysKey == returnTempData.n1){
                  cbid = "#cb" + j + "and" + k;
                  $(cbid).prop('checked', true);

                  checkFound = true;
                  break;
                }
              }

              if(checkFound == true){
                break;
              }
            }
          }
        }
      }
    );
  }
  */

  goDelete(){
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
    const url = this.manager.appConfig.apiurl + 'pricezone/delete';
    this.http.post(url, this.saveData, this.manager.getOptions()).subscribe(
      (data:any) =>{
        el.dismiss();
        if(data.message == "SUCCESS"){
          this.manager.showToast(this.tostCtrl, "Message", "Delete Successful", 1000);
  
          $("#priceZoneNew").hide();
          $("#priceZoneList").show();
          $("#priceZoneList-tab").tab("show");

          this.btn = false;
          this.dtlFlag = false;

          this.clearProperties();
          this.allList();
          this.getAllDataList();
        } else if(data.message == "FAIL"){
          this.manager.showToast(this.tostCtrl, "Message", "Delete Failed", 1000);
        } else {
          this.manager.showToast(this.tostCtrl,"Message","Deleting Fail!",1000);
        }
      },
      (error: any) => {
        this.manager.showToast(this.tostCtrl,"Message","Deleting Fail!",1000);
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

  pageChanged(e){
    this.config.currentPage = e;

    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.search(currentIndex, false);
  }

  shopListPageChanged(e, townshipInfo){
    townshipInfo.shopListConfig.currentPage = e;

    let currentIndex = (townshipInfo.shopListConfig.currentPage - 1) * townshipInfo.shopListConfig.itemsPerPage;
    this.searchShop(currentIndex.toString(), townshipInfo.shopListConfig.currentPage, townshipInfo.TownSyskey);
  }

  clearProperties(){
    this.criteria = this.getCriteriaData();
    this.searchCriteria = this.getCriteriaData();
    this.saveData = this.getSaveData();
    this.townList = [];
    this.itemList = [];

    this.tempShopList = [];
    this.tempSaveShopList = [];

    this.dtlFlag = false;

    this.tempSearch = {
      "shopDesc": "",
      "townshipDesc": ""
    };
    this.tempSearch1 = {
      "category": "",
      "subCategory": "",
      "item": ""
    };
  }

  allList(){
    this.itemSearch.valueChanges.subscribe(
      term => {
        this.manager.stockNameSearchAutoFill(term).subscribe(
          data => {
            this.stockList = data as any[];
            this.stockList.sort((a, b) => (a.skuName > b.skuName) ? 1 : -1);
          }
        );
      }
    );

    this.shopSearch.valueChanges.subscribe(
      term => {
        this.manager.shopNameSearchAutoFill(term).subscribe(
          data => {
            this.shopList = data as any[];
            this.shopList.sort((a, b) => (a.shopName > b.shopName) ? 1 : -1);
          }
        );
      }
    );

    // let url = "";
    // let params = {};

    // url = this.manager.appConfig.apiurl + 'PromoAndDiscount/disTypeSearchAutoFill';
    // params = {
    //   "discountPercent": ""
    // };
    // this.http.post(url, params, this.manager.getOptions()).subscribe(
    //   (data:any) =>{
    //     if(data.message == "SUCCESS"){
    //       this.disPercentList = data.dataList;
    //     }
    //   }
    // );
  }

  getCriteriaData(){
    return {
      "code": "",
      "desc": "",
      "fromDate": "",
      "toDate": "",
      "validDate": "",
      "shopName": "",
      "itemName": "",
      "current": "",
      "maxRows": ""
    };
  }

  getShopListPageChangeData(){
    return {
      "shopDesc": "",
      "townDesc": "",
      "townshipSyskey": "",
      "maxRow": this.shopListItemPerPage,
      "current": "0"
    };
  }

  getSaveData(){
    return {
      "syskey": "",
      "userSyskey": sessionStorage.getItem("usk"),
      "userid": sessionStorage.getItem("uid"),
      "username": sessionStorage.getItem("uname"),
      "n1": "0",
      "n2": "0",
      "n3": "0",
      "t1": "",
      "t2": "",
      "t3": "",
      "t4": "",
      "itemList": [],
      "shopList": []
    };
  }

  getItemData(){
    return {
      "syskey": "",
      "n1": "0",
      "n2": "0",
      "n3": "0",
      "n4": "0",
      "t1": "",
      "t2": "",
      "t3": "",
      "recordstatus": ""
    };
  }

  getShopData(){
    return {
      "syskey": "",
      "n1": "0",
      "n2": "0",
      "n3": "0",
      "t1": "",
      "t2": "",
      "t3": "",
      "recordstatus": "",
      "townSyskey": "",
      "shopCode": "",
      "address": ""
    };
  }
}