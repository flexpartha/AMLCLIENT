import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/take';

//Imports for loading & configuring
import { AuthService } from "../services/auth.service";
import { User } from "../shared/user";
import { EntityService } from "../services/entity.service";
import { HelperService } from "../services/helper.service";
import { Constants } from "../shared/constants";
import { GlobalSettingsService } from "../services/globalSettings.service";


export var fileVersion = '?tmplv=' + Date.now();
declare var jquery: any;
declare var $: any;

@Component({
  templateUrl: './login.component.html?v=' + fileVersion
})
export class LoginComponent implements OnInit {
  private showSpinner: boolean;
  private loginButtonText: string = 'Sign In';
  private errorMessage: string;
  private email: string;
  private password: string;

  //constructor
  constructor(private authService: AuthService, private entityService: EntityService,
                private router: Router, private helper: HelperService, private appSettings: GlobalSettingsService) { }

  //function - onInit 
  ngOnInit(): void {
   // Observable.interval(200).take(1).subscribe(() => this.setHeight());
  }

  //private setHeight(): void {
  //  let screen = $('.home main');
  //  screen.hide();

  //  let windowHeight = $(window).innerHeight();
  //  $('body').find('.landing-screen').css('min-height', windowHeight, '!important');
  //  $('body').find('.landing-screen').css({
  //    'background': 'url(app/assets/images/Picture1.png) no-repeat top left',
  //    'background-size': 'cover',
  //    'background-color': 'transparent'
  //  }).show(300);
  //}

  private onForgotPasswordClick(): void {
    //alert('i ma here!!!');
    $('.login-form').fadeOut();
    $('#resetPwd').fadeIn();
    //$('.deloitte_textterm').hide();
  }


  //function - login
  login(): void {
    if (this.email && this.password) {
      this.showSpinner = true;
      this.loginButtonText = 'Logging...';
    }

    this.email = 'balisingh';

    this.authService.loginUser(this.email, this.password)
      .subscribe(
        (responseData: User) => { this.onLoginComplete(responseData) },
        (error: any) => {
          this.errorMessage = <any>error;
          this.showSpinner = false;
          this.loginButtonText = 'Login';
        }
      );
  }

  //function - register
  register(): void {
    let newUser = {
      'userName': encodeURI("new user name"),
      'password': encodeURI("new password")
    };

    this.authService.registerUser(newUser)
      .subscribe(
      (responseData: any[]) => {
        this.onRegisterComplete(responseData)
      },
      (error: any) => {
        this.errorMessage = <any>error;
      }
      );
  }

  private onLoginComplete(iData: User): void {
    this.authService.currentUser = new User();
    this.authService.currentUser.access_token = iData.access_token

    this.getUserDetails();
  }

  private onRegisterComplete(responseData: any): void {
    var hh = responseData;
  }

  //function - register
  private getUserDetails(): void {
    let input = {};

    this.entityService.getUserDetails(input)
      .subscribe(
      (responseData: any[]) => { this.onGetUserDetailsComplete(responseData) },
      (error: any) => { this.errorMessage = <any>error; }
      );
  }

  private onGetUserDetailsComplete(responseData: any): void {
    //set the firstName and re-route to Dashboard
    if (responseData.entity) {
      $('#divLogin').fadeOut('slow');

      let firstName = this.helper.getAnswer(responseData.entity, Constants.QUESTION_CODE_FIRST_NAME);

      this.authService.currentUser.firstName = firstName;
      this.appSettings.notifyLoggedIn(null);
    }
  }
}
