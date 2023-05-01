import { Component, OnInit, ViewChild } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, HttpHandler } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, Events, AlertController ,LoadingController,ToastController} from '@ionic/angular';
import { FormControl } from '@angular/forms';
declare var $: any;
@Component({
  selector: 'app-district',
  templateUrl: './district.page.html',
  styleUrls: ['./district.page.scss'],
})
export class DistrictPage implements OnInit {
  stateCodeSearch : FormControl = new FormControl();
  stateNameSearch : FormControl= new FormControl();
  districtCodeSearch : FormControl= new FormControl();
  districtNameSearch : FormControl= new FormControl();
  tspCodeSearch : FormControl= new FormControl();
  tspNameSearch : FormControl= new FormControl();
   _stateList:any=[];
   _districtList:any=[];
   _districtList1:any=[];
   _districtList2:any=[];
   _districtList3:any=[];
   _districtList4:any=[];
   _obj = this.getObj();
   btn:boolean = false;
   spinner:boolean=false;
   searchtab:boolean=false;
   criteria: any = this.getCriteriaData();
  constructor(
    private http: HttpClient,
    public alertCtrl: AlertController, 
    private ics:ControllerService,
    public activeRoute: ActivatedRoute,
   public loading: LoadingController,
   private tostCtrl: ToastController
  ) {
    this.getStateList();
   }

  ngOnInit() {
    
  }
  
  ionViewWillEnter() {
    this.ics.isLoginUser();
    this.getDistrictList();
    this.allList();
    this.btn = false;
    $('#dlist-tab').tab('show');
  }
  listTab() {
    this.btn = false;
    this._obj = this.getObj();
    this.getDistrictList();
    this.ionViewWillEnter();
   
    $('#dlist-tab').tab('show');
  }
  newTabClick(e){
    this._obj = this.getObj();
  }
  tab(e){

  }
  detailTab() {
    this._obj = this.getObj();
    this.getStateList();
    $('#dnew-tab').tab('show');
  }
  runSpinner(t: boolean) {
    this.spinner = t;
  }

