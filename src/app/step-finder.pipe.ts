import { Pipe, PipeTransform } from '@angular/core';
import { BranchedStep, Definition, Step } from 'verticalai-workflow-designer';

@Pipe({
  name: 'stepFinder'
})
export class StepFinderPipe implements PipeTransform {

  transform(definition: Definition, step: Step): | BranchedStep | undefined {
    return definition.sequence.find(s => s.id == step.id) as BranchedStep;
  }

}
