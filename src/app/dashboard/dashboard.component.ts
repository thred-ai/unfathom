import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { DateRange } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { Dict, LoadService } from '../load.service';
import { Developer } from '../models/user/developer.model';
import { PlanSelectComponent } from '../plan-select/plan-select.component';
import { Subscription } from '../models/workflow/subscription.model';
import { ThemeService } from '../theme.service';
import { AutoUnsubscribe } from '../auto-unsubscibe.decorator';
import { World } from '../models/workflow/world.model';
import { ProjectService } from '../project.service';
import { NavigationService } from '../navigation.service';

@AutoUnsubscribe
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

  get activeElement(){
    return document.activeElement
  }

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
        this.loadService.getUserInfo(uid, true, true, (dev) => {});
      } else {
      }
    });
  }

  constructor(
    private loadService: LoadService,
    private themeService: ThemeService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private projectService: ProjectService,
    private navService: NavigationService
  ) {
    (<any>window).openCard = this.openCard.bind(this);
  }

  scrollToLocation(val?: any) {
    if (val) {
      let loc = val;
      let coords = loc.coords;

      let frame = (document.getElementById('earthFrame') as HTMLIFrameElement)
        ?.contentWindow as any;

      frame.goTo(coords);
    }
  }

  async newDesign() {
    if (this.dev) {
      let world = this.loadService.newWorld();

      if (world) {
        await this.loadService.saveSmartUtil(world);

        this.navService.redirectTo(`/design/${world.id}`);
      }
    }
  }

  openPlans(activePlan: string, index: number) {
    // let ref = this.dialog.open(PlanSelectComponent, {
    //   height: 'calc(var(--vh, 1vh) * 70)',
    //   width: 'calc(var(--vh, 1vh) * 70)',
    //   maxWidth: '100vw',
    //   panelClass: 'app-full-bleed-dialog',
    //   data: {
    //     activePlan,
    //     modelId: this.dev!.utils![index].id,
    //   },
    // });
    // ref.afterClosed().subscribe((value) => {
    //   if (value && value != '' && this.dev?.utils) {
    //     this.dev.utils[index].plan = value as Subscription;
    //   }
    // });
  }

  closeCard() {
    this.selectedCoord = undefined;
    this.cdr.detectChanges();
  }

  openCard(coords: Dict<any>) {
    coords['time'] = new Date(coords['time']);

    let a = this.worlds?.find((app) => app.id == coords['docId']);

    if (a) {
      coords['app'] = a;
      this.selectedCoord = coords;
      this.cdr.detectChanges();
    }
  }

  dev?: Developer = undefined;
  worlds?: World[] = [];

  async ngOnInit() {
    this.projectService.workflow.next(undefined);

    console.log('ois');
    this.getProfile();

    // this.loadStats((await this.loadService.currentUser)?.uid);

    this.loadService.loadedUser.subscribe((dev) => {
      if (dev) {
        // if (dev?.theme == 'auto') {
        //   if (
        //     window.matchMedia &&
        //     window.matchMedia('(prefers-color-scheme: dark)').matches
        //   ) {
        //     // dark mode
        //     this.themeService.activeTheme = 'dark';
        //   } else {
        //     this.themeService.activeTheme = 'light';
        //   }
        // } else {
        //   this.themeService.activeTheme = dev.theme;
        // }
        this.loadService.fetchWorlds(dev.id);
      }
      this.themeService.activeTheme = 'light';

      this.dev = dev ?? undefined;
      this.cdr.detectChanges();

      let doc = document.getElementById('background');

      if (doc) {
        console.log(doc);
        (window as any).VANTA.WAVES({
          el: doc, // element selector string or DOM object reference
          color: 0x9595a0,
          // color: 0x6366f1,
          // color: 0x67e8f9,
          waveHeight: 20,
          shininess: 0,
          waveSpeed: 0.5,
          zoom: 0.75,
        });


        
      }
    });

    this.loadService.loadedProducts.subscribe((worlds) => {
      console.log(worlds);
      if (worlds) {
        // if (dev?.theme == 'auto') {
        //   if (
        //     window.matchMedia &&
        //     window.matchMedia('(prefers-color-scheme: dark)').matches
        //   ) {
        //     // dark mode
        //     this.themeService.activeTheme = 'dark';
        //   } else {
        //     this.themeService.activeTheme = 'light';
        //   }
        // } else {
        //   this.themeService.activeTheme = dev.theme;
        // }
      }
      this.worlds = worlds ?? [];
      this.cdr.detectChanges();
    });

    this.themeService.theme.subscribe((theme) => {
      this.theme = theme;
    });

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        const newColorScheme = e.matches ? 'dark' : 'light';
        if (this.dev?.theme == 'auto') {
          this.themeService.activeTheme = newColorScheme;
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

  save(world: World){
    this.projectService.saveWorkflow.next(world)
  }

  saveName(world: World, name: string){
    world.name = name
    this.loadService.updateName(world)
  }

  
}
