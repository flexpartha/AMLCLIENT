import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";

@Injectable()
export class GlobalSettingsService {
  
  //ANCESTOR ENTITY
  private _ancestorEntity: any;
  get AncestorEntity() {
    return this._ancestorEntity;
  }
  set AncestorEntity(value: any) {
    this._ancestorEntity = value;
  }


  //PROJECTS
  private _projects: any[];
  get Projects() {
    return this._projects;
  }
  set Projects(value: any[]) {
    this._projects = value;
  }



  //CURRENT SELECTED APPLICATION
  private _currentApplication: any;
  get CurrentApplication() {
    return this._currentApplication;
  }
  set CurrentApplication(value: any) {
    this._currentApplication= value;
  }


  //setting notification when user login's
  public onLogin = new Subject<any>();
  public onLoginEmitter$ = this.onLogin.asObservable();

  public notifyLoggedIn(value: any) {
    this.onLogin.next(value);
  }


  //setting notification when user logout's
  public onLogout = new Subject<any>();
  public onLogoutEmitter$ = this.onLogout.asObservable();

  public notifyLoggedOut(value: any) {
    this.onLogout.next(value);
  }


  //setting notification when AncestorEntity is changed
  //need to do it this way since all child components are within 'router-outlet'
  //public onAncestorEntityChange = new Subject<boolean>();
  //public onAncestorEntityChangeEmitter$ = this.onAncestorEntityChange.asObservable();

  //public notifyAncestorEntityChange(value: boolean) {
  //  this.onAncestorEntityChange.next(value);
  //}


  //VIEW CHANGE
  //setting notification when VIEW is changed
  //need to do it this way since all child components are within 'router-outlet'
  public onViewChange = new Subject<any>();
  public onViewChangeEmitter$ = this.onViewChange.asObservable();

  public notifyViewChange(value: any) {
    this.onViewChange.next(value);
  }

  //setting notification when an ACTION BUTTON is clicked
  //need to do it this way since all child components are within 'router-outlet'
  public onActionButtonClick = new Subject<any>();
  public onActionButtonClickEmitter$ = this.onActionButtonClick.asObservable();

  public notifyActionButtonClick(value: any) {
    this.onActionButtonClick.next(value);
  }
}
