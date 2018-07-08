import { Component, enableProdMode } from '@angular/core';
import { Router } from "@angular/router";

import { GlobalSettingsService } from "./services/globalSettings.service";
import { AuthService } from "./services/auth.service";

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReportDashboardViewComponent } from './standardPages/reportDashboardView.component';
import { ViewDataResolver } from './services/viewData.resolver';
import { FormEditViewComponent } from './standardPages/formEditView.component';
import { GridViewComponent } from './standardPages/gridView.component';
import { DocumentsCustomComponent } from './extensions/documents/documentsCustom.component';
import { TabViewComponent } from './standardPages/tabView.component';
import { ProjectCustomComponent } from './extensions/projects/projectsCustom.component';
import { LibrariesCustomComponent } from './extensions/libraries/librariesCustom.component';

export var fileVersion = '?tmplv=' + Date.now();
declare var jquery: any;
declare var $: any;

if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

@Component({
  selector: 'amlPlatform',
  templateUrl: './app.component.html?v=' + fileVersion
})
export class AppComponent  {
  private errorMessage: string;

  constructor(private appSettings: GlobalSettingsService, private authService: AuthService, private router: Router) {}
}
