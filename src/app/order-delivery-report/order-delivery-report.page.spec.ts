import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OrderDeliveryReportPage } from './order-delivery-report.page';

describe('OrderDeliveryReportPage', () => {
  let component: OrderDeliveryReportPage;
  let fixture: ComponentFixture<OrderDeliveryReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderDeliveryReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDeliveryReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
