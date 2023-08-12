import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RangeCustomEvent } from '@ionic/angular';
import { CurrencyMaskInputMode } from 'ngx-currency';

@Component({
  selector: 'verticalai-layout-slider',
  templateUrl: './layout-slider.component.html',
  styleUrls: ['./layout-slider.component.scss']
})
export class LayoutSliderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Output() valueChange = new EventEmitter<number>();

  @Input() value: any = 0

  @Input() min: number = 0
  @Input() max: number = 100
  @Input() title: string = 'Slider'
  @Input() textColor: string = 'var(--primaryTextColor)';
  @Input() lineColor: string = 'var(--secondaryBackgroundColor)';
  @Input() lineFillColor: string = 'var(--primaryColor)';
  @Input() knobColor: string = 'var(--primaryColor)';
  @Input() knobTextColor: string = '#ffffff';

  @Input() simplify: boolean = false;


  sliderVal(event: number){
    let val = event
    if (val < this.min){
      val = this.min
    }
    if (val > this.max){
      val = this.max
    }
    return val
  }

  inputVal(val: number = 0){
    if (val < this.min){
      val = this.min
    }
    if (val > this.max){
      val = this.max
    }
    return val
  }

}
