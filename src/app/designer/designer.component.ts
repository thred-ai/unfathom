import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { World } from '../models/workflow/world.model';
import { ProjectService } from '../project.service';
import { LoadService } from '../load.service';
import { ThemeService } from '../theme.service';
import { DesignService } from '../design.service';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';
import { FindStringPipe } from '../find-string.pipe';

@AutoUnsubscribe
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
    private designerService: DesignService,
    private themeService: ThemeService
  ) {}

  world?: World;

  editableMeshes = ['world', 'sky', 'ground', 'lava', 'water'];

  tools = [
    {
      id: 'move',
      name: 'Move',
      icon: 'bootstrapArrowsMove',
    },
    {
      id: 'scale',
      name: 'Scale',
      icon: 'bootstrapArrowsFullscreen',
    },
    {
      id: 'rotate',
      name: 'Rotate',
      icon: 'bootstrapArrowRepeat',
    },
  ];

  selectedTool = 'move';

  selectTool(tool: string) {
    this.selectedTool = tool;

    this.designerService.selectTool(tool);
  }

  openBar = true;
  selected?: string;

  mode?: string = 'design';

  ngOnInit(): void {
    console.log('OIII');
    this.themeService.activeTheme = 'light';
    this.route.params.subscribe(async (params) => {
      let proj = params['id'] as string;

      if (this.projectService.workflow.value?.id != proj) {
        this.projectService.workflow.subscribe((w) => {
          this.world = w;
        });
        this.loadService.getPrototype(proj, (world) => {
          console.log(world);
          this.projectService.workflow.next(world);
        });
      }
    });

    this.designerService.selected.subscribe((s) => {
      let pipe = new FindStringPipe();
      if (this.mode == 'edit' && !pipe.transform(s, this.editableMeshes)) {
        this.mode = 'design';
        return;
      }
      this.selected = s;
    
    });
  }
}
