import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../project.service';
import { World } from '../models/workflow/world.model';
import { PrototypeService } from '../prototype.service';
import { LiquidType } from '../models/workflow/liquid-type.enum';
import { Liquid } from '../models/workflow/liquid.model';
import { DesignService } from '../design.service';

@Component({
  selector: 'app-sky-edit',
  templateUrl: './sky-edit.component.html',
  styleUrls: ['./sky-edit.component.scss'],
})
export class SkyEditComponent implements OnInit {
  constructor(
    private projectService: ProjectService,
    private prototypeService: PrototypeService,
    private designService: DesignService
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
    {
      id: 'none',
      name: 'No Liquid',
    },
  ];

  save() {
    this.designService.save(this.world);
  }
}
