import {
  AfterContentInit,
  Directive,
  EventEmitter,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appGlobalEditorInit]',
})
export class GlobalEditorInitDirective implements AfterContentInit {
  @Output('initialized')
  public after: EventEmitter<void> = new EventEmitter<void>();

  public ngAfterContentInit(): void {
    // timeout helps prevent unexpected change errors
    setTimeout(() => this.after.next());
  }

}
