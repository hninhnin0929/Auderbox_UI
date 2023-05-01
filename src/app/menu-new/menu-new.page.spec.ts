import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MenuNewPage } from './menu-new.page';

describe('MenuNewPage', () => {
  let component: MenuNewPage;
  let fixture: ComponentFixture<MenuNewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuNewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuNewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
