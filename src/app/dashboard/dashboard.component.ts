import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";

import { DxFormComponent } from "devextreme-angular";

import { GlobalSettingsService } from "../services/globalSettings.service";
import { HelperService } from "../services/helper.service";
import { Constants } from "../shared/constants";
import { AccountService } from "../services/account.service";
import { AuthService } from "../services/auth.service";
import { EntityService } from "../services/entity.service";


declare var jquery: any;
declare var $: any;

export var fileVersion = '?tmplv=' + Date.now();

@Component({
  templateUrl: './dashboard.component.html?v=' + fileVersion
})
export class DashboardComponent implements OnInit, OnDestroy {

  //declaring class properties/variables
  private errorMessage: string;
  private applicationGroups: any[];
  private ancestorEntityName: string;
  private viewChangeSubscription: Subscription;
  private showAddNewButton: boolean = false;
  private showSaveButton: boolean = false;
  private showGoBackButton: boolean = false;
  private showExportToExcelButton: boolean = false;
  private showDeleteButton: boolean = false;
  private saveButtonCode: string;
  private cancelButtonCode: string;
  private addButtonCode: string;
  private deleteButtonCode: string;
  private exportToExcelButtonCode: string;
  private selectProjectPopupVisible: boolean;
  private formItems: any[];
  private selectedProject: any = {};
  private applicationIdClicked: number;
  private mainMenu: any = {};
  private defaultSystemMenu: any = {};
  private clickedMenu: any;
  @ViewChild(DxFormComponent) form: DxFormComponent

  //constructor
  constructor(private route: ActivatedRoute, private router: Router, private accountService: AccountService,
    private globalSettings: GlobalSettingsService, private helperService: HelperService,
    private entityService: EntityService, private authService: AuthService) {

    //need to this way as Angular does not allow to access CONSTANTS within html page
    this.addButtonCode = Constants.ACTION_CODE_ADD;
    this.saveButtonCode = Constants.ACTION_CODE_SAVE;
    this.cancelButtonCode = Constants.ACTION_CODE_CANCEL;
    this.deleteButtonCode = Constants.ACTION_CODE_DELETE;
    this.exportToExcelButtonCode = Constants.ACTION_CODE_EXPORT_TO_EXCEL;
  }


  ngOnInit(): void {
    this.closeSettingModal();
    
    //get subscribed solutions for the loggedIn user
    this.accountService.GetSubscribedApplicationsAsync()
      .subscribe(
      (responseData: any) => { this.onGetSubscribedApplicationsAsyncComplete(responseData); },
      (error: any) => { this.errorMessage = <any>error; }
      );


    //subscribe to even when ViewActions change
    let currentView: any;
    this.viewChangeSubscription = this.globalSettings.onViewChangeEmitter$
      .subscribe(
      (res: any) => {
        currentView = res;
        this.showHideActionsButtons(currentView);
      }
      );
  }

  ngOnDestroy() {
    this.viewChangeSubscription.unsubscribe();
  }


  private closeSettingModal(): void {
    $(window).on('click', function () {
      $("#myModal").fadeOut('slow');
    });
  }

  private onModelopen(): void {
    $("#myModal").fadeToggle();
  }

  private closeModel(): void {
    $("#myModal").fadeOut('slow');
  }
  // Modal Script Ends Here
  private toggleSidebar(): void {
    $("#homeSubmenu,#pageSubmenu,#pageSubmenu1").collapse('toggle');
  }

  private closeModal(): void {
    $("#myModal").fadeOut('slow');
  }

  private collapseLeftMenu(): void {
    $('.topToggle').click(function () {
      $(this).parent().find('ul').collapse('toggle');
    });
  }

  private onGetSubscribedApplicationsAsyncComplete(responseData: any): void {
    if (responseData) {
      this.applicationGroups = responseData.account.applicationGroups;
      this.populateMenu();
      this.onMenuClick(null);
    }
  }


