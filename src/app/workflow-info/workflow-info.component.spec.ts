import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowInfoComponent } from './workflow-info.component';

describe('WorkflowInfoComponent', () => {
  let component: WorkflowInfoComponent;
  let fixture: ComponentFixture<WorkflowInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
