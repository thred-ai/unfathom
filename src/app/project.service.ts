import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Dict } from './load.service';
import { Executable } from './models/workflow/executable.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  loading = new BehaviorSubject<boolean>(false);
  workflow = new BehaviorSubject<Executable | undefined>(undefined);
  saveWorkflow = new BehaviorSubject<Executable | undefined>(undefined);


  save(workflow = this.workflow.value){
    this.saveWorkflow.next(workflow)
  }
  constructor() { }
}
