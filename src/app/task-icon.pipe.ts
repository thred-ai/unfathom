import { Pipe, PipeTransform } from '@angular/core';
import { TaskTree } from './models/workflow/task-tree.model';

@Pipe({
  name: 'taskIcon',
})
export class TaskIconPipe implements PipeTransform {
  transform(task: TaskTree): string {
    if (task.metadata['type'] == 'model') {
      return 'logo-javascript';
    } else if (task.metadata['type'] == 'folder') {
      return 'return-down-forward-outline';
    } else if (task.metadata['type'] == 'switch') {
      return 'git-branch-outline';
    } else if (task.metadata['type'] == 'container') {
      return 'git-compare-outline';
    }

    return 'logo-javascript';
  }
}
