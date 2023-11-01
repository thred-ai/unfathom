import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkyViewComponent } from './sky-view.component';

describe('SkyViewComponent', () => {
  let component: SkyViewComponent;
  let fixture: ComponentFixture<SkyViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkyViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
