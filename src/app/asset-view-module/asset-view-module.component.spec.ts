import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetViewModuleComponent } from './asset-view-module.component';

describe('AssetViewModuleComponent', () => {
  let component: AssetViewModuleComponent;
  let fixture: ComponentFixture<AssetViewModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetViewModuleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetViewModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
