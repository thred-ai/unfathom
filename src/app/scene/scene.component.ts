import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Scene } from '../models/workflow/scene.model';
import { DesignerService } from '../designer.service';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss'],
})
export class SceneComponent implements OnInit {
  selected?: string;

  ngOnInit() {
    this.designService.openStep.subscribe((step) => {
      this.selected = (step?.data?.ngArguments?.scene as Scene)?.id;
    });
  }

  @Input() scene?: Scene;
  @Input() placeholder?: boolean = false;

  @Output() changed = new EventEmitter<Scene>();

  constructor(private designService: DesignerService) {}
}
