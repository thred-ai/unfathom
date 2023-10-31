import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Character } from '../models/workflow/character.model';
import { LoadService } from '../load.service';
import { ProjectService } from '../project.service';

import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';
import { DesignService } from '../design.service';

@AutoUnsubscribe
@Component({
  selector: 'app-character-view-module',
  templateUrl: './character-view-module.component.html',
  styleUrls: ['./character-view-module.component.scss'],
})
export class CharacterViewModuleComponent implements OnInit {
  constructor(
    private loadService: LoadService,
    private projectService: ProjectService,
    private designService: DesignService
  ) {}

  workflow?: any;

  characters: Character[] = [];

  @Output() openMenu = new EventEmitter<{
    comp: string;
    data: any;
    callback: ((data: any) => any) | undefined;
  }>();

  @Output() close = new EventEmitter<any>();

  ngOnInit(): void {
    this.projectService.workflow.subscribe((w) => {
      if (w) {
        this.workflow = w;

        // this.characters = Object.values(w.characters) ?? [];
      }
    });

    // this.designerService.openStep.subscribe(async (step) => {
    //   if (step?.id != this.selectedFile?.id && this.selectedData) {
    //     this.selectedData = undefined;
    //   }
    // });
  }

  editCharacter(
    character: Character = new Character(
      this.loadService.newUtilID,
      'New NPC',
      undefined,
      '',
      'https://storage.googleapis.com/verticalai.appspot.com/default/avatars/default_head.png',
      '',
      'hero'
    )
  ) {
    this.openMenu.emit({
      comp: 'character-module',
      data: { character, workflow: this.workflow },
      callback: (data) => {
        if (data && data != '' && data != '0') {
          let character = data.character as Character;

          this.workflow!.characters[character.id] = character;

          this.designService.save(this.workflow);

          setTimeout(() => {
            this.close.emit();
          }, 100);
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
    // this.workflow?.sceneLayout?.cells.forEach((c) => {
    //   let scene = c.data?.ngArguments?.scene as Scene;
    //   if (scene) {
    //     scene.characters = scene.characters.filter((x) => x.id != id);
    //   }
    // });
    // delete this.workflow?.characters[id];
    // this.projectService.workflow.next(this.workflow);
    // this.close.emit()
    // this.workflowChanged.emit(this.workflow);
  }
}
