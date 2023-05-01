import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SurveyorPage } from './surveyor.page';

describe('SurveyorPage', () => {
  let component: SurveyorPage;
  let fixture: ComponentFixture<SurveyorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyorPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
