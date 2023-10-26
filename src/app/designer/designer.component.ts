import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { World } from '../models/workflow/world.model';
import { ProjectService } from '../project.service';
import { LoadService } from '../load.service';
import { ThemeService } from '../theme.service';
import { DesignService } from '../design.service';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';
import { FindStringPipe } from '../find-string.pipe';
import { Developer } from '../models/user/developer.model';

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
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
  ) {}

  world?: World;
  dev?: Developer;

  editableMeshes = ['world', 'sky', 'ground', 'lava', 'water'];

  tools = [
    {
      id: 'box',
      name: 'Bounding Box',
      icon: 'bootstrapBoundingBox',
    },
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

  selectedTool = 'box';

  selectTool(tool: string) {
    this.selectedTool = tool;

    this.designerService.selectTool(tool);
  }

  open = true;


  set openBar(value: boolean){
    this.open = value
    this.cdr.detectChanges()
    this.designerService.resize()
  }


  selected?: string;

  defaultMode = 'elements'; //'design'

  mode?: string = this.defaultMode;

  ngOnInit(): void {
    console.log('OIII');
    this.themeService.activeTheme = 'light';
    this.route.params.subscribe(async (params) => {
      let proj = params['id'] as string;

      if (this.projectService.workflow.value?.id != proj) {
        this.projectService.workflow.subscribe((w) => {
          this.world = w;
        });

        this.loadService.loadedUser.subscribe((l) => {
          this.dev = l;
        });
        this.loadService.getPrototype(proj, (world) => {
          console.log(world);
          this.projectService.workflow.next(world);
        });

        let user = await this.loadService.currentUser;
        if (user.uid) {
          this.loadService.getUserInfo(user.uid, false, false, (dev) => {});
        }
      }
    });

    this.designerService.selected.subscribe((s) => {
      let pipe = new FindStringPipe();
      if (this.mode == 'edit' && !pipe.transform(s, this.editableMeshes)) {
        this.mode = this.defaultMode;
        return;
      }
      this.selected = s;
      console.log(s)
      this.cdr.detectChanges()
    });
  }
}
