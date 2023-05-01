import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DiscountTypePage } from './discount-type.page';

describe('DiscountTypePage', () => {
  let component: DiscountTypePage;
  let fixture: ComponentFixture<DiscountTypePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscountTypePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DiscountTypePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
