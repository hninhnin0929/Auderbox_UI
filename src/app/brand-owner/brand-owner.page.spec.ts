import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BrandOwnerPage } from './brand-owner.page';

describe('BrandOwnerPage', () => {
  let component: BrandOwnerPage;
  let fixture: ComponentFixture<BrandOwnerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrandOwnerPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BrandOwnerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
