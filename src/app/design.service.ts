import { Injectable } from '@angular/core';
import { Scene } from './models/workflow/scene.model';
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
import { Dict } from './load.service';
import { Character } from './models/workflow/character.model';
import { Texture } from './models/workflow/texture.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ProjectService } from './project.service';

@Injectable({
  providedIn: 'root',
})
export class DesignService {
  world?: World;

  engine?: BABYLON.Engine;

  gizmoManager?: BABYLON.GizmoManager;

  loaded = new BehaviorSubject<string>('');

  selected = new BehaviorSubject<string | undefined>(undefined);

  constructor(
    private db: AngularFirestore,
    private projectService: ProjectService
  ) {
    projectService.workflow.subscribe((w) => {
      if (w) {
        this.world = w;
      } else {
        this.deinit();
      }
    });
  }

  private init(world: World = this.world) {
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
      this.engine = new BABYLON.Engine(canvas, true);

      //Creating scene
      await this.createScene2(this.engine, this.world);

      // Resize
      window.addEventListener('resize', () => {
        this.engine?.resize();
      });
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
      var ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
        'ground',
        world.ground.heightMap,
        {
          width: world.width,
          height: world.height,
          subdivisions: world.ground.maxHeight / 20,
          minHeight: world.ground.minHeight,
          maxHeight: world.ground.maxHeight,
          updatable: true,
        },
        scene
      );

      ground.isPickable = true;

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
      ground.position.y = -2.0;
      ground.material = groundMaterial;
      ground.receiveShadows = true;

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

      ground.checkCollisions = true;
      extraGround.checkCollisions = true;

      if (world.ground.liquid) {
        BABYLON.Engine.ShadersRepository = '';

        if (world.ground.liquid.liquid == LiquidType.water) {
          var water = BABYLON.MeshBuilder.CreateGround(
            'water',
            {
              width: world.width * 2,
              height: world.height * 2,
              subdivisions: 32,
            },
            scene
          );
          water.position.y = world.ground.liquid.level;

          var waterMaterial = new MATERIALS.WaterMaterial(
            'water_material',
            scene
          );
          water.isPickable = true;

          if (world.ground.liquid.texture.bump) {
            waterMaterial.bumpTexture = new BABYLON.Texture(
              world.ground.liquid.texture.bump,
              scene
            ); // Set the bump texture
          }

          waterMaterial.refractionTexture?.renderList?.push(extraGround);
          waterMaterial.refractionTexture?.renderList?.push(ground);

          if (skybox) {
            waterMaterial.reflectionTexture?.renderList?.push(skybox);
          }

          waterMaterial.windForce = -15;
          waterMaterial.waveHeight = 1.3;
          waterMaterial.windDirection = new BABYLON.Vector2(1, 1);
          waterMaterial.waterColor = new BABYLON.Color3(0.1, 0.1, 0.6);
          waterMaterial.colorBlendFactor = 0.3;
          waterMaterial.bumpHeight = 0.01;
          waterMaterial.waveLength = 0.1;

          water.material = waterMaterial;

          // const sound = new BABYLON.Sound(
          //   'sound',
          //   'assets/sounds/water.wav',
          //   scene,
          //   null,
          //   {
          //     loop: true,
          //     autoplay: true,
          //     spatialSound: true,
          //   }
          // );

          // const music = new BABYLON.Sound(
          //   'music',
          //   'assets/sounds/music2.wav',
          //   scene,
          //   null,
          //   {
          //     loop: true,
          //     autoplay: true,
          //   }
          // );

          // let center = ground.getBoundingInfo().boundingBox.center;

          // sound.setPosition(
          //   new BABYLON.Vector3(center.x, world.size / 50, center.y)
          // );
        }

        if (world.ground.liquid.liquid == LiquidType.lava) {
          var lava = BABYLON.MeshBuilder.CreateGround(
            'lava',
            {
              width: world.width,
              height: world.height,
              subdivisions: 32,
            },
            scene
          );
          lava.position.y = world.ground.liquid.level;

          var lavaMaterial = new MATERIALS.LavaMaterial('lava_material', scene);
          lava.isPickable = true;

          lavaMaterial.noiseTexture = new BABYLON.Texture(
            'https://storage.googleapis.com/verticalai.appspot.com/default/lava/lava_cloud.png',
            scene
          );

          if (world.ground.liquid.texture.diffuse) {
            lavaMaterial.diffuseTexture = new BABYLON.Texture(
              world.ground.liquid.texture.diffuse,
              scene
            );
          }

          lavaMaterial.speed = 0.5;
          lavaMaterial.fogColor = new BABYLON.Color3(1, 0, 0);
          lavaMaterial.unlit = true;
          lava.material = lavaMaterial;
        }
      }
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

