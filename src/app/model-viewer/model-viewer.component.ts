import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-model-viewer',
  templateUrl: './model-viewer.component.html',
  styleUrls: ['./model-viewer.component.scss']
})
export class ModelViewerComponent implements OnInit {

  @Input() model?: string
  @Input() skybox?: string
  @Input() animate?: boolean = false
  @Input() ar?: boolean = false
  @Input() camera?: boolean = false
  @Input() id?: string = 'model'
  @Input() poster?: string
  @Input() ios_model?: string

  
  obj?: any = {
    detail: {
      visible: false
    }
  }

  pro = 0

  visible(event: any){
    this.obj = event
    this.cdr.detectChanges()
  }

  progress(event: any){
    this.pro = ((event.detail.totalProgress ?? 0) * 100)
  }

  constructor(
    public cdr: ChangeDetectorRef
  ) { 

  }

  ngOnInit(): void {

  }


}