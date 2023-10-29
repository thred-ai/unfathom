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
import { Dict } from './load.service';
import { Character } from './models/workflow/character.model';
import { Texture } from './models/workflow/texture.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { EmulatorService } from './emulator.service';
import { SceneCharacter } from './models/workflow/scene-character.model';

@Injectable({
  providedIn: 'root',
})
export class PrototypeService {
  selectedCharacter = new BehaviorSubject<SceneCharacter | undefined>(
    undefined
  );

  // characters: {
  //   spawn: { x: number; y: number; z: number };
  //   character: Character;
  //   currentPos: { x: number; y: number; z: number };
  //   scale: number;
  //   direction: { x: number; y: number; z: number };
  // }[] = [];

  world?: World;
  cc?: CharacterController;

  engine?: BABYLON.Engine;
  agMap?: Dict<BABYLON.AnimationGroup>;

  loaded = new BehaviorSubject<string>('');

  mountedAsset = new BehaviorSubject<string | undefined>(undefined);

  constructor(
    private db: AngularFirestore,
    private emulatorService: EmulatorService
  ) {}

  init(world: World) {
    this.deinit();

    this.world = world;

    if (this.world) {
      // if (Object.keys(this.world.characters).length == 0) {
      //   console.log('DEFAULT');

      // }

      let character = new Character(
        'default',
        'Default',
        'https://storage.googleapis.com/verticalai.appspot.com/default/avatars/default_avatar.glb',
        '',
        'https://storage.googleapis.com/verticalai.appspot.com/default/avatars/default_head.png',
        '',
        'other'
      );

      let char =
        this.world.characters[0] ??
        new SceneCharacter(
          character,
          {
            // x: 15000,
            // y: 250,
            // z: 200,
            x: 100,
            y: 100,
            z: 100,
          },
          {
            x: 0,
            y: 0,
            z: 0,
          },
          {
            x: 1,
            y: 1,
            z: 1,
          }
        );

      this.selectedCharacter.next(char);

      // this.characters = this.world.characters.map((c) => {
      //   return {
      //     currentPos: c.spawn,
      //     ...c,
      //   };
      // });

      // if (this.characters.length == 0) {
      //   this.characters = [
      //     {
      //       currentPos: char.spawn,
      //       ...char,
      //     },
      //   ];
      // }

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
    } else if (canvas && this.world && this.selectedCharacter) {
      // Babylon
      this.engine = new BABYLON.Engine(canvas, true);

      //Creating scene
      let res = await this.createScene2(this.engine, this.world);

      if (res) {
        this.engine.enableOfflineSupport = false;
        this.loaded.next('Launching Scene');

        // Resize
        window.addEventListener('resize', () => {
          this.engine?.resize();
        });
      }
    }
  }

  async createScene2(engine: BABYLON.Engine, world: World) {
    if (!this.selectedCharacter.value) {
      console.log('po');
      return undefined;
    }

    var scene = new BABYLON.Scene(engine);
    // const gl = new BABYLON.GlowLayer('glow', scene);

    var skybox: BABYLON.Mesh | undefined;

    if (world.sky && !world.sky.hidden) {
      skybox = BABYLON.MeshBuilder.CreateSphere(
        'world',
        {
          diameterX: world.width * 2,
          diameterZ: world.height * 2,
          diameterY: world.height * 2,
        },
        scene
      );

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

      var extraGroundMaterial = new BABYLON.StandardMaterial(
        'extraGround',
        scene
      );

      if (world.ground.texture.diffuse) {
        extraGroundMaterial.diffuseTexture = new BABYLON.Texture(
          world.ground.texture.diffuse,
          scene
        );
      }

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
              width: world.width * 2,
              height: world.height * 2,
              subdivisions: 32,
            },
            scene
          );
          lava.position.y = world.ground.liquid.level;

          let lavaMaterial = new MATERIALS.LavaMaterial('lava_material', scene);
          lava.isPickable = true;

          lavaMaterial.noiseTexture = new BABYLON.Texture(
            this.emulatorService.isEmulator
              ? 'http://localhost:9199/v0/b/unfathom-ai.appspot.com/o/lava_cloud.png?alt=media'
              : 'https://storage.googleapis.com/verticalai.appspot.com/default/lava/lava_cloud.png',
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

    var avatar = this.selectedCharacter.value.character.assetUrl;

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

    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      '',
      '',
      avatar,
      scene,
      undefined,
      '.glb'
    );

    var actor = result.meshes[0] as BABYLON.Mesh;

    actor.id = this.selectedCharacter.value.character.id;

    actor.scaling.x = this.selectedCharacter.value.scale.x;
    actor.scaling.y = this.selectedCharacter.value.scale.y;
    actor.scaling.z = this.selectedCharacter.value.scale.z;

    actor.checkCollisions = true;

    actor.position.y = this.selectedCharacter.value.spawn.y; //world.size / 10 + 20; //35;

    actor.position.z = this.selectedCharacter.value.spawn.z; //world.size / 5 - 400;
    actor.position.x = this.selectedCharacter.value.spawn.x; //world.size / 10 + 900;

