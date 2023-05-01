import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FloverPage } from './flover.page';

describe('FloverPage', () => {
  let component: FloverPage;
  let fixture: ComponentFixture<FloverPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FloverPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FloverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
