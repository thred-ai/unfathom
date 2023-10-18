import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { World } from '../models/workflow/world.model';
import { Scene } from '../models/workflow/scene.model';
import { Liquid } from '../models/workflow/liquid.model';
import { Texture } from '../models/workflow/texture.model';
import { LiquidType } from '../models/workflow/liquid-type.enum';
import { PrototypeService } from '../prototype.service';
import { Dict, LoadService } from '../load.service';
import { ProjectService } from '../project.service';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';

@AutoUnsubscribe
@Component({
  selector: 'app-world-module',
  templateUrl: './world-module.component.html',
  styleUrls: ['./world-module.component.scss'],
})
export class WorldModuleComponent implements OnInit {
  @Input() data: any;
  @Output() changed = new EventEmitter<any>();

  world?: World;
  scene?: Scene;
  project?: any;

  constructor(
    private prototypeService: PrototypeService,
    private projectService: ProjectService,
    private loadService: LoadService
  ) {}

  liquids = [
    {
      id: 'lava',
      name: 'Lava',
    },
    {
      id: 'water',
      name: 'Water',
    },
  ];

  newImages: Dict<File> = {};

  worldLiquids: string[] = [];

  loading = ""

  selectLiquids(liquids: string[]) {
    if (this.world && this.scene && this.world.ground) {
      console.log(liquids);
      Object.keys(this.world.ground.liquid).forEach((liquid) => {
        if (!liquids.includes(liquid)) {
          delete this.world?.ground?.liquid[liquid];
        }
      });
      liquids.forEach((liquid) => {
        if (!this.world!.ground!.liquid[liquid]) {
          let liquidType = LiquidType[`${liquid as 'lava' | 'water'}`];
          this.world!.ground!.liquid[liquid] = new Liquid(
            this.prototypeService.generateLiquidTexture(liquidType),
            liquidType,
            1
          );
        }
      });
    }
  }

  ngOnInit(): void {
    // this.designService.openStep.subscribe((s) => {
    //   this.scene = s?.data.ngArguments?.scene as Scene;

    //   this.world = this.scene?.world as World;
    // });

    this.worldLiquids = Object.keys(this.world?.ground?.liquid ?? {}) ?? [];


    this.projectService.workflow.subscribe((w) => {
      this.project = w;
    });
  }

  async save() {
    this.loading = "Saving"
    if (this.world && this.scene && this.world.ground && this.world.sky && this.project) {

      this.loading = "Uploading Textures"
      if (this.newImages['ground']) {
        let url = await this.loadService.saveImg(
          this.newImages['ground'],
          `worlds/${this.project?.id}/scenes/${this.scene.id}/ground/ground_diffuse.png`
        );
        if (url){
          this.world.ground.texture.diffuse = url
        }
      }

      if (this.newImages['map']) {
        let url = await this.loadService.saveImg(
          this.newImages['map'],
          `worlds/${this.project?.id}/scenes/${this.scene.id}/heightMap.png`
        );
        if (url){
          this.world.ground.heightMap = url
        }
      }

      if (this.newImages['sky']) {
        let url = await this.loadService.saveImg(
          this.newImages['sky'],
          `worlds/${this.project?.id}/scenes/${this.scene.id}/skybox.png`
        );
        if (url){
          this.world.sky.texture.emissive = url
        }
      }

      this.scene.world = this.world;

      this.loading = ""
      this.changed.emit();
    }
  }

  async fileChangeEvent(
    event: any,
    type: 'ground' | 'map' | 'sky'
  ): Promise<void> {
    let file = event.target.files[0];

    let buffer = await file.arrayBuffer();

    var blob = new Blob([buffer]);

    var reader = new FileReader();
    reader.onload = (event: any) => {
      var base64 = event.target.result;

      if (type == 'ground') {
        let imgIcon = document.getElementById('ground') as HTMLImageElement;
        imgIcon!.src = base64;
        this.newImages['ground'] = file;
      } else if (type == 'sky') {
        let imgIcon = document.getElementById('sky') as HTMLImageElement;
        imgIcon!.src = base64;
        this.newImages['sky'] = file;
      } else {
        //map
        let imgIcon = document.getElementById('map') as HTMLImageElement;
        imgIcon!.src = base64;
        this.newImages['map'] = file;
      }
    };

    reader.readAsDataURL(blob);
  }

  // async fileChangeEvent(event: any, type = "none"): Promise<void> {
  //   let file = event.target.files[0];

  //   let buffer = await file.arrayBuffer();

  //   var blob = new Blob([buffer]);

  //   var reader = new FileReader();
  //   reader.onload = (event: any) => {
  //     var base64 = event.target.result;

  //     if (type == 1) {
  //       let imgIcon = document.getElementById('imgIcon') as HTMLImageElement;
  //       imgIcon!.src = base64;
  //       this.newImg = file;
  //     } else if (type == 2) {
  //       this.newAsset = file;
  //       this.fileDisplay = base64;
  //     }

  //     this.save();
  //   };

  //   reader.readAsDataURL(blob);
  // }
}
