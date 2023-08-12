import {
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Executable } from '../models/workflow/executable.model';
import * as CodeMirror from 'codemirror';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import {javascriptLanguage} from "@codemirror/lang-javascript"

@Component({
  selector: 'app-workflow-code',
  templateUrl: './workflow-code.component.html',
  styleUrls: ['./workflow-code.component.scss'],
})
export class WorkflowCodeComponent implements OnInit {
  constructor(private ngZone: NgZone) {}

  @Input() code!: any;
  @Output() codeChanged = new EventEmitter<string>();
  @ViewChild(CodemirrorComponent) private codeEditor?: CodemirrorComponent;

  ngOnInit(): void {

    setTimeout(() => {
      const editor = this.codeEditor?.codeMirror;
      const doc = editor?.getDoc();
    }, 2000);

  }


  async changed($event: string) {

      this.codeChanged.emit($event)
    
  }
}
