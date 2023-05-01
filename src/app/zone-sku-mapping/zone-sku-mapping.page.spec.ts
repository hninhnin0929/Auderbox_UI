import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ZoneSkuMappingPage } from './zone-sku-mapping.page';

describe('ZoneSkuMappingPage', () => {
  let component: ZoneSkuMappingPage;
  let fixture: ComponentFixture<ZoneSkuMappingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZoneSkuMappingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ZoneSkuMappingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
