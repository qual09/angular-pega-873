import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '../../../node_modules/@angular/forms';
import { RefreshWorkListService } from '../_messages/refreshworklist.service';
import { WorklistComponent } from '../worklist/worklist.component';
import { GetLoginStatusService } from "../_messages/getloginstatus.service";
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-worklistpanel',
  templateUrl: './worklistpanel.component.html',
  styleUrls: ['./worklistpanel.component.scss']
})
export class WorklistpanelComponent implements OnInit {

  arWorkbaskets$: Array<any> = [];
  workbaskets = new FormControl('Worklist');
  filterValue: string;
  subscription: Subscription;
  constructor(private rwlservice: RefreshWorkListService,
  private glsservice: GetLoginStatusService) { 

  }
  @ViewChild(WorklistComponent) worklistComp: WorklistComponent;
  ngOnInit() {
    if (sessionStorage.getItem("pega_ng_user")) {
      this.getWorkbaskets();
    }
  }

  getWorkbaskets() {
    this.subscription = this.glsservice.getMessage().subscribe(
      message => {
        if (message.loginStatus === 'LoggedIn') {
          let sWorkbaskets = sessionStorage.getItem("userWorkBaskets");
          this.arWorkbaskets$ = sWorkbaskets != undefined ? JSON.parse(sWorkbaskets) : [];
        }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  compareDropdown(value1: any, value2: any): boolean {
    const val1 = determineValues(value1);
    const val2 = determineValues(value2);

    return val1 === val2;
  }

  dropDownChanged(e) {

    this.rwlservice.sendMessage(e.value);
    
  }

  onFilterChange(event) {
    if (this.worklistComp) {
      this.worklistComp.filterWorklistbyCaseId(event);
    }
  }

}

export function determineValues(val: any): string {
  if (val.constructor.name === 'array' && val.length > 0) {
     return '' + val[0];
  }
  return '' + val;
}
