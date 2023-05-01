import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ImageCropPage } from './image-crop.page';

describe('ImageCropPage', () => {
  let component: ImageCropPage;
  let fixture: ComponentFixture<ImageCropPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageCropPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageCropPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
