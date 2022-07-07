import { Component, OnInit, Input, OnChanges, SimpleChanges, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { AuthService } from "../_services/auth.service";
import { GetLoginStatusService } from "../_messages/getloginstatus.service";
import { DatapageService } from "../_services/datapage.service";
import { ProgressSpinnerService } from "../_messages/progressspinner.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, Observable, interval } from 'rxjs';
import { endpoints } from '../_services/endpoints';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @Input() isMashup$: boolean;

  loginData: any = {};
  clientID$: string;


  // default
  loginType$: string;

  oAuthResponseSubscription: Subscription;
  

  constructor(private authservice: AuthService, 
              private glsservice: GetLoginStatusService,
              private dpservice: DatapageService,
              private snackBar: MatSnackBar,
              private psservice: ProgressSpinnerService,
             ) {


    this.clientID$ = endpoints.OAUTHCFG.client_id;
    this.loginType$ = endpoints.use_OAuth ? 'OAUTH' : 'BASIC';

  }

  userNameControl = new FormControl('', null);
  passwordControl = new FormControl('', null);
  clientIDControl = new FormControl('', null);




  ngOnInit() {


    this.initLogin();
    
  }

  initLogin() {
    this.clientID$ = sessionStorage.getItem("clientID");
    if (this.clientID$) {
      this.clientIDControl.setValue(this.clientID$);
    }

    this.userNameControl.setValue('');
    this.passwordControl.setValue('');
  }


  hasToken() {
    return this.authservice.verifyHasTokenOauth();
  }


  doLogin() {
    // delay, so on change for password value can get in

    let timer = interval(100).subscribe(() => {
      this.attemptLogin();
      timer.unsubscribe();
      });

  }

  attemptLogin() {

    if (this.loginType$ === "BASIC") {
      this.psservice.sendMessage(true);

      this.authservice.login(this.loginData.userName, this.loginData.password).subscribe(
        response => {
          if (response.status == 200) {
            let operatorParams = new HttpParams()
  
            this.dpservice.getDataPage("D_OperatorID", operatorParams).subscribe(
              response => {
  
                
  
                let operator: any = response.body;
                sessionStorage.setItem("userName", operator.pyUserName);
                sessionStorage.setItem("userWorkBaskets", JSON.stringify(operator.pyWorkBasketList));
                

                this.psservice.sendMessage(false);
                this.glsservice.sendMessage("LoggedIn");
                

                
              },
              err => {
                this.psservice.sendMessage(false);
  
                let sError = "Errors getting data page: " + err.message;
                let snackBarRef = this.snackBar.open(sError, "Ok");
              }
            );
  
  
  
            
          }
        },
        err => {
  
          let snackBarRef = this.snackBar.open(err.message, "Ok");
          this.glsservice.sendMessage("LoggedOut");
          sessionStorage.clear();
        }
      );

    }
    else if (this.loginType$ === "OAUTH") {

    
        this.clientID$ = endpoints.client_id;
        this.authservice.loginOauth(this.clientID$);

    }

    
  }

  fieldChanged(e) {
    this.loginData[e.target.id] = e.target.value;

  }


}
