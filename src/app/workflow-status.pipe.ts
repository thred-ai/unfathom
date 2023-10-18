import { Pipe, PipeTransform } from '@angular/core';
import { World } from './models/workflow/world.model';

@Pipe({
  name: 'workflowStatus',
})
export class WorkflowStatusPipe implements PipeTransform {
  transform(value: World[], status: number[]): World[] {
    return value.filter((v) => {
      return status.find((s) => s == v.status) != undefined;
    });
  }
}
