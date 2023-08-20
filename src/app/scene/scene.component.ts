import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Scene } from '../models/workflow/scene.model';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements OnInit {


  ngOnInit() {
    
  }

  @Input() scene?: Scene
  @Input() placeholder?: boolean = false

  @Output() changed = new EventEmitter<Scene>();


  async fileChangeEvent(event: any, scene: Scene): Promise<void> {
    let file = event.target.files[0];

    let buffer = await file.arrayBuffer();

    var blob = new Blob([buffer]);

    var reader = new FileReader();
    reader.onload = (event: any) => {
      var base64 = event.target.result;

      // let imgIcon = document.getElementById('imgIcon') as HTMLImageElement;
      // imgIcon!.src = base64;

      scene.images[0] = base64

      // this.iconChanged.emit(file);
      this.changed.emit(scene)
    };

    reader.readAsDataURL(blob);
  }
}
