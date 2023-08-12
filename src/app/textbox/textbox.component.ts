import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'verticalai-textbox',
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss'],
})
export class TextboxComponent implements OnInit {
  @Input() title: string = '';
  @Input() value: any;
  @Input() placeholder: string = '';
  @Input() defaultValue: any = '';
  @Input() simplify: boolean = false;
  @Input() type: string = 'text';
  @Input() borderColor: string = 'transparent';
  @Input() textColor: string = 'var(--primaryTextColor)';
  @Input() bgColor: string = 'var(--secondaryBackgroundColor)';
  @Input() disabled: boolean = false;
  @Input() corners: string = 'rounded';
  @Input() animation: string = 'none';
  @Input() maxHeight: number = 400;
  @Input() minHeight: number = 70;

  @Output() changed = new EventEmitter<any>();

  constructor() {}

  onInput(ev: string) {
    var value = ev;

    if (value == '') {
      value = this.defaultValue;
    }

    this.changed.emit(value);
  }

  ngOnInit(): void {}

}
