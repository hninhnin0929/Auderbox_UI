import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UrlPage } from './url.page';

describe('UrlPage', () => {
  let component: UrlPage;
  let fixture: ComponentFixture<UrlPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UrlPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UrlPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
