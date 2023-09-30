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
import { Executable } from '../models/workflow/executable.model';
import { DesignerService } from '../designer.service';
import { Scene } from '../models/workflow/scene.model';
import { ModelAsset } from '../models/workflow/model-asset.model';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';

@AutoUnsubscribe
@Component({
  selector: 'app-asset-module',
  templateUrl: './asset-module.component.html',
  styleUrls: ['./asset-module.component.scss'],
})
export class AssetModuleComponent implements OnInit {
  workflow?: Executable;
  asset?: ModelAsset;
  assetDetails?: Dict<any>;
  scene?: Scene;

  fileDisplay?: string;

  @Input() data: any = {};

  @Output() changed = new EventEmitter<any>();

  constructor(
    private cdr: ChangeDetectorRef,
    private loadService: LoadService,
    private designerService: DesignerService
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

  updateCellAsset(
    id: string,
    assetId: string,
    value: any,
    field: string,
    subField?: string
  ) {
    let cell = this.designerService.graph?.getCellById(id);

    if (cell && this.scene) {
      var finalField = this.scene.assets.find((c) => c.id == assetId) as any;

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

  movementTypes = [
    {
      mountable: true,
      name: 'Movable',
    },
    {
      mountable: false,
      name: 'Stationary',
    },
  ];

  async save(action = 'save') {
    // let img = this.newImg as File;
    // let asset = this.newAsset as File;

    // this.loading = "Saving"

    // if (img && workflow && asset) {
    //   let url = await this.loadService.uploadAssetImg(
    //     img,
    //     workflow.id,
    //     asset.id
    //   );

    //   if (url) {
    //     asset.img = url;
    //   }
    // }

    // if (asset && workflow && asset) {
    //   this.loading = "Uploading Assets"
    //   let url = await this.loadService.uploadAssetAsset(
    //     asset,
    //     workflow.id,
    //     asset.id
    //   );

    //   if (url) {
    //     asset.assetUrl = url;
    //   }
    // }

    // this.dialogRef.close({
    //   workflow: this.workflow,
    //   action,
    //   asset: this.asset,
    //   assetDetails: this.assetDetails
    // });'

    this.changed.emit({
      workflow: this.workflow,
      action,
      asset: this.asset,
      assetDetails: this.assetDetails,
    });
  }

  ngOnInit(): void {
    this.workflow = this.data.workflow;
    this.asset = this.data.asset;
    this.assetDetails = this.data.assetDetails;
    this.fileDisplay = this.data.asset?.assetUrl;
  }
}
