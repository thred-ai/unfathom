import { Component, Input, OnInit } from '@angular/core';
import { Executable } from '../models/workflow/executable.model';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit {

  constructor() { }

  @Input() model?: Executable

  ngOnInit(): void {
  }

}
