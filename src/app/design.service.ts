import { Injectable } from '@angular/core';
import { CharacterController } from 'babylonjs-charactercontroller';
import {
  GLTFFileLoader,
  GLTFLoaderAnimationStartMode,
} from 'babylonjs-loaders';
import { LiquidType } from './models/workflow/liquid-type.enum';
import { World } from './models/workflow/world.model';
import * as BABYLON from 'babylonjs';
import * as MATERIALS from 'babylonjs-materials';
import { BehaviorSubject } from 'rxjs';
import { Texture } from './models/workflow/texture.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ProjectService } from './project.service';
import { EmulatorService } from './emulator.service';
import { SceneAsset } from './models/workflow/scene-asset.model';
import { AnimatedGifTexture } from './babylon-extenstions/animatedGifTexture';
import { ModelAsset } from './models/workflow/model-asset.model';
import * as SERIALIZERS from 'babylonjs-serializers';

@Injectable({
  providedIn: 'root',
})
export class DesignService {
  world?: World;

  engine?: BABYLON.Engine;

  gizmoManager?: BABYLON.GizmoManager;

  loaded = new BehaviorSubject<string>('');

  selected = new BehaviorSubject<string | undefined>(undefined);

  assets: BABYLON.Mesh[] = [];

  constructor(
    private db: AngularFirestore,
    private projectService: ProjectService,
    private emulatorService: EmulatorService
  ) {
    projectService.workflow.subscribe((w) => {
      if (w) {
        this.world = w;
        this.syncMeshIncoming();
      } else {
        this.deinit();
      }
    });
  }

  init(world: World = this.world) {
    this.deinit();

    this.world = world;

    if (this.world) {
      if (this.world) {
        this.initWorld();
      } else {
      }
    }
  }

  async initWorld() {
    var canvas = document.getElementById('canvas') as HTMLCanvasElement;

    // Check support
    if (!BABYLON.Engine.isSupported()) {
      window.alert('Browser not supported');
    } else if (canvas && this.world && this.world) {
      // Babylon
      this.engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
      });

      //Creating scene
      await this.createScene2(this.engine, this.world);

