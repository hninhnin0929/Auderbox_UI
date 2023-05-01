import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RedflagReportPage } from './redflag-report.page';

describe('RedflagReportPage', () => {
  let component: RedflagReportPage;
  let fixture: ComponentFixture<RedflagReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedflagReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RedflagReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
