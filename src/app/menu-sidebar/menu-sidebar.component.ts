import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppComponent } from '../app.component';
import { LoadService, Dict } from '../load.service';
import { Developer } from '../models/user/developer.model';
import { Ground } from '../models/workflow/ground.model';
import { Sky } from '../models/workflow/sky.model';
import { ProjectService } from '../project.service';
import { ThemeService } from '../theme.service';
import { Texture } from '../models/workflow/texture.model';

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

  @Input() mode?: string
  selected?: string

  @Output() modeChanged = new EventEmitter<string>();

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

    this.designerService.selected.subscribe(s => {
      this.selected = s
    })

  }


  

  changeMode(id: string){
    this.selectedData = undefined
    if (id == this.mode){
      return
    }
    
    this.mode = id
    this.modeChanged.emit(id)
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
