import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient } from '@angular/common/http';
import { LoadingController, ToastController } from '@ionic/angular';


@Component({
  selector: 'app-merchandize',
  templateUrl: './merchandize.page.html',
  styleUrls: ['./merchandize.page.scss'],
})
export class MerchandizePage implements OnInit, AfterViewInit {
  selectShop: any = "";
  shopList: any = [];
  searchShopList: any = [];
  campaignList: any = [];
  tmpCam = [];
  param = [];
  mc002list = [];
  mc003list = [];
  piclist = [];
  editable = true;
  loading = false;

  clickableTask:any  = {t1:""}

  selectCampain: any = '';
  campaignDetail: any = "";
  url: any = 'http://13.75.117.213:8084/';
  constructor(private manager: ControllerService, private http: HttpClient, 
    private loadCtrl: LoadingController,
    private tostCtrl: ToastController) { }

  ngOnInit() {

  }
  ngAfterViewInit() {
    //  new CBPGridGallery( document.getElementById( 'grid-gallery' ) );

  }
  async ionViewWillEnter() {
    this.manager.isLoginUser();
    await this.getShopList();
    this.selectShop = -1;
    this.selectCampain = -1;
    this.campaignDetail = "";
    this.mc003list = [];
    this.piclist = [];
  }
  async taskClick(index) {
    this.loading = true;
    this.piclist = [];
    let task = this.mc003list[index];
    this.clickableTask.t1 = task.t1;
    console.log(this.clickableTask);
    await this.addPicList(task);
    await this.readPicByPath();
    console.log(this.piclist)
  }
  addPicList(task) {
    return new Promise(promise => {
      task.pictureData.forEach(pic => {
        this.piclist.push(pic);
      });
      promise();
    })
  }
  readPicByPath() {
    return new Promise(promise => {
      this.piclist.forEach(pic => {
        this.manager.appConfig.apiurl.replace("auderbox//", "");

      });
      promise();
    })
  }
  getCampaignDetail() {
    return {
      brandOwnerId: "",
      campaignId: "",
      createdDate: "",
      modifiedDate: ""
    }
  }
  addMC003(cam) {
    return new Promise(promise => {
      cam.mc003.forEach(item => {
        item.complete = false;
        this.mc003list.push(item);
      });
      promise();
    });
  }
  async campaignClick() {
    this.piclist = [];
    this.mc003list = [];
    let cam = this.mc002list[parseInt(this.selectCampain)];
    this.campaignDetail = cam;
    await this.addMC003(cam);

  }
  async chooseShopClick() {
    let index = this.selectShop;
    if (index == '') return;
    let shopid = this.shopList[parseInt(index)].shopsyskey;
    this.mc002list = [];
    await this.getCampaignByShopid(shopid);

    for (let i = 0; i < this.mc002list.length; i++) {
      this.tmpCam.push(this.mc002list[i]);
    }

  }
  getCampaignByShopid(shopid) {
    this.loadCtrl.create({ message: "Getting campaign..", duration: 5000 }).then(
      el => {
        el.present();
        const url = this.manager.appConfig.apiurl + 'campaign/getcampaignlist/' + shopid;
        return new Promise(promise => {
          let sub = this.http.get(url, this.manager.getOptions()).subscribe(
            (data: any) => {
              this.campaignList = data;
              this.campaignList.forEach(el => {
                el.lmc002.forEach(l02 => {
                  l02.createdDate =
                    this.manager.formatDate(new Date(this.manager.formatDateByDb(l02.createdDate)), 'dd-MM-yyyy')
                  this.mc002list.push(l02);
                });;
              });
              el.dismiss();
              promise();
            },
            error => {
              el.dismiss();
              promise();
            }
          )
        })
      }
    )
    this.loading = true;


  }
  getShopList() {

    this.loadCtrl.create(
      {
        message: "Getting shops..",
        duration: 10000
      }
    ).then(el => {
      el.present();
      this.shopList = [];
      const url = this.manager.appConfig.apiurl + 'campaign/getshoplist';
      return new Promise(promise => {
        let sub = this.http.get(url, this.manager.getOptions()).subscribe(
          (data: any) => {
            this.shopList = data;
            this.searchShopList = data;
            el.dismiss();
            promise();
          },
          errror => {
            el.dismiss();
            promise();
          }
        )
      })
      el.onDidDismiss().then(dis => {

      })
    })

  }
  async saveTask(){
    await this.prepare();
    await this.save();
  }
  prepare(){
    this.param = [];
    let i=0;
    let len = this.mc003list.length;
    return new Promise(promise=>{
      this.mc003list.forEach( e=>{
        i++;
      if(e.complete == true){
        let p = {
          syskey:e.syskey
        };
        this.param.push(p);
      }
    });
    promise();
    }) 
  }
  save(){
    console.log(this.param);

    return new Promise(promise=>{
      const url =  this.manager.appConfig.apiurl + 'campaign/savetaskcomplete';
      let body = {
        list: this.param
      }
      this.http.post(url,body,this.manager.getOptions()).subscribe(
        (data:any)=>{
          console.log(data);
          this.param = [];
          this.manager.showToast(this.tostCtrl,"Message", data.message,2000).then(
            e=>{
                this.selectCampain = -1;
                this.mc003list = []
                this.piclist = [];
                //this.getShopList();
            }
          )
        }
      )
    })
  }
}
