import { Component, OnInit, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-image-shell',
  templateUrl: './image-shell.component.html',
  styleUrls: ['./image-shell.component.scss'],
})
export class ImageShellComponent implements OnInit {
  @HostBinding('class.img-loaded') imageLoaded = false;
  _src = '';

  @Input()
  set src(val: string) {
    this._src = (val !== undefined && val !== null) ? val : '';
  }
  constructor() { }

  _imageLoaded() {
    setTimeout(() => {
      this.imageLoaded = true;
    }, 200);
  }
  handleImgError(ev: any) {
    let source = ev.srcElement;
    let imgSrc = "assets/img/not-found.png";
    source.src = imgSrc;
  }

  ngOnInit() { }


}
