import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Dict, LoadService } from '../load.service';
import { Character } from '../models/workflow/character.model';

import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';

@AutoUnsubscribe
@Component({
  selector: 'app-character-edit-module',
  templateUrl: './character-edit-module.component.html',
  styleUrls: ['./character-edit-module.component.scss'],
})
export class CharacterEditModuleComponent implements OnInit {
  workflow?: any;
  character?: Character;
  characterDetails?: Dict<any>;

  fileDisplay?: string;

  @Input() data: any = {};

  @Output() changed = new EventEmitter<any>();

  constructor(
    private cdr: ChangeDetectorRef,
    private loadService: LoadService,
  ) {}

  async fileChangeEvent(event: any, type = 1): Promise<void> {
    let file = event.target.files[0];

    let buffer = await file.arrayBuffer();

    var blob = new Blob([buffer]);

    var reader = new FileReader();
    reader.onload = (event: any) => {
      var base64 = event.target.result;

      if (type == 1) {
        let imgIcon = document.getElementById('imgIcon') as HTMLImageElement;
        imgIcon!.src = base64;
        // this.newImg = file;
      } else if (type == 2) {
        // this.newAsset = file;
        this.fileDisplay = base64;
      }
    };

    reader.readAsDataURL(blob);
  }

  updateCellCharacter(
    id: string,
    characterId: string,
    value: any,
    field: string,
    subField?: string
  ) {
    // let cell = this.designerService.graph?.getCellById(id);

    // if (cell && this.scene) {
    //   var finalField = this.scene.characters.find(
    //     (c) => c.id == characterId
    //   ) as any;

    //   if (subField) {
    //     finalField[field][subField] = value;
    //   } else {
    //     finalField[field] = value;
    //   }

    //   cell.setData({
    //     ngArguments: {
    //       scene: this.scene,
    //     },
    //   });

    //   // setTimeout(() => {
        
    //   // }, 1);
    // }
  }

  save(){
    this.changed.emit({
      workflow: this.workflow,
      action: 'save',
      character: this.character,
      characterDetails: this.characterDetails,
    });
  }

  ngOnInit(): void {
    this.workflow = this.data.workflow;
    this.character = this.data.character;
    this.characterDetails = this.data.characterDetails;
    this.fileDisplay = this.data.character?.assetUrl;
  }
}
