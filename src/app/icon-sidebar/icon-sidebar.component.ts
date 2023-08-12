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

  get config() {
    return (window as any).designerConfig;
  }

  @Input() selectedIcon: string = 'settings';

  items: StepDefinition[] = [];

  @Output() selectedIconChanged = new EventEmitter<string>();
  @Input() theme: 'light' | 'dark' = 'light';

  @Output() openPrototype = new EventEmitter<string>();
  @Output() openDatabase = new EventEmitter<any>();

  @Output() openProj = new EventEmitter<string | undefined>();

  @Output() publish = new EventEmitter<Executable>();

  selectedStep?: Scene


  expandedProjects = true;

  zoomIn() {
    this.config.controlBar.zoomIn();
  }

  zoomOut() {
    this.config.controlBar.zoomOut();
  }

  reset() {
    this.config.controlBar.resetViewport();
  }

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

    this.workflowComponent.openStep.subscribe(s => {
      this.selectedStep = s
    })

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
      var items: StepDefinition[] = [];
      tool.groups.forEach((group) => {
        group.steps.forEach((step) => {
          items.push(step);
          this.images[step.type] = this.loadService.iconUrlForController(
            step.componentType,
            step.type
          );
        });
      });
      this.items = items;
    });
  }

  images: Dict<string> = {};

  openSettings() {
    this.workflowComponent.openControllerSettings('main');
  }

  delete(step: string){
    (window as any).designerConfig.controlBar.tryDelete(step)
  }


  sets: Dict<any> = {};

  setToolbarLoc(
    parent?: HTMLElement,
    template?: HTMLElement,
    step?: StepDefinition,
    setting = true
  ) {
    if (parent && template && step) {
      this.sets[step.type] = true;
      setTimeout(() => {
        ToolboxItem.create(parent, template, step, this.config.toolbox);
      }, 0);

      return this.sets[step.type];
    }

    return undefined;
  }

  public saveLayout() {
    // this.definition = definition;

    this.loading = true;

    this.publish.emit(this.executable);
  }
}
