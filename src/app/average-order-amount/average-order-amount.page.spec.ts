import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AverageOrderAmountPage } from './average-order-amount.page';

describe('AverageOrderAmountPage', () => {
  let component: AverageOrderAmountPage;
  let fixture: ComponentFixture<AverageOrderAmountPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AverageOrderAmountPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AverageOrderAmountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
