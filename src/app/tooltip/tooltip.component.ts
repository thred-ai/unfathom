import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'verticalai-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit {

  constructor() { }

  @Input() text?: string = ""

  ngOnInit(): void {
  }

}