    actor.rotation = new BABYLON.Vector3(
      this.toRadians(this.selectedCharacter.value.direction.x),
      this.toRadians(this.selectedCharacter.value.direction.y),
      this.toRadians(this.selectedCharacter.value.direction.z)
    );

    let animationsDir =
      'https://storage.googleapis.com/verticalai.appspot.com/default/avatars/animations/';

    await this.importAnimation(animationsDir, 'Walk.glb', scene);
    await this.importAnimation(animationsDir, 'Idle.glb', scene);
    await this.importAnimation(animationsDir, 'Jump.glb', scene);
    await this.importAnimation(animationsDir, 'Run.glb', scene);
    await this.importAnimation(animationsDir, 'Fall.glb', scene);

    const walk = scene.getAnimationGroupByName('M_Walk_001')!;
    const run = scene.getAnimationGroupByName('M_Run_001')!;
    const idle = scene.getAnimationGroupByName(
      'M_Standing_Idle_Variations_001'
    )!;
    const runJump = scene.getAnimationGroupByName('M_Walk_Jump_003')!;
    const idleJump = scene.getAnimationGroupByName('M_Walk_Jump_003')!;
    const fall = scene.getAnimationGroupByName('F_Falling_Idle_001')!;

    this.loaded.next('Downloading Assets');

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

        var object =
          BABYLON.BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(
            result.meshes[0] as BABYLON.Mesh
          );

        if (asset.asset.id == 'castle') {
          let d = result.meshes.find((m) => m.id == 'LAVAFALL');
          let mat = new BABYLON.StandardMaterial('fount', scene);

          mat.diffuseTexture = new BABYLON.Texture(
            world.ground.liquid.texture.diffuse,
            scene
          );
          mat.emissiveTexture = new BABYLON.Texture(
            world.ground.liquid.texture.diffuse,
            scene
          );

          scene.beforeRender = () => {
            (mat.diffuseTexture as BABYLON.Texture).uOffset += 0.0025;
          };

          d.material = mat;
        }

        object.id = asset.asset.id;

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

    await Promise.all(
      this.world.characters.map(async (c) => {
        if (c.character.id != this.selectedCharacter.value.character.id) {
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

          actor2.position = new BABYLON.Vector3(
            c.spawn.x,
            c.spawn.y,
            c.spawn.z
          );

          actor2.rotation = new BABYLON.Vector3(
            this.toRadians(c.direction.x),
            this.toRadians(c.direction.y),
            this.toRadians(c.direction.z)
          );

          this.setAnimation(actor2, idle, scene, `default_${c.character.id}`);
        }
      })
    );

    var generator = new BABYLON.ShadowGenerator(world.width, light);
    generator.usePoissonSampling = false;
    // generator.bias = 0.000001;
    generator.useBlurExponentialShadowMap = true;
    generator.useKernelBlur = true;
    generator.blurKernel = 5;
    generator.setTransparencyShadow(true);
    generator.addShadowCaster(actor, true);

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

    this.selectedCharacter.subscribe((c) => {
      //
      if (c) {
        let actorMesh = scene.getMeshById(c.character.id) as BABYLON.Mesh;

        if (actorMesh) {
          let idleClone = this.cloneAnimation(
            actorMesh,
            idle,
            scene,
            `idle_${this.selectedCharacter.value}`
          );

          let walkClone = this.cloneAnimation(
            actorMesh,
            walk,
            scene,
            `walk_${this.selectedCharacter.value}`
          );

          let runClone = this.cloneAnimation(
            actorMesh,
            run,
            scene,
            `run_${this.selectedCharacter.value}`
          );

          let idleJumpClone = this.cloneAnimation(
            actorMesh,
            idleJump,
            scene,
            `jump_${this.selectedCharacter.value}`
          );

          let fallClone = this.cloneAnimation(
            actorMesh,
            fall,
            scene,
            `fall_${this.selectedCharacter.value}`
          );

          let runJumpClone = this.cloneAnimation(
            actorMesh,
            runJump,
            scene,
            `runJump_${this.selectedCharacter.value}`
          );

          let agMap = {
            walk: walkClone,
            idle: idleClone,
            run: runClone,
            idleJump: idleJumpClone,
            runJump: runJumpClone,
            fall: fallClone,
          };

          this.initializeCharacterController(
            actorMesh,
            scene,
            agMap,
            undefined,
            undefined,
            true
          );
        }
      }
    });

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

    engine.runRenderLoop(() => {
      // if (ground.isReady && ground.subMeshes?.length == 1) {
      //   ground.subdivide(20); // Subdivide to optimize picking
      // }

      // Camera

      let camera = scene.activeCamera as BABYLON.ArcRotateCamera;

      if (camera) {
        if (camera.beta < 0.1) camera.beta = 0.1;

        if (camera.radius > 1){
          console.log(camera.radius)
          if (camera.beta > (Math.PI / 2) * 0.92)
          camera.beta = (Math.PI / 2) * 0.92;
        }

        if (camera.radius > 20)
          camera.radius = 20;

        if (camera.radius < 0) camera.radius = 0;

        scene.render();
      }

      // Render scene

      // Animations
      skybox.rotation.y += 0.0001 * scene.getAnimationRatio();
    });

