import { Component, OnInit, ElementRef, ViewChild, Type } from '@angular/core';
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
  selector: 'app-surveyor',
  templateUrl: './surveyor.page.html',
  styleUrls: ['./surveyor.page.scss'],
})

export class SurveyorPage implements OnInit {
  @ViewChild('fileInput', { static: false }) imgFileInput: ElementRef;
  
  config =  {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };

  typeStatus: any = "";
  spinner: boolean = false;
  searchtab: boolean = false;
  btn: any = false;
  dtlFlag: any = false;
  natureStatus: any = false;

  saveData: any = this.getDataList();
  criteria: any = this.getDataList();
  searchCriteria: any = this.getDataList();

  imageName: any = "";
  imagePath: any = "";
  ansDtlText: any = "";
  serialno: any ="";
  QandAList: any = [];
  AnsDtlList: any = [];
  AnsDtlList1: any = [];

  svrHdrList: any = [];
  qcList: any = [];
  qList: any = [];
  qnList1: any = [];
  qtList1: any = [];
  qnList2: any = [];
  qtList2: any = [];
  aList: any = [];
  //  g=1;
  qCodeSearch: FormControl = new FormControl();
  qNameSearch: FormControl = new FormControl();
  qNatureSearch: FormControl = new FormControl();
  qTypeSearch: FormControl = new FormControl();  
  aNameSearch: FormControl = new FormControl();

  AnswerTypeStatus = {
    Nothing: 0,
    Textbox: 1,
    TBandPhoto: 2
  };

  _viewList = [ { "value": 1, "caption": "Web View"}, { "value": 2, "caption": "Mobile View"}];
  _catFlagList = [ { "value": 1, "caption": "Yes"}, { "value": 0, "caption": "No"}];
  _storeTypeList = [ { "value": 1, "caption": "Onpremise/Offpremise"}, { "value": 2, "caption": "Modern trade/Traditional trade"}, { "value": 3, "caption": "Brand Owner"}, { "value": 4, "caption": "Category"}];
  _category: boolean = false;
  categoryDisable: boolean = true;
  categorySyskey: string = "0";
  bolist: any = [];
  brandownerid: any = "0";
  disableFlag : boolean = true;
  showStoreType : boolean = false;
  standard : string = "0";
  catlist: any = [];
  categoryDesc : string = "";

  constructor(
    private http: HttpClient,
    private manager: ControllerService,
    public alertController: AlertController,
    public loading: LoadingController,
    public tostCtrl: ToastController
  ) { 
    this.manager.isLoginUser();
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    $("#surveyorNew").hide();
    $("#surveyorList").show();
    $("#surveyorList-tab").tab("show");
    $('#questionCode').css('border-color', '');
    this.btn = false;
    this.dtlFlag = false;
    this.manager.isLoginUser();
    this.clearProperties();
    
    this.runSpinner(true);
    this.allList();
    this.runSpinner(false);
    this.getAllDataList();
  }

  surveyorListTab(){
    $('#surveyorNew').hide();
    $('#surveyorList').show();
    this.getAllDataList();
  }

  surveyorNewTab(){
    $('#surveyorList').hide();
    $('#surveyorNew').show();
    $('#questionCode').css('border-color', '');
    this.btn = true;
    this.dtlFlag = false;
    this.showStoreType = false;
    this.clearProperties();
    this.getTypeStatusWithSK();
    this.getBrandOwner();
    this.categorySyskey = "0";
    this.categoryDesc = "";
    this.saveData.n7 = "0";
    this.categoryDisable = true;
    // this.getNatureStatusWithSK();
  }

  advanceSearch(option) {
    this.searchtab = option;
  }

  runSpinner(t: boolean) {
    this.spinner = t;
  }

  onChange(event){
    var file = event.srcElement.files[0];
    this.imageName = file.name.substring(0,file.name.lastIndexOf("."));

    var reader = new FileReader();
    reader.readAsBinaryString(file);

    reader.onload = e => {
      this.imagePath = btoa(reader.result.toString());
    };
  }

