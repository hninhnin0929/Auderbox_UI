import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VoidReportPage } from './void-report.page';

describe('VoidReportPage', () => {
  let component: VoidReportPage;
  let fixture: ComponentFixture<VoidReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoidReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VoidReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
