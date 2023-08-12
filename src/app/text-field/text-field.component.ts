import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CurrencyMaskInputMode } from 'ngx-currency';

@Component({
  selector: 'verticalai-text-field',
  templateUrl: './text-field.component.html',
  styleUrls: ['./text-field.component.scss'],
})
export class TextFieldComponent implements OnInit {
  constructor() {}

  @Input() title: string = '';
  @Input() value: any;
  @Input() placeholder: string = '';
  @Input() btn: boolean = false;
  @Input() btnIcon: string = 'close';
  @Input() defaultValue: any = '';
  @Input() simplify: boolean = false;
  @Input() type = 'text';
  @Input() range = { min: 0, max: 0 };
  @Input() disabled: boolean = false;
  @Input() btnColor: string = '#a9a9a9';
  @Input() borderColor: string = 'transparent';
  @Input() textColor: string = 'var(--primaryTextColor)';
  @Input() bgColor: string = 'var(--secondaryBackgroundColor)';
  @Input() clickable: boolean = false;

  @Output() changed = new EventEmitter<any>();
  @Output() btnClicked = new EventEmitter<any>();
  @Output() refresh = new EventEmitter<any>();

  onInput(vals: string | number) {

    var value = vals

    if (value == '') {
      value = this.defaultValue;
    }

    var refresh = false;
    if (this.type == 'number') {
      let val = Number(value) ?? 0;
      if (val > this.range.max) {
        val = this.range.max;
        refresh = true;
      } else if (val < this.range.min) {
        val = this.range.min;
        refresh = true;
      }

      value = val;
    }

    this.changed.emit(value);
    if (refresh) {
      this.refresh.emit();
    }
  }

  ngOnInit(): void {}

  btnPressed() {
    let btn = document.getElementById('btn');
    btn?.style.setProperty('color', '#a9a9a9');
    setTimeout(() => {
      btn?.style.setProperty('color', this.btnColor);
    }, 100);
    this.btnClicked.emit();
  }
}
