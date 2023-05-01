import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SapBillingPage } from './sap-billing.page';

describe('SapSalesOrderPage', () => {
  let component: SapBillingPage;
  let fixture: ComponentFixture<SapBillingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SapBillingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SapBillingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
