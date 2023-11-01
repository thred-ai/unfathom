import { Injectable } from '@angular/core';
import { CharacterController } from 'babylonjs-charactercontroller';
import {
  GLTFFileLoader,
  GLTFLoaderAnimationStartMode,
} from 'babylonjs-loaders';
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
import { Substance } from './models/workflow/substance.model';

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

      extraGround.position.y = -2.05;

      extraGround.material = extraGroundMaterial;

    }

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
          var omitList = ['ground'];

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

  createLiquid(
    substance: Substance,
    scene: BABYLON.Scene
  ): BABYLON.GroundMesh | undefined {
    var asset = BABYLON.MeshBuilder.CreateGround(
      substance.id,
      {
        width: substance.metadata['width'],
        height: substance.metadata['height'],
        subdivisions:
         2,
      },
      scene
    );

    switch (substance.metadata['customClass']) {
      case 'WaterMaterial':
        var waterMaterial = new MATERIALS.WaterMaterial(
          'water_material',
          scene
        );
        if (substance.texture.bump) {
          waterMaterial.bumpTexture = new BABYLON.Texture(
            substance.texture.bump,
            scene
          );
        }

        if (substance.metadata['windForce']) {
          waterMaterial.windForce = substance.metadata['windForce'] as number;
        }

        if (substance.metadata['waveHeight']) {
          waterMaterial.waveHeight = substance.metadata['waveHeight'] as number;
        }

        if (substance.metadata['windDirection']) {
          waterMaterial.windDirection = substance.metadata[
            'windDirection'
          ] as BABYLON.Vector2;
        }

        if (substance.metadata['waterColor']) {
          waterMaterial.waterColor = substance.metadata[
            'waterColor'
          ] as BABYLON.Color3;
        }

        if (substance.metadata['colorBlendFactor']) {
          waterMaterial.colorBlendFactor = substance.metadata[
            'colorBlendFactor'
          ] as number;
        }

        if (substance.metadata['bumpHeight']) {
          waterMaterial.bumpHeight = substance.metadata['bumpHeight'] as number;
        }

        if (substance.metadata['waveLength']) {
          waterMaterial.waveLength = substance.metadata['waveLength'] as number;
        }

        if (substance.metadata['reflections']) {
          (substance.metadata['reflections'] as string[]).forEach((id) => {
            let mesh = scene.getMeshById(id) as BABYLON.Mesh;

            if (mesh) {
              waterMaterial.reflectionTexture?.renderList?.push(mesh);
            }
          });
        }

        if (substance.metadata['refractions']) {
          (substance.metadata['refractions'] as string[]).forEach((id) => {
            let mesh = scene.getMeshById(id) as BABYLON.Mesh;

            if (mesh) {
              waterMaterial.refractionTexture?.renderList?.push(mesh);
            }
          });
        }

        asset.material = waterMaterial;
        return asset;
      case 'LavaMaterial':
        let lavaMaterial = new MATERIALS.LavaMaterial('lava_material', scene);

        if (substance.texture.noise) {
          lavaMaterial.noiseTexture = new BABYLON.Texture(
            substance.texture.noise,
            scene
          );
        }

        if (substance.texture.diffuse) {
          lavaMaterial.diffuseTexture = new BABYLON.Texture(
            substance.texture.diffuse,
            scene
          );
        }

        if (substance.metadata['speed']) {
          lavaMaterial.speed = substance.metadata['speed'] as number;
        }

        if (substance.metadata['fogColor']) {
          lavaMaterial.fogColor = substance.metadata[
            'fogColor'
          ] as BABYLON.Color3;
        }

        if (substance.metadata['unlit']) {
          lavaMaterial.unlit = substance.metadata['unlit'] as boolean;
        }

        asset.material = lavaMaterial;

        return asset;
      default:
        return undefined;
    }
  }

  updateGizmoSize(meshId = this.selected.value) {
    let sameMesh = this.engine?.scenes[0].getMeshById(meshId) as BABYLON.Mesh;
    if (sameMesh && meshId && meshId == sameMesh.id) {
      let box = sameMesh.getBoundingInfo().boundingBox;

      let ratio = 0.05;

      let size =
        Math.abs(box.maximum.x - box.minimum.x) * sameMesh.scaling.x * ratio;
      // this.gizmoManager.gizmos.boundingBoxGizmo.fixedDragMeshBoundsSize = true

      if (size >= 400){
        size = 400
      }
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

    let importMesh: BABYLON.Mesh | undefined = undefined;

    if (asset.asset.metadata && asset.asset.metadata['customClass']) {
      importMesh = this.createLiquid(asset.asset as Substance, scene);

      importMesh.scaling.x = asset.scale.x;
      importMesh.scaling.y = asset.scale.y;

      importMesh.scaling.z = asset.scale.z;
    } else {
      let result = await BABYLON.SceneLoader.ImportMeshAsync(
        '',
        '',
        (asset.asset as ModelAsset)?.assetUrl,
        scene,
        (data) => {},
        '.glb'
      );

      if (asset.asset.id == 'castle') {
        let d = result.meshes.find((m) => m.id == 'LAVAFALL');
        let mat = new BABYLON.StandardMaterial('fount', scene);
    
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


      importMesh = BABYLON.BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(
        result.meshes[0] as BABYLON.Mesh
      );

      let vectors = importMesh.getHierarchyBoundingVectors();

      let width = vectors.max.x - vectors.min.x;
      let height = vectors.max.y - vectors.min.y;

      let ratio = height / width;

      importMesh.scaling.x = !Number.isNaN(asset.scale.x) ? asset.scale.x : 1;
      importMesh.scaling.y = !Number.isNaN(asset.scale.y)
        ? asset.scale.y
        : 1 * ratio;
      importMesh.scaling.z = !Number.isNaN(asset.scale.z) ? asset.scale.z : 1;

      if (asset.movement.canMount) {
        let box = importMesh.getHierarchyBoundingVectors();

        importMesh.ellipsoidOffset = new BABYLON.Vector3(
          0,
          -(box.max.y - box.min.y),
          0
        );
      }
    }

    if (importMesh) {
      console.log('BOUND');

      importMesh.isPickable = !world.locked;

      importMesh.id = asset.asset.id;

      newAsset.scale.x = importMesh.scaling.x;
      newAsset.scale.y = importMesh.scaling.y;
      newAsset.scale.z = importMesh.scaling.z;

      importMesh.rotation = new BABYLON.Vector3(
        this.toRadians(asset.direction.x),
        this.toRadians(asset.direction.y),
        this.toRadians(asset.direction.z)
      );

      importMesh.position = new BABYLON.Vector3(
        asset.spawn.x,
        asset.spawn.y,
        asset.spawn.z
      );

      return newAsset;
    }

    return undefined;
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
      if (mesh) {
        mesh.isPickable = !world.locked;
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

      //do sync for ground, sky

      if (world.ground) {
        let ground = scene.getMeshById('ground') as BABYLON.GroundMesh;
        if (world.ground.texture.id != ground.name) {
          ground.dispose();
          this.createGround(world, scene);
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
