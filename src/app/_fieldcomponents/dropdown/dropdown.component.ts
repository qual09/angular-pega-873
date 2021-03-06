import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormControl, Validators} from '@angular/forms';
import { GetChangesService } from '../../_messages/getchanges.service';
import { interval } from "rxjs/internal/observable/interval";
import { HandleActions } from "../../_actions/handleactions";
import { GetActionsService } from '../../_messages/getactions.service';
import { DatapageService } from '../../_services/datapage.service';
import { ReferenceHelper } from "../../_helpers/reference-helper";
import { GetCaseService } from "../../_messages/getcase.service";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {
  @Input() fieldComp: any;
  @Input() formGroup: FormGroup;
  @Input() noLabel: boolean;
  @Input() CaseID: string;
  @Input() RefType$: string;

  fieldControl = new FormControl('', null);
  options: Array<Object>;

  getCaseMessage: any;
  getCaseSubscription: Subscription;

  reference: string;
  valueReadonly$: string;
  showLabel$: boolean = false;
  tooltip$: string;
  placeholder$: string;
  bPlaceholderExists$: boolean = false;
  
  actionsHandler: HandleActions;

  constructor(private gchservice: GetChangesService,
              private gaservice: GetActionsService,
              private dpservice: DatapageService,
              private refHelper: ReferenceHelper,
              private gcservice: GetCaseService) { 

    this.actionsHandler = new HandleActions(gaservice);

  }

  ngOnInit() {
    this.fieldControl = new FormControl( [ this.fieldComp.value ]);
    this.fieldComp.label = this.refHelper.htmlDecode(this.fieldComp.label);
    this.tooltip$ = "";
    if (this.fieldComp.control.modes.length > 0) {
      this.tooltip$ = this.refHelper.htmlDecode(this.fieldComp.control.modes[0].tooltip);
      this.bPlaceholderExists$ = this.fieldComp.control.modes[0].placeholder !== undefined;
      if(this.bPlaceholderExists$){
        this.placeholder$ = this.refHelper.htmlDecode(this.fieldComp.control.modes[0].placeholder);
        this.placeholder$ = this.placeholder$.replace (/(^")|("$)/g, '');
      }
    }

    this.reference = this.fieldComp.reference;

    // create controlName so can be referenced from elsewhere
    this.fieldComp.controlName = this.refHelper.getUniqueControlID();

    if (this.noLabel) {
      this.fieldComp.label = "";
      this.showLabel$ = false;
    }
    else {
      if (this.fieldComp.label != "") {
        this.showLabel$ = true;
      }
      else if (this.fieldComp.label == "" && this.fieldComp.labelReserveSpace) {
        this.showLabel$ = true;
      }
    }

    // switches to show to turn off/off getting data from options vs data/clipboard page
    let bUseLocalOptionsForDataPage = localStorage.getItem("useLocalOptionsForDataPage") == "true" ? true : false;
    let bUseLocalOptionsForClipboardPage = localStorage.getItem("useLocalOptionsForClipboardPage") == "true" ? true : false;



    // below is examples of how to get data for dropdown
    // with 8.3, data local/datapage/clipboard page is now available in options, prior have to
    // retreive from data/clipboard page.  Here are examples of how to data from different sources
    // Even though data may be in options, you may choose to get from clipboard/datapage and filter, etc.
    if (this.fieldComp.control.modes[0].listSource === "datapage") {

      // in addition to switches, loadMode will tell you if you have options or have to get it manually
      let bHaveLocalOption = false;
      if (this.fieldComp.control.modes[0].loadMode != null) {
        bHaveLocalOption = this.fieldComp.control.modes[0].loadMode.toLowerCase() == "auto" ? true: false;
      }
     
      if (bUseLocalOptionsForDataPage && bHaveLocalOption) {
         // use data from options
        this.options = this.fieldComp.control.modes[0].options;

        this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);
      }
      else {
        // go get data from data page
        // handle data page
        let dataPageName = this.fieldComp.control.modes[0].dataPageID || this.fieldComp.control.modes[0].dataPage;

        // check to see if we have any parameters
        let pPage = null;
        let dpParams = this.fieldComp.control.modes[0].dataPageParams;


        if (dpParams.length > 0) {

          pPage = new Object();

          for (let i in dpParams) {
            let sVal : string;
            if (dpParams[i].value != null) {
              sVal = dpParams[i].value;
            }
            else {
              sVal = dpParams[i].valueReference.lastSavedValue;
            }

            pPage[dpParams[i].name] = sVal;
          }
        }



        this.dpservice.getDataPage(dataPageName, pPage).subscribe(
          response => {
            try {
              let results: any = response.body["pxResults"];
              let entryValue = this.fieldComp.control.modes[0].dataPagePrompt;
              let entryKey = this.fieldComp.control.modes[0].dataPageValue;

              this.options = new Array();
              for (let result of results) {
                let option = new Object;
                option["key"] = result[entryKey];
                option["value"] = result[entryValue];
                this.options.push(option);
              }
              
              this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);

            }
            catch (ex) {

            }
          },
          err => {

          }
        );
      }


      
    }
    else if (this.fieldComp.control.modes[0].listSource === "pageList") {
      // in addition to switches, loadMode will tell you if you have options or have to get it manually
      let bHaveLocalOption = false;
      if (this.fieldComp.control.modes[0].loadMode != null) {
        bHaveLocalOption = this.fieldComp.control.modes[0].loadMode.toLowerCase() == "auto" ? true: false;
      }

      if (bUseLocalOptionsForClipboardPage && bHaveLocalOption) {

        // use clipboard enclosed in options
        this.options = this.fieldComp.control.modes[0].options;

        this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);
      }
      else {
        // go get data from clipboard page
        let clipboardPageName = this.fieldComp.control.modes[0].clipboardPageID;
        let entryValue = this.fieldComp.control.modes[0].clipboardPagePrompt;
        let entryKey = this.fieldComp.control.modes[0].clipboardPageValue;
        let entryTooltip = this.fieldComp.control.modes[0].clipboardPageTooltip;
  
        this.getCaseSubscription = this.gcservice.getMessage().subscribe(message => { 
          this.getCaseMessage = message;
          
          if (message) {
            let workPage = message.case.content;
  
            if (workPage) {
              let cPage = workPage[clipboardPageName];
              if (cPage) {
  
                this.options = new Array();
                for (let result of cPage) {
                  let option = new Object;
                  option["key"] = result[entryKey];
                  option["value"] = result[entryValue];
                  this.options.push(option);
                }
  
                this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);
              }
            }
          }
  
  
        });




      }

      


      
    }
    else if (this.fieldComp.control.modes[0].listSource === "locallist") {
      this.options = this.fieldComp.control.modes[0].options;

      this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);
    }


    if (this.fieldComp.required) {
      this.fieldControl.setValidators([Validators.required]);
    }

    if (this.fieldComp.disabled) {
      this.fieldControl.disable();
    }

    this.formGroup.addControl(this.fieldComp.controlName, this.fieldControl);
    this.fieldControl.setValue(this.fieldComp.value);

    if (this.fieldComp.validationMessages != "") {
      let timer = interval(100).subscribe(() => {
        this.fieldControl.setErrors({'message': true});
        this.fieldControl.markAsTouched();

        timer.unsubscribe();
        });
    
    }
   

  }

  ngOnDestroy() {
    this.formGroup.removeControl(this.fieldComp.controlName);

    this.actionsHandler = null;
    delete this.actionsHandler;

    if (this.getCaseSubscription) {
      this.getCaseSubscription.unsubscribe();
    }
  }

  getOptionValue(value: string): string {
      for (let obj of this.options) {
        if (obj["key"] === value) {
          return this.refHelper.htmlDecode(obj["value"]);
        }
      }

      return "";
  }

  compareDropdown(value1: any, value2: any): boolean {
    const val1 = determineValues(value1);
    const val2 = determineValues(value2);

    return val1 === val2;
  }

  fieldChanged(e) {
    this.fieldComp.value = e.value;
    this.gchservice.sendMessage(this.fieldComp.reference, e.value, this.CaseID, this.RefType$);

    let eventName = "";
    // Setting event name from actionSets(if exists) since it will be matched inside generateActions()
    if(this.fieldComp.control.actionSets[0]?.events){
      eventName = this.fieldComp.control.actionSets[0].events[0].event;
    }
    this.actionsHandler.generateActions(eventName, this.fieldComp.control.actionSets, this.CaseID, this.fieldComp.reference);
  }

  getErrorMessage() {
    let errMessage : string = "";


    // look for validation messages for json, pre-defined or just an error pushed from workitem (400)
    if (this.fieldControl.hasError('message')) {
      errMessage = this.fieldComp.validationMessages;
    }
    else if (this.fieldControl.hasError('required')) {
      errMessage = 'You must select a value';
    }
    else if (this.fieldControl.errors) {
      errMessage = this.fieldControl.errors.toString();

    }
 

    return errMessage;
  }

}


export function determineValues(val: any): string {
  if (val.constructor.name === 'array' && val.length > 0) {
     return '' + val[0];
  }
  return '' + val;
}
