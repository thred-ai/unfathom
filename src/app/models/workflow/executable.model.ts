import { Definition } from 'verticalai-workflow-designer';
import * as uuid from 'uuid';
import { Plan } from './plan.model';
import { Subscription } from './subscription.model';
import { Scene } from './scene.model';
import { Character } from './character.model';
import { SceneLayout } from './scene-layout.model';

export class Executable {
  name!: string;
  id!: string;
  creatorId!: string;
  creatorName?: string;
  rating!: number;
  downloads!: number;
  created!: number;
  modified!: number;
  status!: number;
  installWebhook!: string;
  whitelist?: string[];
  sceneLayout!: SceneLayout;
  characters!: Character[];

  tracking!: boolean;
  displayUrl!: string;
  url!: string;
  apiKey!: string;
  plan?: Subscription;
  executableUrl?: string;

  resetUrl() {
    return `https://storage.cloud.google.com/verticalai.appspot.com/workflows/${this.id}/icon-${this.id}.png`;
  }

  constructor(
    id: string,
    creatorId: string,
    created: number,
    modified?: number,
    creatorName?: string,
    displayUrl?: string,
    name?: string,
    rating?: number,
    downloads?: number,
    status?: number,
    installWebhook?: string,
    whitelist?: string[],
    sceneLayout?: SceneLayout,
    characters?: Character[],
    tracking?: boolean,
    url?: string,
    apiKey?: string,
    plan?: Subscription,
    executableUrl?: string
  ) {
    this.id = id;
    this.displayUrl = displayUrl ?? this.resetUrl();
    this.creatorId = creatorId;
    this.created = created;
    this.modified = modified ?? created;
    this.creatorName = creatorName ?? 'Unknown Developer';
    this.name = name ?? 'My Project'; //
    this.rating = rating ?? 0;
    this.downloads = downloads ?? 0;
    this.status = status ?? 0;
    this.installWebhook = installWebhook ?? '';
    this.whitelist = whitelist ?? [];
    this.tracking = tracking ?? false;
    this.sceneLayout = sceneLayout ?? { cells: [] };
    this.characters = characters ?? [];
    this.url = url ?? id;
    this.apiKey = apiKey ?? `V-${uuid.v4()}`;
    this.plan = plan ?? new Subscription('', '', '', 0, 0);
    this.executableUrl = executableUrl;
  }
}
