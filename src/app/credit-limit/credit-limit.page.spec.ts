import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CreditLimitPage } from './credit-limit.page';

describe('CreditLimitPage', () => {
  let component: CreditLimitPage;
  let fixture: ComponentFixture<CreditLimitPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditLimitPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CreditLimitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
