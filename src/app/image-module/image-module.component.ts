import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DesignerService } from '../designer.service';
import { LoadService } from '../load.service';
import { Character } from '../models/workflow/character.model';
import { Executable } from '../models/workflow/executable.model';
import { ProjectService } from '../project.service';
import { Scene } from '../models/workflow/scene.model';
import { Texture } from '../models/workflow/texture.model';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';

@AutoUnsubscribe
@Component({
  selector: 'app-image-module',
  templateUrl: './image-module.component.html',
  styleUrls: ['./image-module.component.scss']
})
export class ImageModuleComponent implements OnInit {
  constructor(
    private loadService: LoadService,
    private projectService: ProjectService,
    private designerService: DesignerService
  ) {}

  workflow?: Executable;

  textures: Texture[] = []

  @Output() openMenu = new EventEmitter<{
    comp: string,
    data: any;
    callback: ((data: any) => any) | undefined;
  }>();

  ngOnInit(): void {


    this.projectService.workflow.subscribe((w) => {
      if (w) {
        this.workflow = w;

        this.textures = Object.values(w.textures) ?? [];
      }
    });

    // this.designerService.openStep.subscribe(async (step) => {
    //   if (step?.id != this.selectedFile?.id && this.selectedData) {
    //     this.selectedData = undefined;
    //   }
    // });
  }

  editCharacter(
    texture: Texture = new Texture(this.loadService.newUtilID)
  ) {
    this.openMenu.emit({
      comp: 'texture-module',
      data: { texture, workflow: this.workflow },
      callback: (data) => {
        if (data && data != '' && data != '0' && data.workflow) {
          let texture = data.texture as Texture;

          if (data.action == 'delete') {
            // character.status = 1;
            return;
          }

          this.workflow!.textures[texture.id] = texture;

          this.projectService.workflow.next(this.workflow);

          this.projectService.save(this.workflow)

      
          // this.workflowChanged.emit(this.workflow);
        }
      },
    });

    // let ref = this.dialog.open(CharacterModuleComponent, {
    //   width: 'calc(var(--vh, 1vh) * 70)',
    //   maxWidth: '650px',
    //   maxHeight: 'calc(var(--vh, 1vh) * 100)',
    //   panelClass: 'app-full-bleed-dialog',

    //   data: {
    //     character,
    //     workflow: this.workflow,
    //   },
    // });

    // ref.afterClosed().subscribe(async (val) => {
    //   if (val && val != '' && val != '0' && val.workflow) {
    //     let character = val.character as Character;

    //     if (val.action == 'delete') {
    //       // character.status = 1;
    //       return;
    //     }

    //     this.workflow!.characters[character.id] = character;

    //     this.projectService.workflow.next(this.workflow);

    //     this.workflowChanged.emit(this.workflow);
    //   }
    // });
  }


  removeCharacterWorkflow(id: string) {
    this.workflow?.sceneLayout?.cells.forEach((c) => {
      let scene = c.data?.ngArguments?.scene as Scene;

      if (scene) {
        scene.characters = scene.characters.filter((x) => x.id != id);
      }
    });

    delete this.workflow?.characters[id];

    this.projectService.workflow.next(this.workflow);

    // this.workflowChanged.emit(this.workflow);
  }
}
