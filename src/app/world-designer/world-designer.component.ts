import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { World } from '../models/workflow/world.model';
import * as BABYLON from 'babylonjs';

import 'babylonjs-loaders';


import { ProjectService } from '../project.service';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';
import { PrototypeService } from '../prototype.service';

@AutoUnsubscribe
@Component({
  selector: 'app-world-designer',
  templateUrl: './world-designer.component.html',
  styleUrls: ['./world-designer.component.scss'],
})
export class WorldDesignerComponent implements OnInit, OnDestroy {
  
  @Input() world?: World;

  totalLength = 0
  totalLoaded = 0


  constructor(
    private projectService: ProjectService,
    private prototypeService: PrototypeService
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

    if (this.world) {
      this.prototypeService.loaded.next(this.loaded);
      setTimeout(() => {
        this.prototypeService.init(this.world);
      }, 100);

      this.prototypeService?.loaded.subscribe((loaded) => {
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
    this.prototypeService.deinit();
  }
}
