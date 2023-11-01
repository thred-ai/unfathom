import { ChangeDetectorRef, Component } from '@angular/core';
import { Material } from '../models/workflow/material.model';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';
import { DesignService } from '../design.service';
import { LoadService } from '../load.service';
import { ProjectService } from '../project.service';

@AutoUnsubscribe
@Component({
  selector: 'app-materials-view-module',
  templateUrl: './materials-view-module.component.html',
  styleUrls: ['./materials-view-module.component.scss'],
})
export class MaterialsViewModuleComponent {
  assets: Material[] = [];

  loadingSearch?: string

  constructor(
    private loadService: LoadService,
    private projectService: ProjectService,
    private designService: DesignService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadService.loadedUser.subscribe((l) => {
      if (l) {
        this.loadService.getMaterials((models) => {
          this.assets = models.reverse();
        });
      }
    });
    this.loadService.loadingSearchMaterial.subscribe(s => {
      this.loadingSearch = s
    })
  }

  addMeshToScene(asset: Material) {
    
    this.designService.updateGroundScene(asset.texture)
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

  async runAI(prompt: string) {
    let result = await this.loadService.generateMaterial(prompt);
    // if (result){
    //   this.assets.unshift(result);
    // }
  }
}
