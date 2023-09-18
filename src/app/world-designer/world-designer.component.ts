import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { World } from '../models/workflow/world.model';
import * as BABYLON from 'babylonjs';
import * as MATERIALS from 'babylonjs-materials';
import { CharacterController } from 'babylonjs-charactercontroller';
import 'babylonjs-loaders';
import {
  GLTFFileLoader,
  GLTFLoaderAnimationStartMode,
} from 'babylonjs-loaders';
import { Scene } from '../models/workflow/scene.model';
import { DesignerService } from '../designer.service';
import { LiquidType } from '../models/workflow/liquid-type.enum';
import { Character } from '../models/workflow/character.model';
import { Executable } from '../models/workflow/executable.model';
import { ProjectService } from '../project.service';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';

@Component({
  selector: 'app-world-designer',
  templateUrl: './world-designer.component.html',
  styleUrls: ['./world-designer.component.scss'],
})
export class WorldDesignerComponent implements OnInit, OnDestroy {
  @Input() world?: World;
  @Input() scene?: Scene;
  @Input() project?: Executable;

  selectedCharacter?: {
    spawn: { x: number; y: number; z: number };
    id: string;
    currentPos: { x: number; y: number; z: number };
    scale: number;
    direction: { x: number; y: number; z: number };
  };

  constructor(
    private designerService?: DesignerService,
    private projectService?: ProjectService
  ) {}

  ngOnInit(): void {
    // this.designerService?.openWorld.subscribe((world) => {
    //   this.world = world;
    //   console.log(world)
    // });

    // this.projectService?.workflow.subscribe((project) => {
    //   this.project = project;
    // });

    if (this.scene && this.scene.characters[0]) {
      this.selectedCharacter = {
        currentPos: this.scene.characters[0].spawn,
        ...this.scene?.characters[0],
      };
      if (this.world && this.project) {
        this.initWorld();
      } else {
        console.log('oi');
      }
    }

    // this.designerService?.openStep.subscribe((scene) => {
    //   this.scene = scene?.data?.ngArguments?.scene as Scene;

    // });
  }

  engine?: BABYLON.Engine;

  async initWorld() {
    var canvas = document.getElementById('canvas') as HTMLCanvasElement;

    // Check support
    if (!BABYLON.Engine.isSupported()) {
      window.alert('Browser not supported');
    } else if (canvas && this.world && this.scene && this.selectedCharacter) {
      // Babylon
      this.engine = new BABYLON.Engine(canvas, true);

      //Creating scene
      var { scene, actor } = await this.createScene2(
        this.engine,
        this.world,
        this.scene,
        this.selectedCharacter
      );

      scene.activeCamera!.attachControl(canvas);

      this.engine.enableOfflineSupport = false;

      // Once the scene is loaded, we register a render loop to render it
      this.engine.runRenderLoop(function () {
        let cam = scene.activeCamera as BABYLON.ArcRotateCamera;
        const angle = BABYLON.Vector3.GetAngleBetweenVectorsOnPlane(
          cam.getForwardRay().direction,
          BABYLON.Vector3.Backward(),
          BABYLON.Vector3.Up()
        );

        // actor.rotationQuaternion = BABYLON.Quaternion.RotationAxis(
        //   new BABYLON.Vector3(1, 0, 0),
        //   100
        // );

        actor.rotationQuaternion = BABYLON.Quaternion.RotationAxis(
          BABYLON.Vector3.Up(),
          -angle
        );

        scene.render();
      });

      setTimeout(() => {
        this.engine?.resize();
      }, 100);

      // Resize
      window.addEventListener('resize', () => {
        this.engine?.resize();
      });
    }
  }

