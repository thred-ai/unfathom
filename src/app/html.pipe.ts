import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'storePipe'
})
export class HtmlPipe implements PipeTransform {

  transform(value: string) {
    // var replaced = value.replace(/thred.storePic/g, Globals.storeInfo?.profileLink?.toString() ?? "")

    return ''
  }

}
