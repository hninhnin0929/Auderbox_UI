import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InventoryReportPage } from './inventory-report.page';

describe('OrderReportPage', () => {
  let component: InventoryReportPage;
  let fixture: ComponentFixture<InventoryReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
