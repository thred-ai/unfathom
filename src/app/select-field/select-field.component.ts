import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'verticalai-select-field',
  templateUrl: './select-field.component.html',
  styleUrls: ['./select-field.component.scss'],
})
export class SelectFieldComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() title: string = '';
  @Input() value: any;
  @Input() valueField?: string;
  @Input() displayField?: string;
  @Input() textColor: string = 'var(--primaryTextColor)';
  @Input() bgColor: string = 'var(--secondaryBackgroundColor)';
  @Input() placeholder: string = '';
  @Input() simplify: boolean = false;
  @Input() multiple: boolean = false;

  @Output() changed = new EventEmitter<any>();
  @Output() refresh = new EventEmitter<any>();

  @Input() set theme(value: string | undefined){
    if (value && this.textColor == "var(--primaryTextColor)"){
      this.textColor = `var(--${value}--primaryTextColor)`;
    }
    if (value && this.bgColor == "var(--secondaryBackgroundColor)"){
      this.bgColor = `var(--${value}--secondaryBackgroundColor)`;
    }
  };

  change(event: any){
    this.changed.emit(event)
  }

  constructor() {}

  ngOnInit(): void {
  }
}
