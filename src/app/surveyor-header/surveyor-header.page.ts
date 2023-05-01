import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ControllerService } from '../controller.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { FormControl } from '@angular/forms';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $: any;

@Component({
  selector: 'app-surveyor-header',
  templateUrl: './surveyor-header.page.html',
  styleUrls: ['./surveyor-header.page.scss'],
})
export class SurveyorHeaderPage implements OnInit {

  config =  {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };

  spinner: boolean = false;
  searchtab: boolean = false;
  btn: any = false;
  dtlFlag: any = false;

  criteria: any = this.getCriteriaData();
  searchCriteria: any = this.getCriteriaData();

  headerList: any = [];
  saveData: any = this.getSaveData();

  svNameList: any = [];
  qnList: any = [];
  qList: any = [];
  qnSaveList: any = [];
  qnSaveListIndex: any = "";

  svNameSearch: FormControl = new FormControl();
  qnNameSearch: FormControl = new FormControl();
  qNameSearch: FormControl = new FormControl();

  catlist: any = [];
  _standardList = [ { "value": 1, "caption": "Yes"}, { "value": 0, "caption": "No"}];
  
  rcheck: String = "0";
  useSectionFlag: any = true;

  constructor(
    private http: HttpClient,
    private manager: ControllerService,
    public alertController: AlertController,
    public loading: LoadingController,
    public tostCtrl: ToastController
  ) { }

  ngOnInit() {
    this.getCatelist();        
  }

  ionViewWillEnter() {
    $("#surveyorHdrNew").hide();
    $("#surveyorHdrList").show();
    $("#surveyorHdrList-tab").tab("show");
    $('#surveyCode').css('border-color', '');

    this.btn = false;
    this.dtlFlag = false;
    this.useSectionFlag = true;

    this.manager.isLoginUser();

    this.clearProperties();
    this.runSpinner(true);
    this.allList();
    this.runSpinner(false);
    this.getAllDataList();
  }

  surveyorHdrListTab(){
    $('#surveyorHdrNew').hide();
    $('#surveyorHdrList').show();

    this.getAllDataList();
  }

  surveyorHdrNewTab(){
    $('#surveyorHdrList').hide();
    $('#surveyorHdrNew').show();
    $('#surveyCode').css('border-color', '');
    $("#radio1").attr('checked',true);
    // $("#use-section").val("1").change();

    this.dtlFlag = false;
    this.btn = true;
    this.useSectionFlag = true;

    this.clearProperties();
    this.allList();
    this.getCatelist();
    
    this.saveData.n2 = 0;
    this.rcheck = "0";

    let tempID = "";
    for(let loop = 0; loop < this.qnSaveList.length; loop++){
      tempID = "#" + this.qnSaveList[loop].syskey;
      $(tempID).prop("disabled", false);
    }
    // $('#0').hide().next().hide();
  }

  advanceSearch(option) {
    this.searchtab = option;
  }

  runSpinner(t: boolean) {
    this.spinner = t;
  }

  focusFunction() {
    $('#surveyCode').css('border-color', '');
  }

