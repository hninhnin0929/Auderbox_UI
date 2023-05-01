import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SurveyorResponsePage } from './surveyor-response.page';

describe('SurveyorResponsePage', () => {
  let component: SurveyorResponsePage;
  let fixture: ComponentFixture<SurveyorResponsePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyorResponsePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyorResponsePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
