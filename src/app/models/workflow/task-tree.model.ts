import { Dict } from "src/app/load.service";

export class TaskTree {
  name: string;
  id: string;
  type: 'model' | 'category';
  sequence: TaskTree[];
  categoryTask?: TaskTree
  metadata: Dict<any>

  constructor(
    name: string,
    id: string,
    type: 'model' | 'category',
    sequence: TaskTree[],
    categoryTask?: TaskTree,
    metadata?: Dict<any>
  ) {
    this.id = id;
    this.name = name ?? 'New Task';
    this.type = type ?? '';
    this.sequence = sequence ?? [];
    this.categoryTask = categoryTask
    this.metadata = metadata ?? {}
  }
}