        const result = await BABYLON.SceneLoader.ImportMeshAsync(
          '',
          '',
          asset.asset.assetUrl,
          scene,
          (data) => {},
          '.glb'
        );

        result.meshes.forEach((mesh) => (mesh.checkCollisions = true));

        // result.meshes.forEach(mesh => hl.addMesh(mesh as BABYLON.Mesh, BABYLON.Color3.Green()))
        var object = BABYLON.Mesh.MergeMeshes(
          (result.meshes as BABYLON.Mesh[]).slice(1, result.meshes.length),
          true,
          false,
          undefined,
          false,
          true
        );

        console.log(result.meshes);

        object.id = asset.asset.id;
        object.isPickable = true;

        object.scaling.x = asset.scale.x;
        object.scaling.y = asset.scale.y;
        object.scaling.z = asset.scale.z;

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
      })
    );

    var hl = new BABYLON.HighlightLayer('hl1', scene);

    hl.addExcludedMesh(extraGround);

    this.gizmoManager = new BABYLON.GizmoManager(scene, 1);
    this.selectTool("move")
    this.gizmoManager.boundingBoxGizmoEnabled = true
    this.gizmoManager.gizmos.boundingBoxGizmo.setColor(BABYLON.Color3.Green())

    this.gizmoManager.boundingBoxDragBehavior.onDragObservable.add((event) => {
      console.log("drag");
    });

    this.gizmoManager.gizmos.positionGizmo.onDragEndObservable.add(event => {

    })

    // gizmoManager.rotationGizmoEnabled = true;
    // gizmoManager.scaleGizmoEnabled = true;
    this.gizmoManager.usePointerToAttachGizmos = false;
    // gizmoManager.boundingBoxGizmoEnabled = true;

    scene.onPointerDown = (evt, pickResult) => {
      // We try to pick an object
      var object = pickResult.pickedMesh as BABYLON.Mesh;
      console.log(object);
      hl.removeAllMeshes();
      this.gizmoManager.attachToMesh(null);
      if (object.id == 'extraGround') {
        this.selected.next(undefined);
        return;
      }
      if (pickResult.hit && object) {
        this.selected.next(object.id);
  
        var omitList = ['sky', 'ground', 'water', 'lava'];

        console.log(omitList.includes(object.id));

        if (omitList.includes(object.id)) {
          hl.addMesh(object, BABYLON.Color3.Green());
          hl.blurHorizontalSize = 1;
          hl.blurVerticalSize = 1;
          return;
        }
       

        this.gizmoManager.attachToMesh(object);
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

        actor2.checkCollisions = true;

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
      if (ground.isReady && ground.subMeshes?.length == 1) {
        ground.subdivide(20); // Subdivide to optimize picking
      }

      // Camera
      if (camera.beta < 0.1) camera.beta = 0.1;
      else if (camera.beta > (Math.PI / 2) * 0.92)
        camera.beta = (Math.PI / 2) * 0.92;

      if (camera.radius > world.width / 1.3) camera.radius = world.width / 1.3;

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

  selectTool(tool: string) {
    switch (tool) {
      case 'rotate':
        this.gizmoManager.rotationGizmoEnabled = true;
        this.gizmoManager.positionGizmoEnabled = false;
        this.gizmoManager.scaleGizmoEnabled = false;

        if (this.gizmoManager.gizmos.rotationGizmo) {
          this.gizmoManager.gizmos.rotationGizmo.updateGizmoRotationToMatchAttachedMesh =
            false;
        }

        return;
      case 'move':
        this.gizmoManager.positionGizmoEnabled = true;
        this.gizmoManager.rotationGizmoEnabled = false;
        this.gizmoManager.scaleGizmoEnabled = false;

        return;
      case 'scale':
        this.gizmoManager.scaleGizmoEnabled = true;
        this.gizmoManager.positionGizmoEnabled = false;
        this.gizmoManager.rotationGizmoEnabled = false;

        this.gizmoManager.gizmos.scaleGizmo.sensitivity = 3;

        

        return;
    }
  }

  toRadians = (degrees: number) => {
    return (degrees * Math.PI) / 180;
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
      tex.diffuse =
        'https://storage.googleapis.com/verticalai.appspot.com/default/lava/lava_lavatile.jpg';
      return tex;
    } else {
      let tex = new Texture('water');
      tex.bump =
        'https://storage.googleapis.com/verticalai.appspot.com/default/water/bump2.png';
      tex.diffuse =
        'https://storage.googleapis.com/verticalai.appspot.com/default/water/bump2.png';
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
}
