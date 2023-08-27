import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SceneDefinition } from './models/workflow/scene-definition.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { register } from '@antv/x6-angular-shape';
import { NodeComponent } from './node/node.component';
import { Graph, Cell, Edge } from '@antv/x6';
import { Snapline } from '@antv/x6-plugin-snapline';
import { Selection } from '@antv/x6-plugin-selection';
import { Transform } from '@antv/x6-plugin-transform';
import { Scene } from './models/workflow/scene.model';
import { LoadService } from './load.service';
import { MiniMap } from '@antv/x6-plugin-minimap';
import { History } from '@antv/x6-plugin-history';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root',
})
export class DesignerService {
  constructor(private db: AngularFirestore, private themeService: ThemeService) {}

  toolboxConfiguration = new BehaviorSubject<SceneDefinition[]>([]);

  graph?: Graph;

  pubGraph = new BehaviorSubject<Graph | undefined>(undefined);
  pubJSON = new BehaviorSubject<{ cells: Cell.Properties[] } | undefined>(
    undefined
  );

  canRedo = false;
  canUndo = false;
  
  initialized = false

  openStep = new BehaviorSubject<Cell.Properties | undefined>(undefined);

  // this.toolboxConfiguration.next([new SceneDefinition("Scene", "", "scene")])

  loadGroups(callback: (result: SceneDefinition[]) => any) {
    try {
      this.db
        .collection('Components')
        .valueChanges()
        .subscribe((docs) => {
          callback(docs as SceneDefinition[]);
          this.toolboxConfiguration.next(docs as SceneDefinition[]);
        });
    } catch (error) {
      this.toolboxConfiguration.next([]);
      callback([]);
    }
  }

  setScene(scene: Scene, id: string) {
    let node = this.graph
      ?.getCells()
      .find((cell) => (cell.data.ngArguments.scene as Scene).id == id);

    node?.updateData({
      ngArguments: {
        scene: scene,
      },
    });

    if (node && node.id == this.openStep.value?.id){
      console.log("next")
      this.openStep.next(node.toJSON())
    }


    let json = this.graph?.toJSON();
    if (json) {
      this.pubGraph.next(this.graph);
      this.pubJSON!.next(json as any);
    }
  }

