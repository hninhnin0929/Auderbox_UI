import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { ControllerService } from '../controller.service';
import { HttpClient } from '@angular/common/http';
import { ToastController, LoadingController } from '@ionic/angular';

import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import { UserAndUTypeJunctionData } from '../user/interface';


const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var $: any;

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.page.html',
  styleUrls: ['./user-list.page.scss'],
})

export class UserListPage implements OnInit, AfterViewInit {

  config = {
    itemsPerPage: this.ics.itemsPerPage,
    currentPage: 1,
    totalItems: 0
  };

  _objRoleArray = [];
  _obj = this.getDefaultObj();
  _pagerData = { currentPage: 1, totalCount: 0 };
  sub: any;
  _userList: any = [];
  userlist: any = [];
  directRoleAdd: boolean = false;

  userType = this._getUserTypeSetUpData();

  teamType = [
    { code: 0, val: "-" },
    { code: 1, val: "Modern Trade" },
    { code: 2, val: "Traditional Trade" },
  ];

  _array: any = [];
  _searchVal = "";
  syskey = "";
  _search_param_userlist: any = this.getDefaultSearchObject();
  define = [{ "description": "User ID", "width": "40%", "colval": "userId" }, { "description": "User Name", "width": "60%", "colval": "userName" }];
  spinner: boolean = false;
  searchtab: boolean = false;
  searchObj: any = this.getuserObj();
  searchCriteria: any = this.getuserObj();


