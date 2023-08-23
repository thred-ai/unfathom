import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

import { Dict, LoadService } from '../load.service';
import { AIModelType } from '../models/workflow/ai-model-type.model';
import { APIRequest } from '../models/workflow/api-request.model';
import { Key } from '../models/workflow/key.model';
import { TaskTree } from '../models/workflow/task-tree.model';
import { TrainingData } from '../models/workflow/training-data.model';
import { Trigger } from '../models/workflow/trigger.model';
import { WorkflowComponent } from '../workflow/workflow.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { Executable } from '../models/workflow/executable.model';
import { Developer } from '../models/user/developer.model';
import { SceneDefinition } from '../models/workflow/scene-definition.model';
import { Scene } from '../models/workflow/scene.model';
import { Cell, Graph } from '@antv/x6';
import { DesignerService } from '../designer.service';

@Component({
  selector: 'app-file-sidebar',
  templateUrl: './file-sidebar.component.html',
  styleUrls: ['./file-sidebar.component.scss'],
})
export class FileSidebarComponent implements OnInit {
  workflow?: Executable;

  editingTask?: TaskTree;

  //
  frames: Dict<SceneDefinition> = {};

  @Input() set models(val: SceneDefinition[]) {
    val.forEach((v) => {
      this.frames[v.type] = v;
    });
  }

  // flowModels: Dict<AIModelType> = {};

  @Input() triggers: Dict<Trigger> = {};
  @Input() trainingData: Dict<TrainingData> = {};
  @Input() apiKeys: Dict<Key> = {};
  @Input() apiRequests: Dict<APIRequest> = {};
  @Input() executable?: Executable;
  @Input() selectedIcon?: string;

  @Output() detailsChanged = new EventEmitter<Executable>();
  @Output() selectedFileChanged = new EventEmitter<string>();

  loadedUser?: Developer;

  items: Cell.Properties[] = [];

  selectedFile?: string;
  graph?: Graph;

  constructor(
    private workflowComponent: WorkflowComponent,
    private loadService: LoadService,
    private designerService: DesignerService,
    private cdr: ChangeDetectorRef
  ) {}

  removeFile(id: string) {

    this.graph?.removeCell(id)
  }

  ngOnInit(): void {
    this.workflowComponent.workflow.subscribe((w) => {
      if (w) {
        this.workflow = w;
        console.log(w)
        // this.items = [
        //   new Cell.Properties(new Scene('main', 'Storyboard', undefined, ['assets/main.png']), {}),
        // ].concat(w.sceneLayout.cells);

        this.items = w.sceneLayout.cells.filter(t => t.shape != 'edge')

      }
    });
    this.designerService.openStep.subscribe((step) => {
        this.selectedFile = step?.id;
        this.cdr.detectChanges();
      
    });
    this.loadService.loadedUser.subscribe((l) => {
      if (l) {
        this.loadedUser = l;
      }
    });

    this.designerService.pubGraph.subscribe((g) => {
      if (g) {
        this.graph = g;
      }
    });
    // this.workflowComponent.items.subscribe((i) => {
    //   if (this.workflow) {
    //     this.selectedFile =
    //       this.workflowComponent.openFileId ?? this.items[0]?.type == 'model'
    //         ? this.items[0].id
    //         : this.items[0]?.categoryTask?.id;
    //   }
    // });
  }

  checkName() {}

  @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger?: MatMenuTrigger;
  menuTopLeftPosition = { x: '0', y: '0' };

  onRightClick(event: MouseEvent, task: Cell.Properties) {
    // preventDefault avoids to show the visualization of the right-click menu of the browser
    event.preventDefault();
    event.stopPropagation();

    // we record the mouse position in our object
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';

    // we open the menu
    // we pass to the menu the information about our object
    this.matMenuTrigger!.menuData = { item: task };

    // we open the menu
    this.matMenuTrigger!.openMenu();
  }

  openControllerSettings(id: string) {
    this.workflowComponent.openControllerSettings(id);
  }
}