  private populateMenu(): void {
    this.populateDefaultSystemMenu();
    this.mainMenu.groups = [];
    let groupCount = 0;

    for (let iCount = 0; iCount < this.applicationGroups.length; iCount++) {
      let applicationGroup = this.applicationGroups[iCount];

      if (applicationGroup.code !== Constants.APPLICATION_PAGE_GROUP_CODE_DEFAULT &&
            applicationGroup.code.toUpperCase() !== Constants.APPLICATION_PAGE_GROUP_CODE_LIBRARIES.toUpperCase()) {
        //add top Group
        this.mainMenu.groups.push(applicationGroup);

        if (applicationGroup.applications) {
          this.mainMenu.groups[groupCount].menus = [];
          
          for (let s = 0; s < applicationGroup.applications.length; s++) {
            let application = applicationGroup.applications[s];

            //add appPage
            this.mainMenu.groups[groupCount].menus.push(application);

            if (application.applicationPages) {
              for (let z = 0; z < application.applicationPages.length; z++) {
                this.mainMenu.groups[groupCount].menus.push(application.applicationPages[z]);
              }
            }
          }
        }

        groupCount++;
      }
    }
  }


  private populateDefaultSystemMenu(): void {
    this.defaultSystemMenu.groups = [];

    for (let iCount = 0; iCount < this.applicationGroups.length; iCount++) {
      let applicationGroup = this.applicationGroups[iCount];

      if (applicationGroup.code === Constants.APPLICATION_PAGE_GROUP_CODE_DEFAULT) {

        //add top Group
        this.defaultSystemMenu.groups.push(applicationGroup);

        if (applicationGroup.applications) {
          this.defaultSystemMenu.groups[iCount].menus = [];

          for (let s = 0; s < applicationGroup.applications.length; s++) {
            let application = applicationGroup.applications[s];

            //add appPage
            this.defaultSystemMenu.groups[iCount].menus.push(application);

            if (application.applicationPages) {
              for (let z = 0; z < application.applicationPages.length; z++) {
                this.defaultSystemMenu.groups[iCount].menus.push(application.applicationPages[z]);
              }
            }
          }
        }
      }
    }
  }

