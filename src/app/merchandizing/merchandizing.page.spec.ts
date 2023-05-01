import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MerchandizingPage } from './merchandizing.page';

describe('MerchandizingPage', () => {
  let component: MerchandizingPage;
  let fixture: ComponentFixture<MerchandizingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchandizingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MerchandizingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