  async createScene2(
    engine: BABYLON.Engine,
    world: World,
    worldScene: Scene,
    character: {
      spawn: { x: number; y: number; z: number };
      id: string;
      currentPos: { x: number; y: number; z: number };
      scale: number;
      direction: { x: number; y: number; z: number };
    }
  ) {
    var scene = new BABYLON.Scene(engine);

    // const gl = new BABYLON.GlowLayer('glow', scene);

    if (world.sky) {
      const skybox = BABYLON.MeshBuilder.CreateSphere(
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

      const texture = new BABYLON.Texture(world.sky.texture, scene);

      texture.uScale = 1;
      texture.vScale = 1;

      material.emissiveTexture = texture;
      material.backFaceCulling = false;
      skybox.material = material;
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
        },
        scene
      );

      var groundMaterial = new BABYLON.StandardMaterial('ground', scene);
      let groundTexture = new BABYLON.Texture(world.ground.texture, scene);
      groundTexture.uScale = world.size / 166;
      groundTexture.vScale = world.size / 166;
      groundMaterial.diffuseTexture = groundTexture;

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
      extraGroundMaterial.diffuseTexture = new BABYLON.Texture(
        world.ground.texture,
        scene
      );

      extraGround.position.y = -2.05;

      extraGround.material = extraGroundMaterial;

      ground.checkCollisions = true;
      extraGround.checkCollisions = true;

      if (world.ground.liquid) {
        BABYLON.Engine.ShadersRepository = '';
        var water = BABYLON.MeshBuilder.CreateGround(
          'water',
          { width: world.size, height: world.size, subdivisions: 32 },
          scene
        );

        water.position.y = world.ground.liquid.level;

        if (world.ground.liquid.liquid == LiquidType.water) {
          var waterMaterial = new MATERIALS.WaterMaterial(
            'water_material',
            scene
          );
          waterMaterial.bumpTexture = new BABYLON.Texture(
            world.ground.liquid.texture,
            scene
          ); // Set the bump texture

          waterMaterial.refractionTexture?.renderList?.push(extraGround);
          waterMaterial.refractionTexture?.renderList?.push(ground);
          // waterMaterial.reflectionTexture?.renderList?.push(skybox);

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
        } else if (world.ground.liquid.liquid == LiquidType.lava) {
          var lavaMaterial = new MATERIALS.LavaMaterial(
            'water_material',
            scene
          );

          lavaMaterial.noiseTexture = new BABYLON.Texture(
            'assets/images/lava_cloud.png',
            scene
          );

          lavaMaterial.diffuseTexture = new BABYLON.Texture(
            world.ground.liquid.texture,
            scene
          );
          lavaMaterial.speed = 0.5;
          lavaMaterial.fogColor = new BABYLON.Color3(1, 0, 0);
          lavaMaterial.unlit = true;
          water.material = lavaMaterial;
        }
      }
    }

    var avatar = this.project?.characters[character.id].assetUrl;

    // .id == 'TgSTaxx8MZ1PFXVhS8V4'
    //   ? 'assets/mustafarav2.glb'
    //   : 'assets/sandyav.glb';

    console.log(world.id);

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

    actor.scaling.scaleInPlace(character.scale);
    actor.checkCollisions = true;

    actor.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

    actor.position.y = character.spawn.y; //world.size / 10 + 20; //35;

    actor.position.z = character.spawn.z; //world.size / 5 - 400;
    actor.position.x = character.spawn.x; //world.size / 10 + 900;

    let animationsDir = '/assets/animations/';

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

