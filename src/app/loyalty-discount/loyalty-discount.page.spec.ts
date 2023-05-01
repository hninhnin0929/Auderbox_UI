import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoyaltyDiscountPage } from './loyalty-discount.page';

describe('LoyaltyDiscountPage', () => {
  let component: LoyaltyDiscountPage;
  let fixture: ComponentFixture<LoyaltyDiscountPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoyaltyDiscountPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoyaltyDiscountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
