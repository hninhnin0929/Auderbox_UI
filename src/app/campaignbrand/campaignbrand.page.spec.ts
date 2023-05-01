import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CampaignbrandPage } from './campaignbrand.page';

describe('CampaignbrandPage', () => {
  let component: CampaignbrandPage;
  let fixture: ComponentFixture<CampaignbrandPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaignbrandPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CampaignbrandPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
