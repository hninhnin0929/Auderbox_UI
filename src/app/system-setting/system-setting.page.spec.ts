import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SystemSettingPage } from './system-setting.page';

describe('SystemSettingPage', () => {
  let component: SystemSettingPage;
  let fixture: ComponentFixture<SystemSettingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemSettingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SystemSettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
