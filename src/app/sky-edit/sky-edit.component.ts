import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../project.service';
import { World } from '../models/workflow/world.model';
import { PrototypeService } from '../prototype.service';
import { LiquidType } from '../models/workflow/liquid-type.enum';
import { Liquid } from '../models/workflow/liquid.model';

@Component({
  selector: 'app-sky-edit',
  templateUrl: './sky-edit.component.html',
  styleUrls: ['./sky-edit.component.scss'],
})
export class SkyEditComponent implements OnInit {
  constructor(
    private projectService: ProjectService,
    private prototypeService: PrototypeService
  ) {}

  world?: World;

  ngOnInit(): void {
    this.projectService.workflow.subscribe((w) => {
      this.world = w;
    });
  }

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

  selectLiquids(liquid: string) {
    if (this.world && this.world.ground) {
      if (liquid == 'none') {
        delete this.world?.ground?.liquid;
      }
      let liquidType = LiquidType[`${liquid as 'lava' | 'water'}`];
      if (this.world!.ground!.liquid?.liquid != liquidType) {
        this.world!.ground!.liquid = new Liquid(
          this.prototypeService.generateLiquidTexture(liquidType),
          liquidType,
          1
        );
      }
    }
  }

  save() {
    this.projectService.saveWorkflow.next(this.world);
  }
}
