import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionInfoComponent } from './collection-info.component';

describe('CollectionInfoComponent', () => {
  let component: CollectionInfoComponent;
  let fixture: ComponentFixture<CollectionInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
