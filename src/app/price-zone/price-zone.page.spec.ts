import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PriceZonePage } from './price-zone.page';

describe('PriceZonePage', () => {
  let component: PriceZonePage;
  let fixture: ComponentFixture<PriceZonePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PriceZonePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PriceZonePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
