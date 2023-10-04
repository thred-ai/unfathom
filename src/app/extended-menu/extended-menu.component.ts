import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-extended-menu',
  templateUrl: './extended-menu.component.html',
  styleUrls: ['./extended-menu.component.scss'],
})
export class ExtendedMenuComponent implements OnInit {
  constructor() {}

  @Input() data: any = {};

  @Output() close = new EventEmitter<any>();
  @Output() changed = new EventEmitter<any>();

  ngOnInit(): void {}

  
}
