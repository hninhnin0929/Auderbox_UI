import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SapArPage } from './sap-ar.page';

describe('SapArPage', () => {
  let component: SapArPage;
  let fixture: ComponentFixture<SapArPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SapArPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SapArPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
