import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RegionContentDialogComponent } from './region-content-dialog.component';

describe('RegionContentDialogComponent', () => {
  let component: RegionContentDialogComponent;
  let fixture: ComponentFixture<RegionContentDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RegionContentDialogComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RegionContentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
