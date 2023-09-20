import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';

import { Dict, LoadService } from '../load.service';
import { Executable } from '../models/workflow/executable.model';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatDialog } from '@angular/material/dialog';
import { WorkflowComponent } from '../workflow/workflow.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { DesignerService } from '../designer.service';
import { Scene } from '../models/workflow/scene.model';
import { SceneDefinition } from '../models/workflow/scene-definition.model';
import { Cell } from '@antv/x6';
import { ProjectService } from '../project.service';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';
import 'babylonjs-loaders';
import { World } from '../models/workflow/world.model';

@AutoUnsubscribe
@Component({
  selector: 'verticalai-workflow-designer',
  templateUrl: './workflow-designer.component.html',
  styleUrls: ['./workflow-designer.component.scss'],
})
export class WorkflowDesignerComponent
  implements OnInit, AfterViewInit, AfterViewChecked
{

  workflow?: Executable;

  window: Window = window;

  frames: Dict<SceneDefinition> = {};

  @Input() set models(val: SceneDefinition[]) {
    val.forEach((v) => {
      this.frames[v.type] = v;
    });
  }


  @Input() theme: 'light' | 'dark' = 'light';
  @Output() detailsChanged = new EventEmitter<Executable>();
  @Output() selectedFileChanged = new EventEmitter<string>();
  @Output() openWorldSceneChanged = new EventEmitter<World>();

  selectedFile?: Cell.Properties;

  constructor(
    private clipboard: Clipboard,
    private loadService: LoadService,
    private designerService: DesignerService,
    private injector: Injector,
    private projectService: ProjectService
  ) {}

  selectWorld(scene: Scene) {
    this.loadService.selectWorld(scene);
  }

  @ViewChildren('geditor') divs?: QueryList<ElementRef>;

  ngAfterViewChecked(): void {}

  copy(text: string) {
    this.clipboard.copy(text);
  }

  ngAfterViewInit(): void {
  }

  initialized = false;

  public toolboxConfiguration: SceneDefinition[] = [];

  resize() {
    window.dispatchEvent(new Event('resize'));
  }

  public ngOnInit() {
    this.designerService.initialized = false;

    this.designerService.pubJSON.subscribe((json) => {
      if (json && this.workflow && json != this.workflow.sceneLayout) {
        this.workflow.sceneLayout = json;
        this.saveLayout();
      }
    });

    this.projectService.workflow.subscribe((w) => {
      if (w) {
        this.workflow = w;
        if (!this.designerService.initialized) {
          this.designerService.initialized = true;
          this.designerService.initGraph(this.injector);
          this.designerService.importJSON(this.workflow.sceneLayout);
        } else {
          this.designerService.checkAlgo(w.sceneLayout);
        }
      }
    });

    this.designerService.toolboxConfiguration.subscribe((tool) => {
      this.toolboxConfiguration = tool;
    });


    this.designerService.openStep.subscribe((step) => {
      this.selectedFile = step;
    });
  }

  
  updateCellName(id: string, value: any) {
    let cell = this.designerService.graph?.getCellById(id);

    let scene = this.selectedFile?.data.ngArguments.scene as Scene;

    if (cell && scene) {
      scene.name = value;
      cell.setData({
        ngArguments: {
          scene,
        },
      });
    }
  }

  updateCellDesc(id: string, value: any) {
    let cell = this.designerService.graph?.getCellById(id);

    let scene = this.selectedFile?.data.ngArguments.scene as Scene;

    if (cell && scene) {
      scene.description = value;
      cell.setData({
        ngArguments: {
          scene,
        },
      });
    }
  }

  public saveLayout() {
    this.detailsChanged.emit(this.workflow);
  }

  @ViewChild('frame') frame?: ElementRef<HTMLElement>;

  async fileChangeEvent(event: any): Promise<void> {
    let file = event.target.files[0];

    let buffer = await file.arrayBuffer();

    var blob = new Blob([buffer]);

    var reader = new FileReader();
    reader.onload = (event: any) => {
      var base64 = event.target.result;

      // let imgIcon = document.getElementById('imgIcon') as HTMLImageElement;
      // imgIcon!.src = base64;

      let scene = this.selectedFile?.data.ngArguments.scene as Scene;
      if (scene) {
        scene.images[0] = base64;

        // this.iconChanged.emit(file);
        this.designerService.setScene(scene, scene.id);
      }
    };

    reader.readAsDataURL(blob);
  }

  @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger?: MatMenuTrigger;
  menuTopLeftPosition = { x: '0', y: '0' };
}
