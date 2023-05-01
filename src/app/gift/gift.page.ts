import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient } from '@angular/common/http';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { FormControl } from '@angular/forms';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
declare var $: any;
@Component({
  selector: 'app-gift',
  templateUrl: './gift.page.html',
  styleUrls: ['./gift.page.scss'],
})
export class GiftPage implements OnInit {
  btn:boolean = false;
  list : any = [];
  obj: any = this.getObj();
  searchtab :boolean = false;
  spinner: boolean = false;
  stockList1: any = [];
  stockList2: any = [];
  stockNameSearch: FormControl = new FormControl();
  search_param = this.getdefaultSearchObject();
  constructor(
    public manager: ControllerService,
    public http: HttpClient,
    public loading: LoadingController,
    public alertController: AlertController,
    public tost: ToastController,
    private loadCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.manager.isLoginUser();
  }
  async ionViewWillEnter()
  {
    this.manager.isLoginUser();
    this.obj = this.getObj();
    this.search_param = this.getdefaultSearchObject();
    this.getAll();
    $('#giftSKU-list-tab').tab('show');
    await this.getAll();
    this.allList();
  }

  listTab()
  {
    this.ionViewWillEnter();
  }
  advanceSearch(option)
  {
    this.searchtab = option;
    if(!this.searchtab){this.refresh();}
  }

  refresh(){
    this.search_param = this.getdefaultSearchObject();
    this.getAll();
  }
  // new(){
  //   this.searchtab = false;
  //   this.obj = this.getObj();
  //   $('#packtype-new-tab').tab('show');
  // }
  newTabClick(e){
    this.search_param = this.getdefaultSearchObject();
    this.obj = this.getObj();
    this.getAll();
    this.getCategoryList()
    $('#giftSKU-new-tab').tab('show');
  }

  giftStatusChange(detail){
    const param = {
      "n2": detail.n2.toString(),
      "syskey": detail.syskey
    };

    this.giftStatusChangeService(param).then( 
      ()=>{
        this.manager.showToast(this.tost, "Message", "Status changed", 1000);
        if(detail.n2.toString() == "0"){
          detail.n2 = "1";
          detail.switch = 0;
        } else if(detail.n2.toString() == "1"){
          detail.n2 = "0";
          detail.switch = 1;
        }
      }
    ).catch( 
      ()=>{
        detail.n2 = detail.n2 ? false : true;
        this.manager.showToast(this.tost, "Message", "Status didn't change", 1000);
      }
    );
  }

  giftStatusChangeService(p){
    return new Promise<void>( 
      (done,reject)=>{
        const url = this.manager.appConfig.apiurl +'Gift/giftStatusChange';

        this.http.post(url, p, this.manager.getOptions()).subscribe(
          (data:any) =>{
            if(data.message == "SUCCESS"){
              done();
            } else {
              reject();
            }
          },
          error=>{
            reject()
          }
        );
      }
    );
  }

  detail(obj)
  {
    this.btn = true;
    this.obj = this.getObj();
    this.obj.syskey = obj.syskey;
    this.obj.t1 = obj.t1;
    this.obj.t2 = obj.t2;
    this.getCategoryList()
    this.obj.n1 = obj.n1;
    if(obj.n3 == 1)
    {
      this.obj.isPOSM = true;
    }
    $('#giftSKU-new-tab').tab('show');
  }
  getAll()
  {
    this.btn = false;
    this.spinner = true;
    const url = this.manager.appConfig.apiurl + 'Gift/getGift';
    var param = {"t1" : this.search_param.code, "t2": this.search_param.description};
    var subscribe = this.http.post(url,param,this.manager.getOptions()).subscribe
    (
      (data : any) =>{
        this.list = data.giftdata;
        this.list.map(l => {
          if(l.n2.toString() == "0"){
            l.switch = 1;
          } else if(l.n2.toString() == "1"){
            l.switch = 0;
          }
        });
      },
       error => { this.spinner= false; },
       () => { this.spinner = false; }
    )
  }

