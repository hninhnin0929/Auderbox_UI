import { HttpClient, HttpErrorResponse, HttpHandler, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, Events, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

import { ControllerService } from '../controller.service';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
declare var $: any;

@Component({
  selector: 'app-ward',
  templateUrl: './ward.page.html',
  styleUrls: ['./ward.page.scss'],
})
export class WardPage implements OnInit {
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
  _wardList: any = [];
  _stateList1: any = [];
  _districtList1: any = [];
  _tspList1: any=[];
  _tspList2:any=[];
  _townList1: any = [];
  _wardList1: any = [];
  _stateList2: any = [];
  _districtList2: any = [];
  _townList2: any = [];
  _wardList2: any = [];
  _vtList1:any=[];
  _vtList2:any=[];
  staobj = this.getStateObj();
  disobj = this.getDistrictObj();
  tspobj = this.getTspObj();
  townobj = this.getTownObj();
  wardobj = this.getWardObj();
  _tspList: any = [];
  checked:boolean;
  townN2: any = "1";
  wardN2: any = "1";
  flag1:boolean;
  each_sheet_data: any = this.forjsondata1();
  all_sheet_data: any = this.forjsondata2();
  spinner: boolean = false;
  //each_sheet_data2: any = this.forjsondata3();
  // all_sheet_data2: any = this.forjsondata4();
  // all_sheet_data:any;
  uploadedFileName: string = "";
  uploadFile: File;
  selectedFile: File;
  criteria: any = this.getCriteriaData();
  searchtab: boolean = false;
  constructor(
    private http: HttpClient,
    private modalController: ModalController,
    private event: Events,
    private ics: ControllerService,
    private router: Router,
    public activeRoute: ActivatedRoute,
    public loading: LoadingController,
    public alertCtrl: AlertController, 
    private tostCtrl: ToastController

  ) {
    this.getStateList();
  }

  ngOnInit() {
  }




  ionViewWillEnter() {
    this.btn = false;
    this.ics.isLoginUser();
    this.allList();
    this.getStateList();
    this.getWardList();
    $('#wardlist-tab').tab('show');
  }
  listTab(event: any) {
    this.btn = false;
    this.getWardList();
    this.ionViewWillEnter();
    $('#wardlist-tab').tab('show');
  }
  newTabClick(e) {
    this.townN2 = "1";
    this.wardN2 = "1";
    this.townobj = this.getTownObj();
    this.tspobj = this.getTspObj();
    this.disobj = this.getDistrictObj();
    this.staobj = this.getStateObj();
    this.wardobj = this.getWardObj();
  }
  tab(e) {

  }
  detailTab() {
    this.wardobj = this.getWardObj();
    this.getTownList(this.wardobj.n3);
    this.getTownShipList(this.townobj.n3);
    this.getDistrictList(this.tspobj.n3);
    this.getStateList();
    $('#wardnew-tab').tab('show');
  }
  detail(item) {
    this.btn = true;
    this.wardobj = item;
    this.wardobj.n2 = item.n2;
    this.wardN2 = "" + item.n2;
    this.getTownListbySyskey(this.wardobj);
    $('#wardnew-tab').tab('show');
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
    // }   this.townobj = this.getTownObj();
    this.tspobj = this.getTspObj();
    this.disobj = this.getDistrictObj();
    this.wardobj = this.getWardObj();
    let ds = this._stateList.filter(s => {
      return s.syskey == this.staobj.syskey;
    });
    if (ds.length > 0) this.getDistrictList(ds[0].syskey);

  }
  districtChange() {
    this.townobj = this.getTownObj();
    this.tspobj = this.getTspObj();
    this.wardobj = this.getWardObj();
    let ds = this._districtList.filter(s => {
      return s.syskey == this.disobj.syskey;
    });
    if (ds.length > 0) this.getTownShipList(ds[0].syskey);

  }
  townshipChange(){
    this.townobj = this.getTownObj();
    this.wardobj = this.getWardObj();
    this.tspobj.n2 = parseInt(this.townN2);
    let p = { syskey: '0', n3: this.tspobj.n3, n2: this.tspobj.n2 }
    this.getTownList(p);
  }
  tspChange(event) {
    this.tspobj.n2 = parseInt(this.townN2);
    this.wardN2 = parseInt(this.townN2);
    let p = { syskey: '0', n3: this.tspobj.n3, n2: this.tspobj.n2 }
    this.getTownList(p);
    this.wardN2=event.value;
  }
  gotoWard(event){
    this.wardN2=event.target.value;
    console.log("the ward is"+this.wardN2);
  }
  wardchange(event) {
    this.wardobj.n2 = parseInt(this.wardN2);

  }



  getStateList() {
    if (this.ics.user.orgId.length == 0) return;
    let status = "";
    const url = this.ics.appConfig.apiurl + 'placecode/state';
    var param = {
      code: "",
      description: ""
    }
    var subscribe = this.http.post(url, param, this.ics.getOptions()).subscribe(
      (data: any) => {
        this._stateList = data.dataList;
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
        var param = { code: "", description: "", districtSyskey: n3, townshipSyskey:"" }//addtownshipSyskey:""byhml
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
  getTownList(obj) {

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

        const url = this.ics.appConfig.apiurl + 'placecode/gettown';//addhml
        //var param = { code: "", description: "", townshipSyskey: n3 }
        var subscribe = this.http.post(url, obj, this.ics.getOptions()).subscribe(
          (data: any) => {
            this._townList = data.townList;
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
  getTownListbySyskey(syskey) {
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
        const url = this.ics.appConfig.apiurl + 'town/gettownbysyskey';
        var param = { townSyskey: this.wardobj.n3, townshipSyskey: "0" }
        var subscribe = this.http.post(url, param, this.ics.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            this._townList = data.townList;
            if (this._townList.length != 0) {
              this.tspobj.n3 = this._townList[0].n3;
              this.townN2 = "" + this._townList[0].n2;
              this.getTownShipListbySyskey(this.tspobj.n3);
            }
          },
          error => {
            el.dismiss();
          }
        )

      }
    )
  }

 
  getTownShipListbySyskey(syskey) {
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
  getWardList() {

    if (this.ics.user.orgId.length == 0) return;
    this.loading.create(
      {
        message: "Getting data..",
      }
    ).then(
      el => {
        el.present();

        let status = "";
        const url = this.ics.appConfig.apiurl + 'ward/getward';
        // var param = {
        //    code: "",
        //   description: ""
        //  }
        var subscribe = this.http.post(url,this.criteria, this.ics.getOptions()).subscribe(
          (data: any) => {
            this._wardList = data.wardList;
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
      Usersyskey: ""
    };
  }

  getCriteriaData(){
    return {
      wardname:"",
      wardcode:"",
      villagetractname:"",
      villagetractcode:"",
      towncode:"",
      townname:"",
      tspcode:"",
      tspname:"",
      districtcode:"",
      districtname:"",
      statecode:"",
      statename:"",
      "current":"",
      "maxRow":""
    };
  }
  
  getWardObj() {
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
      latitude:"0.0",
      longitude:"0.0",
      t5:"",
      t6:"",
      t7:"",
      t8:""
    };
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
              const url = this.ics.appConfig.apiurl + 'ward/deleteward/' + this.wardobj.syskey;
              this.http.post(url, this.wardobj, this.ics.getOptions()).subscribe(
                (data: any) => {
                  el.dismiss();
                  if (data.message == "success") {
                    this.ics.showToast(this.tostCtrl, "Message", "Deleted Successfully!", 1000).then(
                      e => {
                        this.getWardList();
                        this.btn = false;
                        $('#wardlist-tab').tab('show');
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
    this.wardobj.n2 = parseInt(this.wardN2);
    let url: string = this.ics.appConfig.apiurl + 'ward/save/';
    this.http.post(url, this.wardobj, this.ics.getOptions()).subscribe(
      (data: any) => {
        if (data.message == "success") {
          this.ics.showToast(this.tostCtrl, "Message", "Saved Successfully!", 1000).then(
            e => {
              this.getWardList();
              this.btn = false;
              this._wardList = [];
              this.wardobj = this.getWardObj();
              $('#wardlist-tab').tab('show')
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
    if (this.wardobj.t1 == "") return false;
    if (this.wardobj.t2 == "") return false;

    else return true;

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
      "Ward_Pcode":"",
      "Ward_Name":"",
      "VT_Pcode":"",
      "Village_Tract_Name":"",
      "Village_Pcode":"",
      "Village_Name":"",
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
          "SR_Pcode":"","District_Pcode":"","District_Name":"","Tsp_Pcode":"","Township_Name":"","Town_Pcode":"", "Town_Name":"","Ward_Pcode":"","Ward_Name":"","VT_Pcode":"","Village_Tract_Name":"","Village_Pcode":"","Village_Name":"","t4":"","t5":"","t6":"", "t7":"","Flag":""
         
        }
      ]
    };
  }

 

  resetValue(){

  }
  public onFileChanged(event) {
    this.selectedFile = event.target.files[0];
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
  wardChange(){
  
  }


  process(){

    // for(var i=0;i<this.all_sheet_data.uploadData.length;i++)
    // {
    //   let obj=this.all_sheet_data.uploadData[i];
    //   console.log(obj.SR_Pcode+"**"+obj.District_Pcode+"**"+obj.District_Name+"**"+obj.Tsp_Pcode+"**"+obj.Township_Name+"**"+
    //   obj.Town_Pcode+"**"+obj.Town_Name+"**"+obj.Ward_Pcode+"**"+obj.Ward_Name+"**"+obj.VT_Pcode+"**"+obj.Village_Tract_Name+"**"+obj.Village_Pcode+"**"+obj.Village_Name+"**"+obj.t4+"**"+obj.t5+"**"+obj.t6+"**"+obj.t7+"**"+obj.Flag);
    // }
    this.flag1=false;
    if (this.ics.user.orgId.length == 0) return;
    this.loading.create(
      {
        message: "processing",
        
      }
    ).then(
      el => {
        el.present();
        let url: string = this.ics.appConfig.apiurl+ 'ward/Wvexcelsave';
        this.http.post(url, this.all_sheet_data, this.ics.getOptions()).subscribe(
        (data:any)=>{
        //  if(data.message=="success"){
        // this.ics.showToast(this.tostCtrl, "Message", "Success",1000) ;
        // el.dismiss();
        // }
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

  sampleExcelDownload(){
    let exampleData : any = [];
    exampleData = this.sampleExcelData();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exampleData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, "Sample_Ward");
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
        "Ward_Pcode":"MMR013037701501",
        "Ward_Name":"Aye Yar Wa Di Ward",
        "VT_Pcode":"",
        "Village_Tract_Name":"",
        "Village_Pcode":"",
        "Village_Name":"",
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
        "Ward_Pcode":"",
        "Ward_Name":"",
        "VT_Pcode":"MMR013020003",
        "Village_Tract_Name":"Lay Daunt Kan (East)",
        "Village_Pcode":"156627",
        "Village_Name":"Lay Daunt Kan (Ah Shey Paing)",
        "t4":"",
        "t5":"",
        "t6":"",
        "t7":"",
        "Flag":"Village"
      }
    ];
  }
  


advanceSearchReset() {
    this.criteria = this.getCriteriaData();
    this.getWardList();
  }
pageChanged(e){
  this.config.currentPage = e;

  
}

search() {
  this.config.currentPage = 1;
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
      const url = this.ics.appConfig.apiurl + 'ward/getward';
      var subscribe = this.http.post(url, this.criteria, this.ics.getOptions()).subscribe(
        (data: any) => {
          this._wardList = data.wardList;
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
this.wardNameSearch.valueChanges.subscribe(
  term => {
    if (term != '') {
      this.ics.wardNameSearchAutoFill(term).subscribe(
        data => {
          this._wardList1 = data as any[];
          
        //  this.stockList2 = data as any[];
      });
    }
  }
);
this.wardCodeSearch.valueChanges.subscribe(
  term => {
    if (term != '') {
      this.ics.wardCodeSearchAutoFill(term).subscribe(
        data => {
          this._wardList2 = data as any[];
          
        //  this.stockList2 = data as any[];
      });
    }
  }
);
this.villagetractNameSearch.valueChanges.subscribe(
  term => {
    if (term != '') {
      this.ics.villagetractNameSearchAutoFill(term).subscribe(
        data => {
          this._vtList1 = data as any[];
          
        //  this.stockList2 = data as any[];
      });
    }
  }
);
this.villagetractCodeSearch.valueChanges.subscribe(
  term => {
    if (term != '') {
      this.ics.villagetractNameSearchAutoFill(term).subscribe(
        data => {
          this._vtList2 = data as any[];
          
        //  this.stockList2 = data as any[];
      });
    }
  }
);

}
print(){

}
}