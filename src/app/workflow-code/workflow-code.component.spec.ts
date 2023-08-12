import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowCodeComponent } from './workflow-code.component';

describe('WorkflowCodeComponent', () => {
  let component: WorkflowCodeComponent;
  let fixture: ComponentFixture<WorkflowCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowCodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
