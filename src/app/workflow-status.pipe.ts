import { Pipe, PipeTransform } from '@angular/core';
import { Executable } from './models/workflow/executable.model';

@Pipe({
  name: 'workflowStatus',
})
export class WorkflowStatusPipe implements PipeTransform {
  transform(value: Executable[], status: number[]): Executable[] {
    return value.filter((v) => {
      return status.find((s) => s == v.status) != undefined;
    });
  }
}
