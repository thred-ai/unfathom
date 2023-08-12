import { Dict } from "src/app/load.service";
import { AIModel } from "./ai-model.model";

export class AIModelType {
  name!: string;
  id!: string;
  models: Dict<AIModel>

  constructor(
    name: string,
    id: string,
    models: Dict<AIModel>
  ) {
    this.id = id ?? "other";
    this.name = name ?? 'Other Model';
    this.models = models ?? {}
    // this.colorStyle =
    //   colorStyle && (colorStyle?.name ?? '').trim() != ''
    //     ? colorStyle
    //     : new StoreTheme(
    //         'Light',
    //         'light',
    //         'dark',
    //         'light',
    //         'simple',
    //         [255.0, 255.0, 255.0, 1],
    //         [10.0, 10.0, 10.0, 1]
    //       );
  }
}
