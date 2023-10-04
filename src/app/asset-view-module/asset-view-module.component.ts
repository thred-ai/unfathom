import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Character } from '../models/workflow/character.model';
import { Executable } from '../models/workflow/executable.model';
import { ModelAsset } from '../models/workflow/model-asset.model';
import { Scene } from '../models/workflow/scene.model';
import { DesignerService } from '../designer.service';
import { LoadService } from '../load.service';
import { ProjectService } from '../project.service';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';

@AutoUnsubscribe
@Component({
  selector: 'app-asset-view-module',
  templateUrl: './asset-view-module.component.html',
  styleUrls: ['./asset-view-module.component.scss'],
})
export class AssetViewModuleComponent implements OnInit {
  workflow?: Executable;

  assets: ModelAsset[] = [];

  constructor(
    private loadService: LoadService,
    private projectService: ProjectService,
    private designerService: DesignerService
  ) {}

  @Output() openMenu = new EventEmitter<{
    comp: string;
    data: any;
    callback: ((data: any) => any) | undefined;
  }>();

  @Output() close = new EventEmitter<any>();

  ngOnInit(): void {
    this.projectService.workflow.subscribe((w) => {
      if (w) {
        this.workflow = w;

        this.assets = Object.values(w.assets) ?? [];
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
    this.openMenu.emit({
      comp: 'asset-module',
      data: {
        asset,
        workflow: this.workflow,
      },
      callback: (data) => {
        if (data && data != '' && data != '0') {
          let asset = data.asset as ModelAsset;

          this.workflow!.assets[asset.id] = asset;

          this.projectService.save(this.workflow);

          setTimeout(() => {
            this.close.emit()
          }, 100);

          // this.workflowChanged.emit(this.workflow);
        }
      },
    });

    // let ref = this.dialog.open(AssetsModuleComponent, {
    //   width: 'calc(var(--vh, 1vh) * 70)',
    //   maxWidth: '650px',
    //   maxHeight: 'calc(var(--vh, 1vh) * 100)',
    //   panelClass: 'app-full-bleed-dialog',

    //   data: {
    //     asset,
    //     workflow: this.workflow,
    //   },
    // });

    // ref.afterClosed().subscribe(async (val) => {
    //   if (val && val != '' && val != '0' && val.workflow) {
    //     let asset = val.asset as ModelAsset;

    //     if (val.action == 'delete') {
    //       // character.status = 1;
    //       return;
    //     }

    //     this.workflow!.assets[asset.id] = asset;

    //     this.projectService.workflow.next(this.workflow);

    //     this.workflowChanged.emit(this.workflow);
    //   }
    // });
  }

  removeAssetWorkflow(id: string) {
    this.workflow?.sceneLayout?.cells.forEach((c) => {
      let scene = c.data?.ngArguments?.scene as Scene;

      if (scene) {
        scene.assets = scene.assets.filter((x) => x.id != id);
      }
    });

    delete this.workflow?.assets[id];

    this.projectService.workflow.next(this.workflow);

    // this.workflowChanged.emit(this.workflow);
  }
}
