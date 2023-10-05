import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrototypeModuleComponent } from './prototype-module.component';

describe('PrototypeModuleComponent', () => {
  let component: PrototypeModuleComponent;
  let fixture: ComponentFixture<PrototypeModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrototypeModuleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrototypeModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
