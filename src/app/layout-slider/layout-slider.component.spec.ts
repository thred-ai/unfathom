import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutSliderComponent } from './layout-slider.component';

describe('LayoutSliderComponent', () => {
  let component: LayoutSliderComponent;
  let fixture: ComponentFixture<LayoutSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LayoutSliderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
