import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SapPaymentPage } from './sap-payment.page';

describe('SapPaymentPage', () => {
  let component: SapPaymentPage;
  let fixture: ComponentFixture<SapPaymentPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SapPaymentPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SapPaymentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
