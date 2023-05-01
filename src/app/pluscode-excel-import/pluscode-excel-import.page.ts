import { Component, OnInit,ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import { ControllerService } from '../controller.service';
import { HttpClient ,HttpHeaders} from '@angular/common/http';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-pluscode-excel-import',
  templateUrl: './pluscode-excel-import.page.html',
  styleUrls: ['./pluscode-excel-import.page.scss'],
})

export class PluscodeExcelImportPage implements OnInit {

  uploadedFileName: string = "";
  uploadFile: File;
  each_sheet_data: any = this.forjsondata1();
  all_sheet_data = this.forjsondata2();



  load:boolean = false;
  @ViewChild('fileInput',{static:false}) fileInput; 
  constructor(public manager: ControllerService, public http: HttpClient,) {this.manager.isLoginUser(); }

  ngOnInit() {
  }
  resetValue() {
    this.fileInput.nativeElement.value = "";
  }

  onUpload(event) {      
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
        }
      }

      this.all_sheet_data.uploadData.splice(0,1);
    };     
  }

  excelBind(){
    const url = this.manager.appConfig.apiurl + 'placecode/saveMiMuAndPlusCode';

      this.http.post(url, this.all_sheet_data.uploadData, this.manager.getOptions()).subscribe(
        (data:any)  => {
          if(data.message == "SUCCESS"){ 
            alert("execel file import success!");         
          }
        },
        error => {
          alert("hello erorr");
        }
      );
    }
  

  forjsondata1() {
    return {
      "mimuCode":"",
      "plus6Code":"",
      "plus8Code":"",
      "t1_4":"",
      "t1_6":"",
      "t1_8":"",
      "t2_4":"",
      "t2_6":"",
      "t2_8":""



    };
  }

  forjsondata2() {
    return {
      uploadData: [
        {
          "mimuCode":"",
          "plus6Code":"",
          "plus8Code":"", 
          "t1_4":"",
          "t1_6":"",
          "t1_8":"",
          "t2_4":"",
          "t2_6":"",
          "t2_8":""
        }
      ]
    };
  }

  clearProperties(){
    this.uploadedFileName = "";
    this.each_sheet_data = this.forjsondata1();
    this.all_sheet_data = this.forjsondata2();
  } 

  sampleExcelDownload(){
    let exampleData : any = [];
    exampleData = this.sampleExcelData();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exampleData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, "Example_Template");
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
    FileSaver.saveAs(data, fileName + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
  }

  sampleExcelData(){
    return [
      {
        "mimuCode":"MMR010002",
        "plus6Code":"7MHRX3",
        "t1_6":"aaaa",
        "t2_6":"bbbb",
        "t1_4":"cccc",
        "t2_4":"dddd",
        "plus8Code":"7MHRX3C4",
        "t1_8":"eeee",
        "t2_8":"ffff"
      },
      {
        "mimuCode":"MMR010002",
        "plus6Code":"7MHRX3",
        "t1_6":"aaa",
        "t2_6":"bbbb",
        "t1_4":"cccc",
        "t2_4":"dddd",
        "plus8Code":"7MHRX3C5",
        "t1_8":"eeee",
        "t2_8":"ffff"
      },
    ];
  }

} 

