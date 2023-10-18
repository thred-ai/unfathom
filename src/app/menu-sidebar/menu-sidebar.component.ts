import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Cell, Graph } from '@antv/x6';
import { Dnd } from '@antv/x6-plugin-dnd';
import { AppComponent } from '../app.component';
import { LoadService, Dict } from '../load.service';
import { Developer } from '../models/user/developer.model';
import { Ground } from '../models/workflow/ground.model';
import { SceneDefinition } from '../models/workflow/scene-definition.model';
import { Sky } from '../models/workflow/sky.model';
import { ProjectService } from '../project.service';
import { ThemeService } from '../theme.service';
import { Texture } from '../models/workflow/texture.model';
import { Scene } from '../models/workflow/scene.model';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';
import { DesignService } from '../design.service';
import { World } from '../models/workflow/world.model';

@AutoUnsubscribe
@Component({
  selector: 'app-menu-sidebar',
  templateUrl: './menu-sidebar.component.html',
  styleUrls: ['./menu-sidebar.component.scss']
})
export class MenuSidebarComponent implements OnInit {
  constructor(
    private loadService: LoadService,
    private themeService: ThemeService,
    public root: AppComponent,
    private designerService: DesignService,
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef
  ) {}

  loading: Boolean = false;

  workflow?: World

  @Input() theme: 'light' | 'dark' = 'dark';

  mode: string = 'none'

  // @Output() publish = new EventEmitter<Executable>();

  selectedStep?: Cell.Properties;

  selectedData?: { data: any; callback: ((data: any) => any) | undefined };

  ngOnInit(): void {


    console.log(this.mode)

    // this.loadService.loadedUser.subscribe((l) => {
    //   if (l) {
    //     this.loadedUser = l;
    //   }
    // });

    this.projectService.loading.subscribe((l) => {
      this.loading = l;
    });

    this.projectService.workflow.subscribe((w) => {
      if (w) {
        this.workflow = w;
      }
    });

  }


  

  changeMode(id: string){
    this.selectedData = undefined
    if (id == this.mode){
      return
    }
    
    this.mode = id
  }

  openMenu(comp: string, data: any, callback?: (data: any) => any) {
    this.selectedData = undefined;
    this.cdr.detectChanges();

    console.log(comp)

    setTimeout(() => {
      this.selectedData = {
        data: {
          comp,
          ...data,
        },
        callback,
      };

      console.log(this.selectedData)
    }, 1);
  }
}
