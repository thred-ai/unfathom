import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'findString',
})
export class FindStringPipe implements PipeTransform {
  transform(value: string, list: string[]): boolean {
    return list.includes(value);
  }
}
