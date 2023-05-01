import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UrlConfigPage } from './url-config.page';

describe('UrlConfigPage', () => {
  let component: UrlConfigPage;
  let fixture: ComponentFixture<UrlConfigPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UrlConfigPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UrlConfigPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
