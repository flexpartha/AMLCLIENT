import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Imports for loading & configuring
import { LandingDashboardResolver } from "./services/zlandingDashboard.resolver";
import { ViewDataResolver } from "./services/viewData.resolver";

import { HomeComponent } from "./home/home.component";
import { LoginComponent } from "./login/login.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ProjectCustomComponent } from "./extensions/projects/projectsCustom.component";
import { TabViewComponent } from "./standardPages/tabView.component";
import { FormEditViewComponent } from "./standardPages/formEditView.component";
import { GridViewComponent } from "./standardPages/gridView.component";
import { DocumentsCustomComponent } from './extensions/documents/documentsCustom.component';
import { ReportDashboardViewComponent } from './standardPages/reportDashboardView.component';
import { LibrariesCustomComponent } from './extensions/libraries/librariesCustom.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'home', component: HomeComponent },
      {
        path: 'login',
        component: LoginComponent,
        outlet: 'roHome'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        outlet: 'roHome',
        children: [
          {
            path: 'projectsCardView',
            component: ProjectCustomComponent,
            resolve: { viewData: ViewDataResolver }
          },
          {
            path: 'librariesCustomView',
            component: LibrariesCustomComponent,
            resolve: { viewData: ViewDataResolver }
          },
          {
            path: 'tabView',
            component: TabViewComponent,
            resolve: { viewData: ViewDataResolver },
            children: [
              {
                path: 'formEditView',
                component: FormEditViewComponent,
                resolve: { viewData: ViewDataResolver }
              },
              {
                path: 'gridView',
                component: GridViewComponent,
                resolve: { viewData: ViewDataResolver }
              },
              {
                path: 'documentsCustomGridView',
                component: DocumentsCustomComponent,
                resolve: { viewData: ViewDataResolver }
              },
            ]
          },
          {
            path: 'gridView',
            component: GridViewComponent,
            resolve: { viewData: ViewDataResolver },
            children: [
              {
                path: 'formEditView',
                component: FormEditViewComponent,
                resolve: { viewData: ViewDataResolver }
              }
            ]
          },
          {
            path: 'formEditView',
            component: FormEditViewComponent,
            resolve: { viewData: ViewDataResolver }
          },
          {
            path: 'reportDashboardView',
            component: ReportDashboardViewComponent,
            resolve: { viewData: ViewDataResolver }
          }
        ]
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      //{ path: '**', component: PageNotFoundComponent }
    ])
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
