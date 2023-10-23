import { Component, OnInit } from '@angular/core';
import { World } from '../models/workflow/world.model';
import { ProjectService } from '../project.service';
import { PrototypeService } from '../prototype.service';
import { LiquidType } from '../models/workflow/liquid-type.enum';
import { Liquid } from '../models/workflow/liquid.model';
import { LoadService } from '../load.service';

@Component({
  selector: 'app-ground-edit',
  templateUrl: './ground-edit.component.html',
  styleUrls: ['./ground-edit.component.scss'],
})
export class GroundEditComponent implements OnInit {
  constructor(
    private projectService: ProjectService,
    private prototypeService: PrototypeService,
    private loadService: LoadService
  ) {}

  world?: World;

  save(){
    this.world.ground.texture.id = this.loadService.newUtilID
    this.projectService.saveWorkflow.next(this.world)
  }

  ngOnInit(): void {
    this.projectService.workflow.subscribe((w) => {
      this.world = w;
    });
  }
}
