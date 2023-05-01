import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StoreRoutingPage } from './store-routing.page';

describe('StoreRoutingPage', () => {
  let component: StoreRoutingPage;
  let fixture: ComponentFixture<StoreRoutingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreRoutingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StoreRoutingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
