import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CampaigntaskPage } from './campaigntask.page';

describe('CampaigntaskPage', () => {
  let component: CampaigntaskPage;
  let fixture: ComponentFixture<CampaigntaskPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaigntaskPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CampaigntaskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
