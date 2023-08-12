import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textAreaRender'
})
export class TextAreaRenderPipe implements PipeTransform {

  transform(value: string): string {
    if (typeof value == 'string'){
      return value?.replace(/\\n/g, "\n").replace(/\\t/g, "");;
    }
    return value
  }

}
