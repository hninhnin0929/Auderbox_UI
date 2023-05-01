import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TransactionReportPage } from './transaction-report.page';

describe('TransactionReportPage', () => {
  let component: TransactionReportPage;
  let fixture: ComponentFixture<TransactionReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
