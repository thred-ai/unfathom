import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Scene } from '../models/workflow/scene.model';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent {

  @Input() scene?: Scene
  @Input() placeholder?: boolean = false

  @Output() changed = new EventEmitter<Scene>();


}
