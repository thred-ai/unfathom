import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Developer } from '../models/user/developer.model';
import { Dict, LoadService } from '../load.service';
import { AppComponent } from '../app.component';
import { WorkflowComponent } from '../workflow/workflow.component';
import * as $ from 'jquery';
import {
  Step,
  StepDefinition,
  ToolboxConfiguration,
  ToolboxItem,
} from 'verticalai-workflow-designer';
import { DesignerService } from '../designer.service';
import { Executable } from '../models/workflow/executable.model';
import { Scene } from '../models/workflow/scene.model';
import { SceneDefinition } from '../models/workflow/scene-definition.model';

@Component({
  selector: 'app-icon-sidebar',
  templateUrl: './icon-sidebar.component.html',
  styleUrls: ['./icon-sidebar.component.scss'],
})
export class IconSidebarComponent implements OnInit {
  constructor(
    private loadService: LoadService,
    public workflowComponent: WorkflowComponent,
    public root: AppComponent,
    private designerService: DesignerService
  ) {}

  loadedUser?: Developer;

  selectedWorkflow?: string;
  executable?: Executable;

  loading: Boolean = false;

  @Input() selectedIcon: string = 'settings';

  items: SceneDefinition[] = [];

  @Output() selectedIconChanged = new EventEmitter<string>();
  @Input() theme: 'light' | 'dark' = 'light';

  @Output() openPrototype = new EventEmitter<string>();
  @Output() openDatabase = new EventEmitter<any>();

  @Output() openProj = new EventEmitter<string | undefined>();
  @Output() newFrame = new EventEmitter<any>();

  @Output() publish = new EventEmitter<Executable>();

  selectedStep?: Scene;

  expandedProjects = true;

  showingGrid = false;

  set showGrid(value: boolean) {
    this.showingGrid = value;
    if (value) {
      document.documentElement.style.setProperty(
        '--gridColor',
        this.loadService.themes[this.theme].gridColor
      );
    } else {
      document.documentElement.style.setProperty('--gridColor', `transparent`);
    }
  }

  ngOnInit(): void {
    this.showGrid = false;
    this.loadService.loadedUser.subscribe((l) => {
      if (l) {
        this.loadedUser = l;
      }
    });

    this.workflowComponent.openStep.subscribe((s) => {
      this.selectedStep = s;
    });

    this.loadService.loading.subscribe((l) => {
      this.loading = l;
    });

    this.workflowComponent.workflow.subscribe((w) => {
      if (w) {
        this.selectedWorkflow = w.id;
        this.executable = w;
      }
    });

    this.designerService.toolboxConfiguration.subscribe((tool) => {
      console.log(tool);
      this.items = tool;
    });
  }

  images: Dict<string> = {};

  openSettings() {
    this.workflowComponent.openControllerSettings('main');
  }

  delete(id: string) {
    let file = this.executable?.scenes;

    if (this.loadService.confirmDelete()) {
      if (file && this.executable && this.selectedIcon) {
        let index = file.findIndex((f) => f.id == id);
        if (index > -1) {
          file.splice(index, 1);
          this.publish.emit(this.executable);
          if (this.selectedIcon == 'controllers') {
            this.workflowComponent.setWorkflow(this.executable!.id, 'main');
          }
        }
      }
    }
  }

  public saveLayout() { 
    // this.definition = definition;

    this.loading = true;

    this.publish.emit(this.executable);
  }
}
