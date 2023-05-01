import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MappingPage } from './mapping.page';

describe('MappingPage', () => {
  let component: MappingPage;
  let fixture: ComponentFixture<MappingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MappingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MappingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
