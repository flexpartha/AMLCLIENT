import { NgModule, enableProdMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { HttpModule } from '@angular/http';

//DEVEXPRESS
import { DevExtremeModule } from 'devextreme-angular';

import { AppRoutingModule } from "./appRouting.module";

import { GlobalSettingsService } from "./services/globalSettings.service";
import { AuthService } from "./services/auth.service";
import { EntityService } from "./services/entity.service";
import { AccountService } from "./services/account.service";
import { HelperService } from "./services/helper.service";
import { GridViewColumnService } from "./services/gridViewColumn.service";

import { LandingDashboardResolver } from "./services/zlandingDashboard.resolver";
import { ViewDataResolver } from "./services/viewData.resolver";

import { AppComponent } from './app.component';
import { HomeComponent } from "./home/home.component";
import { LoginComponent } from "./login/login.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ViewService } from "./services/view.service";
import { ProjectCustomComponent } from "./extensions/projects/projectsCustom.component";
import { TabViewComponent } from "./standardPages/tabView.component";
import { GridViewComponent } from "./standardPages/gridView.component";
import { FormEditViewComponent } from "./standardPages/formEditView.component";
import { FormItemsService } from "./services/formItems.service";
import { MiscellaneousService } from "./services/miscellaneous.service";
import { DocumentsCustomComponent } from './extensions/documents/documentsCustom.component';
import { DocumentService } from './services/document.service';
import { ReportDashboardViewComponent } from './standardPages/reportDashboardView.component';
import { LibrariesCustomComponent } from './extensions/libraries/librariesCustom.component';


if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    DevExtremeModule,
    HttpModule
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    DashboardComponent,
    ProjectCustomComponent,
    TabViewComponent,
    GridViewComponent,
    FormEditViewComponent,
    DocumentsCustomComponent,
    ReportDashboardViewComponent,
    LibrariesCustomComponent
  ],
  bootstrap: [AppComponent],
  providers: [
    GlobalSettingsService,
    AuthService,
    EntityService,
    AccountService,
    LandingDashboardResolver,
    ViewService,
    ViewDataResolver,
    HelperService,
    GridViewColumnService,
    FormItemsService,
    MiscellaneousService,
    DocumentService
  ]
})
export class AppModule { }
