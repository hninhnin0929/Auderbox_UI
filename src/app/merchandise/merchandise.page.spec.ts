import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MerchandisePage } from './merchandise.page';

describe('MerchandisePage', () => {
  let component: MerchandisePage;
  let fixture: ComponentFixture<MerchandisePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchandisePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MerchandisePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
