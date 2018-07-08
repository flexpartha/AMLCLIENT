import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/take';


import { GlobalSettingsService } from '../services/globalSettings.service';

export var fileVersion = '?tmplv=' + Date.now();
declare var jquery: any;
declare var $: any;

@Component({
  selector: 'home',
  templateUrl: './home.component.html?v=' + fileVersion
})
export class HomeComponent implements OnInit, OnDestroy{
  private loginSubscription: Subscription;
  private logoutSubscription: Subscription;
  
  //constructor
  constructor(private router: Router, private route: ActivatedRoute, private appSettings: GlobalSettingsService) { }


  ngOnInit(): void {
    this.router.navigate([{ outlets: { accountHome: ['login'] } }], {
      relativeTo: this.route,
      //skipLocationChange: true
    });
    
    this.loginSubscription = this.appSettings.onLoginEmitter$
      .subscribe((response: any) => { this.onLoggedIn() });

    this.logoutSubscription = this.appSettings.onLogoutEmitter$
      .subscribe((response: any) => { this.onLoggedOut() });

    this.router.navigate([{ outlets: { roHome: ['login'] } }], {
      relativeTo: this.route,
      //skipLocationChange: true
    });
  }

  ngOnDestroy(): void {
    this.loginSubscription.unsubscribe();
    this.logoutSubscription.unsubscribe();
  }

  private onLoggedIn(): void {

    this.router.navigate(
      [
        {
          outlets: {
            roHome: ['dashboard']
          }
        }
      ],
      {
        relativeTo: this.route,
        //skipLocationChange: true
      }
    )
  }

  private onLoggedOut(): void {
    this.router.navigate(
      [{ outlets: { roHome: ['login'] } }],
      {
        relativeTo: this.route,
        //skipLocationChange: true
      }
    )
  }

  //private onCurrentSolutionChange(): void {
  //  $('#divMainContent').fadeOut('slow');

  //  Observable.interval(200).take(1).subscribe(() => { $('#divMainContent').fadeIn('slow'); });
  //}
}
