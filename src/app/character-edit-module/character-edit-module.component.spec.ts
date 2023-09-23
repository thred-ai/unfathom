import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterEditModuleComponent } from './character-edit-module.component';

describe('CharacterEditModuleComponent', () => {
  let component: CharacterEditModuleComponent;
  let fixture: ComponentFixture<CharacterEditModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CharacterEditModuleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterEditModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
