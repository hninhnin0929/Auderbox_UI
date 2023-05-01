import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SurveyorSummaryPage } from './surveyor-summary.page';

describe('SurveyorSummaryPage', () => {
  let component: SurveyorSummaryPage;
  let fixture: ComponentFixture<SurveyorSummaryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyorSummaryPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyorSummaryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
