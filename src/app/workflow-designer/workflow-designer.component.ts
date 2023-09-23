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
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
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
import { Character } from '../models/workflow/character.model';
import { CharacterModuleComponent } from '../character-module/character-module.component';
import { AssetModuleComponent } from '../asset-module/asset-module.component';
import { ModelAsset } from '../models/workflow/model-asset.model';
import { AssetsModuleComponent } from '../assets-module/assets-module.component';

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

  set activeWorkflow(workflow: Executable) {
    this.characters = Object.values(workflow.characters) ?? [];
    this.assets = Object.values(workflow.assets) ?? [];
    this.workflow = workflow;
  }

  window: Window = window;

  frames: Dict<SceneDefinition> = {};

  characters: Character[] = [];
  characterIds: string[] = [];

  assets: ModelAsset[] = [];
  assetIds: string[] = [];

  @Input() set models(val: SceneDefinition[]) {
    val.forEach((v) => {
      this.frames[v.type] = v;
    });
  }

  @Input() theme: 'light' | 'dark' = 'light';
  @Output() detailsChanged = new EventEmitter<Executable>();
  @Output() workflowChanged = new EventEmitter<Executable>();
  @Output() selectedFileChanged = new EventEmitter<string>();
  @Output() openWorldSceneChanged = new EventEmitter<World>();

  selectedFile?: Cell.Properties;

  constructor(
    private clipboard: Clipboard,
    private loadService: LoadService,
    private designerService: DesignerService,
    private injector: Injector,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  selectWorld(scene: Scene) {
    this.loadService.selectWorld(scene);
  }

  @ViewChildren('geditor') divs?: QueryList<ElementRef>;

  ngAfterViewChecked(): void {}

  copy(text: string) {
    this.clipboard.copy(text);
  }

  ngAfterViewInit(): void {}

  initialized = false;

  public toolboxConfiguration: SceneDefinition[] = [];

  resize() {
    window.dispatchEvent(new Event('resize'));
  }

  editCharacter(
    character: Character = new Character(
      this.loadService.newUtilID,
      'New NPC',
      undefined,
      '',
      '/assets/default_head.png',
      '',
      'hero'
    )
  ) {
    let ref = this.dialog.open(CharacterModuleComponent, {
      width: 'calc(var(--vh, 1vh) * 70)',
      maxWidth: '650px',
      maxHeight: 'calc(var(--vh, 1vh) * 100)',
      panelClass: 'app-full-bleed-dialog',

      data: {
        character,
        workflow: this.workflow,
      },
    });

    ref.afterClosed().subscribe(async (val) => {
      if (val && val != '' && val != '0' && val.workflow) {
        let character = val.character as Character;

        if (val.action == 'delete') {
          // character.status = 1;
          return;
        }

        this.workflow!.characters[character.id] = character;

        this.projectService.workflow.next(this.workflow);

        this.workflowChanged.emit(this.workflow);
      }
    });
  }

  editCharacterDetails(character: string) {
    let scene = this.selectedFile?.data.ngArguments.scene as Scene;

    let details = scene.characters.find((c) => c.id == character);
    let c = this.workflow?.characters[character];

    let ref = this.dialog.open(AssetModuleComponent, {
      width: 'calc(var(--vh, 1vh) * 70)',
      maxWidth: '650px',
      maxHeight: 'calc(var(--vh, 1vh) * 100)',
      panelClass: 'app-full-bleed-dialog',

      data: {
        character: c,
        characterDetails: details,
        workflow: this.workflow,
      },
    });

    ref.afterClosed().subscribe(async (val) => {
      if (val && val != '' && val != '0' && val.workflow) {
        let character = val.character as Character;
        let characterDetails = val.characterDetails as any;

        if (val.action == 'delete') {
          // character.status = 1;
          return;
        }

        let index = scene.characters.findIndex((c) => c.id == character.id);

        if (index >= 0) {
          scene!.characters[index] = characterDetails;
          this.designerService.setScene(scene, scene.id);
        }

        this.projectService.workflow.next(this.workflow);

        this.workflowChanged.emit(this.workflow);
      }
    });
  }


  editAsset(
    asset: ModelAsset = new ModelAsset(
      'New Asset',
      this.loadService.newUtilID,
      undefined,
      undefined,
      'static'
    )
  ) {
    let ref = this.dialog.open(AssetsModuleComponent, {
      width: 'calc(var(--vh, 1vh) * 70)',
      maxWidth: '650px',
      maxHeight: 'calc(var(--vh, 1vh) * 100)',
      panelClass: 'app-full-bleed-dialog',

      data: {
        asset,
        workflow: this.workflow,
      },
    });

    ref.afterClosed().subscribe(async (val) => {
      if (val && val != '' && val != '0' && val.workflow) {
        let asset = val.asset as ModelAsset;

        if (val.action == 'delete') {
          // character.status = 1;
          return;
        }

        this.workflow!.assets[asset.id] = asset;

        this.projectService.workflow.next(this.workflow);

        this.workflowChanged.emit(this.workflow);
      }
    });
  }

  editAssetDetails(asset: string) {
    let scene = this.selectedFile?.data.ngArguments.scene as Scene;

    let details = scene.assets.find((a) => a.id == asset);
    let c = this.workflow?.assets[asset];

    let ref = this.dialog.open(AssetModuleComponent, {
      width: 'calc(var(--vh, 1vh) * 70)',
      maxWidth: '650px',
      maxHeight: 'calc(var(--vh, 1vh) * 100)',
      panelClass: 'app-full-bleed-dialog',

      data: {
        asset: c,
        assetDetails: details,
        workflow: this.workflow,
      },
    });

    ref.afterClosed().subscribe(async (val) => {
      if (val && val != '' && val != '0' && val.workflow) {
        let asset = val.asset as ModelAsset;
        let assetDetails = val.assetDetails as any;

        if (val.action == 'delete') {
          // character.status = 1;
          return;
        }

        let index = scene.assets.findIndex((c) => c.id == asset.id);

        if (index >= 0) {
          scene!.assets[index] = assetDetails;
          this.designerService.setScene(scene, scene.id);
        }

        this.projectService.workflow.next(this.workflow);

        this.workflowChanged.emit(this.workflow);
      }
    });
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
        this.activeWorkflow = w;

        if (this.workflow) {
          if (!this.designerService.initialized) {
            this.designerService.initialized = true;
            this.designerService.initGraph(this.injector);
            this.designerService.importJSON(this.workflow.sceneLayout);
          } else {
            this.designerService.checkAlgo(w.sceneLayout);
          }
        }
      }
    });

    this.designerService.toolboxConfiguration.subscribe((tool) => {
      this.toolboxConfiguration = tool;
    });

    this.designerService.openStep.subscribe((step) => {
      this.selectedFile = step;
      console.log(this.characters);

      let scene = this.selectedFile?.data.ngArguments.scene as Scene;

      if (scene) {
        this.characterIds = scene?.characters.map((c) => c.id) ?? [];
        this.assetIds = scene?.assets.map(a => a.id) ?? []
        console.log(this.assetIds)
      } else {
        this.characterIds = [];
        this.assetIds = []
      }
    });
  }

  addCharactersToScene(e: string) {
    console.log('oi');
    let scene = this.selectedFile?.data.ngArguments.scene as Scene;

    let same = scene.characters.find((s) => s.id == e);

    if (this.workflow!.characters[e]) {
      scene.characters.push({
        id: e,
        spawn: {
          x: same?.spawn.x ?? 0,
          y: same?.spawn.y ?? 1000,
          z: same?.spawn.z ?? 0,
        },
        direction: {
          x: same?.direction.x ?? 0,
          y: same?.direction.y ?? 0,
          z: same?.direction.z ?? 0,
        },
        scale: same?.scale ?? 1,
      });
    }

    this.characterIds = scene.characters.map((c) => c.id);

    console.log(scene.characters);

    this.designerService.setScene(scene, scene.id);
  }

  removeCharacter(id: string) {
    let scene = this.selectedFile?.data.ngArguments.scene as Scene;

    let sameIndex = scene.characters.findIndex((s) => s.id == id);

    if (sameIndex >= 0) {
      scene.characters.splice(sameIndex, 1);
    }
    this.characterIds = scene.characters.map((c) => c.id);
    this.designerService.setScene(scene, scene.id);
  }

  removeCharacterWorkflow(id: string) {
    delete this.workflow?.characters[id];

    this.projectService.workflow.next(this.workflow);

    this.workflowChanged.emit(this.workflow);
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
