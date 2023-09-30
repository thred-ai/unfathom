import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldEditComponent } from './world-edit.component';

describe('WorldEditComponent', () => {
  let component: WorldEditComponent;
  let fixture: ComponentFixture<WorldEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorldEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorldEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
