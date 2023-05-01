import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OrderReportPage } from './order-report.page';

describe('OrderReportPage', () => {
  let component: OrderReportPage;
  let fixture: ComponentFixture<OrderReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
