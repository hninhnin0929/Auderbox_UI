import { Component, OnInit, ViewChild } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, HttpHandler } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, Events, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { MatCheckboxModule } from '@angular/material/checkbox'
import { FormControl } from '@angular/forms';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
declare var $: any;
@Component({
  selector: 'app-town',
  templateUrl: './town.page.html',
  styleUrls: ['./town.page.scss'],
})
export class TownPage implements OnInit {
  stateCodeSearch : FormControl = new FormControl();
  stateNameSearch : FormControl= new FormControl();
  districtCodeSearch : FormControl= new FormControl();
  districtNameSearch : FormControl= new FormControl();
  tspCodeSearch : FormControl= new FormControl();
  tspNameSearch : FormControl= new FormControl();
  townNameSearch : FormControl= new FormControl();
  townCodeSearch : FormControl= new FormControl();
  wardNameSearch : FormControl= new FormControl();
  wardCodeSearch : FormControl= new FormControl();
  villagetractNameSearch : FormControl= new FormControl();
  villagetractCodeSearch : FormControl= new FormControl();
  btn: boolean = false;
  statesyskey: any;
  _stateList: any = [];
  _districtList: any = [];
  _townList: any = [];
  _stateList1: any = [];
  _districtList1: any = [];
  _townList1: any = [];
  _tspList2 : any=[];
  _stateList2: any = [];
  _districtList2: any = [];
  _townList2: any = [];
  _tspList1: any=[];
  staobj = this.getStateObj();
  disobj = this.getDistrictObj();
  tspobj = this.getTspObj();
  townobj = this.getTownObj();
  _tspList: any = [];
  flag1:boolean;
  each_sheet_data: any = this.forjsondata1();
  all_sheet_data: any = this.forjsondata2();
  uploadedFileName: string = "";
  uploadFile: File;
  n2:string = "1";
  spinner: boolean = false;
  searchtab: boolean = false;
  townvillagetract = [
    { "id": "0", "Name": 'Town' },

    { "id": "1", "Name": 'VillageTract' }
  ];
  criteria: any = this.getCriteriaData();
  constructor(
    public manager: ControllerService,
    private http: HttpClient,
    public alertCtrl: AlertController,
    private ics: ControllerService,
    public activeRoute: ActivatedRoute,
    public loading: LoadingController,
    public matcheckbox: MatCheckboxModule,
    private event: Events,
    private router: Router,
    private tostCtrl: ToastController

  ) {
    this.getStateList();
  }

  ngOnInit() {
    
  }