  dateChange1(event){
    if(this.criteria.toDate != "" || this.criteria.toDate != undefined){
      let tempFromDate = new Date(event.target.value);
      let tempToDate = new Date(this.criteria.toDate);

      tempFromDate.setHours(0, 0, 0, 0);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.manager.showToast(this.tostCtrl, "Message", "From Date must be sooner than To Date", 5000);
        this.criteria.fromDate = "";
        this.criteria.toDate = "";
      }
    }
  }

  dateChange2(event){
    if(this.criteria.fromDate == "" || this.criteria.fromDate == undefined){
      this.criteria.toDate = "";
      $("#tDate").val("").trigger("change");
      this.manager.showToast(this.tostCtrl, "Message", "Add From Date First", 2000);
    } else {
      let tempFromDate = new Date(this.criteria.fromDate);
      let tempToDate = new Date(event.target.value);

      tempFromDate.setHours(0, 0, 0, 0);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.criteria.toDate = "";
        $("#tDate").val("").trigger("change");
        this.manager.showToast(this.tostCtrl, "Message", "To Date must be later than From Date", 3000);
      }
    }
  }

  dateChange3(event){
    let tempFromDate = new Date(event.target.value);
    tempFromDate.setHours(0, 0, 0, 0);

    if(this.saveData.t4 != "" || this.saveData.t4 != undefined){
      let tempToDate = new Date(this.saveData.t4);

      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.manager.showToast(this.tostCtrl, "Message", "From Date must be sooner than To Date", 5000);
        this.saveData.t3 = "";
        this.saveData.t4 = "";
      }
    }

    let tempToday = new Date();
    tempToday.setHours(0, 0, 0, 0);

    if (+tempToday > +tempFromDate) {
      this.manager.showToast(this.tostCtrl, "Message", "From Date must be later than Today", 5000);
      this.saveData.t3 = "";
      $("#svrHdrt3").val("").trigger("change");
    }
  }

  dateChange4(event){
    if(this.saveData.t3 == "" || this.saveData.t3 == undefined){
      this.saveData.t4 = "";
      $("#svrHdrt4").val("").trigger("change");
      this.manager.showToast(this.tostCtrl, "Message", "Add From Date First", 2000);
    } else {
      let tempFromDate = new Date(this.saveData.t3);
      let tempToDate = new Date(event.target.value);

      tempFromDate.setHours(0, 0, 0, 0);
      tempToDate.setHours(0, 0, 0, 0);

      if (+tempFromDate > +tempToDate) {
        this.saveData.t4 = "";
        $("#svrHdrt4").val("").trigger("change");
        this.manager.showToast(this.tostCtrl, "Message", "To Date must be later than From Date", 3000);
      }
    }
  }

  dblClickFunc1(){
    this.criteria.fromDate = "";
    this.criteria.toDate = "";
  }

  dblClickFunc2(){
    this.criteria.toDate = "";
  }

  dblClickFunc3(){
    this.saveData.t3 = "";
    this.saveData.t4 = "";
  }

  dblClickFunc4(){
    this.saveData.t4 = "";
  }

  dblClickFunc5(){
    this.criteria.validDate = "";
  }

  headerStatusChange(e, passData){
    e.stopPropagation();
    const url = this.manager.appConfig.apiurl +'surveyor/headerStatusChange';

    this.http.post(url, passData, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          if(passData.status == "0"){
            passData.status = "1";
          } else if(passData.status == "1"){
            passData.status = "0";
          }
        }
      }
    );
  }

  IsUserSection(e){
    let value = e.source._value;

    if(value == "0"){
      this.useSectionFlag = false;
      let temp_obj = {
        "juncSyskey": "",
        "sectionSyskey": "",
        "sectionDescription": "",
        "status": "",
        "questions": []
      };

      if(this.saveData.sections.length > 0){
        let tempID = "";
        
        for(let loop = 0; loop < this.qnSaveList.length; loop++){
          if(this.qnSaveList[loop].syskey != '0'){
            tempID = "#" + this.qnSaveList[loop].syskey;
            $(tempID).prop("checked", false);
          }
        }

        this.saveData.sections.splice(0, this.saveData.sections.length);
      }

      temp_obj.sectionSyskey = "0";
      temp_obj.sectionDescription = "Other";

      this.saveData.sections.push(temp_obj);
    } else {
      this.useSectionFlag = true;
      this.saveData.sections.splice(0, this.saveData.sections.length);
    }
  }

  getSectionData(event, qnSaveListIndex){
    let juncExist = false;
    let saveDataIndex = 0;

    for(let i = 0; i < this.saveData.sections.length; i++){
      if(this.qnSaveList[qnSaveListIndex].syskey == this.saveData.sections[i].sectionSyskey){
        saveDataIndex = i;

        if(this.saveData.sections[i].juncSyskey != "" && this.saveData.sections[i].juncSyskey != "0"){
          juncExist = true;
        }

        break;
      }
    }

    if(event.currentTarget.checked == true){
      if(juncExist){
        this.saveData.sections[saveDataIndex].status = "1";
      } else {
        let temp_obj = {
          "juncSyskey": "",
          "sectionSyskey": "",
          "sectionDescription": "",
          "status": "",
          "questions": [
            {
              "questionSyskey": "",
              "questionDescription": ""
            }
          ]
        };
  
        temp_obj.sectionSyskey = this.qnSaveList[qnSaveListIndex].syskey;
        temp_obj.sectionDescription = this.qnSaveList[qnSaveListIndex].t2;
  
        this.saveData.sections.push(temp_obj);
  
        if(this.saveData.sections[0].sectionSyskey == "" && this.saveData.sections[0].sectionDescription == ""){
          this.saveData.sections.splice(0, 1);
        }
      }
    } else {
      /*
      for(let i = 0; i < this.saveData.sections.length; i++){
        if(this.qnSaveList[qnSaveListIndex].syskey == this.saveData.sections[i].sectionSyskey){
          this.saveData.sections.splice(i, 1);
          break;
        }
      }
      */
      
      if(juncExist == true){
        this.saveData.sections[saveDataIndex].status = "0";
      } else {
        this.saveData.sections.splice(saveDataIndex, 1);
      }
    }
  }

  getAllDataList(){
    this.criteria = this.getCriteriaData();
    this.criteria.maxRows = this.config.itemsPerPage;
    this.criteria.current = "0";

    const url = this.manager.appConfig.apiurl +'surveyor/allSurveyorHeaderListWeb';

    this.http.post(url, this.criteria, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.config.totalItems = data.rowCount;
          this.config.currentPage = 1;

          this.headerList = data.dataList;

          for(var i = 0; i < this.headerList.length; i++){
            this.headerList[i].fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.headerList[i].fromDate);
            this.headerList[i].toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.headerList[i].toDate);
          }
        }
      }
    );
  }

  search(currIndex, criFlag){
    this.searchCriteria.maxRows = this.config.itemsPerPage;
    this.searchCriteria.current = currIndex;

    const url = this.manager.appConfig.apiurl +'surveyor/allSurveyorHeaderListWeb';

    let send_data1 = this.criteria.t3;
    let send_data2 = this.criteria.t4;
    let send_data3 = this.criteria.fromDate;
    let send_data4 = this.criteria.toDate;
    if(this.criteria.t3 != ""){
      this.criteria.t3 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.t3);
    }
    if(this.criteria.t4 != ""){
      this.criteria.t4 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.t4);
    }
    if(this.criteria.fromDate != ""){
      this.criteria.fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.fromDate);
    }
    if(this.criteria.toDate != ""){
      this.criteria.toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.toDate);
    }

    if(criFlag == true){
      this.searchCriteria.headerDesc = this.criteria.headerDesc;
      this.searchCriteria.questionDesc = this.criteria.questionDesc;
      this.searchCriteria.sectionDesc = this.criteria.sectionDesc;
      this.searchCriteria.t3 = this.criteria.t3;
      this.searchCriteria.t4 = this.criteria.t4;
      this.searchCriteria.fromDate = this.criteria.fromDate;
      this.searchCriteria.toDate = this.criteria.toDate;
      this.searchCriteria.n1 = this.criteria.n1;
    }
    
    this.http.post(url, this.searchCriteria, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.criteria.t3 = send_data1;
          this.criteria.t4 = send_data2;
          this.criteria.fromDate = send_data3;
          this.criteria.toDate = send_data4;
          this.config.totalItems = data.rowCount;

          if(currIndex == 0){
            this.config.currentPage = 1;
          }

          this.headerList = data.dataList;

          for(var i = 0; i < this.headerList.length; i++){
            this.headerList[i].fromDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.headerList[i].fromDate);
            this.headerList[i].toDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.headerList[i].toDate);
          }
        }
      }
    );
  }

  detail(event, index){
    if(event.target.id.toString() != "statusChangeEvent"){
      $("#surveyorHdrNew").show();
      $("#surveyorHdrList").hide();
      $("#surveyorHdrNew-tab").tab("show");

      this.btn = true;
      this.dtlFlag = true;

      let temp_saveData_section = {
        "juncSyskey": "",
        "sectionSyskey": "",
        "sectionDescription": "",
        "status": "",
        "questions": [
          {
            "questionSyskey": "",
            "questionDescription": ""
          }
        ]
      };
      let temp_saveData_questions = {
        "questionSyskey": "",
        "questionDescription": ""
      };
      let cbID = "";
      let clearCbID = "";

      for(var t = 0; t < this.qnSaveList.length; t++){
        clearCbID = "#" + this.qnSaveList[t].syskey;
        $(clearCbID).prop("checked", false);
      }

      this.saveData.headerSyskey = this.headerList[index].headerSyskey;
      this.saveData.headerCode = this.headerList[index].headerCode;
      this.saveData.headerDescription = this.headerList[index].headerDescription;
      this.saveData.status = this.headerList[index].status;
      this.saveData.n2 = this.headerList[index].standard;
      this.saveData.n3 = this.headerList[index].categorySyskey; 
      this.saveData.t3 = this.manager.dateFormatCorrector(this.manager.dateFormatter.UItoDTP, this.headerList[index].fromDate);
      this.saveData.t4 = this.manager.dateFormatCorrector(this.manager.dateFormatter.UItoDTP, this.headerList[index].toDate);
      this.saveData.sections.splice(0, this.saveData.sections.length);

      this.rcheck = ""+this.saveData.n2;
      for(var k = 0; k < this.headerList[index].sections.length; k++){
        temp_saveData_section = {
          "juncSyskey": "",
          "sectionSyskey": "",
          "sectionDescription": "",
          "status": "",
          "questions": []
        };
        
        temp_saveData_section.juncSyskey = this.headerList[index].sections[k].juncSyskey;
        temp_saveData_section.sectionSyskey = this.headerList[index].sections[k].sectionSyskey;
        temp_saveData_section.sectionDescription = this.headerList[index].sections[k].sectionDescription;
        temp_saveData_section.status = this.headerList[index].sections[k].status;

        if(this.headerList[index].sections[k].sectionSyskey == "0"){
          this.useSectionFlag = false;
        } else {
          this.useSectionFlag = true;

          if(this.headerList[index].sections[k].status == "1"){
            cbID = "#" + this.headerList[index].sections[k].sectionSyskey;
            $(cbID).prop("checked", true);
            // $(cbID).prop("disabled", true);
          }
        }

        for(var n = 0; n < this.headerList[index].sections[k].questions.length; n++){
          temp_saveData_questions = {
            "questionSyskey": "",
            "questionDescription": ""
          };

          temp_saveData_questions.questionSyskey = this.headerList[index].sections[k].questions[n].questionSyskey;
          temp_saveData_questions.questionDescription = this.headerList[index].sections[k].questions[n].questionDescription;

          temp_saveData_section.questions.push(temp_saveData_questions);
        }
  
        this.saveData.sections.push(temp_saveData_section);

        if(this.saveData.sections[0].sectionSyskey == "" && this.saveData.sections[0].sectionDescription == ""){
          this.saveData.sections.splice(0, 1);
        }
      }
    }
  }

  validationBeforeSave(){
    if(this.saveData.headerCode == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Survey Code", 2000);
      return false;
    }

    if(this.saveData.headerDescription == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add Survey Description", 2000);
      return false;
    }

    if(this.saveData.t3 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add From Date", 2000);
      return false;
    }

    if(this.saveData.t4 == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Add To Date", 2000);
      return false;
    }

    if(this.saveData.sections.length > 0){
      if(this.saveData.sections[0].sectionSyskey == "" && this.saveData.sections[0].sectionDescription == ""){
        this.saveData.sections.splice(0, 1);
      }
    }

    if(this.saveData.sections.length < 1){
      this.manager.showToast(this.tostCtrl, "Message", "Add at least one Section", 2000);
      return false;
    }

    if(this.rcheck == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Choose Standard", 2000);
      return false;
    }

    /*                KN
    if(this.rcheck == "1" && (this.saveData.n3 == "0" || this.saveData.n3 == "-")){
      this.manager.showToast(this.tostCtrl, "Message", "Choose Category", 2000);
      return false;
    }
    */

    return true;
  }

  save(){
    const url = this.manager.appConfig.apiurl +'surveyor/saveSVR008';

    if(this.validationBeforeSave()){
      let t3Temp = this.saveData.t3;
      let t4Temp = this.saveData.t4;
      this.saveData.t3 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.saveData.t3);
      this.saveData.t4 = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.saveData.t4);
      if(this.rcheck == "1"){
        this.saveData.n2= 1;
      }else{
        this.saveData.n2= 0;
      }
      this.http.post(url, this.saveData, this.manager.getOptions()).subscribe(
        (data:any) =>{
          this.saveData.t3 = t3Temp;
          this.saveData.t4 = t4Temp;

          if(data.message == "SUCCESS"){
            this.manager.showToast(this.tostCtrl, "Message", "Save Successful", 1000);
  
            $("#surveyorHdrNew").hide();
            $("#surveyorHdrList").show();
            $("#surveyorHdrList-tab").tab("show");
  
            this.btn = false;
            this.dtlFlag = false;
            this.useSectionFlag = true;
  
            this.clearProperties();
            this.allList();
            this.getAllDataList();
          } else if(data.message == "CODEEXISTED"){
            this.manager.showToast(this.tostCtrl, "Message", "Question Code Already Existed", 2000);
            $('#surveyCode').css('border-color', 'red');
          }
        }
      );
    }
  }

  goDelete(){
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
    const url = this.manager.appConfig.apiurl + 'surveyor/deleteSVR008';

    this.http.post(url, this.saveData, this.manager.getOptions()).subscribe(
      (data:any) =>{
        el.dismiss();
        if(data.message == "SUCCESS"){
          this.manager.showToast(this.tostCtrl, "Message", "Delete Successful", 1000);
  
          $("#surveyorHdrNew").hide();
          $("#surveyorHdrList").show();
          $("#surveyorHdrList-tab").tab("show");

          this.btn = false;
          this.dtlFlag = false;
          this.useSectionFlag = true;

          this.clearProperties();
          this.allList();
          this.getAllDataList();
        } else if(data.message == "FAIL"){
          this.manager.showToast(this.tostCtrl, "Message", "Delete Failed", 1000);
        } else {
          this.manager.showToast(this.tostCtrl,"Message","Deleting Fail!",1000);
        }
      },
      (error: any) => {
        this.manager.showToast(this.tostCtrl,"Message","Deleting Fail!",1000);
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

  pageChanged(e){
    this.config.currentPage = e;

    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.search(currentIndex, false);
  }

  getCriteriaData(){
    return {
      "headerDesc": "",
      "questionDesc": "",
      "sectionDesc": "",
      "validDate": "",
      "fromDate": "",
      "toDate": "",
      "n1": "",
      "noStatus": "true"
    };
  }

  getSaveData(){
    return {
      "headerSyskey": "",
      "headerCode": "",
      "headerDescription": "",
      "status": "",
      "t3": "",
      "t4": "",
      "n2": 1,
      "n3": "0",
      "sections": [
        {
          "juncSyskey": "",
          "sectionSyskey": "",
          "sectionDescription": "",
          "status": "",
          "questions": [
            {
              "questionSyskey": "",
              "questionDescription": ""
            }
          ]
        }
      ]
    };
  }

  allList(){
    this.svNameSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.svrHdrDescSearchAutoFill(term).subscribe(
            data => {
              this.svNameList = data as any[];
            }
          );
        }
      }
    );

    this.qnNameSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.questionNatureDescSearchAutoFill(term).subscribe(
            data => {
              this.qnList = data as any[];
            }
          );
        }
      }
    );

    this.qNameSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.questionDescSearchAutoFill(term).subscribe(
            data => {
              this.qList = data as any[];
            }
          );
        }
      }
    );

    const url = this.manager.appConfig.apiurl + 'surveyor/allQuestionNatureList';
    let param = {
      "t2": ""
    };
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.qnSaveList = data.dataList;

          for(let secLoop = 0; secLoop < this.qnSaveList.length; secLoop++){
            if(this.qnSaveList[secLoop].syskey == "0"){
              this.qnSaveList.splice(secLoop, 1);
              break;
            }
          }
        }
      }
    );
  }

  clearProperties(){
    this.criteria = this.getCriteriaData();
    this.searchCriteria = this.getCriteriaData();
    this.saveData = this.getSaveData();

    this.headerList = [];
    this.qnSaveList = [];
    this.svNameList = [];
    this.qnList = [];
    this.qList = [];
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
  
  yesOrno(value){
    console.log("Value = ", value);

    if(value == "1"){
      this.saveData.n2 = 1;
      this.saveData.n3 = "0";
    } else {
      this.saveData.n2 = 0;
    }
  }
}