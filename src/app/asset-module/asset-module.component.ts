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
import { ModelAsset } from '../models/workflow/model-asset.model';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';
import { World } from '../models/workflow/world.model';
import { ProjectService } from '../project.service';
import { DesignService } from '../design.service';

@AutoUnsubscribe
@Component({
  selector: 'app-asset-module',
  templateUrl: './asset-module.component.html',
  styleUrls: ['./asset-module.component.scss'],
})
export class AssetModuleComponent implements OnInit {

  // asset?: ModelAsset;
  assetDetails?: Dict<any>;
  world?: World;

  @Output() changed = new EventEmitter<any>();

  constructor(
    private cdr: ChangeDetectorRef,
    private loadService: LoadService,
    private projectService: ProjectService,
    private designService: DesignService
  ) {}

  updateCellAsset(
    id: string,
    assetId: string,
    value: any,
    field: string,
    subField?: string
  ) {
    // let cell = this.designerService.graph?.getCellById(id);

    // if (cell && this.scene) {
    //   var finalField = this.scene.assets.find((c) => c.id == assetId) as any;

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
    // }
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

  save(){
    this.projectService.saveWorkflow.next(this.world)
  }

  // async save(action = 'save') {
  //   // let img = this.newImg as File;
  //   // let asset = this.newAsset as File;

  //   // this.loading = "Saving"

  //   // if (img && workflow && asset) {
  //   //   let url = await this.loadService.uploadAssetImg(
  //   //     img,
  //   //     workflow.id,
  //   //     asset.id
  //   //   );

  //   //   if (url) {
  //   //     asset.img = url;
  //   //   }
  //   // }

  //   // if (asset && workflow && asset) {
  //   //   this.loading = "Uploading Assets"
  //   //   let url = await this.loadService.uploadAssetAsset(
  //   //     asset,
  //   //     workflow.id,
  //   //     asset.id
  //   //   );

  //   //   if (url) {
  //   //     asset.assetUrl = url;
  //   //   }
  //   // }

  //   // this.dialogRef.close({
  //   //   workflow: this.workflow,
  //   //   action,
  //   //   asset: this.asset,
  //   //   assetDetails: this.assetDetails
  //   // });'

  //   this.changed.emit({
  //     action,
  //     assetDetails: this.assetDetails,
  //   });
  // }

  ngOnInit(): void {
    this.projectService.workflow.subscribe((w) => {
      console.log(w)
      this.world = w;
      this.designService.selected.subscribe((s) => {
        if (s){
          this.assetDetails = this.world.assets?.find(a => a.asset.id == s);
        }
      })
      this.cdr.detectChanges()
    });
  }
}