  getTypeStatusWithSK(){
    this.clear();

    if(this.saveData.n2.toString() == ""){
      this.typeStatus = "";
    } else {
      const url = this.manager.appConfig.apiurl +'surveyor/getTypeStatusWithSK';
      let send_data = {"syskey": this.saveData.n2};

      this.http.post(url, send_data, this.manager.getOptions()).subscribe(
        (data:any) =>{
          if(data.message == "SUCCESS"){
            this.typeStatus = data.typeStatus;
          }
        }
      );
    }
  }

  getNatureStatusWithSK(){
    this.clear();

    if(this.saveData.n1.toString() == ""){
      this.natureStatus = true;
    } else {
      const url = this.manager.appConfig.apiurl +'surveyor/getNatureStatusWithSK';
      let send_data = {"syskey": this.saveData.n1};

      this.http.post(url, send_data, this.manager.getOptions()).subscribe(
        (data:any) =>{
          if(data.message == "SUCCESS"){
            if(data.natureStatus != "Neighborhood Survey"){
              this.natureStatus = true;
            } else {
              this.natureStatus = false;
            }
          }
        }
      );
    }
  }

  getSectionByHeader(){
    const url = this.manager.appConfig.apiurl +'surveyor/SvrHdrSectionList';
    let send_data = {
      "syskey": this.saveData.n6
    };

    /*
    for(var i = 0; i < this.svrHdrList.length; i++){
      if(this.saveData.n6 == this.svrHdrList[i].headerSyskey){
        this.standard = this.svrHdrList[i].standard;
      }
    }
    if(this.standard != "0"){
      this.categoryDisable = false;
      this.showStoreType = true;
    }else{
      this.categoryDisable = true;
      this.showStoreType = false;
    }
    */

    if(this.saveData.n6.toString() == ""){
      this.qnList2 = [];
    } else{
      this.http.post(url, send_data, this.manager.getOptions()).subscribe(
        (data:any) =>{
          if(data.message == "SUCCESS"){
            this.qnList2 = data.dataList;

            if(this.qnList2.length > 0){
              if(this.qnList2[0].StandartFlag == "0"){
                this.showStoreType = false;

                this.saveData.n7 = "0";
                this.categorySyskey = "0";
                this.ansDtlText = "";
                // $("#type").val("0").change();
              } else {
                this.showStoreType = true;
              }
            }
          }
        }
      );
    }
  }

  checkPhotoDisable(){
    if(this.typeStatus.toString() != this.AnswerTypeStatus.TBandPhoto
        || this.typeStatus.toString() == ""){
      return true;
    }

    return false;
  }

  checkAddBtnDisable(){
    if(this.typeStatus.toString() == this.AnswerTypeStatus.Nothing
        || this.typeStatus.toString() == ""){
      return true;
    }

    return false;
  }

  checkTextDisable(){
    if(this.typeStatus.toString() != this.AnswerTypeStatus.Textbox
        || this.typeStatus.toString() == ""){
      this.categorySyskey = "0";
      this.serialno="";
      this.ansDtlText = "";
      return true;
    }

    return false;
  }

