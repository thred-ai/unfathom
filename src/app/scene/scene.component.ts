import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Scene } from '../models/workflow/scene.model';
import { DesignerService } from '../designer.service';
import { Executable } from '../models/workflow/executable.model';
import { ProjectService } from '../project.service';
import { Character } from '../models/workflow/character.model';
import { LoadService } from '../load.service';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss'],
})
export class SceneComponent implements OnInit {
  selected?: string;

  workflow?: Executable;
  characters: Character[] = [];

  ngOnInit() {
    this.designService.openStep.subscribe((step) => {
      this.selected = (step?.data?.ngArguments?.scene as Scene)?.id;
    });
    this.projectService.workflow.subscribe((workflow) => {
      this.workflow = workflow;


      if (this.workflow){
        this.characters = (this.scene?.characters.map(c => this.workflow!.characters[c.id]) ?? []).filter(c => c != undefined)
        console.log(this.characters)
      }
    });
  }

  selectWorld(){
    if (this.scene){
      this.loadService.selectWorld(this.scene)
    }
  }

  @Input() scene?: Scene;

  @Input() placeholder?: boolean = false;

  @Output() changed = new EventEmitter<Scene>();

  constructor(
    private designService: DesignerService,
    private loadService: LoadService,
    private projectService: ProjectService
  ) {}
}
