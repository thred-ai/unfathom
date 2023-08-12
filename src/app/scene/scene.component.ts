import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent {

  @Input() name?: string
  
}
