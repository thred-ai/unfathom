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
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  BranchedStep,
  Definition,
  Designer,
  Step,
  StepEditorContext,
  StepsConfiguration,
  ToolboxConfiguration,
} from 'verticalai-workflow-designer';
import { DesignerComponent } from 'vertical-ai-designer-angular';
import { Dict, LoadService } from '../load.service';
import { Executable } from '../models/workflow/executable.model';
import { AIModelType } from '../models/workflow/ai-model-type.model';
import { TrainingData } from '../models/workflow/training-data.model';
import { Clipboard } from '@angular/cdk/clipboard';
import { Key } from '../models/workflow/key.model';
import { APIRequest } from '../models/workflow/api-request.model';
import { MatDialog } from '@angular/material/dialog';
import { WorkflowComponent } from '../workflow/workflow.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuTrigger } from '@angular/material/menu';
import { SettingsComponent } from '../settings/settings.component';
import { DesignerService } from '../designer.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Scene } from '../models/workflow/scene.model';
import { SceneDefinition } from '../models/workflow/scene-definition.model';
import { register } from '@antv/x6-angular-shape';
import { NodeComponent } from '../node/node.component';
import { Graph, Cell, Edge } from '@antv/x6';
import { Snapline } from '@antv/x6-plugin-snapline';
import { Dnd } from '@antv/x6-plugin-dnd';
import { Selection } from '@antv/x6-plugin-selection';
import { Transform } from '@antv/x6-plugin-transform';
import { SceneNode } from '../models/workflow/scene-node.model';

