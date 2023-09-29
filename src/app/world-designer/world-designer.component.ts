import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { World } from '../models/workflow/world.model';
import * as BABYLON from 'babylonjs';
import * as MATERIALS from 'babylonjs-materials';
import { CharacterController } from 'babylonjs-charactercontroller';
import 'babylonjs-loaders';
import {
  GLTFFileLoader,
  GLTFLoaderAnimationStartMode,
} from 'babylonjs-loaders';
import { Scene } from '../models/workflow/scene.model';
import { DesignerService } from '../designer.service';
import { LiquidType } from '../models/workflow/liquid-type.enum';
import { Character } from '../models/workflow/character.model';
import { Executable } from '../models/workflow/executable.model';
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
  @Input() scene?: Scene;
  @Input() project?: Executable;

  constructor(
    private designerService: DesignerService,
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

    if (this.project && this.scene && this.world) {

      this.prototypeService.loaded.next(this.loaded)
      this.prototypeService.init(this.scene, this.project);

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
   this.prototypeService.deinit()
  }
}
