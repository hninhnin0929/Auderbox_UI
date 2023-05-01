import { Component, OnInit } from '@angular/core';
import { PopoverController, Events } from '@ionic/angular';
import { ControllerService } from '../controller.service';
import { AppComponent } from '../app.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.page.html',
  styleUrls: ['./popover.page.scss'],
})
export class PopoverPage implements OnInit {
  username = "";
  userid = "";

  constructor(
    public popControl: PopoverController,
    public event: Events,
    public manager: ControllerService,
    public router: Router,
  

  ) { }

  ngOnInit() {
    this.userid = this.manager.user.userId;
    this.username = this.manager.user.userName;
  }
  go(swi:number){
    switch(swi){
      case 0: this.event.publish("operation",0);
      case 1: this.event.publish("operation",1);
      case 2: this.event.publish("operation",2);
    
    }
  }
  logout(){
    this.popControl.dismiss();
    this.event.publish("logout");
  }
  

}