@Component({
  selector: 'verticalai-workflow-designer',
  templateUrl: './workflow-designer.component.html',
  styleUrls: ['./workflow-designer.component.scss'],
})
export class WorkflowDesignerComponent
  implements OnInit, AfterViewInit, AfterViewChecked
{
  designer?: Designer;

  public definitionJSON?: string;

  workflow?: Executable;

  BranchedStep!: BranchedStep;
  any!: any;

  window: Window = window;

  @ViewChild('gridModeSwitch', { read: ElementRef }) element:
    | ElementRef
    | undefined;

  shouldRefresh = false;

  //
  frames: Dict<SceneDefinition> = {};

  @Input() set models(val: SceneDefinition[]) {
    val.forEach((v) => {
      this.frames[v.type] = v;
    });
  }

  setScene(scene: Scene, id: string) {
    // if (this.workflow) {
    //   let same = this.workflow.scenes.findIndex((f) => f.id == id);
    //   if (same != undefined && same > -1) {
    //     this.workflow.scenes[same] = scene;
    //     console.log('SAME');
    //     console.log(this.workflow.scenes[same]);
    //     this.saveLayout();
    //   }
    // }
  }

  trainingTypes = [
    {
      name: 'Enabled',
      id: 'auto',
    },
    {
      name: 'Disabled',
      id: 'none',
    },
  ];

  // @Input() apiRequests: Dict<APIRequest> = {};
  @Input() theme: 'light' | 'dark' = 'light';

  @Output() detailsChanged = new EventEmitter<Executable>();
  @Output() iconChanged = new EventEmitter<File>();
  @Output() trainingDataChanged = new EventEmitter<TrainingData>();
  @Output() apiKeyChanged = new EventEmitter<Key>();
  // @Output() apiRequestChanged = new EventEmitter<APIRequest>();
  @Output() selectedFileChanged = new EventEmitter<string>();

  selectedFile?: Cell.Properties;

  constructor(
    private cdr: ChangeDetectorRef,
    private clipboard: Clipboard,
    private dialog: MatDialog,
    private renderer: Renderer2,
    private loadService: LoadService,
    private workflowComponent: WorkflowComponent,
    private _snackBar: MatSnackBar,
    private designerService: DesignerService,
    private injector: Injector
  ) {}

  @ViewChildren('geditor') divs?: QueryList<ElementRef>;

  ngAfterViewChecked(): void {}

  copy(text: string) {
    this.clipboard.copy(text);
  }

  openAPIEditor(api: APIRequest, step: Step) {
    // let editor = this.dialog.open(ApiEditorComponent, {
    //   height: 'calc(var(--vh, 1vh) * 70)',
    //   width: 'calc(var(--vh, 1vh) * 70)',
    //   maxWidth: '100vw',
    //   panelClass: 'app-full-bleed-dialog',
    //   data: {
    //     api,
    //   },
    // });
    // editor.afterClosed().subscribe((value) => {
    //   if (value && value != '') {
    //     let api = value as APIRequest;
    //     this.apiRequestChanged.emit(api);
    //     setTimeout(() => {
    //       this.refreshStepEditor(step);
    //     }, 500);
    //   }
    // });
  }

  saveAPIKey(id: string, data: string = '') {
    let apiKey = new Key(id, data);
    this.apiKeyChanged.emit(apiKey);
  }

  graph?: Graph;

  ngAfterViewInit(): void {}

  initialized = false;

  // count = 0;
  // repeat() {
  //   setTimeout(() => {
  //     this.count += 1;
  //     this.ata.cells[0].position.x = this.ata.cells[0].position.x + 5;
  //     this.ata.cells[0].position.y = this.ata.cells[0].position.y + 2;

  //     this.checkAlgo(JSON.parse(JSON.stringify(this.ata)));
  //     if (this.count < 200) {

  //       this.repeat();
  //     } else {
  //       this.ata.cells.pop();
  //       this.checkAlgo(JSON.parse(JSON.stringify(this.ata)));
  //     }
  //   }, 10);
  // }

  

  ata = {
    cells: [
      {
        position: {
          x: 100,
          y: 100,
        },
        size: {
          width: 350,
          height: 450,
        },
        view: 'angular-shape-view',
        shape: 'scene-node',
        id: '1',
        data: {
          ngArguments: {
            value: 'oi',
          },
        },
        tools: {
          items: ['button-remove'],
        },
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
        zIndex: 1,
      },
      {
        position: {
          x: 580,
          y: 580,
        },
        size: {
          width: 350,
          height: 450,
        },
        view: 'angular-shape-view',
        shape: 'scene-node',
        id: '2',
        data: {
          ngArguments: {
            value: 'Oops Oh my god',
          },
        },
        tools: {
          items: ['button-remove'],
        },
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
        zIndex: 2,
      },
      {
        position: {
          x: 580,
          y: -70,
        },
        size: {
          width: 350,
          height: 450,
        },
        view: 'angular-shape-view',
        shape: 'scene-node',
        id: '3',
        data: {
          ngArguments: {
            value: 'Oops Oh my god again',
          },
        },
        tools: {
          items: ['button-remove'],
        },
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
        zIndex: 3,
      },
      {
        shape: 'edge',
        id: '2ac8da8c-e5c1-4ddf-bfde-501b25142ac8',
        source: {
          cell: '1',
          port: 'port2',
        },

        target: {
          cell: '2',
        },
        tools: {
          items: ['button-remove'],
        },
        zIndex: 4,
      },
      {
        shape: 'edge',
        id: '63c0e419-c795-46be-8743-356552ac8d34',
        source: {
          cell: '1',
          port: 'port2',
        },
        tools: {
          items: ['button-remove'],
        },
        target: {
          cell: '3',
        },
        zIndex: 5,
      },
    ],
  };

  off =
    'M464.75 400.25 434.75 370.25V322.75H387.25L357.25 292.75H434.75V198.25H344.25V279.75L314.25 249.75V198.25H262.75L232.75 168.25H314.25V77.75H219.25V154.75L189.25 124.75V77.75H142.25L112.25 47.75H434.75Q446.25 47.75 455.5 57T464.75 77.75V400.25ZM344.25 168.25H434.75V77.75H344.25V168.25ZM475.75 496.25 426.75 447.75H94.75Q83.25 447.75 74 438.5T64.75 417.75V85.25L15.25 36.25 36.75 15.75 496.75 475.25 475.75 496.25ZM344.25 417.75H396.75L344.25 365.25V417.75ZM219.25 292.75H272.75L219.25 240.25V292.75ZM219.25 417.75H314.25V334.75L301.75 322.75H219.25V417.75ZM94.75 168.25H147.25L94.75 114.75V168.25ZM94.75 292.75H189.25V210.25L177.25 198.25H94.75V292.75ZM189.25 417.75V322.75H94.75V417.75H189.25Z';
  on =
    'M106 436q-12 0-21-9t-9-21v-300q0-12 9-21t21-9h300q12 0 21 9t9 21v300q0 12-9 21t-21 9H106Zm0-30h80v-80H106v80Zm110 0h80v-80H216v80Zm110 0h80v-80H326v80ZM106 296h80v-80H106v80Zm110 0h80v-80H216v80Zm110 0h80v-80H326v80ZM106 186h80v-80H106v80Zm110 0h80v-80H216v80Zm110 0h80v-80H326v80Z';

  setIcon() {
    if (this.element) {
      this.element.nativeElement
        .querySelector('.mdc-switch__icon--on')
        .firstChild.setAttribute('d', this.on);
      this.element.nativeElement
        .querySelector('.mdc-switch__icon--off')
        .firstChild.setAttribute('d', this.off);
    }
  }

  @ViewChild('sqdDesigner') public sqdDesigner?: DesignerComponent;

  public toolboxConfiguration: SceneDefinition[] = [];

  resize() {
    window.dispatchEvent(new Event('resize'));
  }

  // changeTriggerType(newType: string, context: GlobalEditorContext) {
  //   this.workflow!.layout.properties['trigger'] = newType;

  //   context.notifyPropertiesChanged();
  // }

  definitionChanged(definition: Definition) {
    // this.workflow!.layout = definition;
    // this.setAPISVG();
    // this.saveLayout();
  }

  public readonly stepsConfiguration: StepsConfiguration = {
    iconUrlProvider: (componentType: string, type: string) => {
      return this.loadService.iconUrlForController(componentType, type);
    },
    canMoveStep: (sourceSequence, step, targetSequence, targetIndex) => {
      return true;
    },
    canInsertStep: (step, targetSequence, targetIndex) => {
      return true;
    },
    canDeleteStep: (step, parentSequence) => {
      return this.loadService.confirmDelete();
    },
    isDeletable: (step, parentSequence) => {
      // let ref = this._snackBar.open('Delete Controller', 'Delete');
      // ref.onAction().subscribe(() => {
      //   return true
      // });

      // ref.afterDismissed().subscribe(() => {
      //   return false
      // });

      return true;
    },
    isDraggable: (step, parentSequence) => {
      return true;
    },
    isDuplicable: (step, parentSequence) => {
      return true;
    },
  };

  isNameTaken(name: string, step: BranchedStep) {
    if (step.branches[name]) {
      return true;
    }
    return false;
  }

  done = false;

  openPathSettings() {}

  public ngOnInit() {
    this.shouldRefresh = true;

    this.designerService.initGraph(this.injector);

    this.workflowComponent.workflow.subscribe((w) => {
      if (w) {
        this.cdr.detectChanges();
        this.workflow = w;
        if (!this.initialized) {
          this.initialized = true;
          this.designerService.pubJSON.subscribe((json) => {
            if (json) {
              this.workflow!.sceneLayout = json;
              console.log(json);
              this.saveLayout();
            }
          });
          this.designerService.importJSON(this.workflow.sceneLayout);
        } else {
          console.log("CHECKING ALGO")
          this.designerService.checkAlgo(w.sceneLayout);
        }
      }
    });

    this.designerService.toolboxConfiguration.subscribe((tool) => {
      this.toolboxConfiguration = tool;
    });

    this.loadService.database.subscribe((d) => {
      if (d) {
        this.loadedDocs = Object.keys(d);
      }
    });

    this.done = true;

    var elementResizeDetectorMaker = require('element-resize-detector');

    var erd = elementResizeDetectorMaker();

    // // With the ultra fast scroll-based approach.
    // // This is the recommended strategy.
    // var erdUltraFast = elementResizeDetectorMaker({
    //   strategy: "scroll" //<- For ultra performance.
    // });

    // erd.listenTo(
    //   document.getElementById('container'),
    //   (element: HTMLElement) => {
    //     var width = element.offsetWidth;
    //     var height = element.offsetHeight;
    //     window.dispatchEvent(new Event('resize'));
    //   }
    // );

    this.workflowComponent.openStep.subscribe((step) => {
      if (step) {
        this.selectedFile = step;
      }
      this.rerenderDesigner();
    });
  }

  rerenderDesigner() {
    // window.dispatchEvent(new Event('resize'));
    this.cdr.detectChanges();
  }

  public onDesignerReady(designer: Designer) {
    this.designer = designer;

    this.rerenderDesigner();

    // if (document.eventListeners) {
    //   let l = document.eventListeners('keyup')[0];
    //   document.removeEventListener('keyup', l);
    // }

    // window.addEventListener(
    //   'keypress',
    //   function (event) {
    //     event.stopImmediatePropagation();
    //   },
    //   true
    // );

    // this.setToolbarLoc()

    try {
      this.designer?.onSelectedStepIdChanged.subscribe((id) => {
        setTimeout(() => {
          if (id) {
            this.selectedFileChanged.emit(id);
            // clearListener(id)
          } else {
            this.selectedFileChanged.emit('main');
          }
        }, 1);

        this.rerenderDesigner();
      });

      this.workflowComponent.openStep.subscribe((step) => {
        this.stepContext = undefined;
        if (step) {
          if (step.id && step.id != 'main') {
            this.designer?.selectStepById(step.id);
            this.downloadDB();
          } else {
            this.designer?.clearSelectedStep();
          }
          this.rerenderDesigner();
        }
      });
    } catch (error) {}

    // async function clearListener(id: string) {
    //   let doc = document.getElementsByClassName('sqd-selected')[0];

    //   if (doc) {
    //     doc.outerHTML = doc.outerHTML
    //   }
    // }
  }

  loadedDocs: string[] = [];

  downloadDB() {
    // if (
    //   this.workflow &&
    //   this.selectedFile &&
    //   (this.selectedFile.properties['training'] ?? 'none') == 'auto'
    // ) {
    //   if (
    //     this.selectedFile &&
    //     !this.selectedFile.properties['autoId'] &&
    //     this.loadedDocs[0]
    //   ) {
    //     console.log(this.loadedDocs[0]);
    //     this.selectedFile.properties['autoId'] = this.loadedDocs[0];
    //     this.selectedFileChanged.emit(this.selectedFile.id);
    //     this.saveLayout();
    //   }
    // }
  }

  stepContext?: StepEditorContext;

  public saveLayout() {
    // this.definition = definition;

    // if (this.)

    this.detailsChanged.emit(this.workflow);
  }

  public updateName(step: Step, event: Event, context: StepEditorContext) {
    step.name = (event.target as HTMLInputElement).value;
    context.notifyNameChanged();
  }

  onInput(ev: any) {
    var value = ev.target!.value;

    // if (value == '') {
    //   value = this.defaultValue;
    // }

    return value;
  }

  @ViewChild('frame') frame?: ElementRef<HTMLElement>;

  setAPISVG() {
    // setTimeout(() => {
    //   let elem = document.getElementsByClassName(
    //     'sqd-root-start-stop-icon'
    //   )[0] as SVGPathElement;
    //   if (elem) {
    //     console.log('ELEM');
    //     let elem2 = elem.parentNode as SVGGElement;
    //     if (elem2) {
    //       elem?.setAttribute(
    //         'd',
    //         'M 28.945312 -0.140625 C 13.019531 -0.140625 0.117188 12.746094 0.117188 28.660156 L 0.117188 259.058594 C 0.117188 274.972656 13.019531 287.859375 28.945312 287.859375 L 346.054688 287.859375 C 361.980469 287.859375 374.882812 274.972656 374.882812 259.058594 L 374.882812 28.660156 C 374.882812 12.746094 361.980469 -0.140625 346.054688 -0.140625 Z M 75.820312 86.257812 L 111.714844 86.257812 L 150.480469 201.460938 L 118.527344 201.460938 L 111.320312 176.148438 L 73.679688 176.148438 L 66.246094 201.460938 L 37.136719 201.460938 Z M 173.085938 86.257812 L 223.589844 86.257812 C 248.371094 86.257812 265.144531 102.398438 265.144531 127.152344 C 265.144531 151.660156 247.488281 167.679688 221.847656 167.679688 L 202.394531 167.679688 L 202.394531 201.460938 L 173.085938 201.460938 Z M 302.8125 86.257812 L 332.121094 86.257812 L 332.121094 201.460938 L 302.8125 201.460938 Z M 202.421875 108.757812 L 202.421875 145.574219 L 215.679688 145.574219 C 228.148438 145.574219 235.5 139.175781 235.5 127.210938 C 235.484375 115.070312 228.230469 108.757812 215.847656 108.757812 Z M 91.894531 112.21875 L 79.253906 155.082031 L 105.800781 155.082031 L 93.414062 112.21875 Z M 91.894531 112.21875'
    //       );
    //       elem?.setAttribute('transform', 'scale(0.04583333333333333)');
    //       elem2?.setAttribute('transform', 'translate(6, 9)');
    //     }
    //   }
    // let elems = document.getElementsByClassName(
    //   'sqd-root-start-stop-icon'
    // )[1] as SVGPathElement;
    // if (elems) {
    //   console.log('ELEM');
    //   let elem2 = elems.parentNode as SVGGElement;
    //   if (elem2) {
    //     elems?.setAttribute(
    //       'd',
    //       'M 283.265625 59.023438 L 260.585938 36.375 L 158.972656 137.941406 L 181.648438 160.589844 Z M 351.300781 36.375 L 181.570312 205.8125 L 114.734375 139.0625 L 92.054688 161.710938 L 181.570312 251.113281 L 373.902344 59.023438 Z M 1.417969 161.710938 L 90.933594 251.113281 L 113.613281 228.464844 L 24.097656 139.0625 Z M 1.417969 161.710938'
    //     );
    //     elems?.setAttribute('transform', 'scale(0.04583333333333333)');
    //     elem2?.setAttribute('transform', 'translate(6, 9)');
    //   }
    // }
    // }, 1);
  }

  newBranch(step: BranchedStep) {
    const map1 = new Map();
    const map2 = new Map();
    const map3 = new Map();

    Object.keys(step.branches).forEach((key, index) => {
      map1.set(key, step.branches[key]);
      map2.set(key, index);
      map3.set(key, (step.properties['branches'] as Dict<any>)[key]);
    });

    let name = `Option ${(Object.keys(step.branches) as string[]).length + 1}`;

    if (this.isNameTaken(name, step)) {
      var index = 1;
      do {
        index += 1;
        name = `Option ${
          (Object.keys(step.branches) as string[]).length + index
        }`;
      } while (this.isNameTaken(name, step));
    }
    map1.set(name, []);
    map2.set(name, map1.size - 1);
    map3.set(name, (step.properties['branches'] as Dict<any>)[name]);

    step.branches = Object.fromEntries(map1);
    step.properties['order'] = Object.fromEntries(map2);
    step.properties['branches'] = Object.fromEntries(map3);

    this.shouldRefresh = true;

    this.saveLayout();
  }

  setBranchDescription(
    branchName: string,
    step: BranchedStep,
    description: string
  ) {
    if (!step.properties['branches']) {
      step.properties['branches'] = {};
    }

    let branches = step.properties['branches'] as Dict<any>;

    branches[branchName] = {
      description,
    };
  }

  openBranchSettings(step: BranchedStep, branch?: string) {
    let ref = this.dialog.open(SettingsComponent, {
      width: 'calc(var(--vh, 1vh) * 70)',
      maxWidth: '650px',
      maxHeight: 'calc(var(--vh, 1vh) * 100)',
      panelClass: 'app-full-bleed-dialog',

      data: {
        step,
        branch,
        workflow: this.workflow,
      },
    });

    ref.afterClosed().subscribe(async (val) => {
      if (val && val != '' && val != '0') {
        let description = val.description ?? '';
        let title = val.title ?? '';

        this.setBranchName(title, step, branch);

        this.setBranchDescription(title, step, description);

        this.shouldRefresh = true;

        this.saveLayout();
      }
    });
  }

  placeholders: Dict<any> = {
    'gpt-LLM': 'ex. Keep answers short',
    switch: 'ex. Choose "Option 1" if the sentiment is happy',
    'dalle-TIM': 'ex. High Definition, Hyper-Realistic',
  };

  setBranchName(newName: string, step: BranchedStep, oldName: string = '') {
    const map1 = new Map();
    const map2 = new Map();
    const map3 = new Map();

    let branches = Object.keys(step.branches);
    let i = branches.indexOf(oldName);

    if (i > -1) {
      branches.forEach((key, index) => {
        var name = key;
        if (index == i) {
          name = newName;
          if (step.properties['default'] == oldName) {
            step.properties['default'] = name;
          }
        }
        map1.set(name, step.branches[key]);
        map2.set(name, index);
        map3.set(name, (step.properties['branches'] as Dict<any>)[key]);
      });

      step.branches = Object.fromEntries(map1);
      step.properties['order'] = Object.fromEntries(map2);
      step.properties['branches'] = Object.fromEntries(map3);
    }
  }

  deleteBranch(step: BranchedStep, nameToRemove: string) {
    const map1 = new Map();
    const map2 = new Map();
    const map3 = new Map();

    let branches = Object.keys(step.branches);

    if (branches.length == 2) {
      return;
    }
    branches.forEach((key, index) => {
      if (key != nameToRemove) {
        map1.set(key, step.branches[key]);
      }
    });

    var index = 0;
    map1.forEach((m: any, key: string) => {
      map2.set(key, index);
      map3.set(key, (step.properties['branches'] as Dict<any>)[key]);
      index += 1;
    });

    step.branches = Object.fromEntries(map1);
    step.properties['order'] = Object.fromEntries(map2);
    step.properties['branches'] = Object.fromEntries(map3);

    if (step.properties['default'] == nameToRemove) {
      step.properties['default'] = Object.keys(
        step.properties['order'] ?? {}
      )[0] as string;
    }

    this.shouldRefresh = true;

    this.saveLayout();
  }

  @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger?: MatMenuTrigger;
  menuTopLeftPosition = { x: '0', y: '0' };

  onRightClick(event: MouseEvent, branch: string, step: BranchedStep) {
    // preventDefault avoids to show the visualization of the right-click menu of the browser
    event.preventDefault();
    event.stopPropagation();

    // we record the mouse position in our object
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';

    // we open the menu
    // we pass to the menu the information about our object
    this.matMenuTrigger!.menuData = { item: branch, step };

    // we open the menu
    this.matMenuTrigger!.openMenu();
  }
}
