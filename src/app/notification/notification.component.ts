import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {


  @Input() actionBtn?: string = undefined;
  @Input() canClose: boolean = true;
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() icon: string = 'info';
  @Input() iconColor: string = 'info';

  @Output() actionBtnPressed = new EventEmitter<boolean>();
  @Output() didClose = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

}
