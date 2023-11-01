import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarLoaderComponent } from './bar-loader.component';

describe('BarLoaderComponent', () => {
  let component: BarLoaderComponent;
  let fixture: ComponentFixture<BarLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BarLoaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
