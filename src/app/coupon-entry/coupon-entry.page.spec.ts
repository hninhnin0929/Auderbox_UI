import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CouponEntryPage } from './coupon-entry.page';

describe('CouponEntryPage', () => {
  let component: CouponEntryPage;
  let fixture: ComponentFixture<CouponEntryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CouponEntryPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CouponEntryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
