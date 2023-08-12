import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-shared-dialog',
  templateUrl: './shared-dialog.component.html',
  styleUrls: ['./shared-dialog.component.scss'],
})
export class SharedDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SharedDialogComponent>,
  ) {
    this.mode = data.mode
  }

  mode = -1



  close(){
    this.dialogRef.close()

    
  }

  saved(event: any){
    this.dialogRef.close(event)
  }

  ngOnInit(): void {}
}
