import { Component, Input, OnInit } from '@angular/core';
import { Plan } from '../models/workflow/plan.model';
import { Subscription } from '../models/workflow/subscription.model';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {

  constructor() { }
  @Input() plan?: Plan

  ngOnInit(): void {
  }

}