  ionViewWillEnter() {
    this.manager.isLoginUser();
    this.btn = false;
    this.getStateList();
    this.getTownList();
    this.allList();
    $('#townlist-tab').tab('show');
  }
  listTab() {
    this.btn = false;
    this.townobj = this.getTownObj();
    this.getTownList();
    this.ionViewWillEnter();
    $('#townlist-tab').tab('show');
  }
  newTabClick(e) {

    this.townobj = this.getTownObj();
    this.tspobj = this.getTspObj();
    this.disobj = this.getDistrictObj();
    this.staobj = this.getStateObj();

  }
  tab(e) {

  }
  detailTab() {
    this.townobj = this.getTownObj();
    this.getStateList();
    this.getDistrictList(this.tspobj.n3);
    this.getTownShipList(this.townobj.n3);
    $('#townnew-tab').tab('show');
  }
  detail(item) {
    this.btn = true;
    this.townobj = item;
    this.townobj.n2 = item.n2;
    this.n2 = ""+item.n2;
    this.getTownshipListbySyskey(this.townobj.n3);
    $('#townnew-tab').tab('show');
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

  stateChange() {
    //  for(let i=0;i<this._stateList.length;i++)
    // if(this.staobj.syskey==this._stateList[i].syskey){
    //   this.getDistrictList(this.staobj.syskey);
    // }
    this.townobj = this.getTownObj();
    this.tspobj = this.getTspObj();
    this.disobj = this.getDistrictObj();
    let ds = this._stateList.filter(s => {
      return s.syskey == this.staobj.syskey;
    });
    if (ds.length > 0) this.getDistrictList(ds[0].syskey);

  }

  districtChange() {
    this.townobj = this.getTownObj();
    this.tspobj = this.getTspObj();
  
    let ds = this._districtList.filter(s => {
      return s.syskey == this.disobj.syskey;
    });
    if (ds.length > 0) this.getTownShipList(ds[0].syskey);

  }
  tspChange(){
    let ds = this._tspList.filter(s=>{
      return s.syskey==this.townobj.n3;
    });
    if(ds.length>0) 
    {
      this.townobj.t1=ds[0].t1;
      this.townobj.n3=ds[0].syskey;
  }
}
  onChangeTownList() {
    if (this.townobj.n3 != null && this.townobj.n2 != undefined) {
      this.getTownList();
    }
  }


  getStateList() {
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
  getDistrictListbySyskey(syskey) {
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
        const url = this.ics.appConfig.apiurl + 'placecode/getdistrict';
        var param = { code: "", description: "", districtSyskey: syskey, stateSyskey: "0" }
        var subscribe = this.http.post(url, param, this.ics.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            this._districtList = data.districtList;
            if (this._districtList.length != 0) {
              this.staobj.syskey = this._districtList[0].n3;
            }

          },
          error => {
            el.dismiss();
          }
        )

      }
    )
  }
  getTownshipListbySyskey(syskey) {
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
        const url = this.ics.appConfig.apiurl + 'township/gettspbysyskey';
        var param = { syskey: syskey, n3: "0" }
        var subscribe = this.http.post(url, param, this.ics.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            this._tspList = data.tspList;
            if (this._tspList.length != 0) {
              this.disobj.syskey = this._tspList[0].n3;
              this.getDistrictListbySyskey(this.disobj.syskey);

            }

          },
          error => {
            el.dismiss();
          }
        )

      }
    )
  }
  getDistrictList(n3) {
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
        const url = this.ics.appConfig.apiurl + 'placecode/getdistrict';
        //var param = { code: "", description: "", stateSyskey:n3  }
        var param = { code: "", description: "", districtSyskey: "0", stateSyskey: n3 }
        var subscribe = this.http.post(url, param, this.ics.getOptions()).subscribe(
          (data: any) => {
            this._districtList = data.districtList;
            // if(data)
            // {
            //   for(let i=0;i<this._districtList.length;i++)
            //   if(this.staobj.syskey==this._districtList[i].syskey){
            //     this.getStateListbySyskey(this.staobj.syskey);
            //  }
            //  }
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

  getTownShipList(n3) {
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
        const url = this.ics.appConfig.apiurl + 'placecode/gettsp';
        var param = { code: "", description: "", districtSyskey: n3,townshipSyskey:"" }
        var subscribe = this.http.post(url, param, this.ics.getOptions()).subscribe(
          (data: any) => {
            this._tspList = data.tspList;
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
  searchTownList() {
    let url: string = this.ics.appConfig.apiurl + 'town/gettown';
    this.http.post(url, this.townobj, this.ics.getOptions()).subscribe(
      (data: any) => {

        console.log(data);
        if (data.townList != null && data.townList != undefined && data.townList.length > 0) {
          this._townList = data.townList;
          this.config.currentPage = 1;

        } else {
          this._townList = [];
        }
      },
      error => {
      }
    );
  }
  getTownList() {
    let url: string = this.ics.appConfig.apiurl + 'town/gettownlist';
    this.http.post(url, this.townobj, this.ics.getOptions()).subscribe(
      (data: any) => {

        console.log(data);
        if (data.townList != null && data.townList != undefined && data.townList.length > 0) {
          this._townList = data.townList;
          this.config.currentPage = 1;

        } else {
          this._townList = [];
        }
      },
      error => {
      }
    );
  }
  getDistrictObj() {
    return {
      syskey: "0",
      createddate: "",
      modifieddate: "",
      userid: "",
      username: "",
      RecordStatus: 0,
      SyncStatus: 0,
      SyncBatch: "",
      t1: "",
      t2: "",
      t3: "",
      n1: 0,
      n2: 0,
      n3: "",
      Usersyskey: ""
    };
  }
  getStateObj() {
    return {
      syskey: "0",
      createddate: "",
      modifieddate: "",
      userid: "",
      username: "",
      RecordStatus: 0,
      SyncStatus: 0,
      SyncBatch: "",
      t1: "",
      t2: "",
      t3: "",
      n1: 0,
      n2: 0,
      n3: "",
      Usersyskey: ""
    };
  }
  getTspObj() {
    return {
      syskey: "0",
      createddate: "",
      modifieddate: "",
      userid: "",
      username: "",
      RecordStatus: 0,
      SyncStatus: 0,
      SyncBatch: "",
      t1: "",
      t2: "",
      t3: "",
      n1: 0,
      n2: 0,
      n3: "",
      Usersyskey: ""
    };
  }
  getTownObj() {
    return {
      syskey: "0",
      createddate: "",
      modifieddate: "",
      userid: "",
      username: "",
      RecordStatus: 0,
      SyncStatus: 0,
      SyncBatch: "",
      t1: "",
      t2: "",
      t3: "",
      n1: 0,
      n2: 0,
      n3: "",
      Usersyskey: "",
      tspname: "",
      districtname: "",
      statename: "",
      tspcode: "",
      districtcode: "",
      townname:"",
      towncode:"",
      statecode: "",
      latitude:"0.0",
      longitude:"0.0",
      t5:"",
      t6:"",
      t7:"",
      t8:""

    };
  }


  // gotoDelete() {

  //   const url = this.ics.appConfig.apiurl + 'town/deletetown/' + this.townobj.syskey;
  //   this.http.post(url, this.tspobj, this.ics.getOptions()).subscribe(
  //     (data: any) => {

  //       if (data.message == "success") {
  //         this.ics.showToast(this.tostCtrl, "Message", "Deleted Successfully!", 1000).then(
  //           e => {
  //             this.getTownList();
  //             this.btn = false;
  //             $('#townlist-tab').tab('show');
  //           }
  //         );
  //       } else if (data.message == "used") {
  //         this.ics.showToast(this.tostCtrl, "Message", "This District Already in Used!", 1000);
  //       } else {
  //         this.ics.showToast(this.tostCtrl, "Message", "Deleting Fail!", 1000);
  //       }
  //     },
  //     (error: any) => {
  //       this.ics.showToast(this.tostCtrl, "Message", "Deleting Fail!", 1000);
  //     });
  // }
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
              const url = this.ics.appConfig.apiurl + 'town/deletetown/' + this.townobj.syskey;
              this.http.post(url, this.tspobj, this.ics.getOptions()).subscribe(
                (data: any) => {
                  el.dismiss();
                  if (data.message == "success") {
                    this.ics.showToast(this.tostCtrl, "Message", "Deleted Successfully!", 1000).then(
                      e => {
                        this.btn = false;
                        this.getTownList();
                        $('#townlist-tab').tab('show');
                      }
                      );
                    } else if (data.message == "used") {
                      this.ics.showToast(this.tostCtrl, "Message", "This District Already in Used!", 1000);
                    } else {
                      this.ics.showToast(this.tostCtrl, "Message", "Deleting Fail!", 1000);
                    }
                  },
                  (error: any) => {
                    this.ics.showToast(this.tostCtrl, "Message", "Deleting Fail!", 1000);
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
    if (!this.valide()) {
      this.ics.showToast(this.tostCtrl, "Warnning", "fill all blanks", 1000);
      return;
    }
    this.townobj.n2 = parseInt(this.n2);
    let url: string = this.ics.appConfig.apiurl + 'town/save/';
    this.http.post(url, this.townobj, this.ics.getOptions()).subscribe(
      (data: any) => {
        if (data.message == "success") {
          this.ics.showToast(this.tostCtrl, "Message", "Saved Successfully!", 1000).then(
            e => {
              this.getTownList();
              this.btn = false;
              this._townList = [];
              this.townobj = this.getTownObj();
              $('#townlist-tab').tab('show')
            }
          );
        } else if (data.message == "exit") {
          this.ics.showToast(this.tostCtrl, "Message", "Code Already Exists!", 1000);
        } else {
          this.ics.showToast(this.tostCtrl, "Message", "Saving Fail!", 1000);
        }
      },
      (error: any) => {
        this.ics.showToast(this.tostCtrl, "Message", "Saving Fail!", 1000);
      });

  }
  valide(): boolean {
    if (this.townobj.t1 == "") return false;
    if (this.townobj.t2 == "") return false;

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
      "tspname": "",
      "tspcode": "",
      "townname": "",
      "towncode": "",
      "villagetractname ": "",
      "villagetractcode": "",
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
            this._stateList1 = data as any[];
           
        
        });
      }
    }
  );
  this.stateCodeSearch.valueChanges.subscribe(
    term => {
      if (term != '') {
        this.ics.stateCodeSearchAutoFill(term).subscribe(
          data => {
            this._stateList2 = data as any[];
           
        
        });
      }
    }
  );
  this.districtNameSearch.valueChanges.subscribe(
    term => {
      if (term != '') {
        this.ics.districtNameSearchAutoFill(term).subscribe(
          data => {
            this._districtList1 = data as any[];
           
        
        });
      }
    }
  );
  this.districtCodeSearch.valueChanges.subscribe(
    term => {
      if (term != '') {
        this.ics.districtCodeSearchAutoFill(term).subscribe(
          data => {
            this._districtList2 = data as any[];
           
        
        });
      }
    }
  );
  this.tspNameSearch.valueChanges.subscribe(
    term => {
      if (term != '') {
        this.ics.townshipNameSearchAutoFill(term).subscribe(
          data => {
            this._tspList1 = data as any[];
           
        
        });
      }
    }
  );
  this.tspCodeSearch.valueChanges.subscribe(
    term => {
      if (term != '') {
        this.ics.townshipCodeSearchAutoFill(term).subscribe(
          data => {
            this._tspList2 = data as any[];
           
        
        });
      }
    }
  );
  this.townNameSearch.valueChanges.subscribe(
    term => {
      if (term != '') {
        this.ics.townNameSearchAutoFill(term).subscribe(
          data => {
            this._townList1 = data as any[];
            
          //  this.stockList2 = data as any[];
        });
      }
    }
  );
  this.townCodeSearch.valueChanges.subscribe(
    term => {
      if (term != '') {
        this.ics.townCodeSearchAutoFill(term).subscribe(
          data => {
            this._townList2 = data as any[];
            
          //  this.stockList2 = data as any[];
        });
      }
    }
  );
 
  }
  search(){
    this.criteria.maxRow = this.config.itemsPerPage;
    this.config.currentPage = 1;

    const url =this.ics.appConfig.apiurl +'town/gettown';
      this.http.post(url, this.criteria, this.ics.getOptions()).subscribe(
        (data: any) => {
    
          console.log(data);
          if (data.townList != null && data.townList != undefined && data.townList.length > 0) {
            this._townList = data.townList;
          
          } else {
            this.ics.showToast(this.tostCtrl,"Message","No User!",1000)
            this._townList = [];
          }
        }
     
      );
    
  }
  advanceSearchReset() {
    this.criteria = this.getCriteriaData();
    this.getTownList();
  }
  print(){

  }

  forjsondata1() {
    return {
      "SR_Pcode":"",
      "District_Pcode":"",
      "District_Name":"",
      "Tsp_Pcode":"",
      "Township_Name":"",
      "Town_Pcode":"",
      "Town_Name":"",
      "VT_Pcode":"",
      "Village_Tract_Name":"",
      "t4":"",
      "t5":"",
      "t6":"",
      "t7":"",
      "Flag":""
      
    };
  }

  forjsondata2() {
    return {
      uploadData: [
        {
          "SR_Pcode":"","District_Pcode":"","District_Name":"","Tsp_Pcode":"","Township_Name":"","Town_Pcode":"", "Town_Name":"","VT_Pcode":"","Village_Tract_Name":"","t4":"","t5":"","t6":"", "t7":"","Flag":""
         
        }
      ]
    };
  }

  onUpload(event) {
    
    this.flag1=true; 
    this.each_sheet_data = this.forjsondata1();
    this.all_sheet_data = this.forjsondata2();

    let excelFileName = event.target.files[0].name;
    let pos = excelFileName.indexOf(".");
    this.uploadedFileName = excelFileName.substring(0,pos);
    this.uploadFile = event.target.files[0];

    let reader = new FileReader();
    reader.readAsArrayBuffer(this.uploadFile);
    reader.onload = (event: any) => {
      let data = new Uint8Array(event.target.result);
      let workbook = XLSX.read(data, { type: "array" });

      for(let k=0; k<workbook.SheetNames.length; k++) {
        let first_sheet_name = workbook.SheetNames[k];
        let worksheet = workbook.Sheets[first_sheet_name];
        this.each_sheet_data = XLSX.utils.sheet_to_json(worksheet, {
          raw: true
        });
  
        for(let i=0; i<this.each_sheet_data.length; i++) {
          this.all_sheet_data.uploadData.push(this.each_sheet_data[i]);
          console.log(this.each_sheet_data[i]);
        }
      }

      this.all_sheet_data.uploadData.splice(0,1);
    };   
    
  }
  
  sampleExcelDownload(){
    let exampleData : any = [];
    exampleData = this.sampleExcelData();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exampleData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, "Sample_townVillageTract");
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
    FileSaver.saveAs(data, fileName + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
  }

  sampleExcelData(){
    return [
      {
        "SR_Pcode":"MMR013",
        "District_Pcode":"MMR013D004",
        "District_Name":"Yangon (West)",
        "Tsp_Pcode":"MMR013037",
        "Township_Name":"Ahlone",
        "Town_Pcode":"MMR013037701",
        "Town_Name":"Ahlone",
        "VT_Pcode":"",
        "Village_Tract_Name":"",
        "t4":"",
        "t5":"",
        "t6":"",
        "t7":"",
        "Flag":"Town"
      },
      {
        "SR_Pcode":"MMR013",
        "District_Pcode":"MMR013D002",
        "District_Name":"Yangon (East)",
        "Tsp_Pcode":"MMR013020",
        "Township_Name":"Dagon Myothit (East)",
        "Town_Pcode":"",
        "Town_Name":"",
        "VT_Pcode":"MMR013020003",
        "Village_Tract_Name":"Lay Daunt Kan (East)",
        "t4":"",
        "t5":"",
        "t6":"",
        "t7":"",
        "Flag":"Village"
      }
    ];
  }

  process(){

    this.flag1=false;
    if (this.ics.user.orgId.length == 0) return;
    this.loading.create(
      {
        message: "processing",
        
      }
    ).then(
      el => {
        el.present();
        let url: string = this.ics.appConfig.apiurl+ 'town/Wvexcelsave';
        this.http.post(url, this.all_sheet_data, this.ics.getOptions()).subscribe(
        (data:any)=>{

        if(data.message =="fail")
        {
          this.ics.showToast(this.tostCtrl, "Message", "Check your data for ward fields or village fields!",1000) ;
          el.dismiss();
        }else{
          this.ics.showToast(this.tostCtrl, "Message", "Success",1000) ;
          el.dismiss();
        }
        },
    (error:any)=>{

      this.ics.showToast(this.tostCtrl, "Message", "Fail",1000 );
     }
     )
     el.onDidDismiss().then(
       el=>{

       }
     )
   
    }
    )
  }
}
