import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadService } from '../load.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { Executable } from '../models/workflow/executable.model';

@Component({
  selector: 'app-workflow-info',
  templateUrl: './workflow-info.component.html',
  styleUrls: ['./workflow-info.component.scss']
})
export class WorkflowInfoComponent implements OnInit {

  workflow!: Executable

  showKey = false

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private loadService: LoadService,
    public dialogRef: MatDialogRef<WorkflowInfoComponent>,
    public clipboard: Clipboard,
  ) {
    this.workflow = data.workflow;
  }

  copy(data: string){
    this.clipboard.copy(data)
  }
  close() {
    this.dialogRef.close();
  }

  ngOnInit(): void {}

}
