import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  Step,
  ToolboxConfiguration,
  ToolboxGroupConfiguration,
} from 'verticalai-workflow-designer';
import { AIModelType } from './models/workflow/ai-model-type.model';
import { AIModel } from './models/workflow/ai-model.model';
import { Dict, LoadService } from './load.service';
import { SceneDefinition } from './models/workflow/scene-definition.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class DesignerService {
  constructor(private db: AngularFirestore) {}

  toolboxConfiguration = new BehaviorSubject<SceneDefinition[]>([]);

  // this.toolboxConfiguration.next([new SceneDefinition("Scene", "", "scene")])

  loadGroups(callback: (result: SceneDefinition[]) => any) {
    try {
      this.db
        .collection('Components')
        .valueChanges()
        .subscribe((docs) => {
          callback(docs as SceneDefinition[]);
          this.toolboxConfiguration.next(docs as SceneDefinition[])
        });
    } catch (error) {
      this.toolboxConfiguration.next([]);
      callback([]);
    }
  }
}
