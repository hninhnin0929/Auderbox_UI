import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TspPage } from './tsp.page';

describe('TspPage', () => {
  let component: TspPage;
  let fixture: ComponentFixture<TspPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TspPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TspPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
