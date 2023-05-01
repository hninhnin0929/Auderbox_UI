import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CheckinReportPage } from './checkin-report.page';

describe('CheckinReportPage', () => {
  let component: CheckinReportPage;
  let fixture: ComponentFixture<CheckinReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckinReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckinReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
