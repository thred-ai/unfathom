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
    if (this.world && this.world.ground) {
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
    }
  }

  ngOnInit(): void {
    this.designService.openStep.subscribe((s) => {
      this.world = (s?.data.ngArguments?.scene as Scene)?.world as World;
      this.worldLiquids = Object.keys(this.world?.ground?.liquid ?? {}) ?? [];
    });
  }

  save() {}
}
