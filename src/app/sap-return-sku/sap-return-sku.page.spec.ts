import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SapReturnSkuPage } from './sap-return-sku.page';

describe('SapReturnSkuPage', () => {
  let component: SapReturnSkuPage;
  let fixture: ComponentFixture<SapReturnSkuPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SapReturnSkuPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SapReturnSkuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
