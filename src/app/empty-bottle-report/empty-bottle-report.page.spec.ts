import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EmptyBottleReportPage } from './empty-bottle-report.page';

describe('EmptyBottleReportPage', () => {
  let component: EmptyBottleReportPage;
  let fixture: ComponentFixture<EmptyBottleReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmptyBottleReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyBottleReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
