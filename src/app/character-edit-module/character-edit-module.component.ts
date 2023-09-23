import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DesignerService } from '../designer.service';
import { Dict, LoadService } from '../load.service';
import { Character } from '../models/workflow/character.model';
import { Executable } from '../models/workflow/executable.model';
import { Scene } from '../models/workflow/scene.model';

@Component({
  selector: 'app-character-edit-module',
  templateUrl: './character-edit-module.component.html',
  styleUrls: ['./character-edit-module.component.scss']
})
export class CharacterEditModuleComponent implements OnInit {
  workflow?: Executable
  character?: Character
  characterDetails?: Dict<any>
  scene?: Scene

  fileDisplay?: string;

  loading = ''

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CharacterEditModuleComponent>,
    private loadService: LoadService,
    private designerService: DesignerService
  ) {
    this.workflow = data.workflow
    this.character = data.character
    this.characterDetails = data.characterDetails
    this.fileDisplay = data.character.assetUrl
  }

  async fileChangeEvent(event: any, type = 1): Promise<void> {
    let file = event.target.files[0];

    let buffer = await file.arrayBuffer();

    var blob = new Blob([buffer]);

    var reader = new FileReader();
    reader.onload = (event: any) => {
      var base64 = event.target.result;

      if (type == 1){
        let imgIcon = document.getElementById('imgIcon') as HTMLImageElement;
        imgIcon!.src = base64;
        // this.newImg = file;
      }
      else if (type == 2){
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
    let cell = this.designerService.graph?.getCellById(id);


    if (cell && this.scene) {
      var finalField = this.scene.characters.find((c) => c.id == characterId) as any;

      if (subField) {
        finalField[field][subField] = value;
      } else {
        finalField[field] = value;
      }

      cell.setData({
        ngArguments: {
          scene: this.scene,
        },
      });
    }
  }


  async save(action = 'save') {

    // let img = this.newImg as File;
    // let asset = this.newAsset as File;

    this.loading = "Saving"

    // if (img && workflow && character) {
    //   let url = await this.loadService.uploadCharacterImg(
    //     img,
    //     workflow.id,
    //     character.id
    //   );

    //   if (url) {
    //     character.img = url;
    //   }
    // }

    // if (asset && workflow && character) {
    //   this.loading = "Uploading Assets"
    //   let url = await this.loadService.uploadCharacterAsset(
    //     asset,
    //     workflow.id,
    //     character.id
    //   );

    //   if (url) {
    //     character.assetUrl = url;
    //   }
    // }

    this.loading = ""

    this.dialogRef.close({
      workflow: this.workflow,
      action,
      character: this.character,
      characterDetails: this.characterDetails
    });
  }

  ngOnInit(): void {}
}
