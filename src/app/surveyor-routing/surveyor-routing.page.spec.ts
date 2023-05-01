import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SurveyorRoutingPage } from './surveyor-routing.page';

describe('SurveyorRoutingPage', () => {
  let component: SurveyorRoutingPage;
  let fixture: ComponentFixture<SurveyorRoutingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyorRoutingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyorRoutingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
