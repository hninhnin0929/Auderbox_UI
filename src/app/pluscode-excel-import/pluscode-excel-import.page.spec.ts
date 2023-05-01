import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PluscodeExcelImportPage } from './pluscode-excel-import.page';

describe('PluscodeExcelImportPage', () => {
  let component: PluscodeExcelImportPage;
  let fixture: ComponentFixture<PluscodeExcelImportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PluscodeExcelImportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PluscodeExcelImportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
