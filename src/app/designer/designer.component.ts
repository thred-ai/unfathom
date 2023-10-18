import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { World } from '../models/workflow/world.model';
import { ProjectService } from '../project.service';
import { LoadService } from '../load.service';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-designer',
  templateUrl: './designer.component.html',
  styleUrls: ['./designer.component.scss'],
})
export class DesignerComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private loadService: LoadService,
    private themeService: ThemeService
  ) {}

  world?: World;

  ngOnInit(): void {
    this.themeService.activeTheme = 'light'
    this.route.params.subscribe(async (params) => {
      let proj = params['id'] as string;

      if (this.projectService.workflow.value?.id != proj) {
        this.projectService.workflow.subscribe(w => {
          this.world = w
        })
        this.loadService.getPrototype(proj, world => {
          this.projectService.workflow.next(world)
        })
      }
    });
  }
}
