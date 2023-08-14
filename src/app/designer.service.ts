import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  Step,
  ToolboxConfiguration,
  ToolboxGroupConfiguration,
} from 'verticalai-workflow-designer';
import { AIModelType } from './models/workflow/ai-model-type.model';
import { AIModel } from './models/workflow/ai-model.model';
import { Dict } from './load.service';
import { SceneDefinition } from './models/workflow/scene-definition.model';

@Injectable({
  providedIn: 'root',
})
export class DesignerService {
  constructor() {}

  toolboxConfiguration = new BehaviorSubject<SceneDefinition[]>([]);



  loadGroups() {
    this.toolboxConfiguration.next([new SceneDefinition("Scene", "", "scene")])
  
  }
}
