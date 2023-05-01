import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SapCustomerPage } from './sap-customer.page';

describe('SapCustomerPage', () => {
  let component: SapCustomerPage;
  let fixture: ComponentFixture<SapCustomerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SapCustomerPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SapCustomerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
