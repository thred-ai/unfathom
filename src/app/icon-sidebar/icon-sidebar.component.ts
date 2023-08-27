import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Developer } from '../models/user/developer.model';
import { Dict, LoadService } from '../load.service';
import { AppComponent } from '../app.component';
import { WorkflowComponent } from '../workflow/workflow.component';
import { DesignerService } from '../designer.service';
import { Executable } from '../models/workflow/executable.model';
import { Scene } from '../models/workflow/scene.model';
import { SceneDefinition } from '../models/workflow/scene-definition.model';
import { Graph, Cell } from '@antv/x6';
import { Dnd } from '@antv/x6-plugin-dnd';
import { ThemeService } from '../theme.service';
import { ProjectService } from '../project.service';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';

@AutoUnsubscribe
@Component({
  selector: 'app-icon-sidebar',
  templateUrl: './icon-sidebar.component.html',
  styleUrls: ['./icon-sidebar.component.scss'],
})
export class IconSidebarComponent implements OnInit {
  constructor(
    private loadService: LoadService,
    private themeService: ThemeService,
    public workflowComponent: WorkflowComponent,
    public root: AppComponent,
    private designerService: DesignerService,
    private projectService: ProjectService
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
  @Output() selectedFileChanged = new EventEmitter<string>();

  selectedStep?: Cell.Properties;

  expandedProjects = true;

  showingGrid = false;

  dnd!: Dnd;
  graph?: Graph;

  set showGrid(value: boolean) {
    this.showingGrid = value;
    if (value) {
      document.documentElement.style.setProperty(
        '--gridColor',
        this.themeService.themes[this.theme].gridColor
      );
    } else {
      document.documentElement.style.setProperty('--gridColor', `transparent`);
    }
  }

  get canUndo(){
    return this.designerService.canUndo
  }

  get canRedo(){
    return this.designerService.canRedo
  }

  undo(){
    this.designerService.undo()
  }

  redo(){
    this.designerService.redo()
  }

  startDrag(e: MouseEvent) {
    // The node is a dragged node, which is also a node placed on the canvas by default, and any attribute can be customized
    const node = this.newScene();

    console.log(node)

    if (node) this.dnd?.start(node, e);
  }

  ngOnInit(): void {
    this.showGrid = false;
    this.loadService.loadedUser.subscribe((l) => {
      if (l) {
        this.loadedUser = l;
      }
    });

    this.designerService.pubGraph.subscribe((graph) => {
      if (graph) {
        this.graph = graph;
        this.dnd = new Dnd({
          target: graph,
        });
      }
    });

    this.designerService.openStep.subscribe((s) => {
      this.selectedStep = s;
    });

    this.projectService.loading.subscribe((l) => {
      this.loading = l;
    });

    this.projectService.workflow.subscribe((w) => {
      if (w) {
        this.selectedWorkflow = w.id;
        this.executable = w;
      }
    });

    this.designerService.toolboxConfiguration.subscribe((tool) => {
      this.items = tool;
    });
  }

  images: Dict<string> = {};

  openSettings() {
    this.workflowComponent.openControllerSettings('main');
  }

  // setDndContainer(container: HTMLElement) {
  //   if (this.openContainer == false){
  //     this.openContainer = true
  //     if (this.dnd) {
  //       this.dnd = undefined;
  //     } else {
  //       console.log("set dnd")
  //       this.dnd = new Dnd({
  //         target: this.graph!,
  //         dndContainer: container,
  //       });
  //     }
  //   }

  //   return true
  // }

  newScene() {
    let id = this.loadService.newUtilID;
    return this.graph?.createNode({
      id: id,
      shape: 'scene-node',
      x: 300,
      y: 500,
      data: {
        ngArguments: {
          scene: new Scene(id, 'My New Scene'),
        },
      },
      tools: ['button-remove'],
      ports: {
        groups: {

          out: {
            position: 'right',
            attrs: {
              circle: {
                magnet: true,
                stroke: '#fff',
                r: 5,
              },
            },
          },
        },
        items: [
          {
            id: 'port2',
            group: 'out',
          },
        ],
      },
    });
  }

  delete(id: string) {

    this.graph?.removeCell(id)

  }


  public saveLayout() {
    // this.definition = definition;

    this.loading = true;

    this.publish.emit(this.executable);
  }
}
