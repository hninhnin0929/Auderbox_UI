import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { Events } from "@ionic/angular";

import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import {
  IonContent,
  AlertController,
  NavController,
  ModalController,
  ToastController,
  LoadingController,
} from "@ionic/angular";
import { Subscription } from "rxjs";

import { HttpClient } from "@angular/common/http";
import { ControllerService } from "../controller.service";
import { AppComponent } from "../app.component";
import * as FileSaver from "file-saver";
import { Workbook } from "exceljs";
import { FormControl } from "@angular/forms";

const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const EXCEL_EXTENSION = ".xlsx";
var date = new Date();
var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
console.log(firstDay);
console.log(lastDay);
declare var $: any;
@Component({
  selector: "app-survey-transaction-report",
  templateUrl: "./survey-transaction-report.page.html",
  styleUrls: ["./survey-transaction-report.page.scss"],
})
export class SurveyTransactionReportPage implements OnInit, AfterViewInit {
  stockCodeSearch: FormControl = new FormControl();
  stockNameSearch: FormControl = new FormControl();
  config = {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0,
  };

  surveyTransactionList: any = [];
  personList: any = [];
  load: boolean = false;

  spinner: boolean = false;
  searchtab: boolean = false;
  criteria: any = this.getCriteriaData();
  searchCriteria: any = this.getCriteriaData();
  _stateList: any;
  statesyskey: any;
  _tspList: any;
  tspNameSearch: FormControl = new FormControl();
  staobj = this.getStateObj();
  disobj = this.getDistrictObj();
  tspobj = this.getTspObj();
  detailview: boolean = false;
  statesysksey: any;

  constructor(
    public manager: ControllerService,
    public http: HttpClient,
    public router: Router,
    public alertController: AlertController,
    private ics: ControllerService,
    public event: Events,
    public app: AppComponent,
    public tostCtrl: ToastController,
    public activatedRoute: ActivatedRoute,
    public loading: LoadingController
  ) {
    this.manager.isLoginUser();
    //this.getStateList();
  }
  ngAfterViewInit(): void {
    this.tspNameSearch.valueChanges.subscribe((changes: string) => {
      if (changes == "") {
        this._tspList = [];
      }
    });
  }

  define = [{}];

  ngOnInit() {
    this.manager.isLoginUser();
  }

  async ionViewWillEnter() {
    // this.getTspListForAutoComplete( "");
    this.manager.isLoginUser();
    this.getStateList();
    this.criteria.dateOptions = "today";
    this.dateOptionsChange();
    this.search(0);
    $("#report-survey-tab").tab("show");
  }

  ionViewDidEnter() {
    this.load = true;
  }

  new() {
    this.router.navigate(["/personshop-new"]);
  }

  runSpinner(t: boolean) {
    this.spinner = t;
  }