  getAllDataList(){
    this.criteria = this.getDataList();
    this.criteria.maxRows = this.config.itemsPerPage;
    this.criteria.current = "0";
    this.criteria.n4 = "0";
    this.criteria.n5 = "1";

    const url = this.manager.appConfig.apiurl +'surveyor/searchQuestionList';

    this.http.post(url, this.criteria, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.config.totalItems = data.rowCount;
          this.config.currentPage = 1;

          this.QandAList = data.dataList;

          for(var i = 0; i < this.QandAList.length; i++){
            this.QandAList[i].date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.QandAList[i].date);
          }
        }
      }
    );
  }

  search(currIndex, criFlag){
    this.searchCriteria.maxRows = this.config.itemsPerPage;
    this.searchCriteria.current = currIndex;
    this.searchCriteria.n4 = "0";
    this.searchCriteria.n5 = "1";

    const url = this.manager.appConfig.apiurl +'surveyor/searchQuestionList';

    let send_data1 = this.criteria.date;
    if(this.criteria.date != ""){
      this.criteria.date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.date);
    }

    if(criFlag == true){
      this.searchCriteria.t1 = this.criteria.t1;
      this.searchCriteria.t2 = this.criteria.t2;
      this.searchCriteria.t3 = this.criteria.t3;
      this.searchCriteria.questionNature = this.criteria.questionNature;
      this.searchCriteria.questionType = this.criteria.questionType;
      this.searchCriteria.date = this.criteria.date;
    }
    
    this.http.post(url, this.searchCriteria, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.criteria.date = send_data1;
          this.config.totalItems = data.rowCount;

          if(currIndex == 0){
            this.config.currentPage = 1;
          }

          this.QandAList = data.dataList;

          for(var i = 0; i < this.QandAList.length; i++){
            this.QandAList[i].date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.QandAList[i].date);
          }
        }
      }
    );
  }

  print(){
    this.criteria.current = "";
    this.criteria.maxRows = "";
    this.criteria.n4 = "0";
    this.criteria.n5 = "1";
    const url = this.manager.appConfig.apiurl + 'surveyor/searchQuestionList';

    let send_data = this.criteria.date;
    if (this.criteria.date.toString() != "") {
      this.criteria.date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DTPtoDB, this.criteria.date);
    }

    this.http.post(url, this.criteria, this.manager.getOptions()).subscribe(
      (data: any) => {
        let cri_str_date = "";
        if (this.criteria.date.toString() != ""){
          cri_str_date = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, this.criteria.date).toString();
        }
        
        this.criteria.date = send_data;

        if (data.message == "SUCCESS") {
          let cri_flag = 0;
          let tempDate = "";
          let excelDataList: any = [];
          let excelTitle = "Surveyor List";
          let excelHeaderData = [
            "Date", "Question Code", "Question", "Question Nature", "Question Type"
          ];

          for (var data_i = 0; data_i < data.dataList.length; data_i++) {
            let excelData = [];

            tempDate = this.manager.dateFormatCorrector(this.manager.dateFormatter.DBtoUI, data.dataList[data_i].date).toString();

            excelData.push(tempDate);
            excelData.push(data.dataList[data_i].t1);
            excelData.push(data.dataList[data_i].t2);
            excelData.push(data.dataList[data_i].questionNature);
            excelData.push(data.dataList[data_i].questionType);

            excelDataList.push(excelData);
          }

          let workbook = new Workbook();
          let worksheet = workbook.addWorksheet('Surveyor List Data');

          let titleRow = worksheet.addRow(["", "", excelTitle]);
          titleRow.font = { bold: true };
          worksheet.addRow([]);

          let criteriaRow;
          if(cri_str_date != "") {
            criteriaRow = worksheet.addRow(["Date : " + cri_str_date]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          if(this.criteria.t1.toString() != "") {
            criteriaRow = worksheet.addRow(["Question Code : " + this.criteria.t1.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          if(this.criteria.t2.toString() != "") {
            criteriaRow = worksheet.addRow(["Question : " + this.criteria.t2.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          if(this.criteria.questionNature.toString() != "") {
            criteriaRow = worksheet.addRow(["Question Nature : " + this.criteria.questionNature.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }
          if(this.criteria.questionType.toString() != "") {
            criteriaRow = worksheet.addRow(["Question Type : " + this.criteria.questionType.toString()]);
            criteriaRow.font = { bold: true };
            cri_flag++;
          }

          if(cri_flag == 0) {
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
            FileSaver.saveAs(blob, "Surveyor_export_" + new Date().getTime() + EXCEL_EXTENSION);
          });
        }
      }
    );
  }

  add(){
    if(this.typeStatus.toString() == this.AnswerTypeStatus.TBandPhoto
      && (this.imageName == "" || this.saveData.t3 == "" || this.saveData.n1 == "")){
        if(this.saveData.n1 == ""){
          this.manager.showToast(this.tostCtrl, "Message", "Please fill Question Nature", 2000);
        } else if(this.saveData.t3 == ""){
          this.manager.showToast(this.tostCtrl, "Message", "Please fill Instruction", 2000);
        } else if(this.imageName == ""){
          this.manager.showToast(this.tostCtrl, "Message", "Please add Image", 2000);
        }
    } else if(this.typeStatus.toString() == this.AnswerTypeStatus.Textbox 
        && (this.ansDtlText == "" || this.saveData.n1 == "")){
          if(this.saveData.n1 == ""){
            this.manager.showToast(this.tostCtrl, "Message", "Please fill Question Nature", 2000);
          } else if(this.ansDtlText == ""){
            this.manager.showToast(this.tostCtrl, "Message", "Please fill Answer Text", 2000);
          }
    } else {
      let sameAnsFlag = false;

      if(this.typeStatus.toString() == this.AnswerTypeStatus.Textbox){
        for(var k = 0; k < this.AnsDtlList.length; k++){
          if(this.ansDtlText == this.AnsDtlList[k].t1 && this.AnsDtlList[k].recordStatus == "1"){
            sameAnsFlag = true;
            break;
          }
        }
      }

      if(this.typeStatus.toString() == this.AnswerTypeStatus.TBandPhoto){
        let imgPath = "data:image/png;base64," + this.imagePath;
        for(var k = 0; k < this.AnsDtlList.length; k++){
          if(imgPath == this.AnsDtlList[k].t2 && this.imageName == this.AnsDtlList[k].t3 
            && this.AnsDtlList[k].recordStatus == "1"){
              sameAnsFlag = true;
              break;
          }
        }
      }
      
      if(sameAnsFlag == false){
        var i=0
        let adlist = this.getDataList().answerList[0];
        adlist.date = "";
        adlist.n2 = this.saveData.n2;
        adlist.syskey = "";
        adlist.t1 = this.ansDtlText;
        adlist.n3 = this.categorySyskey; 
        // adlist.t4 = this.g;
        // this.g++;
        this.categorySyskey = "0";
        // adlist.categoryDesc = this.categoryDesc;
        this.changeCategory(adlist.n3);
        adlist.categoryDesc = this.categoryDesc;
        if(this.imagePath != ""){
          adlist.t2 = "data:image/png;base64," + this.imagePath;
        } else {
          adlist.t2 = "";
        }
        adlist.t3 = this.imageName;
        adlist.recordStatus = "1";
        adlist.imagePathForMobile = "data:image/png;base64," + this.imagePath;

        this.AnsDtlList.push(adlist);
        if(this.dtlFlag == true){
          this.AnsDtlList1.push(adlist);
        }
      } else {
        this.manager.showToast(this.tostCtrl, "Message", "Already Existed. Add another value", 2000);
      }

      this.imgFileInput.nativeElement.value = "";
      this.ansDtlText = "";
      this.serialno = "";
      this.imageName = ""; 
      this.imagePath = "";
      
    }
   
  }

  updateAnsText(index){
    let inputID = "#updateAnsText" + index;
    let changedValue = $(inputID).val();

    if(this.typeStatus.toString() == this.AnswerTypeStatus.Textbox){

      if(this.dtlFlag == true){
        for(var i = index; i < this.AnsDtlList1.length; i++){

          if(this.AnsDtlList[index].t1 == this.AnsDtlList1[i].t1){
  
            if(this.AnsDtlList1[i].recordStatus == "1"){
              let sameAnsFlag = false;

              for(var k = 0; k < this.AnsDtlList.length; k++){
                if(changedValue == this.AnsDtlList[k].t1 && this.AnsDtlList[k].recordStatus == "1"){
                  sameAnsFlag = true;
                  break;
                }
              }

              if(sameAnsFlag == false){
                this.AnsDtlList[index].t1 = changedValue;
                this.AnsDtlList1[i].t1 = changedValue;
                $(inputID).val("");
              } else {
                this.manager.showToast(this.tostCtrl, "Message", "Already Existed. Update with another value", 2000);
                $(inputID).val("");
              }

              break;
            }
          }
        }
      } else {
        let sameAnsFlag = false;

        for(var k = 0; k < this.AnsDtlList.length; k++){
          if(changedValue == this.AnsDtlList[k].t1 && this.AnsDtlList[k].recordStatus == "1"){
            sameAnsFlag = true;
            break;
          }
        }

        if(sameAnsFlag == false){
          this.AnsDtlList[index].t1 = changedValue;
          $(inputID).val("");
        } else {
          this.manager.showToast(this.tostCtrl, "Message", "Already Existed. Update with another value", 2000);
          $(inputID).val("");
        }
      }
    }
  }

  AnsDtlDel(index){
    if(this.dtlFlag == true){
      if(this.AnsDtlList.length == this.AnsDtlList1.length){

        if(this.AnsDtlList[index].syskey == ""){
          this.AnsDtlList1.splice(index, 1);
        } else {
          this.AnsDtlList1[index].recordStatus = "4";
        }

        this.AnsDtlList.splice(index, 1);

      } else if(this.AnsDtlList.length < this.AnsDtlList1.length){

        if(this.typeStatus.toString() == this.AnswerTypeStatus.TBandPhoto){

          for(var i = index; i < this.AnsDtlList1.length; i++){

            if(this.AnsDtlList[index].t2 == this.AnsDtlList1[i].t2
              && this.AnsDtlList[index].t3 == this.AnsDtlList1[i].t3){

                if(this.AnsDtlList1[i].recordStatus == "1"){

                  if(this.AnsDtlList1[i].syskey == ""){
                    this.AnsDtlList1.splice(i, 1);
                  } else {
                    this.AnsDtlList1[i].recordStatus = "4";
                  }
                  // var j;
                  // for (j = 1; j <= this.AnsDtlList1.length; j++){
                  //   this.AnsDtlList1[j-1].t4 = "" + j;
                  
                  // }
                  // this.g=j
                  break;
                }
            }
          }
        }
          
        if(this.typeStatus.toString() == this.AnswerTypeStatus.Textbox){

          for(var i = index; i < this.AnsDtlList1.length; i++){

            if(this.AnsDtlList[index].t1 == this.AnsDtlList1[i].t1){

              if(this.AnsDtlList1[i].recordStatus == "1"){

                if(this.AnsDtlList1[i].syskey == ""){
                  this.AnsDtlList1.splice(i, 1);
                } else {
                  this.AnsDtlList1[i].recordStatus = "4";
                }

                break;
              }
            }
          }

        }
        
        this.AnsDtlList.splice(index, 1);
      }
    } else {
      this.AnsDtlList.splice(index, 1);
    //   var j;
    //   for (j = 1; j <= this.AnsDtlList.length; j++){
    //      this.AnsDtlList[j-1].t4 = "" + j;       
    //        }
    //  this.g=j
    }
  }

  advanceSearchReset()
  {
    this.saveData = this.getDataList();
    this.criteria = this.getDataList();
    this.searchCriteria = this.getDataList();
    this.AnsDtlList = [];
    this.AnsDtlList1 = [];
    this.QandAList = [];
    this.getAllDataList();
  }


  clear(){
    // if(this.AnsDtlList.length > 0){
    //   this.AnsDtlList.splice(0, this.AnsDtlList.length);
    // }
    this.AnsDtlList = [];
    this.AnsDtlList1 = [];
    this.imgFileInput.nativeElement.value = "";
    this.ansDtlText = "";
    this.imageName = "";
    this.imagePath = "";

    if(this.dtlFlag == false){
      this.saveData.t3 = "";
    }
  }

  saveValidation(){
    if(this.saveData.n6.toString() == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Please Fill Survey Header", 2000);
      return false;
    }

    // if(this.saveData.n1.toString() == ""){
    //   this.manager.showToast(this.tostCtrl, "Message", "Please Fill Question Nature", 2000);
    //   return false;
    // }

    if(this.saveData.n2.toString() == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Please Fill Question Type", 2000);
      return false;
    }

    if(this.saveData.t1.toString() == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Please Fill Question Code", 2000);
      return false;
    }

    if(this.saveData.t2.toString() == ""){
      this.manager.showToast(this.tostCtrl, "Message", "Please Fill Question", 2000);
      return false;
    }
    if(this.saveData.n3.toString() == "0" || this.saveData.n3.toString() == "-"){
      this.manager.showToast(this.tostCtrl, "Message", "Please Choose View Type", 2000);
      return false;
    }
    // if(this.saveData.n7 == 0 ){
    //   this.manager.showToast(this.tostCtrl, "Message", "Please Choose Store Type", 2000);
    //   return false;
    // }
    // if(this.saveData.n8.toString() == "0" || this.saveData.n8.toString() == "-"){
    //   this.manager.showToast(this.tostCtrl, "Message", "Please Choose Brand Owner", 2000);
    //   return false;
    // }

    if(this.AnsDtlList.length == 0 && this.typeStatus.toString() != this.AnswerTypeStatus.Nothing){
      this.manager.showToast(this.tostCtrl, "Message", "Please Fill Answer Detail", 2000);
      return false;
    }

    return true;
  }

  save(){
    const url = this.manager.appConfig.apiurl + 'surveyor/saveSVR002';

    if(this.dtlFlag == true){
      this.saveData.answerList = this.AnsDtlList1;
    } else{
      this.saveData.answerList = this.AnsDtlList;
    }

    if(this.saveValidation()){
      this.http.post(url, this.saveData, this.manager.getOptions()).subscribe(
        (data:any) =>{
          if(data.message == "SUCCESS"){
            // this.g=1;
            this.manager.showToast(this.tostCtrl, "Message", "Save Successful", 1000);
  
            $("#surveyorNew").hide();
            $("#surveyorList").show();
            $("#surveyorList-tab").tab("show");
            this.btn = false;
            this.dtlFlag = false;
            this.clearProperties();
            this.getAllDataList();
          } else if(data.message == "CODEEXISTED"){
            this.manager.showToast(this.tostCtrl, "Message", "Question Code Already Existed", 2000);
            $('#questionCode').css('border-color', 'red');
          }
        }
      );
    }
  }

  detail(index){
    this.btn = true;
    this.dtlFlag = true;
    $("#surveyorNew").show();
    $("#surveyorList").hide();
    $("#surveyorNew-tab").tab("show");
    
    this.saveData.syskey = this.QandAList[index].syskey;
    this.saveData.n6 = this.QandAList[index].n6;
    this.getSectionByHeader();
    this.saveData.n1 = this.QandAList[index].n1;
    this.saveData.n2 = this.QandAList[index].n2;
    this.saveData.t1 = this.QandAList[index].t1;
    this.saveData.t2 = this.QandAList[index].t2;
    this.saveData.t3 = this.QandAList[index].t3;
    this.saveData.n3 = this.QandAList[index].n3;
    // this.categorySyskey = this.saveData.n3;
    this.saveData.n2 = this.QandAList[index].n2;
    this.saveData.n7 = this.QandAList[index].n7;
    this.getBrandOwner();
    this.saveData.n8 = this.QandAList[index].n8;
    
    this.getTypeStatusWithSK();
    // this.getNatureStatusWithSK();
    this.getCatelist();

    if(this.QandAList[index].standard != 0 && this.QandAList[index].n7 == 4){        
      this.categoryDisable = false;        
    } else {
      this.categoryDisable = true;
    }
    
    let adlist: any;
    let tempList = this.QandAList[index].answerList;
    for(var i = 0; i < tempList.length; i++){
      adlist = this.getDataList().answerList[0];
      adlist.syskey = tempList[i].syskey;
      adlist.t1 = tempList[i].t1;
      adlist.t2 = tempList[i].t2;
      adlist.n3 = tempList[i].n3;
      adlist.t4 = i;
      adlist.categoryDesc = tempList[i].categoryDesc;
      adlist.recordStatus = "1";
      this.categorySyskey = "0";
      adlist.imagePathForMobile = this.manager.appConfig.imgurl.concat(tempList[i].imagePathForMobile);

      this.AnsDtlList.push(adlist);
      this.AnsDtlList1.push(adlist);
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
      const url = this.manager.appConfig.apiurl + 'surveyor/deleteSVR001';

      this.http.post(url, this.saveData, this.manager.getOptions()).subscribe(
        (data:any) =>{
          if(data.message == "SUCCESS"){
            this.manager.showToast(this.tostCtrl, "Message", "Delete Successful", 1000);
    
            $("#surveyorNew").hide();
            $("#surveyorList").show();
            $("#surveyorList-tab").tab("show");
            this.btn = false;
            this.dtlFlag = false;
            this.clearProperties();
            this.getAllDataList();
          } else if(data.message == "FAIL"){
            this.manager.showToast(this.tostCtrl, "Message", "Delete Failed", 1000);
          }
        },
        (error: any) => {
          el.dismiss();
          this.manager.showToast(this.tostCtrl,"Message","Deleteing Fail!",1000);
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
  
  focusFunction() {
    $('#questionCode').css('border-color', '');
  }

  dblClickFunc1(){
    this.criteria.date = "";
    $("#date").val("").change();
  }

  pageChanged(e){
    this.config.currentPage = e;

    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.search(currentIndex, false);
  }

  allList(){
    this.qCodeSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.questionCodeSearchAutoFill(term).subscribe(
            data => {
              this.qcList = data as any[];
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

    this.qNatureSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.questionNatureDescSearchAutoFill(term).subscribe(
            data => {
              this.qnList1 = data as any[];
            }
          );
        }
      }
    );

    this.qTypeSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.questionTypeDescSearchAutoFill(term).subscribe(
            data => {
              this.qtList1 = data as any[];
            }
          );
        }
      }
    );
    this.aNameSearch.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.manager.AnswerDescSearchAutoFill(term).subscribe(
            data => {
              this.aList = data as any[];
            }
          );
        }
      }
    );

    let url = "";
    let param = {};

    /*
    let url = this.manager.appConfig.apiurl + 'surveyor/allQuestionNatureList';
    let param = {
      "t2": ""
    };

    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.qnList2 = data.dataList;
        }
      }
    );
    */

    url = this.manager.appConfig.apiurl + 'surveyor/allQuestionTypeList';
    param = {
      "t2": ""
    };

    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.qtList2 = data.dataList;
        }
      }
    );

    url = this.manager.appConfig.apiurl + 'surveyor/allSurveyorHeaderListWeb';
    param = {
      "syskey": "0"
    };

    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data:any) =>{
        if(data.message == "SUCCESS"){
          this.svrHdrList = data.dataList;
        }
      }
    );
  }

  clearProperties(){
    this.saveData = this.getDataList();
    this.criteria = this.getDataList();
    this.searchCriteria = this.getDataList();
    this.AnsDtlList = [];
    this.AnsDtlList1 = [];
    this.QandAList = [];

    this.imageName = "";
    this.imagePath = "";
    this.ansDtlText = "";
  }

  getDataList(){
    return {
      "syskey": "",
      "date": "",
      "questionNature": "",
      "questionType": "",
      "maxRows": "",
      "current": "",
      "t1": "",
      "t2": "",
      "t3": "",
      "n1": "",
      "n2": "",
      "n3": "0",
      "n4": "",
      "n5": "",
      "n6": "",
      "n7": 0,
      "n8": "0",
      "ansListType": 0,
      "answerList": [
        {
          "syskey": "",
          "date": "",
          "n2": "",
          "t1": "",
          "t2": "",
          "t3": "",
          "t4": 0,
          "recordStatus": "",
          "imagePathForMobile": "",
          "n3": "",
          "categoryDesc":""
        }
      ]
    };
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

  changeStoreType(storeType){
    if(storeType == 3){
      this.disableFlag = false;  
      this.categoryDisable = true;
      this.categorySyskey = "0";
      this.ansDtlText = "";
    } else if(storeType == 4){
      if(this.showStoreType == true){
        this.categoryDisable = false;

        this.getCatelist();
      }

      this.disableFlag = true;
    } else {
      this.disableFlag = true;
      this.categoryDisable = true;
      this.categorySyskey = "0";
      this.ansDtlText = "";
    }
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

  changeCategory(categorySK){
    this.categoryDesc = "-";
    for (let i = 0; i < this.catlist.length; i++) {
      if(this.catlist[i].syskey == categorySK){
        this.categoryDesc = this.catlist[i].t2;  
        this.ansDtlText =  this.categoryDesc;
        break;
      } else {
        this.ansDtlText =  "";
      }
    }
  }
}