  advanceSearch(option) {
    this.searchtab = option;
  }
  config =  {
    itemsPerPage: this.ics.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  statechange(){
   // this._obj = this._stateList();
    let ds = this._stateList.filter(s=>{
  return s.syskey==this._obj.n3;
});
if(ds.length>0) 
{
  this._obj.t1=ds[0].t1;
  this._obj.n3=ds[0].syskey;


}
  }
  getStateList(){
    if (this.ics.user.orgId.length == 0) return;
    this.loading.create(
      {
        message: "Getting data..",
        duration: 20000
      }
    ).then(
      el => {
        el.present();

        let status = "";
        const url = this.ics.appConfig.apiurl + 'placecode/state';
        var param = {
          code: "",
          description: ""
        }
        var subscribe = this.http.post(url, param, this.ics.getOptions()).subscribe(
          (data: any) => {
            this._stateList = data.dataList;
            el.dismiss();
          }
        )
        el.onDidDismiss().then(
          el => {
         
          }
        )
      }
    )
  }
getObj(){
  return {
    syskey : "0",
    createddate : "",
    modifieddate : "",
    userid: "",
    username: "",
    RecordStatus : 0,
    SyncStatus : 0,
    SyncBatch : "",
    t1 : "",
    t2 : "",
    t3 : "",
    n1 : 0,
    n2 : 0,
    n3 :"",
    Usersyskey : "",
    statename:""
  };
}


  detail(item) {
    this.btn = true;
    this._obj = item;
    this.getStateList();
    $('#dnew-tab').tab('show');
  }
 
  searchDistrictList() { 
    let url: string = this.ics.appConfig.apiurl + 'district/getdistrict';
    this.http.post(url, this._obj, this.ics.getOptions()).subscribe(
      (data: any) => {
        
        console.log(data);
        if (data.districtList != null && data.districtList != undefined && data.districtList.length > 0) {
          this._districtList = data.districtList;
        
        } else {
          this.ics.showToast(this.tostCtrl,"Message","No User!",1000)
          this._districtList = [];
        }
      },
      error => {
      }
    );
  }
  getDistrictList() { 
    let url: string = this.ics.appConfig.apiurl + 'district/getdistrictlist';
    this.http.post(url, this._obj, this.ics.getOptions()).subscribe(
      (data: any) => {
        
        console.log(data);
        if (data.districtList != null && data.districtList != undefined && data.districtList.length > 0) {
          this._districtList = data.districtList;
        
        } else {
          this.ics.showToast(this.tostCtrl,"Message","No User!",1000)
          this._districtList = [];
        }
      },
      error => {
      }
    );
  }
      gotoDelete() {
            this.alertCtrl.create({
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
                      const url = this.ics.appConfig.apiurl + 'placecode/deletedistrict/'+this._obj.syskey;
                      this.http.post(url, this._obj,this.ics.getOptions()).subscribe(
                        (data: any) => {
                          el.dismiss();
                          if (data.message == "success") {
                            this.ics.showToast(this.tostCtrl,"Message","Deleted Successfully!",1000).then(
                              e => {
                                this.getDistrictList();
                                this.btn = false;
                                $('#dlist-tab').tab('show');
                              }
                            );            
                          } else if (data.message == "used") {
                            this.ics.showToast(this.tostCtrl,"Message","This Township Already in Used!",1000);
                          } else {
                            this.ics.showToast(this.tostCtrl,"Message","Deleting Fail!",1000);
                          }
                        },
                        (error: any) => {
                          this.ics.showToast(this.tostCtrl,"Message","Deleting Fail!",1000);
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
  
    save() {
      if(!this.valide()){
        this.ics.showToast(this.tostCtrl,"Warnning","fill all blanks",1000);
        return;
      }
      let url: string = this.ics.appConfig.apiurl + 'district/save/';
      this.http.post(url, this._obj, this.ics.getOptions()).subscribe(
         (data:any)=>{
           if(data.message=="success"){
            
              //  this.alert("message","Save Successful");
              this.ics.showToast(this.tostCtrl, "Message", "Success",1000 ).then(
                e => {
                  this.getDistrictList();
                  this.btn = false;
                  this._districtList = [];
                  this._obj =  this.getObj();
                  $('#dlist-tab').tab('show')
                }
                );            
    
            } else if (data.message == "exit") {
              this.ics.showToast(this.tostCtrl,"Message","Code Already Exists!",1000);
            } else {
              this.ics.showToast(this.tostCtrl,"Message","Saving Fail!",1000);
            }
          },
         (error:any)=>{
    
          this.ics.showToast(this.tostCtrl, "Message", "Fail",1000 );
         });
       
       }
       valide():boolean{
        if(this._obj.t1 == "") return false;
        if(this._obj.t2 == "") return false;
       
        else return true;
    
      }
      pageChanged(e){
        this.config.currentPage = e;
      
        
      }
      getCriteriaData(){
        return {
          "statename": "",
          "statecode": "",
          "districtname": "",
          "districtcode": "",
          "current": "",
          "maxRow": ""
        };
      }
      allList(){
        var url = "";
        var param = {};
      param = {
        "code" : "",
        "description" : ""
      };
      this.stateNameSearch.valueChanges.subscribe(
        term => {
          if (term != '') {
            this.ics.stateNameSearchAutoFill(term).subscribe(
              data => {
                this._districtList1 = data as any[];
               
            
            });
          }
        }
      );
      this.stateCodeSearch.valueChanges.subscribe(
        term => {
          if (term != '') {
            this.ics.stateCodeSearchAutoFill(term).subscribe(
              data => {
                this._districtList2 = data as any[];
               
            
            });
          }
        }
      );
      this.districtNameSearch.valueChanges.subscribe(
        term => {
          if (term != '') {
            this.ics.districtNameSearchAutoFill(term).subscribe(
              data => {
                this._districtList3 = data as any[];
               
            
            });
          }
        }
      );
      this.districtCodeSearch.valueChanges.subscribe(
        term => {
          if (term != '') {
            this.ics.districtCodeSearchAutoFill(term).subscribe(
              data => {
                this._districtList4 = data as any[];
               
               // console.log("code"+this._districtList[0].districtcode);
              
            });
          }
        }
      );
      
     
      
    
      }
      search(){
        this.criteria.maxRow = this.config.itemsPerPage;

        const url =this.ics.appConfig.apiurl +'district/getdistrict';
          this.http.post(url, this.criteria, this.ics.getOptions()).subscribe(
            (data: any) => {
        
              console.log(data);
              if (data.districtList != null && data.districtList != undefined && data.districtList.length > 0) {
                this._districtList = data.districtList;
              
              } else {
                this.ics.showToast(this.tostCtrl,"Message","No User!",1000)
                this._districtList = [];
              }
            }
         
          );
        
      }
    
      
      advanceSearchReset() {
        this.criteria = this.getCriteriaData();
        this.getDistrictList();
      }
      print(){
        
      }
}




