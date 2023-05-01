import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SapPage } from './sap.page';

describe('SapPage', () => {
  let component: SapPage;
  let fixture: ComponentFixture<SapPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SapPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
