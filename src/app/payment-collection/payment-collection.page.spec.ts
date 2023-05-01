import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PaymentCollectionPage } from './payment-collection.page';

describe('PaymentCollectionPage', () => {
  let component: PaymentCollectionPage;
  let fixture: ComponentFixture<PaymentCollectionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentCollectionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentCollectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
