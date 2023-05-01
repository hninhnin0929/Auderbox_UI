import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ControllerService } from '../controller.service';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { Workbook } from 'exceljs';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import * as FileSaver from 'file-saver';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
declare var $: any;
@Component({
  selector: 'app-team',
  templateUrl: './team.page.html',
  styleUrls: ['./team.page.scss'],
})
export class TeamPage implements OnInit {
  btn:boolean=false;
  teamObj:any = this.getTeamObj();
  teamList:any = [];
  zoneList:any = []; 
  syskey: any = "";
  searchtab :boolean = false;
  spinner: boolean = false;
  search_param = this.getDefaultSearchObject();
  constructor(
    public http: HttpClient,
    public router: Router,
    public manager: ControllerService,
    public alertController: AlertController,
    public loading: LoadingController,
    private tostCtrl: ToastController
  ) { this.manager.isLoginUser();}

  ngOnInit() {
    this.manager.isLoginUser();
    this.syskey = "";
  }
  ionViewWillEnter() {
    this.manager.isLoginUser();
    this.btn = false;
    this.search_param = this.getDefaultSearchObject();
    $('#teamlist-tab').tab('show');
    this.getTeamList();
    this.syskey = "";
  }
  getTeamList(){
    this.btn = false;
    this.spinner = true;    
    if (this.manager.user.orgId.length == 0) return;
    this.syskey = "";
        const url = this.manager.appConfig.apiurl + 'team/getTeamInfoList';
        var param = { "codeType": this.search_param.codeType, "code": this.search_param.code, "descriptionType": this.search_param.descriptionType, "description": this.search_param.description, "currentPage": 1, "pageSize": 0, };
        this.http.post(url, param, this.manager.getOptions()).subscribe(
          (data:any)=>{
            // if(data.status =="SUCCESS!"){
            //   this.teamList = data.list;
            // }
            this.teamList = data.dataList;
            this.spinner = false;
          }
        )
  }
  getZoneList(junzonelist:any) {
    const url = this.manager.appConfig.apiurl + 'zone/getzonelist';
    this.http.get(url, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.status === "SUCCESS!") {
          this.zoneList = [];
          this.zoneList = data.data;
          if(junzonelist!== 0){
            var zones = [];
            for(let i=0; i<data.list.length; i++){
              for(let y=0; y<junzonelist.length; y++){
                if( junzonelist[y].zoneSyskey === data.list[i].syskey){
                  zones.push(data.list[i]);
                }
              }
            }

            this.teamObj.teamZone = zones;

          }
        }
      },
      (error) => {
        console.log(error);
      }
    )
  }
  detail(team) {
    this.btn=true;
    const url = this.manager.appConfig.apiurl + 'team/getteambysyskey/'+team.syskey;
    this.http.get(url,this.manager.getOptions()).subscribe(
      (result:any)=>{
        if(result.status == "SUCCESS!"){
          this.teamObj.syskey=result.data.syskey;
          this.syskey = result.data.syskey;
          this.teamObj.code=result.data.code;
          this.teamObj.description=result.data.description;
          this.teamObj.t1=result.data.t1;
          this.teamObj.t2=result.data.t2;
          this.teamObj.createDate=result.data.createDate;
          this.teamObj.modifiedDate=result.data.modifiedDate;
          this.teamObj.recordStatus=result.data.recordStatus;
          this.getZoneList(result.list);
        }
        $('#teamnew-tab').tab('show');
      }
    )
  }
  // getList() {
  //   this.btn=false;
  //   this.syskey="";
  //   $('#teamlist-tab').tab('show');
  // }
  listTab() {
   
    this.getTeamList();
    $('#teamlist-tab').tab('show');
  }
  newTabClick(e){
    this.btn=true;
    this.searchtab = false;
    this.teamObj = this.getTeamObj();
    this.getZoneList(0);
    this.search_param = this.getDefaultSearchObject();
    $('#teamnew-tab').tab('show');
  }
  tab(e){

  }
  addZone(zone,index){
    this.btn = true;
    $('#teamnew-tab').tab('show');
    this.teamObj.teamZone.push(this.zoneList[index]);
    this.zoneList.splice(index,1);   
  }
  removeZone(index){
    this.zoneList.push(this.teamObj.teamZone[index]);
    this.teamObj.teamZone.splice(index,1);
  }
  getTeamObj(){
    return{
      syskey:"",
      code:"",
      description:"",
      t1:"",
      t2:"",
      createDate:"",
      modifiedDate:"",
      recordStatus:1,
      teamZone:[]
    }
  }
  getJunObj(){
    return{
      teamSyskey:"",
      zoneSyskey:"",
      createDate:"",
      modifiedDate:"",
      t1:0,
      recordStatus:1,
      n1:"",
      n2:"",
      n3:""
    }
  }
  save(){
    if(this.isvalid()){
      this.teamObj.teamZone = this.prepareSave();
      const url = this.manager.appConfig.apiurl+'team/save';
      this.http.post(url,this.teamObj,this.manager.getOptions()).subscribe(
        (data:any)=>{
          if(data.status == "SUCCESS!"){
            this.manager.showToast(this.tostCtrl,"Message","Saved Successfully!",1000).then(
              e => {
                this.teamObj = this.getTeamObj();
                this.getTeamList();
                $('#teamlist-tab').tab('show');
              }
            );               
          }else if (data.status == "CODEEXISTS!") {
            this.manager.showToast(this.tostCtrl,"Message","Code Already Exists!",1000);
          } else {
            this.manager.showToast(this.tostCtrl,"Message","Saving Fail!",1000);
          }
        },
        (error: any) => {
          this.manager.showToast(this.tostCtrl,"Message","Saving Fail!",1000);
        }
      );
    }
  }

  prepareSave(){
    var junList = [];
    for (let i = 0; i < this.teamObj.teamZone.length; i++) {
      var junTeamZone = this.getJunObj();
      junTeamZone.zoneSyskey = this.teamObj.teamZone[i].syskey;
      junTeamZone.teamSyskey = this.teamObj.syskey;
      junList.push(junTeamZone);
    }
    return junList;
  }

  gotoDelete() {
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
              const url = this.manager.appConfig.apiurl + 'team/delete/' + this.teamObj.syskey;
              this.http.get(url,this.manager.getOptions()).subscribe(
                (data: any) => {
                  el.dismiss();
                  if(data.status =="SUCCESS!"){
                    this.manager.showToast(this.tostCtrl,"Message","Deleted Successfully!",1000).then(
                      e => {
                        this.getTeamList();              
                        $('#teamlist-tab').tab('show');
                      }
                    );                      
                  }else if (data.status == "teamuse!") {
                    this.manager.showToast(this.tostCtrl,"Message","Please remove all assigned users from this team",1000);
                  } 
                  else if (data.status == "zoneuse!") {
                    this.manager.showToast(this.tostCtrl,"Message","Please remove zone from this team",1000);
                  } 
                  else {
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

  isvalid() {
  
    if (this.teamObj.description.trim().length === 0) {
      this.manager.showToast(this.tostCtrl,"Message","Invalid Description!",1000);
      return false;
    }
    else return true;
  }  

  advanceSearch(option) {
    this.searchtab = option;
    if(!this.searchtab){this.refresh();}
  }

  getDefaultSearchObject() {
    return { "codeType": "c", "descriptionType": "c", "code": "", "description": "" };
  }

  refresh(){
    this.search_param = this.getDefaultSearchObject();
    this.getTeamList();
  }
  print() {
    const url = this.manager.appConfig.apiurl + 'team/getTeamInfoList';
    var param = { "codeType": this.search_param.codeType, "code": this.search_param.code, "descriptionType": this.search_param.descriptionType, "description": this.search_param.description };
    this.http.post(url, param, this.manager.getOptions()).subscribe(
      (data: any) => {
        let data1 = data.dataList;
        let cri_flag = 0;
        let utypeTemp = "";

        let excelTitle = " Team List Report";
        let excelHeaderData = [
          " Team Code", " Team Name","Zone Name"
        ];
        let excelDataList: any = [];
        
        for(var exCount = 0; exCount < data1.length; exCount++){
          let excelData: any = [];
          utypeTemp = this.manager.getUserTypeDesc(data1[exCount].userType);

          excelData.push(data1[exCount].code);
          excelData.push(data1[exCount].description);
          excelData.push(data1[exCount].z_description);
    
          excelDataList.push(excelData);
        }

        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet('Team List Data');

        let titleRow = worksheet.addRow(["","",excelTitle]);
        titleRow.font = {bold: true};
        worksheet.addRow([]);

        let criteriaRow;
        if(param.code.toString() != ""){
          criteriaRow = worksheet.addRow(["Team Code : " + param.code.toString()]);
          criteriaRow.font = {bold: true};
          cri_flag++;
        }
        if(param.description.toString() != ""){
          criteriaRow = worksheet.addRow(["Team Name : " + param.description.toString()]);
          criteriaRow.font = {bold: true};
          cri_flag++;
        }
       
      
        if(cri_flag == 0){
          criteriaRow = worksheet.addRow(["Search With No Criteria"]);
          criteriaRow.font = {bold: true};
        }
        worksheet.addRow([]);

        let headerRow = worksheet.addRow(excelHeaderData);
        headerRow.font = {bold: true};
        for(var i_data = 0; i_data < excelDataList.length; i_data++){
          worksheet.addRow(excelDataList[i_data]);
        }

        workbook.xlsx.writeBuffer().then((data) => {
          let blob = new Blob([data], {type: EXCEL_TYPE});
          FileSaver.saveAs(blob, "Team_export_" + new  Date().getTime() + EXCEL_EXTENSION);
        });
      }
    );
  }
}
