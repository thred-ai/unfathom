import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadService } from '../load.service';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss'],
})
export class CodeEditorComponent implements OnInit {
  code: string = '';
  changedCode: string = ''
  type: string = ''

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private loadService: LoadService,
    public dialogRef: MatDialogRef<CodeEditorComponent>
  ) {
    this.code = data.script;
    this.type = data.type
    this.changedCode = data.script

    
  }

  close() {
    this.dialogRef.close();
  }

  ngOnInit(): void {}
}
