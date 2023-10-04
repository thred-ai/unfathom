import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextureUploadComponent } from './texture-upload.component';

describe('TextureUploadComponent', () => {
  let component: TextureUploadComponent;
  let fixture: ComponentFixture<TextureUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TextureUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextureUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
