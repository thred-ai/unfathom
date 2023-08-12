import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Collection } from '../models/workflow/collection.model';
import { LoadService } from '../load.service';

@Component({
  selector: 'app-collection-info',
  templateUrl: './collection-info.component.html',
  styleUrls: ['./collection-info.component.scss'],
})
export class CollectionInfoComponent implements OnInit {
  // openLayouts = ['g-comp', 'general', 'config'];

  //
  // flowModels: Dict<AIModelType> = {};

  collection?: Collection;

  loading = false;

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CollectionInfoComponent>,
    private loadService: LoadService
  ) {
    // dialogRef.disableClose = true;
    this.collection = new Collection('', 0);
  }

  autoId() {
    this.collection!.id = this.loadService.newUtilID;
  }

  ngOnInit(): void {}

  async isNameTaken(id: string) {
    let canUse = await this.loadService.checkCollectionName(
      this.data.workflow.id,
      id
    );
    return canUse;
  }

  regExpId(id: string) {
    return id.replace(/[^a-zA-Z0-9]/g, '');
  }

  async save() {
    if (this.collection) {
      let id = this.regExpId(this.collection.id);
      console.log(id)
      let canUse = await this.isNameTaken(id);
      console.log(canUse)
      if (canUse) {
        this.collection.id = id;
        this.dialogRef.close(this.collection);
      }
    }
  }
}
