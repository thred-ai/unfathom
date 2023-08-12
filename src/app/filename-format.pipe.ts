import { Pipe, PipeTransform } from '@angular/core';
import { TaskTree } from './models/workflow/task-tree.model';

@Pipe({
  name: 'filenameFormat'
})
export class FilenameFormatPipe implements PipeTransform {

  transform(value: string, files: TaskTree[]): string {
    return '';
  }

}
