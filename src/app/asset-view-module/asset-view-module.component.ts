import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Character } from '../models/workflow/character.model';
import { ModelAsset } from '../models/workflow/model-asset.model';
import { Scene } from '../models/workflow/scene.model';
import { LoadService } from '../load.service';
import { ProjectService } from '../project.service';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';
import { World } from '../models/workflow/world.model';
import { SceneAsset } from '../models/workflow/scene-asset.model';
import { DesignService } from '../design.service';
import { ArcRotateCamera } from 'babylonjs';
import "babylonjs-viewer";

@AutoUnsubscribe
@Component({
  selector: 'app-asset-view-module',
  templateUrl: './asset-view-module.component.html',
  styleUrls: ['./asset-view-module.component.scss'],
})
export class AssetViewModuleComponent implements OnInit {
  assets: ModelAsset[] = [];

  @Input() mode: 'elements' | 'uploads' = 'elements';

  constructor(
    private loadService: LoadService,
    private projectService: ProjectService,
    private designService: DesignService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadService.loadedUser.subscribe((l) => {
      if (l) {
        if (this.mode == 'uploads'){
          this.loadService.getModels((models) => {
            this.assets = models.reverse();
          }, l.id);
        }
        else{
          this.loadService.getElements((models) => {
            this.assets = models.reverse();
          });
        }
      }
    });
  }

  addMeshToScene(asset: ModelAsset) {
    let scene = this.designService.engine?.scenes[0];
    let cam = scene?.activeCamera as ArcRotateCamera;
    console.log("joi")
    if (scene && cam) {
      let newAsset = JSON.parse(JSON.stringify(asset)) as ModelAsset;
      let loc = cam.getFrontPosition(1);
      newAsset.id = this.loadService.newUtilID;
      let sceneAsset = new SceneAsset(newAsset, {
        x: loc.x,
        y: loc.y,
        z: loc.z,
      });
      // sceneAsset.scale = {
      //   x: 2,
      //   y: 2,
      //   z: 2
      // }
      this.designService.addMeshToScene(sceneAsset);
    }
  }

  async fileChangeEvent(event: any, type = 1): Promise<void> {
    let file = event.target.files[0] as File;

    let buffer = await file.arrayBuffer();

    var blob = new Blob([buffer]);

    var reader = new FileReader();
    reader.onload = async (event: any) => {
      var base64 = event.target.result;
      if (type == 1) {
        // this.newAsset = file;

        let asset = new ModelAsset(
          file.name,
          `${new Date().getTime()}`,
          base64
        );

        this.assets.unshift(asset);

        this.cdr.detectChanges();

        let url = await this.loadService.saveImg(
          file,
          `users/${this.loadService.loadedUser!.value.id}/models/${
            asset.id
          }.glb`
        );

        asset.assetUrl = url;

        await this.save(asset);
      }
    };

    reader.readAsDataURL(blob);
  }

  async save(modelAsset: ModelAsset) {
    await this.loadService.saveModels(modelAsset);
  }
}
