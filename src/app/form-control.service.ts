import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanLoad, Route } from '@angular/router';
import { Events, ToastController } from '@ionic/angular';
import { ControllerService } from './controller.service';
@Injectable({
  providedIn: 'root'
})

export class FormControlService implements CanLoad {

  public activePageUrl: String = '';
  constructor(
    private router: Router,
    public events: Events,
    public ics: ControllerService,
    public tostCtrl:ToastController
  ) { }
  canLoad(route: Route, segments: import("@angular/router").UrlSegment[]): boolean {

    if (sessionStorage.getItem('token') !== null && sessionStorage.getItem('token') !== '') {
      if (this.ics.isExpire()) {
        this.ics.showToast(this.tostCtrl,"Timeout!","Please login again",1500,'tertiary');
        sessionStorage.clear();
        this.router.navigate(['/']);
        return false;
      } else {
        return true;
      }

    } else {
      this.router.navigate(['/']);
      return false;
    }

  }
}
