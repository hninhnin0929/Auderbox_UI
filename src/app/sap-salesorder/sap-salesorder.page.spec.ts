import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SapSalesOrderPage } from './sap-salesorder.page';

describe('SapSalesOrderPage', () => {
  let component: SapSalesOrderPage;
  let fixture: ComponentFixture<SapSalesOrderPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SapSalesOrderPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SapSalesOrderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
