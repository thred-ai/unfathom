import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeTextRows'
})
export class SafeTextRowsPipe implements PipeTransform {

  constructor(protected sanitizer: DomSanitizer) {}

  transform(value: string, format = false) {
    let replaced = value ?? '';

    if (format) {
      replaced = replaced
        .replace(/px/g, '; font-size: 8px; ')
        .replace(
          /style="/g,
          'style="word-wrap:break-word; word-break: break-all; text-overflow: ellipsis; margin-right: 5px; '
        );
    }
    return this.sanitizer.bypassSecurityTrustHtml(replaced.replace(/style="/g, 'style="white-space: initial; '));
  }

}
