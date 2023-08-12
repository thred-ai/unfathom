import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prettifyJson'
})
export class PrettifyJsonPipe implements PipeTransform {

  transform(value: any) {
    var pretty = JSON.stringify(value);
    return pretty
  }

}
