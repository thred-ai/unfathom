import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rawEditFilter'
})
export class RawEditFilterPipe implements PipeTransform {

  transform(value: any[]) {
    return value.filter(v => v.hasRaw)
  }

}
