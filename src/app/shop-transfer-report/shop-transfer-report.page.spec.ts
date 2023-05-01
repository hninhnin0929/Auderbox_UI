import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ShopTransferReportPage } from './shop-transfer-report.page';

describe('ShopTransferReportPage', () => {
  let component: ShopTransferReportPage;
  let fixture: ComponentFixture<ShopTransferReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopTransferReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ShopTransferReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
