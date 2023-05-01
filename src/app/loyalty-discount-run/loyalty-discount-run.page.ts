import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { ControllerService } from '../controller.service';
declare var $: any;

@Component({
  selector: 'app-loyalty-discount-run',
  templateUrl: './loyalty-discount-run.page.html',
  styleUrls: ['./loyalty-discount-run.page.scss'],
})
export class LoyaltyDiscountRunPage implements OnInit {
  page = {
    main_spinner: false
  }
  service = {
    shopList: [],
    account: this.getAccountData(),
    headerList  : [],
    activeShop: '',
    discountItem:[]
  }
  tranObject:any = this.getAccountData();
  private url_shoplist = this.manager.appConfig.apiurl + 'loyalty-discount/get-promotionshops';
  private url_getAccount = this.manager.appConfig.apiurl + 'loyalty-discount/get-account/';
  private url_run = this.manager.appConfig.apiurl + 'loyalty-discount/run-promotion';
  private url_getHeader = this.manager.appConfig.apiurl + 'loyalty-discount/get-avariable-headers';
  private url_getDetail = this.manager.appConfig.apiurl + 'loyalty-discount/get-avariable-detail/';
  private url_savePromotionTran = this.manager.appConfig.apiurl + 'loyalty-discount/save-promotion-transaction';

  constructor(private manager: ControllerService,
    private tostCtrl: ToastController,
    private http: HttpClient,
    private loadCtrl: LoadingController) { }

  ngOnInit() {
  }
  async ionViewWillEnter() {
    this.manager.isLoginUser();
    $('#loyaltyrun-list-tab').tab('show');
    this.page.main_spinner = true;
    await this.getPromotionShopList();
    this.page.main_spinner = false;
  }
  private getAccountData() {
    return {
      'syskey': '',
      'createdDate': '',
      'modifiedDate': '',
      'userId': '',
      'userName': '',
      'recordStatus': 0,
      'saveStatus': 0,
      't1': '',
      't2': '',
      't3': '',
      't4': '',
      'n1': '',
      'n2': '',
      'n3': '',
      'n4': '',
      'n5': '',
      'n6': 0.0,
      'n7': 0.0,
      'n8': 0.0,
      'n9': 0.0,
      'n10': 0.0,
      'n11': 0,
      'n12': 0,
      'n13': 0,
      'n14': 0,
      'n15': 0,
      'detail': [],
      'shopDetail':{
        'shopCode':'',
        'shopName':'',
        'address':''
      }
    }
  }
  private getPromotionShopList() {
    return new Promise(done => {
      this.http.get(this.url_shoplist, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          if (data.status == 'SUCCESS') {
            this.service.shopList = data.dataList;
          }
        },
        error=>{
          done();
        }
      )
    })

  }
  async detail(shop) {
    
    this.service.activeShop = shop;
    this.page.main_spinner = true;
    await this.getAccount(shop.shopSysKey);
    await this.getHeader(shop.shopSysKey);
    this.page.main_spinner = false;
    $('#loyaltyrun-new-tab').tab('show');


  }
  getAccount(shopId) {
    return new Promise(done => {
      this.http.get(this.url_getAccount + shopId, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          if (data.status == 'SUCCESS') {
            this.service.account = data.data as any;
        
          } else {

          }
        },
        error => {
          done();
        }
      )
    })

  }
  private getHeader(shopId){
    return new Promise(done=>{
      this.http.post(this.url_getHeader, {
        'storeId': shopId
      }, this.manager.getOptions()).subscribe(
        (data: any) => {
          if (data.status == 'SUCCESS') {
            this.service.headerList = data.dataList.map(e => {
              try {
                e.t3 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoDTP, e.t3);
                e.t4 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoDTP, e.t4);
                e.t5 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoDTP, e.t5);
                e.t6 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoDTP, e.t6);
              } catch {
                e.t3 = '';
                e.t4 = '';
                e.t5 = '';
                e.t6 = '';
              }
              return e;
            })
          } else {
          }
          done();
        },
        error => {
          done();
        }
      )
    })
    
  }
  private getDetailsByHeader(index){
    let header = this.service.headerList[index];
    if(header.detail.length > 0) return;
    return new Promise(done=>{
      this.http.get( this.url_getDetail + header.syskey,this.manager.getOptions()).subscribe(
        (data:any)=>{
          done();
          if(data.status == 'SUCCESS'){
            console.log(data.dataList)
            this.service.headerList[index].detail = data.dataList;
          }
        },
        error=>{
          done();
        }
      )
    })
  }
  async detailExtensionPanelOpen(index){
    this.page.main_spinner = true;
    await this.getDetailsByHeader(index);
    this.page.main_spinner = false;
  }
  run() {
    this.loadCtrl.create({
      message:'Processing..',
      backdropDismiss:false
    }).then( el=>{
      el.present();
      this.http.post(this.url_run, this.service.account, this.manager.getOptions()).subscribe(
        (data: any) => {
          el.dismiss();
          if (data.status == 'SUCCESS') {
                this.tranObject = data.data;
                this.tranObject.detail = this.tranObject.detail.filter( accDetail=>{
                  return accDetail.promotionTransaction!==null && accDetail.promotionTransaction !== undefined;
                });
                if(this.tranObject.detail.length > 0)
                $('#preview-promotion-modal').appendTo("body").modal('show');
                else this.manager.showToast(this.tostCtrl, "Message", "Amount not enough!",1000).then(
                  e=>{
                    
                  }
                )
             
          } else {
            this.manager.showToast(this.tostCtrl, data.status, data.cause,1000,'danger').then(
              e=>{
                
              }
            )
          }
        },
        error => {
          el.dismiss();
          console.log("error");
        }
      )
    })
   
  }
  public savePromotion(){
    $('#preview-promotion-modal').appendTo("body").modal('hide');
    this.loadCtrl.create({
      message:"Processing..",
      backdropDismiss:false
    }).then(
      el=>{
        el.present();
        this.http.post(this.url_savePromotionTran,this.tranObject,this.manager.getOptions()).subscribe(
          (data:any)=>{
            el.dismiss();
            if(data.status == "SUCCESS"){
              this.manager.showToast(this.tostCtrl,'Message','Success',1000).then(
                e=>{

                  this.loadCtrl.create({
                    message:"Updating account info..",
                    backdropDismiss:false
                  }).then(
                    async ep=>{
                      ep.present();
                      await this.getAccount( (this.service.activeShop as any).shopSysKey);
                      ep.dismiss();
                    }
                  )
                  
                }
              );
            }else{
              this.manager.showToast(this.tostCtrl, data.status, data.cause,1000,'danger').then(
                e=>{
                  
                }
              )
            }
          }
        )
      }
    )
    
  }
}
