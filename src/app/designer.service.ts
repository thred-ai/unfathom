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

@Injectable({
  providedIn: 'root',
})
export class DesignerService {
  constructor() {}

  toolboxConfiguration = new BehaviorSubject<ToolboxConfiguration>({
    groups: [],
  });

  flowModels: Dict<AIModelType> = {};

  get flowGroup(): ToolboxGroupConfiguration {
    return {
      name: 'Vertical AI',
      steps: [
        {
          componentType: 'switch',
          name: 'Decision',
          properties: {
            defaultName: 'Decision',
            default: 'Option 1',
            order: {
              'Option 1': 0,
              'Option 2': 1,
            },
            branches: {
              'Option 1': { description: '' },
              'Option 2': { description: '' },
            },
          },
          type: 'switch',
          id: 'decision',
          branches: {
            'Option 1': [],
            'Option 2': [],
          },
        } as Step,
        {
          componentType: 'container',
          name: 'Group',
          properties: {
            defaultName: 'Group',
            frequency: 1,
          },
          type: 'container',
          id: 'loop',
          sequence: [],
        } as Step,
        // {
        //   componentType: 'task',
        //   name: 'Break',
        //   properties: {
        //     defaultName: 'Break',
        //     type: 'break',
        //   },
        //   type: 'break',
        //   id: 'break',
        //   sequence: [],
        // } as Step,
      ],
    };
  }

  get taskGroup(): ToolboxGroupConfiguration {
    return {
      name: 'Tasks',
      steps: [
        {
          componentType: 'task',
          name: 'Custom Agent',
          properties: {
            defaultName: 'Custom Agent',
            type: 'api',
          },
          type: 'api',
          id: 'api',
          sequence: [],
        } as Step,
        {
          componentType: 'task',
          name: 'Web Agent',
          properties: {
            defaultName: 'Web Agent',
            type: 'web',
          },
          type: 'web',
          id: 'web',
          sequence: [],
        } as Step,
        {
          componentType: 'task',
          name: 'Script Agent',
          properties: {
            defaultName: 'Script Agent',
            type: 'js',
          },
          type: 'js',
          id: 'js',
          sequence: [],
        } as Step,
      ],
    };
  }

  loadGroups(models: Dict<AIModelType>) {
    if (this.toolboxConfiguration.value.groups.length == 0) {
      let modelGroups: ToolboxGroupConfiguration[] = Object.values(models).map(
        (modelType) => {
          return {
            name: `${modelType.name}`,
            steps: Object.values(modelType.models).map((model) => {
              return {
                componentType: 'task',
                name: model.name,
                properties: {
                  defaultName: model.name,
                  type: 'model',
                },
                type: model.id,
              };
            }),
          };
        }
      );

      let gpt = models['LLM'].models['gpt-LLM'];

      if (gpt) {
        this.flowModels['FLOW'] = new AIModelType('Flow', 'FLOW', {
          switch: gpt,
        });
      }

      this.toolboxConfiguration.next({
        groups: modelGroups.concat([
          this.flowGroup,
          // this.taskGroup,
        ]),
      });
    }
  }
}
