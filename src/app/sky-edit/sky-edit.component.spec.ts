import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkyEditComponent } from './sky-edit.component';

describe('SkyEditComponent', () => {
  let component: SkyEditComponent;
  let fixture: ComponentFixture<SkyEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkyEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkyEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
