import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SapMaterialPage } from './sap-material.page';

describe('SapMaterialPage', () => {
  let component: SapMaterialPage;
  let fixture: ComponentFixture<SapMaterialPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SapMaterialPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SapMaterialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
