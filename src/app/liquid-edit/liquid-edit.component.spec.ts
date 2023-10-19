import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidEditComponent } from './liquid-edit.component';

describe('LiquidEditComponent', () => {
  let component: LiquidEditComponent;
  let fixture: ComponentFixture<LiquidEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiquidEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiquidEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
