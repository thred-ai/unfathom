import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldModuleComponent } from './world-module.component';

describe('WorldModuleComponent', () => {
  let component: WorldModuleComponent;
  let fixture: ComponentFixture<WorldModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorldModuleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorldModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
