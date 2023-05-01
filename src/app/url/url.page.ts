import { Component, OnInit } from '@angular/core';
import { PopoverController, NavController, Events } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ControllerService } from '../controller.service';

@Component({
  selector: 'app-url',
  templateUrl: './url.page.html',
  styleUrls: ['./url.page.scss'],
})
export class UrlPage implements OnInit {

  _showLan: boolean = false;
  _lan: any;
  _checked:any ;
  constructor(
    public ics: ControllerService,
    public popControl: PopoverController,
    public router: Router, 
    public navControl: NavController,
    public events: Events,
    public route: ActivatedRoute) { 
      this._lan = this.ics.appConfig.languageCode;
    }

  ngOnInit() {
  }
  gotoConfig(){
    this.popControl.dismiss();
    this.router.navigate(['/url-config']);
    
  }
  showLanguage(){
    if(this._showLan == false) this._showLan = true;
    else this._showLan = false;
  }
  changeLan(){
    switch(this._lan){
      case 'E': this.switchE();break;
      case 'M' : this.switchM(); break;
    }
    this.events.publish("lan","");
  }
  switchM(){
   // this.ics.defaultLanguage = this.ics.language.myanmar;
   this.ics.appConfig.languageCode = "M";
  }
  switchE(){
    //this.ics.defaultLanguage = this.ics.language.english; 
    this.ics.appConfig.languageCode = "E";
  }
  

}
