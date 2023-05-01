import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient } from '@angular/common/http';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
declare var $: any;
@Component({
  selector: 'app-brand',
  templateUrl: './brand.page.html',
  styleUrls: ['./brand.page.scss'],
})
export class BrandPage implements OnInit {


  list: any = [];
  bolist: any = [];
  obj: any = this.getObj();
  btn:boolean = false;
  brandownerid: any = "0";
  searchtab :boolean = false;
  spinner: boolean = false;
  search_param = this.getDefaultSearchObject();
  delete_param = this.getDefaultDeleteObject();

  constructor(
    public manager: ControllerService,
    public http: HttpClient,
    public loading: LoadingController,
    public alertController: AlertController,
    public tost: ToastController
  ) { }

  ngOnInit() {
    this.manager.isLoginUser();
    
  }

  async ionViewWillEnter() {
    this.manager.isLoginUser();
    this.search_param = this.getDefaultSearchObject();
    this.getAll();
    this.getBrandOwner();
    this.btn = false;
    $('#blist-tab').tab('show');
  }

  listTab(){
    this.ionViewWillEnter();
  }
  newTabClick(e){
    this.searchtab = false;
    this.obj = this.getObj();
  }
  tab(e){

  }
  detailTab() {
    this.btn = true;
    this.obj = this.getObj();
    this.getBrandOwner();
    $('#bnew-tab').tab('show');
    console.log(this.btn);
  }
  getAll() {
    this.btn = false;
    this.spinner = true;
    if (this.manager.user.orgId.length == 0) return;
    let status = "";
        const url = this.manager.appConfig.apiurl + 'brand/searchBrandList';
        var param = { "codeType": this.search_param.codeType, "code": this.search_param.code, "descriptionType": this.search_param.descriptionType, "description": this.search_param.description, "currentPage": 1, "pageSize": 0, "bosyskey":this.search_param.bosyskey};
        var subscribe = this.http.post(url, param, this.manager.getOptions()).subscribe(
          (data: any) => {
            this.list = data.brandlistdata;
            this.spinner = false;
          }
        )
  }
  getBrandOwner() {
    if (this.manager.user.orgId.length == 0) return;
    let status = "";
    const url = this.manager.appConfig.apiurl + 'brandowner/getbrandowner';
    var param = {
      code: ""
    }
    var subscribe = this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.bolist = data.dataList;

        if(this.bolist.length){          
          if(this.brandownerid == "0" || this.brandownerid == "" ){
            this.brandownerid = this.bolist[0].syskey;
          }else{
            for (let i = 0; i < this.bolist.length; i++) {
              if(this.bolist[i].syskey == this.brandownerid){
                this.brandownerid = this.bolist[i].syskey;
              }
            }
          }
        }
       
      }
    )
  }
  detail(item) {
    this.obj = this.getObj();
    this.obj = item;
    this.brandownerid = item.n3;
    this.getBrandOwner();
    this.btn = true;
    $('#bnew-tab').tab('show');
  }
  getObj() {
    return {
      syskey: "",
      recordStatus: 1,
      t1: "",
      t2: "",
      t3: "",
      n3: ""
    }
  }

  save() {
    if(this.isvalid()){
      if (this.manager.user.orgId.length == 0) return;
      var msg = ""
      if (this.obj.syskey.length > 3) msg = "Updating data.."
      else msg = "Saving data..";
      this.loading.create(
        {
          message: msg,
          duration: 20000
        }
      ).then(
        el => {
          el.present();
          var status = "";  
          this.obj.n3 = this.brandownerid;
          const url = this.manager.appConfig.apiurl + 'brand/saveBrand';
          var subscribe = this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
            (data: any) => {
              console.log(data);
              if (data.message == "SUCCESS") {
                status = "SUCCESS!"
                el.dismiss();
              } else if (data.message == "CODEEXITS") {
                status = "CODEEXITS!"
                el.dismiss();
              } 
              else {
                status = "FAIL!"
                el.dismiss();
              }
            },
            e => {
              status = "FAIL!"
              el.dismiss();
            })
          el.onDidDismiss().then(
            el => {
              if (status == "SUCCESS!") {
                this.manager.showToast(this.tost,"Message","Saved Successfully!",1000).then(
                  e => {
                    this.getAll();
                    $('#blist-tab').tab('show');
                  }
                );             
              } else if (status == "CODEEXITS!") {
                this.manager.showToast(this.tost,"Message","Code Already Exists!",1000);
              } else {
                this.manager.showToast(this.tost,"Message","Saving Fail!",1000);
              }
            });
        }  
      )
    }
  }
  getDefaultDeleteObject() {
    return { 
      //in Used // e.g. SELECT COUNT(SYSKEY) AS TOTALCOUNT FROM STK014 WHERE n3= ?
      "inUsed_RecordStatus" : "RecordStatus", 
      "inUsed_Table" : "STK001", 
      "count_Column" : "SYSKEY", 
      "inUsed_Column" : "n8", 
      //delete process  // e.g. UPDATE UVM003 SET RECORDSTATUS = 4 WHERE SYSKEY=?
      "delete_Table" : "STK014",      
      "delete_Column" : "SYSKEY",
      "delete_Key" : ""  //syskey for inUse and Delete //set this param in gotoDelete();
    };
  }
  gotoDelete() {
    if (this.manager.user.orgId.length == 0) return;
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
        const url = this.manager.appConfig.apiurl + 'delete/tempDelete';
        this.delete_param.delete_Key = this.obj.syskey;
        var subscribe = this.http.post(url, this.delete_param, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            if (data.message == "SUCCESS!") {
              status = "SUCCESS!"
              el.dismiss();
            } else if(data.message == "USED!"){
              status = "USED!"
              el.dismiss();
            }else {
              status = "FAIL!"
              el.dismiss();
            }
          },
          e => {
            status = "FAIL!"
            el.dismiss();
          }
        )
        el.onDidDismiss().then(
          el => {
            if (status == "SUCCESS!") {
              this.manager.showToast(this.tost,"Message","Deleted Successfully!",1000).then(
                e => {
                  this.getAll();
                  $('#blist-tab').tab('show');
                }
              );             
            } else if (status == "USED!") {
              this.manager.showToast(this.tost,"Message","This Brand is in Used!",1000);
            } else {
              this.manager.showToast(this.tost,"Message","Deleteing Fail!",1000);
            }
          },
          (error:any)=>{
            this.manager.showToast(this.tost,"Message","Deleting Fail!",1000);
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

  isvalid() {
    if (this.obj.t1.trim().length === 0) {
      this.manager.showToast(this.tost,"Message","Invalid Code!",1000);
      return false;
    }
    else if (this.obj.t2.trim().length === 0) {
      this.manager.showToast(this.tost,"Message","Invalid Description!",1000);
      return false;
    }else if (this.brandownerid == "" || this.brandownerid == "0"){
      this.manager.showToast(this.tost,"Message","Invalid Brand Owner!",1000);
      return false;
    }
    else return true;
  }  

  advanceSearch(option) {
    this.searchtab = option;
    if(!this.searchtab){this.refresh();}
  }

  getDefaultSearchObject() {
    return { "codeType": "c", "descriptionType": "c", "code": "", "description": "" , "bosyskey": "0"};
  }

  refresh(){
    this.search_param = this.getDefaultSearchObject();
    this.getAll();
  }

}
