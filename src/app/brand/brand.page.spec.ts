import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BrandPage } from './brand.page';

describe('BrandPage', () => {
  let component: BrandPage;
  let fixture: ComponentFixture<BrandPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrandPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BrandPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
