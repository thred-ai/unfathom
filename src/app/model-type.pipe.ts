import { Pipe, PipeTransform } from '@angular/core';
import { AIModel } from './models/workflow/ai-model.model';

@Pipe({
  name: 'modelType'
})
export class ModelTypePipe implements PipeTransform {

  transform(value: AIModel, type: 'short' | 'long' = 'short'): string {
    if (type == 'short'){
      return value.type
    }
    return value.type
  }

}
