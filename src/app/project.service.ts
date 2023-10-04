import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Dict } from './load.service';
import { AIModelType } from './models/workflow/ai-model-type.model';
import { Executable } from './models/workflow/executable.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  loadedModels = new BehaviorSubject<Dict<AIModelType>>({});
  loading = new BehaviorSubject<boolean>(false);
  workflow = new BehaviorSubject<Executable | undefined>(undefined);
  saveWorkflow = new BehaviorSubject<Executable | undefined>(undefined);


  save(workflow = this.workflow.value){
    this.saveWorkflow.next(workflow)
  }
  constructor() { }
}
