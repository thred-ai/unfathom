import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { first, take } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Meta, Title } from '@angular/platform-browser';
import { Developer } from './models/user/developer.model';
import { AIModel } from './models/workflow/ai-model.model';
import { AIModelType } from './models/workflow/ai-model-type.model';
import { Trigger } from './models/workflow/trigger.model';
import { TrainingData } from './models/workflow/training-data.model';
import { Key } from './models/workflow/key.model';
import { APIRequest } from './models/workflow/api-request.model';
import { Plan } from './models/workflow/plan.model';
import { Executable } from './models/workflow/executable.model';
import { Document } from './models/workflow/document.model';
import { Collection } from './models/workflow/collection.model';
import { Scene } from './models/workflow/scene.model';
import { SceneLayout } from './models/workflow/scene-layout.model';
import { DesignerService } from './designer.service';
import { ThemeService } from './theme.service';
import { ProjectService } from './project.service';
import { World } from './models/workflow/world.model';
import { Sky } from './models/workflow/sky.model';
import { Ground } from './models/workflow/ground.model';
import { Liquid } from './models/workflow/liquid.model';
import { LiquidType } from './models/workflow/liquid-type.enum';
import { Texture } from './models/workflow/texture.model';

export interface Dict<T> {
  [key: string]: T;
}

@Injectable({
  providedIn: 'root',
})
export class LoadService {
  defaultCoords = {
    address: {
      city: 'Los Angeles',
      country: 'United States',
      country_code: 'US',
      region: 'California',
      region_code: 'CA',
    },
    coords: {
      LONGITUDE: -118.243683,
      LATITUDE: 34.052235,
    },
  };

  async selectWorld(scene?: Scene) {
    // let world = new World(
    //   scene.id,
    //   5000,
    //   0.4,
    //   'assets/images/sky.png',
    //   new Ground(
    //     'assets/images/heightMap.png',
    //     'assets/images/ground.jpg',
    //     new Liquid('assets/images/lava_lavatile.jpg', LiquidType.lava)
    //   )
    // );

    // let world = new World(
    //   scene.id,
    //   1000,
    //   1,
    //   'assets/images/sky2.png',
    //   new Ground(
    //     'assets/images/heightMap2.png',
    //     'assets/images/sand.png',
    //     new Liquid('bump.png', LiquidType.water)
    //   )
    // );

    console.log(scene)

    if (this.projectService.workflow.value && scene) {
      // var saved = false

      this.designerService.openWorld.next(scene.world);

      // this.getWorld(
      //   this.projectService.workflow.value.id,
      //   scene.id,
      //   async (world) => {

      //     // if (!world?.assets || world.assets.length == 0) {
      //     //   world?.assets.push(
      //     //     {
      //     //       data: new ModelAsset(
      //     //         'Starship',
      //     //         'ship',
      //     //         'assets/ship.glb',
      //     //         '',
      //     //         'movable'
      //     //       ),
      //     //       spawn: { x: 0, y: 0, z: 0 },
      //     //       direction: { x: 0, y: 0, z: 0 },
      //     //       scale: 1.5,
      //     //     },
      //     //     {
      //     //       data: new ModelAsset(
      //     //         "Darth Vader's Castle",
      //     //         'castle',
      //     //         'assets/mustafarav.glb',
      //     //         "",
      //     //         'static'
      //     //       ),
      //     //       spawn: { x: 0, y: 0, z: 0 },
      //     //       direction: { x: 0, y: 0, z: 0 },
      //     //       scale: 1.5,
      //     //     }
      //     //   );
      //     //   this.loadService.saveWorld(world!, this.workflow!.id);
      //     // }

      //     // if (!scene?.characters || scene.characters.length == 0) {
      //     //   scene?.characters.push({
      //     //     data: new Character(
      //     //       'main',
      //     //       'John',
      //     //       'assets/mustafarav.glb',
      //     //       'A shining knight',
      //     //       undefined,
      //     //       'Gloomy',
      //     //       'hero'
      //     //     ),
      //     //     spawn: { x: 0, y: 0, z: 0 },
      //     //     direction: { x: 0, y: 0, z: 0 },
      //     //     scale: 1.5,
      //     //   });
      //     //   this.loadService.saveWorld(world!, this.workflow!.id);
      //     // }

      //     var w = world;

      //     // if (w && !saved) {
      //     //   saved = true
      //     //   let clone = JSON.parse(JSON.stringify(w));
      //     //   w.ground!.texture = new Texture(clone.ground.texture);
      //     //   w.sky!.texture = new Texture(
      //     //     undefined,
      //     //     undefined,
      //     //     undefined,
      //     //     undefined,
      //     //     clone.sky.texture
      //     //   );
      //     //   w.ground!.liquid!.texture = new Texture(
      //     //     clone.ground.liquid.texture,
      //     //     undefined,
      //     //     clone.ground.liquid.texture
      //     //   );

      //     //   await this.saveWorld(w!, this.projectService.workflow.value!.id);
      //     // }

      //     // if (!w) {
      //     //   console.log(scene)
      //     //   w = new World(
      //     //     scene.id,
      //     //     1000,
      //     //     0.8,
      //     //     new Sky(
      //     //       1000,
      //     //       'https://storage.googleapis.com/verticalai.appspot.com/workflows/oQ87v3KUtRXFHneq5TAa/scenes/182544f5-2b60-4c8b-8601-fada5017c503/textures/skybox.png'
      //     //     ),
      //     //     new Ground(
      //     //       'https://storage.googleapis.com/verticalai.appspot.com/workflows/oQ87v3KUtRXFHneq5TAa/scenes/182544f5-2b60-4c8b-8601-fada5017c503/textures/heightMap.png',
      //     //       'https://storage.googleapis.com/verticalai.appspot.com/workflows/oQ87v3KUtRXFHneq5TAa/scenes/182544f5-2b60-4c8b-8601-fada5017c503/textures/sf.png',
      //     //       new Liquid(
      //     //         'assets/images/lava_lavatile.jpg',
      //     //         LiquidType.lava,
      //     //         10
      //     //       ),
      //     //       0,
      //     //       600
      //     //     )
      //     //   );
      //     //   await this.saveWorld(
      //     //     w!,
      //     //     this.projectService.workflow.value!.id
      //     //   );
      //     // }

      //     // var s = scene
      //     // var x = this.projectService.workflow.value

      //     // var same = x?.sceneLayout.cells.findIndex(d => d.data?.ngArguments?.scene.id == s.id)

      //     // console.log(same)

      //     // if (x && same != undefined && same > -1 && w){
      //     //   var sameS = x.sceneLayout.cells[same].data?.ngArguments?.scene as Scene
      //     //   if (sameS){
      //     //     sameS.world = w
      //     //     x.sceneLayout.cells[same].data.ngArguments.scene = sameS
      //     //     await this.saveLayout(x, '123')
      //     //   }
      //     // }

      //     this.designerService.openWorld.next(w);
      //   }
      // );
    }
    else{
      this.designerService.openWorld.next(undefined);
    }
  }

