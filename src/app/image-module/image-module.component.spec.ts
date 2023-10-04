import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageModuleComponent } from './image-module.component';

describe('ImageModuleComponent', () => {
  let component: ImageModuleComponent;
  let fixture: ComponentFixture<ImageModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageModuleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
