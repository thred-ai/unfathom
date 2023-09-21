import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Dict, LoadService } from '../load.service';
import { Developer } from '../models/user/developer.model';
import { Trigger } from '../models/workflow/trigger.model';
import { TrainingData } from '../models/workflow/training-data.model';
import { APIRequest } from '../models/workflow/api-request.model';
import { Subscription } from 'rxjs';
import { Executable } from '../models/workflow/executable.model';
import { TaskTree } from '../models/workflow/task-tree.model';

import { ActivatedRoute, Router } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { SettingsComponent } from '../settings/settings.component';
import { WorkflowDesignerComponent } from '../workflow-designer/workflow-designer.component';
import { ApiTesterComponent } from '../api-tester/api-tester.component';
import { Scene } from '../models/workflow/scene.model';
import { DesignerService } from '../designer.service';
import { SceneDefinition } from '../models/workflow/scene-definition.model';
import { Cell } from '@antv/x6';
import { ThemeService } from '../theme.service';
import { ProjectService } from '../project.service';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';
import { World } from '../models/workflow/world.model';
import { ProtoTesterComponent } from '../proto-tester/proto-tester.component';

@AutoUnsubscribe
@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss'],
})
export class WorkflowComponent implements OnInit {
  loading = false;
  edited = false;
  newWorkflow = true;

  dev?: Developer;
  triggers: Dict<Trigger> = {};

  workflowIcon?: File;
  newTrainingData?: TrainingData;
  newAPIRequest?: APIRequest;

  workflow?: Executable;

  openStep: Cell.Properties = {};

  models: SceneDefinition[] = [];

  theme: 'light' | 'dark' = 'light';

  mode = 'sidebar';

