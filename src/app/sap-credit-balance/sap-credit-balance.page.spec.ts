import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SapCreditBalancePage } from './sap-credit-balance.page';

describe('SapMaterialPage', () => {
  let component: SapCreditBalancePage;
  let fixture: ComponentFixture<SapCreditBalancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SapCreditBalancePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SapCreditBalancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
