import { Injectable } from '@angular/core';
import { Scene } from './models/workflow/scene.model';
import { Executable } from './models/workflow/executable.model';
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

@Injectable({
  providedIn: 'root',
})
export class PrototypeService {
  selectedCharacter = new BehaviorSubject<string | undefined>(undefined);

  characters: {
    spawn: { x: number; y: number; z: number };
    id: string;
    currentPos: { x: number; y: number; z: number };
    scale: number;
    direction: { x: number; y: number; z: number };
  }[] = [];

  availableCharacters: Dict<Character> = {};

  world?: World;
  scene?: Scene;
  project?: Executable;
  cc?: CharacterController;

  engine?: BABYLON.Engine;
  agMap?: Dict<BABYLON.AnimationGroup>;

  loaded = new BehaviorSubject<string>('');

  mountedAsset = new BehaviorSubject<string | undefined>(undefined);

  constructor(private db: AngularFirestore) {}

  init(scene: Scene, project: Executable) {
    this.deinit();

    this.scene = scene;
    this.world = scene.world;

    this.project = project;

    if (this.scene) {
      if (Object.keys(this.scene.characters).length == 0) {
        console.log('DEFAULT');
        this.availableCharacters['default'] = new Character(
          'default',
          'Default',
          'https://storage.googleapis.com/verticalai.appspot.com/default/avatars/default_avatar.glb',
          '',
          'https://storage.googleapis.com/verticalai.appspot.com/default/avatars/default_head.png',
          '',
          'other'
        );
      } else {
        this.availableCharacters = this.project.characters ?? {};
      }

      let char = this.scene.characters[0] ?? {
        id: 'default',
        role: 'other',
        spawn: {
          x: 200,
          y: 1,
          z: 200,
        },
        direction: {
          x: 0,
          y: 0,
          z: 0,
        },
        scale: 1,
      };

      this.selectedCharacter.next(char.id);

      this.characters = this.scene.characters.map((c) => {
        return {
          currentPos: c.spawn,
          ...c,
        };
      });

      if (this.characters.length == 0) {
        this.characters = [
          {
            currentPos: char.spawn,
            ...char,
          },
        ];
      }

      if (this.world && this.project) {
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
    } else if (canvas && this.world && this.scene && this.selectedCharacter) {
      // Babylon
      this.engine = new BABYLON.Engine(canvas, true);

      //Creating scene
      let res = await this.createScene2(this.engine, this.world, this.scene);

      if (res) {
        let scene = res;

        this.engine.enableOfflineSupport = false;
        this.loaded.next('Launching Scene');

        scene.whenReadyAsync(true).then(() => {
          this.loaded.next('');
          setTimeout(() => {
            this.engine?.resize();
          }, 1);
        });

        // Once the scene is loaded, we register a render loop to render it
        this.engine.runRenderLoop(() => {
          let cam = scene.activeCamera as BABYLON.ArcRotateCamera;
          if (cam) {
            const angle = BABYLON.Vector3.GetAngleBetweenVectorsOnPlane(
              cam.getForwardRay().direction,
              BABYLON.Vector3.Backward(),
              BABYLON.Vector3.Up()
            );

            // actor.rotationQuaternion = BABYLON.Quaternion.RotationAxis(
            //   new BABYLON.Vector3(1, 0, 0),
            //   100
            // );

            if (this.selectedCharacter.value) {
              let actor = scene.getMeshById(
                this.selectedCharacter.value
              ) as BABYLON.Mesh;

              actor.rotationQuaternion = BABYLON.Quaternion.RotationAxis(
                BABYLON.Vector3.Up(),
                -angle
              );
            }
            scene.render();
          }
        });

        // Resize
        window.addEventListener('resize', () => {
          this.engine?.resize();
        });
      }
    }
  }

  async createScene2(engine: BABYLON.Engine, world: World, worldScene: Scene) {
    if (!this.selectedCharacter.value) {
      return undefined;
    }

    let sameCharacter = this.characters.find(
      (c) => c.id == this.selectedCharacter.value
    );

    if (!sameCharacter) {
      return undefined;
    }

    var scene = new BABYLON.Scene(engine);

    // const gl = new BABYLON.GlowLayer('glow', scene);

    var skybox: BABYLON.Mesh | undefined;

    if (world.sky) {
      skybox = BABYLON.MeshBuilder.CreateSphere(
        'world',
        {
          diameterX: world.size,
          diameterZ: world.size,
          diameterY: world.sky.height,
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

    if (world.ground) {
      var ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
        'ground',
        world.ground.heightMap,
        {
          width: world.size,
          height: world.size,
          subdivisions: world.ground.maxHeight / 20,
          minHeight: world.ground.minHeight,
          maxHeight: world.ground.maxHeight,
          updatable: true,
        },
        scene
      );

      var groundMaterial = new BABYLON.StandardMaterial('ground', scene);

      var uvScaleConstant = new BABYLON.Vector2(
        world.size / 166,
        world.size / 166
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
        world.size,
        world.size,
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

        if (world.ground.liquid['water']) {
          var water = BABYLON.MeshBuilder.CreateGround(
            'water',
            { width: world.size, height: world.size, subdivisions: 32 },
            scene
          );
          water.position.y = world.ground.liquid['water'].level;

          var waterMaterial = new MATERIALS.WaterMaterial(
            'water_material',
            scene
          );

          if (world.ground.liquid['water'].texture.bump) {
            waterMaterial.bumpTexture = new BABYLON.Texture(
              world.ground.liquid['water'].texture.bump,
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

        if (world.ground.liquid['lava']) {
          var lava = BABYLON.MeshBuilder.CreateGround(
            'lava',
            { width: world.size, height: world.size, subdivisions: 32 },
            scene
          );
          lava.position.y = world.ground.liquid['lava'].level;

          var lavaMaterial = new MATERIALS.LavaMaterial(
            'water_material',
            scene
          );

          lavaMaterial.noiseTexture = new BABYLON.Texture(
            'https://storage.googleapis.com/verticalai.appspot.com/default/lava/lava_cloud.png',
            scene
          );

          if (world.ground.liquid['lava'].texture.diffuse) {
            lavaMaterial.diffuseTexture = new BABYLON.Texture(
              world.ground.liquid['lava'].texture.diffuse,
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

    var avatar =
      this.availableCharacters[this.selectedCharacter.value].assetUrl;

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

    actor.id = this.selectedCharacter.value;

    actor.scaling.scaleInPlace(sameCharacter.scale);
    actor.checkCollisions = true;

    actor.position.y = sameCharacter.spawn.y; //world.size / 10 + 20; //35;

    actor.position.z = sameCharacter.spawn.z; //world.size / 5 - 400;
    actor.position.x = sameCharacter.spawn.x; //world.size / 10 + 900;

    actor.rotation = new BABYLON.Vector3(
      this.toRadians(sameCharacter.direction.x),
      this.toRadians(sameCharacter.direction.y),
      this.toRadians(sameCharacter.direction.z)
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
      worldScene.assets.map(async (asset) => {
        let fullAsset = this.project?.assets[asset.id];

        if (fullAsset) {
          const result = await BABYLON.SceneLoader.ImportMeshAsync(
            '',
            '',
            fullAsset.assetUrl,
            scene,
            undefined,
            '.glb'
          );

          result.meshes.forEach((mesh) => (mesh.checkCollisions = true));

          var object = result.meshes[0] as BABYLON.Mesh;
          object.id = asset.id;

          object.scaling.scaleInPlace(asset.scale);

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

          if (asset.movement.canMount) {
            let box = object.getHierarchyBoundingVectors();

            object.ellipsoidOffset = new BABYLON.Vector3(
              0,
              -(box.max.y - box.min.y),
              0
            );

            const dsm = new BABYLON.DeviceSourceManager(scene.getEngine());

            dsm.onDeviceConnectedObservable.add((eventData) => {
              if (eventData.deviceType === BABYLON.DeviceType.Keyboard) {
                const keyboard = dsm.getDeviceSource(
                  BABYLON.DeviceType.Keyboard
                );

                let delta = 0;
                const linearSpeed = asset.movement.speed ?? 1;
                const angularSpeed = 5;
                const translation = new BABYLON.Vector3(0, 0, 0);
                const rotation = new BABYLON.Vector3(0, 0, 0);

                scene.beforeRender = () => {
                  const w = keyboard?.getInput(49);
                  const a = keyboard?.getInput(51);
                  const d = keyboard?.getInput(50);
                  const y = keyboard?.getInput(52);
                  const shift = keyboard?.getInput(57);
                  const shift2 = keyboard?.getInput(48);

                  object.locallyTranslate(translation);

                  delta = scene.deltaTime ? scene.deltaTime / 1000 : 0;
                  translation.set(0, 0, 0);
                  rotation.set(0, 0, 0);

                  if (w === 1) {
                    if (shift) {
                      translation.z = linearSpeed * delta;
                    } else {
                      translation.z = -linearSpeed * delta;
                    }
                  }
                  if (d === 1) {
                    if (shift) {
                      rotation.y = angularSpeed * delta;
                    } else {
                      rotation.y = -angularSpeed * delta;
                    }
                  }

                  if (a === 1) {
                    if (shift) {
                      rotation.x -= 0.05;
                    } else {
                      rotation.x = 0.05;
                    }
                  }

                  object.rotation.y += rotation.y;
                  object.rotation.x += rotation.x;
                  object.rotation.z += rotation.z;

                  if (object.intersectsMesh(actor, false, true)) {
                  }
                  object.locallyTranslate(translation);
                };
              }
            });
          }
        }
      })
    );

    await Promise.all(
      this.characters.map(async (c) => {
        if (c.id != this.selectedCharacter.value) {
          var avatar2 = this.project?.characters[c.id].assetUrl;
          const result2 = await BABYLON.SceneLoader.ImportMeshAsync(
            '',
            '',
            avatar2,
            scene,
            undefined,
            '.glb'
          );

          var actor2 = result2.meshes[0] as BABYLON.Mesh;
          actor2.id = c.id;

          actor2.scaling.scaleInPlace(c.scale);
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

          this.setAnimation(actor2, idle, scene, `default_${c.id}`);
        }
      })
    );

    var generator = new BABYLON.ShadowGenerator(world.size, light);
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

    this.selectedCharacter.subscribe((c) => {
      //
      if (c) {
        let actorMesh = scene.getMeshById(c) as BABYLON.Mesh;

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

          this.initializeCharacterController(actorMesh, scene, agMap);
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

    return scene;
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

      camera.maxZ = this.world!.size * 2;

      actor.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

      this.cc = new CharacterController(actor, camera, scene, agMap);
      this.cc?.setMode(0);

      this.cc?.setFaceForward(forward);

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
        this.selectedCharacter.value
      ) as BABYLON.Mesh;

      let asset = this.scene?.assets.find((a) => a.id == id);

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

  selectCharacter(id: string) {
    let scene = this.engine?.scenes[0];
    if (scene && this.selectedCharacter.value) {
      let actorMesh = scene.getMeshById(id) as BABYLON.Mesh;
      let oldActorMesh = scene.getMeshById(
        this.selectedCharacter.value
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
        this.selectedCharacter.next(id);
      }
    }
  }

  dismountAsset(id: string) {
    let scene = this.engine?.scenes[0];
    if (scene && this.selectedCharacter.value) {
      let assetMesh = scene.getMeshById(id) as BABYLON.Mesh;
      let actorMesh = scene.getMeshById(
        this.selectedCharacter.value
      ) as BABYLON.Mesh;

      if (assetMesh && actorMesh) {
        // assetMesh.removeChild(actorMesh, true);
        // actorMesh.setEnabled(true);
        this.mountedAsset.next(undefined);
        this.selectCharacter(this.selectedCharacter.value);
      }
    }
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
    this.cc = undefined;
    this.agMap = undefined;
    this.selectedCharacter.next(undefined);
    this.mountedAsset.next(undefined);
  }
}
