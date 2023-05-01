import { Component, OnInit } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient } from '@angular/common/http';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { ThrowStmt } from '@angular/compiler';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $: any;

@Component({
  selector: 'app-sub-category',
  templateUrl: './sub-category.page.html',
  styleUrls: ['./sub-category.page.scss'],
})
export class SubCategoryPage implements OnInit {
  _List:any;
  list: any = [];
  catlist: any = [];
  spinner: boolean = false;
  searchtab: boolean = false;
  searchStkCatList: any = [];
  //subcategory: any = this.getAll();
  obj: any = this.getObj();
  config =  {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };

  btn: boolean = false;
  categoryList1: any = [];
  delete_param = this.getDefaultDeleteObject();

  dateFormatter = {
    DTPtoDB: 1,
    UItoDB: 2,
    DBtoDTP: 3,
    DBtoUI: 4
  };

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
    this.btn = false;
    this.manager.isLoginUser();
    $('#subcatlist-tab').tab('show');
    this.spinner = true;
    await this.getAll();
    this.spinner = false;
    this.allList();
  }

  listTab() {
    this.btn = false;
    this.obj = this.getObj();
    $('#subcatlist-tab').tab('show');
  }

  detailTab() {
    this.searchtab =  false;
    this.btn=true;
    $("#subcatid").val("0").change();
    this.obj = this.getObj();
    this.getCatelist();
    $('#subcatnew-tab').tab('show');
  }

  getAll() {
    if (this.manager.user.orgId.length == 0) return;
    let status = "";
    const url = this.manager.appConfig.apiurl + 'subcategory/searchSubCategoryList';
    var param = {
      code: "",
      description: "",
      categorySyskey: "0"
    };
    var subscribe = this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this._List = data;
      },
      error => {

      }
    );
  }

  getCatelist() {
    if (this.manager.user.orgId.length == 0) return;
    
    let status = "";
   const url = this.manager.appConfig.apiurl + 'stockcategory/searchStockCategoryList';
 
    var param = {
      code: "",
      description: ""
    }
    var subscribe = this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.catlist = data.catlist;
      }
    );
  }

  detail(item) {
    this.obj = item;
    this.getCatelist();
    this.btn=true;
    $('#subcatnew-tab').tab('show');
  }
  
  getObj() {
    return {
      syskey: "0",
      t1: "",
      t2: "",
      t3: "",
      n3: "0",
      date: "",
      maxRows:"",
      current:""
    }
  }

  advanceSearch(option) {
    this.searchtab = option;
    if(!this.searchtab){this.advanceSearchReset();}
  }

  search() {
    
    //let curindex=currentIndex;
    this.spinner = true;
    this.searchWithCriteria(true);
    this.list=[]
    this.spinner = false;
  }

  searchWithCriteria(booflag) {
    if (booflag) {
      this.list.splice(0, this.list.length);
    }

   // this.obj.current = this.obj.length;
    //this.obj.maxRow = 10;
   // this.obj.current=curindex;
   // this.obj.maxRows=this.config.itemsPerPage;

    const url = this.manager.appConfig.apiurl + 'subcategory/searchStockCategoryforExcel';
   // const url = this.manager.appConfig.apiurl + 'subcategory/searchSubCategoryList';

    this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.message == "SUCCESS") {
          this.config.totalItems = data.totalCount;
          // if(curindex == 0){
          //   this.config.currentPage = 1;
          // }

           this._List= data.dataList;
          let oldstkcatcount: number = this.list.length;

         /* for (let i = 0; i <this._List.length; i++) {
            let mod = { syskey: "", t1: "", t2: "", t3: "", n3: 0, date: "" };
            mod.syskey = this._List[i].stockCategorySyskey;
            mod.t1 = this._List[i].stockCategoryCode;
            mod.t2 = this._List[i].stockCategoryDesc;
            mod.t3 = "";
            mod.n3 = 0;
            mod.date = this._List[i].date;
            this.list.push(mod);
          }*/
          
        //let newstkcatcount: number = this.list.length;
        let newstkcatcount: number = this._List.length;

          this.searchStkCatList = this.list;
        
          if (!booflag) {
            if (oldstkcatcount == newstkcatcount) {
              console.log("no more data");
              $('#moretag').text('No more stock category');
            }
          }
        }

      },
      error => {

      }
    );
  }

  advanceSearchReset() {
    this.obj= this.getObj();
    this.getAll();
  }

  print() {
    const url = this.manager.appConfig.apiurl + 'subcategory/searchStockCategoryforExcel';

    this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.message == "SUCCESS") {
          let exampleData: any = [];
          let data1 = data.dataList;
          let date_str = "";

          for (let i = 0; i < data1.length; i++) {
            let mod = {
              "SubCategoryCode": "",
              "SubCategoryDesc": "",
              "Date": ""
            };
            
            mod.SubCategoryCode = data1[i].stockCategoryCode;
            mod.SubCategoryDesc = data1[i].stockCategoryDesc;
            date_str = data1[i].date;
            mod.Date = this.dateFormatCorrector(this.dateFormatter.DBtoUI, date_str).toString();
            exampleData.push(mod);
          }

          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exampleData);
          const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
          const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          this.saveAsExcelFile(excelBuffer, "Example_Template");
        }
      }
    );
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }
  
  save() {
    if (this.manager.user.orgId.length == 0) return;
    // if (this.obj.t1 == "" || this.obj.t2 == "" || this.obj.n3.toString() == "0") {
    //   this.manager.showToast(this.tost, "Message", "Fill all fields", 2000);
    //   return;
    // }
    if(this.isvalid()){
      var msg = ""
    if (this.obj.syskey.length > 3) msg = "Updating data.."
    else msg = "Saving data.."
    this.loading.create(
      {
        message: msg,
        duration: 20000
      }
    ).then(
      el => {
        el.present();
        var status = "";
        const url = this.manager.appConfig.apiurl + 'subcategory/saveSubCategory';
        var subscribe = this.http.post(url, this.obj, this.manager.getOptions()).subscribe(
          (data: any) => {
            console.log(data);
            if (data.message == "SUCCESS") {
              status = "SUCCESS!"
              el.dismiss();
            }else if (data.message == "CODEEXIST") {
              status = "CODEEXISTS!"
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
          }
        )
        el.onDidDismiss().then(
          el => {
            if (status == "SUCCESS!") {
              this.manager.showToast(this.tost, "Message", "Saved Successfully!", 2000).then(
                e => {
                  this.manager.isLoginUser();
                  this.getAll();
                  this.btn = false;
                  $('#subcatlist-tab').tab('show');
                }
              );   
            } 
            else if (status == "CODEEXISTS!") {
              this.manager.showToast(this.tost,"Message","Code Already Exists!",1000);
            } 
            else if (status == "FAIL!") {
              this.manager.showToast(this.tost, "Message", "Saving Fail!", 2000);
            } else {
              subscribe.unsubscribe();
              this.manager.showToast(this.tost, "Message", "Timeout! try again", 2000);
            }
          }
        )
      }
    )
    }   
     
  }
  valide():boolean{
    if(this.obj.t1 == "") return false;
    if(this.obj.t2 == "") return false;
   
    else return true;

  }
  getDefaultDeleteObject() {
    return { 
      //in Used // e.g. SELECT COUNT(SYSKEY) AS TOTALCOUNT FROM STK014 WHERE n3= ?
      "inUsed_RecordStatus" : "RecordStatus", 
      "inUsed_Table" : "STK001", 
      "count_Column" : "SYSKEY", 
      "inUsed_Column" : "n5", 
      //delete process  // e.g. UPDATE UVM003 SET RECORDSTATUS = 4 WHERE SYSKEY=?
      "delete_Table" : "STK042",      
      "delete_Column" : "SYSKEY",
      "delete_Key" : ""  //syskey for inUse and Delete //set this param in gotoDelete();
    };
  }
  // gotoDelete() {
  //   if (this.manager.user.orgId.length == 0) return;
  //   var msg = ""
  //   if (this.obj.syskey.length > 3) msg = "Updating data.."
  //   else msg = "Deleting data.."
  //   this.loading.create(
  //     {
  //       message: msg,
  //       duration: 20000
  //     }
  //   ).then(
  //     el => {
  //       el.present();
  //       const url = this.manager.appConfig.apiurl + 'delete/tempDelete';
  //       this.delete_param.delete_Key = this.obj.syskey;
  //       var subscribe = this.http.post(url, this.delete_param, this.manager.getOptions()).subscribe(
  //         (data: any) => {
  //           console.log(data);
  //           if (data.message == "SUCCESS!") {
  //             status = "SUCCESS!"
  //             el.dismiss();
  //           }else if (data.message == "USED!") {
  //             status = "USED!"
  //             el.dismiss();
  //           } 
  //           else {
  //             status = "FAIL!"
  //             el.dismiss();
  //           }
  //         },
  //         e => {
  //           status = "FAIL!"
  //           el.dismiss();
  //         }
  //       )
  //       el.onDidDismiss().then(
  //         el => {
  //           if (status == "SUCCESS!") {
  //             this.manager.showToast(this.tost, "Message", "Deleted Successfully!", 2000).then(
  //               e => {
  //                 this.manager.isLoginUser();
  //                 this.getAll();
  //                 this.btn = false;
  //                 $('#subcatlist-tab').tab('show');
  //               }
  //             );             
  //           } else if (status == "USED!") {
  //             this.manager.showToast(this.tost, "Message", "This SubCategory is in Used!", 2000);
  //           }
  //           else if (status == "FAIL!") {
  //             this.manager.showToast(this.tost, "Message", "Deleting Fail!", 2000);
  //           } else {
  //             subscribe.unsubscribe();
  //             this.manager.showToast(this.tost, "Message", "Timeout! try again", 2000);
  //           }
  //         }
  //       )
  //     }
  //   )
  // }
  gotoDelete() {
    if (this.manager.user.orgId.length == 0) return;
      var msg = ""
      if (this.obj.syskey.length > 3) msg = "Updating data.."
      else msg = "Deleting data.."
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
                              }else if (data.message == "USED!") {
                                status = "USED!"
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
                            }
                          )
                          el.onDidDismiss().then(
                            el => {
                              if (status == "SUCCESS!") {
                                this.manager.showToast(this.tost, "Message", "Deleted Successfully!", 2000).then(
                                  e => {
                                    this.manager.isLoginUser();
                                    this.getAll();
                                    this.btn = false;
                                    $('#subcatlist-tab').tab('show');
                                  }
                                );             
                              } else if (status == "USED!") {
                                this.manager.showToast(this.tost, "Message", "This SubCategory is in Used!", 2000);
                              }
                              else if (status == "FAIL!") {
                                this.manager.showToast(this.tost, "Message", "Deleting Fail!", 2000);
                              } else {
                                subscribe.unsubscribe();
                                this.manager.showToast(this.tost, "Message", "Timeout! try again", 2000);
                              }
                },
                (error: any) => {
                  el.dismiss();
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
  allList() {
    var url = "";
    var param = {};
    
    param = {
      "code": "",
      "description": ""
    };
    url = this.manager.appConfig.apiurl + 'stockcategory/searchStockCategoryList';
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.categoryList1 = data.catlist;
      }
    );
  }

  dateFormatCorrector(dateFormatFlag, changedDate){
    var fdate = new Date();
    var tdate = "";
    let y = "";
    let m = "";
    let d = "";

    if(dateFormatFlag == 1 || dateFormatFlag == 2){
      if(changedDate == "Invalid Date"){
        return "false";
      }

      if(dateFormatFlag == 1){
        fdate = new Date(changedDate);
        let plus1 = fdate.getMonth()+1;

        y = fdate.getFullYear().toString();
        m = (plus1 < 10)? ("0" + plus1.toString()):plus1.toString();
        d = (fdate.getDate().toString().length < 2)? ("0" + fdate.getDate().toString()):fdate.getDate().toString();
      } else {
        if(changedDate.toString().length == 10){        //    Year, Month and Day
          y = changedDate.toString().substring(6, 10);
          m = changedDate.toString().substring(3, 5);
          d = changedDate.toString().substring(0, 2);
        } else if(changedDate.toString().length == 8){  //    Year and Day
          y = changedDate.toString().substring(4, 8);
          m = "%";
          d = changedDate.toString().substring(0, 2);
        } else if(changedDate.toString().length == 7){  //    Year and Month
          y = changedDate.toString().substring(3, 7);
          m = changedDate.toString().substring(0, 2);
        } else if(changedDate.toString().length == 5){  //    Month and Day
          m = changedDate.toString().substring(3, 5);
          d = changedDate.toString().substring(0, 2);
        } else if(changedDate.toString().length == 4 || changedDate.toString().length == 2){  //  only Year or Month or Day
          d = changedDate.toString();
        } else {
          tdate = "false";
          return tdate;
        }
      }
      
      tdate = y + "" + m + "" + d;

      if(tdate == "19700101"){
        tdate = "false";
      }

      return tdate;
    } else if(dateFormatFlag == 3){
      tdate = changedDate;
      fdate = new Date(this.manager.formatDateByDb(tdate));

      return fdate;
    } else {
      y = changedDate.substring(0, 4);
      m = changedDate.substring(4, 6);
      d = changedDate.substring(6, 8);
      
      tdate = d + "/" + m + "/" + y;

      return tdate;
    }
  }

  isvalid() {
   
     if (this.obj.t1.trim().length === 0) {
      this.manager.showToast(this.tost,"Message","Warnning fill all blanks!",1000);
      return false;
    }
    else if (this.obj.t2.trim().length === 0) {
      this.manager.showToast(this.tost,"Message","Warnning fill all blanks!",1000);
      return false;
    }else if (this.obj.n3 == "0") {
      this.manager.showToast(this.tost,"Message","Warnning fill all blanks!",1000);
      return false;
    }
    else return true;
  }  

  pageChanged(e){
    this.config.currentPage = e;

    // let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    // this.search(currentIndex);
  }

  taskStatusChange(e, passData) {
    e.stopPropagation();
    const url = this.manager.appConfig.apiurl + 'subcategory/taskstatuschange';

    this.http.post(url, passData, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.message == "SUCCESS") {
          if (passData.n2 == 0) {
            passData.n2 = 1;
          } else if (passData.n2 == 1) {
            passData.n2 = 0;
          }

          this.manager.showToast(this.tost, "Message", "Status changed", 1000);
        } else {
          this.manager.showToast(this.tost, "Message", "Status didn't changed", 1000);
        }
      }
    );
  }

}
