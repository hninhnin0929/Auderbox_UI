import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OrderReportBySummaryPage } from './order-report-by-summary.page';

describe('OrderReportPage', () => {
  let component: OrderReportBySummaryPage;
  let fixture: ComponentFixture<OrderReportBySummaryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderReportBySummaryPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderReportBySummaryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