    scene.whenReadyAsync(true).then(() => {
      this.loaded.next('');
      setTimeout(() => {
        engine?.resize();
      }, 1);
    });
  }

  initializeCharacterController(
    actor: BABYLON.Mesh,
    scene: BABYLON.Scene,
    agMap: Dict<BABYLON.AnimationGroup>,
    speed: number = 7.5,
    gravity: number = 50,
    forward: boolean = true
  ) {
    if (this.cc && scene.activeCamera) {
      this.cc.stop();
      this.cc = undefined;
      scene.activeCamera!.detachControl();
      scene.removeCamera(scene.activeCamera);
    }
    setTimeout(() => {
      var alpha = -(Math.PI / 2 + actor.rotation.y);
      var beta = Math.PI / 2.5;
      var camTarget = new BABYLON.Vector3(
        actor.position.x,
        actor.position.y + 1.5,
        actor.position.z
      );

      var camera = new BABYLON.ArcRotateCamera(
        'ArcRotateCamera',
        alpha,
        beta,
        10,
        camTarget,
        scene
      );

      camera.maxZ = this.world!.width * 2;

      camera.lowerRadiusLimit = 0;
      // camera.upperRadiusLimit = 0;
      camera.radius = 0; //7.5

      actor.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

      this.cc = new CharacterController(actor, camera, scene, agMap);

      this.cc?.setMode(0);

      this.cc?.setFaceForward(forward);
      this.cc?.setTurningOff(false);

      this.cc?.setCameraTarget(new BABYLON.Vector3(0, 1.5, 0));

      this.cc?.setNoFirstPerson(false);
      this.cc?.setStepOffset(0.4);
      this.cc?.setSlopeLimit(30, 60);
      this.cc?.setWalkSpeed(speed);
      this.cc?.setTurnSpeed(20);
      this.cc?.setJumpSpeed(speed * 2.5);
      this.cc?.setRunSpeed(speed * 4);
      this.cc?.setGravity(gravity);

      this.cc?.enableBlending(0.05);
      this.cc?.setCameraElasticity(false);
      this.cc?.makeObstructionInvisible(false);
      this.cc?.start();

      var canvas = document.getElementById('canvas') as HTMLCanvasElement;
      scene.activeCamera!.attachControl(canvas);
    }, 10);

    // this.cc?.setGravity(0.5)
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

  mountAsset(id: string, gravity: number) {
    let scene = this.engine?.scenes[0];
    if (scene && this.selectedCharacter.value) {
      let assetMesh = scene.getMeshById(id) as BABYLON.Mesh;
      let actorMesh = scene.getMeshById(
        this.selectedCharacter.value.character.id
      ) as BABYLON.Mesh;

      let asset = this.world?.assets.find((a) => a.asset.id == id);

      if (assetMesh && actorMesh && asset) {
        // actorMesh.setParent(assetMesh, true, true);
        // actorMesh.setEnabled(false);
        this.initializeCharacterController(
          assetMesh,
          scene,
          {},
          asset.movement.speed,
          asset.movement.gravity,
          false
        );
        setTimeout(() => {
          this.mountedAsset.next(id);
        }, 20);
      }
    }
  }

  selectCharacter(character: string) {
    let scene = this.engine?.scenes[0];
    let same = this.world.characters.find((c) => c.character.id == character);
    if (scene && this.selectedCharacter.value && same) {
      let actorMesh = scene.getMeshById(same.character.id) as BABYLON.Mesh;
      let oldActorMesh = scene.getMeshById(
        this.selectedCharacter.value.character.id
      ) as BABYLON.Mesh;
      const anim = scene.getAnimationGroupByName(
        'M_Standing_Idle_Variations_001'
      )!;
      if (oldActorMesh && anim) {
        this.setAnimation(
          oldActorMesh,
          anim,
          scene,
          `default_${this.selectedCharacter.value}`
        );
      }
      if (actorMesh) {
        this.selectedCharacter.next(same);
      }
    }
  }

  dismountAsset(id: string) {
    let scene = this.engine?.scenes[0];
    if (scene && this.selectedCharacter.value) {
      let assetMesh = scene.getMeshById(id) as BABYLON.Mesh;
      let actorMesh = scene.getMeshById(
        this.selectedCharacter.value.character.id
      ) as BABYLON.Mesh;

      if (assetMesh && actorMesh) {
        // assetMesh.removeChild(actorMesh, true);
        // actorMesh.setEnabled(true);
        this.mountedAsset.next(undefined);
        this.selectCharacter(this.selectedCharacter.value.character.id);
      }
    }
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
    this.cc = undefined;
    this.agMap = undefined;
    this.selectedCharacter.next(undefined);
    this.mountedAsset.next(undefined);
  }
}
