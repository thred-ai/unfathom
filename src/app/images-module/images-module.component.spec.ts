import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesModuleComponent } from './images-module.component';

describe('ImagesModuleComponent', () => {
  let component: ImagesModuleComponent;
  let fixture: ComponentFixture<ImagesModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImagesModuleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImagesModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
