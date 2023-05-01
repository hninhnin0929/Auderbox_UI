import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient } from '@angular/common/http';
import { AlertController, ModalController, NavParams, IonBackButton, ToastController, LoadingController, NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { RegionContentDialogComponent } from './region-content-dialog/region-content-dialog.component';
declare var $: any;

@Component({
  selector: 'app-surveyor-summary',
  templateUrl: './surveyor-summary.page.html',
  styleUrls: ['./surveyor-summary.page.scss'],
})
export class SurveyorSummaryPage implements OnInit {

  config = {
    itemsPerPage: this.manager.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };
  searchObj: any = this.getuserObj();
  surveyorlist: any = [];
  regionlist: any = [];
  userdetail: any = this.userDetailObj();
  searchtab: boolean = false;
  btn: boolean = false;
  isLoading: boolean = false;
  imgLoading: boolean = true;
  spinner: boolean = false;

  currentPage: any = 1;

  profileimg: any;


  constructor(public manager: ControllerService,
    public http: HttpClient,
    public alertCtrl: AlertController,
    public activeRoute: ActivatedRoute,
    private modalCtrl: ModalController,
    private router: Router,
    private navCtrl: NavController,
    private tostCtrl: ToastController,
    private loadCtrl: LoadingController,
    public dialog: MatDialog) { }

  ngOnInit() {
  }
  ionViewWillEnter() {
    $('#surveyor-summary-list-tab').tab('show');
    this.runSpinner(true);
    this.getUserList();
  }
  async runSpinner(t: boolean) {
    this.spinner = t;
  }
  listTab() {
    this.ionViewWillEnter();
  }
  selectedTabChange(ev) {

  }
  getuserObj() {
    return {
      "name": "",
      "userid": "",
    };
  }
  userDetailObj() {
    return {
      "userphoto": "",
      "userid": "",
      "username": "",
      "email": "",
      "dob": "",
      "sex": "",
      "nrc": ""
    }
  }
  handleImgError(ev: any) {
    let source = ev.srcElement;
    let imgSrc = "assets/img/not-found.png";
    source.src = imgSrc;
  }
  hideLoader() {
    this.imgLoading = false;
  }
  pageChanged(ev) {

  }
  getUserList() {
    this.searchObj = this.getuserObj();
    this.searchObj.UserSyskey="";
    const url = this.manager.appConfig.apiurl + 'surveyor/getSurveyorSummary';
    this.http.post(url, this.searchObj, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.surveyorlist = data.dataList;
        this.runSpinner(false);
      },
      error => {
        this.runSpinner(false);
      }
    )
  }
  search() {
    this.runSpinner(true);
    this.searchObj.UserSyskey="";
    const url = this.manager.appConfig.apiurl + 'surveyor/getSurveyorSummary';
    this.http.post(url, this.searchObj, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.message == "No Data") {
          this.surveyorlist = [];
        }
        else {
          this.surveyorlist = data.dataList;
        }
        this.runSpinner(false);
      },
      error => {
      });
  }

  advanceSearch(option) {
    this.searchtab = option;
  }
  advanceSearchReset() {
    this.ionViewWillEnter();
    this.searchtab = false;
  }

  detail(list) {
    this.loadCtrl.create(
      {
        message: 'Loading...',
      }
    ).then(el => {
      el.present();
    this.searchObj = this.getuserObj();
    let any = [];
    this.searchObj.UserSyskey=list.UserSyskey;
    const url = this.manager.appConfig.apiurl + 'surveyor/getSurveyorSummary';
    this.http.post(url, this.searchObj, this.manager.getOptions()).subscribe(
      (data: any) => {
        this.surveyorlist = data.dataList;
        this.regionlist=data.dataList[0].Region;
          any=this.regionlist;
            $('#surveyor-summary-detail-tab').tab('show');
            if (list.UserPhoto) {
              this.userdetail.userphoto = this.manager.appConfig.imgurl + list.UserPhoto;
            }
            else {
              this.userdetail.userphoto = "assets/img/not-found.png";
            }
            this.userdetail.userid = list.UserId;
            this.userdetail.dob = list.DOB;
            this.userdetail.username = list.UserName;
            this.userdetail.sex = list.Gender;
            this.userdetail.nrc = list.NRC;
            this.searchObj=list.UserSyskey;
            this.runSpinner(false);
            setTimeout(() => {
              this.isLoading = true;
              this.imgLoading = true;
              el.dismiss();
            }, 1000);
    });
      },
      error => {
        this.runSpinner(false);
      }
    )
  }

 
  openDialog(shop) {
    if (shop.Shop.AssignShop.length > 0) {
      const data = shop;

      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = data;
      dialogConfig.width = "100vw";
      dialogConfig.maxWidth = "90vw";

      let dialogRef = this.dialog.open(RegionContentDialogComponent, dialogConfig);

      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog result: ${result}`);
      });
    }

  }


  previewImg(img) {
    this.profileimg = "";
    this.profileimg = img;
    if (this.profileimg !== '') {
      setTimeout(() => {
        $('#previewProfileImgModel').appendTo("body").modal('show');
      }, 200);
    }
  }


  previewModelClose() {

    $('#previewProfileImgModel').appendTo("body").modal('hide');
    this.profileimg = "";

  }
}





