import { NgModule, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {
  ANIMATION_MODULE_TYPE,
  BrowserAnimationsModule,
} from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { InViewportModule } from 'ng-in-viewport';
import { MatSelectModule } from '@angular/material/select';
import { HttpClientModule } from '@angular/common/http';
import {
  AngularFireFunctionsModule,
  AngularFireFunctions,
} from '@angular/fire/compat/functions';
import { LazyLoadImageModule } from 'ng-lazyload-image'; // <-- include ScrollHooks
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthComponent } from './auth/auth.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgRouterOutletCommModule } from 'ng-router-outlet-comm';
import { MdbAccordionModule } from 'mdb-angular-ui-kit/accordion';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { MdbCheckboxModule } from 'mdb-angular-ui-kit/checkbox';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { MdbModalModule } from 'mdb-angular-ui-kit/modal';
import { MdbPopoverModule } from 'mdb-angular-ui-kit/popover';
import { MdbRadioModule } from 'mdb-angular-ui-kit/radio';
import { MdbRangeModule } from 'mdb-angular-ui-kit/range';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';
import { MdbScrollspyModule } from 'mdb-angular-ui-kit/scrollspy';
import { MdbTabsModule } from 'mdb-angular-ui-kit/tabs';
import { MdbTooltipModule } from 'mdb-angular-ui-kit/tooltip';
import { MdbValidationModule } from 'mdb-angular-ui-kit/validation';
import { IsRoutePipe } from './is-route.pipe';
import { MatTableModule } from '@angular/material/table';
import { StatusComponent } from './status/status.component';
import {
  DefaultMatCalendarRangeStrategy,
  MatDatepickerModule,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
} from '@angular/material/datepicker';
import { ViewsPipe } from './views.pipe';
import { LiveEarthViewPipePipe } from './live-earth-view-pipe.pipe';
import { safeHtmlPipe } from './safeHtml.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NotificationComponent } from './notification/notification.component';
import { NgxCurrencyModule } from 'ngx-currency';
import { SafeUrlPipe } from './safe-url.pipe';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { ColorPickerModule } from 'ngx-color-picker';
import { SafeTextRowsPipe } from './safe-text-rows.pipe';
import { MatSliderModule } from '@angular/material/slider';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { SharedDialogComponent } from './shared-dialog/shared-dialog.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { SliderValuePipe } from './slider-value.pipe';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgxDefaultImageModule } from 'ngx-default-image';
import { MatCheckboxModule } from '@angular/material/checkbox';

