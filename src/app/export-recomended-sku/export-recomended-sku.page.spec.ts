import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExportRecomendedSKUPage } from './export-recomended-sku.page';

describe('ExportRecomendedSKUPage', () => {
  let component: ExportRecomendedSKUPage;
  let fixture: ComponentFixture<ExportRecomendedSKUPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportRecomendedSKUPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExportRecomendedSKUPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
