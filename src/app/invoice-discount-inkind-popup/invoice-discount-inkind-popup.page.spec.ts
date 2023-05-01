import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InvoiceDiscountInkindPopupPage } from './invoice-discount-inkind-popup.page';

describe('InvoiceDiscountInkindPopupPage', () => {
  let component: InvoiceDiscountInkindPopupPage;
  let fixture: ComponentFixture<InvoiceDiscountInkindPopupPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceDiscountInkindPopupPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceDiscountInkindPopupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
