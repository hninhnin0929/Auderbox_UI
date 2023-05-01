import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoyaltyTransactionReportPage } from './loyalty-transaction-report.page';

describe('LoyaltyTransactionReportPage', () => {
  let component: LoyaltyTransactionReportPage;
  let fixture: ComponentFixture<LoyaltyTransactionReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoyaltyTransactionReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoyaltyTransactionReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
