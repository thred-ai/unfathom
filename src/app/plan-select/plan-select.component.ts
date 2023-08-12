import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Dict, LoadService } from '../load.service';
import { Plan } from '../models/workflow/plan.model';
import { Executable } from '../models/workflow/executable.model';

@Component({
  selector: 'app-plan-select',
  templateUrl: './plan-select.component.html',
  styleUrls: ['./plan-select.component.scss'],
})
export class PlanSelectComponent implements OnInit {
  activePlan: string;
  modelId: string;

  expanded: Dict<Boolean> = {};
  needsBilling = false;
  loadingIndex: number = -1
  planToSet?: {index: number, plan: string};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private loadService: LoadService,
    public dialogRef: MatDialogRef<PlanSelectComponent>
  ) {
    console.log(data.script);
    this.activePlan = data.activePlan ?? '';
    this.modelId = data.modelId ?? '';
  }

  plans: Dict<Plan> = {};

  selectPlan(plan: string, index: number) {
    // this.activePlan = plan
    this.loadingIndex = index
    this.loadService.registerPlan(
      plan,
      this.modelId,
      (result, needsBilling) => {
        if (needsBilling) {
          this.needsBilling = true;
          this.planToSet = {plan, index}
        } else if (result) {
          this.activePlan = result;
          this.planToSet = undefined
        }
        this.loadingIndex = -1
      }
    );
  }

  ngOnInit(): void {
    this.loadService.loadedPlans.subscribe((plan) => {
      this.plans = plan ?? {};
      console.log(plan);
    });
  }

  close() {
    this.dialogRef.close();
  }
}