  selectedIcon: string = 'design';
  openWorldScene?: World;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.onKeyDown(event);
  }

  onKeyDown($event: KeyboardEvent): void {
    // Detect platform
    if (navigator.platform.match('Mac')) {
      this.handleMacKeyEvents($event);
    } else {
      this.handleWindowsKeyEvents($event);
    }
  }

  async handleMacKeyEvents($event: any) {
    // MetaKey documentation
    // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/metaKey
    let charCode = String.fromCharCode($event.which).toLowerCase();
    if ($event.metaKey && charCode === 's') {
      $event.preventDefault();
      // Action on Cmd + S
      await this.save(1, true);
    }
    // if ($event.metaKey && charCode === 'c') {
    //   $event.preventDefault();
    //   // Action on Cmd + S
    //   // await this.save(1, true);
    // }
    // if ($event.metaKey && charCode === 'v') {
    //   $event.preventDefault();
    //   // Action on Cmd + S
    //   // await this.save(1, true);
    // }
  }

  async handleWindowsKeyEvents($event: any) {
    let charCode = String.fromCharCode($event.which).toLowerCase();
    if ($event.ctrlKey && charCode === 's') {
      $event.preventDefault();
      // Action on Ctrl + S
      await this.save(1, true);
    }
    // if ($event.ctrlKey && charCode === 'c') {
    //   $event.preventDefault();
    //   // Action on Ctrl + S
    //   // await this.save(1, true);
    // }
    // if ($event.ctrlKey && charCode === 'v') {
    //   $event.preventDefault();
    //   // Action on Ctrl + S
    //   // await this.save(1, true);
    // }
  }

  set activeWorkflow(app: Executable | undefined) {
    var workflow!: Executable;

   

    if (app) {
      this.newWorkflow = false;
      workflow = app;
      //workflow.layout = this.loadService.sortBranches(workflow.layout);

      if (app.id != this.workflow?.id){
        this.designerService.initialized = false
      }
      
      this.projectService.workflow.next(workflow);



    } else {
      this.newWorkflow = true;
      this.designerService.initialized = false
      workflow = new Executable(
        this.loadService.newUtilID,
        this.loadService.loadedUser.value?.id ?? '',
        new Date().getTime(),
        0,
        '',
        'https://storage.googleapis.com/thred-protocol.appspot.com/resources/default_smartutil_app.png'
      );
      this.dev?.utils.push(workflow)
      this.projectService.workflow.next(workflow);

      this.save(1)
    }

    // const loadData = () => {
    //   this.loadService.getAPIKeys(workflow.id, workflow.creatorId);
    // };

  }

  async setWorkflow(id?: string, fileId = 'main') {
    this.cdr.detectChanges();

    // setTimeout(async () => {
    if (id && this.dev) {
      let same = this.dev.utils?.find((w) => w.id == id);

      if (same) {
        this.activeWorkflow = same;
        // same.layout.properties
      } else {
        this.activeWorkflow = this.dev.utils[0];
      }
    } else {
      this.activeWorkflow = undefined;
    }
    await this.selectFile(fileId, this.selectedIcon ?? 'design');
    // }, 100);

    // if (val){
    //   val.utils?.push
    // }
  }

  classes: Dict<any> = {};

  constructor(
    private loadService: LoadService,
    private designerService: DesignerService,
    @Inject(PLATFORM_ID) private platformID: Object,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private dialog: MatDialog,
    private themeService: ThemeService,
    private projectService: ProjectService
  ) {}

  clientId!: string;
  sub?: Subscription;

  async ngOnInit() {
    // setTimeout(function(){debugger;}, 5000)
    this.clientId = this.loadService.newUtilID;

    this.themeService.theme.subscribe((theme) => {
      this.theme = theme;
    });

    this.projectService.loading.subscribe((l) => {
      this.loading = l;
    });

    this.designerService?.openWorld.subscribe((world) => {
      if (!this.openWorldScene && world){
        this.openPrototype()
      }
      else{

      }
      this.openWorldScene = world;
      
    });

    this.designerService.toolboxConfiguration.subscribe((s) => {
      this.models = s ?? [];
    });

    this.designerService.openStep.subscribe((step) => {
      if (step) {
        this.openStep = step;
        // this.selectFile(step.id, this.selectedIcon);
      }
      this.updateRoute(step?.id);
    });

    this.projectService.workflow.subscribe(async (w) => {
      this.workflow = w;
    });

    this.loadService.loadedUser.subscribe((user) => {
      this.dev = user;

      if (user) {

        this.route.queryParams.subscribe(async (params) => {
          let proj = params['project'];
          let file = params['file'] ?? 'main';
          let selectedModule = params['module'] ?? 'design';

          if (this.dev && this.dev.utils) {
            this.loadService.getLayout(proj, this.clientId, async (layout) => {
              let workflow =
                this.workflow ??
                this.dev?.utils.find((f) => f.id == proj) ??
                this.dev?.utils[0];

              if (!workflow) {
                this.activeWorkflow = undefined;
                workflow = this.workflow;
              }

              if (workflow) {
                if (layout) {
                  workflow.sceneLayout = layout;
                } else {
                }

                this.activeWorkflow = workflow;

                if (!this.openStep.id) {
                  await this.selectFile(
                    file ?? 'main',
                    selectedModule,
                    workflow,
                    true
                  );
                }

                if (!this.openStep.id) {
                  await this.selectFile('main', selectedModule, workflow, true);
                }

              } else {
              }
            });
          }
        });
      }
    });
  }

  async updateRoute(stepId: string = 'main') {
    if (this.workflow && this.selectedIcon) {
      await this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          project: this.workflow.id,
          file: stepId,
          module: this.selectedIcon,
        },
        queryParamsHandling: 'merge',
        // preserve the existing query params in the route
        skipLocationChange: false,
        // do not trigger navigation
      });
    }
  }

  get isValid(): boolean {
    if (this.workflow) {
      let textFields = ['name'] as 'name'[];

      // let validArray =
      //   arrayFields.filter(
      //     (field) =>
      //       this.workflow![field] == undefined || this.workflow![field] == null
      //   ).length == 0;

      return (
        textFields.filter(
          (field) =>
            this.workflow![field] == undefined ||
            this.workflow![field] == null ||
            this.workflow![field]?.trim() == ''
        ).length == 0
      ); //&& validArray;
    }

    return false;
  }

  async save(mode = 1, update = false, workflow = this.workflow) {

    if (workflow) {
      try {
        if (mode == 1) {
          let exec = await this.fillExecutable(workflow);


          let result = await this.loadService.saveSmartUtil(
            exec,
            this.clientId
          );

          if (result) {
            this.edited = false;
            if (update) {
              this.updateWorkflows(exec);
            }
          }
          return;
        } else if (mode == 2) {
          this.activeWorkflow = workflow;
          await this.loadService.saveLayout(workflow, this.clientId);

          return;
        }
      } catch (error) {
        console.log(error);
      }
    } else {
    }
  }

  openPrototype(mode: string = 'window') {
    if (mode == 'window') {
      let ref = this.dialog.open(ProtoTesterComponent, {
        panelClass: 'prototype-dialog',
        hasBackdrop: false,
        data: {
          user: this.dev,
          workflowComponent: this,
        },
      });

      ref.afterClosed().subscribe(async (val) => {
        if (val && val != '' && val != '0' && val.dev) {
          // let img = val.img as File;
          // await this.loadService.saveUserInfo(
          //   val.dev,
          //   img,
          //   img != undefined,
          //   (result) => {}
          // );
        }
      });
    } else {
    }
  }

  async fillExecutable(executable: Executable) {
    const exec = executable;

    return exec;
  }

  openProfileSettings(dev: Developer) {
    let ref = this.dialog.open(SettingsComponent, {
      width: 'calc(var(--vh, 1vh) * 70)',
      maxWidth: '650px',
      maxHeight: 'calc(var(--vh, 1vh) * 100)',
      panelClass: 'app-full-bleed-dialog',

      data: {
        dev,
        workflow: this.workflow,
      },
    });

    ref.afterClosed().subscribe(async (val) => {
      if (val && val != '' && val != '0' && val.dev) {
        let img = val.img as File;

        await this.loadService.saveUserInfo(
          val.dev,
          img,
          img != undefined,
          (result) => {}
        );
      }
    });
  }

  openControllerSettings(controllerId: string = 'main') {
    let ref = this.dialog.open(SettingsComponent, {
      width: 'calc(var(--vh, 1vh) * 70)',
      maxWidth: '650px',
      maxHeight: 'calc(var(--vh, 1vh) * 100)',
      panelClass: 'app-full-bleed-dialog',

      data: {
        step: controllerId != 'main' ? this.findScene(controllerId) : undefined,
        workflow: this.workflow,
      },
    });

    ref.afterClosed().subscribe(async (val) => {
      if (val && val != '' && val != '0' && val.workflow) {
        let img = val.img as File;

        let workflow = val.workflow as Executable;

        if (img && this.workflow) {
          let url = await this.loadService.uploadImg(img, workflow.id);

          if (url) {
            workflow.displayUrl = url;
          }
        }

        if (val.action == 'delete') {
          workflow.status = 1;
        }

        if (val.file) {
          let file = val.file as Scene;
          let w = this.setScene(file, workflow);

          if (w) {
            workflow = w;
          }
        }

        this.projectService.workflow.next(workflow)

        await this.save(1, false, workflow);

      }
    });
  }

  @ViewChild(WorkflowDesignerComponent) designer?: WorkflowDesignerComponent;


  async publish(
    workflow = this.workflow,
    close = false,
    callback?: (result?: Executable) => any
  ) {
    const w = workflow;
    if (w) {
      this.loading = true;

      await this.save(1, false);
      w.executableUrl = await this.loadService.uploadExecutable(w.id, w);

      let result = await this.loadService.publishSmartUtil(w);

      this.loading = false;
      if (callback) {
        callback(result);
      }
    } else {
      if (callback) {
        callback();
      }
    }
  }

  updateWorkflows(workflow = this.workflow) {
    let dev = JSON.parse(
      JSON.stringify(this.loadService.loadedUser.value)
    ) as Developer;

    if (dev && dev.utils && workflow) {
      // this.activeWorkflow = workflow;
      // let index = dev.utils.findIndex((w) => w.id == workflow.id);
      // if (index > -1) {
      //   dev.utils[index] = workflow;
      // } else {
      //   dev.utils.push(workflow);
      // }
      // this.loadService.loadedUser.next(dev);
    }
  }

  setScene(scene: Scene, workflow = this.workflow) {
    if (workflow) {
      // let same = workflow.sceneLayout.cells.map(cell => cell.data.ngArguments.scene.scenes).findIndex((f) => f.id == scene.id);
      // if (same != undefined && same > -1) {
      //   workflow.scenes[same] = scene;
      // }
    }
    return workflow;
  }

  analyzeTasks(tasks: Cell.Properties[]) {
    var objects: TaskTree[] = [];

    var sameNames: Dict<number> = {};

    tasks
      .filter((t) => t.shape != 'edge')
      .forEach((task) => {
        let id = task.id!;
        let stepName = task.data?.ngArguments?.scene?.name;

        if (stepName) sameNames[stepName] = (sameNames[stepName] ?? 0) + 1;

        objects.push(
          new TaskTree(
            (task.data.ngArguments.scene?.name as string) ??
              this.jsFormattedName(
                stepName ?? 'Scene',
                sameNames[task.data?.ngArguments?.scene?.name ?? 'Scene']
              ),
            id,
            'model',
            [],
            undefined,
            {
              type: task.data?.ngArguments?.scene?.type,
              img: task.data?.ngArguments?.scene?.images[0],
            }
          )
        );
      });

    return objects;
  }

  findScene(fileId: string, workflow = this.workflow) {
    if (fileId == 'main') {
      return undefined; //new Cell.Properties(new Scene('main'), {});
    }
    return workflow?.sceneLayout.cells.find((cell) => cell.id == fileId);
  }

  async selectFile(
    fileId: string | undefined,
    selectedModule: string | undefined,
    workflow = this.workflow,
    update = true
  ) {
    if (workflow && fileId && selectedModule) {
      if (this.openStep?.id != fileId) {
        this.designerService.openStep.next(this.findScene(fileId));
      }
      this.selectedIcon = selectedModule;
    }
  }

  jsFormattedName(name: string, same: number) {
    return name + (same > 1 ? `(${same})` : '');
  }
}
