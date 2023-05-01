import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CreditRequestFormPage } from './credit-request-form.page';

describe('WardPage', () => {
  let component: CreditRequestFormPage;
  let fixture: ComponentFixture<CreditRequestFormPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditRequestFormPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CreditRequestFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