  initGraph(injector: Injector) {
    let container = document.getElementById('container');

    if (container) {
      this.graph = new Graph({
        container: document.getElementById('container')!,
        autoResize: true,
        background: {
          color: 'var(--sectionBackgroundColor)',
        },
        
        panning: true,
        mousewheel: true,
        connecting: {
          router: 'metro',
          connector: 'rounded',
          allowBlank: false,
          allowMulti: true,
          allowLoop: false,
          allowNode: true,
          allowPort: false,
          highlight: true,
          allowEdge: false,


          createEdge(args) {
            return this.createEdge({
              ...args,
              // label: 'ok',
              tools: ['button-remove'],
            });
          },
          validateConnection(args) {
            let source = args.sourceCell?.id;
            let target = args.targetCell?.id;
            let connected = this.getConnectedEdges(args.targetCell!);
            let same = connected.find((c: Edge) => {
              let j = c.toJSON();
              return (
                (j['source'].cell == source && j['target'].cell == target) ||
                (j['source'].cell == target && j['target'].cell == source)
              );
            });
            if (same) {
              return false;
            }
            return true;
          },
        },
        highlighting: {
          // Render a bounding box around the connection pile when the connection pile can be connected
          nodeAvailable: {
            name: 'stroke',
            args: {
              attrs: {
                fill: 'transparent',
                stroke: 'var(--primaryTextColor)',
                strokeWidth: 4,
              },
            },
          },
          // Render a bounding box around the connection pile when the connection pile absorbs the connection
          magnetAdsorbed: {
            name: 'stroke',
            args: {
              attrs: {
                fill: 'transparent',
                stroke: 'var(--primaryColor)',
                strokeWidth: 4,
              },
            },
          },
        },
        grid: {
          visible: true,
          type: 'mesh',
          args: [
            {
              color:
                this.themeService.themes[this.themeService.theme.value][
                  'gridColor'
                ], // main grid line color
              thickness: 1, // main grid line width
            },
          ],
        },
      });

      this.graph.use(
        new History({
          enabled: true,
          stackSize: 30,
          beforeAddCommand: (event, args) => {
            console.log(args);
            let a = args as any;
            if (a && a['cell'] && a['cell']['shape'] == 'edge') {
              let edge = this.graph?.getCellById(a['cell'].id);

              edge?.removeProp('sourceMagnet');
              edge?.removeProp('sourceView');
              edge?.removeProp('targetMagnet');
              edge?.removeProp('targetView');
            }
          },
        })
      );

      this.graph.use(
        new Snapline({
          enabled: true,
        })
      );

      this.graph.use(
        new Selection({
          enabled: true,
          multiple: false,
        })
      );

      this.graph.use(
        new Transform({
          resizing: {
            enabled: true,
            minWidth: 175,
            maxWidth: 700,
            minHeight: 225,
            maxHeight: 900,
            orthogonal: false,
            restrict: false,
            preserveAspectRatio: false,
          },
        })
      );

      let minimap = document.getElementById('minimap');

      if (minimap) {
        this.graph.use(
          new MiniMap({
            container: minimap,
          })
        );
      }

      this.graph.on('node:click', ({ node }) => {
        // console.log(node);
        // node.updateData({ ngArguments: { selected: true } });
        let id = node.id;
        let step = this.graph?.getCellById(id);

        if (step) {
          let json = step.toJSON();
          this.openStep.next(json);
        }
      });

      this.graph.on('history:change', () => {
        // this.setState({
        //   canRedo : graph . canRedo ( ) ,
        //   canUndo: graph.canUndo(),
        // })
        this.canRedo = this.graph?.canRedo() ?? true;
        this.canUndo = this.graph?.canUndo() ?? false;
      });

      this.graph.on('edge:selected', ({ edge }) => {
        // console.log(edge);
        // node.updateData({ ngArguments: { selected: true } });
      });

      this.graph.on('blank:click', () => {
        // console.log(node);
        // node.updateData({ ngArguments: { selected: true } });
        this.openStep.next(undefined);
      });

      this.graph.on('cell:changed', ({ cell, options }) => {
        console.log('CHANGED');
        this.processGraph(cell, options);
      });

      this.graph.on('cell:removed', ({ cell, options }) => {
        // console.log(cell);
        this.processGraph(cell, options);
      });

      this.graph.on('cell:added', ({ cell, options }) => {
        console.log('ADDED');
        this.processGraph(cell, options);
      });

      // this.graph.on('edge:selected', ({ edge, options }) => {
      //   edge.removeProp('sourceMagnet');
      //   edge.removeProp('sourceView');
      //   edge.removeProp('targetMagnet');
      //   edge.removeProp('targetView');
      // })

      register({
        shape: 'scene-node',
        width: 350,
        height: 450,
        content: NodeComponent,
        injector: injector,
      });

      this.pubGraph.next(this.graph);

      // this.designerService.graph.subscribe((graph) => {
      //   this.graph = graph;
      // });

      // setTimeout(() => {
      //   node.updateData({
      //     ngArguments: {
      //       value:
      //         'noiza remix noiza remix noiza remix noiza remix noiza remix noiza remix noiza remix',
      //     },
      //   });
      // }, 5000);
    }
  }

  processGraph(cell: Cell<Cell.Properties>, options: Cell.SetOptions) {
    console.log("tog")
    if (!options['static'] || !options) {
      if (cell.shape == 'edge') {
        cell.removeProp('sourceMagnet');
        cell.removeProp('sourceView');
        cell.removeProp('targetMagnet');
        cell.removeProp('targetView');
      }

      if (cell && cell.id == this.openStep.value?.id){
        console.log("next")
        this.openStep.next(cell.toJSON())
      }

      console.log('oi');

      let json = this.graph?.toJSON();

      console.log("nog")

      if (json) {
        this.pubGraph.next(this.graph);
        this.pubJSON!.next(json as any);
      }
    }
  }

  importJSON(json: { cells: Cell.Properties[] }) {
    this.graph?.fromJSON(json.cells, { static: true });
    this.pubGraph.next(this.graph);
  }

  checkAlgo(json: { cells: Cell.Properties[] }) {
    //check incoming add/modify

    json['cells']?.forEach((cellObj: any) => {
      let cell = this.graph?.getCellById(cellObj.id);
      if (cell) {
        Object.keys(cellObj).forEach((key) => {
          cell?.setProp(key, cellObj[key], { static: true });
        });
      } else {
        var newCell: Cell | undefined;
        if (cellObj.shape == 'scene-node') {
          newCell = this.graph?.createNode(cellObj);
        } else {
          newCell = this.graph?.createEdge(cellObj);
        }
        if (newCell) {
          this.graph?.addCell(newCell, { static: true });
        }
      }
    });

    //check deleted/missing
    this.graph?.getCells().forEach((cell) => {
      let same = (json['cells'] as any[]).findIndex((c) => c.id == cell.id);
      if (same == -1) {
        this.graph?.removeCell(cell.id);
      }
    });

    this.pubGraph.next(this.graph);
  }

  undo() {
    this.graph?.undo();
  }

  redo() {
    this.graph?.redo();
  }
}
