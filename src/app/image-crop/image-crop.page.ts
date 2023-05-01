import { Component, OnInit, AfterViewInit, ViewChild, Inject } from '@angular/core';

import { ImageCroppedEvent } from 'ngx-image-cropper';
@Component({
  selector: 'app-image-crop',
  templateUrl: './image-crop.page.html',
  styleUrls: ['./image-crop.page.scss'],
})
export class ImageCropPage implements OnInit, AfterViewInit {


  constructor(

  ) { }

  ngOnInit() {
  }
  ngAfterViewInit() {
 
  }
  imageChangedEvent: any = '';
  croppedImage: any = '';
  
  fileChangeEvent(event: any): void {
      this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = event.base64;
  }
  imageLoaded() {
      // show cropper
  }
  cropperReady() {
      // cropper ready
  }
  loadImageFailed() {
      // show message
  }

 
}
