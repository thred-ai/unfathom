import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodePaneComponent } from './code-pane.component';

describe('CodePaneComponent', () => {
  let component: CodePaneComponent;
  let fixture: ComponentFixture<CodePaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodePaneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodePaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
