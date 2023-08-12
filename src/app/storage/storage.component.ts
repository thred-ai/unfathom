import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { LoadService } from '../load.service';
import { TaskTree } from '../models/workflow/task-tree.model';
import { Executable } from '../models/workflow/executable.model';
import { WorkflowComponent } from '../workflow/workflow.component';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.scss']
})
export class StorageComponent implements OnInit {

  workflow?: Executable;

  @Output() detailsChanged = new EventEmitter<Executable>();

  loading: Boolean = false;

  constructor(
    private workflowComponent: WorkflowComponent,
    private loadService: LoadService
  ) {}

  public saveLayout() {
    // this.definition = definition;

    this.loading = true;

    this.detailsChanged.emit(this.workflow);
  }

  ngOnInit(): void {
    this.workflowComponent.workflow.subscribe((w) => {
      if (w) {
        this.workflow = w;
      }
    });

    // this.workflowComponent.items.subscribe((i) => {
    //   if (this.workflow) {
    //     this.selectedFile =
    //       this.workflowComponent.openFileId ?? this.items[0]?.type == 'model'
    //         ? this.items[0].id
    //         : this.items[0]?.categoryTask?.id;
    //   }
    // });

    this.loadService.loading.subscribe((l) => {
      this.loading = l;
    });
  }

  saveFieldName(obj: TaskTree, newName: any = '') {
    let name = newName as string;

    if (name && name.trim() != '') {
      obj.name = newName;
    }
    // this.editingTask = undefined;

    this.saveLayout();
  }

  checkName() {}

  @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger?: MatMenuTrigger;
  menuTopLeftPosition = { x: '0', y: '0' };

  onRightClick(event: MouseEvent, task: TaskTree) {
    // preventDefault avoids to show the visualization of the right-click menu of the browser
    event.preventDefault();

    // we record the mouse position in our object
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';

    // we open the menu
    // we pass to the menu the information about our object
    this.matMenuTrigger!.menuData = { item: task };

    // we open the menu
    this.matMenuTrigger!.openMenu();
  }

}
