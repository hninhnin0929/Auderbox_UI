import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PacksizePage } from './packsize.page';

describe('PacksizePage', () => {
  let component: PacksizePage;
  let fixture: ComponentFixture<PacksizePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacksizePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PacksizePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
