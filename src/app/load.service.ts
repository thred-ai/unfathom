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
import { ThemeService } from './theme.service';
import { ProjectService } from './project.service';
import { World } from './models/workflow/world.model';
import { ModelAsset } from './models/workflow/model-asset.model';
import { DesignService } from './design.service';
import { Material } from './models/workflow/material.model';

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
    private projectService: ProjectService,
    private designService: DesignService
  ) {
    this.projectService.saveWorkflow.subscribe(async (world) => {
      if (world) {
        this.projectService.workflow.next(world);

        console.log(world);
        let result = await this.saveSmartUtil(world);

        if (result) {
        }
      }
    });
  }

  // .bg-theme{
  //   background-color: #1F1F1F;
  // }

  // .secondary-background {
  //   background-color: #151515;
  // }

  confirmDelete() {
    return confirm('Are you sure you want to delete this component?');
  }

  newWorld() {
    if (this.loadedUser.value.id) {
      let world = new World(
        this.loadedUser.value.id,
        this.newUtilID,
        'My New Design'
      );
      return world;
    }
    return undefined;
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
  loadedProducts = new BehaviorSubject<World[]>([]);

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
      this.projectService.loading.next(false);
      this.themeService.theme.next('light');
      this.projectService.workflow.next(undefined);
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

  async publishSmartUtil(data: World) {
    this.projectService.loading.next(true);

    try {
      let id = data.id;

      let uploadData = JSON.parse(JSON.stringify(data));

      console.log(uploadData);

      if (uploadData.downloads > 0) {
        delete uploadData.downloads;
      }

      uploadData.needsSync = true;

      await this.db.collection(`Worlds`).doc(id).set(uploadData);
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
      let ref = this.storage.ref(`worlds/${id}/icon-${id}.png`);
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
    this.projectService.loading.next(true);
    try {
      let ref = this.storage.ref(
        `worlds/${id}/characters/${characterId}/${characterId}.png`
      );
      await ref.put(file, { cacheControl: 'no-cache' });
      let displayUrl = await ref.getDownloadURL().toPromise();

      return displayUrl;
    } catch (error) {
      console.log(error);
    }
    this.projectService.loading.next(false);
    return undefined;
  }

  async uploadAssetImg(file: string, id: string, assetId: string) {
    this.projectService.loading.next(true);
    try {
      let ref = this.storage.ref(
        `worlds/${id}/assets/${assetId}/${assetId}.png`
      );
      await ref.putString(file, 'data_url', { cacheControl: 'no-cache' });
      let displayUrl = await ref.getDownloadURL().toPromise();

      return displayUrl;
    } catch (error) {
      console.log(error);
    }
    this.projectService.loading.next(false);
    return undefined;
  }

  async uploadCharacterAsset(file: File, id: string, characterId: string) {
    this.projectService.loading.next(true);
    try {
      let ref = this.storage.ref(
        `worlds/${id}/characters/${characterId}/${characterId}.glb`
      );
      await ref.put(file, { cacheControl: 'no-cache' });
      let displayUrl = await ref.getDownloadURL().toPromise();

      return displayUrl;
    } catch (error) {
      console.log(error);
    }
    this.projectService.loading.next(false);
    return undefined;
  }

  async saveSmartUtil(data: World) {
    let id = data.id;

    let uid = (await this.currentUser)?.uid;
    this.projectService.loading.next(true);

    if (uid) {
      console.log(data);

      let uploadData = JSON.parse(JSON.stringify(data));

      // if (this.isBase64(data.img)) {
      //   delete uploadData.img
      //   let ref = `worlds/${id}/display.png`;
      //   this.saveImgStringSync(data.img, ref, async (url) => {
      //     if (url && id) {
      //       let d = { img: url };
      //       await this.db.collection(`Worlds`).doc(id).update(d);
      //     }
      //   });

      // }

      uploadData.search_name = uploadData.name?.toLowerCase();
      console.log('STARTING SAVE');

      try {
        await this.db
          .collection(`Worlds`)
          .doc(id)
          .set(uploadData, { merge: false });

        this.projectService.loading.next(false);

        console.log('SAVED');
        console.log(uploadData);

        return uploadData;
      } catch (error) {
        console.log('FAILED SAVE');
        console.log(error);
        this.projectService.loading.next(false);

        return undefined;
      }
    } else {
      this.projectService.loading.next(false);

      return undefined;
    }
  }

  async updateName(data: World) {
    let id = data.id;

    let uid = (await this.currentUser)?.uid;

    if (uid) {
      console.log(data);

      let uploadData = {
        name: data.name,
        search_name: data.name.toLowerCase(),
      };

      try {
        await this.db.collection(`Worlds`).doc(id).update(uploadData);
      } catch (error) {
        console.log('FAILED SAVE');
      }
    }
  }

  lastSync: number = 0;

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

  async saveImg(file: File, path: string) {
    try {
      let ref = this.storage.ref(path);
      await ref.put(file, { cacheControl: 'no-cache' });
      return ref.getDownloadURL().toPromise();
    } catch (error) {
      return undefined;
    }
  }

  async saveImgString(img: string, path: string) {
    try {
      let ref = this.storage.ref(path);
      await ref.putString(img, 'data_url', { cacheControl: 'no-cache' });
      return ref.getDownloadURL().toPromise();
    } catch (error) {
      return undefined;
    }
  }

  saveImgStringSync(
    img: string,
    path: string,
    callback: (url?: string) => any
  ) {
    let ref = this.storage.ref(path);
    ref
      .putString(img, 'data_url', { cacheControl: 'no-cache' })
      .then(async (result) => {
        let url = await result.ref.getDownloadURL();
        callback(url);
      })
      .catch((error) => {
        callback(undefined);
      });
    // ref.getDownloadURL().toPromise();
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

  getWorlds(ids: string[], callback: (result?: World[]) => any) {
    let sub2 = this.db
      .collection(`Worlds`, (ref) => ref.where('id', 'in', ids))
      .get()
      .toPromise()
      .then((docs3) => {
        if (docs3) {
          let docs = docs3.docs.map((d) => d.data());

          let result: World[] = [];

          // docs.forEach((d) => {
          //   let util = this.syncWorld(d);
          //   util.layout = this.sampleFlow
          //   console.log(util)

          //   result.push(util);
          // });

          callback(result);
        }
      });
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

  get newUtilID() {
    return this.db.createId();
  }

  getModels(
    callback: (models: ModelAsset[]) => any,
    uid: string = this.loadedUser.value?.id
  ) {
    // var query = this.db.collection('Elements')
    var query = this.db.collection('Users').doc(uid).collection('Models');

    query.valueChanges().subscribe(async (docs) => {
      let models =
        docs.map((d) => new ModelAsset(d['name'], d['id'], d['assetUrl'])) ??
        [];

      callback(models);
    });
  }

  async saveModels(model: ModelAsset, uid: string = this.loadedUser.value?.id) {
    var query = this.db
      .collection('Users')
      .doc(uid)
      .collection('Models')
      .doc(model.id);

    // var query = this.db.collection('Elements')
    // .doc(model.id);

    await query.set(JSON.parse(JSON.stringify(model)), { merge: true });
  }

  async saveElements(model: ModelAsset) {
    var query = this.db.collection('Elements').doc(model.id);

    await query.set(JSON.parse(JSON.stringify(model)), { merge: true });
  }

  async saveMaterials(material: Material) {
    var query = this.db.collection('Materials').doc(material.id);

    await query.set(JSON.parse(JSON.stringify(material)), { merge: true });
  }

  getElements(callback: (models: ModelAsset[]) => any) {
    var query = this.db.collection('Elements');

    query.valueChanges().subscribe(async (docs) => {
      let models =
        docs.map(
          (d) =>
            new ModelAsset(
              d['name'],
              d['id'],
              d['assetUrl'],
              d['img'],
              d['metadata']
            )
        ) ?? [];
      callback(models);
    });
  }

  getUserInfo(
    uid: string,
    fetchworlds = true,
    fetchOnlyAvailableworlds = true,
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
        let developer = new Developer(name, uid, joined, url, email, theme);

        // this.checkLoadedUser(developer);

        this.checkLoadedUser(developer);
        callback(developer);
      } else {
        this.checkLoadedUser(null);
        callback(undefined);
      }
    });
  }

  fetchWorlds(uid: string, worldIds: string[] = [], fetchOnce = true) {
    console.log(uid);
    let q = this.db.collection(`Worlds`, (ref) =>
      ref
        .where('status', '==', 0)
        .where('uid', '==', uid)
        .orderBy('created', 'asc')
    );

    if (worldIds.length > 0) {
      //   q = this.db.collection(`Worlds`, (ref) =>
      //   ref
      //     .where('status', '==', 0)
      //     .where('uid', '==', uid)
      //     .where
      //     .orderBy('created', 'asc')
      // );
    }

    let s = q.valueChanges().subscribe((docs2) => {
      let docs_2 = (docs2 as World[]).map((world) => {
        // world.layout = this.sampleFlow
        return this.syncWorld(world);
      });

      console.log(docs_2);
      console.log(docs2);

      this.loadedProducts.next(docs_2);

      if (fetchOnce) {
        s.unsubscribe();
      }
    });
  }

  projectSub?: Subscription;

  async updateBlockImage(id: string, imgId: string, file?: File) {
    if (file) {
      try {
        let ref = this.storage.ref(`worlds/${id}/img-${imgId}.png`);

        await ref.put(file, { cacheControl: 'no-cache' });
        let displayUrl = await ref.getDownloadURL().toPromise();
        return displayUrl as string;
      } catch (error) {
        console.log(error);
        return undefined;
      }
    } else {
      try {
        // let ref = this.storage.ref(`worlds/${id}/img-${imgId}.png`);

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
        let ref = this.storage.ref(`worlds/${id}/app-${imgId}.png`);

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

  async getWorld(id: string) {
    let url = await new Promise<World | undefined>((resolve, reject) => {
      this.functions
        .httpsCallable('getWorld')({ id })
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

  async generateScene(sceneId: string, worldId: string, prompt: string) {
    let world = await new Promise<World | undefined>((resolve, reject) => {
      this.functions
        .httpsCallable('generateScene', { timeout: 180000 })({
          sceneId,
          worldId,
          input: prompt,
        })
        .pipe(first())
        .subscribe(
          async (resp) => {
            console.log(resp as World);
            resolve(resp);
          },
          (err) => {
            console.error({ err });
            resolve(undefined);
          }
        );
    });
    return world;
  }

  async saveCode(id: string, uid: string, codeId: string, file: World) {
    this.projectService.loading.next(true);

    // await this.db
    //   .collection(`Users/${uid}/worlds/${id}/source`)
    //   .doc(codeId)
    //   .set(file.agents[codeId]);

    this.projectService.loading.next(false);
  }

  async getCode(app: World, uid: string, callback: (file: World) => any) {
    this.projectService.loading.next(true);

    // this.db
    //   .collection(`Users/${uid}/worlds/${app.id}/source`)
    //   .valueChanges()
    //   .subscribe((docs) => {
    //     var exec = new World(app.name, app.id);

    //     docs.forEach((d) => {
    //       const docData = d as Agent;
    //       exec.agents[docData.id] = docData
    //     });

    //     console.log(exec)
    //     callback(exec)
    //   });

    this.projectService.loading.next(false);
  }

  async uploadWorld(id: string, file: World) {
    this.projectService.loading.next(true);

    var uploadData = JSON.parse(JSON.stringify(file));

    let url = await new Promise<string | undefined>((resolve, reject) => {
      this.functions
        .httpsCallable('uploadWorld')({ id, uploadData })
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
    world: World,
    step = 1,
    callback: (layout: any) => any
  ) {
    try {
      if (world && layout) {
        var data = {
          layoutType: layout.type,
          step,
          layoutId: layout.id,
          worldId: world.id,
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

  async addLayout(layout: any, world: World, callback: (layout: any) => any) {
    try {
      if (world && layout) {
        var data = {
          layout: JSON.parse(JSON.stringify(layout)),
          worldId: world.id,
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

  syncWorld(world: any) {
    return new World(
      world.uid,
      world.id,
      world.name,
      world.width,
      world.height,
      world.characters,
      world.assets,
      world.lightingIntensity,
      world.created,
      world.modified,
      world.sky,
      world.ground,
      world.status,
      world.locked,
      world.img
    );
  }

  worldSub?: Subscription;

  getPrototype(worldId: string, callback: (exec: World) => any) {
    let q = this.db.collection(`Worlds`).doc(worldId);

    console.log(worldId);
    this.worldSub = q.valueChanges().subscribe((docs2) => {
      let w = this.syncWorld(docs2);
      callback(w);
    });
  }

  reset() {
    this.worldSub?.unsubscribe();
    this.loadedUser.next(undefined);
    this.loadedProducts.next([]);
    this.designService.deinit();
  }
}
