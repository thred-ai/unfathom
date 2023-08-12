import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'apiUrl'
})
export class ApiUrlPipe implements PipeTransform {

  transform(value: string): string {
    return `https://api.verticalai.io/${value}`;
  }

}
