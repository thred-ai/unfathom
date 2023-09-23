import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsModuleComponent } from './assets-module.component';

describe('AssetsModuleComponent', () => {
  let component: AssetsModuleComponent;
  let fixture: ComponentFixture<AssetsModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetsModuleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetsModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
