import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { ControllerService } from '../controller.service';

@Component({
  selector: 'app-url-config',
  templateUrl: './url-config.page.html',
  styleUrls: ['./url-config.page.scss'],
})
export class UrlConfigPage implements OnInit {

  url: any = this.ics.appConfig.apiurl;
  constructor(
    public ics: ControllerService,
    private http: HttpClient, 
    public router: Router, 
    public route: ActivatedRoute

  ) { }

  ngOnInit() {
  }
  goHome(){
    this.router.navigate(['/login']);
  }
  getConfigUrl(){
   this.url = this.ics.appConfig.apiurl;
  }
  save(){
    this.ics.appConfig.apiurl = this.url;
    this.router.navigate(['/login']);
  }
 
  
}
