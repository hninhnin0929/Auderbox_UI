import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoyaltyDiscountRunPage } from './loyalty-discount-run.page';

describe('LoyaltyDiscountRunPage', () => {
  let component: LoyaltyDiscountRunPage;
  let fixture: ComponentFixture<LoyaltyDiscountRunPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoyaltyDiscountRunPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoyaltyDiscountRunPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
