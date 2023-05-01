import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AssignUserStorePage } from './assign-user-store.page';

describe('AssignUserStorePage', () => {
  let component: AssignUserStorePage;
  let fixture: ComponentFixture<AssignUserStorePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignUserStorePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AssignUserStorePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
