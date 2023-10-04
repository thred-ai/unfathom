import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ModelAsset } from '../models/workflow/model-asset.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadService } from '../load.service';
import { Executable } from '../models/workflow/executable.model';
import { ModelViewerComponent } from '../model-viewer/model-viewer.component';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';

@AutoUnsubscribe
@Component({
  selector: 'app-assets-module',
  templateUrl: './assets-module.component.html',
  styleUrls: ['./assets-module.component.scss'],
})
export class AssetsModuleComponent implements OnInit {
  workflow?: Executable;
  asset?: ModelAsset;
  newAsset?: File;

  fileDisplay?: string;

  loading = '';

  @Input() data: any = {};

  @Output() changed = new EventEmitter<any>();

  constructor(
    private cdr: ChangeDetectorRef,
    private loadService: LoadService
  ) {}

  async fileChangeEvent(event: any, type = 1): Promise<void> {
    let file = event.target.files[0];

    let buffer = await file.arrayBuffer();

    var blob = new Blob([buffer]);

    var reader = new FileReader();
    reader.onload = (event: any) => {
      var base64 = event.target.result;

      if (type == 1) {
        this.newAsset = file;
        this.fileDisplay = base64;
      }
    };

    reader.readAsDataURL(blob);
  }

  @ViewChild(ModelViewerComponent) modelViewer?: ModelViewerComponent;

  async save(action = 'save') {
    let asset = this.newAsset as File;

    let workflow = this.workflow as Executable;
    let assets = this.asset as ModelAsset;

    this.loading = 'Saving Asset';

    if (asset && workflow && assets) {
      this.loading = 'Uploading Assets';
      if ((!assets.img || assets.img == '') && this.modelViewer) {
        let i = this.modelViewer.screenshot();

        if (i) {
          let url = await this.loadService.uploadAssetImg(
            i,
            workflow.id,
            assets.id
          );

          if (url) {
            assets.img = url;
          }
        }
      }
      let url = await this.loadService.uploadCharacterAsset(
        asset,
        workflow.id,
        assets.id
      );

      if (url) {
        assets.assetUrl = url;
        this.newAsset = undefined;
      }
    }

    // this.dialogRef.close({
    //   workflow: this.workflow,
    //   action,
    //   asset: assets,
    // });

    this.asset = assets

    this.changed.emit({
      asset: assets,
    });
  }

  ngOnInit(): void {
    this.workflow = this.data.workflow;
    this.asset = JSON.parse(JSON.stringify(this.data.asset));
    this.fileDisplay = this.data.asset?.assetUrl;
  }
}
