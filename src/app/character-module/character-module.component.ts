import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadService } from '../load.service';
import { Executable } from '../models/workflow/executable.model';
import { Character } from '../models/workflow/character.model';
import { Scene } from 'babylonjs';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';

@AutoUnsubscribe
@Component({
  selector: 'app-character-module',
  templateUrl: './character-module.component.html',
  styleUrls: ['./character-module.component.scss'],
})
export class CharacterModuleComponent implements OnInit, AfterViewInit {
  workflow?: Executable;
  character?: Character;
  newImg?: File;
  newAsset?: File;

  fileDisplay?: string;

  @Input() data: any = {};

  @Output() changed = new EventEmitter<any>();

  loading = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private loadService: LoadService
  ) {
    // setTimeout(() => {
    //   let i = document.getElementById("cont") as HTMLDivElement
    //   console.log(i)
    //   if (i){
    //     i.scroll(0,0);
    //   }
    // }, 1);
  }

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
        this.newImg = file;
      } else if (type == 2) {
        this.newAsset = file;
        this.fileDisplay = base64;
      }
    };

    reader.readAsDataURL(blob);
  }

  async save(action = 'save') {
    let img = this.newImg as File;
    let asset = this.newAsset as File;

    let workflow = this.workflow as Executable;
    let character = this.character as Character;

    if (img && workflow && character) {
      let url = await this.loadService.uploadCharacterImg(
        img,
        workflow.id,
        character.id
      );

      if (url) {
        character.img = url;
        this.newImg = undefined;
      }
    }

    if (asset && workflow && character) {
      let url = await this.loadService.uploadCharacterAsset(
        asset,
        workflow.id,
        character.id
      );

      if (url) {
        character.assetUrl = url;
        this.newAsset = undefined;
      }
    }

    // this.dialogRef.close({
    //   workflow: this.workflow,
    //   action,
    //   character: this.character,
    // });

    this.changed.emit({
      character: this.character,
    });
  }

  ngOnInit(): void {
    this.workflow = this.data.workflow;
    this.character = JSON.parse(JSON.stringify(this.data.character));
    this.fileDisplay = this.data.character?.assetUrl;
  }

  ngAfterViewInit(): void {}
}
