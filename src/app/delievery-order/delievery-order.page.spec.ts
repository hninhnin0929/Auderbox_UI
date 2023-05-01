import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DelieveryOrderPage } from './delievery-order.page';

describe('DelieveryOrderPage', () => {
  let component: DelieveryOrderPage;
  let fixture: ComponentFixture<DelieveryOrderPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DelieveryOrderPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DelieveryOrderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