      // Resize
      window.addEventListener('resize', () => {
        this.resize();
      });
    }
  }

  resize() {
    this.engine?.resize();
  }

  async addMeshToScene(asset: SceneAsset) {
    if (!this.world.locked) {
      let newAsset = await this.importMeshToScene(
        asset,
        this.engine?.scenes[0]
      );

      this.world.assets.push(newAsset);

      console.log('moi');
      this.save();

      setTimeout(() => {
        let mesh = this.engine.scenes[0]?.getMeshById(asset.asset.id);

        // if (mesh) {
        //   this.engine.scenes[0]?.onPointerDown(
        //     {} as any,
        //     { pickedMesh: mesh } as any,
        //     BABYLON.PointerEventTypes.POINTERDOWN
        //   );
        // }
      }, 1000);
    }
  }

  async createScene2(engine: BABYLON.Engine, world: World) {
    var scene = new BABYLON.Scene(engine);

    // const gl = new BABYLON.GlowLayer('glow', scene);

    const gl = new BABYLON.GlowLayer('glow', scene);
    gl.intensity = 0.5;

    var camera = new BABYLON.ArcRotateCamera(
      'Camera',
      0,
      0,
      10,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.setPosition(new BABYLON.Vector3(0, (world.height * 2) / 4, 0));

    camera.maxZ = this.world!.width * 2;

    var skybox: BABYLON.Mesh | undefined;

    if (world.sky && !world.sky.hidden) {
      skybox = BABYLON.MeshBuilder.CreateSphere(
        'sky',
        {
          diameterX: world.width * 2,
          diameterZ: world.height * 2,
          diameterY: world.height * 2,
        },
        scene
      );

      skybox.isPickable = true;

      skybox.scaling = new BABYLON.Vector3(-1, -1, -1);

      const material = new BABYLON.StandardMaterial('world', scene);

      if (world.sky.texture.emissive) {
        const texture = new BABYLON.Texture(world.sky.texture.emissive, scene);

        texture.uScale = 1;
        texture.vScale = 1;

        material.emissiveTexture = texture;
        material.backFaceCulling = false;
        skybox.material = material;
      }
    }

    if (world.ground && !world.ground.hidden) {
      let ground = this.createGround(world, scene);

      // this.doDownloadMesh("mesh", ground)

      var extraGround = BABYLON.Mesh.CreateGround(
        'extraGround',
        world.width * 2,
        world.height * 2,
        1,
        scene,
        false
      );

      extraGround.isPickable = true;

      var extraGroundMaterial = new BABYLON.StandardMaterial(
        'extraGround',
        scene
      );

      extraGroundMaterial.alpha = 0.0;

      // if (world.ground.texture.diffuse) {
      //   extraGroundMaterial.diffuseTexture = new BABYLON.Texture(
      //     world.ground.texture.diffuse,
      //     scene
      //   );
      // }

      extraGround.position.y = -2.05;

      extraGround.material = extraGroundMaterial;

      // this.addLiquids(world, scene, [skybox], [ground, extraGround]);
    }

    // .id == 'TgSTaxx8MZ1PFXVhS8V4'
    //   ? 'assets/mustafarav2.glb'
    //   : 'assets/sandyav.glb';

    //https://models.readyplayer.me/64fad33c902030ca061803ad.glb

    var light = new BABYLON.DirectionalLight(
      'directionalLight',
      new BABYLON.Vector3(-1, -2, 1),
      scene
    );

    light.intensity = world.lightingIntensity; //0.2;

    await Promise.all(
      world.assets.map(async (asset) => {
        this.loaded.next(`Downloading "${asset.asset.name}"`);
        await this.importMeshToScene(asset, scene);
      })
    );

    this.hl = new BABYLON.HighlightLayer('hl1', scene);

    this.hl?.addExcludedMesh(extraGround);

    this.gizmoManager = new BABYLON.GizmoManager(scene);
    this.gizmoManager.boundingBoxGizmoEnabled = true;
    this.gizmoManager.rotationGizmoEnabled = true;
    this.gizmoManager.scaleGizmoEnabled = true;
    this.gizmoManager.positionGizmoEnabled = true;

    // this.gizmoManager.boundingBoxDragBehavior.init()

    this.gizmoManager.gizmos.boundingBoxGizmo.onScaleBoxDragEndObservable.add(
      () => {
        this.updateGizmoSize();
        this.syncMesh();
      }
    );

    this.gizmoManager.gizmos.boundingBoxGizmo.onRotationSphereDragEndObservable.add(
      () => {
        this.syncMesh();
      }
    );

    this.gizmoManager.boundingBoxDragBehavior.onPositionChangedObservable.add(
      () => {
        if (
          !this.gizmoManager.boundingBoxDragBehavior?.onDragEndObservable.hasObservers()
        ) {
          this.gizmoManager.boundingBoxDragBehavior?.onDragEndObservable.add(
            () => {
              console.log('elo');
              this.syncMesh();
            }
          );
        }
      }
    );

    this.gizmoManager.gizmos.positionGizmo.onDragEndObservable.add(() => {
      this.syncMesh();
    });

    this.gizmoManager.gizmos.rotationGizmo.onDragEndObservable.add(() => {
      this.syncMesh();
    });

    this.gizmoManager.gizmos.scaleGizmo.onDragEndObservable.add(() => {
      this.syncMesh();
    });

    // this.gizmoManager.gizmos.positionGizmo.xGizmo.dragBehavior.onDragEndObservable.add(
    //   (event) => {}
    // );

    // this.gizmoManager.gizmos.rotationGizmo.onDragEndObservable.add(
    //   (event) => {}
    // );

    // this.gizmoManager.gizmos.scaleGizmo.onDragEndObservable.add((event) => {});

    this.selectTool('box');

    // gizmoManager.rotationGizmoEnabled = true;
    // gizmoManager.scaleGizmoEnabled = true;
    this.gizmoManager.usePointerToAttachGizmos = false;
    // gizmoManager.boundingBoxGizmoEnabled = true;

    scene.onPointerDown = (evt, pickResult) => {
      // We try to pick an object
      var object = pickResult.pickedMesh as BABYLON.Mesh;

      if (this.hl) {
        this.hl?.removeAllMeshes();
        this.gizmoManager.attachToMesh(null);
        if (object.id == 'extraGround' || object.id == 'sky') {
          this.selected.next(undefined);
          return;
        }

        if (pickResult.hit && object) {
          var omitList = ['ground', 'liquid'];

          this.selected.next(object.id);

          if (this.gizmoManager?.boundingBoxGizmoEnabled) {
            this.updateGizmoSize();
          }

          if (omitList.includes(object.id)) {
            this.hl.addMesh(object, new BABYLON.Color3(0.4, 0.91, 0.97));
            this.hl.blurHorizontalSize = 1;
            this.hl.blurVerticalSize = 1;

            return;
          } else {
          }
          // 0.4, 0.91, 0.97

          this.gizmoManager.attachToMesh(object);
        }
      }
    };

    await Promise.all(
      this.world.characters.map(async (c) => {
        this.loaded.next(`Downloading "${c.character.name}"`);
        var avatar2 = c.character.assetUrl;
        const result2 = await BABYLON.SceneLoader.ImportMeshAsync(
          '',
          '',
          avatar2,
          scene,
          undefined,
          '.glb'
        );

        var actor2 = result2.meshes[0] as BABYLON.Mesh;
        actor2.id = c.character.id;

        actor2.scaling.x = c.scale.x;
        actor2.scaling.y = c.scale.y;
        actor2.scaling.z = c.scale.z;

        actor2.position = new BABYLON.Vector3(c.spawn.x, c.spawn.y, c.spawn.z);

        actor2.rotation = new BABYLON.Vector3(
          this.toRadians(c.direction.x),
          this.toRadians(c.direction.y),
          this.toRadians(c.direction.z)
        );
      })
    );

    var generator = new BABYLON.ShadowGenerator(world.width, light);
    generator.usePoissonSampling = false;
    // generator.bias = 0.000001;
    generator.useBlurExponentialShadowMap = true;
    generator.useKernelBlur = true;
    generator.blurKernel = 5;
    generator.setTransparencyShadow(true);

    BABYLON.SceneLoader.OnPluginActivatedObservable.add(function (loader) {
      if (loader.name === 'gltf') {
        (loader as GLTFFileLoader).animationStartMode =
          GLTFLoaderAnimationStartMode.NONE;
      }
    });

    // const camera = new BABYLON.UniversalCamera(
    //     'UniversalCamera',
    //     new BABYLON.Vector3(0, 0, -10),
    //     scene
    //   );

    //   // Targets the camera to a particular position. In this case the scene origin
    //   camera.setTarget(BABYLON.Vector3.Zero());

    // BABYLON.ParticleHelper.CreateAsync('rain', scene, false).then((set) => {
    //   set.systems[0].updateSpeed = 0.1;

    //   set.start();
    //   scene.registerBeforeRender(() => {
    //     for (const sys of set.systems) {
    //       (sys.emitter! as any).x = camera.position.x;
    //       (sys.emitter! as any).y = camera.position.y;
    //       (sys.emitter! as any).z = camera.position.z;
    //     }
    //   });
    // });

    // var lightningMaterial = new BABYLON.StandardMaterial(
    //   'lightningMaterial',
    //   scene
    // );

    // function createLightningBolt() {
    //   var lightningBolt = new BABYLON.Mesh('lightningBolt', scene);
    //   lightningBolt.position.y = 0;

    //   var radians = Math.random() * Math.PI * 2;
    //   var radius = Math.random() * 5;
    //   lightningBolt.position.x = Math.cos(radians) * radius;
    //   lightningBolt.position.z = Math.sin(radians) * radius;

    //   var points = [];
    //   var totalSegments = 10;
    //   var segmentLength = 10 / totalSegments;

    //   points.push(new BABYLON.Vector3(0, 0, 0));

    //   for (var i = 1; i < totalSegments; i++) {
    //     var xOffset = (Math.random() - 0.5) * 2;
    //     var zOffset = (Math.random() - 0.5) * 2;
    //     points.push(new BABYLON.Vector3(xOffset, segmentLength * i, zOffset));
    //   }

    //   points.push(new BABYLON.Vector3(0, 10, 0));

    //   var tube = BABYLON.MeshBuilder.CreateTube(
    //     'tube',
    //     { path: points, radius: 0.05, cap: BABYLON.Mesh.CAP_ALL },
    //     scene
    //   );
    //   tube.material = lightningMaterial;
    //   tube.parent = lightningBolt;

    //   lightningMaterial.emissiveColor = new BABYLON.Color3(
    //     Math.random(),
    //     Math.random(),
    //     Math.random()
    //   );

    //   setTimeout(function () {
    //     lightningBolt.dispose();
    //   }, 100);
    // }

    // scene.registerBeforeRender(function () {
    //   if (Math.random() < 0.02) {
    //     createLightningBolt();
    //   }
    // });

    // const gl2 = new BABYLON.GlowLayer('bolt', scene);

    // Once the scene is loaded, we register a render loop to render it
    this.engine.runRenderLoop(() => {
      // if (ground.isReady && ground.subMeshes?.length == 1) {
      //   ground.subdivide(20); // Subdivide to optimize picking
      // }

      // Camera
      if (camera.beta < 0.1) camera.beta = 0.1;
      else if (camera.beta > (Math.PI / 2) * 0.92)
        camera.beta = (Math.PI / 2) * 0.92;

      if (camera.radius > world.width / 1.05)
        camera.radius = world.width / 1.05;

      if (camera.radius < 5) camera.radius = 5;

      // Render scene
      scene.render();

      // Animations
      skybox.rotation.y += 0.0001 * scene.getAnimationRatio();
    });

    var canvas = document.getElementById('canvas') as HTMLCanvasElement;

    camera.attachControl(canvas, true);

    this.engine.enableOfflineSupport = false;
    this.loaded.next('Launching Scene');

    scene.whenReadyAsync(true).then(() => {
      this.loaded.next('');
      setTimeout(() => {
        this.engine?.resize();
      }, 1);
    });
  }

  addLiquids(asset: ModelAsset, scene: BABYLON.Scene) {
    // var lava = BABYLON.MeshBuilder.CreateGround(
    //   asset.id,
    //   {
    //     width: asset.metadata['width'],
    //     height: asset.metadata['height'],
    //   },
    //   scene
    // );
    // // water.metadata = {
    // //   reflections: ['sky', 'ground'],
    // //   refractions: ['ground'],
    // // };
    // // let sky = scene.getMeshById('sky') as BABYLON.Mesh;
    // // let ground = scene.getMeshById('ground') as BABYLON.Mesh;
    // // var waterMaterial = new MATERIALS.WaterMaterial('water_material', scene);
    // // console.log(asset)
    // // if (asset.metadata['texture'].bump) {
    // //   waterMaterial.bumpTexture = new BABYLON.Texture(
    // //     asset.metadata['texture'].bump,
    // //     scene
    // //   );
    // //   // Set the bump texture
    // // }
    // // waterMaterial.windForce = -15;
    // // waterMaterial.waveHeight = 1.3;
    // // waterMaterial.windDirection = new BABYLON.Vector2(1, 1);
    // // waterMaterial.waterColor = new BABYLON.Color3(0.1, 0.1, 0.6);
    // // waterMaterial.colorBlendFactor = 0.3;
    // // waterMaterial.bumpHeight = 0.01;
    // // waterMaterial.waveLength = 0.1;
    // // waterMaterial.reflectionTexture?.renderList?.push(sky);
    // // waterMaterial.reflectionTexture?.renderList?.push(ground);
    // // waterMaterial.refractionTexture?.renderList?.push(ground);
    // // water.material = waterMaterial;
    // // if (world.ground.liquid) {
    // //   BABYLON.Engine.ShadersRepository = '';
    // //   if (world.ground.liquid.liquid == LiquidType.water) {
    // //     var water = BABYLON.MeshBuilder.CreateGround(
    // //       'liquid',
    // //       {
    // //         width: world.width,
    // //         height: world.height,
    // //       },
    // //       scene
    // //     );
    // //     water.position.y = world.ground.liquid.level;
    // //     var waterMaterial = new MATERIALS.WaterMaterial(
    // //       'water_material',
    // //       scene
    // //     );
    // //     water.isPickable = !world.locked;
    // //     if (world.ground.liquid.texture.bump) {
    // //       waterMaterial.bumpTexture = new BABYLON.Texture(
    // //         world.ground.liquid.texture.bump,
    // //         scene
    // //       ); // Set the bump texture
    // //     }
    // //     reflections.forEach((mesh) => {
    // //       waterMaterial.reflectionTexture?.renderList?.push(mesh);
    // //     });
    // //     refractions.forEach((mesh) => {
    // //       waterMaterial.refractionTexture?.renderList?.push(mesh);
    // //     });
    // //     waterMaterial.windForce = -15;
    // //     waterMaterial.waveHeight = 1.3;
    // //     waterMaterial.windDirection = new BABYLON.Vector2(1, 1);
    // //     waterMaterial.waterColor = new BABYLON.Color3(0.1, 0.1, 0.6);
    // //     waterMaterial.colorBlendFactor = 0.3;
    // //     waterMaterial.bumpHeight = 0.01;
    // //     waterMaterial.waveLength = 0.1;
    // //     water.material = waterMaterial;
    // //     // const sound = new BABYLON.Sound(
    // //     //   'sound',
    // //     //   'assets/sounds/water.wav',
    // //     //   scene,
    // //     //   null,
    // //     //   {
    // //     //     loop: true,
    // //     //     autoplay: true,
    // //     //     spatialSound: true,
    // //     //   }
    // //     // );
    // //     // const music = new BABYLON.Sound(
    // //     //   'music',
    // //     //   'assets/sounds/music2.wav',
    // //     //   scene,
    // //     //   null,
    // //     //   {
    // //     //     loop: true,
    // //     //     autoplay: true,
    // //     //   }
    // //     // );
    // //     // let center = ground.getBoundingInfo().boundingBox.center;
    // //     // sound.setPosition(
    // //     //   new BABYLON.Vector3(center.x, world.size / 50, center.y)
    // //     // );
    // //   }
    // //   if (world.ground.liquid.liquid == LiquidType.lava) {
    // //     lava.position.y = world.ground.liquid.level;
    // let lavaMaterial = new MATERIALS.LavaMaterial('lava_material', scene);
    // //     lava.isPickable = !world.locked;
    // lavaMaterial.noiseTexture = new BABYLON.Texture(
    //   asset.metadata['texture'].noise,
    //   scene
    // );
    // lavaMaterial.diffuseTexture = new BABYLON.Texture(
    //   asset.metadata['texture'].diffuse,
    //   scene
    // );
    // //     if (world.ground.liquid.texture.diffuse) {
    // //       lavaMaterial.diffuseTexture = new BABYLON.Texture(
    // //         world.ground.liquid.texture.diffuse,
    // //         scene
    // //       );
    // //     }
    // lavaMaterial.speed = 0.5;
    // lavaMaterial.fogColor = new BABYLON.Color3(1, 0, 0);
    // lavaMaterial.unlit = true;
    // lava.material = lavaMaterial;
    // //   }
    // // }
    // let options = {
    //   shouldExportNode: function (node) {
    //     return node === lava;
    //   },
    // };
    // SERIALIZERS.GLTF2Export.GLBAsync(scene, asset.assetUrl, options).then(
    //   (glb) => {
    //     glb.downloadFiles();
    //   }
    // );
  }

  updateGizmoSize(meshId = this.selected.value) {
    let sameMesh = this.engine?.scenes[0].getMeshById(meshId) as BABYLON.Mesh;
    if (sameMesh && meshId && meshId == sameMesh.id) {
      let box = sameMesh.getBoundingInfo().boundingBox;

      let ratio = 0.05;

      let size =
        Math.abs(box.maximum.x - box.minimum.x) * sameMesh.scaling.x * ratio;
      // this.gizmoManager.gizmos.boundingBoxGizmo.fixedDragMeshBoundsSize = true
      this.gizmoManager.gizmos.boundingBoxGizmo.rotationSphereSize = size;
      this.gizmoManager.gizmos.boundingBoxGizmo.scaleBoxSize = size;
    }
  }

  async importMeshToScene(
    asset: SceneAsset,
    scene: BABYLON.Scene,
    world = this.world
  ) {
    let newAsset = JSON.parse(JSON.stringify(asset)) as SceneAsset;

    if (asset.asset.assetUrl == 'lava_ground') {
      console.log('LOADSSSS');

      this.addLiquids(asset.asset, scene);
      return undefined;
    }

    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      '',
      '',
      asset.asset.assetUrl,
      scene,
      (data) => {},
      '.glb'
    );

    console.log('BOUND');

    var object = BABYLON.BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(
      result.meshes[0] as BABYLON.Mesh
    );

    object.isPickable = !world.locked;

    // result.meshes[0].setBoundingInfo(object.getBoundingInfo())

    // console.log("OBJECT")
    // console.log(object.getRawBoundingInfo().boundingBox)

    if (asset.asset.id == 'castle') {
      let d = result.meshes.find((m) => m.id == 'LAVAFALL');
      let mat = new BABYLON.StandardMaterial('fount', scene);

      //let tex = this.generateLiquidTexture(LiquidType.lava);

      let tex = new AnimatedGifTexture('/assets/lava.gif', this.engine);

      mat.diffuseTexture = tex;
      mat.emissiveTexture = tex;

      mat.disableLighting = true;

      (mat.diffuseTexture as BABYLON.Texture).uScale = 0.5;
      (mat.diffuseTexture as BABYLON.Texture).vScale = 0.5;
      (mat.emissiveTexture as BABYLON.Texture).uScale = 0.5;
      (mat.emissiveTexture as BABYLON.Texture).vScale = 0.5;

      // mat.emissiveTexture = new BABYLON.Texture(tex.diffuse, scene);

      // scene.beforeRender = () => {
      //   (mat.diffuseTexture as BABYLON.Texture).uOffset += 0.0025;
      // };

      d.material = mat;
    }

    if (asset.asset.id == 'cube') {
      let tex = new AnimatedGifTexture('/assets/lava2.gif', this.engine);

      let mat = new BABYLON.StandardMaterial('fount2', scene);

      //let tex = this.generateLiquidTexture(LiquidType.lava);

      mat.diffuseTexture = tex;
      mat.emissiveTexture = tex;

      // (mat.diffuseTexture as BABYLON.Texture).uScale = uvScaleConstant.x;
      //   (mat.diffuseTexture as BABYLON.Texture).vScale = uvScaleConstant.y;
      //   (mat.emissiveTexture as BABYLON.Texture).uScale = uvScaleConstant.x;
      //   (mat.emissiveTexture as BABYLON.Texture).vScale = uvScaleConstant.y;

      mat.disableLighting = true;

      let c = result.meshes[1]; //BABYLON.CreateBox("lava", {size: world.width, height: 2}, scene)
      // c.subdivide(world.width / 20)
      c.material = mat;
      // console.log(result.meshes)
    }

    // result.meshes.forEach(mesh => hl?.addMesh(mesh as BABYLON.Mesh, BABYLON.Color3.Green()))
    // var object = result.meshes[0]

    // BABYLON.Mesh.MergeMeshes(
    //   (result.meshes as BABYLON.Mesh[]).slice(1, result.meshes.length),
    //   true,
    //   false,
    //   undefined,
    //   false,
    //   true
    // );

    object.id = asset.asset.id;

    // object.isPickable = !world.locked;;

    let vectors = result.meshes[0].getHierarchyBoundingVectors();

    // new BABYLON.BoundingInfo(vectors.min, vectors.max)

    let width = vectors.max.x - vectors.min.x;
    let height = vectors.max.y - vectors.min.y;

    let ratio = height / width;

    object.scaling.x = !Number.isNaN(asset.scale.x) ? asset.scale.x : 1;
    object.scaling.y = !Number.isNaN(asset.scale.y) ? asset.scale.y : 1 * ratio;
    object.scaling.z = !Number.isNaN(asset.scale.z) ? asset.scale.z : 1;

    newAsset.scale.x = object.scaling.x;
    newAsset.scale.y = object.scaling.y;
    newAsset.scale.z = object.scaling.z;

    object.rotation = new BABYLON.Vector3(
      this.toRadians(asset.direction.x),
      this.toRadians(asset.direction.y),
      this.toRadians(asset.direction.z)
    );

    object.position = new BABYLON.Vector3(
      asset.spawn.x,
      asset.spawn.y,
      asset.spawn.z
    );

    // var boundingBox =
    //   BABYLON.BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(object);
    // boundingBox.name = asset.asset.name;

    // console.log(result.meshes)
    // let f = await result.meshes[1].material.getActiveTextures()[0].readPixels()
    // BABYLON.Tools.DumpDataAsync(200, 200, f, 'image/jpeg', "img.jpeg", undefined, false, 1)
    // console.log()

    if (asset.movement.canMount) {
      let box = object.getHierarchyBoundingVectors();

      object.ellipsoidOffset = new BABYLON.Vector3(
        0,
        -(box.max.y - box.min.y),
        0
      );
    }

    return newAsset;
  }

  doDownload(filename: string, scene: BABYLON.Scene) {
    // if (objectUrl) {
    //   window.URL.revokeObjectURL(objectUrl);
    // }

    const serializedScene = BABYLON.SceneSerializer.Serialize(scene);

    const strScene = JSON.stringify(serializedScene);

    if (
      filename.toLowerCase().lastIndexOf('.babylon') !== filename.length - 8 ||
      filename.length < 9
    ) {
      filename += '.babylon';
    }

    const blob = new Blob([strScene], { type: 'octet/stream' });

    // turn blob into an object URL; saved as a member, so can be cleaned out later
    let objectUrl = (window.webkitURL || window.URL).createObjectURL(blob);

    const link = window.document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    const click = document.createEvent('MouseEvents');
    click.initEvent('click', true, false);
    link.dispatchEvent(click);
  }

  doDownloadMesh(filename: string, mesh: BABYLON.Mesh) {
    // if (objectUrl) {
    //   window.URL.revokeObjectURL(objectUrl);
    // }

    const serializedMesh = BABYLON.SceneSerializer.SerializeMesh(mesh);

    const strMesh = JSON.stringify(serializedMesh);

    if (
      filename.toLowerCase().lastIndexOf('.babylon') !== filename.length - 8 ||
      filename.length < 9
    ) {
      filename += '.babylon';
    }

    const blob = new Blob([strMesh], { type: 'octet/stream' });

    // turn blob into an object URL; saved as a member, so can be cleaned out later
    let objectUrl = (window.webkitURL || window.URL).createObjectURL(blob);

    const link = window.document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    const click = document.createEvent('MouseEvents');
    click.initEvent('click', true, false);
    link.dispatchEvent(click);
  }

  createGround(world: World, scene: BABYLON.Scene) {
    var ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
      world.ground.texture.id,
      world.ground.heightMap,
      {
        width: world.width,
        height: world.width,
        subdivisions: world.width * 0.005,
        minHeight: world.ground.minHeight,
        maxHeight: world.ground.maxHeight,
        updatable: true,
      },
      scene
    );

    ground.isPickable = !world.locked;
    ground.id = 'ground';

    let groundMaterial = this.createGroundMaterial(world, ground, scene);

    ground.position.y = -2.0;
    ground.material = groundMaterial;
    ground.receiveShadows = true;

    return ground;
  }

  createGroundMaterial(
    world: World,
    ground: BABYLON.Mesh,
    scene: BABYLON.Scene
  ) {
    var groundMaterial = new BABYLON.StandardMaterial('ground', scene);

    var uvScaleConstant = new BABYLON.Vector2(
      world.width / 166,
      world.height / 166
    );

    if (world.ground.texture.displacement) {
      ground.applyDisplacementMap(
        world.ground.texture.displacement,
        world.ground.minHeight,
        world.ground.maxHeight,
        undefined,
        undefined,
        uvScaleConstant,
        true
      );
    }

    if (world.ground.texture.diffuse) {
      let groundTexture = new BABYLON.Texture(
        world.ground.texture.diffuse,
        scene
      );
      groundTexture.uScale = uvScaleConstant.x;
      groundTexture.vScale = uvScaleConstant.y;

      groundMaterial.diffuseTexture = groundTexture;
    }

    if (world.ground.texture.bump) {
      let groundBumpTexture = new BABYLON.Texture(
        world.ground.texture.bump,
        scene
      );
      groundBumpTexture.uScale = uvScaleConstant.x;
      groundBumpTexture.vScale = uvScaleConstant.y;

      groundMaterial.bumpTexture = groundBumpTexture;
    }

    if (world.ground.texture.ambient) {
      let groundAmbientTexture = new BABYLON.Texture(
        world.ground.texture.ambient,
        scene
      );
      groundAmbientTexture.uScale = uvScaleConstant.x;
      groundAmbientTexture.vScale = uvScaleConstant.y;

      groundMaterial.ambientTexture = groundAmbientTexture;
    }

    if (world.ground.texture.specular) {
      let groundSpecularTexture = new BABYLON.Texture(
        world.ground.texture.specular,
        scene
      );
      groundSpecularTexture.uScale = uvScaleConstant.x;
      groundSpecularTexture.vScale = uvScaleConstant.y;

      groundMaterial.specularTexture = groundSpecularTexture;
    }

    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

    return groundMaterial;
  }

  hl?: BABYLON.HighlightLayer;

  syncMeshIncoming() {
    let world = this.world;

    //add more sync elements of scene later

    //duplicate this for characters too
    let scene = this.engine?.scenes[0];
    if (world && this.engine && scene) {
      if (world.locked) {
        this.gizmoManager.attachToMesh(null);
        this.hl?.removeAllMeshes();
      }
      let mesh = scene?.getMeshById('ground');
      let liq = scene?.getMeshById('liquid');
      if (mesh) {
        mesh.isPickable = !world.locked;
      }
      if (liq) {
        liq.isPickable = !world.locked;
      }

      this.world.assets.map(async (w) => {
        let mesh = scene?.getMeshById(w.asset.id);

        if (mesh) {
          mesh.position.x = w.spawn.x;
          mesh.position.y = w.spawn.y;
          mesh.position.z = w.spawn.z;

          mesh.scaling.x = w.scale.x;
          mesh.scaling.y = w.scale.y;
          mesh.scaling.z = w.scale.z;

          mesh.rotation.x = this.toRadians(w.direction.x);
          mesh.rotation.y = this.toRadians(w.direction.y);
          mesh.rotation.z = this.toRadians(w.direction.z);
          mesh.isPickable = !world.locked;
        } else {
          await this.importMeshToScene(w, scene);
          //add mesh to scene
        }
      });

      // scene.meshes;

      //do check for meshes in scene that are not in 'world' object

      //do sync for ground, sky, and liquids

      if (world.ground) {
        let ground = scene.getMeshById('ground') as BABYLON.GroundMesh;
        if (world.ground.texture.id != ground.name) {
          ground.dispose();
          this.createGround(world, scene);
        }
        if (world.ground.liquid) {
        } else {
        }
      }
    }
  }

  syncMesh() {
    let assetId = this.selected.value as string;

    if (assetId) {
      let mesh = this.engine.scenes[0]?.getMeshById(assetId);
      let position = mesh.position;
      let rotation = mesh.rotation;
      let scale = mesh.scaling;

      let same = this.world.assets.find((a) => a.asset.id == assetId);
      if (same && this.world) {
        same.spawn.x = position.x;
        same.spawn.y = position.y;
        same.spawn.z = position.z;

        same.scale.x = scale.x;
        same.scale.y = scale.y;
        same.scale.z = scale.z;

        same.direction.x = this.toDegrees(rotation.x);
        same.direction.y = this.toDegrees(rotation.y);
        same.direction.z = this.toDegrees(rotation.z);

        this.save();
      }
    }
  }

  selectTool(tool: string) {
    switch (tool) {
      case 'rotate':
        this.gizmoManager.rotationGizmoEnabled = true;
        this.gizmoManager.positionGizmoEnabled = false;
        this.gizmoManager.scaleGizmoEnabled = false;
        this.gizmoManager.boundingBoxGizmoEnabled = false;
        if (this.gizmoManager.gizmos.rotationGizmo) {
          this.gizmoManager.gizmos.rotationGizmo.updateGizmoRotationToMatchAttachedMesh =
            false;
        }
        return;
      case 'move':
        this.gizmoManager.positionGizmoEnabled = true;
        this.gizmoManager.rotationGizmoEnabled = false;
        this.gizmoManager.scaleGizmoEnabled = false;
        this.gizmoManager.boundingBoxGizmoEnabled = false;
        return;
      case 'scale':
        this.gizmoManager.scaleGizmoEnabled = true;
        this.gizmoManager.positionGizmoEnabled = false;
        this.gizmoManager.rotationGizmoEnabled = false;
        this.gizmoManager.gizmos.scaleGizmo.sensitivity = 3;
        this.gizmoManager.boundingBoxGizmoEnabled = false;
        return;
      case 'box':
        this.gizmoManager.boundingBoxGizmoEnabled = true;
        this.gizmoManager.scaleGizmoEnabled = false;
        this.gizmoManager.positionGizmoEnabled = false;
        this.gizmoManager.rotationGizmoEnabled = false;
        if (this.gizmoManager.boundingBoxGizmoEnabled) {
          this.gizmoManager.gizmos.boundingBoxGizmo.scaleDragSpeed = 2;
          this.gizmoManager.boundingBoxDragBehavior.rotateDraggedObject = false;
          this.gizmoManager.gizmos.boundingBoxGizmo.setColor(
            new BABYLON.Color3(0.4, 0.91, 0.97)
          );
          // 99 102 241
        }
        return;
    }
  }

  toRadians = (degrees: number) => {
    return (degrees * Math.PI) / 180;
  };

  toDegrees = (radians: number) => {
    return radians * (180 / Math.PI);
  };

  setAnimation(
    actor: BABYLON.Mesh,
    animation: BABYLON.AnimationGroup,
    scene: BABYLON.Scene,
    animationId: string
  ) {
    let modelAnimationGroup = this.cloneAnimation(
      actor,
      animation,
      scene,
      animationId
    );
    modelAnimationGroup.start();
    modelAnimationGroup.loopAnimation = true;
  }

  cloneAnimation(
    actor: BABYLON.Mesh,
    animation: BABYLON.AnimationGroup,
    scene: BABYLON.Scene,
    animationId: string
  ) {
    const modelTransformNodes = actor.getChildTransformNodes();
    let anim = scene.getAnimationGroupByName(animationId);
    if (anim) {
      anim.stop();
      scene.removeAnimationGroup(anim);
    }
    const modelAnimationGroup = animation.clone(animationId, (oldTarget) => {
      return modelTransformNodes.find((node) => node.name === oldTarget.name);
    });

    return modelAnimationGroup;
  }

  async importAnimation(dir: string, name: string, scene: BABYLON.Scene) {
    return BABYLON.SceneLoader.ImportAnimationsAsync(
      dir,
      name,
      scene,
      false,
      BABYLON.SceneLoaderAnimationGroupLoadingMode.NoSync
    );
  }

  generateLiquidTexture(type: LiquidType) {
    if (type == LiquidType.lava) {
      let tex = new Texture('lava');
      tex.diffuse = this.emulatorService.isEmulator
        ? 'http://localhost:9199/v0/b/unfathom-ai.appspot.com/o/lava_lavatile.jpg?alt=media'
        : 'https://storage.googleapis.com/verticalai.appspot.com/default/lava/lava_lavatile.jpg';
      return tex;
    } else {
      let tex = new Texture('water');
      tex.bump = this.emulatorService.isEmulator
        ? 'http://localhost:9199/v0/b/unfathom-ai.appspot.com/o/bump2.png?alt=media'
        : 'https://storage.googleapis.com/verticalai.appspot.com/default/water/bump2.png';
      tex.diffuse = this.emulatorService.isEmulator
        ? 'http://localhost:9199/v0/b/unfathom-ai.appspot.com/o/bump2.png?alt=media'
        : 'https://storage.googleapis.com/verticalai.appspot.com/default/water/bump2.png';
      return tex;
    }
  }

  deinit() {
    this.engine?.scenes.forEach((scene) => {
      scene.clearCachedVertexData();
      scene.cleanCachedTextureBuffer();
    });

    this.engine?.dispose();
    this.engine = undefined;
    this.gizmoManager = undefined;
  }

  async save(world = this.world) {
    let canvas = document.getElementById('canvas') as HTMLCanvasElement;

    if (
      this.engine &&
      this.engine?.scenes[0] &&
      this.engine?.scenes[0]?.activeCamera &&
      canvas
    ) {
      let aspectRatio = canvas.width / canvas.height;
      let width = 400;
      let height = width / aspectRatio;

      let img = await BABYLON.Tools.CreateScreenshotAsync(
        this.engine,
        this.engine.scenes[0].activeCamera,
        { width, height }
      );

      world.img = img;
    }

    this.projectService.save(this.world);
  }
}
