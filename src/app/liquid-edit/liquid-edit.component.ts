import { Component, OnInit } from '@angular/core';
import { World } from '../models/workflow/world.model';
import { ProjectService } from '../project.service';
import { DesignService } from '../design.service';

@Component({
  selector: 'app-liquid-edit',
  templateUrl: './liquid-edit.component.html',
  styleUrls: ['./liquid-edit.component.scss'],
})
export class LiquidEditComponent implements OnInit {
  constructor(
    private projectService: ProjectService,
    private designService: DesignService
  ) {}

  world?: World;

  ngOnInit(): void {
    this.projectService.workflow.subscribe((w) => {
      this.world = w;
    });
  }

  save() {
    this.designService.save(this.world);
  }
}
