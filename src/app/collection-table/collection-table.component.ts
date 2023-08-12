import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Executable } from '../models/workflow/executable.model';
import { Dict, LoadService } from '../load.service';
import { Plan } from '../models/workflow/plan.model';

@Component({
  selector: 'app-collection-table',
  templateUrl: './collection-table.component.html',
  styleUrls: ['./collection-table.component.css'],
})
export class CollectionTableComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @Output() clicked = new EventEmitter<{ app: Executable; mode: number }>();
  @Output() planClicked = new EventEmitter<{plan: string, index: number}>();

  @Input() set utils(utils: Executable[]) {
    setTimeout(() => {
      this.dataSource = new MatTableDataSource<Executable>(utils);
      this.dataSource!.paginator = this.paginator1!;
      this.cdr.detectChanges();
    }, 200);
  }

  @Input() count: number = 0;

  open(app: Executable, mode = 0) {
    this.clicked.emit({ app, mode });
  }

  dataSource?: MatTableDataSource<Executable>;

  displayedColumns2: string[] = [
    'image',
    'requests',
    'models',
    'plan',
    'action',
  ];

  plans: Dict<Plan> = {};

  ngOnChanges() {
    this.cdr.detectChanges();
  }

  @ViewChild(MatPaginator) paginator1?: MatPaginator;

  constructor(
    private cdr: ChangeDetectorRef,
    private loadService: LoadService
  ) {}

  ngOnInit(): void {
    this.loadService.loadedPlans.subscribe((plan) => {
      this.plans = plan ?? {};
    });
  }

  ngAfterViewInit() {}
}
