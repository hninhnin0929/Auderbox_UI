import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SurveyTransactionArchiveReportPage } from './survey-transaction-archive-report.page';

describe('SurveyTransactionArchiveReportPage', () => {
  let component: SurveyTransactionArchiveReportPage;
  let fixture: ComponentFixture<SurveyTransactionArchiveReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyTransactionArchiveReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyTransactionArchiveReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
