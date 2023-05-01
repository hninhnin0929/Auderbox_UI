import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SubCategoryPage } from './sub-category.page';

describe('SubCategoryPage', () => {
  let component: SubCategoryPage;
  let fixture: ComponentFixture<SubCategoryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubCategoryPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SubCategoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
