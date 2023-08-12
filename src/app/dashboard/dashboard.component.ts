import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { DateRange } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { isPlatformBrowser } from 'ng-in-viewport';
import { Dict, LoadService } from '../load.service';
import { Developer } from '../models/user/developer.model';
import { Executable } from '../models/workflow/executable.model';
import { WorkflowComponent } from '../workflow/workflow.component';
import { WorkflowInfoComponent } from '../workflow-info/workflow-info.component';
import { PlanSelectComponent } from '../plan-select/plan-select.component';
import { Subscription } from '../models/workflow/subscription.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  views?: Dict<any>[] = undefined;
  selectedCoord?: Dict<any> = undefined;

  today = new Date();
  month = this.today.getMonth();
  year = this.today.getFullYear();
  day = this.today.getDate();

  dateRange = new UntypedFormGroup({
    start: new UntypedFormControl(
      this.loadService.addDays(this.today, -this.day + 1)
    ),
    end: new UntypedFormControl(new Date(this.year, this.month, this.day)),
  });

  selectedDateRange?: DateRange<Date> = new DateRange(
    this.dateRange.controls['start'].value,
    this.dateRange.controls['end'].value
  );

  theme: 'light' | 'dark' = 'light';

  viewMapping: { [k: string]: string } = {
    '=0': 'No Active Users',
    '=1': '1 View',
    other: '# Views',
  };
  saleMapping: { [k: string]: string } = {
    '=0': 'No Sales',
    '=1': '1 Sale',
    other: '# Sales',
  };

  newDate = new Date();

  dateRangeChange(
    dateRangeStart: HTMLInputElement,
    dateRangeEnd: HTMLInputElement
  ) {
    if (dateRangeStart.value && dateRangeEnd.value) {
      this.selectedDateRange = new DateRange(
        this.dateRange.controls['start'].value,
        this.dateRange.controls['end'].value
      );

      this.loadStats(this.dev?.id);
    }
  }

  getProfile() {
    this.loadService.currentUser.then((user) => {
      let uid = user?.uid;

      if (uid) {
        this.loadService.getUserInfo(uid, true, true, (dev) => {
          this.dev = dev;
          console.log(dev)
        });
      } else {
      }
    });
  }

  constructor(
    private loadService: LoadService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    (<any>window).openCard = this.openCard.bind(this);
  }

  scrollToLocation(val?: any) {
    if (val && isPlatformBrowser()) {
      let loc = val;
      let coords = loc.coords;

      let frame = (document.getElementById('earthFrame') as HTMLIFrameElement)
        ?.contentWindow as any;

      frame.goTo(coords);
    }
  }

  openUtil(workflow?: Executable, mode = 0) {
    if (mode == 0) {
      this.dialog.open(WorkflowComponent, {
        maxHeight: 'calc(var(--vh, 1vh) * 100)',
        maxWidth: '100vw',
        panelClass: 'app-full-bleed-dialog',

        data: {
          workflow: workflow ? JSON.parse(JSON.stringify(workflow)) : undefined,
          mode,
        },
      });
    } else if (mode == 1) {
      this.dialog.open(WorkflowInfoComponent, {
        height: 'calc(var(--vh, 1vh) * 70)',
        width: 'calc(var(--vh, 1vh) * 70)',
        maxWidth: '100vw',
        panelClass: 'app-full-bleed-dialog',

        data: {
          workflow: workflow ? JSON.parse(JSON.stringify(workflow)) : undefined,
        },
      });
    }
  }

  openPlans(activePlan: string, index: number) {
    let ref = this.dialog.open(PlanSelectComponent, {
      height: 'calc(var(--vh, 1vh) * 70)',
      width: 'calc(var(--vh, 1vh) * 70)',
      maxWidth: '100vw',
      panelClass: 'app-full-bleed-dialog',

      data: {
        activePlan,
        modelId: this.dev!.utils![index].id,
      },
    });

    ref.afterClosed().subscribe((value) => {
      if (value && value != '' && this.dev?.utils) {
        this.dev.utils[index].plan = value as Subscription;
      }
    });
  }

  closeCard() {
    this.selectedCoord = undefined;
    this.cdr.detectChanges();
  }

  openCard(coords: Dict<any>) {
    coords['time'] = new Date(coords['time']);

    let a = this.dev?.utils?.find((app) => app.id == coords['docId']);

    if (a) {
      coords['app'] = a;
      this.selectedCoord = coords;
      this.cdr.detectChanges();
    }
  }

  @Input() dev?: Developer = undefined;

  async ngOnInit() {
    this.loadService.getModels(async (models) => {
      this.getProfile();
      // this.loadStats((await this.loadService.currentUser)?.uid);

      this.loadService.loadedUser.subscribe((dev) => {

        if (dev) {
          if (dev?.theme == 'auto') {
            if (
              window.matchMedia &&
              window.matchMedia('(prefers-color-scheme: dark)').matches
            ) {
              // dark mode
              this.loadService.activeTheme = 'dark';
            } else {
              this.loadService.activeTheme = 'light';
            }
          } else {
            this.loadService.activeTheme = dev.theme;
          }

          this.dev = dev ?? undefined;
        }
      });
    });

    this.loadService.theme.subscribe((theme) => {
      this.theme = theme;
    });

    this.loadService.getPlans(async (_) => {});
    this.loadService.getTriggers(async (_) => {});

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        const newColorScheme = e.matches ? 'dark' : 'light';
        if (this.dev?.theme == 'auto') {
          this.loadService.activeTheme = newColorScheme;
        }
      });
  }

  loadStats(uid?: string) {
    this.loadService.getMiscStats(
      uid ?? '',
      this.dateRange.controls['start'].value,
      this.dateRange.controls['end'].value,
      (views: any) => {
        this.views = views ?? [];
        this.cdr.detectChanges();
      }
    );
  }

  str = `

    <!DOCTYPE html>
    <html lang="en" style='background-color: transparent;'>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <link rel="stylesheet" href="hologram/style.css" />
        <script src="../miniature.earth.js"></script>
        <style>
          .arrow-tip {
            background-color: #33cc33;
            color: white;
            padding: 0.5em 0.75em 0.5em 1.75em;
            font-size: 1.5em;
            clip-path: polygon(
              1.25em 0,
              100% 0,
              100% 50%,
              100% 100%,
              1.25em 100%,
              0 50%
            );
            transition: clip-path 0.3s ease, padding 0.3s ease, transform 0.3s ease;
            transform: translate(0, -50%);
          }
          .earth-overlay-left > .arrow-tip {
            padding: 0.5em 1.75em 0.5em 0.75em;
            clip-path: polygon(
              0% 0%,
              calc(100% - 1.25em) 0%,
              100% 50%,
              calc(100% - 1.25em) 100%,
              0% 100%,
              0% 50%
            );
            transform: translate(-100%, -50%);
          }
          .body{
            background-color: blue;
          }
        </style>
        <script>
          var myearth;
          var sprites = [];
          window.addEventListener("load", function () {
            // myearth = new Earth(
            //   "myearth",
            //   {
            //     location: {
            //       lat: 20,
            //       lng: 20,
            //     },
            //     light: "none",
            //     mapImage: "hologram/hologram-map.svg",
            //     zoomable: true,
            //     transparent: false,
            //     autoRotate: true,
            //     autoRotateSpeed: 1.0,
            //     autoRotateDelay: 100,
            //     autoRotateStart: 2000,
            //   },
            //   {
            //     passive: true,
            //   }
            // );

            myearth = new Earth( "myearth", {
              location: { lat: 47.116386, lng: -70.299591 },
              
              zoom: 1.15,
              zoomMin: 1,
              zoomMax: 1.8,
              quality: ( window.innerWidth <= 1024 ) ? 4 : 5,
              light: 'none',
              zoomable: true,
              transparent: true,		
              mapLandColor : 'rgba(118, 29, 227, 0.8)',
              mapSeaColor : 'rgba(186, 142, 241, 0.8)',
              mapBorderColor : '#e4d2f9',
              mapBorderWidth : 0.5,
              mapStyles : '#FR, #ES, #DE, #IT, #BE, #NL, #LU, #DK, #SE, #FI, #IE, #PT, #GR, #EE, #LV, #LT, #PL, #CZ, #AT, #BG, #MT, #SK, #SI, #HR, #HU, #RO, #CY { fill: #c8a4f4; } #GL, #GF { fill: #c8a4f4; }'
            } );


            myearth.addEventListener(
              "ready",
              function () {
                this.startAutoRotate();
                var line = {
                  color: "#009CFF",
                  opacity: 0.01,
                  hairline: true,
                  offset: -0.5,
                };
                for (var i in connections) {
                  line.locations = [
                    {
                      lat: connections[i][0],
                      lng: connections[i][1],
                    },
                    {
                      lat: connections[i][2],
                      lng: connections[i][3],
                    },
                  ];
                  this.addLine(line);
                }
    
                yyyy;
    
                // for (var i = 0; i < 8; i++) {
                //   sprites[i] = this.addSprite({
                //     image: "hologram/hologram-shine.svg",
                //     scale: 0.01,
                //     offset: -0.5,
                //     opacity: 0.5,
                //   });
    
                //   xxxxxx;
    
                //   pulse(i);
                // }
              },
              {
                passive: true,
              }
            );
          });
    
          function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min;
          }
          function goTo(coords) {
            myearth.goTo(
              { 
                lat :coords.LATITUDE, 
                lng :coords.LONGITUDE
              }, 
              { 
                duration: 500 
              } 
            );
          };
          function pulse(index) {
            var random_location =
              connections[getRandomInt(0, connections.length - 1)];
            sprites[index].location = {
              lat: random_location[0],
              lng: random_location[1],
            };
            sprites[index].animate("scale", 0.5, {
              duration: 320,
              complete: function () {
                this.animate("scale", 0.01, {
                  duration: 320,
                  complete: function () {
                    setTimeout(function () {
                      pulse(index);
                    }, getRandomInt(100, 400));
                  },
                });
              },
            });
          }
          var connections = [
            [59.651901245117, 17.918600082397, 41.8002778, 12.2388889],
            [59.651901245117, 17.918600082397, 51.4706, -0.461941],
            [13.681099891662598, 100.74700164794922, -6.1255698204, 106.65599823],
            [
              13.681099891662598, 100.74700164794922, 28.566499710083008,
              77.10310363769531,
            ],
            [30.12190055847168, 31.40559959411621, -1.31923997402, 36.9277992249],
            [30.12190055847168, 31.40559959411621, 25.2527999878, 55.3643989563],
            [30.12190055847168, 31.40559959411621, 41.8002778, 12.2388889],
            [
              28.566499710083008, 77.10310363769531, 7.180759906768799,
              79.88410186767578,
            ],
            [
              28.566499710083008, 77.10310363769531, 40.080101013183594,
              116.58499908447266,
            ],
            [28.566499710083008, 77.10310363769531, 25.2527999878, 55.3643989563],
            [-33.9648017883, 18.6016998291, -1.31923997402, 36.9277992249],
            [-1.31923997402, 36.9277992249, 25.2527999878, 55.3643989563],
            [41.8002778, 12.2388889, 51.4706, -0.461941],
            [41.8002778, 12.2388889, 40.471926, -3.56264],
            [19.4363, -99.072098, 25.79319953918457, -80.29060363769531],
            [19.4363, -99.072098, 33.94250107, -118.4079971],
            [19.4363, -99.072098, -12.0219, -77.114304],
            [-12.0219, -77.114304, -33.393001556396484, -70.78579711914062],
            [-12.0219, -77.114304, -34.8222, -58.5358],
            [-12.0219, -77.114304, -22.910499572799996, -43.1631011963],
            [-34.8222, -58.5358, -33.393001556396484, -70.78579711914062],
            [-34.8222, -58.5358, -22.910499572799996, -43.1631011963],
            [22.3089008331, 113.915000916, 13.681099891662598, 100.74700164794922],
            [22.3089008331, 113.915000916, 40.080101013183594, 116.58499908447266],
            [22.3089008331, 113.915000916, 31.143400192260742, 121.80500030517578],
            [35.552299, 139.779999, 40.080101013183594, 116.58499908447266],
            [35.552299, 139.779999, 31.143400192260742, 121.80500030517578],
            [33.94250107, -118.4079971, 40.63980103, -73.77890015],
            [33.94250107, -118.4079971, 25.79319953918457, -80.29060363769531],
            [33.94250107, -118.4079971, 49.193901062, -123.183998108],
            [40.63980103, -73.77890015, 25.79319953918457, -80.29060363769531],
            [40.63980103, -73.77890015, 51.4706, -0.461941],
            [51.4706, -0.461941, 40.471926, -3.56264],
            [
              40.080101013183594, 116.58499908447266, 31.143400192260742,
              121.80500030517578,
            ],
            [-33.94609832763672, 151.177001953125, -41.3272018433, 174.804992676],
            [-33.94609832763672, 151.177001953125, -6.1255698204, 106.65599823],
            [55.5914993286, 37.2615013123, 59.651901245117, 17.918600082397],
            [55.5914993286, 37.2615013123, 41.8002778, 12.2388889],
            [55.5914993286, 37.2615013123, 40.080101013183594, 116.58499908447266],
            [55.5914993286, 37.2615013123, 25.2527999878, 55.3643989563],
          ];
        </script>
      </head>
      <body style='background-color: transparent;'>
        <div id="myearth" style='background-color: transparent;'>
          <div id="glow"></div>
        </div>
      </body>
    </html>    

    `;
}
