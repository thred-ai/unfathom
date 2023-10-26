import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { World } from '../models/workflow/world.model';
import { Scene } from '../models/workflow/scene.model';
import { ProjectService } from '../project.service';
import { PrototypeService } from '../prototype.service';
import { ThemeService } from '../theme.service';
import { ActivatedRoute } from '@angular/router';
import { Cell } from '@antv/x6';
import { LoadService } from '../load.service';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-prototype-module',
  templateUrl: './prototype-module.component.html',
  styleUrls: ['./prototype-module.component.scss'],
})
export class PrototypeModuleComponent implements OnInit {
  world?: World;

  theme?: 'light' | 'dark' = 'light';

  mountableAssets: string[] = [];

  mountedAsset?: string;
  selectedCharacter?: string;

  constructor(
    private cdr: ChangeDetectorRef,
    private prototypeService: PrototypeService,
    private loadService: LoadService,
    private route: ActivatedRoute,
    private metaService: Meta
  ) {}

  visible = true;

  restart() {
    this.visible = false;
    setTimeout(() => {
      this.visible = true;
      this.cdr.detectChanges();
    }, 5);
  }

  ngOnInit(): void {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      /* your code here */
      if (screen.orientation) { // Property doesn't exist on screen in IE11   
        screen.orientation.addEventListener("change", (event) => {
          console.log(event)
        });
    }
    }

    this.route.params.subscribe(async (params) => {
      let proj = params['id'] as string;

      // if (!this.scene || (this.scene && this.scene.id != file)) {
      this.loadService.getPrototype(proj, (exec) => {
        if (exec) {
          this.world = exec;
          this.mountableAssets = this.world?.assets
            .filter((a) => a.movement.canMount)
            .map((x) => x.asset.id);
          this.restart();
        }
      });
      // }
    });

    // this.loadService.workflow.subscribe((w) => {

    //   this.project = w;
    //   this.cdr.detectChanges();
    // });

    // this.designService.openStep.subscribe((s) => {
    //   this.scene = s?.data?.ngArguments?.scene as Scene;
    //   this.world = this.scene?.world;
    //   console.log(this.world);

    //   this.cdr.detectChanges();
    // });

    this.prototypeService.mountedAsset.subscribe((asset) => {
      this.mountedAsset = asset;
    });

    this.prototypeService.selectedCharacter.subscribe((character) => {
      if (character)
      this.selectedCharacter = character.character.id;
    });

    // this.themeService.theme.subscribe((theme) => {
    //   this.theme = theme ?? 'light';
    //   this.cdr.detectChanges();
    // });
  }

  mountAsset(id: string) {
    this.prototypeService.mountAsset(id, 0);
  }

  dismountAsset(id: string) {
    this.prototypeService.dismountAsset(id);
  }

  selectCharacter(id: string) {
    this.prototypeService.selectCharacter(id);
  }
}