  constructor(
    @Inject(PLATFORM_ID) private platformID: Object,
    private router: Router,
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private themeService: ThemeService,
    private functions: AngularFireFunctions,
    private storage: AngularFireStorage,
    private http: HttpClient,
    private metaService: Meta,
    private titleService: Title,
    private designerService: DesignerService,
    private projectService: ProjectService
  ) {}

  // .bg-theme{
  //   background-color: #1F1F1F;
  // }

  // .secondary-background {
  //   background-color: #151515;
  // }

  confirmDelete() {
    return confirm('Are you sure you want to delete this component?');
  }

  async saveWorld(world: World, id: string) {
    try {
      await this.db
        .doc(`Workflows/${id}/Worlds/${world.id}`)
        .set(JSON.parse(JSON.stringify(world)), { merge: true });

      // this.projectService.loading.next(false);

      return world;
    } catch (error) {
      console.log(error);
      // this.projectService.loading.next(false);

      return undefined;
    }
  }

  getWorld(id: string, worldId: string, callback: (world?: World) => any) {
    let q = this.db.doc(`Workflows/${id}/Worlds/${worldId}`);
    q.valueChanges().pipe(take(1)).subscribe((docs2) => {
      let docs_2 = this.syncWorld(docs2 as World);
      if (docs_2) {
        callback(docs_2);
      } else {
        callback(undefined);
      }
    });
  }

  finishSignUp(
    email: string,
    password: string,
    callback: (result: { status: boolean; msg: string }) => any
  ) {
    this.auth
      .createUserWithEmailAndPassword(email, password)
      .then(async (user) => {
        if (user.user) {
          await this.setUserInfoInitial(user.user);
        }
        callback({ status: true, msg: 'success' });
      })
      .catch((err: Error) => {
        callback({ status: false, msg: err.message });
      });
  }

  finishSignIn(
    email: string,
    password: string,
    callback: (result: { status: boolean; msg: string }) => any
  ) {
    this.auth
      .signInWithEmailAndPassword(email, password)
      .then((user) => {
        callback({ status: true, msg: 'success' });
      })
      .catch((err: Error) => {
        console.log(err);
        callback({ status: false, msg: err.message });
      });
  }

  loadedUser = new BehaviorSubject<Developer | undefined>(undefined);

  finishPassReset(
    email: string,
    callback: (result: { status: boolean; msg: string }) => any
  ) {}

