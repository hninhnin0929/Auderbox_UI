import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SurveyorHeaderPage } from './surveyor-header.page';

describe('SurveyorHeaderPage', () => {
  let component: SurveyorHeaderPage;
  let fixture: ComponentFixture<SurveyorHeaderPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyorHeaderPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyorHeaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