// import {BUTTONS, NgxWigModule} from 'ngx-wig';
import { MergeObjPipe } from './merge-obj.pipe';
import { CastPipe } from './cast.pipe';
import { LayoutSliderComponent } from './layout-slider/layout-slider.component';
import { WorkflowStatusPipe } from './workflow-status.pipe';
import { IonicModule } from '@ionic/angular';
import { WorkflowDesignerComponent } from './workflow-designer/workflow-designer.component';
import { SequentialWorkflowDesignerModule } from 'vertical-ai-designer-angular';
import { SelectFieldComponent } from './select-field/select-field.component';
import { TextFieldComponent } from './text-field/text-field.component';
import { DictToArrPipe } from './dict-to-arr.pipe';
import { StepFinderPipe } from './step-finder.pipe';
import { WorkflowComponent } from './workflow/workflow.component';
import { ModelTypePipe } from './model-type.pipe';
import { SafeImgUrlPipe } from './safe-img-url.pipe';
import { LoaderComponent } from './loader/loader.component';
import { TextboxComponent } from './textbox/textbox.component';
import { SplitPipe } from './split.pipe';
import { PrettifyJsonPipe } from './prettify-json.pipe';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ApiUrlPipe } from './api-url.pipe';
import { ApiEditorComponent } from './api-editor/api-editor.component';
// import { CodeEditorModule } from '@ngstack/code-editor';
import { RawEditFilterPipe } from './raw-edit-filter.pipe';
// import { CodeEditorComponent } from './code-editor/code-editor.component';
import { WorkflowInfoComponent } from './workflow-info/workflow-info.component';
import { PlanSelectComponent } from './plan-select/plan-select.component';
import { NgxStripeModule } from 'ngx-stripe';
import { BillingComponent } from './billing/billing.component';
import { MatCardModule } from '@angular/material/card';
import { ApiTesterComponent } from './api-tester/api-tester.component';
import { WorkflowCodeComponent } from './workflow-code/workflow-code.component';
import { AngularSplitModule } from 'angular-split';
import { TrimPipe } from './trim.pipe';
import { TaskIconPipe } from './task-icon.pipe';
import { GlobalEditorInitDirective } from './global-editor-init.directive';
import { TerminalComponent } from './terminal/terminal.component';
import { FileSidebarComponent } from './file-sidebar/file-sidebar.component';
import { CodePaneComponent } from './code-pane/code-pane.component';
import { IconSidebarComponent } from './icon-sidebar/icon-sidebar.component';
import { MatMenuModule } from '@angular/material/menu';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { FilenameFormatPipe } from './filename-format.pipe';
import { StorageComponent } from './storage/storage.component';
import { NgClickOutsideDirective } from 'ng-click-outside2';
import { TooltipComponent } from './tooltip/tooltip.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { SettingsComponent } from './settings/settings.component';
import { TextAreaRenderPipe } from './text-area-render.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { ResizableModule } from 'angular-resizable-element';
import { SceneComponent } from './scene/scene.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NodeComponent } from './node/node.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    DashboardComponent,
    StatusComponent,
    NotificationComponent,
    IsRoutePipe,
    ViewsPipe,
    LiveEarthViewPipePipe,
    safeHtmlPipe,
    SafeUrlPipe,
    SafeTextRowsPipe,
    SharedDialogComponent,
    SliderValuePipe,
    CastPipe,
    MergeObjPipe,
    LayoutSliderComponent,
    WorkflowStatusPipe,
    WorkflowDesignerComponent,
    SelectFieldComponent,
    TextFieldComponent,
    DictToArrPipe,
    StepFinderPipe,
    WorkflowComponent,
    ModelTypePipe,
    SafeImgUrlPipe,
    LoaderComponent,
    TextboxComponent,
    SplitPipe,
    PrettifyJsonPipe,
    ApiUrlPipe,
    ApiEditorComponent,
    RawEditFilterPipe,
    // CodeEditorComponent,
    WorkflowInfoComponent,
    PlanSelectComponent,
    BillingComponent,
    ApiTesterComponent,
    WorkflowCodeComponent,
    TrimPipe,
    TaskIconPipe,
    GlobalEditorInitDirective,
    TerminalComponent,
    FileSidebarComponent,
    CodePaneComponent,
    IconSidebarComponent,
    FilenameFormatPipe,
    StorageComponent,
    TooltipComponent,
    ComingSoonComponent,
    SettingsComponent,
    TextAreaRenderPipe,
    SceneComponent,
    NodeComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    MatTooltipModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    AngularFireModule.initializeApp(environment.firebase),
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
    MatExpansionModule,
    HttpClientModule,
    FormsModule,
    ResizableModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatSliderModule,
    NgScrollbarModule,
    MatAutocompleteModule,
    MatChipsModule,
    AngularFireFunctionsModule,
    LazyLoadImageModule,
    MatSidenavModule,
    MatTabsModule,
    MatTableModule,
    MatCheckboxModule,
    MatNativeDateModule,
    ScrollingModule,
    MdbAccordionModule,
    MdbCarouselModule,
    MdbCheckboxModule,
    MdbCollapseModule,
    MdbDropdownModule,
    MdbFormsModule,
    MdbModalModule,
    MdbPopoverModule,
    MdbRadioModule,
    MdbRangeModule,
    MdbRippleModule,
    MdbScrollspyModule,
    MdbTabsModule,
    MdbTooltipModule,
    MdbValidationModule,
    MatDatepickerModule,
    MatPaginatorModule,
    MatDividerModule,
    NgxDropzoneModule,
    DragDropModule,
    SequentialWorkflowDesignerModule,
    IonicModule,
    ClipboardModule,
    AngularSplitModule,
    CodemirrorModule,
    NgxStripeModule.forRoot('pk_live_m7nEWhyTHoxGspcxtJAci6pu002LUiOnJK'),
    // CodeEditorModule.forRoot(),
    IonicModule.forRoot(),
    NgClickOutsideDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    // Globals,
    // { provide: USE_FUNCTIONS_EMULATOR, useValue: !environment.production ? ['localhost', 5001] : undefined },
    { provide: LOCALE_ID, useValue: 'en-US' },
    { provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations' },
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: DefaultMatCalendarRangeStrategy,
    },
    // { provide: BUTTONS, multi: true, useValue: MY_PLUGIN }
  ],
  entryComponents: [TextFieldComponent],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    router: Router,
    functions: AngularFireFunctions,
    private firestore: AngularFirestore,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    // functions.useEmulator('localhost', 5001)
    // firestore.firestore.useEmulator('localhost', 9000)
    this.matIconRegistry.addSvgIcon(
      `unfathom_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/unfathom_icon.svg")
    );
  }
}