  async openAuth(id: string) {
    await this.router.navigateByUrl(`/account?mode=${id}`);
  }

  async openDash(id: string) {
    await this.router.navigateByUrl(`/dashboard/${id}`);
  }

  async openHome() {
    await this.router.navigateByUrl(`/home`);
  }

  addDays(date: Date, days: number) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + days,
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    );
  }

  get currentUser() {
    return this.auth.authState.pipe(first()).toPromise();
  }

  async signOut(callback: (result: boolean) => any) {
    try {
      await this.auth.signOut();
      localStorage.removeItem('url');
      localStorage.removeItem('name');
      localStorage.removeItem('email');
      this.loadedUser.next(undefined);
      this.projectService.loadedModels.next({});
      this.projectService.loading.next(false);
      this.themeService.theme.next('light');
      this.projectService.workflow.next(undefined);
      this.designerService.initialized = false;
      await this.openAuth('0');
      callback(true);
    } catch (error) {
      callback(false);
    }
  }

  sendTestWebhook(webhook: string, type = 0, chain = 1, network = 'ethereum') {
    this.functions
      .httpsCallable('sendTestHook')({
        webhook,
        type,
        chain,
        network,
      })
      .pipe(first())
      .subscribe(
        async (resp) => {},
        (err) => {
          console.error({ err });
        }
      );
  }

  async publishSmartUtil(data: Executable) {
    this.projectService.loading.next(true);

    try {
      let id = data.id;

      let uploadData = JSON.parse(JSON.stringify(data));

      if (uploadData.downloads > 0) {
        delete uploadData.downloads;
      }

      uploadData.needsSync = true;

      await this.db.collection(`Workflows`).doc(id).set(uploadData);
      this.projectService.loading.next(false);

      return data;
    } catch (error) {
      console.log(error);
      this.projectService.loading.next(false);
      return undefined;
    }
  }

  async uploadImg(file: File, id: string) {
    this.projectService.loading.next(true);

    try {
      let ref = this.storage.ref(`workflows/${id}/icon-${id}.png`);
      await ref.put(file, { cacheControl: 'no-cache' });
      let displayUrl = await ref.getDownloadURL().toPromise();

      this.projectService.loading.next(false);

      return displayUrl;
    } catch (error) {
      console.log(error);
    }
    this.projectService.loading.next(false);
    return undefined;
  }

  async uploadCharacterImg(file: File, id: string, characterId: string) {
    try {
      let ref = this.storage.ref(`workflows/${id}/characters/${characterId}/${characterId}.png`);
      await ref.put(file, { cacheControl: 'no-cache' });
      let displayUrl = await ref.getDownloadURL().toPromise();

      return displayUrl;
    } catch (error) {
      console.log(error);
    }
    return undefined;
  }

  async uploadAssetImg(file: string, id: string, assetId: string) {
    try {
      let ref = this.storage.ref(`workflows/${id}/assets/${assetId}/${assetId}.png`);
      await ref.putString(file, "data_url", { cacheControl: 'no-cache' });
      let displayUrl = await ref.getDownloadURL().toPromise();

      return displayUrl;
    } catch (error) {
      console.log(error);
    }
    return undefined;
  }

  async uploadCharacterAsset(file: File, id: string, characterId: string) {

    try {
      let ref = this.storage.ref(`workflows/${id}/characters/${characterId}/${characterId}.glb`);
      await ref.put(file, { cacheControl: 'no-cache' });
      let displayUrl = await ref.getDownloadURL().toPromise();

      return displayUrl;
    } catch (error) {
      console.log(error);
    }
    return undefined;
  }

  async saveSmartUtil(data: Executable, clientId: string) {
    let id = data.id;

    let uid = (await this.currentUser)?.uid;
    this.projectService.loading.next(true);

    if (uid) {
      let scenes = data.sceneLayout.cells;

      await Promise.all(
        scenes.map(async (scene) => {
          if (scene.shape == 'scene-node') {
            await Promise.all(
              (scene.data.ngArguments.scene as Scene).images.map(
                async (image, index) => {
                  let ref = this.storage.ref(
                    `workflows/${id}/scenes/${scene.id}/img-${index}.png`
                  );
                  let im = image.replace(
                    'data:application/octet-stream;base64,',
                    ''
                  );
                  if (this.isBase64(im)) {
                    await ref.putString(im, 'base64', {
                      cacheControl: 'no-cache',
                    });
                    let displayUrl = await ref.getDownloadURL().toPromise();

                    scene.data.ngArguments.scene.images[index] = displayUrl;
                  }
                }
              )
            );
          }
        })
      );

      await this.saveLayout(data, clientId);

      let uploadData = JSON.parse(JSON.stringify(data));

      uploadData.search_name = uploadData.name?.toLowerCase();

      if (uploadData.downloads > 0) {
        delete uploadData.downloads;
      }

      if (uploadData.sceneLayout) {
        delete uploadData.sceneLayout;
      }

      try {
        await this.db
          .collection(`Workflows`)
          .doc(id)
          .set(uploadData, { merge: true });

        this.projectService.loading.next(false);

        return uploadData;
      } catch (error) {
        console.log(error);
        this.projectService.loading.next(false);

        return undefined;
      }
    } else {
      this.projectService.loading.next(false);

      return undefined;
    }
  }

  lastSync: number = 0;

  async saveLayout(data: Executable, clientId: string) {
    let id = data.id;

    let date = new Date().getTime();

    if (date - this.lastSync > 0) {
      this.lastSync = date;
      let uid = (await this.currentUser)?.uid;
      this.projectService.loading.next(true);

      if (uid) {
        let scenes = data.sceneLayout.cells;

        await Promise.all(
          scenes.map(async (scene) => {
            if (scene.shape == 'scene-node') {
              await Promise.all(
                (scene.data.ngArguments.scene as Scene).images.map(
                  async (image, index) => {
                    let ref = this.storage.ref(
                      `workflows/${id}/scenes/${scene.id}/img-${index}.png`
                    );
                    let im = image.replace(
                      'data:application/octet-stream;base64,',
                      ''
                    );
                    if (this.isBase64(im)) {
                      await ref.putString(im, 'base64', {
                        cacheControl: 'no-cache',
                      });
                      let displayUrl = await ref.getDownloadURL().toPromise();

                      scene.data.ngArguments.scene.images[index] = displayUrl;
                    }
                  }
                )
              );
            }
          })
        );

        let uploadData = JSON.parse(
          JSON.stringify({
            modified: date,
            layout: data.sceneLayout,
            uid: uid,
            clientId,
          })
        );

        try {
          await this.db
            .collection(`Workflows/${id}/Layouts`)
            .doc()
            .set(uploadData, { merge: true });

          this.projectService.loading.next(false);

          return data.sceneLayout;
        } catch (error) {
          console.log(error);
          this.projectService.loading.next(false);

          return undefined;
        }
      } else {
        this.projectService.loading.next(false);
      }
    }
    return undefined;
  }

  async saveUserInfo(
    data: Developer,
    imgFile: File,
    uploadImage: boolean,
    callback: (result?: Developer) => any
  ) {
    var dev = data;

    let uid = data.id;
    let url = data.url;
    let name = data.name;
    let email = data.email;
    let theme = data.theme;

    let search_name = name?.toLowerCase();

    if (uploadImage) {
      try {
        let ref = this.storage.ref(`users/${uid}/profile.png`);
        await ref.put(imgFile, { cacheControl: 'no-cache' });
        dev.url = await ref.getDownloadURL().toPromise();
      } catch (error) {
        callback(undefined);
      }
    }

    let userInfo = {
      uid,
      url: dev.url,
      name,
      email,
      search_name,
      theme,
    };

    try {
      await this.db.collection('Users').doc(uid).set(userInfo, { merge: true });

      localStorage['url'] = url;
      localStorage['name'] = name;
      localStorage['email'] = email;

      this.loadedUser.next(dev);

      callback(dev);
    } catch (error) {
      callback(undefined);
    }
  }

  async setUserInfoInitial(user: firebase.User) {
    let uid = user.uid;
    let email = user.email;

    let name = email?.split('@')[0].toUpperCase();
    let search_name = name?.toLowerCase();

    let joined = Math.floor(new Date().getTime());

    let url =
      'https://storage.googleapis.com/thred-protocol.appspot.com/resources/default_profile.png';

    let userRef = this.db.collection('Users').doc(uid);

    let data = {
      name,
      uid,
      email,
      joined,
      url,
      search_name,
    };

    return userRef.set(data);
  }

  filteredSearch: BehaviorSubject<any> = new BehaviorSubject([]);

  search(term: string) {
    let sub2 = this.db
      .collectionGroup(`workflows`, (ref) =>
        ref
          .where('search_name', '>=', term)
          .where('search_name', '<=', term + '\uf8ff')
          .limit(3)
      )
      .valueChanges()
      .subscribe((docs2) => {
        sub2.unsubscribe();
        let returnVal: any[] = [];

        (docs2 as Executable[])?.forEach((d: Executable) => {
          returnVal.push({
            name: d.name,
            type: 1,
            img: d.displayUrl,
            id: d.id,
          });
        });

        let sub3 = this.db
          .collectionGroup(`Users`, (ref) =>
            ref
              .where('search_name', '>=', term)
              .where('search_name', '<=', term + '\uf8ff')
              .limit(3)
          )
          .valueChanges()
          .subscribe((docs3) => {
            sub3.unsubscribe();
            (docs3 as any[])?.forEach((d: any) => {
              returnVal.push({
                name: d.name,
                type: 0,
                img: d.url,
                id: d.uid,
              });
            });
            this.filteredSearch.next(returnVal);
          });
      });
  }

  getWorkflow(
    id: string,
    callback: (result?: Executable) => any,
    getProfiles = false
  ) {
    let sub2 = this.db
      .collection(`Workflows`, (ref) => ref.where('id', '==', id))
      .valueChanges()
      .subscribe((docs2) => {
        let docs_2 = docs2 as any[];

        let d = docs_2[0];

        if (d) {
          let util = this.syncWorkflow(d);

          if (getProfiles) {
            this.getUserInfo(d.creatorId, false, false, (result) => {
              if (result) {
                util.creatorName = result.name;
              }
              callback(util);
            });
          } else {
            callback(util);
          }
        } else {
          callback(undefined);
        }
      });
  }

  getWorkflows(ids: string[], callback: (result?: Executable[]) => any) {
    let sub2 = this.db
      .collection(`Workflows`, (ref) => ref.where('id', 'in', ids))
      .get()
      .toPromise()
      .then((docs3) => {
        if (docs3) {
          let docs = docs3.docs.map((d) => d.data());

          let result: Executable[] = [];

          // docs.forEach((d) => {
          //   let util = this.syncWorkflow(d);
          //   util.layout = this.sampleFlow
          //   console.log(util)

          //   result.push(util);
          // });

          callback(result);
        }
      });
  }

  getModels(callback: (result: Dict<AIModelType>) => any) {
    try {
      this.db
        .collection('ModelTypes')
        .valueChanges()
        .subscribe((docs) => {
          let modelTypes = (docs as any[]) ?? [];

          let models: Dict<AIModelType> = {};

          modelTypes.forEach((model) => {
            models[model.id] = new AIModelType(model.name, model.id, {});
          });

          this.db
            .collection('Models', (ref) =>
              ref.where('status', '==', 0).orderBy('rank', 'asc')
            )
            .valueChanges()
            .subscribe((docs) => {
              let docs_2 = (docs as any[]) ?? [];

              docs_2.forEach((d) => {
                models[d.type].models[d.id] = new AIModel(
                  d.name,
                  d.id,
                  d.developer,
                  d.imgUrl,
                  d.type,
                  d.status,
                  d.description,
                  d.variations
                );
              });
              this.projectService.loadedModels.next(models);
              callback(models);
            });
        });
    } catch (error) {
      this.projectService.loadedModels.next({});
      callback({});
    }
  }

  // getPlans(callback: (result: Dict<Plan>) => any) {
  //   try {
  //     let models: Dict<Plan> = {};

  //     this.db
  //       .collection('Plans')
  //       .valueChanges()
  //       .subscribe((docs) => {
  //         let docs_2 = (docs as any[]) ?? [];

  //         docs_2.forEach((d) => {
  //           models[d.id] = new Plan(
  //             d.name,
  //             d.id,
  //             d.requests,
  //             d.overageUnit,
  //             d.overagePriceCents,
  //             d.flatPriceCents,
  //             d.backgroundColor
  //           );
  //         });
  //         this.loadedPlans.next(models);
  //         callback(models);
  //       });
  //   } catch (error) {
  //     this.loadedPlans.next({});
  //     callback({});
  //   }
  // }

  getNewWorkflows(callback: (result: Executable[]) => any) {
    this.db
      .collectionGroup('Workflows', (ref) =>
        ref.where('status', '==', 0).orderBy('created', 'desc')
      )
      .valueChanges()
      .subscribe((docs) => {
        let docs_2 = (docs as any[]) ?? [];
        callback(docs_2);
      });
  }

  getPopularWorkflows(callback: (result: Executable[]) => any) {
    this.db
      .collectionGroup('Workflows', (ref) =>
        ref.where('status', '==', 0).orderBy('views', 'desc')
      )
      .valueChanges()
      .subscribe((docs) => {
        let docs_2 = (docs as any[]) ?? [];
        callback(docs_2);
      });
  }

  get newUtilID() {
    return this.db.createId();
  }

  getFeaturedWorkflow(callback: (result?: Executable) => any) {
    let sub2 = this.db
      .collectionGroup(`Engage`)
      .valueChanges()
      .subscribe((docs2) => {
        sub2.unsubscribe();

        let docs_2 = docs2 as any[];

        let d = docs_2[0];

        if (d) {
          let featured = d['Featured'] as string;
          this.getWorkflow(
            featured,
            (result) => {
              callback(result);
            },
            true
          );
        } else {
          callback(undefined);
        }
      });
  }

  getUserInfo(
    uid: string,
    fetchworkflows = true,
    fetchOnlyAvailableworkflows = true,
    callback: (result?: Developer) => any
  ): void {
    var query = this.db.collection('Users', (ref) =>
      ref.where(firebase.firestore.FieldPath.documentId(), '==', uid)
    );

    query.valueChanges().subscribe(async (docs) => {
      let doc = docs[0] as DocumentData;

      if (doc) {
        let name = doc['name'] as string;
        let email = doc['email'] as string;
        let joined = doc['joined'] as number;
        let uid = doc['uid'] as string;
        let url = doc['url'] as string;
        let theme = doc['theme'] as 'light' | 'dark' | 'auto' | undefined;
        let myUID = (await this.currentUser)?.uid;
        if (isPlatformBrowser(this.platformID) && uid == myUID) {
          localStorage['url'] = url;
          localStorage['name'] = name;
          localStorage['email'] = email;
        }
        let developer = new Developer(name, uid, joined, url, email, [], theme);

        // this.checkLoadedUser(developer);

        if (fetchworkflows) {
          let q = this.db.collection(`Workflows`);

          if (fetchOnlyAvailableworkflows) {
            q = this.db.collection(`Workflows`, (ref) =>
              ref
                .where('status', '==', 0)
                .where('creatorId', '==', uid)
                .orderBy('created', 'asc')
            );
          }

          let s = q.valueChanges().subscribe((docs2) => {
            if (this.loadedUser.value) {
              developer = this.loadedUser.value;
            }
            let docs_2 = (docs2 as Executable[]).map((workflow) => {
              // workflow.layout = this.sampleFlow
              return this.syncWorkflow(workflow);
            });

            developer.utils = docs_2;

            this.checkLoadedUser(developer);

            callback(developer);
            s.unsubscribe();
          });
        } else {
          callback(developer);
        }
      } else {
        this.checkLoadedUser(null);
        callback(undefined);
      }
    });
  }

  projectSub?: Subscription;

  getLayout(
    id: string,
    clientId: string,
    callback: (layout?: SceneLayout) => any
  ) {
    this.projectSub?.unsubscribe();
    let q = this.db.collection(`Workflows/${id}/Layouts`, (ref) =>
      ref.orderBy('modified', 'desc').limit(1)
    );
    this.projectSub = q.valueChanges().subscribe((docs2) => {
      let docs_2 = (
        docs2 as {
          modified: number;
          layout: SceneLayout;
          uid: string;
          clientId: string;
        }[]
      )[0];
      if (docs_2 && docs_2.layout) {
        if (docs_2.clientId != clientId) {
          docs_2.layout.cells.forEach((cell) => {
            if (cell.data?.ngArguments?.scene) {
              cell.data.ngArguments.scene = this.syncScene(
                cell.data.ngArguments.scene
              );
            }
          });
          callback(docs_2.layout);
        }
      } else {
        callback(undefined);
      }
    });
  }

  async updateBlockImage(id: string, imgId: string, file?: File) {
    if (file) {
      try {
        let ref = this.storage.ref(`workflows/${id}/img-${imgId}.png`);

        await ref.put(file, { cacheControl: 'no-cache' });
        let displayUrl = await ref.getDownloadURL().toPromise();
        return displayUrl as string;
      } catch (error) {
        console.log(error);
        return undefined;
      }
    } else {
      try {
        // let ref = this.storage.ref(`workflows/${id}/img-${imgId}.png`);

        // await ref.delete().toPromise();
        return undefined;
      } catch (error) {
        return undefined;
      }
    }
  }

  async updateAppImage(id: string, imgId: string, file?: File) {
    this.projectService.loading.next(true);

    if (file) {
      try {
        let ref = this.storage.ref(`workflows/${id}/app-${imgId}.png`);

        await ref.put(file, { cacheControl: 'no-cache' });
        let displayUrl = await ref.getDownloadURL().toPromise();
        this.projectService.loading.next(false);

        return displayUrl as string;
      } catch (error) {
        console.log(error);
      }
    }
    this.projectService.loading.next(false);

    return undefined;
  }

  iconUrlForController(componentType: string, type: string) {
    switch (componentType) {
      //@ts-ignore
      case 'task':
        switch (type) {
          default:
            let id2 = type.split('-')[1];
            if (id2) {
              let same =
                this.projectService.loadedModels.value[id2].models[type];
              if (same) {
                return same.imgUrl;
              }
            }
        }
      default:
        return `assets/${type}.png`;
    }
  }

  async getExecutable(id: string) {
    let url = await new Promise<Executable | undefined>((resolve, reject) => {
      this.functions
        .httpsCallable('getExecutable')({ id })
        .pipe(first())
        .subscribe(
          async (resp) => {
            resolve(resp);
          },
          (err) => {
            console.error({ err });
            resolve(undefined);
          }
        );
    });
    return url;
  }

  async saveCode(id: string, uid: string, codeId: string, file: Executable) {
    this.projectService.loading.next(true);

    // await this.db
    //   .collection(`Users/${uid}/workflows/${id}/source`)
    //   .doc(codeId)
    //   .set(file.agents[codeId]);

    this.projectService.loading.next(false);
  }

  async getCode(
    app: Executable,
    uid: string,
    callback: (file: Executable) => any
  ) {
    this.projectService.loading.next(true);

    // this.db
    //   .collection(`Users/${uid}/workflows/${app.id}/source`)
    //   .valueChanges()
    //   .subscribe((docs) => {
    //     var exec = new Executable(app.name, app.id);

    //     docs.forEach((d) => {
    //       const docData = d as Agent;
    //       exec.agents[docData.id] = docData
    //     });

    //     console.log(exec)
    //     callback(exec)
    //   });

    this.projectService.loading.next(false);
  }

  async uploadExecutable(id: string, file: Executable) {
    this.projectService.loading.next(true);

    var uploadData = JSON.parse(JSON.stringify(file));

    let url = await new Promise<string | undefined>((resolve, reject) => {
      this.functions
        .httpsCallable('uploadExecutable')({ id, uploadData })
        .pipe(first())
        .subscribe(
          async (resp) => {
            resolve(resp);
          },
          (err) => {
            console.error({ err });
            resolve(undefined);
          }
        );
    });

    this.projectService.loading.next(false);

    return url;
  }

  getIcons(callback: (data: any) => any) {
    this.functions
      .httpsCallable('retrieveIcons')({})
      .pipe(first())
      .subscribe(
        async (resp) => {
          callback(resp);
        },
        (err) => {
          console.error({ err });
          callback([]);
        }
      );
  }

  testAPI(
    id: string,
    stepId: string,
    input: any,
    sessionId: string,
    callback: (data: any) => any
  ) {
    this.functions
      .httpsCallable('apiTest')({ id, input, stepId, sessionId })
      .pipe(first())
      .subscribe(
        async (resp) => {
          callback(resp);
        },
        (err) => {
          console.error({ err });
          callback('');
        }
      );
  }

  async checkLoadedUser(user: Developer | null) {
    let uid = (await this.currentUser)?.uid;

    if (uid && (!user || uid == user.id)) {
      this.loadedUser.next(user ?? undefined);
    }
  }

  async logView(productId: string, uid: string) {
    if (uid && isPlatformBrowser(this.platformID)) {
      let coords = (await this.getCoords()) ?? this.defaultCoords;
      this.updateView(uid, coords, productId);
    }
  }

  updateView(uid: string, location: any, docId: string) {
    // const time = new Date();
    // const docName =
    //   String(time.getFullYear()) +
    //   String(time.getMonth()) +
    //   String(time.getDate()) +
    //   String(time.getHours());
    // return this.db
    //   .collection('Users/' + uid + '/Daily_Info')
    //   .doc(`V${docName}`)
    //   .set(
    //     {
    //       time: firebase.firestore.FieldValue.arrayUnion({
    //         time,
    //         docId,
    //         coords: location.coords,
    //         address: location.address,
    //       }),
    //       timestamp: time,
    //       type: 'VIEW',
    //     },
    //     { merge: true }
    //   );
  }

  getMiscStats(
    uid: string,
    date1: Date,
    date2: Date,
    callback: (views?: Dict<any>[]) => any
  ) {
    // var views: Dict<any>[] = [];
    // let sub = this.db
    //   .collection('Users/' + uid + '/Daily_Info/', (ref) =>
    //     ref
    //       .where('timestamp', '>=', date1)
    //       .where('timestamp', '<=', new Date(date2.setHours(23, 59, 59, 999)))
    //   )
    //   .valueChanges()
    //   .subscribe((docDatas) => {
    //     docDatas.forEach((doc, index) => {
    //       const docData = doc as DocumentData;
    //       if (docData) {
    //         let time = docData['time'] as Array<any>;
    //         let type = docData['type'] as string;
    //         time.forEach((t) => {
    //           let p =
    //             t instanceof firebase.firestore.Timestamp
    //               ? (t as firebase.firestore.Timestamp).toDate()
    //               : (t.time as firebase.firestore.Timestamp).toDate();
    //           let v =
    //             t instanceof firebase.firestore.Timestamp
    //               ? this.defaultCoords.coords
    //               : t.coords;
    //           let address =
    //             t instanceof firebase.firestore.Timestamp
    //               ? this.defaultCoords.address
    //               : t.address;
    //           let docId =
    //             t instanceof firebase.firestore.Timestamp ? undefined : t.docId;
    //           views?.push({
    //             num: 1,
    //             coords: v,
    //             address,
    //             docId,
    //             type,
    //             timestamp: p,
    //           });
    //         });
    //       }
    //     });
    //     callback(views);
    //     if (isPlatformBrowser(this.platformID)) sub.unsubscribe();
    //   });
  }

  async getCoords() {
    let value = (await this.http
      .get('https://api.ipify.org/?format=json')
      .toPromise()) as Dict<any>;

    let url = `https://api.ipstack.com/${value['ip']}?access_key=5b5f96aced42e6b1c95ab24d96f704c5`;
    let resp = (await this.http.get(url).toPromise()) as Dict<any>;
    let address = {
      city: resp['city'],
      country: resp['country_name'],
      country_code: resp['country_code'],
      region: resp['region_name'],
      region_code: resp['region_code'],
    };
    let coords = {
      LATITUDE: resp['latitude'],
      LONGITUDE: resp['longitude'],
    };
    return {
      coords,
      address,
    };
  }

  addTags(title: string, imgUrl: string, description: string, url: string) {
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:image', content: imgUrl });
    this.metaService.updateTag({
      property: 'og:image:secure_url',
      content: imgUrl,
    });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({
      property: 'og:description',
      content: description,
    });
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    // this.metaService.removeTag("name='robots'");
    // this.metaService.removeTag("name='googlebot'");
  }

  async changeLayout(
    layout: any,
    workflow: Executable,
    step = 1,
    callback: (layout: any) => any
  ) {
    try {
      if (workflow && layout) {
        var data = {
          layoutType: layout.type,
          step,
          layoutId: layout.id,
          workflowId: workflow.id,
        };

        if (data) {
          this.functions
            .httpsCallable('editLayouts')(data)
            .pipe(first())
            .subscribe(
              async (newLayout) => {
                callback(newLayout ?? layout);
              },
              (err) => {
                console.error({ err });
                callback(layout);
              }
            );
        } else {
          callback(layout);
        }
      }
    } catch (error) {
      console.log(error);
      callback(layout);
    }
  }

  async addLayout(
    layout: any,
    workflow: Executable,
    callback: (layout: any) => any
  ) {
    try {
      if (workflow && layout) {
        var data = {
          layout: JSON.parse(JSON.stringify(layout)),
          workflowId: workflow.id,
        };

        if (data) {
          this.functions
            .httpsCallable('saveLayouts')(data)
            .pipe(first())
            .subscribe(
              async (newLayout) => {
                callback(newLayout ?? layout);
              },
              (err) => {
                console.error({ err });
                callback(layout);
              }
            );
        } else {
          callback(layout);
        }
      }
    } catch (error) {
      console.log(error);
      callback(layout);
    }
  }

  isBase64(str: string) {
    try {
      return btoa(atob(str)) == str;
    } catch (err) {
      return false;
    }
  }

  registerPlan(
    planId: string,
    modelId: string,
    callback: (result: string, needsBilling: boolean) => any
  ) {
    this.functions
      .httpsCallable('registerPlan')({ planId, modelId })
      .pipe(first())
      .subscribe(
        async (result) => {
          callback(result.data, result.needsBilling);
        },
        (err) => {
          console.error({ err });
          callback('', false);
        }
      );
  }

  getBilling(callback: (result: any) => any) {
    this.functions
      .httpsCallable('getBilling')({})
      .pipe(first())
      .subscribe(
        async (result) => {
          callback(result);
        },
        (err) => {
          console.error({ err });
          callback(null);
        }
      );
  }

  async addPaymentMethod(id: string) {
    let uid = (await this.currentUser)?.uid;
    if (uid) {
      await this.db
        .doc(`Users/${uid}/docs/billing`)
        .set({ pm: id }, { merge: true });
    }
  }

  syncWorkflow(workflow: any) {
    return new Executable(
      workflow.id,
      workflow.creatorId,
      workflow.created,
      workflow.modified,
      workflow.creatorName,
      workflow.displayUrl,
      workflow.name,
      workflow.rating,
      workflow.downloads,
      workflow.status,
      workflow.installWebhook,
      workflow.whitelist,
      workflow.sceneLayout,
      workflow.characters,
      workflow.assets,
      workflow.tracking,
      workflow.url,
      workflow.apiKey,
      workflow.plan,
      workflow.executableUrl
    );
  }

  syncScene(scene: any) {
    return new Scene(
      scene.id,
      scene.name,
      scene.description,
      scene.images,
      scene.notes,
      scene.type,
      scene.characters,
      scene.assets,
      this.syncWorld(scene.world)
    );
  }

  syncWorld(world: any) {
    if (world) {
      return new World(
        world.id,
        world.size,
        world.lightingIntensity,
        world.sky,
        world.ground
      );
    } else {
      return undefined;
    }
  }

}
