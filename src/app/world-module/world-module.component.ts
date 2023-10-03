import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { World } from '../models/workflow/world.model';
import { DesignerService } from '../designer.service';
import { Scene } from '../models/workflow/scene.model';
import { Liquid } from '../models/workflow/liquid.model';
import { Texture } from '../models/workflow/texture.model';
import { LiquidType } from '../models/workflow/liquid-type.enum';
import { PrototypeService } from '../prototype.service';

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

  constructor(
    private designService: DesignerService,
    private prototypeService: PrototypeService
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

  worldLiquids: string[] = [];

  selectLiquids(liquids: string[]) {
    if (this.world && this.scene && this.world.ground) {
      console.log(liquids);
      Object.keys(this.world.ground.liquid).forEach(liquid => {
        if (!liquids.includes(liquid)){
          delete this.world?.ground?.liquid[liquid]
        }
      })
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
      this.designService.setScene(this.scene, this.scene.id)
    }
  }

  ngOnInit(): void {
    this.designService.openStep.subscribe((s) => {
      this.scene = (s?.data.ngArguments?.scene as Scene);

      this.world = this.scene?.world as World;
      this.worldLiquids = Object.keys(this.world?.ground?.liquid ?? {}) ?? [];
    });
  }

  save() {

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