  constructor(
    private route: ActivatedRoute,
    private _router: Router,
    private http: HttpClient,
    private ics: ControllerService,
    public tostCtrl: ToastController,
    public loading: LoadingController
  ) {
    this.ics.isLoginUser();
  }
  ngAfterViewInit(): void {
    console.log('_ngAfterViewInit')
    var all_type: any = document.querySelector('input[value="0"][name="usertype-cri-def"]');
    var other_type: any = document.querySelectorAll('input[name="usertype-cri"]');
    all_type.addEventListener('change', () => {
      if (all_type.checked) {
        this.userType.forEach(ut => { ut.check = true });
        other_type.forEach(other => {
          other.disabled = true;
        });
      } else {
        this.userType.forEach(ut => { ut.check = false })
        other_type.forEach(other => {
          other.disabled = false;
        });
      }
    });

  }
  ngOnInit() {

  }
  _getUserTypeSetUpData() {
    return [
      { code: 1, val: "Sales rep", check: false },
      { code: 2, val: "Deliverer", check: false },
      { code: 3, val: "Surveyor", check: false },
      { code: 4, val: "Store Owner", check: false },
    ]
  }
  ionViewWillEnter() {
    console.log('_ionViewWillEnter')
    this.searchObj = this.getuserObj();
    this.userType.forEach(ut => { ut.check = true });
    var def_input_usertype: any = document.querySelector('input[name="usertype-cri-def"]');
    def_input_usertype.checked = true;
    var other_type: any = document.querySelectorAll('input[name="usertype-cri"]');
    other_type.forEach(other => {
      other.disabled = true;
    });
    this.config.currentPage = 1;
    this.getall(0);
  }
  listTab() { }
  ionViewDidEnter() {
    $('#userlist-tab').tab('show');
  }
  detailTab() {
    this._router.navigate(['/user']);
  }
  goNew() {
    this._router.navigate(['/user']);
  }
  runSpinner(t: boolean) {
    this.spinner = t;
  }
  advanceSearch(option) {
    this.searchObj = this.getuserObj();
    this.searchtab = option;
  }
  advanceSearchReset() {
    this.searchObj = this.getuserObj();
  }
  gotoDetail(item) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "s": item.syskey,
        "directAddRole": this.directRoleAdd
      }
    };
    this._router.navigate(['/user'], navigationExtras);
  }
  getall(current: number) {
    this.loading.create({
      message: "Loading"
    }).then(
      el => {
        el.present();

        this._search_param_userlist.userName = this._searchVal;
        this._search_param_userlist.userId = this._searchVal;
        let data: any = {
          searchVal: "",
          current: current,
          maxrow: this.ics.itemsPerPage,
          user: {
            userType: this.userType.filter(u => { return u.check }).reduce((cur, next) => {
              if (cur !== '') {
                return cur + ',' + next.code;
              } else {
                return cur + next.code;
              }
            }, '').toString(),
            otherId: this.searchObj.otherId,
            status: this.searchObj.status,
            userId: this.searchObj.userId,
            userName: this.searchObj.userName,
            syskey: '',
            gender: '',
            dob: '',
            nrc: '',
            teamtype: this.searchObj.teamtype,
          }
        };
        var all_type: any = document.querySelector('input[value="0"][name="usertype-cri-def"]');
        if (all_type.checked) {
          data.user.userType = ""
        }
        let url: string = this.ics.appConfig.apiurl + 'user/userList';
        this.http.post(url, data, this.ics.getOptions()).subscribe(
          (data: any) => {
            if (data.status === "SUCCESS") {
              this._array = data.dataList.map(u => {
                u.i = current++;
                u.usertype = u.multiUserType.reduce((cur, next: UserAndUTypeJunctionData) => {
                  if (cur !== '') {
                    return cur + ',' + this.ics.getUserTypeDesc(next.n11);
                  } else {
                    return cur + this.ics.getUserTypeDesc(next.n11);
                  }

                }, '');
                const u3  = u.multiUserType.find((u2: UserAndUTypeJunctionData) => {
                  return u2.n11 == 1;
                });
                if(u3!= undefined){
                  u.otherId = u3.team.t2
                }
                return u;
              });

              this.config.totalItems = data.totalCount;
            }
            el.dismiss();
          },
          error => {
            el.dismiss();
            this.config.totalItems = 0;
            this.config.currentPage = 1;
            this.ics.showToast(this.tostCtrl, "Message", "Server did'nt response!", 1000);
          }
        );
      }
    )
  }

  async search() {
    this._array = [];
    this.runSpinner(true);
    await this.getall(0);
    this.runSpinner(false);

  }

  getuserList(currIndex, criFlag) {
    if (currIndex == 0) {
      this.config.currentPage = 1;
    }
    const url = this.ics.appConfig.apiurl + 'user/userReportList';

    if (criFlag == true) {
      this.searchCriteria.userId = this.searchObj.userId;
      this.searchCriteria.userName = this.searchObj.userName;
      this.searchCriteria.userType = this.searchObj.userType;
      this.searchCriteria.teamtype = this.searchObj.teamtype;
      this.searchCriteria.otherId = this.searchObj.otherId;
      this.searchCriteria.status = this.searchObj.status;
    }

    this.http.post(url, this.searchCriteria, this.ics.getOptions()).subscribe(
      (data: any) => {
        this._array = data.dataList.map(u => {
          u.usertype = this.ics.getUserTypeDesc(u.userType);
          return u;
        });
        this._array.sort((a, b) => (a.userName > b.userName) ? 1 : -1);
      },
      error => {

      }
    );
  }

  getDefaultSearchObject() {
    return { "userId": "", "userName": "", "currentPage": 1, "totalCount": 0 };
  }

  getDefaultObj() {
    return {
      "searchVal": "", "syskey": "0", "createdDate": "", "modifiedDate": "", "userId": "", "userName": "", "orgId": "0", "recordStatus": 0, "syncStatus": 0, "syncBatch": 0, "usersyskey": "0"
    }
  }

  print() {
    const url = this.ics.appConfig.apiurl + 'user/userReportList';

    this.searchCriteria.userId = this.searchObj.userId;
    this.searchCriteria.userName = this.searchObj.userName;
    this.searchCriteria.userType = this.searchObj.userType;
    this.searchCriteria.teamtype = this.searchObj.teamtype;
    this.searchCriteria.otherId = this.searchObj.otherId;
    this.searchCriteria.status = this.searchObj.status;

    this.http.post(url, this.searchCriteria, this.ics.getOptions()).subscribe(
      (data: any) => {
        let data1 = data.dataList;
        let cri_flag = 0;
        let utypeTemp = "";

        let excelTitle = "User List Report";
        let excelHeaderData = [
          "User ID", "User Name", "Gender", "DOB", "NRC", "Team Name", "User Type", "Team Type", "Status"
        ];
        let excelDataList: any = [];

        for (var exCount = 0; exCount < data1.length; exCount++) {
          let excelData: any = [];
          utypeTemp = this.ics.getUserTypeDesc(data1[exCount].userType);

          excelData.push(data1[exCount].userId);
          excelData.push(data1[exCount].userName);
          excelData.push(data1[exCount].gender);
          excelData.push(data1[exCount].dob);
          excelData.push(data1[exCount].nrc);
          excelData.push(data1[exCount].otherId);
          excelData.push(utypeTemp);
          excelData.push(data1[exCount].teamtype);
          excelData.push(data1[exCount].status);

          excelDataList.push(excelData);
        }

        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet('User List Data');

        let titleRow = worksheet.addRow(["", "", excelTitle]);
        titleRow.font = { bold: true };
        worksheet.addRow([]);

        let criteriaRow;
        if (this.searchObj.userId.toString() != "") {
          criteriaRow = worksheet.addRow(["User ID : " + this.searchObj.userId.toString()]);
          criteriaRow.font = { bold: true };
          cri_flag++;
        }
        if (this.searchObj.userName.toString() != "") {
          criteriaRow = worksheet.addRow(["User Name : " + this.searchObj.userName.toString()]);
          criteriaRow.font = { bold: true };
          cri_flag++;
        }
        if (this.searchObj.otherId.toString() != "") {
          criteriaRow = worksheet.addRow(["Team Name : " + this.searchObj.otherId.toString()]);
          criteriaRow.font = { bold: true };
          cri_flag++;
        }
        if (this.searchObj.userType.toString() != "0") {
          let utTemp = this.ics.getUserTypeDesc(parseInt(this.searchObj.userType));
          criteriaRow = worksheet.addRow(["User Type : " + utTemp.toString()]);
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
          FileSaver.saveAs(blob, "User_export_" + new Date().getTime() + EXCEL_EXTENSION);
        });
      }
    );
  }

  getuserObj() {
    return {
      "userId": "",
      "userName": "",
      "userType": "-1",
      "otherId": "",
      "teamtype": "",
      "status": "",
      "syskey": "",
      "gender": "",
      "dob": "",
      "nrc": ""
    };

  }

  pageChanged(e) {
    this.config.currentPage = e;

    let currentIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
    this.getall(currentIndex);
  }

}