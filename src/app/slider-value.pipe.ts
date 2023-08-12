import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sliderValue'
})
export class SliderValuePipe implements PipeTransform {

  transform(event: any): any {
    return event.detail.value;
  }

}
