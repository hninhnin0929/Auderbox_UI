import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UOMPage } from './uom.page';

describe('UOMPage', () => {
  let component: UOMPage;
  let fixture: ComponentFixture<UOMPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UOMPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UOMPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
