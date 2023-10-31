import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Dict } from './load.service';
import { World } from './models/workflow/world.model';
import { DesignService } from './design.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  loading = new BehaviorSubject<boolean>(false);
  workflow = new BehaviorSubject<World | undefined>(undefined);
  saveWorkflow = new BehaviorSubject<World | undefined>(undefined);


  save(workflow = this.workflow.value){

    this.saveWorkflow.next(workflow)
  }
  constructor() { }
}
