import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ModelAsset } from '../models/workflow/model-asset.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadService } from '../load.service';
import { Executable } from '../models/workflow/executable.model';

@Component({
  selector: 'app-assets-module',
  templateUrl: './assets-module.component.html',
  styleUrls: ['./assets-module.component.scss']
})
export class AssetsModuleComponent implements OnInit {

  workflow?: Executable
  asset?: ModelAsset
  newAsset?: File

  fileDisplay?: string;

  loading = ''

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AssetsModuleComponent>,
    private loadService: LoadService
  ) {
    this.workflow = data.workflow
    this.asset = data.asset
    this.fileDisplay = data.asset.assetUrl
  }

  async fileChangeEvent(event: any, type = 1): Promise<void> {
    let file = event.target.files[0];

    let buffer = await file.arrayBuffer();

    var blob = new Blob([buffer]);

    var reader = new FileReader();
    reader.onload = (event: any) => {
      var base64 = event.target.result;

      if (type == 1){
        this.newAsset = file;
        this.fileDisplay = base64;
      }

    };

    reader.readAsDataURL(blob);
  }

  async save(action = 'save') {

    let asset = this.newAsset as File;

    let workflow = this.workflow as Executable;
    let assets = this.asset as ModelAsset;

    this.loading = "Saving Asset"


    if (asset && workflow && assets) {
      this.loading = "Uploading Assets"
      let url = await this.loadService.uploadCharacterAsset(
        asset,
        workflow.id,
        assets.id
      );

      if (url) {
        assets.assetUrl = url;
      }
    }

    this.loading = ""

    this.dialogRef.close({
      workflow: this.workflow,
      action,
      asset: assets,
    });
  }

  ngOnInit(): void {}

}
