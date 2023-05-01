import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PacktypePage } from './packtype.page';

describe('PacktypePage', () => {
  let component: PacktypePage;
  let fixture: ComponentFixture<PacktypePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacktypePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PacktypePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
