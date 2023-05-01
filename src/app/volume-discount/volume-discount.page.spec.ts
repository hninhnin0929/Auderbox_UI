import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VolumeDiscountPage } from './volume-discount.page';

describe('VolumeDiscountPage', () => {
  let component: VolumeDiscountPage;
  let fixture: ComponentFixture<VolumeDiscountPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VolumeDiscountPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VolumeDiscountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