  private onMenuClick(menu: any): void {
    this.clickedMenu = null;

    //set the selected/clicked menu
    for (let iCount = 0; iCount < this.applicationGroups.length; iCount++) {
      let applicationGroup = this.applicationGroups[iCount];

      //look into applicationGroup
      if (menu) {
        if (menu.id === applicationGroup.id && menu.name === applicationGroup.name) {
          this.clickedMenu = applicationGroup;
          break;
        }
      }
      else {
        if (applicationGroup.isPrimary) {
          this.clickedMenu = applicationGroup;
          break;
        }
      }

      if (!this.clickedMenu) {
        //look into application
        for (let s = 0; s < applicationGroup.applications.length; s++) {
          let application = applicationGroup.applications[s];

          if (menu) {
            if (menu.id === application.id && menu.name === application.name) {
              this.clickedMenu = application;
              break;
            }
          }
          else {
            if (application.isPrimary) {
              this.clickedMenu = application;
              break;
            }
          }


          if (!this.clickedMenu) {
            //look into applicationPages
            if (application.applicationPages) {
              for (let z = 0; z < application.applicationPages.length; z++) {
                if (menu) {
                  if (menu.id === application.applicationPages[z].id && menu.name === application.applicationPages[z].name) {
                    this.clickedMenu = application.applicationPages[z];
                    break;
                  }
                }
                else {
                  if (application.applicationPages[z].isPrimary) {
                    this.clickedMenu = application.applicationPages[z];
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }


    if (this.clickedMenu) {

      //check if the selected application is dependent on Ancestor Entity
      if (this.clickedMenu.isDependentOnAncestorEntity) {
        if (!this.globalSettings.AncestorEntity) {
          this.showProjectSelectPopup();
          return;
        }
      }
      else {
        this.globalSettings.AncestorEntity = null;
      }

      //set current selected applicationGroup/application/applicationPage
      this.globalSettings.CurrentApplication = this.clickedMenu;

      this.loadClickedMenu(this.clickedMenu);
    }
  }

  private loadClickedMenu(menu: any): void {
    if (menu && menu.primaryView) {
      let primaryView = menu.primaryView;

      let routePath = primaryView.routePath;

      //relatively loading the route
      this.router.navigate(
        [
          routePath, { viewCode: primaryView.code }
        ],
        {
          relativeTo: this.route,
          //skipLocationChange: true
        }
      );
    }
    else {
      alert('ERROR: primaryView not defined');

      //redirect to error page
      this.router.navigate(
        ['errorPage'],
        {
          //skipLocationChange: true
        }
      );
    }
  }

  private setAncestorEntityName(): void {
    this.ancestorEntityName = null;

    if (this.globalSettings.AncestorEntity) {
      this.ancestorEntityName = this.helperService.getAnswer(this.globalSettings.AncestorEntity, Constants.QUESTION_CODE_ENTITY_NAME);
    }
  }

  private showOptions(): void {
    $('.folded-project-option').fadeToggle('show');
  }

  private showHideActionsButtons(currentView: any): void {
    if (currentView.actions && currentView.actions.length > 0) {
      $('#divButtons').fadeIn('slow');
      $('#divProjectName').fadeIn('slow');
    }
    else {
      $('#divButtons').fadeOut('slow');
      $('#divProjectName').fadeOut('slow');
    }

    this.showAddNewButton = this.helperService.allowAddNew(currentView);
    this.showSaveButton = this.helperService.allowSave(currentView);
    this.showDeleteButton = this.helperService.allowDelete(currentView);
    this.showGoBackButton = this.helperService.allowCancel(currentView);
    this.showExportToExcelButton = this.helperService.allowExportToExcel(currentView);
  }

  private actionButtonClicked(code: string): void {

    //raise event that actionButton has been clicked
    this.globalSettings.notifyActionButtonClick(code);
  }


  private logout(): void {
    this.authService.logoutUser()
      .subscribe(
      (responseData: any) => { this.onLogoutComplete(responseData) },
      (error: any) => { this.errorMessage = <any>error; }
      );
  }

  private onLogoutComplete(responseData: any): void {
    this.authService.currentUser = null;
    this.globalSettings.AncestorEntity = null;

    this.globalSettings.notifyLoggedOut(null);
  }



  private showProjectSelectPopup(): void {
    this.selectProjectPopupVisible = true;
    this.drawSelectProjectForm();
  }

  private onProjectSelectedCancelClick(): void {
    this.selectProjectPopupVisible = false;
  }

  private drawSelectProjectForm(): void {
    let formOptions: any = {
      itemType: 'group',
      colCount: 1,
      items: [{
        dataField: 'id',
        editorType: Constants.DEVEX_EDITOR_PREFIX + Constants.EDITOR_TYPE_CODE_SELECTBOX,
        editorOptions: {
          items: this.globalSettings.Projects,
          valueExpr: Constants.ID,
          displayExpr: Constants.QUESTION_CODE_ENTITY_NAME,
          searchEnabled: true,
          placeholder: 'Select Project'
        },
        label: {
          text: 'Project Name'
        },
        validationRules: [{
          type: 'required',
          message: ''
        }]
      }]
    }

    this.formItems = [];
    this.formItems.push(formOptions);
  }

  private onProjectSelectedOkClick(): void {
    let rtnValue = this.form.instance.validate();
    if (rtnValue.isValid) {
      var projectId = this.selectedProject.id;

      this.entityService.getEntityDetails(projectId)
        .subscribe(
        (responseData: any[]) => { this.onGetEntityDetailsComplete(responseData) },
        (error: any) => { this.errorMessage = <any>error; }
        );
    }
  }

  private onGetEntityDetailsComplete(responseData: any): void {
    if (responseData.entity) {
      this.globalSettings.AncestorEntity = responseData.entity;
      this.selectProjectPopupVisible = false;
      this.loadClickedMenu(this.clickedMenu);
    }
  }
}
