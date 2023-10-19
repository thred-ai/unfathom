import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroundEditComponent } from './ground-edit.component';

describe('GroundEditComponent', () => {
  let component: GroundEditComponent;
  let fixture: ComponentFixture<GroundEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroundEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroundEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
