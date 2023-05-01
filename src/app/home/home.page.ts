import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { ControllerService } from '../controller.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(public menuCtrl: MenuController,private manager:ControllerService) { }

  ngOnInit() {
    console.log(this.manager.formatDate_StringToDate('20210610'));
  }

}
