import { ChangeDetectorRef, Component } from '@angular/core';
import { DesignService } from '../design.service';
import { LoadService } from '../load.service';
import { ProjectService } from '../project.service';
import { Material } from '../models/workflow/material.model';
import { ArcRotateCamera } from 'babylonjs';
import { ModelAsset } from '../models/workflow/model-asset.model';
import { SceneAsset } from '../models/workflow/scene-asset.model';
import { Substance } from '../models/workflow/substance.model';

@Component({
  selector: 'app-substance-view-module',
  templateUrl: './substance-view-module.component.html',
  styleUrls: ['./substance-view-module.component.scss'],
})
export class SubstanceViewModuleComponent {
  assets: Substance[] = [];

  constructor(
    private loadService: LoadService,
    private projectService: ProjectService,
    private designService: DesignService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadService.loadedUser.subscribe((l) => {
      if (l) {
        this.loadService.getSubstances((models) => {
          this.assets = models.reverse();
        });
      }
    });
  }

  addMeshToScene(asset: Material) {
    this.designService.addMeshToScene(asset);
  }

  // async fileChangeEvent(event: any, type = 1): Promise<void> {
  //   let file = event.target.files[0] as File;

  //   let buffer = await file.arrayBuffer();

  //   var blob = new Blob([buffer]);

  //   var reader = new FileReader();
  //   reader.onload = async (event: any) => {
  //     var base64 = event.target.result;
  //     if (type == 1) {
  //       // this.newAsset = file;

  //       let asset = new ModelAsset(
  //         file.name,
  //         `${new Date().getTime()}`,
  //         base64
  //       );

  //       this.assets.unshift(asset);

  //       this.cdr.detectChanges();

  //       let url = await this.loadService.saveImg(
  //         file,
  //         `users/${this.loadService.loadedUser!.value.id}/models/${
  //           asset.id
  //         }.glb`
  //       );

  //       asset.assetUrl = url;

  //       await this.save(asset);
  //     }
  //   };

  //   reader.readAsDataURL(blob);
  // }

  async save(modelAsset: Material) {
    await this.loadService.saveModels(modelAsset);
  }
}
