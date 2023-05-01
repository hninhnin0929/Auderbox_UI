import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GoogleMapPage } from './google-map.page';

describe('GoogleMapPage', () => {
  let component: GoogleMapPage;
  let fixture: ComponentFixture<GoogleMapPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoogleMapPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GoogleMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
