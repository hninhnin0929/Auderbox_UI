import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TownPage } from './town.page';

describe('TownPage', () => {
  let component: TownPage;
  let fixture: ComponentFixture<TownPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TownPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TownPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
