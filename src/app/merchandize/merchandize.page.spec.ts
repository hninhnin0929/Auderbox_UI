import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MerchandizePage } from './merchandize.page';

describe('MerchandizePage', () => {
  let component: MerchandizePage;
  let fixture: ComponentFixture<MerchandizePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchandizePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MerchandizePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
