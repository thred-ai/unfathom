import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeImgUrl'
})
export class SafeImgUrlPipe implements PipeTransform {

  constructor(protected sanitizer: DomSanitizer) {}

  transform(value: string) {
    return this.sanitizer.bypassSecurityTrustUrl(value);
  }

}
//