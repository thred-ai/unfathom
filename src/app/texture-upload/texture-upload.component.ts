import { Component } from '@angular/core';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';

@AutoUnsubscribe
@Component({
  selector: 'app-texture-upload',
  templateUrl: './texture-upload.component.html',
  styleUrls: ['./texture-upload.component.scss']
})
export class TextureUploadComponent {

}