    await Promise.all(
      worldScene.assets.map(async (asset) => {
        const result = await BABYLON.SceneLoader.ImportMeshAsync(
          '',
          '',
          asset.data.assetUrl,
          scene,
          undefined,
          '.glb'
        );

        result.meshes.forEach((mesh) => (mesh.checkCollisions = true));

        var object = result.meshes[0] as BABYLON.Mesh;

        object.scaling.scaleInPlace(asset.scale);

        object.rotation = new BABYLON.Vector3(
          asset.direction.x,
          asset.direction.y,
          asset.direction.z
        );

        // actor4.translate(actor4.forward, 810);
        // actor4.translate(actor4.right, -15);

        object.position = new BABYLON.Vector3(
          asset.spawn.x,
          asset.spawn.y,
          asset.spawn.z
        );

        if (asset.data.type == 'movable') {
          let box = object.getHierarchyBoundingVectors();

          object.ellipsoidOffset = new BABYLON.Vector3(
            0,
            -(box.max.y - box.min.y),
            0
          );

          const dsm = new BABYLON.DeviceSourceManager(scene.getEngine());

          var moving = false;

          dsm.onDeviceConnectedObservable.add((eventData) => {
            if (eventData.deviceType === BABYLON.DeviceType.Keyboard) {
              const keyboard = dsm.getDeviceSource(BABYLON.DeviceType.Keyboard);

              let delta = 0;
              const linearSpeed = 600;
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
                    rotation.x += 0.05;
                  }
                }

                object.rotation.y += rotation.y;
                object.rotation.x += rotation.x;
                object.rotation.z += rotation.z;

                if (object.intersectsMesh(actor, false, true)) {
                  if (!moving && shift) {
                    moving = true;
                    actor.setParent(object, true, true);
                    cc.setAvatar(object);

                    cc.setGravity(1);
                  } else if (moving && shift2) {
                    console.log('oi');
                    object.removeChild(actor, true);
                    moving = false;
                    cc.setAvatar(actor);
                    cc.setActionMap(agMap as any);

                    cc.setMode(0);

                    cc.setCameraTarget(new BABYLON.Vector3(0, 1.5, 0));

                    cc.setNoFirstPerson(false);
                    cc.setStepOffset(0.4);
                    cc.setSlopeLimit(30, 60);
                    cc.setWalkSpeed(7.5);
                    cc.setTurnSpeed(20);
                    cc.setJumpSpeed(20);
                    cc.setRunSpeed(30);
                    cc.setGravity(50);
                  }
                }

                // camera.rotation.y += rotation.y;
                // camera.rotation.x += rotation.x;
                // camera.rotation.z += rotation.z;

                // camera.setPosition(camera.position.addInPlace(translation))
                // } else {
                //   // actor3.removeChild(actor);
                // }

                object.locallyTranslate(translation);

                // if (y === 1) {
                //   if (shift){
                //     actor3.rotation.y -= 0.075
                //     return
                //   }
                //   actor3.rotation.y += 0.075;
                // }
              };

              // var actionParameter = { trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: actor3 };

              //   actor.actionManager?.registerAction(new BABYLON.ExecuteCodeAction(actionParameter, function(event: BABYLON.ActionEvent)
              //   {
              //       console.log("Hit!");
              //       actor.position.y = actor.position.y
              //   }));
            }
          });
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

    camera.maxZ = world.size * 2

    BABYLON.SceneLoader.OnPluginActivatedObservable.add(function (loader) {
      if (loader.name === 'gltf') {
        (loader as GLTFFileLoader).animationStartMode =
          GLTFLoaderAnimationStartMode.NONE;
      }
    });

    const agMap = {
      walk,
      idle,
      run,
      idleJump,
      runJump,
      fall,
    };

    let cc = new CharacterController(actor, camera, scene, agMap);

    cc.setMode(0);

    cc.setFaceForward(true);

    cc.setCameraTarget(new BABYLON.Vector3(0, 1.5, 0));

    cc.setNoFirstPerson(false);
    cc.setStepOffset(0.4);
    cc.setSlopeLimit(30, 60);
    cc.setWalkSpeed(7.5);
    cc.setTurnSpeed(20);
    cc.setJumpSpeed(20);
    cc.setRunSpeed(30);
    cc.setGravity(50);

    cc.enableBlending(0.05);
    cc.setCameraElasticity(false);
    cc.makeObstructionInvisible(false);
    // cc.setGravity(0.5)
    cc.start();

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

    return { scene, actor };
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

  ngOnDestroy(): void {
    this.engine?.scenes.forEach((scene) => {
      scene.clearCachedVertexData();
      scene.cleanCachedTextureBuffer();
    });

    this.engine?.dispose();
    this.engine = undefined;
  }
}
