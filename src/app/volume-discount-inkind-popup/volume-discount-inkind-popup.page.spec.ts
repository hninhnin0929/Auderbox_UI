import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VolumeDiscountInkindPopupPage } from './volume-discount-inkind-popup.page';

describe('VolumeDiscountInkindPopupPage', () => {
  let component: VolumeDiscountInkindPopupPage;
  let fixture: ComponentFixture<VolumeDiscountInkindPopupPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VolumeDiscountInkindPopupPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VolumeDiscountInkindPopupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
