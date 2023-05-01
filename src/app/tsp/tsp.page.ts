import { Component, OnInit, ViewChild } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, HttpHandler } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, Events, AlertController, LoadingController, ToastController } from '@ionic/angular';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
import { FormControl } from '@angular/forms';

declare var $: any;
@Component({
  selector: 'app-tsp',
  templateUrl: './tsp.page.html',
  styleUrls: ['./tsp.page.scss'],
})
export class TspPage implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput;
  btn: boolean = false;
  syskey: any;
  statesyskey: any;
  _stateList: any = [];
  _districtList: any = [];
  staobj = this.getStateObj();
  disobj = this.getDistrictObj();
  tspobj = this.getTspObj();
  each_sheet_data: any = this.forjsondata1();
  all_sheet_data: any = this.forjsondata2();
  _tspList: any = [];
  config = {
    itemsPerPage: this.ics.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  criteria: any = this.getCriteriaData();
  uploadedFileName: string = "";
  spinner: boolean = false;
  searchtab: boolean = false;
  uploadFile: File;
  _districtList1: any = [];
  _districtList2: any = [];
  _stateList1: any = [];
  _tspList1: any = [];
  _stateList2: any = [];
  _tspList2: any = [];


  selectedFile: File;
  stateCodeSearch: FormControl = new FormControl();
  stateNameSearch: FormControl = new FormControl();
  districtCodeSearch: FormControl = new FormControl();
  districtNameSearch: FormControl = new FormControl();
  tspCodeSearch: FormControl = new FormControl();
  tspNameSearch: FormControl = new FormControl();
  townNameSearch: FormControl = new FormControl();
  townCodeSearch: FormControl = new FormControl();
  constructor(
    private http: HttpClient,
    public alertCtrl: AlertController,
    private tostCtrl: ToastController,
    private ics: ControllerService,
    public activeRoute: ActivatedRoute,
    public loading: LoadingController
  ) {
    this.getStateList();

  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.ics.isLoginUser();
    this.btn = false;
    this.allList();
    this.getStateList();
    this.getTownShipList();
    this.getAll();
    $('#tsplist-tab').tab('show');
  }
  listTab() {
    this.btn = false;
    this.allList();
    this.getStateList();
    this.getTownShipList();
    this.getAll();
    $('#tsplist-tab').tab('show');
  }
  newTabClick(e) {
    this.tspobj = this.getTspObj();
    this.disobj = this.getDistrictObj();
    this.staobj = this.getStateObj();
  }
  tab(e) {

  }
  detailTab() {
    this.tspobj = this.getTspObj();
    this.getStateList();
    this.getDistrictList(this.tspobj.n3)
    $('#tspnew-tab').tab('show');
  }
  detail(item) {
    this.btn = true;
    this.tspobj = item;
    this.getDistrictListbySyskey(this.tspobj.n3);
    $('#tspnew-tab').tab('show');
  }


  runSpinner(t: boolean) {
    this.spinner = t;
  }
  async advanceSearch(s: boolean) {
    if (!this.searchtab) {


      this.runSpinner(true);
      this.searchtab = true;
      this.runSpinner(false);
    } else {
      this.searchtab = s;
    }

  }
  forjsondata1() {
    return {
      "SR_Pcode": "",
      "District_Pcode": "",
      "District_Name": "",
      "Tsp_Pcode": "",
      "Township_Name": "",
      "t4": "",
      "t5": "",
      "t6": "",
      "t7": ""

    };
  }

  forjsondata2() {
    return {
      uploadData: [
        {
          "SR_Pcode": "", "District_Pcode": "", "District_Name": "", "Tsp_Pcode": "", "Township_Name": "", "t4": "", "t5": "", "t6": "", "t7": ""
        }
      ]
    };
  }

  stateChange() {
    //  for(let i=0;i<this._stateList.length;i++)
    // if(this.staobj.syskey==this._stateList[i].syskey){
    //   this.getDistrictList(this.staobj.syskey);
    // }   this.townobj = this.getTownObj();

    this.disobj = this.getDistrictObj();

    let ds = this._stateList.filter(s => {
      return s.syskey == this.staobj.syskey;
    });
    if (ds.length > 0) this.getDistrictList(ds[0].syskey);

  }

  districtChange() {
    let ds = this._districtList.filter(s => {
      return s.syskey == this.tspobj.n3;
    });
    if (ds.length > 0) {
      this.tspobj.t1 = ds[0].t1;
      this.tspobj.n3 = ds[0].syskey;

    }
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
  getStateListbySyskey(syskey) {
    let url: string = this.ics.appConfig.apiurl + 'placecode/state';
    this.http.post(url, this.staobj, this.ics.getOptions()).subscribe(
      (data: any) => {

        console.log(data);
        if (data.tspList != null && data.tspList != undefined && data.tspList.length > 0) {
          this._tspList = data.tspList;

        } else {

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
      Usersyskey: "",
      statename: ""
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
      Usersyskey: "",
      districtname: "",
      statename: "",
      tspname: "",
      statecode: "",
      districtcode: "",
      tspcode: ""

    };
  }
  getTownShipList() {
    let url: string = this.ics.appConfig.apiurl + 'township/gettownship';
    this.http.post(url, this.tspobj, this.ics.getOptions()).subscribe(
      (data: any) => {
        console.log(data);
        if (data.tspList != null && data.tspList != undefined && data.tspList.length > 0) {
          this._tspList = data.tspList;
          this.tspobj = this.getTspObj();
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
            //console.log('Confirm Cancel: blah');
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
              const url = this.ics.appConfig.apiurl + 'township/deletetsp/' + this.tspobj.syskey;
              var subscribe = this.http.post(url, this.tspobj, this.ics.getOptions()).subscribe(
                (data: any) => {
                  el.dismiss();
                  if (data.message == "success") {
                            this.ics.showToast(this.tostCtrl, "Message", "Deleted Successfully!", 1000).then(
                              e => {
                                this.btn = false;
                                this.getTownShipList();
                                $('#tsplist-tab').tab('show');
                              }
                            );
                          } else if (data.message == "used") {
                            this.ics.showToast(this.tostCtrl, "Message", "This Township Already in Used!", 1000);
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
    
  async save() {
    if (!this.valide()) {
      this.ics.showToast(this.tostCtrl, "Warnning", "fill all blanks", 1000);
      return;
    }
    const loading = await this.loading.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
    });
    await loading.present();
    let url: string = this.ics.appConfig.apiurl + 'township/save/';
    this.http.post(url, this.tspobj, this.ics.getOptions()).subscribe(
      (data: any) => {
        loading.dismiss();
        if (data.message == "success") {
          //  this.alert("message","Save Successful");
          this.ics.showToast(this.tostCtrl, "Message", "Success", 1000).then(
            e => {
              this.getTownShipList();
              this.btn = false;
              this._districtList = [];
              this.tspobj = this.getTspObj();
              $('#tsplist-tab').tab('show')
            }
          );

        } else if (data.message == "exit") {
          this.ics.showToast(this.tostCtrl, "Message", "Code Already Exists!", 1000);
        } else {
          this.ics.showToast(this.tostCtrl, "Message", "Saving Fail!", 1000);
        }
      },
      (error: any) => {
        loading.dismiss();
        this.ics.showToast(this.tostCtrl, "Message", "Fail", 1000);
      });
  }

  valide(): boolean {
    if (this.tspobj.t1 == "") return false;
    if (this.tspobj.t2 == "") return false;

    else return true;

  }

  pageChanged(e) {
    this.config.currentPage = e;

  }

  resetValue() {

  }
  public onFileChanged(event) {
    this.selectedFile = event.target.files[0];
  }

  onUpload(event) {


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
          this.all_sheet_data.uploadData.push(this.each_sheet_data[i]);
          console.log(this.each_sheet_data[i]);
        }
      }

      this.all_sheet_data.uploadData.splice(0, 1);
    };

  }

  process() {


    // for(var i=0;i<this.all_sheet_data.uploadData.length;i++)
    // {
    //   let obj=this.all_sheet_data.uploadData[i];
    //   console.log(obj.SR_Pcode+"##"+obj.District_Pcode+"#"+obj.District_Name+"#"+obj.Tsp_Pcode+"#"+obj.Township_Name+"#"+obj.t4+"#"+obj.t5+"#"+obj.t6+"#"+obj.t7);
    // }
    // console.log("Hello process"+this.all_sheet_data.uploadData.length);


    if (this.ics.user.orgId.length == 0) return;
    this.loading.create(
      {
        message: "processing",

      }
    ).then(
      el => {
        el.present();
        let url: string = this.ics.appConfig.apiurl + 'township/townshipexcelsave';
        this.http.post(url, this.all_sheet_data, this.ics.getOptions()).subscribe(
          (data: any) => {
            if (data.message == "success") {
              this.ics.showToast(this.tostCtrl, "Message", "Success", 1000);
              el.dismiss();
            }
          },
          (error: any) => {

            this.ics.showToast(this.tostCtrl, "Message", "Fail", 1000);
          })
        el.onDidDismiss().then(
          el => {

          }
        )
      }
    )


  }

  sampleExcelDownload() {
    let exampleData: any = [];
    exampleData = this.sampleExcelData();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exampleData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, "Sample_Township");

  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  sampleExcelData() {
    return [
      {
        "SR_Pcode": "MMR013",
        "District_Pcode": "MMR013D001",
        "District_Name": "Yangon (North)",
        "Tsp_Pcode": "MMR013007",
        "Township_Name": "Shwepyithar",
        "t4": "",
        "t5": "",
        "t6": "",
        "t7": ""
      },
      {
        "SR_Pcode": "MMR013",
        "District_Pcode": "MMR013D002",
        "District_Name": "Yangon (East)",
        "Tsp_Pcode": "MMR013011",
        "Township_Name": "South Okkalapa",
        "t4": "",
        "t5": "",
        "t6": "",
        "t7": ""
      }
    ];
  }


  getCriteriaData() {
    return {
      "statename": "",
      "statecode": "",
      "districtname": "",
      "districtcode": "",
      "tspname": "",
      "tspcode": "",
      "current": "",
      "maxRow": ""
    };
  }
  allList() {
    var url = "";
    var param = {};
    param = {
      "code": "",
      "description": ""
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




  }
  search() {
    this.criteria.maxRow = this.config.itemsPerPage;
    this.config.currentPage = 1;
    this.spinner = true;
    const url = this.ics.appConfig.apiurl + 'township/searchtownship';
    this.http.post(url, this.criteria, this.ics.getOptions()).subscribe(
      (data: any) => {

        console.log(data);
        if (data.tspList != null && data.tspList != undefined && data.tspList.length > 0) {
          this._tspList = data.tspList;
          this.spinner = false;
        } else {
          this.ics.showToast(this.tostCtrl, "Message", "No Record!", 1000)
          this._tspList = [];
          this.spinner = false;
        }
      },
      error => { 
        this.spinner = false;
      }
    );
  }


  advanceSearchReset() {
    this.criteria = this.getCriteriaData();
    this.getTownShipList();
    this.getAll();
  }

  getAll() {
    this.spinner = true;
    let url: string = this.ics.appConfig.apiurl + 'township/searchtownship';
    this.http.post(url, this.tspobj, this.ics.getOptions()).subscribe(
      (data: any) => {
        console.log(data);
        if (data.tspList != null && data.tspList != undefined && data.tspList.length > 0) {
          this._tspList = data.tspList;
          this.tspobj = this.getTspObj();
          this.spinner = false;
        } 
      },
      error => { 
        this.spinner = false;
      }
    );
  }

  print() {

  }

}