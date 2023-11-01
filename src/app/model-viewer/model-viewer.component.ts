import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';

@AutoUnsubscribe
@Component({
  selector: 'app-model-viewer',
  templateUrl: './model-viewer.component.html',
  styleUrls: ['./model-viewer.component.scss'],
})
export class ModelViewerComponent implements OnInit {
  @Input() model?: string;
  @Input() skybox?: string;
  @Input() animate?: boolean = false;
  @Input() ar?: boolean = false;
  @Input() camera?: boolean = false;
  @Input() id?: string = 'model';
  @Input() poster?: string;
  @Input() ios_model?: string;
  @Input() prompt?: boolean = true;
  @Input() loaderColor: string = 'transparent';

  @Output() didScreenshot = new EventEmitter<string>();

  obj?: any = {
    detail: {
      visible: false,
    },
  };

  screenshot() {
    let screenshot = (
      document.getElementById('viewer') as HTMLCanvasElement
    )?.toDataURL('image/png');
    return screenshot;
  }

  pro = 0;

  visible(event: any) {
    this.obj = event;
    this.cdr.detectChanges();
  }

  progress(event: any) {
    this.pro = (event.detail.totalProgress ?? 0) * 100;
    if (this.pro == 100){
      setTimeout(() => {
        this.didScreenshot.emit(this.screenshot())
      }, 500);
    }
  }

  constructor(public cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    (window as any).screenshot = this.screenshot;
  }
}
