import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SurveyTransactionReportPage } from './survey-transaction-report.page';

describe('OrderReportPage', () => {
  let component: SurveyTransactionReportPage;
  let fixture: ComponentFixture<SurveyTransactionReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyTransactionReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyTransactionReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
