import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Material } from '../models/workflow/material.model';
import { DesignService } from '../design.service';
import { LoadService } from '../load.service';
import { ProjectService } from '../project.service';

@Component({
  selector: 'app-sky-view',
  templateUrl: './sky-view.component.html',
  styleUrls: ['./sky-view.component.scss'],
})
export class SkyViewComponent implements OnInit {
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
        this.loadService.getSkies((models) => {
          this.assets = models.reverse();
        });
        
      }
    });

    this.loadService.loadingSearchSky.subscribe(s => {
      this.loadingSearch = s
    })
  }

  addMeshToScene(asset: Material) {

    this.designService.changeSkyScene(asset)
    // let scene = this.designService.engine?.scenes[0];
    // let cam = scene?.activeCamera as ArcRotateCamera;
    // console.log('joi');
    // if (scene && cam) {
    //   let newAsset = JSON.parse(JSON.stringify(asset)) as ModelAsset;
    //   let loc = cam.getFrontPosition(1);
    //   newAsset.id = this.loadService.newUtilID;
    //   let sceneAsset = new SceneAsset(newAsset, {
    //     x: loc.x,
    //     y: loc.y,
    //     z: loc.z,
    //   });
    //   sceneAsset.scale.x = NaN;
    //   sceneAsset.scale.y = NaN;
    //   sceneAsset.scale.z = NaN;
    //   // sceneAsset.scale = {
    //   //   x: 2,
    //   //   y: 2,
    //   //   z: 2
    //   // }
    //   this.designService.addMeshToScene(sceneAsset);
    // }
  }


  async runAI(prompt: string){
    let result = await this.loadService.generateSky(prompt)
    // if (result){
    //   this.assets.unshift(result);
    // }
  }


}
