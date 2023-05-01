import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ControllerService } from '../controller.service';
import { FormBuilder, } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatStepper } from '@angular/material/stepper';
import { promise } from 'protractor';
import { ToastController } from '@ionic/angular';
import { thistle, oldlace } from 'color-name';
declare var $: any;
@Component({
  selector: 'app-merchandizing',
  templateUrl: './merchandizing.page.html',
  styleUrls: ['./merchandizing.page.scss'],
})
export class MerchandizingPage implements OnInit,AfterViewInit {
  @ViewChild('stepper', { static: false }) stepper: MatStepper
  shopList: any = [];
  tmpShopList = [];
  campaignList: any = [];
  tmpCam = [];
  param = [];
  mc002list = [];
  mc003list = [];
  piclist = [];
  editable = true;
  loading = false;

  selectShop: any = '';
  selectTran: any = '';
  selectCampain: any = '';
  isLinear = true;
  isComplete: any= this.getFormControl();
  
  abc: any = [
    { txt: 'A', value: 'a' },
    { txt: 'B', value: 'b' },
    { txt: 'C', value: 'c' },
    { txt: 'D', value: 'd' },
    { txt: 'E', value: 'e' },
    { txt: 'F', value: 'f' },
    { txt: 'G', value: 'g' },
    { txt: 'H', value: 'h' },
    { txt: 'I', value: 'i' },
    { txt: 'J', value: 'j' },
    { txt: 'K', value: 'k' },
    { txt: 'L', value: 'l' },
    { txt: 'M', value: 'm' },
    { txt: 'N', value: 'n' },
    { txt: 'O', value: 'o' },
    { txt: 'P', value: 'p' },
    { txt: 'Q', value: 'q' },
    { txt: 'R', value: 'r' },
    { txt: 'S', value: 's' },
    { txt: 'T', value: 't' },
    { txt: 'U', value: 'u' },
    { txt: 'V', value: 'v' },
    { txt: 'W', value: 'w' },
    { txt: 'X', value: 'x' },
    { txt: 'Y', value: 'y' },
    { txt: 'Z', value: 'z' }


  ]
  constructor(
    public manager: ControllerService,
    private _formBuilder: FormBuilder,
    private http: HttpClient,
    private tostCtrl: ToastController
  ) {
    this.manager.isLoginUser();
  }
  ngAfterViewInit(){

  }

  ngOnInit() {
    this.manager.isLoginUser();

  }
  async ionViewWillEnter() {
    this.manager.isLoginUser();
    this.stepper.reset();
    await this.getShopList();
    this.loading = false;
  }
  getFormControl(){
    return{
      step1: false,
      step2: false,
      step3: false
    }
  }
  changeShop(){
    this.shopList = this.tmpShopList.filter(e=>{
      if(e.shopname.toLowerCase().includes(this.selectShop.toLowerCase())){
        return e;
      }else{
        this.shopList = this.tmpShopList;
      }
    })
   // this.shopList.sort((a, b) => (a.Code > b.Code) ? 1 : -1);
  }
  changeCampain(){
    
    this.mc002list =    this.tmpCam.filter(e=>{
      if(e.t1.toLowerCase().includes(this.selectCampain.toLowerCase())){
        return e;
      }else{
        this.mc002list =    this.tmpCam;
      }
    })
  }
  dropdown(a) {
    $('#abcbtn').text = a;
  }
  async chooseShopClick(index) {
    let shopid = this.shopList[index].shopsyskey;
    this.mc002list = [];
    await this.getCampaignByShopid(shopid);
    this.loading = false;
    this.isComplete.step1 = true;
    this.stepper.next();
    for(let i=0; i<this.mc002list.length; i++){
      this.tmpCam.push(this.mc002list[i]);
    }

  }
  async campaignClick(index) {
    this.piclist = [];
    this.mc003list = [];
    let cam = this.mc002list[index];
    await this.addMC003(cam);
    this.stepper.next();

  }
  async taskClick(index) {
    this.loading = true;
    this.piclist = [];
    let task = this.mc003list[index];
    await this.addPicList(task);
    await this.readPicByPath();
    this.loading = false;
    this.isComplete.step2 = true;
    if(this.piclist.length==0) $('#picTxt').text('No photo');
  //  alert('ok');
  }
  addPicList(task) {
    return new Promise<void>(promise => {
      task.pictureData.forEach(pic => {
        this.piclist.push(pic);
      });
      promise();
    })
  }
  readPicByPath(){
    return new Promise<void>(promise=>{
      this.piclist.forEach( async pic => {
        await this.readPic(pic);
      });
      promise();
    })
  }
  readPic(pic){
    let param = { imgpath : pic.t3 }
    const url = this.manager.appConfig.apiurl + 'campaign/getpic';
    return new Promise<void>( promise=>{
      this.http.post(url,param,this.manager.getOptions()).subscribe(
        (datas:any)=>{
          console.log(datas);
          pic.modifiedDate = datas.data;
          promise();
        },error=>{
          console.log(error);
          pic.modifiedDate = '';
          promise();
        }
      )
    })
  }
  addMC003(cam) {
    return new Promise<void>(promise => {
      cam.mc003.forEach(item => {
        item.complete = false;
        this.mc003list.push(item);
      });
      promise();
    });
  }
  getCampaignByShopid(shopid) {
    this.loading = true;
    const url = this.manager.appConfig.apiurl + 'campaign/getcampaignlist/' + shopid;
    return new Promise<void>(promise => {
      let sub = this.http.get(url, this.manager.getOptions()).subscribe(
        (data: any) => {
          console.log(data[0].lmc002[0].mc003[0].pictureData[0].t3);
          this.campaignList = data;
          this.campaignList.forEach(el => {
            el.lmc002.forEach(l02 => {
              l02.createdDate = 
              this.manager.formatDate(new Date(this.manager.formatDateByDb(l02.createdDate)),'dd-MM-yyyy')
              this.mc002list.push(l02);
            });;
          });
          promise();
        },
        error => {
          promise();
        }
      )
    })

  }
  getShopList() {
    this.loading = true;
    this.shopList = [];
    this.tmpShopList = [];
    const url = this.manager.appConfig.apiurl + 'campaign/getshoplist';
    return new Promise<void>(promise => {
      let sub = this.http.get(url, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.shopList = data;
          this.tmpShopList = data;
          promise();
        },
        errror => {
          promise();
        }
      )
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
    return new Promise<void>(promise=>{
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
             
                this.getShopList();
                this.loading = false;
                this.stepper.reset();
            }
          )
        }
      )
    })
  }

}
