import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SceneDefinition } from './models/workflow/scene-definition.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { register } from '@antv/x6-angular-shape';
import { NodeComponent } from './node/node.component';
import { Graph, Cell, Edge } from '@antv/x6';
import { Snapline } from '@antv/x6-plugin-snapline';
import { Dnd } from '@antv/x6-plugin-dnd';
import { Selection } from '@antv/x6-plugin-selection';
import { Transform } from '@antv/x6-plugin-transform';
import { SceneNode } from './models/workflow/scene-node.model';
import { Scene } from './models/workflow/scene.model';
import { LoadService } from './load.service';
import { MiniMap } from '@antv/x6-plugin-minimap'

@Injectable({
  providedIn: 'root',
})
export class DesignerService {
  constructor(private db: AngularFirestore, private loadService: LoadService) {}

  toolboxConfiguration = new BehaviorSubject<SceneDefinition[]>([]);

  private graph?: Graph;

  pubGraph = new BehaviorSubject<Graph | undefined>(undefined);
  pubJSON = new BehaviorSubject<{ cells: Cell.Properties[] } | undefined>(
    undefined
  );

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

    console.log(node);
    console.log(scene);

    node?.updateData({
      ngArguments: {
        scene: scene,
      },
    });

    let json = this.graph?.toJSON();

    console.log(json);
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
                this.loadService.themes[this.loadService.theme.value][
                  'gridColor'
                ], // main grid line color
              thickness: 1, // main grid line width
            },
          ],
        },
      });

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
            preserveAspectRatio: true,
          },
        })
      );

      let minimap = document.getElementById('minimap')

      if (minimap){
        this.graph.use(
          new MiniMap({
            container: minimap,
          }),
        )
      }
      

      this.graph.on('node:selected', ({ node }) => {
        // console.log(node);
        // node.updateData({ ngArguments: { selected: true } });
      });

      this.graph.on('edge:selected', ({ edge }) => {
        // console.log(edge);
        // node.updateData({ ngArguments: { selected: true } });
      });

      this.graph.on('node:unselected', ({ node }) => {
        // console.log(node);
        // node.updateData({ ngArguments: { selected: true } });
      });

      this.graph.on('cell:changed', ({ cell, options }) => {
        console.log(cell);
        if (cell.shape == 'edge') {
          cell.removeProp('sourceMagnet');
          cell.removeProp('sourceView');
          cell.removeProp('targetMagnet');
          cell.removeProp('targetView');
        }
        let json = this.graph?.toJSON();

        console.log(json);
        if (json) {
          this.pubGraph.next(this.graph);
          this.pubJSON!.next(json as any);
        }
      });

      this.graph.on('cell:removed', ({ cell, options }) => {
        // console.log(cell);
        if (cell.shape == 'edge') {
          cell.removeProp('sourceMagnet');
          cell.removeProp('sourceView');
          cell.removeProp('targetMagnet');
          cell.removeProp('targetView');
        }
        let json = this.graph?.toJSON();

        console.log(json);
        if (json) {
          this.pubJSON!.next(json as any);
        }
      });

      this.graph.on('cell:added', ({ cell, options }) => {
        if (cell.shape == 'edge') {
          cell.removeProp('sourceMagnet');
          cell.removeProp('sourceView');
          cell.removeProp('targetMagnet');
          cell.removeProp('targetView');
        }

        console.log(cell);

        let json = this.graph?.toJSON();

        if (json) {
          this.pubGraph.next(this.graph);
          this.pubJSON!.next(json as any);
        }
      });

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

  importJSON(json: { cells: Cell.Properties[] }) {
    this.graph?.fromJSON(json.cells);
    this.pubGraph.next(this.graph);
  }

  checkAlgo(json: Cell.Properties) {
    //check incoming add/modify
    //check incoming add/modify
    json['cells']?.forEach((cellObj: any) => {
      let cell = this.graph?.getCellById(cellObj.id);
      if (cell) {
        Object.keys(cellObj).forEach((key) => {
          cell?.prop(key, cellObj[key]);
        });
      } else {
        var newCell: Cell | undefined;
        if (cellObj.shape == 'scene-node') {
          newCell = this.graph?.createNode(cellObj);
        } else {
          newCell = this.graph?.createEdge(cellObj);
        }
        if (newCell) {
          this.graph?.addCell(newCell);
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

    this.pubGraph.next(this.graph)
  }

}
