import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterModuleComponent } from './character-module.component';

describe('CharacterModuleComponent', () => {
  let component: CharacterModuleComponent;
  let fixture: ComponentFixture<CharacterModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CharacterModuleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