  save() {
    if(this.obj.t1.trim().length === 0 || this.obj.t2.trim().length === 0)
    {
      this.manager.showToast(this.tost,"Message","Please fill code and description",1000);
    }else
    {
    if(this.isvalid()){
      var msg = ""
    if(this.obj.syskey.length>3) msg = "Updating data.."
    else msg = "Saving data.."
    this.loading.create(
      {
        message: msg,
        duration: 20000
      }
    ).then(
      el => {
        var status="";
        el.present();
        this.obj.n3 = (this.obj.isPOSM ? 1 : 0);
        const url = this.manager.appConfig.apiurl + 'Gift/saveGift';
        var subscribe = this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
          (data: any) => {
            console.log(data);
            if (data.message == "Success") {
              status = "SUCCESS!"
              el.dismiss();
            } else if (data.message == "CodeExist"){
              status = "CODEEXISTS!"
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
              this.manager.showToast(this.tost,"Message","Saved Successfully!",1000).then(
                e => {
                  this.getAll();
                  $('#giftSKU-list-tab').tab('show');
                }
              );             
            } else if (status == "CODEEXISTS!") {
              this.manager.showToast(this.tost,"Message","Code Already Exists!",1000);
            } else {
              this.manager.showToast(this.tost,"Message","Saving Fail!",1000);
            }
          }
        )
      }
    )
    }
  }
}

  // gotoDelete() {
  //   if (this.manager.user.orgId.length == 0) return;
  //   var msg = "Deleting Data"
  //   this.loading.create(
  //     {
  //       message: msg,
  //       duration: 20000
  //     }
  //   ).then(
  //     el => {
  //       el.present();
  //       const url = this.manager.appConfig.apiurl + 'Gift/deleteGift';
  //       console.log(this.obj.syskey);
  //       var subscribe = this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
  //         (data: any) => {
  //           console.log(data);
  //           if (data.message == "deleteSuccess") {
  //             status = "SUCCESS!"
  //             el.dismiss();
  //           }
  //           //  else if(data.message == "USED!"){
  //           //   status = "USED!"
  //           //   el.dismiss();
  //           // }else {
  //           //   status = "FAIL!"
  //           //   el.dismiss();
  //           // }
  //         },
  //         e => {
  //           status = "FAIL!"
  //           el.dismiss();
  //         }
  //       )
  //       el.onDidDismiss().then(
  //         el => {
  //           if (status == "SUCCESS!") {
  //             this.manager.showToast(this.tost,"Message","Deleted Successfully!",1000).then(
  //               e => {
  //                 this.getAll();
  //                 $('#giftSKU-list-tab').tab('show');
  //               }
  //             );             
  //           }
  //           //  else if (status == "USED!") {
  //           //   this.manager.showToast(this.tost,"Message","This Pack Type is in Used!",1000);
  //           // } 
  //           else {
  //             this.manager.showToast(this.tost,"Message","Deleteing Fail!",1000);
  //           }

  //         }
  //       )
  //     }
  //   )
  // }

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
              const url = this.manager.appConfig.apiurl + 'Gift/deleteGift';
              var subscribe = this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
                (data: any) => {
                  el.dismiss();
                  if (data.message == "deleteSuccess") {
                    this.manager.showToast(this.tost,"Message","Deleted Successfully!",1000).then(
                      e => {
                        this.getAll();
                        $('#giftSKU-list-tab').tab('show');
                      }
                      );
                    //   } else if (data.message == "USED!") {
                    //       this.manager.showToast(this.tost,"Message","This Pack Type is in Used!",1000);
                    //  } 
                     } else {
                          this.manager.showToast(this.tost,"Message","Deleteing Fail!",1000);
                       }
                        },
                        (error: any) => {
                          this.manager.showToast(this.tost,"Message","Deleteing Fail!",1000);
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

  allList()
  {
    this.stockNameSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.stockNameSearchAutoFill(term).subscribe(
            data => {
              this.stockList1 = data as any[];
            });
        }
      }
    );
  }
  isvalid() {
    if (this.obj.t1.trim().length === 0) {
      this.manager.showToast(this.tost,"Message","Invalid Code!",1000);
      return false;
    }
    else if (this.obj.t2.trim().length === 0) {
      this.manager.showToast(this.tost,"Message","Invalid Description!",1000);
      return false;
    }
    else return true;
  } 
  
  getObj()
  {
    return{
      syskey : "",
      t1 : "",
      t2 : "",
      stockdescription : "",
      isPOSM : false,
      n3: 0
    }
  }
  getdefaultSearchObject()
  {
    return{ "code": "","description" : ""};
  }

  getCategoryList() {
    this.stockList2 = [];
    const url = this.manager.appConfig.apiurl + 'StockSetup/StockList';
    var param = {
      code: '',
      description: '',
      currentPage: 1,
      pageSize: 1,
    }
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        // this.loaded.p4 = true;
        this.stockList2 = [];
        this.stockList2 = data;
      }
    )
  }

  setDescription()
  {
    console.log(this.obj.n1);
    this.stockList2.forEach(element => {
      if (element.skusyskey === this.obj.n1) {
        this.obj.t2 = element.skuName;
      }
    });
    
  }

  print() {
    this.loadCtrl.create({
      message: "Processing..",

      backdropDismiss: false
    }).then(
      el => {
        el.present();
        const url = this.manager.appConfig.apiurl + 'Gift/getGift';
        var param = {"t1" : this.search_param.code, "t2": this.search_param.description};
        this.http.post(url, param, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            if (data.message == "SUCCESS") {

              let data1 = data.giftdata;
              let cri_flag = 0;
              let type_flag = "";

              let excelTitle = "GiftSKU Report";
              let excelHeaderData = [
                "Created Date "," Code ", " Description ", " Stock Description "
              ];
              let excelDataList: any = [];
              for (var exCount = 0; exCount < data1.length; exCount++) {
                let excelData: any = [];
                data1[exCount].createdDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data1[exCount].createddate);
                excelData.push(data1[exCount].createdDate);
                excelData.push(data1[exCount].t1);
                excelData.push(data1[exCount].t2);
                excelData.push(data1[exCount].stockdescription);
                excelDataList.push(excelData);
              }

              let workbook = new Workbook();
              let worksheet = workbook.addWorksheet('Gift Data');

              let titleRow = worksheet.addRow(["", "", excelTitle]);
              titleRow.font = { bold: true };
              worksheet.addRow([]);

              let criteriaRow;
              if (this.search_param.code.toString() != "") {
                criteriaRow = worksheet.addRow([" Code : " + this.search_param.code.toString()]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.search_param.description.toString() != "") {
                criteriaRow = worksheet.addRow([" Description : " + this.search_param.description.toString()]);
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
                FileSaver.saveAs(blob, "Gift_export_" + new Date().getTime() + EXCEL_EXTENSION);
              });
            }
          }
        );
      })
  }

}