  advanceSearch(option) {
    this.searchtab = option;
  }
  advanceSearchReset() {
    this.criteria = this.getCriteriaData();
    this.searchCriteria = this.getCriteriaData();
    this.criteria.dateOptions = "today";
    this.dateOptionsChange();
    this.search(0);
  }
  dateOptionsChange() {
    let dateOption = this.manager.getDateOptions(this.criteria.dateOptions);
    this.criteria.fromdate = dateOption.fromDate;
    this.criteria.todate = dateOption.toDate;
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
      Usersyskey: "",
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
    };
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
    };
  }

  getStateList() {
    const url = this.ics.appConfig.apiurl + "placecode/state";
    var param = {
      code: "",
      description: "",
    };
    var subscribe = this.http
      .post(url, param, this.ics.getOptions())
      .subscribe((data: any) => {
        this._stateList = data.dataList;
        this._stateList.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
      });
  }

  search(currIndex) {
    this.spinner = true;
    const url =
      this.manager.appConfig.apiurl + "reports/surveyTransactionReport";
    this.searchCriteria.maxRow = this.config.itemsPerPage;
    this.searchCriteria.current = currIndex;
    this.searchCriteria.fromdate = this.manager.dateFormatCorrector(
      this.manager.dateFormatter.DTPtoDB,
      this.criteria.fromdate
    );
    this.searchCriteria.todate = this.manager.dateFormatCorrector(
      this.manager.dateFormatter.DTPtoDB,
      this.criteria.todate
    );
    this.searchCriteria.surveyForm = this.criteria.surveyForm;
    this.searchCriteria.shop = this.criteria.shop;
    this.searchCriteria.answer = this.criteria.answer;
    this.searchCriteria.questionCode = this.criteria.questionCode;
    this.searchCriteria.township = this.criteria.township;
    this.searchCriteria.questionDesc = this.criteria.questionDesc;
    this.searchCriteria.section = this.criteria.section;
    this.searchCriteria.surveyor = this.criteria.surveyor;
    this.searchCriteria.type = this.criteria.type;
    this.searchCriteria.Phone = this.criteria.Phone;
    this.searchCriteria.state = this.criteria.state;
    if (this.searchCriteria.fromdate.toString() == "false") {
      this.alert("Message", "Add Correct Date Format");
      this.searchCriteria.fromdate = "";
    }
    if (this.searchCriteria.todate.toString() == "false") {
      this.alert("Message", "Add Correct Date Format");
      this.searchCriteria.todate = "";
    } else {
      this.http
        .post(url, this.searchCriteria, this.manager.getOptions())
        .subscribe((data: any) => {
          this.spinner = false;
          this.surveyTransactionList = [];
          this.surveyTransactionList = data.dataList;
          this.config.totalItems = data.rowCount;

          if (currIndex == 0) {
            this.config.currentPage = 1;
          }
          for (var i = 0; i < this.surveyTransactionList.length; i++) {
            this.surveyTransactionList[i].CreatedDate =
              this.manager.dateFormatCorrector(
                this.manager.dateFormatter.DBtoUI,
                this.surveyTransactionList[i].CreatedDate
              );
            if (this.surveyTransactionList[i].AnswerCode == null) {
              this.surveyTransactionList[i].AnswerCode = "";
            }
            if(this.surveyTransactionList[i].photoDesc == "NotAvaliable"){
              this.surveyTransactionList[i].photoDesc = "Not Applicable";
            }
          }
        });
    }
  }

  pageChanged(e) {
    this.config.currentPage = e;
    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.search(currentIndex);
  }

  print() {
    this.loading
      .create({
        message: "Processing..",
        backdropDismiss: false,
      })
      .then((el) => {
        el.present();
        const url =
          this.manager.appConfig.apiurl +
          "reports/surveyTransactionExcelReport";
        this.criteria.maxRow = "";
        this.criteria.current = "";
        if (this.criteria.fromdate.toString() != "") {
          this.criteria.fromdate = this.manager.dateFormatCorrector(
            this.manager.dateFormatter.DTPtoDB,
            this.criteria.fromdate
          );
          console.log(this.criteria.fromdate + "dateeeee");
        }
        if (this.criteria.todate.toString() != "") {
          this.criteria.todate = this.manager.dateFormatCorrector(
            this.manager.dateFormatter.DTPtoDB,
            this.criteria.todate
          );
          console.log(this.criteria.todate + "dateeeee");
        }

        this.http
          .post(url, this.criteria, this.manager.getOptions())
          .subscribe((data: any) => {
            let cri_date1 = "";
            let cri_date2 = "";
            if (this.criteria.fromdate.toString() != "") {
              cri_date1 = this.manager
                .dateFormatCorrector(
                  this.manager.dateFormatter.DBtoUI,
                  this.criteria.fromdate
                )
                .toString();
            }
            if (this.criteria.todate.toString() != "") {
              cri_date2 = this.manager
                .dateFormatCorrector(
                  this.manager.dateFormatter.DBtoUI,
                  this.criteria.todate
                )
                .toString();
            }
            if (data.message == "SUCCESS") {
              el.dismiss();
              let data1 = data.dataList;
              let cri_flag = 0;
              let excel_date = "";

              let excelTitle = "Survey Transaction Report";
              let excelHeaderData = [
                "Date",
                "State",
                "Township",
                "Store ID",
                "Store Name",
                "Store Owner",
                "Store Phno",
                "Email",
                "Comment",
                "Survey Form",
                "Section",
                "Question Type",
                "Question No",
                "Question Description",
                "Answer",
                "Surveyor",
                "t4",
                "t5",
                "t6",
                "t7",
                "LATITUDE",
                "LOGNITUDE",
                "Plus Code",
              ];
              let excelDataList: any = [];
              let workbook = new Workbook();
              let worksheet = workbook.addWorksheet("Survey Transaction Data");
              for (var exCount = 0; exCount < data1.length; exCount++) {
                let excelData: any = [];
                excel_date = this.manager
                  .dateFormatCorrector(
                    this.manager.dateFormatter.DBtoUI,
                    data1[exCount].CreatedDate
                  )
                  .toString();
                excelData.push(excel_date);
                excelData.push(data1[exCount].state);
                excelData.push(data1[exCount].Township);
                excelData.push(data1[exCount].storeID);
                excelData.push(data1[exCount].ShopDescription);
                excelData.push(data1[exCount].Storeowner);
                excelData.push(data1[exCount].storephno);
                excelData.push(data1[exCount].Email);
                excelData.push(data1[exCount].Comment);
                excelData.push(data1[exCount].HeaderDescription);
                excelData.push(data1[exCount].SectionDesc);
                excelData.push(data1[exCount].TypeDesc);
                excelData.push(data1[exCount].QuestionCode);
                excelData.push(data1[exCount].QuestionDescription);
                if (data1[exCount].AnswerCode == null) {
                  data1[exCount].AnswerCode = "";
                }
                if(data1[exCount].photoDesc == "NotAvaliable"){
                  data1[exCount].photoDesc = "Not Applicable";
                }
                excelData.push(
                  data1[exCount].AnswerCode.length == 0
                    ? data1[exCount].photoDesc
                    : data1[exCount].AnswerCode
                );
                excelData.push(data1[exCount].Surveyor);
                excelData.push(data1[exCount].t4);
                excelData.push(data1[exCount].t5);
                excelData.push(data1[exCount].t6);
                excelData.push(data1[exCount].t7);
                excelData.push(data1[exCount].LATITUDE);
                excelData.push(data1[exCount].LOGNITUDE);
                excelData.push(data1[exCount].PlusCode);
                excelDataList.push(excelData);
              }

              let titleRow = worksheet.addRow(["", "", excelTitle]);
              titleRow.font = { bold: true };
              worksheet.addRow([]);

              let criteriaRow;
              if (cri_date1.toString() != "") {
                criteriaRow = worksheet.addRow([
                  "From Date : " + cri_date1.toString(),
                ]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (cri_date2.toString() != "") {
                criteriaRow = worksheet.addRow([
                  "To Date : " + cri_date2.toString(),
                ]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if (this.criteria.township.toString() != "") {
                criteriaRow = worksheet.addRow([
                  "Township : " + this.criteria.township.toString(),
                ]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.shop.toString() != "") {
                criteriaRow = worksheet.addRow([
                  "Store Name : " + this.criteria.shop.toString(),
                ]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.shop.toString() != "") {
                criteriaRow = worksheet.addRow([
                  "Store Owner : " + this.criteria.shop.toString(),
                ]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.shop.toString() != "") {
                criteriaRow = worksheet.addRow([
                  "Store Phno : " + this.criteria.shop.toString(),
                ]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.shop.toString() != "") {
                criteriaRow = worksheet.addRow([
                  "Email : " + this.criteria.shop.toString(),
                ]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.shop.toString() != "") {
                criteriaRow = worksheet.addRow([
                  "Comment : " + this.criteria.shop.toString(),
                ]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.surveyForm.toString() != "") {
                criteriaRow = worksheet.addRow([
                  "Survey Form : " + this.criteria.surveyForm.toString(),
                ]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.section.toString() != "") {
                criteriaRow = worksheet.addRow([
                  "Section : " + this.criteria.section.toString(),
                ]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }

              if (this.criteria.type.toString() != "") {
                criteriaRow = worksheet.addRow([
                  "Question Type : " + this.criteria.type.toString(),
                ]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.questionCode.toString() != "") {
                criteriaRow = worksheet.addRow([
                  "Question No: " + this.criteria.questionCode.toString(),
                ]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.questionDesc.toString() != "") {
                criteriaRow = worksheet.addRow([
                  "Question Description : " +
                    this.criteria.questionDesc.toString(),
                ]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.answer.toString() != "") {
                criteriaRow = worksheet.addRow([
                  "Answer : " + this.criteria.answer.toString(),
                ]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.surveyor.toString() != "") {
                criteriaRow = worksheet.addRow([
                  "surveyor : " + this.criteria.surveyor.toString(),
                ]);
                criteriaRow.font = { bold: true };
                cri_flag++;
              }
              if (this.criteria.state.toString() != "") {
                criteriaRow = worksheet.addRow([
                  "State : " + this.criteria.state.toString(),
                ]);
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
                FileSaver.saveAs(
                  blob,
                  "Survey_Transaction_export_" +
                    new Date().getTime() +
                    EXCEL_EXTENSION
                );
              });
            }
          });
      });
  }

  alert(title, messages) {
    this.alertController
      .create({
        translucent: true,
        header: title,
        message: messages,
        buttons: [
          {
            text: "Ok",
            role: "cancel",
            handler: (ok) => {},
          },
        ],
      })
      .then((alert) => alert.present());
  }

  getCriteriaData() {
    return {
      surveyForm: "",
      shop: "",
      answer: "",
      questionCode: "",
      township: "",
      state: "",
      questionDesc: "",
      fromdate: "",
      section: "",
      surveyor: "",
      type: "",
      todate: "",
      Phone: "",
      maxRow: "",
      current: "",
      dateOptions: "",
    };
  }
  getTspListForAutoComplete() {
    $("#spinner-tsp").show();
    this.manager
      .tspNameSearchAutoFill(this.criteria.state, this.tspNameSearch.value)
      .subscribe(
        (data) => {
          this._tspList = data as any[];
          $("#spinner-tsp").hide();
        },
        (error) => {
          $("#spinner-tsp").hide();
        }
      );
  }

  listTab() {
    this.detailview = false;
    $("#report-survey-tab").tab("show");
  }
  async svrPhoto(obj) {
    this.detailview = true;
    $("#photo-view-survey-tab").tab("show");
  }
}
