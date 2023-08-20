import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Scene } from '../models/workflow/scene.model';
import { SceneNode } from '../models/workflow/scene-node.model';
import { DesignerService } from '../designer.service';

@Component({
  selector: 'app-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss'],
})
export class NodeComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() value?: string;
  @Input() scene?: Scene;

  @Input() selected?: boolean = false;

  ngAfterViewInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {}

  constructor(private designService: DesignerService){}

  ngOnInit(): void {
    
  }


  setScene(scene: Scene, id?: string){
    this.designService.setScene(scene, id!)
  }


}
