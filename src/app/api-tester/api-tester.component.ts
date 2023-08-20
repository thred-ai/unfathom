import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadService, Dict } from '../load.service';
import { APIRequest } from '../models/workflow/api-request.model';
import { Executable } from '../models/workflow/executable.model';
import { Developer } from '../models/user/developer.model';
import { Clipboard } from '@angular/cdk/clipboard';
import * as uuid from 'uuid';
import { WorkflowComponent } from '../workflow/workflow.component';
import * as interact from 'interactjs';

@Component({
  selector: 'app-api-tester',
  templateUrl: './api-tester.component.html',
  styleUrls: ['./api-tester.component.scss'],
})
export class ApiTesterComponent implements OnInit {
  loadingMode = 0;
  response = '';
  prettyResponse = '';
  image?: string;
  request = '';

  currentStep?: string;
  sessionId: string;

  chats: { type: string; msg: string }[] = [];

  private workflowComponent?: WorkflowComponent;

  model?: Executable;
  user?: Developer;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private loadService: LoadService,
    public dialogRef: MatDialogRef<ApiTesterComponent>,
    private clipboard: Clipboard,
    private cdr: ChangeDetectorRef
  ) {
    this.sessionId = uuid.v4();
    this.workflowComponent = data.workflowComponent;
    this.user = this.data.user;
  }

  ngOnInit(): void {
    this.workflowComponent?.workflow.subscribe((w) => {
      this.model = w;
      if (this.model && this.model.sceneLayout.cells[0]) {
        this.currentStep = this.model.sceneLayout.cells[0].id;
      }
    });

    interact.default('.prototype-dialog').resizable({
      edges: { top: false, left: true, bottom: true, right: true },
      listeners: {
        move: function (event) {
          let { x, y } = event.target.dataset;

          // var bounds = verticalTextarea.getBoundingClientRect();

          x = (parseFloat(x) || 0) + event.deltaRect.left;
          y = (parseFloat(y) || 0) + event.deltaRect.top;

          Object.assign(event.target.style, {
            width: `${event.rect.width}px`,
            height: `${event.rect.height}px`,
          });

          Object.assign(event.target.dataset, { x, y });
        },
      },
    });
  }

  copy(data: string) {
    this.clipboard.copy(data);
  }

  async run() {
    if (
      this.request &&
      this.request.trim() != '' &&
      this.model &&
      this.currentStep
    ) {
      this.loadingMode = 1;

      // let url = await this.loadService.uploadExecutable(
      //   this.model!.id,
      //   this.model!
      // );

      this.chats.push({ type: 'user', msg: this.request });
      this.loadingMode = 2;

      this.cdr.detectChanges();

      if (this.model) {
        this.loadService.testAPI(
          this.model.id,
          this.currentStep,
          this.request,
          this.sessionId,
          async (result) => {
            if (this.loadingMode == 2) {
              this.image = undefined;
              if (result.result && result.nextId) {
                this.currentStep =
                  result.nextId != 'none'
                    ? result.nextId
                    : result.stepId ?? this.currentStep;
                if (typeof result.result == 'string') {
                  let str = result.result as string;
                  let match = str.match(/^https?:\/\/.+\/.+$/) != null;
                  if (match) {
                    const doesImageExist = (url: string) => {
                      return new Promise((resolve) => {
                        const img = new Image();

                        img.src = url;
                        img.onload = () => resolve(true);
                        img.onerror = () => resolve(false);
                      });
                    };
                    let isImage =
                      ((await doesImageExist(str)) as boolean) ?? false;

                    if (isImage) {
                      this.image = result.data as string;
                    }

                    this.loadingMode = 0;
                  }
                }
              }

              this.response = JSON.stringify(result.result ?? '');
              this.prettyResponse = result.result ?? '';
              this.chats.push({ type: 'system', msg: this.prettyResponse });
              this.loadingMode = 0;
            }
          }
        );
      } else {
        this.loadingMode = 0;
      }

      this.request = '';
    }
  }

  close() {}
}
