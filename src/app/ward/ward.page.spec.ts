import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WardPage } from './ward.page';

describe('WardPage', () => {
  let component: WardPage;
  let fixture: ComponentFixture<WardPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WardPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
