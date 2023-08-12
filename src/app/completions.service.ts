import { Injectable } from '@angular/core';
import { CompletionContext } from '@codemirror/autocomplete';

@Injectable({
  providedIn: 'root',
})
export class CompletionsService {
  constructor() {}

  myCompletions(context: CompletionContext) {
    let word = context.matchBefore(/\w*/);

    if (word === null || (word.from == word.to && !context.explicit))
      return null;
    return {
      from: word.from,
      options: [
        { label: 'true', type: 'keyword' },
        { label: 'hello', type: 'variable', info: '(World)' },
        { label: 'magic', type: 'text', apply: '⠁⭒*.✩.*⭒⠁', detail: 'macro' },
      ],
    };
  }
}
