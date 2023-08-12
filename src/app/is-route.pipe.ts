import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isRoute',
})
export class IsRoutePipe implements PipeTransform {
  transform(value: string, filters: string[]): boolean {
    return (
      filters
        .map((filter) => {
          return value.includes(filter);
        })
        .find((c) => c == true) ?? false
    );
  }
}
