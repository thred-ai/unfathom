import { Component, OnInit } from '@angular/core';
import { World } from '../models/workflow/world.model';
import { ProjectService } from '../project.service';

@Component({
  selector: 'app-liquid-edit',
  templateUrl: './liquid-edit.component.html',
  styleUrls: ['./liquid-edit.component.scss']
})
export class LiquidEditComponent implements OnInit {
  constructor(private projectService: ProjectService) {}

  world?: World;

  ngOnInit(): void {
    this.projectService.workflow.subscribe((w) => {
      this.world = w;
    });
  }

  save(){
    this.projectService.saveWorkflow.next(this.world)
  }
}
