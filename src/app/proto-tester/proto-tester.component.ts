import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadService } from '../load.service';
import { ProjectService } from '../project.service';
import { Executable } from '../models/workflow/executable.model';
import { Scene } from '../models/workflow/scene.model';
import { World } from '../models/workflow/world.model';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';
import { DesignerService } from '../designer.service';
import { ThemeService } from '../theme.service';
import * as interact from 'interactjs';
import { PrototypeService } from '../prototype.service';

@AutoUnsubscribe
@Component({
  selector: 'app-proto-tester',
  templateUrl: './proto-tester.component.html',
  styleUrls: ['./proto-tester.component.scss'],
})
export class ProtoTesterComponent implements OnInit {
  world?: World;
  scene?: Scene;
  project?: Executable;
  theme?: 'light' | 'dark' = 'light';

  mountableAssets: string[] = [];

  mountedAsset?: string;
  selectedCharacter?: string;

  worldDescription?: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private loadService: LoadService,
    public dialogRef: MatDialogRef<ProtoTesterComponent>,
    private cdr: ChangeDetectorRef,
    private projectService: ProjectService,
    private designService: DesignerService,
    private themeService: ThemeService,
    private prototypeService: PrototypeService
  ) {}

  visible = true;

  restart() {
    this.visible = false;
    setTimeout(() => {
      this.visible = true;
      this.cdr.detectChanges();
    }, 5);
  }

  openPrototypeFull(
    id: string | undefined = this.scene?.id,
    workflowId: string | undefined = this.project?.id
  ) {
    if (id && workflowId) {
      window.open(
        `https://app.unfathom.co/share/${workflowId}/scene/${id}`,
        '_blank'
      );
    }
  }

  ngOnInit(): void {
    this.projectService.workflow.subscribe((w) => {
      this.project = w;
      this.restart();
      this.cdr.detectChanges();
    });

    this.designService.openStep.subscribe((s) => {
      this.scene = s?.data?.ngArguments?.scene as Scene;
      this.world = this.scene?.world;
      console.log(this.world);
      this.mountableAssets = this.scene?.assets
        .filter((a) => a.movement.canMount)
        .map((x) => x.id);
      this.restart();
      this.cdr.detectChanges();
    });

    this.prototypeService.mountedAsset.subscribe((asset) => {
      this.mountedAsset = asset;
    });

    this.prototypeService.selectedCharacter.subscribe((character) => {
      this.selectedCharacter = character;
    });

    this.themeService.theme.subscribe((theme) => {
      this.theme = theme ?? 'light';
      this.cdr.detectChanges();
    });

    interact.default('.prototype-dialog').resizable({
      edges: { top: false, left: true, bottom: true, right: true },
      listeners: {
        move: function (event) {
          let { x, y } = event.target.dataset;

          // var bounds = verticalTextarea.getBoundingClientRect();

          x = (parseFloat(x) || 0) + event.deltaRect.left;
          y = (parseFloat(y) || 0) + event.deltaRect.top;

          Object.assign(event.target.style, {
            width: `${event.rect.width}px`,
            height: `${event.rect.height}px`,
          });

          Object.assign(event.target.dataset, { x, y });

          window.dispatchEvent(new Event('resize'));
        },
      },
    });
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
