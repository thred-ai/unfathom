import { Pipe, PipeTransform } from '@angular/core';
import { Dict } from './load.service';

@Pipe({
  name: 'mergeObj'
})
export class MergeObjPipe implements PipeTransform {

  transform(value: Dict<any>[]): Dict<any> {
    var obj: Dict<any> = {}

    value.forEach(v => {
      obj = Object.assign(obj, v);
    })
    return obj
  }

}
