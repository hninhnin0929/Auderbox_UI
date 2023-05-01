import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CampaignShopPage } from './campaign-shop.page';

describe('CampaignShopPage', () => {
  let component: CampaignShopPage;
  let fixture: ComponentFixture<CampaignShopPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaignShopPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CampaignShopPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
