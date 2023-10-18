import { Component, Input, OnInit } from '@angular/core';
import { World } from '../models/workflow/world.model';
import { ProjectService } from '../project.service';
import { PrototypeService } from '../prototype.service';
import { DesignService } from '../design.service';

@Component({
  selector: 'app-world-viewer',
  templateUrl: './world-viewer.component.html',
  styleUrls: ['./world-viewer.component.scss']
})
export class WorldViewerComponent implements OnInit {

  @Input() project?: World;

  totalLength = 0
  totalLoaded = 0


  constructor(
    private projectService: ProjectService,
    private designService: DesignService
  ) {}

  ngOnInit(): void {
    // this.designerService?.openWorld.subscribe((world) => {
    //   this.world = world;
    //   console.log(world)
    // });

    // this.projectService?.workflow.subscribe((project) => {
    //   this.project = project;
    // });

    // this.projectService.workflow.subscribe((w) => {
    //   this.project = w;
    // });

    // this.designerService.openStep.subscribe((s) => {
    //   this.scene = s?.data?.ngArguments?.scene as Scene;
    //   this.world = this.scene?.world;

    // });

    if (this.project) {
      this.designService.loaded.next(this.loaded);
      setTimeout(() => {
        this.designService.init(this.project!);
      }, 100);

      this.designService?.loaded.subscribe((loaded) => {
        this.loaded = loaded;
      });
    }

    // this.designerService?.openStep.subscribe((scene) => {
    //   this.scene = scene?.data?.ngArguments?.scene as Scene;

    // });
  }

  engine?: BABYLON.Engine;

  loaded = 'Initializing Scene';

  @Input() theme!: 'light' | 'dark';

  ngOnDestroy(): void {
    this.designService.deinit();
  }

}
