import { Pipe, PipeTransform } from '@angular/core';
import { Dict } from './load.service';

@Pipe({
  name: 'dictToArr',
})
export class DictToArrPipe implements PipeTransform {
  transform(value: Dict<any>, fn: 'keys' | 'values' | 'both' = 'both'): any[] {
    if (fn == 'both') {
      const map1 = new Map();

      Object.keys(value).forEach((key, index) => {
        map1.set(key, value[key]);
      });

      return Array.from(map1, ([name, value]) => ({ name, value }));
    } else if (fn == 'values') {
      return Object.values(value);
    } else if (fn == 'keys') {
      return Object.keys(value);
    }
    return [];
  }
}
