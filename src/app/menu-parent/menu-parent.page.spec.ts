import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MenuParentPage } from './menu-parent.page';

describe('MenuParentPage', () => {
  let component: MenuParentPage;
  let fixture: ComponentFixture<MenuParentPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuParentPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuParentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
