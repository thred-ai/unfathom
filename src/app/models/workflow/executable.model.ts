import { Definition } from 'verticalai-workflow-designer';
import * as uuid from 'uuid';
import { Plan } from './plan.model';
import { Subscription } from './subscription.model';
import { Scene } from './scene.model';

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
  scenes!: Scene[];
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
    scenes?: Scene[],
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
    this.scenes = scenes ?? [
      new Scene('12', 'My New Scene', 'This is my new scene for my game', [
        'https://firebasestorage.googleapis.com/v0/b/verticalai.appspot.com/o/models%2Fclaude.png?alt=media&token=bef53270-3bef-4d8a-9132-dc989f93d41c',
      ]),
      new Scene('123', 'My New Scene 2', 'This is my second new scene for my game', [
        'https://firebasestorage.googleapis.com/v0/b/verticalai.appspot.com/o/models%2Frepl.png?alt=media&token=4ab67882-a48a-4be8-b427-b9531441f34a',
      ]),
      new Scene('1', 'My New Scene', 'This is my new scene for my game', [
        'https://firebasestorage.googleapis.com/v0/b/verticalai.appspot.com/o/models%2Fclaude.png?alt=media&token=bef53270-3bef-4d8a-9132-dc989f93d41c',
      ]),
      new Scene('2', 'My New Scene 2', 'This is my second new scene for my game', [
        'https://firebasestorage.googleapis.com/v0/b/verticalai.appspot.com/o/models%2Frepl.png?alt=media&token=4ab67882-a48a-4be8-b427-b9531441f34a',
      ]),
      new Scene('3', 'My New Scene', 'This is my new scene for my game', [
        'https://firebasestorage.googleapis.com/v0/b/verticalai.appspot.com/o/models%2Fclaude.png?alt=media&token=bef53270-3bef-4d8a-9132-dc989f93d41c',
      ]),
      new Scene('1234', 'My New Scene 2', 'This is my second new scene for my game', [
        'https://firebasestorage.googleapis.com/v0/b/verticalai.appspot.com/o/models%2Frepl.png?alt=media&token=4ab67882-a48a-4be8-b427-b9531441f34a',
      ])
    ];
    this.url = url ?? id;
    this.apiKey = apiKey ?? `V-${uuid.v4()}`;
    this.plan = plan ?? new Subscription('', '', '', 0, 0);
    this.executableUrl = executableUrl;
  }
}
