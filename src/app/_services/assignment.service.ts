import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse} from '@angular/common/http';
import { endpoints } from './endpoints';
import { ReferenceHelper } from '../_helpers/reference-helper';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {

  refHelper: ReferenceHelper = new ReferenceHelper();
  assignmentUrl = endpoints.BASEURL + endpoints.ASSIGNMENTS;
  assignmentUrl2 = endpoints.BASEV2URL + endpoints.ASSIGNMENTS;

  constructor(private http: HttpClient) { }

  getAssignment(id) {
    return this.http.get(this.assignmentUrl + "/" + id, { observe: 'response'});
  }

  getFieldsForAssignment(id, action): Observable<HttpResponse<any>> {
    return this.http.get(
      this.assignmentUrl + "/" + id + endpoints.ACTIONS + "/" + action,
      { observe: "response" }
    );
  }

  getFieldsForAssignmentFlatList(id, action): Observable<HttpResponse<any>> {
    let assignmentParams = new HttpParams();
    assignmentParams = assignmentParams.append("flatListOfFields", endpoints.FLATLISTTYPE);

    return this.http.get(
      this.assignmentUrl + "/" + id + endpoints.ACTIONS + "/" + action,
      { observe: "response", params: assignmentParams }
    );
  }

  performRefreshOnAssignment(id, action, refreshFor, body, pageInstr, updatedFields) {
    let assignmentParams = new HttpParams();
    if (refreshFor && refreshFor != "") {
      assignmentParams = assignmentParams.append('refreshFor', refreshFor);
    }
    
    const encodedId = encodeURI(id);
    const oContent = this.refHelper.getPostContent(body, updatedFields);

    if (pageInstr.pageInstructions.length > 0) {
      return this.http.put(
        `${this.assignmentUrl}/${encodedId}${endpoints.ACTIONS}/${action}${endpoints.REFRESH}`,
        { content: oContent, pageInstructions: pageInstr.pageInstructions },
        { observe: "response", params: assignmentParams }
      );
    } else {
      return this.http.put(
        `${this.assignmentUrl}/${encodedId}${endpoints.ACTIONS}/${action}${endpoints.REFRESH}`,
        { content: oContent },
        { observe: "response", params: assignmentParams }
      );
    }  
  }

  performActionOnAssignment(id, action, body, pageInstr, updatedFields, postableFields) {
    let assignmentParams = new HttpParams();
    assignmentParams = assignmentParams.append('actionID', action);
    
    const encodedId = encodeURI(id);
    const oContent = this.refHelper.getPostContent(body, updatedFields, postableFields);

    if (pageInstr.pageInstructions.length > 0) {
      return this.http.post(
        this.assignmentUrl + "/" + encodedId,
        { content: oContent, pageInstructions: pageInstr.pageInstructions },
        { observe: "response", params: assignmentParams }
      );
    } else {
      return this.http.post(
        this.assignmentUrl + "/" + encodedId,
        { content: oContent },
        { observe: "response", params: assignmentParams }
      );
    }
  }

  // 8.4 and greater
  saveAssignment(id, action, body, pageInstr, updatedFields, postableFields) {
    let assignmentParams = new HttpParams();
    assignmentParams = assignmentParams.append('actionID', action);
    assignmentParams = assignmentParams.append('saveOnly', 'true');
    
    const encodedId = encodeURI(id);
    const oContent = this.refHelper.getPostContent(body, updatedFields, postableFields);

    if (pageInstr.pageInstructions.length > 0) {
      return this.http.post(
        this.assignmentUrl + "/" + encodedId,
        { content: oContent, pageInstructions: pageInstr.pageInstructions },
        { observe: "response", params: assignmentParams }
      );
    } else {
      return this.http.post(
        this.assignmentUrl + "/" + encodedId,
        { content: oContent },
        { observe: "response", params: assignmentParams }
      );
    }
  }

  assignments() {
    return this.http.get(this.assignmentUrl, { observe: 'response' });
  }

  navigationSteps(assignmentID, step, etag){
    let assignmentParams = new HttpParams();
    assignmentParams.set('viewType', 'none');

    let assignmentHeaders = new HttpHeaders();
    assignmentHeaders = assignmentHeaders.append('if-match', '"' + etag + '"');
    
    const encodedId = encodeURI(assignmentID);
    const oContent = this.refHelper.getPostContent({});

    return this.http.patch(
      `${this.assignmentUrl2}/${encodedId}${endpoints.NAVIGATION_STEPS}/${step}`,
      { content: oContent },
      {
        observe: "response",
        params: new HttpParams().set("viewType", "none"),
        headers: assignmentHeaders,
      }
    );
  }

  stepPrevious(caseID, assignmentID, etag){
    return this.navigationSteps(assignmentID, "previous", etag);
  }
}
